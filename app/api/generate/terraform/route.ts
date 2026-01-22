import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateTerraform, generateTerraformReadme } from '@/lib/generators/terraform'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nodes, edges, diagram_id } = body

  const terraformFiles = generateTerraform(nodes, edges)
  const readme = generateTerraformReadme(nodes)

  const allFiles = [...terraformFiles, { code: readme, filename: 'README.md', provider: 'terraform' }]

  if (diagram_id) {
    await supabase.from('exports').insert({
      diagram_id,
      export_type: 'terraform',
      code_content: JSON.stringify(allFiles)
    })
  }

  return NextResponse.json({ files: allFiles })
}
