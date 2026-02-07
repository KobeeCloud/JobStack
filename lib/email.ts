import { Resend } from 'resend'

// Resend is optional — if not configured, emails are logged to console
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'JobStack <noreply@jobstack.app>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.log(`[EMAIL STUB] To: ${to}, Subject: ${subject}`)
    return { success: true, stub: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || htmlToPlainText(html),
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

// ─── Email Templates ───────────────────────────────────────────────────────

export function organizationInviteEmail(params: {
  orgName: string
  inviterName: string
  inviteUrl: string
}) {
  const subject = `You've been invited to ${params.orgName} on JobStack`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've been invited!</h2>
      <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.orgName}</strong> on JobStack.</p>
      <p>
        <a href="${params.inviteUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Accept Invitation
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
    </div>
  `
  return { subject, html }
}

export function projectSharedEmail(params: {
  projectName: string
  sharerName: string
  permission: string
  projectUrl: string
}) {
  const subject = `${params.sharerName} shared "${params.projectName}" with you`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Project shared with you</h2>
      <p><strong>${params.sharerName}</strong> shared the project <strong>"${params.projectName}"</strong> with you (${params.permission} access).</p>
      <p>
        <a href="${params.projectUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          View Project
        </a>
      </p>
    </div>
  `
  return { subject, html }
}

export function accountDeletionScheduledEmail(params: {
  userName: string
  deletionDate: string
  cancelUrl: string
}) {
  const subject = 'Your JobStack account is scheduled for deletion'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Deletion Scheduled</h2>
      <p>Hi ${params.userName},</p>
      <p>Your JobStack account has been scheduled for permanent deletion on <strong>${params.deletionDate}</strong>.</p>
      <p>If you did not request this, or want to keep your account, you can cancel the deletion:</p>
      <p>
        <a href="${params.cancelUrl}"
           style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Cancel Deletion
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">After the deletion date, all your data will be permanently removed in accordance with GDPR Art. 17.</p>
    </div>
  `
  return { subject, html }
}

export function accountDeletionCancelledEmail(params: {
  userName: string
}) {
  const subject = 'Your JobStack account deletion has been cancelled'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Deletion Cancelled</h2>
      <p>Hi ${params.userName},</p>
      <p>Your account deletion has been successfully cancelled. Your account and all data remain intact.</p>
      <p style="color: #6b7280; font-size: 14px;">If you did not perform this action, please secure your account immediately.</p>
    </div>
  `
  return { subject, html }
}

export function weeklyDigestEmail(params: {
  userName: string
  projectCount: number
  recentProjects: { name: string; updatedAt: string }[]
  dashboardUrl: string
}) {
  const projectList = params.recentProjects
    .map(p => `<li><strong>${p.name}</strong> — updated ${p.updatedAt}</li>`)
    .join('')

  const subject = 'Your weekly JobStack digest'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Weekly Digest</h2>
      <p>Hi ${params.userName},</p>
      <p>You have <strong>${params.projectCount}</strong> project${params.projectCount !== 1 ? 's' : ''} in JobStack.</p>
      ${params.recentProjects.length > 0 ? `
        <h3>Recently updated:</h3>
        <ul>${projectList}</ul>
      ` : ''}
      <p>
        <a href="${params.dashboardUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Go to Dashboard
        </a>
      </p>
    </div>
  `
  return { subject, html }
}
