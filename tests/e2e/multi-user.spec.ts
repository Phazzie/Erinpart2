import { test, expect } from '@playwright/test'

test.describe('Multi-User Session Joining', () => {
  test('two users can join the same session via animal codes', async ({ browser }) => {
    // Create two browser contexts (simulating two users)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // User 1: Create session with animal codes
    await page1.goto('/')
    
    // Select animals for User 1
    await page1.selectOption('#animal1', 'Dragon')
    await page1.selectOption('#animal2', 'Phoenix')
    
    // Enter name
    await page1.fill('#firstName', 'Alice')
    
    // Join session
    await page1.click('button:has-text("Join Session")')
    
    // Wait for session board to load - wait for task input instead
    await page1.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    // Get the session URL
    const sessionUrl = page1.url()
    expect(sessionUrl).toContain('session=dragon-phoenix')

    // User 2: Join the same session
    await page2.goto('/')
    
    // Select same animals
    await page2.selectOption('#animal1', 'Dragon')
    await page2.selectOption('#animal2', 'Phoenix')
    
    // Enter different name
    await page2.fill('#firstName', 'Bob')
    
    // Join session
    await page2.click('button:has-text("Join Session")')
    
    // Wait for session board
    await page2.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // User 1 creates a task
    await page1.fill('textarea[placeholder*="Add a new chaotic task"]', 'Buy groceries')
    await page1.click('button:has-text("Add Task")')
    
    // Wait for task to appear on User 1's page
    await page1.waitForSelector('text=Buy groceries', { timeout: 5000 })
    
    // Verify task appears on User 2's page (realtime sync)
    await expect(page2.getByText('Buy groceries')).toBeVisible({ timeout: 10000 })

    // Cleanup
    await context1.close()
    await context2.close()
  })

  test('users can join via direct URL sharing', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // User 1: Create session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Cat')
    await page1.selectOption('#animal2', 'Dog')
    await page1.fill('#firstName', 'Charlie')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    // Get session URL
    const sessionUrl = page1.url()

    // User 2: Join via direct URL
    await page2.goto(sessionUrl)
    
    // Should see session board directly (no login needed if localStorage magic works)
    // OR may need to enter name - let's handle both cases
    const hasLoginForm = await page2.locator('#firstName').isVisible().catch(() => false)
    
    if (hasLoginForm) {
      await page2.fill('#firstName', 'Dana')
      await page2.click('button:has-text("Join Session")')
    }
    
    await page2.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Verify both users are in the same session
    expect(page1.url()).toBe(page2.url())

    await context1.close()
    await context2.close()
  })

  test('users can join via QR code URL', async ({ browser }) => {
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()

    // User 1: Create session and open share modal
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Unicorn')
    await page1.selectOption('#animal2', 'Narwhal')
    await page1.fill('#firstName', 'Eve')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    // Click share button using aria-label
    await page1.click('button[aria-label="Share session"]')
    
    // Wait for modal
    await page1.waitForSelector('text=QR Code', { timeout: 5000 })
    
    // Switch to Link tab
    await page1.click('button:has-text("Link")')
    
    // Get the share URL from the input
    const shareUrlInput = page1.locator('input[readonly]')
    const shareUrl = await shareUrlInput.inputValue()
    
    expect(shareUrl).toContain('session=unicorn-narwhal')

    // Simulate User 2 joining via that URL
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    
    await page2.goto(shareUrl)
    
    // May need to enter name
    const hasLoginForm = await page2.locator('#firstName').isVisible().catch(() => false)
    if (hasLoginForm) {
      await page2.fill('#firstName', 'Frank')
      await page2.click('button:has-text("Join Session")')
    }
    
    await page2.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Verify same session
    expect(page2.url()).toContain('session=unicorn-narwhal')

    await context1.close()
    await context2.close()
  })

  test('Quick Join creates random session', async ({ page }) => {
    await page.goto('/')
    
    // Click Quick Join button - need to fill name first for button to be enabled
    await page.fill('#firstName', 'QuickUser')
    await page.click('button:has-text("Pick Random Animals")')
    
    // Now join the session with the random animals
    await page.click('button:has-text("Join Session")')
    
    // Should automatically join with random animals and see the session board
    await page.waitForSelector('textarea[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    // Verify URL has session parameter
    const url = page.url()
    expect(url).toContain('session=')
  })
})
