/**
 * Core Generator Utilities — barrel export
 */
export {
  // Types
  type ResolvedNode,
  type ResolvedEdge,
  type InfraGraph,
  type GraphError,
  type SanitizeFormat,

  // Node map & component ID
  buildNodeMap,
  getNodeComponentId,

  // Name sanitization
  sanitizeName,
  uniqueName,

  // Ancestor traversal
  findAncestor,
  findAncestorByComponentId,
  findAncestorByTfResource,

  // Connected node discovery
  findConnectedNodes,
  findConnectedNames,
  findAncestorName,
  findSiblings,

  // Depth & hierarchy
  getNodeDepth,

  // Cycle detection
  detectCycles,

  // InfraGraph builder
  buildInfraGraph,
} from './graph-utils'
