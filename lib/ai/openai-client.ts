import OpenAI from 'openai'
import { log } from '../logger'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    log.warn('OpenAI API key not configured - AI features will be disabled')
    return null
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openaiClient
}

export async function chatWithAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string | null> {
  const client = getOpenAIClient()
  if (!client) {
    return null
  }

  try {
    const completion = await client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    })

    return completion.choices[0].message.content
  } catch (error) {
    log.error('OpenAI API error:', error)
    return null
  }
}

export async function generateDiagramFromText(description: string): Promise<any> {
  const client = getOpenAIClient()
  if (!client) {
    return null
  }

  const prompt = `You are a cloud architecture expert. Convert this natural language description into a JSON diagram structure.

Description: "${description}"

Return a JSON object with this structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "custom",
      "position": {"x": number, "y": number},
      "data": {
        "label": "Component Name",
        "component": "component-id-from-catalog",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "node-id",
      "target": "node-id"
    }
  ]
}

Use these component IDs:
- Virtual Machines: "azure-vm", "ec2-instance", "gcp-compute"
- Databases: "azure-sql", "rds", "cloud-sql"
- Load Balancers: "azure-lb", "alb", "gcp-lb"
- Storage: "azure-storage", "s3", "gcs"
- Networking: "azure-vnet", "vpc", "gcp-vpc"

Generate a realistic cloud architecture based on the description.`

  try {
    const response = await chatWithAI([
      {
        role: 'system',
        content: 'You are a cloud architecture expert. Always return valid JSON.',
      },
      { role: 'user', content: prompt },
    ])

    if (!response) return null

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return null
  } catch (error) {
    log.error('Failed to generate diagram from text:', error)
    return null
  }
}

export { openaiClient }
