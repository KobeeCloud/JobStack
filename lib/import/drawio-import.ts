import { Node, Edge, XYPosition } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

export interface DrawioCell {
  id: string;
  value: string;
  style: string;
  vertex?: string;
  edge?: string;
  parent?: string;
  source?: string;
  target?: string;
  geometry?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DrawioImportResult {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    pageCount: number;
    totalCells: number;
    importedNodes: number;
    importedEdges: number;
    skippedCells: number;
    warnings: string[];
  };
}

export interface DrawioStyle {
  shape?: string;
  fillColor?: string;
  strokeColor?: string;
  fontColor?: string;
  fontSize?: number;
  rounded?: boolean;
  dashed?: boolean;
  opacity?: number;
}

// ============================================================================
// Style Parser
// ============================================================================

function parseDrawioStyle(styleString: string): DrawioStyle {
  const style: DrawioStyle = {};
  
  if (!styleString) return style;
  
  const parts = styleString.split(';').filter(Boolean);
  
  for (const part of parts) {
    if (part.includes('=')) {
      const [key, value] = part.split('=');
      switch (key) {
        case 'shape':
          style.shape = value;
          break;
        case 'fillColor':
          style.fillColor = value;
          break;
        case 'strokeColor':
          style.strokeColor = value;
          break;
        case 'fontColor':
          style.fontColor = value;
          break;
        case 'fontSize':
          style.fontSize = parseInt(value);
          break;
        case 'rounded':
          style.rounded = value === '1';
          break;
        case 'dashed':
          style.dashed = value === '1';
          break;
        case 'opacity':
          style.opacity = parseInt(value) / 100;
          break;
      }
    } else {
      // Handle shape-only styles like "ellipse" or "rhombus"
      if (['ellipse', 'rhombus', 'triangle', 'hexagon', 'cylinder', 'cloud'].includes(part)) {
        style.shape = part;
      }
    }
  }
  
  return style;
}

// ============================================================================
// Shape to Node Type Mapping
// ============================================================================

const SHAPE_TO_NODE_TYPE: Record<string, string> = {
  // AWS shapes
  'mxgraph.aws3.ec2': 'ec2',
  'mxgraph.aws3.s3': 's3',
  'mxgraph.aws3.rds': 'rds',
  'mxgraph.aws3.lambda': 'lambda',
  'mxgraph.aws3.vpc': 'vpc',
  'mxgraph.aws3.elb': 'load-balancer',
  'mxgraph.aws3.api_gateway': 'api-gateway',
  'mxgraph.aws3.dynamodb': 'dynamodb',
  'mxgraph.aws3.cloudfront': 'cloudfront',
  'mxgraph.aws3.sns': 'sns',
  'mxgraph.aws3.sqs': 'sqs',
  'mxgraph.aws4.ec2': 'ec2',
  'mxgraph.aws4.s3': 's3',
  'mxgraph.aws4.rds': 'rds',
  'mxgraph.aws4.lambda': 'lambda',
  
  // Azure shapes
  'mxgraph.azure.virtual_machine': 'vm',
  'mxgraph.azure.storage_blob': 'blob-storage',
  'mxgraph.azure.sql_database': 'sql-database',
  'mxgraph.azure.function_apps': 'function-app',
  'mxgraph.azure.virtual_network': 'vnet',
  'mxgraph.azure.load_balancer': 'load-balancer',
  
  // GCP shapes
  'mxgraph.gcp2.compute_engine': 'compute-engine',
  'mxgraph.gcp2.cloud_storage': 'cloud-storage',
  'mxgraph.gcp2.cloud_sql': 'cloud-sql',
  'mxgraph.gcp2.cloud_functions': 'cloud-function',
  
  // Generic shapes
  'rectangle': 'default',
  'ellipse': 'default',
  'rhombus': 'default',
  'cylinder': 'database',
  'cloud': 'cloud',
  'image': 'image',
  'swimlane': 'group',
  'group': 'group',
};

function getNodeTypeFromStyle(style: DrawioStyle, styleString: string): string {
  // Check for specific cloud provider shapes in style string
  for (const [shapeKey, nodeType] of Object.entries(SHAPE_TO_NODE_TYPE)) {
    if (styleString.includes(shapeKey)) {
      return nodeType;
    }
  }
  
  // Fall back to generic shape mapping
  if (style.shape && SHAPE_TO_NODE_TYPE[style.shape]) {
    return SHAPE_TO_NODE_TYPE[style.shape];
  }
  
  return 'default';
}

// ============================================================================
// XML Parser
// ============================================================================

function parseDrawioXML(xmlString: string): DrawioCell[] {
  const cells: DrawioCell[] = [];
  
  // Simple XML parsing using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`XML parsing error: ${parseError.textContent}`);
  }
  
  // Find all mxCell elements
  const mxCells = doc.querySelectorAll('mxCell');
  
  for (const cell of mxCells) {
    const id = cell.getAttribute('id') || '';
    const value = cell.getAttribute('value') || '';
    const style = cell.getAttribute('style') || '';
    const vertex = cell.getAttribute('vertex');
    const edge = cell.getAttribute('edge');
    const parent = cell.getAttribute('parent');
    const source = cell.getAttribute('source');
    const target = cell.getAttribute('target');
    
    // Parse geometry
    const geometryEl = cell.querySelector('mxGeometry');
    let geometry: DrawioCell['geometry'] | undefined;
    
    if (geometryEl) {
      geometry = {
        x: parseFloat(geometryEl.getAttribute('x') || '0'),
        y: parseFloat(geometryEl.getAttribute('y') || '0'),
        width: parseFloat(geometryEl.getAttribute('width') || '100'),
        height: parseFloat(geometryEl.getAttribute('height') || '50'),
      };
    }
    
    cells.push({
      id,
      value,
      style,
      vertex: vertex || undefined,
      edge: edge || undefined,
      parent: parent || undefined,
      source: source || undefined,
      target: target || undefined,
      geometry,
    });
  }
  
  return cells;
}

// ============================================================================
// Decompression (for .drawio files with compressed data)
// ============================================================================

async function decompressDrawio(content: string): Promise<string> {
  // Check if content is compressed (base64 encoded and deflated)
  if (content.includes('mxGraphModel') || content.includes('mxCell')) {
    // Already uncompressed XML
    return content;
  }
  
  // Try to parse as mxfile with compressed diagram
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');
  const diagramEl = doc.querySelector('diagram');
  
  if (diagramEl) {
    const compressedData = diagramEl.textContent?.trim();
    if (compressedData) {
      try {
        // Decode base64
        const decoded = atob(compressedData);
        
        // Inflate using pako or browser's DecompressionStream
        if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
          const ds = new DecompressionStream('deflate-raw');
          const blob = new Blob([Uint8Array.from(decoded, c => c.charCodeAt(0))]);
          const decompressedStream = blob.stream().pipeThrough(ds);
          const decompressedBlob = await new Response(decompressedStream).blob();
          const decompressedText = await decompressedBlob.text();
          return decodeURIComponent(decompressedText);
        }
      } catch {
        // If decompression fails, try URL decoding the content
        try {
          return decodeURIComponent(compressedData);
        } catch {
          // Return as-is if all decompression attempts fail
          return content;
        }
      }
    }
  }
  
  return content;
}

// ============================================================================
// Main Import Function
// ============================================================================

export async function importDrawio(content: string): Promise<DrawioImportResult> {
  const warnings: string[] = [];
  
  // Try to decompress if needed
  let xmlContent: string;
  try {
    xmlContent = await decompressDrawio(content);
  } catch (e) {
    warnings.push(`Decompression warning: ${e}`);
    xmlContent = content;
  }
  
  // Parse XML
  const cells = parseDrawioXML(xmlContent);
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const idMapping = new Map<string, string>(); // Map drawio IDs to React Flow IDs
  let skippedCells = 0;
  
  // First pass: create nodes
  for (const cell of cells) {
    // Skip root cells (usually id=0 and id=1)
    if (cell.id === '0' || cell.id === '1') {
      continue;
    }
    
    // Process vertices (nodes)
    if (cell.vertex === '1' && cell.geometry) {
      const style = parseDrawioStyle(cell.style);
      const nodeType = getNodeTypeFromStyle(style, cell.style);
      const nodeId = `node-${cell.id}`;
      
      idMapping.set(cell.id, nodeId);
      
      // Strip HTML from value if present
      let label = cell.value;
      if (label.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = label;
        label = tempDiv.textContent || tempDiv.innerText || '';
      }
      
      const node: Node = {
        id: nodeId,
        type: nodeType,
        position: {
          x: cell.geometry.x,
          y: cell.geometry.y,
        },
        data: {
          label: label.trim() || `Node ${cell.id}`,
          drawioStyle: style,
          originalId: cell.id,
        },
        style: {
          width: cell.geometry.width,
          height: cell.geometry.height,
          ...(style.fillColor && { backgroundColor: style.fillColor }),
          ...(style.strokeColor && { borderColor: style.strokeColor }),
          ...(style.opacity && { opacity: style.opacity }),
        },
      };
      
      // Handle parent relationship (for grouped nodes)
      if (cell.parent && cell.parent !== '1' && cell.parent !== '0') {
        const parentNodeId = idMapping.get(cell.parent);
        if (parentNodeId) {
          node.parentId = parentNodeId;
          node.extent = 'parent';
        }
      }
      
      nodes.push(node);
    }
  }
  
  // Second pass: create edges
  for (const cell of cells) {
    if (cell.edge === '1' && cell.source && cell.target) {
      const sourceId = idMapping.get(cell.source);
      const targetId = idMapping.get(cell.target);
      
      if (sourceId && targetId) {
        const style = parseDrawioStyle(cell.style);
        
        const edge: Edge = {
          id: `edge-${cell.id}`,
          source: sourceId,
          target: targetId,
          label: cell.value || undefined,
          type: style.dashed ? 'step' : 'default',
          animated: style.dashed,
          style: {
            ...(style.strokeColor && { stroke: style.strokeColor }),
          },
        };
        
        edges.push(edge);
      } else {
        skippedCells++;
        if (!sourceId) warnings.push(`Edge ${cell.id}: source node not found`);
        if (!targetId) warnings.push(`Edge ${cell.id}: target node not found`);
      }
    }
  }
  
  return {
    nodes,
    edges,
    metadata: {
      pageCount: 1, // Basic implementation handles single page
      totalCells: cells.length,
      importedNodes: nodes.length,
      importedEdges: edges.length,
      skippedCells,
      warnings,
    },
  };
}

// ============================================================================
// File Reader Helper
// ============================================================================

export function readDrawioFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message}`));
    };
    
    reader.readAsText(file);
  });
}

// ============================================================================
// Validation
// ============================================================================

export function validateDrawioContent(content: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { valid: false, error: 'Invalid XML format' };
    }
    
    // Check for drawio-specific elements
    const hasMxfile = doc.querySelector('mxfile') !== null;
    const hasMxGraphModel = doc.querySelector('mxGraphModel') !== null;
    const hasDiagram = doc.querySelector('diagram') !== null;
    
    if (!hasMxfile && !hasMxGraphModel && !hasDiagram) {
      return { valid: false, error: 'File does not appear to be a draw.io diagram' };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Validation error: ${e}` };
  }
}

export default importDrawio;
