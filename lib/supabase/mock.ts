import { mockSessions, mockTasks, mockVibes, mockUsers } from '@/lib/mock-data'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock user state
let currentUser: any = null
let isAuthenticated = false

// Mock real-time subscriptions
const subscriptions = new Map()
const channels = new Map()

export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      await delay(1000) // Simulate network delay

      const user = mockUsers.find(u => u.email === email)
      if (user && password.length >= 6) {
        currentUser = user
        isAuthenticated = true
        return { data: { user, session: { user } }, error: null }
      }

      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      await delay(1200)

      if (password.length < 6) {
        return {
          data: { user: null, session: null },
          error: { message: 'Password must be at least 6 characters' }
        }
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        created_at: new Date().toISOString()
      }

      mockUsers.push(newUser)
      currentUser = newUser
      isAuthenticated = true

      return { data: { user: newUser, session: { user: newUser } }, error: null }
    },

    signInWithOAuth: async ({ provider }: { provider: string }) => {
      await delay(800)

      const oauthUser = {
        id: `oauth-${Date.now()}`,
        email: `user@${provider}.com`,
        created_at: new Date().toISOString()
      }

      currentUser = oauthUser
      isAuthenticated = true

      return {
        data: { url: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback` },
        error: null
      }
    },

    signOut: async () => {
      await delay(500)
      currentUser = null
      isAuthenticated = false
      return { error: null }
    },

    getUser: async () => {
      await delay(200)
      return {
        data: { user: isAuthenticated ? currentUser : null },
        error: null
      }
    },

    getSession: async () => {
      await delay(200)
      // Simulate a logged-in user for server components
      currentUser = mockUsers[0];
      isAuthenticated = true;
      return {
        data: {
          session: isAuthenticated ? { user: currentUser } : null
        },
        error: null
      }
    }
  },

  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          await delay(300)

          let data = null
          if (table === 'sessions') {
            data = mockSessions.find((s: any) => s[column] === value)
          } else if (table === 'tasks') {
            data = mockTasks.find((t: any) => t[column] === value)
          } else if (table === 'vibes') {
            data = mockVibes.find((v: any) => v[column] === value)
          }

          return { data, error: data ? null : { code: 'PGRST116' } }
        },

        order: (column: string, options?: any) => ({
          then: async (callback: any) => {
            await delay(300)

            let data: any[] = []
            if (table === 'sessions') {
              data = mockSessions.filter((s: any) => s[column] === value)
            } else if (table === 'tasks') {
              data = mockTasks.filter((t: any) => t.session_id === value)
                .sort((a: any, b: any) => a.order_index - b.order_index)
            } else if (table === 'vibes') {
              data = mockVibes.filter((v: any) => v[column] === value)
            }

            if (callback) {
              callback({ data, error: null })
              return { data, error: null }
            }
            return { data, error: null }
          }
        })
      }),

      then: async (callback: any) => {
        await delay(300)

        let data: any[] = []
        if (table === 'sessions') data = mockSessions
        else if (table === 'tasks') data = mockTasks
        else if (table === 'vibes') data = mockVibes

        if (callback) callback({ data, error: null })
        return { data, error: null }
      }
    }),

    insert: (values: any) => ({
      select: () => ({
        single: async () => {
          await delay(400)

          const newItem = {
            ...values,
            id: `${table}-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (table === 'sessions') {
            mockSessions.push(newItem)
          } else if (table === 'tasks') {
            mockTasks.push(newItem)
          } else if (table === 'vibes') {
            mockVibes.push(newItem)
          }

          // Simulate real-time broadcast
          setTimeout(() => {
            channels.forEach((channel, channelName) => {
              if (channelName.includes(values.session_id)) {
                channel.callbacks.forEach((callback: any) => {
                  if (callback.event === '*' || callback.event === 'INSERT') {
                    callback.handler({
                      eventType: 'INSERT',
                      new: newItem,
                      table
                    })
                  }
                })
              }
            })
          }, 100)

          return { data: newItem, error: null }
        }
      })
    }),

    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          await delay(300)

          let updated = false
          const updatedItem = { ...values, updated_at: new Date().toISOString() }

          if (table === 'sessions') {
            const index = mockSessions.findIndex((s: any) => s[column] === value)
            if (index !== -1) {
              mockSessions[index] = { ...mockSessions[index], ...updatedItem }
              updated = true
            }
          } else if (table === 'tasks') {
            const index = mockTasks.findIndex((t: any) => t[column] === value)
            if (index !== -1) {
              mockTasks[index] = { ...mockTasks[index], ...updatedItem }
              updated = true
            }
          }

          // Simulate real-time broadcast
          if (updated) {
            setTimeout(() => {
              channels.forEach((channel, channelName) => {
                channel.callbacks.forEach((callback: any) => {
                  if (callback.event === '*' || callback.event === 'UPDATE') {
                    callback.handler({
                      eventType: 'UPDATE',
                      new: table === 'sessions'
                        ? mockSessions.find((s: any) => s[column] === value)
                        : mockTasks.find((t: any) => t[column] === value),
                      table
                    })
                  }
                })
              })
            }, 100)
          }

          if (callback) callback({ data: null, error: updated ? null : { message: 'Not found' } })
          return { data: null, error: updated ? null : { message: 'Not found' } }
        }
      })
    }),

    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          await delay(300)

          let deleted = false
          let deletedItem = null

          if (table === 'tasks') {
            const index = mockTasks.findIndex((t: any) => t[column] === value)
            if (index !== -1) {
              deletedItem = mockTasks[index]
              mockTasks.splice(index, 1)
              deleted = true
            }
          }

          // Simulate real-time broadcast
          if (deleted) {
            setTimeout(() => {
              channels.forEach((channel, channelName) => {
                channel.callbacks.forEach((callback: any) => {
                  if (callback.event === '*' || callback.event === 'DELETE') {
                    callback.handler({
                      eventType: 'DELETE',
                      old: deletedItem,
                      table
                    })
                  }
                })
              })
            }, 100)
          }

          if (callback) callback({ data: null, error: deleted ? null : { message: 'Not found' } })
          return { data: null, error: deleted ? null : { message: 'Not found' } }
        }
      })
    })
  }),

  channel: (channelName: string) => {
    const channel = {
      callbacks: [] as any[],
      presenceState: new Map(),

      on: (type: string, config: any, handler: any) => {
        if (type === 'postgres_changes') {
          channel.callbacks.push({
            event: config.event,
            table: config.table,
            handler
          })
        } else if (type === 'presence') {
          // Handle presence events
          channel.callbacks.push({
            event: config.event,
            handler
          })
        }
        return channel
      },

      subscribe: (callback?: any) => {
        channels.set(channelName, channel)

        // Simulate connection
        setTimeout(() => {
          if (callback) callback('SUBSCRIBED')
        }, 100)

        return channel
      },

      track: async (presence: any) => {
        channel.presenceState.set(currentUser?.id || 'anonymous', {
          ...presence,
          online_at: new Date().toISOString()
        })

        // Simulate presence sync
        setTimeout(() => {
          channels.forEach(callback => {
            if (callback.event === 'sync') {
              callback.handler()
            }
          })
        }, 200)

        return { error: null }
      },

      untrack: async () => {
        channel.presenceState.delete(currentUser?.id || 'anonymous')
        return { error: null }
      }
    }

    return channel
  },

  getChannels: () => Array.from(channels.values()),

  removeChannel: async (channel: any) => {
    await delay(50);
    for (const [key, value] of channels.entries()) {
      if (value === channel) {
        channels.delete(key);
        break;
      }
    }
    return 'ok';
  },
}
