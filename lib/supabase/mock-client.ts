// Mock Supabase client for development without backend
// Returns fake data structures to allow UI testing
// Uses in-memory storage for consistent data across operations

// In-memory storage for mock data
const mockStorage: {
  projects: Map<string, any>
  diagrams: Map<string, any>
  templates: any[]
} = {
  projects: new Map(),
  diagrams: new Map(),
  templates: [
    {
      id: 'tpl-startup',
      name: 'Startup Stack',
      description: 'Simple web app with database and CDN',
      diagram_data: {
        nodes: [
          { id: 'web-1', type: 'compute', position: { x: 100, y: 100 }, data: { label: 'Web Server', provider: 'aws', service: 'EC2', specs: { instance: 't3.medium' }, monthlyCost: 30 } },
          { id: 'db-1', type: 'database', position: { x: 300, y: 100 }, data: { label: 'PostgreSQL', provider: 'aws', service: 'RDS', specs: { instance: 'db.t3.micro' }, monthlyCost: 15 } },
          { id: 'cdn-1', type: 'network', position: { x: 100, y: 250 }, data: { label: 'CloudFront CDN', provider: 'aws', service: 'CloudFront', monthlyCost: 10 } },
        ],
        edges: [
          { id: 'e1', source: 'web-1', target: 'db-1' },
          { id: 'e2', source: 'cdn-1', target: 'web-1' },
        ],
      },
      is_public: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'tpl-microservices',
      name: 'Microservices Architecture',
      description: 'Kubernetes cluster with API Gateway and message queue',
      diagram_data: {
        nodes: [
          { id: 'k8s-1', type: 'compute', position: { x: 200, y: 150 }, data: { label: 'Kubernetes Cluster', provider: 'aws', service: 'EKS', specs: { nodes: 3 }, monthlyCost: 150 } },
          { id: 'api-1', type: 'network', position: { x: 200, y: 0 }, data: { label: 'API Gateway', provider: 'aws', service: 'API Gateway', monthlyCost: 25 } },
          { id: 'mq-1', type: 'storage', position: { x: 400, y: 150 }, data: { label: 'Message Queue', provider: 'aws', service: 'SQS', monthlyCost: 5 } },
          { id: 'cache-1', type: 'database', position: { x: 0, y: 150 }, data: { label: 'Redis Cache', provider: 'aws', service: 'ElastiCache', monthlyCost: 20 } },
        ],
        edges: [
          { id: 'e1', source: 'api-1', target: 'k8s-1' },
          { id: 'e2', source: 'k8s-1', target: 'mq-1' },
          { id: 'e3', source: 'k8s-1', target: 'cache-1' },
        ],
      },
      is_public: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'tpl-serverless',
      name: 'Serverless Application',
      description: 'Lambda functions with DynamoDB and S3',
      diagram_data: {
        nodes: [
          { id: 'lambda-1', type: 'compute', position: { x: 150, y: 100 }, data: { label: 'Lambda Functions', provider: 'aws', service: 'Lambda', monthlyCost: 0 } },
          { id: 'dynamo-1', type: 'database', position: { x: 350, y: 100 }, data: { label: 'DynamoDB', provider: 'aws', service: 'DynamoDB', monthlyCost: 5 } },
          { id: 's3-1', type: 'storage', position: { x: 150, y: 250 }, data: { label: 'S3 Bucket', provider: 'aws', service: 'S3', monthlyCost: 3 } },
          { id: 'apigw-1', type: 'network', position: { x: 150, y: -50 }, data: { label: 'API Gateway', provider: 'aws', service: 'API Gateway', monthlyCost: 10 } },
        ],
        edges: [
          { id: 'e1', source: 'apigw-1', target: 'lambda-1' },
          { id: 'e2', source: 'lambda-1', target: 'dynamo-1' },
          { id: 'e3', source: 'lambda-1', target: 's3-1' },
        ],
      },
      is_public: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 'tpl-data-pipeline',
      name: 'Data Analytics Pipeline',
      description: 'ETL pipeline with data warehouse and BI tools',
      diagram_data: {
        nodes: [
          { id: 'kinesis-1', type: 'storage', position: { x: 0, y: 100 }, data: { label: 'Kinesis Stream', provider: 'aws', service: 'Kinesis', monthlyCost: 25 } },
          { id: 'glue-1', type: 'compute', position: { x: 200, y: 100 }, data: { label: 'Glue ETL', provider: 'aws', service: 'Glue', monthlyCost: 50 } },
          { id: 'redshift-1', type: 'database', position: { x: 400, y: 100 }, data: { label: 'Redshift', provider: 'aws', service: 'Redshift', monthlyCost: 180 } },
          { id: 'quicksight-1', type: 'network', position: { x: 400, y: 250 }, data: { label: 'QuickSight', provider: 'aws', service: 'QuickSight', monthlyCost: 24 } },
        ],
        edges: [
          { id: 'e1', source: 'kinesis-1', target: 'glue-1' },
          { id: 'e2', source: 'glue-1', target: 'redshift-1' },
          { id: 'e3', source: 'redshift-1', target: 'quicksight-1' },
        ],
      },
      is_public: true,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    },
  ],
}

// Initialize with a demo project
const demoProjectId = 'demo-project-001'
mockStorage.projects.set(demoProjectId, {
  id: demoProjectId,
  name: 'Demo Infrastructure',
  description: 'Sample cloud infrastructure project for testing',
  user_id: 'mock-user-id',
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
})

mockStorage.diagrams.set('demo-diagram-001', {
  id: 'demo-diagram-001',
  project_id: demoProjectId,
  name: 'Main Architecture',
  data: {
    nodes: [
      { id: 'node-1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Web Server', componentId: 'aws-ec2', provider: 'aws', service: 'EC2', monthlyCost: 25 } },
      { id: 'node-2', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Database', componentId: 'aws-rds', provider: 'aws', service: 'RDS', monthlyCost: 50 } },
      { id: 'node-3', type: 'custom', position: { x: 225, y: 250 }, data: { label: 'S3 Storage', componentId: 'aws-s3', provider: 'aws', service: 'S3', monthlyCost: 5 } },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', animated: true },
      { id: 'edge-2', source: 'node-1', target: 'node-3', animated: true },
    ],
  },
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
})

// Helper to generate unique IDs
function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Query builder helper type
type QueryBuilder = {
  data: any
  error: any
  eq: (column: string, value: any) => QueryBuilder
  neq: (column: string, value: any) => QueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder
  limit: (count: number) => QueryBuilder
  range: (from: number, to: number) => QueryBuilder
  single: () => Promise<{ data: any; error: any }>
  maybeSingle: () => Promise<{ data: any; error: any }>
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'mock-user-id',
            email: 'dev@example.com',
            user_metadata: {
              full_name: 'Developer User',
              avatar_url: null,
            },
          },
        },
        error: null,
      }),
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'dev@example.com',
            },
            access_token: 'mock-access-token',
          },
        },
        error: null,
      }),
      signInWithPassword: async ({ email }: { email: string; password: string }) => ({
        data: {
          user: { id: 'mock-user-id', email },
          session: { access_token: 'mock-token' },
        },
        error: null,
      }),
      signUp: async ({ email }: { email: string; password: string }) => ({
        data: {
          user: { id: 'mock-user-id', email },
          session: { access_token: 'mock-token' },
        },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      updateUser: async (updates: any) => ({
        data: { user: { id: 'mock-user-id', email: 'dev@example.com', ...updates } },
        error: null,
      }),
    },
    from: (table: string) => {
      // Get data for the table
      const getTableData = (): any[] => {
        switch (table) {
          case 'projects':
            return Array.from(mockStorage.projects.values())
          case 'diagrams':
            return Array.from(mockStorage.diagrams.values())
          case 'templates':
            return mockStorage.templates
          default:
            return []
        }
      }

      // Create a query builder with chaining support
      const createQueryBuilder = (initialData: any[], _selectedColumns?: string): QueryBuilder => {
        let filteredData = [...initialData]
        let filters: Array<{ column: string; value: any; op: 'eq' | 'neq' }> = []

        const builder: QueryBuilder = {
          get data() {
            // Apply all filters
            let result = [...filteredData]
            for (const filter of filters) {
              if (filter.op === 'eq') {
                result = result.filter((item) => item[filter.column] === filter.value)
              } else if (filter.op === 'neq') {
                result = result.filter((item) => item[filter.column] !== filter.value)
              }
            }
            return result
          },
          error: null,

          eq(column: string, value: any) {
            filters.push({ column, value, op: 'eq' })
            return builder
          },

          neq(column: string, value: any) {
            filters.push({ column, value, op: 'neq' })
            return builder
          },

          order(column: string, options: { ascending?: boolean } = {}) {
            const asc = options.ascending !== false
            filteredData.sort((a, b) => {
              const valA = a[column]
              const valB = b[column]
              if (valA < valB) return asc ? -1 : 1
              if (valA > valB) return asc ? 1 : -1
              return 0
            })
            return builder
          },

          limit(count: number) {
            filteredData = filteredData.slice(0, count)
            return builder
          },

          range(from: number, to: number) {
            filteredData = filteredData.slice(from, to + 1)
            return builder
          },

          async single() {
            const data = this.data
            if (data.length === 0) {
              return { data: null, error: { message: 'No rows found', code: 'PGRST116' } }
            }
            return { data: data[0], error: null }
          },

          async maybeSingle() {
            const data = this.data
            return { data: data.length > 0 ? data[0] : null, error: null }
          },
        }

        return builder
      }

      return {
        select: (_columns?: string) => {
          return createQueryBuilder(getTableData(), _columns)
        },

        insert: (data: any | any[]) => ({
          select: (_columns?: string) => ({
            single: async () => {
              const newItem = Array.isArray(data) ? data[0] : data
              const id = generateId(table.slice(0, 3) + '-')
              const now = new Date().toISOString()

              const fullItem = {
                ...newItem,
                id,
                created_at: now,
                updated_at: now,
              }

              switch (table) {
                case 'projects':
                  mockStorage.projects.set(id, fullItem)
                  break
                case 'diagrams':
                  mockStorage.diagrams.set(id, fullItem)
                  break
              }

              return { data: fullItem, error: null }
            },
          }),
        }),

        update: (updates: any) => ({
          eq: (column: string, value: any) => ({
            select: (_columns?: string) => ({
              single: async () => {
                const now = new Date().toISOString()

                switch (table) {
                  case 'projects': {
                    // Find by column value, not just map key
                    let foundKey: string | null = null
                    for (const [key, project] of mockStorage.projects.entries()) {
                      if (project[column] === value) {
                        foundKey = key
                        break
                      }
                    }
                    if (foundKey) {
                      const project = mockStorage.projects.get(foundKey)!
                      const updated = { ...project, ...updates, updated_at: now }
                      mockStorage.projects.set(foundKey, updated)
                      return { data: updated, error: null }
                    }
                    break
                  }
                  case 'diagrams': {
                    // Find by column value
                    let foundKey: string | null = null
                    for (const [key, diagram] of mockStorage.diagrams.entries()) {
                      if (diagram[column] === value) {
                        foundKey = key
                        break
                      }
                    }
                    if (foundKey) {
                      const diagram = mockStorage.diagrams.get(foundKey)!
                      const updated = { ...diagram, ...updates, updated_at: now }
                      mockStorage.diagrams.set(foundKey, updated)
                      return { data: updated, error: null }
                    }
                    break
                  }
                }
                return { data: null, error: { message: 'Not found' } }
              },
            }),
            // Support chained .eq() for multiple conditions
            eq: (column2: string, value2: any) => ({
              select: (_columns?: string) => ({
                single: async () => {
                  const now = new Date().toISOString()

                  switch (table) {
                    case 'projects': {
                      for (const [key, project] of mockStorage.projects.entries()) {
                        if (project[column] === value && project[column2] === value2) {
                          const updated = { ...project, ...updates, updated_at: now }
                          mockStorage.projects.set(key, updated)
                          return { data: updated, error: null }
                        }
                      }
                      break
                    }
                    case 'diagrams': {
                      for (const [key, diagram] of mockStorage.diagrams.entries()) {
                        if (diagram[column] === value && diagram[column2] === value2) {
                          const updated = { ...diagram, ...updates, updated_at: now }
                          mockStorage.diagrams.set(key, updated)
                          return { data: updated, error: null }
                        }
                      }
                      break
                    }
                  }
                  return { data: null, error: { message: 'Not found' } }
                },
              }),
            }),
          }),
        }),

        upsert: (data: any | any[]) => ({
          select: (_columns?: string) => ({
            single: async () => {
              const item = Array.isArray(data) ? data[0] : data
              const now = new Date().toISOString()

              // If item has ID and exists, update it
              if (item.id) {
                switch (table) {
                  case 'diagrams': {
                    const existing = mockStorage.diagrams.get(item.id)
                    if (existing) {
                      const updated = { ...existing, ...item, updated_at: now }
                      mockStorage.diagrams.set(item.id, updated)
                      return { data: updated, error: null }
                    }
                    // Not found, create with given ID
                    const newItem = { ...item, created_at: now, updated_at: now }
                    mockStorage.diagrams.set(item.id, newItem)
                    return { data: newItem, error: null }
                  }
                }
              }

              // Create new
              const id = generateId(table.slice(0, 3) + '-')
              const fullItem = { ...item, id, created_at: now, updated_at: now }

              switch (table) {
                case 'diagrams':
                  mockStorage.diagrams.set(id, fullItem)
                  break
              }

              return { data: fullItem, error: null }
            },
          }),
        }),

        delete: () => ({
          eq: (column: string, value: any) => {
            switch (table) {
              case 'projects':
                // Find and delete by column value
                for (const [key, project] of mockStorage.projects.entries()) {
                  if (project[column] === value) {
                    mockStorage.projects.delete(key)
                    // Also delete related diagrams
                    for (const [diagKey, diagram] of mockStorage.diagrams.entries()) {
                      if (diagram.project_id === project.id) {
                        mockStorage.diagrams.delete(diagKey)
                      }
                    }
                    break
                  }
                }
                break
              case 'diagrams':
                // Find and delete by column value
                for (const [key, diagram] of mockStorage.diagrams.entries()) {
                  if (diagram[column] === value) {
                    mockStorage.diagrams.delete(key)
                    break
                  }
                }
                break
            }
            // Support chained .eq() for user_id check
            return {
              error: null,
              eq: (column2: string, value2: any) => {
                switch (table) {
                  case 'projects':
                    for (const [key, project] of mockStorage.projects.entries()) {
                      if (project[column] === value && project[column2] === value2) {
                        mockStorage.projects.delete(key)
                        // Delete related diagrams
                        for (const [diagKey, diagram] of mockStorage.diagrams.entries()) {
                          if (diagram.project_id === project.id) {
                            mockStorage.diagrams.delete(diagKey)
                          }
                        }
                        break
                      }
                    }
                    break
                  case 'diagrams':
                    for (const [key, diagram] of mockStorage.diagrams.entries()) {
                      if (diagram[column] === value && diagram[column2] === value2) {
                        mockStorage.diagrams.delete(key)
                        break
                      }
                    }
                    break
                }
                return { error: null }
              },
            }
          },
        }),
      }
    },
  }
}

// Export storage for debugging
export const getMockStorage = () => mockStorage
