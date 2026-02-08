import {
  sendEmail,
  organizationInviteEmail,
  projectSharedEmail,
  accountDeletionScheduledEmail,
  accountDeletionCancelledEmail,
  weeklyDigestEmail,
} from '@/lib/email'

// Mock Resend — not configured in test env, so stub path is tested
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
    },
  })),
}))

describe('sendEmail', () => {
  it('returns success with stub flag when RESEND_API_KEY is not set', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    })
    expect(result.success).toBe(true)
    expect(result.stub).toBe(true)
  })
})

// ─── Email Templates ────────────────────────────────────────────────────────

describe('organizationInviteEmail', () => {
  it('generates subject and html with org name', () => {
    const { subject, html } = organizationInviteEmail({
      orgName: 'Acme Corp',
      inviterName: 'John',
      inviteUrl: 'https://app.test/invite/abc',
    })
    expect(subject).toContain('Acme Corp')
    expect(html).toContain('John')
    expect(html).toContain('https://app.test/invite/abc')
    expect(html).toContain('Accept Invitation')
  })
})

describe('projectSharedEmail', () => {
  it('includes project name and permission', () => {
    const { subject, html } = projectSharedEmail({
      projectName: 'VPC Prod',
      sharerName: 'Alice',
      permission: 'edit',
      projectUrl: 'https://app.test/projects/123',
    })
    expect(subject).toContain('VPC Prod')
    expect(html).toContain('edit')
    expect(html).toContain('Alice')
    expect(html).toContain('View Project')
  })
})

describe('accountDeletionScheduledEmail', () => {
  it('includes deletion date and cancel link', () => {
    const { subject, html } = accountDeletionScheduledEmail({
      userName: 'Bob',
      deletionDate: '2026-02-15',
      cancelUrl: 'https://app.test/cancel',
    })
    expect(subject).toContain('deletion')
    expect(html).toContain('Bob')
    expect(html).toContain('2026-02-15')
    expect(html).toContain('Cancel Deletion')
  })
})

describe('accountDeletionCancelledEmail', () => {
  it('includes user name', () => {
    const { subject, html } = accountDeletionCancelledEmail({
      userName: 'Carol',
    })
    expect(subject).toContain('cancelled')
    expect(html).toContain('Carol')
  })
})

describe('weeklyDigestEmail', () => {
  it('handles zero projects', () => {
    const { subject, html } = weeklyDigestEmail({
      userName: 'Dave',
      projectCount: 0,
      recentProjects: [],
      dashboardUrl: 'https://app.test/dashboard',
    })
    expect(subject).toContain('digest')
    expect(html).toContain('0')
    expect(html).toContain('Go to Dashboard')
  })

  it('lists recent projects', () => {
    const { html } = weeklyDigestEmail({
      userName: 'Eve',
      projectCount: 2,
      recentProjects: [
        { name: 'Project A', updatedAt: 'yesterday' },
        { name: 'Project B', updatedAt: '3 days ago' },
      ],
      dashboardUrl: 'https://app.test/dashboard',
    })
    expect(html).toContain('Project A')
    expect(html).toContain('Project B')
    expect(html).toContain('Recently updated')
  })
})
