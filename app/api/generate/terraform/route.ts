import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, applyRateLimit } from '@/lib/api-helpers'
import { generateTerraformSchema } from '@/lib/validation/schemas'
import { generateTerraform, generateTerraformReadme } from '@/lib/generators/terraform'
import { logger } from '@/lib/logger'

export const POST = createApiHandler(
  async (request: NextRequest, { auth, body }) => {
    try {
      const terraformFiles = generateTerraform(body.nodes, body.edges)
      const readme = generateTerraformReadme(body.nodes)

      const allFiles = [...terraformFiles, { code: readme, filename: 'README.md', provider: 'terraform' }]

      // Save export if diagram_id provided
      if (body.diagram_id) {
        // Verify user has access to diagram
        const { data: diagram } = await auth.supabase
          .from('diagrams')
          .select('id, project:projects!inner(user_id)')
          .eq('id', body.diagram_id)
          .single()

        if (diagram && diagram.project?.user_id === auth.user.id) {
          await auth.supabase.from('exports').insert({
            diagram_id: body.diagram_id,
            export_type: 'terraform',
            code_content: JSON.stringify(allFiles),
          })

          logger.info('Terraform export saved', { diagramId: body.diagram_id, userId: auth.user.id })
        }
      }

      return NextResponse.json({ files: allFiles })
    } catch (error) {
      logger.error('Failed to generate Terraform', error, { userId: auth.user.id })
      throw error
    }
  },
  {
    requireAuth: true,
    validateBody: generateTerraformSchema,
    method: 'POST',
  }
)
