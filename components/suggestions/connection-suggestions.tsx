'use client';

import { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, Zap, Link2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ConnectionSuggestion {
  id: string;
  sourceId: string;
  targetId: string;
  reason: string;
  confidence: number; // 0-100
  type: 'recommended' | 'common' | 'inferred';
  edgeType?: string;
  edgeLabel?: string;
}

export interface ConnectionRule {
  sourceType: string;
  targetType: string;
  reason: string;
  confidence: number;
  bidirectional?: boolean;
  edgeLabel?: string;
}

interface ConnectionSuggestionsPanelProps {
  nodes: Node[];
  edges: Edge[];
  suggestions: ConnectionSuggestion[];
  onAccept: (suggestion: ConnectionSuggestion) => void;
  onReject: (suggestionId: string) => void;
  onAcceptAll: () => void;
  className?: string;
}

// ============================================================================
// Connection Rules Database
// ============================================================================

const CONNECTION_RULES: ConnectionRule[] = [
  // AWS Connections
  { sourceType: 'ec2', targetType: 'rds', reason: 'EC2 typically connects to RDS for database access', confidence: 90 },
  { sourceType: 'ec2', targetType: 's3', reason: 'EC2 instances often store/retrieve data from S3', confidence: 85 },
  { sourceType: 'lambda', targetType: 'dynamodb', reason: 'Lambda functions commonly access DynamoDB', confidence: 95 },
  { sourceType: 'lambda', targetType: 's3', reason: 'Lambda triggered by or accessing S3 buckets', confidence: 90 },
  { sourceType: 'api-gateway', targetType: 'lambda', reason: 'API Gateway routes requests to Lambda', confidence: 98 },
  { sourceType: 'cloudfront', targetType: 's3', reason: 'CloudFront serves static content from S3', confidence: 95 },
  { sourceType: 'cloudfront', targetType: 'load-balancer', reason: 'CloudFront routes to ALB for dynamic content', confidence: 85 },
  { sourceType: 'load-balancer', targetType: 'ec2', reason: 'Load balancer distributes traffic to EC2', confidence: 95 },
  { sourceType: 'load-balancer', targetType: 'ecs', reason: 'ALB routes to ECS services', confidence: 92 },
  { sourceType: 'sqs', targetType: 'lambda', reason: 'SQS triggers Lambda for async processing', confidence: 90 },
  { sourceType: 'sns', targetType: 'sqs', reason: 'SNS fans out to SQS queues', confidence: 88 },
  { sourceType: 'sns', targetType: 'lambda', reason: 'SNS triggers Lambda directly', confidence: 85 },
  { sourceType: 'kinesis', targetType: 'lambda', reason: 'Kinesis streams processed by Lambda', confidence: 90 },
  { sourceType: 'eventbridge', targetType: 'lambda', reason: 'EventBridge rules trigger Lambda', confidence: 92 },

  // Azure Connections
  { sourceType: 'vm', targetType: 'sql-database', reason: 'VMs connect to Azure SQL databases', confidence: 90 },
  { sourceType: 'app-service', targetType: 'sql-database', reason: 'App Service connects to SQL Database', confidence: 92 },
  { sourceType: 'function-app', targetType: 'cosmos-db', reason: 'Functions commonly use Cosmos DB', confidence: 88 },
  { sourceType: 'api-management', targetType: 'function-app', reason: 'APIM routes to Azure Functions', confidence: 95 },
  { sourceType: 'front-door', targetType: 'app-service', reason: 'Front Door routes to App Services', confidence: 90 },
  { sourceType: 'service-bus', targetType: 'function-app', reason: 'Service Bus triggers Functions', confidence: 90 },

  // GCP Connections
  { sourceType: 'compute-engine', targetType: 'cloud-sql', reason: 'Compute Engine connects to Cloud SQL', confidence: 90 },
  { sourceType: 'cloud-function', targetType: 'firestore', reason: 'Cloud Functions access Firestore', confidence: 88 },
  { sourceType: 'cloud-run', targetType: 'cloud-sql', reason: 'Cloud Run connects to Cloud SQL', confidence: 90 },
  { sourceType: 'pubsub', targetType: 'cloud-function', reason: 'Pub/Sub triggers Cloud Functions', confidence: 95 },
  { sourceType: 'load-balancer', targetType: 'cloud-run', reason: 'LB routes to Cloud Run services', confidence: 92 },

  // Kubernetes/Container Connections
  { sourceType: 'ingress', targetType: 'service', reason: 'Ingress routes external traffic to Services', confidence: 98 },
  { sourceType: 'service', targetType: 'deployment', reason: 'Service exposes Deployment pods', confidence: 95 },
  { sourceType: 'deployment', targetType: 'configmap', reason: 'Deployments reference ConfigMaps', confidence: 80 },
  { sourceType: 'deployment', targetType: 'secret', reason: 'Deployments reference Secrets', confidence: 85 },
  { sourceType: 'deployment', targetType: 'pvc', reason: 'Deployments mount Persistent Volumes', confidence: 75 },

  // Generic/Cross-cloud patterns
  { sourceType: 'cdn', targetType: 'storage', reason: 'CDN caches content from storage', confidence: 92 },
  { sourceType: 'cache', targetType: 'database', reason: 'Cache sits in front of database', confidence: 88 },
  { sourceType: 'queue', targetType: 'worker', reason: 'Queue messages processed by workers', confidence: 90 },
];

// ============================================================================
// Suggestion Engine
// ============================================================================

export function generateConnectionSuggestions(
  nodes: Node[],
  existingEdges: Edge[],
  rules: ConnectionRule[] = CONNECTION_RULES
): ConnectionSuggestion[] {
  const suggestions: ConnectionSuggestion[] = [];
  const existingConnections = new Set(
    existingEdges.map((e) => `${e.source}-${e.target}`)
  );

  // Check each pair of nodes against rules
  for (const sourceNode of nodes) {
    for (const targetNode of nodes) {
      if (sourceNode.id === targetNode.id) continue;

      // Skip if connection already exists
      const connectionKey = `${sourceNode.id}-${targetNode.id}`;
      if (existingConnections.has(connectionKey)) continue;

      const sourceType = sourceNode.type || 'default';
      const targetType = targetNode.type || 'default';

      // Find matching rules
      for (const rule of rules) {
        const matchesForward =
          rule.sourceType === sourceType && rule.targetType === targetType;
        const matchesBackward =
          rule.bidirectional &&
          rule.sourceType === targetType &&
          rule.targetType === sourceType;

        if (matchesForward || matchesBackward) {
          suggestions.push({
            id: `suggestion-${sourceNode.id}-${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            reason: rule.reason,
            confidence: rule.confidence,
            type: rule.confidence >= 90 ? 'recommended' : 'common',
            edgeLabel: rule.edgeLabel,
          });
        }
      }
    }
  }

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// Suggestion Item Component
// ============================================================================

function SuggestionItem({
  suggestion,
  sourceNode,
  targetNode,
  onAccept,
  onReject,
}: {
  suggestion: ConnectionSuggestion;
  sourceNode: Node | undefined;
  targetNode: Node | undefined;
  onAccept: () => void;
  onReject: () => void;
}) {
  const confidenceColor =
    suggestion.confidence >= 90
      ? 'text-green-600 bg-green-100'
      : suggestion.confidence >= 70
        ? 'text-yellow-600 bg-yellow-100'
        : 'text-gray-600 bg-gray-100';

  const typeIcon =
    suggestion.type === 'recommended' ? (
      <Zap className="h-3 w-3 text-yellow-500" />
    ) : (
      <Link2 className="h-3 w-3 text-blue-500" />
    );

  return (
    <div className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {typeIcon}
            <span className="font-medium text-sm truncate">
              {(sourceNode?.data?.label as string) || suggestion.sourceId}
            </span>
            <span className="text-gray-400">→</span>
            <span className="font-medium text-sm truncate">
              {(targetNode?.data?.label as string) || suggestion.targetId}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{suggestion.reason}</p>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
            confidenceColor
          )}
        >
          {suggestion.confidence}%
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={onAccept}
        >
          <Check className="h-3 w-3 mr-1" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onReject}
        >
          <X className="h-3 w-3 mr-1" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Panel Component
// ============================================================================

export function ConnectionSuggestionsPanel({
  nodes,
  edges,
  suggestions: externalSuggestions,
  onAccept,
  onReject,
  onAcceptAll,
  className,
}: ConnectionSuggestionsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Generate suggestions if not provided externally
  const suggestions = useMemo(() => {
    if (externalSuggestions && externalSuggestions.length > 0) {
      return externalSuggestions;
    }
    return generateConnectionSuggestions(nodes, edges);
  }, [nodes, edges, externalSuggestions]);

  // Filter out dismissed suggestions
  const visibleSuggestions = useMemo(
    () => suggestions.filter((s) => !dismissedIds.has(s.id)),
    [suggestions, dismissedIds]
  );

  const handleReject = useCallback((suggestionId: string) => {
    setDismissedIds((prev) => new Set([...prev, suggestionId]));
    onReject(suggestionId);
  }, [onReject]);

  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  if (visibleSuggestions.length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        <Link2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No connection suggestions</p>
        <p className="text-xs text-gray-400 mt-1">
          Add more nodes to see recommended connections
        </p>
      </div>
    );
  }

  const highConfidenceCount = visibleSuggestions.filter(
    (s) => s.confidence >= 90
  ).length;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Smart Suggestions
          </h3>
          <span className="text-xs text-gray-500">
            {visibleSuggestions.length} suggestions
          </span>
        </div>
        {highConfidenceCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={onAcceptAll}
          >
            <Check className="h-3 w-3 mr-1" />
            Accept all recommended ({highConfidenceCount})
          </Button>
        )}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {visibleSuggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            sourceNode={nodeMap.get(suggestion.sourceId)}
            targetNode={nodeMap.get(suggestion.targetId)}
            onAccept={() => onAccept(suggestion)}
            onReject={() => handleReject(suggestion.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-center">
        <p className="text-[10px] text-gray-400">
          Suggestions based on common architecture patterns
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Hook for Integration
// ============================================================================

export function useConnectionSuggestions(nodes: Node[], edges: Edge[]) {
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<
    ConnectionSuggestion[]
  >([]);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const suggestions = useMemo(
    () => generateConnectionSuggestions(nodes, edges),
    [nodes, edges]
  );

  const activeSuggestions = useMemo(
    () => suggestions.filter((s) => !rejectedIds.has(s.id)),
    [suggestions, rejectedIds]
  );

  const acceptSuggestion = useCallback(
    (suggestion: ConnectionSuggestion): Edge => {
      setAcceptedSuggestions((prev) => [...prev, suggestion]);
      return {
        id: `edge-${suggestion.sourceId}-${suggestion.targetId}`,
        source: suggestion.sourceId,
        target: suggestion.targetId,
        label: suggestion.edgeLabel,
        type: suggestion.edgeType || 'default',
      };
    },
    []
  );

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setRejectedIds((prev) => new Set([...prev, suggestionId]));
  }, []);

  const acceptAllRecommended = useCallback((): Edge[] => {
    const recommended = activeSuggestions.filter((s) => s.confidence >= 90);
    setAcceptedSuggestions((prev) => [...prev, ...recommended]);
    return recommended.map((suggestion) => ({
      id: `edge-${suggestion.sourceId}-${suggestion.targetId}`,
      source: suggestion.sourceId,
      target: suggestion.targetId,
      label: suggestion.edgeLabel,
      type: suggestion.edgeType || 'default',
    }));
  }, [activeSuggestions]);

  return {
    suggestions: activeSuggestions,
    acceptedSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    acceptAllRecommended,
  };
}

export default ConnectionSuggestionsPanel;
