import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApiError } from '@/lib/api-error'
import { log } from '@/lib/logger'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().max(500).optional(),
})

export const GET = createApiHandler(
  async (_request: NextRequest, { auth }) => {
    // Use admin client to bypass RLS — user can always see their own memberships
    const adminClient = createAdminClient()
    const { data: memberships, error } = await adminClient
      .from('organization_members')
      .select(`
        role,
        joined_at,
        organization:organizations (
          id,
          name,
          slug,
          plan,
          max_members
        )
      `)
      .eq('user_id', auth.user.id)
      .order('joined_at', { ascending: true })

    if (error) {
      log.error('Failed to fetch user organizations', error, { userId: auth.user.id })
      throw error
    }

    type MemberRow = { role: string; joined_at: string; organization: Record<string, unknown> | null }
    const organizations = ((memberships ?? []) as unknown as MemberRow[])
      .filter((m) => m.organization != null)
      .map((m) => ({
        ...(m.organization as Record<string, unknown>),
        role: m.role,
        joined_at: m.joined_at,
      }))

    return NextResponse.json({ organizations })
  },
  { requireAuth: true, method: 'GET' }
)

export const POST = createApiHandler(
  async (_request: NextRequest, { auth, body }) => {
    if (!body) throw new ApiError(400, 'Missing request body', 'MISSING_BODY')

    const parsed = createOrgSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
    }

    const { name, slug, description } = parsed.data

    // Check slug uniqueness
    const { data: existing } = await auth.supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      throw new ApiError(409, 'This slug is already taken', 'SLUG_TAKEN')
    }

    // Create organization
    const { data: org, error } = await auth.supabase
      .from('organizations')
      .insert({
        name,
        slug,
        description: description || null,
        owner_id: auth.user.id,
        plan: 'free',
        max_members: 5,
      })
      .select()
      .single()

    if (error) {
      log.error('Failed to create organization', error, { userId: auth.user.id })
      throw error
    }

    // Add creator as owner member — use admin client to bypass RLS
    // (RLS insert policy requires existing membership, chicken-and-egg for first member)
    const admin = createAdminClient()
    const { error: memberError } = await admin.from('organization_members').insert({
      organization_id: org.id,
      user_id: auth.user.id,
      role: 'owner',
    })

    if (memberError) {
      log.error('Failed to add org creator as member', memberError, { orgId: org.id, userId: auth.user.id })
      // Roll back org creation so dashboard stays consistent
      await admin.from('organizations').delete().eq('id', org.id)
      throw new ApiError(500, 'Failed to set up organization membership', 'MEMBER_INSERT_FAILED')
    }

    log.info('Organization created', { orgId: org.id, slug, userId: auth.user.id })
    return NextResponse.json(org, { status: 201 })
  },
  { requireAuth: true, method: 'POST' }
)
