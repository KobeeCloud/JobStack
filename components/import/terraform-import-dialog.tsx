'use client'

import { useState, useCallback } from 'react'
import { Node, Edge } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { importTerraform, importTerraformFiles } from '@/lib/terraform-import'
import {
  Upload, FileCode, AlertTriangle, CheckCircle, X,
  FileText, Loader2, Download, Copy
} from 'lucide-react'

interface TerraformImportDialogProps {
  onImport: (nodes: Node[], edges: Edge[]) => void
  onClose: () => void
}

export function TerraformImportDialog({ onImport, onClose }: TerraformImportDialogProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const [terraformCode, setTerraformCode] = useState('')
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<{
    nodes: Node[]
    edges: Edge[]
    warnings: string[]
  } | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleParse = useCallback(() => {
    if (!terraformCode.trim()) return

    setImporting(true)
    setTimeout(() => {
      const result = importTerraform(terraformCode)
      setPreview({
        nodes: result.nodes,
        edges: result.edges,
        warnings: result.warnings,
      })
      setImporting(false)
    }, 500)
  }, [terraformCode])

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    setImporting(true)
    const filePromises: Promise<{ name: string; content: string }>[] = []

    Array.from(files).forEach(file => {
      if (file.name.endsWith('.tf') || file.name.endsWith('.tf.json')) {
        filePromises.push(
          file.text().then(content => ({ name: file.name, content }))
        )
      }
    })

    Promise.all(filePromises).then(fileContents => {
      if (fileContents.length === 0) {
        setPreview({
          nodes: [],
          edges: [],
          warnings: ['No valid Terraform files found (.tf or .tf.json)'],
        })
        setImporting(false)
        return
      }

      const result = importTerraformFiles(fileContents)
      setPreview(result)
      setImporting(false)
    })
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleImport = useCallback(() => {
    if (preview && preview.nodes.length > 0) {
      onImport(preview.nodes, preview.edges)
      onClose()
    }
  }, [preview, onImport, onClose])

  const loadExample = () => {
    setTerraformCode(`# Example Terraform configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "public-subnet"
  }
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  vpc_security_group_ids = [aws_security_group.web.id]

  tags = {
    Name = "web-server"
  }
}

resource "aws_rds_instance" "db" {
  identifier        = "main-db"
  engine            = "postgres"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
}

resource "aws_s3_bucket" "static" {
  bucket = "my-static-assets"
}
`)
  }

  return (
    <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-orange-500" />
            <CardTitle>Import Terraform</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Import existing Terraform configurations and convert them to visual diagrams
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'paste' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste Code</TabsTrigger>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadExample}>
                <Download className="h-4 w-4 mr-2" />
                Load Example
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.readText().then(setTerraformCode)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Paste from Clipboard
              </Button>
            </div>
            <Textarea
              placeholder="Paste your Terraform configuration here..."
              value={terraformCode}
              onChange={(e) => setTerraformCode(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
            />
            <Button
              onClick={handleParse}
              disabled={!terraformCode.trim() || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileCode className="h-4 w-4 mr-2" />
                  Parse Terraform
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Drag & drop Terraform files</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse (.tf, .tf.json)
              </p>
              <input
                type="file"
                id="terraform-upload"
                multiple
                accept=".tf,.tf.json"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Button variant="outline" asChild>
                <label htmlFor="terraform-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {preview && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Import Preview</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {preview.nodes.length} resources
                </Badge>
                <Badge variant="secondary">
                  {preview.edges.length} connections
                </Badge>
              </div>
            </div>

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ScrollArea className="max-h-24">
                    <ul className="list-disc list-inside text-sm">
                      {preview.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}

            {/* Resource Summary */}
            {preview.nodes.length > 0 && (
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {preview.nodes.map(node => (
                    <div key={node.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="outline" className="font-mono">
                        {node.data?.terraformType as string}
                      </Badge>
                      <span>{node.data?.label as string}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={preview.nodes.length === 0}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Import {preview.nodes.length} Resources
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
