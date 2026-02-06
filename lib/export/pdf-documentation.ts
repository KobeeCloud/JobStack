import { Node, Edge } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

export interface PDFDocumentConfig {
  title: string;
  description?: string;
  author?: string;
  version?: string;
  createdAt?: Date;
  includeTableOfContents: boolean;
  includeDiagramImage: boolean;
  includeNodeDetails: boolean;
  includeConnectionDetails: boolean;
  includeTerraformCode: boolean;
  includeEstimatedCosts: boolean;
  companyLogo?: string;
  theme: 'light' | 'dark' | 'corporate';
}

export interface NodeDocumentation {
  id: string;
  name: string;
  type: string;
  description?: string;
  configuration?: Record<string, unknown>;
  connections: {
    incoming: Array<{ from: string; label?: string }>;
    outgoing: Array<{ to: string; label?: string }>;
  };
  estimatedCost?: string;
  tags?: string[];
}

export interface DocumentSection {
  title: string;
  content: string;
  level: 1 | 2 | 3;
}

// ============================================================================
// Constants
// ============================================================================

const NODE_TYPE_DESCRIPTIONS: Record<string, string> = {
  // AWS
  'ec2': 'Amazon EC2 provides scalable computing capacity in the AWS cloud.',
  's3': 'Amazon S3 is an object storage service with industry-leading scalability.',
  'rds': 'Amazon RDS makes it easy to set up, operate, and scale a relational database.',
  'lambda': 'AWS Lambda lets you run code without provisioning servers.',
  'vpc': 'Amazon VPC lets you provision a logically isolated section of the AWS Cloud.',
  'load-balancer': 'Elastic Load Balancing distributes incoming application traffic across targets.',
  'api-gateway': 'Amazon API Gateway is a fully managed service for creating APIs.',
  'dynamodb': 'Amazon DynamoDB is a fast and flexible NoSQL database service.',
  'cloudfront': 'Amazon CloudFront is a fast content delivery network (CDN) service.',
  'sns': 'Amazon SNS is a fully managed messaging service for pub/sub.',
  'sqs': 'Amazon SQS is a fully managed message queuing service.',

  // Azure
  'vm': 'Azure Virtual Machines provide on-demand, scalable computing resources.',
  'blob-storage': 'Azure Blob Storage is massively scalable object storage.',
  'sql-database': 'Azure SQL Database is a fully managed relational database.',
  'function-app': 'Azure Functions is a serverless compute service.',
  'vnet': 'Azure Virtual Network is the fundamental building block for private networks.',

  // GCP
  'compute-engine': 'Google Compute Engine delivers configurable virtual machines.',
  'cloud-storage': 'Cloud Storage is a unified object storage for developers.',
  'cloud-sql': 'Cloud SQL is a fully managed relational database service.',
  'cloud-function': 'Cloud Functions is a serverless execution environment.',

  // Generic
  'database': 'Database storage component',
  'server': 'Server or compute instance',
  'storage': 'Storage component',
  'network': 'Network component',
  'default': 'Cloud resource component',
};

// ============================================================================
// Document Generation Functions
// ============================================================================

function generateNodeDocumentation(
  node: Node,
  edges: Edge[],
  allNodes: Node[]
): NodeDocumentation {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Find connections
  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  return {
    id: node.id,
    name: (node.data?.label as string) || node.id,
    type: node.type || 'default',
    description: (node.data?.description as string) || NODE_TYPE_DESCRIPTIONS[node.type || 'default'],
    configuration: node.data as Record<string, unknown>,
    connections: {
      incoming: incomingEdges.map((e) => ({
        from: (nodeMap.get(e.source)?.data?.label as string) || e.source,
        label: e.label as string | undefined,
      })),
      outgoing: outgoingEdges.map((e) => ({
        to: (nodeMap.get(e.target)?.data?.label as string) || e.target,
        label: e.label as string | undefined,
      })),
    },
    tags: (node.data?.tags as string[]) || [],
  };
}

function generateMarkdownSection(section: DocumentSection): string {
  const heading = '#'.repeat(section.level);
  return `${heading} ${section.title}\n\n${section.content}\n\n`;
}

// ============================================================================
// Main Generator
// ============================================================================

export function generatePDFDocumentation(
  nodes: Node[],
  edges: Edge[],
  config: PDFDocumentConfig
): string {
  const sections: DocumentSection[] = [];

  // Title Page
  sections.push({
    title: config.title,
    content: [
      config.description && `**Description:** ${config.description}`,
      config.author && `**Author:** ${config.author}`,
      config.version && `**Version:** ${config.version}`,
      `**Generated:** ${new Date().toLocaleDateString()}`,
      '',
      '---',
    ].filter(Boolean).join('\n\n'),
    level: 1,
  });

  // Executive Summary
  sections.push({
    title: 'Executive Summary',
    content: [
      `This document describes the cloud architecture consisting of **${nodes.length} components** `,
      `and **${edges.length} connections**. The architecture is designed to provide a scalable, `,
      `reliable, and secure infrastructure for your application.`,
      '',
      '### Quick Stats',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Components | ${nodes.length} |`,
      `| Total Connections | ${edges.length} |`,
      `| Component Types | ${new Set(nodes.map((n) => n.type || 'default')).size} |`,
      `| Container Groups | ${nodes.filter((n) => n.type === 'vpc' || n.type === 'vnet' || n.type === 'group').length} |`,
    ].join('\n'),
    level: 1,
  });

  // Table of Contents
  if (config.includeTableOfContents) {
    const tocItems = [
      '1. Executive Summary',
      '2. Architecture Overview',
      config.includeNodeDetails && '3. Component Details',
      config.includeConnectionDetails && '4. Connection Map',
      config.includeTerraformCode && '5. Infrastructure as Code',
      config.includeEstimatedCosts && '6. Cost Estimation',
      '7. Appendix',
    ].filter(Boolean);

    sections.push({
      title: 'Table of Contents',
      content: tocItems.join('\n\n'),
      level: 1,
    });
  }

  // Architecture Overview
  sections.push({
    title: 'Architecture Overview',
    content: [
      'The following diagram illustrates the high-level architecture:',
      '',
      '*[Architecture diagram would be embedded here]*',
      '',
      '### Component Distribution',
      '',
      generateComponentDistributionTable(nodes),
    ].join('\n'),
    level: 1,
  });

  // Component Details
  if (config.includeNodeDetails) {
    sections.push({
      title: 'Component Details',
      content: 'Detailed documentation for each component in the architecture.',
      level: 1,
    });

    // Group nodes by type for better organization
    const nodesByType = groupNodesByType(nodes);

    for (const [type, typeNodes] of Object.entries(nodesByType)) {
      const typeLabel = formatNodeType(type);

      sections.push({
        title: typeLabel,
        content: typeNodes.map((node) => {
          const doc = generateNodeDocumentation(node, edges, nodes);
          return formatNodeDocSection(doc);
        }).join('\n\n---\n\n'),
        level: 2,
      });
    }
  }

  // Connection Details
  if (config.includeConnectionDetails) {
    sections.push({
      title: 'Connection Map',
      content: [
        'This section documents all connections between components.',
        '',
        generateConnectionTable(nodes, edges),
      ].join('\n'),
      level: 1,
    });
  }

  // Cost Estimation
  if (config.includeEstimatedCosts) {
    sections.push({
      title: 'Cost Estimation',
      content: [
        '> **Note:** These are rough estimates. Actual costs may vary based on usage patterns.',
        '',
        generateCostTable(nodes),
      ].join('\n'),
      level: 1,
    });
  }

  // Appendix
  sections.push({
    title: 'Appendix',
    content: [
      '### Component ID Reference',
      '',
      generateIdReferenceTable(nodes),
      '',
      '### Document Metadata',
      '',
      `- **Generated by:** JobStack Architecture Documentation`,
      `- **Generation Date:** ${new Date().toISOString()}`,
      `- **Document Version:** ${config.version || '1.0.0'}`,
    ].join('\n'),
    level: 1,
  });

  // Generate final Markdown
  return sections.map(generateMarkdownSection).join('\n');
}

// ============================================================================
// Helper Functions
// ============================================================================

function groupNodesByType(nodes: Node[]): Record<string, Node[]> {
  const groups: Record<string, Node[]> = {};

  for (const node of nodes) {
    const type = node.type || 'default';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(node);
  }

  return groups;
}

function formatNodeType(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatNodeDocSection(doc: NodeDocumentation): string {
  const lines: string[] = [
    `#### ${doc.name}`,
    '',
    `**Type:** ${formatNodeType(doc.type)}`,
    '',
    doc.description || '',
  ];

  if (doc.connections.incoming.length > 0) {
    lines.push('', '**Receives data from:**');
    for (const conn of doc.connections.incoming) {
      lines.push(`- ${conn.from}${conn.label ? ` (${conn.label})` : ''}`);
    }
  }

  if (doc.connections.outgoing.length > 0) {
    lines.push('', '**Sends data to:**');
    for (const conn of doc.connections.outgoing) {
      lines.push(`- ${conn.to}${conn.label ? ` (${conn.label})` : ''}`);
    }
  }

  if (doc.tags && doc.tags.length > 0) {
    lines.push('', `**Tags:** ${doc.tags.join(', ')}`);
  }

  return lines.join('\n');
}

function generateComponentDistributionTable(nodes: Node[]): string {
  const typeCount = new Map<string, number>();

  for (const node of nodes) {
    const type = node.type || 'default';
    typeCount.set(type, (typeCount.get(type) || 0) + 1);
  }

  const rows = Array.from(typeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `| ${formatNodeType(type)} | ${count} |`);

  return [
    '| Component Type | Count |',
    '|----------------|-------|',
    ...rows,
  ].join('\n');
}

function generateConnectionTable(nodes: Node[], edges: Edge[]): string {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const rows = edges.map((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    const sourceName = (source?.data?.label as string) || edge.source;
    const targetName = (target?.data?.label as string) || edge.target;
    const label = (edge.label as string) || '-';

    return `| ${sourceName} | ${targetName} | ${label} |`;
  });

  return [
    '| Source | Target | Label |',
    '|--------|--------|-------|',
    ...rows,
  ].join('\n');
}

function generateCostTable(nodes: Node[]): string {
  const MONTHLY_ESTIMATES: Record<string, string> = {
    'ec2': '$50-500/mo',
    's3': '$5-50/mo',
    'rds': '$100-1000/mo',
    'lambda': '$0-100/mo',
    'load-balancer': '$20-200/mo',
    'api-gateway': '$5-50/mo',
    'dynamodb': '$25-250/mo',
    'cloudfront': '$10-100/mo',
    'vm': '$50-500/mo',
    'sql-database': '$100-1000/mo',
    'function-app': '$0-100/mo',
    'compute-engine': '$50-500/mo',
    'cloud-sql': '$100-1000/mo',
    'default': 'Varies',
  };

  const rows = nodes.map((node) => {
    const name = (node.data?.label as string) || node.id;
    const type = formatNodeType(node.type || 'default');
    const estimate = MONTHLY_ESTIMATES[node.type || 'default'] || 'Varies';

    return `| ${name} | ${type} | ${estimate} |`;
  });

  return [
    '| Component | Type | Est. Monthly Cost |',
    '|-----------|------|-------------------|',
    ...rows,
  ].join('\n');
}

function generateIdReferenceTable(nodes: Node[]): string {
  const rows = nodes.map((node) => {
    const name = (node.data?.label as string) || node.id;
    return `| ${node.id} | ${name} | ${node.type || 'default'} |`;
  });

  return [
    '| ID | Name | Type |',
    '|----|------|------|',
    ...rows,
  ].join('\n');
}

// ============================================================================
// Export Helpers
// ============================================================================

export function downloadAsMarkdown(content: string, filename: string = 'documentation.md'): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsHTML(markdownContent: string, filename: string = 'documentation.html'): void {
  // Simple Markdown to HTML conversion (basic)
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; margin-top: 2rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    hr { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
  </style>
</head>
<body>
  ${simpleMarkdownToHTML(markdownContent)}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function simpleMarkdownToHTML(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^---$/gim, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean);
      const isHeader = cells.some((c) => c.includes('---'));
      if (isHeader) return '';
      const tag = 'td';
      return `<tr>${cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });
}

export default generatePDFDocumentation;
