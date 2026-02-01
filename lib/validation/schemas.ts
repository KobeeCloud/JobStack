import { z } from 'zod'

// UUID validation - also accepts mock IDs for development
export const uuidSchema = z.string().min(1, 'ID is required').refine(
  (val) => {
    // Accept standard UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    // Also accept mock IDs like "pro-1234567-abcdef" or "demo-project-001"
    const mockIdRegex = /^[a-z]{3,}-[a-z0-9-]+$/i
    return uuidRegex.test(val) || mockIdRegex.test(val)
  },
  'Invalid ID format'
)

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
})

// Diagram node/edge schemas
export const nodeDataSchema = z.object({
  label: z.string().optional(),
  componentId: z.string().min(1, 'Component ID is required'),
  config: z.record(z.any()).optional(),
})

export const nodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: nodeDataSchema,
})

export const edgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Source is required'),
  target: z.string().min(1, 'Target is required'),
  type: z.string().optional(),
})

export const diagramDataSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

// Diagram schemas
export const createDiagramSchema = z.object({
  project_id: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  data: diagramDataSchema,
  thumbnail_url: z.string().url().optional().nullable(),
})

export const updateDiagramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  data: diagramDataSchema.optional(),
  thumbnail_url: z.string().url().optional().nullable(),
})

// Terraform generation schema
export const generateTerraformSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  diagram_id: uuidSchema.optional(),
})

// Cost estimation schema
export const estimateCostSchema = z.object({
  nodes: z.array(nodeSchema),
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Project share schema
export const shareProjectSchema = z.object({
  project_id: uuidSchema,
  shared_with_email: z.string().email('Invalid email address'),
  permission: z.enum(['view', 'edit'], {
    errorMap: () => ({ message: 'Permission must be either "view" or "edit"' }),
  }),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateDiagramInput = z.infer<typeof createDiagramSchema>
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>
export type GenerateTerraformInput = z.infer<typeof generateTerraformSchema>
export type EstimateCostInput = z.infer<typeof estimateCostSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ShareProjectInput = z.infer<typeof shareProjectSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
