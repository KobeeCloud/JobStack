import crypto from 'crypto'

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'diagram.saved'
  | 'diagram.exported'
  | 'member.joined'
  | 'member.left'

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

export function createWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export async function deliverWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
  const body = JSON.stringify(payload)
  const signature = createWebhookSignature(body, secret)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-JobStack-Signature': `sha256=${signature}`,
        'X-JobStack-Event': payload.event,
        'X-JobStack-Delivery': crypto.randomUUID(),
        'User-Agent': 'JobStack-Webhook/1.0',
      },
      body,
      signal: AbortSignal.timeout(10_000), // 10s timeout
    })

    return { success: res.ok, status: res.status }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = `sha256=${createWebhookSignature(payload, secret)}`
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}
