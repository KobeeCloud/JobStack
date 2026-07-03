import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'
import type { ArchitectureIssue } from '@/lib/ai/architecture-analyzer'
import type { ComplianceReport } from '@/lib/compliance/compliance-scanner'
import type { InfrastructureTest } from '@/lib/testing/infrastructure-tester'
import type { CodeFile } from '@/components/diagram/code-preview-dialog'

interface DiagramState {
  // Core diagram data
  nodes: Node[]
  edges: Edge[]
  diagramId: string | null

  // Node selection/config
  selectedNode: Node | null
  configPanelOpen: boolean

  // Right-side Feature Panels
  activePanel: 'none' | 'ai' | 'compliance' | 'testing' | 'multiCloud' | 'customComponent'

  // AI analysis state
  aiIssues: ArchitectureIssue[]
  aiAnalyzing: boolean

  // Compliance scan state
  complianceReport: ComplianceReport | null
  complianceScanning: boolean

  // Testing state
  testResults: InfrastructureTest[] | null
  testing: boolean

  // Multi-cloud state
  highlightedNodeId: string | null

  // Modals / Wizards
  templateDialogOpen: boolean
  showK8sWizard: boolean
  showGovernanceWizard: boolean
  showQuickBuild: boolean

  // Code generation state
  terraformDirty: boolean
  codePreviewOpen: boolean
  codePreviewFiles: CodeFile[]
  codePreviewTitle: string
  codePreviewZipName: string

  // Core Actions
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
  setDiagramId: (id: string | null) => void

  // Panel Actions
  setSelectedNode: (node: Node | null) => void
  setConfigPanelOpen: (open: boolean) => void
  setActivePanel: (panel: DiagramState['activePanel']) => void

  // Feature State Setters
  setAiIssues: (issues: ArchitectureIssue[]) => void
  setAiAnalyzing: (analyzing: boolean) => void
  setComplianceReport: (report: ComplianceReport | null) => void
  setComplianceScanning: (scanning: boolean) => void
  setTestResults: (results: InfrastructureTest[] | null) => void
  setTesting: (testing: boolean) => void
  setHighlightedNodeId: (id: string | null) => void

  // Dialog Setters
  setTemplateDialogOpen: (open: boolean) => void
  setShowK8sWizard: (show: boolean) => void
  setShowGovernanceWizard: (show: boolean) => void
  setShowQuickBuild: (show: boolean) => void

  // Code Preview Setters
  setTerraformDirty: (dirty: boolean) => void
  setCodePreviewOpen: (open: boolean) => void
  setCodePreviewFiles: (files: CodeFile[]) => void
  setCodePreviewTitle: (title: string) => void
  setCodePreviewZipName: (name: string) => void
}

export const useDiagramStore = create<DiagramState>(set => ({
  nodes: [],
  edges: [],
  diagramId: null,

  selectedNode: null,
  configPanelOpen: false,

  activePanel: 'none',

  aiIssues: [],
  aiAnalyzing: false,

  complianceReport: null,
  complianceScanning: false,

  testResults: null,
  testing: false,

  highlightedNodeId: null,

  templateDialogOpen: false,
  showK8sWizard: false,
  showGovernanceWizard: false,
  showQuickBuild: false,

  terraformDirty: false,
  codePreviewOpen: false,
  codePreviewFiles: [],
  codePreviewTitle: '',
  codePreviewZipName: 'output.zip',

  setNodes: updater =>
    set(state => ({
      nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
      terraformDirty: true,
    })),

  setEdges: updater =>
    set(state => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater,
    })),

  setDiagramId: id => set({ diagramId: id }),

  setSelectedNode: node => set({ selectedNode: node }),
  setConfigPanelOpen: open => set({ configPanelOpen: open }),

  setActivePanel: panel =>
    set(state => ({
      // If trying to open a panel that is already open, close it instead
      activePanel: state.activePanel === panel ? 'none' : panel,
    })),

  setAiIssues: issues => set({ aiIssues: issues }),
  setAiAnalyzing: analyzing => set({ aiAnalyzing: analyzing }),

  setComplianceReport: report => set({ complianceReport: report }),
  setComplianceScanning: scanning => set({ complianceScanning: scanning }),

  setTestResults: results => set({ testResults: results }),
  setTesting: testing => set({ testing: testing }),

  setHighlightedNodeId: id => set({ highlightedNodeId: id }),

  setTemplateDialogOpen: open => set({ templateDialogOpen: open }),
  setShowK8sWizard: show => set({ showK8sWizard: show }),
  setShowGovernanceWizard: show => set({ showGovernanceWizard: show }),
  setShowQuickBuild: show => set({ showQuickBuild: show }),

  setTerraformDirty: dirty => set({ terraformDirty: dirty }),
  setCodePreviewOpen: open => set({ codePreviewOpen: open }),
  setCodePreviewFiles: files => set({ codePreviewFiles: files }),
  setCodePreviewTitle: title => set({ codePreviewTitle: title }),
  setCodePreviewZipName: name => set({ codePreviewZipName: name }),
}))
