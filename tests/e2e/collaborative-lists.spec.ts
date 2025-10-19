import { test, expect } from '@playwright/test'

test.describe('Collaborative Lists - Multi-User', () => {
  test('users can create and view collaborative lists in realtime', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // User 1: Create session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Lion')
    await page1.selectOption('#animal2', 'Tiger')
    await page1.fill('#firstName', 'Alice')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    const sessionUrl = page1.url()

    // User 2: Join same session
    await page2.goto(sessionUrl)
    const hasLoginForm = await page2.locator('#firstName').isVisible().catch(() => false)
    if (hasLoginForm) {
      await page2.fill('#firstName', 'Bob')
      await page2.click('button:has-text("Join Session")')
    }
    await page2.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Switch both users to Collaborative Lists tab
    await page1.click('button:has-text("Collaborative Lists")')
    await page2.click('button:has-text("Collaborative Lists")')

    // User 1: Create a list
    await page1.fill('input[id="list-title"]', 'Grocery Shopping')
    await page1.click('button:has-text("Create List")')
    
    // Verify list appears on User 1's page
    await expect(page1.getByText('Grocery Shopping')).toBeVisible({ timeout: 5000 })

    // Verify list appears on User 2's page via realtime
    await expect(page2.getByText('Grocery Shopping')).toBeVisible({ timeout: 10000 })

    await context1.close()
    await context2.close()
  })

  test('creator can add items to a list and non-creators can verify them', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Setup: Both users join same session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Bear')
    await page1.selectOption('#animal2', 'Wolf')
    await page1.fill('#firstName', 'Creator')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    const sessionUrl = page1.url()
    await page2.goto(sessionUrl)
    const hasLoginForm = await page2.locator('#firstName').isVisible().catch(() => false)
    if (hasLoginForm) {
      await page2.fill('#firstName', 'Verifier')
      await page2.click('button:has-text("Join Session")')
    }
    await page2.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Switch to Collaborative Lists
    await page1.click('button:has-text("Collaborative Lists")')
    await page2.click('button:has-text("Collaborative Lists")')

    // User 1: Create a list
    await page1.fill('input[id="list-title"]', 'Project Steps')
    await page1.click('button:has-text("Create List")')
    await page1.waitForSelector('text=Project Steps', { timeout: 5000 })

    // User 1: Expand the list (if collapsed)
    const expandButton = page1.locator('button:has-text("Project Steps")').first()
    if (await expandButton.isVisible()) {
      await expandButton.click()
    }

    // User 1: Add an item
    const addItemInput = page1.locator('input[placeholder*="Add item"]').first()
    await addItemInput.fill('Complete design mockups')
    await addItemInput.press('Enter')

    // Verify item appears on User 1's page
    await expect(page1.getByText('Complete design mockups')).toBeVisible({ timeout: 5000 })

    // Verify item appears on User 2's page
    await expect(page2.getByText('Complete design mockups')).toBeVisible({ timeout: 10000 })

    // User 2: Verify the item as accurate
    const accurateButton = page2.locator('button:has-text("Accurate")').first()
    await accurateButton.click()

    // Verify consensus meter appears
    await expect(page2.getByText(/1 ✓/)).toBeVisible({ timeout: 5000 })

    // User 1 should also see the verification
    await expect(page1.getByText('Verifier')).toBeVisible({ timeout: 10000 })

    await context1.close()
    await context2.close()
  })

  test('users can mark items as inaccurate with corrections', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Setup session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Hawk')
    await page1.selectOption('#animal2', 'Eagle')
    await page1.fill('#firstName', 'User1')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    const sessionUrl = page1.url()
    await page2.goto(sessionUrl)
    const hasLoginForm = await page2.locator('#firstName').isVisible().catch(() => false)
    if (hasLoginForm) {
      await page2.fill('#firstName', 'User2')
      await page2.click('button:has-text("Join Session")')
    }
    await page2.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Switch to lists
    await page1.click('button:has-text("Collaborative Lists")')
    await page2.click('button:has-text("Collaborative Lists")')

    // Create list and add item
    await page1.fill('input[id="list-title"]', 'Shopping List')
    await page1.click('button:has-text("Create List")')
    await page1.waitForSelector('text=Shopping List', { timeout: 5000 })
    
    const expandButton = page1.locator('button:has-text("Shopping List")').first()
    if (await expandButton.isVisible()) {
      await expandButton.click()
    }

    const addItemInput = page1.locator('input[placeholder*="Add item"]').first()
    await addItemInput.fill('Whole milk')
    await addItemInput.press('Enter')

    await expect(page1.getByText('Whole milk')).toBeVisible({ timeout: 5000 })
    await expect(page2.getByText('Whole milk')).toBeVisible({ timeout: 10000 })

    // User 2: Mark as inaccurate
    const inaccurateButton = page2.locator('button:has-text("Inaccurate")').first()
    await inaccurateButton.click()

    // Should show correction input
    const correctionInput = page2.locator('input[placeholder*="Suggest a correction"]').first()
    await expect(correctionInput).toBeVisible({ timeout: 2000 })
    
    await correctionInput.fill('Should be Oat milk')
    await page2.click('button:has-text("Submit Correction")')

    // Verify correction appears
    await expect(page2.getByText('Should be Oat milk')).toBeVisible({ timeout: 5000 })

    // User 1 should see the correction
    await expect(page1.getByText('Should be Oat milk')).toBeVisible({ timeout: 10000 })
    await expect(page1.getByText(/1 ✗/)).toBeVisible({ timeout: 5000 })

    await context1.close()
    await context2.close()
  })

  test('consensus meter updates with multiple verifications', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const context3 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    const page3 = await context3.newPage()

    // Setup: Three users join same session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Panda')
    await page1.selectOption('#animal2', 'Koala')
    await page1.fill('#firstName', 'Creator')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    const sessionUrl = page1.url()

    // User 2 joins
    await page2.goto(sessionUrl)
    if (await page2.locator('#firstName').isVisible().catch(() => false)) {
      await page2.fill('#firstName', 'Verifier1')
      await page2.click('button:has-text("Join Session")')
    }
    await page2.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // User 3 joins
    await page3.goto(sessionUrl)
    if (await page3.locator('#firstName').isVisible().catch(() => false)) {
      await page3.fill('#firstName', 'Verifier2')
      await page3.click('button:has-text("Join Session")')
    }
    await page3.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // All switch to lists
    await page1.click('button:has-text("Collaborative Lists")')
    await page2.click('button:has-text("Collaborative Lists")')
    await page3.click('button:has-text("Collaborative Lists")')

    // Create list with item
    await page1.fill('input[id="list-title"]', 'Test Consensus')
    await page1.click('button:has-text("Create List")')
    await page1.waitForSelector('text=Test Consensus', { timeout: 5000 })
    
    const expandButton = page1.locator('button:has-text("Test Consensus")').first()
    if (await expandButton.isVisible()) {
      await expandButton.click()
    }

    const addItemInput = page1.locator('input[placeholder*="Add item"]').first()
    await addItemInput.fill('Test item for consensus')
    await addItemInput.press('Enter')

    // Wait for item to sync to all pages
    await expect(page1.getByText('Test item for consensus')).toBeVisible({ timeout: 5000 })
    await expect(page2.getByText('Test item for consensus')).toBeVisible({ timeout: 10000 })
    await expect(page3.getByText('Test item for consensus')).toBeVisible({ timeout: 10000 })

    // User 2: Vote accurate
    await page2.locator('button:has-text("Accurate")').first().click()
    
    // Verify consensus shows 100% (1/1)
    await expect(page2.getByText(/100% consensus/i)).toBeVisible({ timeout: 5000 })

    // User 3: Vote inaccurate
    await page3.locator('button:has-text("Inaccurate")').first().click()
    const correctionInput = page3.locator('input[placeholder*="Suggest a correction"]').first()
    await correctionInput.fill('Needs revision')
    await page3.click('button:has-text("Submit Correction")')

    // Verify consensus updates to 50% (1/2)
    await expect(page3.getByText(/50% consensus/i)).toBeVisible({ timeout: 5000 })
    await expect(page1.getByText(/50% consensus/i)).toBeVisible({ timeout: 10000 })

    await context1.close()
    await context2.close()
    await context3.close()
  })

  test('creator can edit and delete list items', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Setup session
    await page1.goto('/')
    await page1.selectOption('#animal1', 'Seal')
    await page1.selectOption('#animal2', 'Dolphin')
    await page1.fill('#firstName', 'Creator')
    await page1.click('button:has-text("Join Session")')
    await page1.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })
    
    const sessionUrl = page1.url()
    await page2.goto(sessionUrl)
    if (await page2.locator('#firstName').isVisible().catch(() => false)) {
      await page2.fill('#firstName', 'Viewer')
      await page2.click('button:has-text("Join Session")')
    }
    await page2.waitForSelector('input[placeholder*="Add a new chaotic task"]', { timeout: 10000 })

    // Switch to lists
    await page1.click('button:has-text("Collaborative Lists")')
    await page2.click('button:has-text("Collaborative Lists")')

    // Create list with item
    await page1.fill('input[id="list-title"]', 'Editable List')
    await page1.click('button:has-text("Create List")')
    await page1.waitForSelector('text=Editable List', { timeout: 5000 })
    
    const expandButton = page1.locator('button:has-text("Editable List")').first()
    if (await expandButton.isVisible()) {
      await expandButton.click()
    }

    const addItemInput = page1.locator('input[placeholder*="Add item"]').first()
    await addItemInput.fill('Original text')
    await addItemInput.press('Enter')

    await expect(page1.getByText('Original text')).toBeVisible({ timeout: 5000 })
    await expect(page2.getByText('Original text')).toBeVisible({ timeout: 10000 })

    // User 1: Edit the item
    await page1.click('button:has-text("Edit")')
    const editInput = page1.locator('input[value="Original text"]')
    await editInput.fill('Updated text')
    await page1.click('button:has-text("Save")')

    // Verify edit appears on both pages
    await expect(page1.getByText('Updated text')).toBeVisible({ timeout: 5000 })
    await expect(page2.getByText('Updated text')).toBeVisible({ timeout: 10000 })

    // User 1: Delete the item
    await page1.click('button:has-text("Delete")')

    // Verify item is removed on both pages
    await expect(page1.getByText('Updated text')).not.toBeVisible({ timeout: 5000 })
    await expect(page2.getByText('Updated text')).not.toBeVisible({ timeout: 10000 })

    await context1.close()
    await context2.close()
  })
})
