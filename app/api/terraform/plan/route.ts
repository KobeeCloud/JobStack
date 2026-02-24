import { NextRequest } from 'next/server'
import { generateTerraformWithValidation } from '@/lib/generators/terraform'
import { Node, Edge } from '@xyflow/react'
import { z } from 'zod'

// We will stream the response back using Server-Sent Events (SSE) to simulate a real terminal

const planRequestSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  environment: z.string().optional().default('dev'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = planRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response('Invalid request payload', { status: 400 })
    }

    const { nodes, edges, environment } = parsed.data

    // Generate TF to see if we have valid outputs
    const result = generateTerraformWithValidation(nodes as Node[], edges as Edge[], { environment })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (text: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        send('\x1b[32mInitializing backend...\x1b[0m\n')
        await sleep(600)

        send('\x1b[32mInitializing provider plugins...\x1b[0m\n')
        await sleep(500)
        send('- Finding latest version of hashicorp/aws...\n')
        send('- Finding latest version of hashicorp/azurerm...\n')
        await sleep(400)
        send('- Installed hashicorp/aws v5.0.0 (signed by HashiCorp)\n')
        await sleep(300)
        send('- Installed hashicorp/azurerm v3.0.0 (signed by HashiCorp)\n\n')

        send('\x1b[32mTerraform has been successfully initialized!\x1b[0m\n\n')
        await sleep(500)

        if (!result.success && result.errors.length > 0) {
          send('\x1b[31mError: Terraform validation failed\x1b[0m\n\n')
          result.errors.forEach(err => {
            send(`\x1b[31m  ✖ [${err.nodeLabel || err.nodeId}]: ${err.error}\x1b[0m\n`)
          })
          controller.close()
          return
        }

        if (result.warnings.length > 0) {
          send('\x1b[33mWarnings:\x1b[0m\n')
          result.warnings.forEach(warn => {
            send(`\x1b[33m  ⚠ ${warn}\x1b[0m\n`)
          })
          send('\n')
        }

        send('\x1b[1mTerraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:\x1b[0m\n')
        send('  \x1b[32m+\x1b[0m create\n\n')
        await sleep(800)

        send('Terraform will perform the following actions:\n\n')

        const mainTf = result.files.find(f => f.filename === 'main.tf')
        const resourceCount = mainTf ? (mainTf.code.match(/resource\s+"/g) || []).length : 0

        // Simulating some plan output for each resource block
        if (mainTf) {
          const blocks = mainTf.code.split('resource "')
          for (let i = 1; i < blocks.length; i++) {
            const type = blocks[i].split('"')[0]
            const name = blocks[i].split('"')[2]
            send(`  \x1b[32m# ${type}.${name}\x1b[0m will be created\n`)
            send(`  \x1b[32m+ resource "${type}" "${name}" {\x1b[0m\n`)
            send(`      \x1b[32m+ id = (known after apply)\x1b[0m\n`)
            send(`    \x1b[32m}\x1b[0m\n\n`)
            await sleep(150)
          }
        }

        await sleep(500)
        send(`\x1b[1mPlan:\x1b[0m ${resourceCount} to add, 0 to change, 0 to destroy.\n`)

        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(String(error), { status: 500 })
  }
}
