import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { generateTerraformSchema } from '@/lib/validation/schemas'
import { generateTerraformWithValidation, generateTerraformReadme } from '@/lib/generators/terraform'
import { log } from '@/lib/logger'

export const POST = createApiHandler(
  async (request: NextRequest, { auth, body }) => {
    try {
      if (!body) {
        return NextResponse.json({
          success: false,
          error: 'Missing request body',
          errors: [{ nodeId: '', nodeLabel: '', error: 'Missing request body' }]
        }, { status: 400 })
      }

      if (!body.nodes || body.nodes.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No components in diagram. Add components to generate Terraform code.',
          errors: [{ nodeId: '', nodeLabel: 'Diagram', error: 'No components found' }]
        }, { status: 400 })
      }

      const result = generateTerraformWithValidation(body.nodes, body.edges || [])

      if (!result.success && result.files.length === 0) {
        return NextResponse.json({
          success: false,
          error: result.errors.map(e => `${e.nodeLabel}: ${e.error}`).join('\n'),
          errors: result.errors,
          warnings: result.warnings,
          skippedCount: result.skippedCount
        }, { status: 400 })
      }

      const readme = generateTerraformReadme(body.nodes)
      const allFiles = [...result.files, { code: readme, filename: 'README.md', provider: 'terraform' }]

      // Save export if diagram_id provided
      if (body.diagram_id) {
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
          log.info('Terraform export saved', { diagramId: body.diagram_id, userId: auth.user.id })
        }
      }

      return NextResponse.json({
        success: true,
        files: allFiles,
        warnings: result.warnings,
        skippedCount: result.skippedCount
      })
    } catch (error) {
      log.error('Failed to generate Terraform', error, { userId: auth.user.id })
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Terraform code',
        errors: [{ nodeId: '', nodeLabel: '', error: String(error) }]
      }, { status: 500 })
    }
  },
  {
    requireAuth: true,
    validateBody: generateTerraformSchema,
    method: 'POST',
  }
)
