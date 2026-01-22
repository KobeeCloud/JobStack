// Mock Supabase client for development without backend
// Returns fake data structures to allow UI testing

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'dev@example.com'
          }
        },
        error: null
      }),
      signInWithPassword: async () => ({
        data: {
          user: { id: 'mock-user-id', email: 'dev@example.com' }
        },
        error: null
      }),
      signUp: async () => ({
        data: {
          user: { id: 'mock-user-id', email: 'dev@example.com' }
        },
        error: null
      }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          data: table === 'projects' ? [
            {
              id: '1',
              name: 'Demo Project',
              description: 'Sample infrastructure',
              user_id: 'mock-user-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ] : [],
          error: null,
          single: async () => ({
            data: { id: '1', name: 'Demo Project' },
            error: null
          })
        }),
        data: [],
        error: null,
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: Math.random().toString(),
              name: 'New Project'
            },
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({
              data: { id: '1', updated: true },
              error: null
            })
          })
        })
      }),
      delete: () => ({
        eq: () => ({ error: null })
      }),
    }),
  };
}
