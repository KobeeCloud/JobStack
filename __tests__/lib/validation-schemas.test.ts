import {
  createProjectSchema,
  updateProjectSchema,
  loginSchema,
  registerSchema,
  uuidSchema,
  nodeSchema,
  edgeSchema,
  diagramDataSchema,
  shareProjectSchema,
  paginationSchema,
  cloudProviderSchema,
} from '@/lib/validation/schemas'

// ─── UUID Schema ────────────────────────────────────────────────────────────

describe('uuidSchema', () => {
  it('accepts valid UUID v4', () => {
    const result = uuidSchema.safeParse('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
    expect(result.success).toBe(true)
  })

  it('accepts mock IDs (dev mode)', () => {
    const result = uuidSchema.safeParse('proj-abc-123')
    expect(result.success).toBe(true)
  })

  it('rejects empty string', () => {
    const result = uuidSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

// ─── Cloud Provider ─────────────────────────────────────────────────────────

describe('cloudProviderSchema', () => {
  it.each(['aws', 'azure', 'gcp', 'vercel', 'netlify', 'cloudflare'])('accepts "%s"', provider => {
    expect(cloudProviderSchema.safeParse(provider).success).toBe(true)
  })

  it('rejects unknown provider', () => {
    expect(cloudProviderSchema.safeParse('oracle').success).toBe(false)
  })
})

// ─── Create Project ─────────────────────────────────────────────────────────

describe('createProjectSchema', () => {
  it('accepts valid input', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      description: 'A test project',
      cloud_provider: 'aws',
    })
    expect(result.success).toBe(true)
  })

  it('accepts minimal input (name only)', () => {
    const result = createProjectSchema.safeParse({ name: 'Minimal' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects name exceeding 100 chars', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects description exceeding 1000 chars', () => {
    const result = createProjectSchema.safeParse({
      name: 'OK',
      description: 'x'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts null description', () => {
    const result = createProjectSchema.safeParse({
      name: 'Test',
      description: null,
    })
    expect(result.success).toBe(true)
  })
})

// ─── Update Project ─────────────────────────────────────────────────────────

describe('updateProjectSchema', () => {
  it('accepts partial update (name only)', () => {
    const result = updateProjectSchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateProjectSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ─── Login Schema ───────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Register Schema ────────────────────────────────────────────────────────

describe('registerSchema', () => {
  const validRegister = {
    email: 'newuser@example.com',
    password: 'StrongP@ss1',
    confirmPassword: 'StrongP@ss1',
    consent: true as const,
  }

  it('accepts valid registration', () => {
    const result = registerSchema.safeParse(validRegister)
    expect(result.success).toBe(true)
  })

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'weakpass1!',
      confirmPassword: 'weakpass1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'NoNumbers!',
      confirmPassword: 'NoNumbers!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without special character', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'NoSpecial1',
      confirmPassword: 'NoSpecial1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'Sh1!',
      confirmPassword: 'Sh1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: 'Different1!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('confirmPassword'))).toBe(true)
    }
  })

  it('rejects consent=false', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      consent: false,
    })
    expect(result.success).toBe(false)
  })
})

// ─── Node Schema ────────────────────────────────────────────────────────────

describe('nodeSchema', () => {
  it('accepts valid node with componentId', () => {
    const result = nodeSchema.safeParse({
      id: 'node-1',
      position: { x: 100, y: 200 },
      data: { label: 'EC2', componentId: 'aws-ec2' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid node with component', () => {
    const result = nodeSchema.safeParse({
      id: 'node-2',
      position: { x: 0, y: 0 },
      data: { component: 'vm' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects node without componentId or component', () => {
    const result = nodeSchema.safeParse({
      id: 'node-3',
      position: { x: 0, y: 0 },
      data: { label: 'Missing ID' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects node without position', () => {
    const result = nodeSchema.safeParse({
      id: 'node-4',
      data: { componentId: 'test' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects node without id', () => {
    const result = nodeSchema.safeParse({
      id: '',
      position: { x: 0, y: 0 },
      data: { componentId: 'test' },
    })
    expect(result.success).toBe(false)
  })
})

// ─── Edge Schema ────────────────────────────────────────────────────────────

describe('edgeSchema', () => {
  it('accepts valid edge', () => {
    const result = edgeSchema.safeParse({
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
    })
    expect(result.success).toBe(true)
  })

  it('accepts edge with optional fields', () => {
    const result = edgeSchema.safeParse({
      id: 'edge-2',
      source: 'node-1',
      target: 'node-2',
      type: 'smoothstep',
      animated: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects edge without source', () => {
    const result = edgeSchema.safeParse({
      id: 'edge-3',
      source: '',
      target: 'node-2',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Diagram Data Schema ────────────────────────────────────────────────────

describe('diagramDataSchema', () => {
  it('accepts valid diagram data', () => {
    const result = diagramDataSchema.safeParse({
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, data: { componentId: 'ec2' } },
        { id: 'n2', position: { x: 100, y: 0 }, data: { componentId: 'rds' } },
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty arrays', () => {
    const result = diagramDataSchema.safeParse({ nodes: [], edges: [] })
    expect(result.success).toBe(true)
  })
})

// ─── Share Project ──────────────────────────────────────────────────────────

describe('shareProjectSchema', () => {
  it('accepts valid share request', () => {
    const result = shareProjectSchema.safeParse({
      project_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      shared_with_email: 'colleague@example.com',
      permission: 'edit',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid permission', () => {
    const result = shareProjectSchema.safeParse({
      project_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      shared_with_email: 'test@test.com',
      permission: 'admin',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Pagination ─────────────────────────────────────────────────────────────

describe('paginationSchema', () => {
  it('applies defaults for empty input', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('coerces string numbers', () => {
    const result = paginationSchema.safeParse({ page: '3', limit: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(50)
    }
  })

  it('rejects page < 1', () => {
    const result = paginationSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects limit > 100', () => {
    const result = paginationSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })
})
