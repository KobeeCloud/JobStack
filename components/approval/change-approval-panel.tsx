'use client';

import { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Shield,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type ChangeType = 'add' | 'modify' | 'delete' | 'connect' | 'disconnect';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes-requested';

export interface DiagramChange {
  id: string;
  type: ChangeType;
  entity: 'node' | 'edge';
  entityId: string;
  entityName: string;
  description: string;
  details: Record<string, unknown>;
  timestamp: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  risk: 'low' | 'medium' | 'high';
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  changes: DiagramChange[];
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  reviewers: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    reviewedAt?: Date;
  }>;
  requiredApprovals: number;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
  }>;
}

interface ChangeApprovalPanelProps {
  request: ApprovalRequest;
  currentUserId: string;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment: string) => void;
  onRequestChanges: (requestId: string, comment: string) => void;
  onAddComment: (requestId: string, comment: string) => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getChangeTypeIcon(type: ChangeType) {
  switch (type) {
    case 'add':
      return <span className="text-green-500 font-bold">+</span>;
    case 'delete':
      return <span className="text-red-500 font-bold">−</span>;
    case 'modify':
      return <span className="text-yellow-500 font-bold">~</span>;
    case 'connect':
      return <span className="text-blue-500">→</span>;
    case 'disconnect':
      return <span className="text-gray-500">✕</span>;
  }
}

function getRiskBadge(risk: 'low' | 'medium' | 'high') {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors[risk])}>
      {risk}
    </span>
  );
}

function getStatusBadge(status: ApprovalStatus) {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700', icon: Check },
    rejected: { color: 'bg-red-100 text-red-700', icon: X },
    'changes-requested': { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  };

  const { color, icon: Icon } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', color)}>
      <Icon className="h-3 w-3" />
      {status.replace('-', ' ')}
    </span>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================================================
// Change Item Component
// ============================================================================

function ChangeItem({ change }: { change: DiagramChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-3 bg-white">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {getChangeTypeIcon(change.type)}
          <span className="font-medium text-sm">{change.entityName}</span>
          <span className="text-xs text-gray-400 capitalize">{change.entity}</span>
        </div>
        <div className="flex items-center gap-2">
          {getRiskBadge(change.risk)}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">{change.description}</p>
          {Object.keys(change.details).length > 0 && (
            <div className="bg-gray-50 rounded p-2 text-xs font-mono">
              <pre>{JSON.stringify(change.details, null, 2)}</pre>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <User className="h-3 w-3" />
            {change.author.name}
            <span>•</span>
            {formatTimeAgo(change.timestamp)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reviewer Item Component
// ============================================================================

function ReviewerItem({
  reviewer,
}: {
  reviewer: ApprovalRequest['reviewers'][0];
}) {
  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    approved: <Check className="h-4 w-4 text-green-500" />,
    rejected: <X className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {reviewer.avatar ? (
          <img
            src={reviewer.avatar}
            alt={reviewer.name}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-500" />
          </div>
        )}
        <span className="text-sm">{reviewer.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {statusIcon[reviewer.status]}
        {reviewer.reviewedAt && (
          <span className="text-xs text-gray-400">
            {formatTimeAgo(reviewer.reviewedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ChangeApprovalPanel({
  request,
  currentUserId,
  onApprove,
  onReject,
  onRequestChanges,
  onAddComment,
  className,
}: ChangeApprovalPanelProps) {
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes' | 'comment'>('comment');

  const isReviewer = request.reviewers.some((r) => r.id === currentUserId);
  const hasReviewed = request.reviewers.find((r) => r.id === currentUserId)?.status !== 'pending';
  const approvalCount = request.reviewers.filter((r) => r.status === 'approved').length;
  const canMerge = approvalCount >= request.requiredApprovals && request.status === 'pending';

  const riskSummary = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    for (const change of request.changes) {
      counts[change.risk]++;
    }
    return counts;
  }, [request.changes]);

  const handleAction = useCallback(() => {
    switch (actionType) {
      case 'approve':
        onApprove(request.id, comment || undefined);
        break;
      case 'reject':
        if (comment) onReject(request.id, comment);
        break;
      case 'changes':
        if (comment) onRequestChanges(request.id, comment);
        break;
      case 'comment':
        if (comment) onAddComment(request.id, comment);
        break;
    }
    setComment('');
    setShowCommentBox(false);
  }, [actionType, comment, request.id, onApprove, onReject, onRequestChanges, onAddComment]);

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold">{request.title}</h2>
          </div>
          {getStatusBadge(request.status)}
        </div>
        <p className="text-sm text-gray-600">{request.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {request.author.name}
          </span>
          <span>{formatTimeAgo(request.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {approvalCount}/{request.requiredApprovals} approvals
          </span>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="p-3 border-b bg-white flex items-center gap-4 text-xs">
        <span className="text-gray-500">Risk breakdown:</span>
        <span className="text-green-600">{riskSummary.low} low</span>
        <span className="text-yellow-600">{riskSummary.medium} medium</span>
        <span className="text-red-600">{riskSummary.high} high</span>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          Changes ({request.changes.length})
        </h3>
        <div className="space-y-2">
          {request.changes.map((change) => (
            <ChangeItem key={change.id} change={change} />
          ))}
        </div>

        {/* Reviewers */}
        <h3 className="text-sm font-medium mt-6 mb-3">Reviewers</h3>
        <div className="bg-white rounded-lg border p-3">
          {request.reviewers.map((reviewer) => (
            <ReviewerItem key={reviewer.id} reviewer={reviewer} />
          ))}
        </div>

        {/* Comments */}
        {request.comments.length > 0 && (
          <>
            <h3 className="text-sm font-medium mt-6 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({request.comments.length})
            </h3>
            <div className="space-y-2">
              {request.comments.map((c) => (
                <div key={c.id} className="bg-white rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{c.author}</span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(c.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Bar */}
      {isReviewer && !hasReviewed && request.status === 'pending' && (
        <div className="p-4 border-t bg-white">
          {showCommentBox ? (
            <div className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Optional comment...'
                    : 'Please provide feedback...'
                }
                className="w-full h-20 p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCommentBox(false);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAction}
                  disabled={
                    (actionType === 'reject' || actionType === 'changes') &&
                    !comment
                  }
                  className={cn(
                    actionType === 'approve' && 'bg-green-600 hover:bg-green-700',
                    actionType === 'reject' && 'bg-red-600 hover:bg-red-700',
                    actionType === 'changes' && 'bg-orange-600 hover:bg-orange-700'
                  )}
                >
                  {actionType === 'approve' && 'Approve'}
                  {actionType === 'reject' && 'Reject'}
                  {actionType === 'changes' && 'Request Changes'}
                  {actionType === 'comment' && 'Comment'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setActionType('comment');
                  setShowCommentBox(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Comment
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-orange-600 hover:text-orange-700"
                onClick={() => {
                  setActionType('changes');
                  setShowCommentBox(true);
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Request Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={() => {
                  setActionType('reject');
                  setShowCommentBox(true);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setActionType('approve');
                  setShowCommentBox(true);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Merge Button */}
      {canMerge && request.author.id === currentUserId && (
        <div className="p-4 border-t bg-green-50">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <GitBranch className="h-4 w-4 mr-2" />
            Merge Changes
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Hook for Change Detection
// ============================================================================

export function useChangeDetection(
  previousNodes: Node[],
  previousEdges: Edge[],
  currentNodes: Node[],
  currentEdges: Edge[]
): DiagramChange[] {
  return useMemo(() => {
    const changes: DiagramChange[] = [];
    const prevNodeMap = new Map(previousNodes.map((n) => [n.id, n]));
    const currNodeMap = new Map(currentNodes.map((n) => [n.id, n]));
    const prevEdgeMap = new Map(previousEdges.map((e) => [e.id, e]));
    const currEdgeMap = new Map(currentEdges.map((e) => [e.id, e]));

    // Detect node changes
    for (const node of currentNodes) {
      if (!prevNodeMap.has(node.id)) {
        changes.push({
          id: `change-${Date.now()}-${node.id}`,
          type: 'add',
          entity: 'node',
          entityId: node.id,
          entityName: (node.data?.label as string) || node.id,
          description: `Added new ${node.type || 'node'}`,
          details: { type: node.type, position: node.position },
          timestamp: new Date(),
          author: { id: 'current-user', name: 'You' },
          risk: node.type === 'vpc' || node.type === 'vnet' ? 'high' : 'low',
        });
      } else {
        const prevNode = prevNodeMap.get(node.id)!;
        if (JSON.stringify(prevNode) !== JSON.stringify(node)) {
          changes.push({
            id: `change-${Date.now()}-${node.id}`,
            type: 'modify',
            entity: 'node',
            entityId: node.id,
            entityName: (node.data?.label as string) || node.id,
            description: `Modified ${node.type || 'node'} configuration`,
            details: { before: prevNode.data, after: node.data },
            timestamp: new Date(),
            author: { id: 'current-user', name: 'You' },
            risk: 'medium',
          });
        }
      }
    }

    for (const node of previousNodes) {
      if (!currNodeMap.has(node.id)) {
        changes.push({
          id: `change-${Date.now()}-${node.id}`,
          type: 'delete',
          entity: 'node',
          entityId: node.id,
          entityName: (node.data?.label as string) || node.id,
          description: `Removed ${node.type || 'node'}`,
          details: { type: node.type },
          timestamp: new Date(),
          author: { id: 'current-user', name: 'You' },
          risk: 'high',
        });
      }
    }

    // Detect edge changes
    for (const edge of currentEdges) {
      if (!prevEdgeMap.has(edge.id)) {
        changes.push({
          id: `change-${Date.now()}-${edge.id}`,
          type: 'connect',
          entity: 'edge',
          entityId: edge.id,
          entityName: `${edge.source} → ${edge.target}`,
          description: 'Created new connection',
          details: { source: edge.source, target: edge.target },
          timestamp: new Date(),
          author: { id: 'current-user', name: 'You' },
          risk: 'low',
        });
      }
    }

    for (const edge of previousEdges) {
      if (!currEdgeMap.has(edge.id)) {
        changes.push({
          id: `change-${Date.now()}-${edge.id}`,
          type: 'disconnect',
          entity: 'edge',
          entityId: edge.id,
          entityName: `${edge.source} → ${edge.target}`,
          description: 'Removed connection',
          details: { source: edge.source, target: edge.target },
          timestamp: new Date(),
          author: { id: 'current-user', name: 'You' },
          risk: 'medium',
        });
      }
    }

    return changes;
  }, [previousNodes, previousEdges, currentNodes, currentEdges]);
}

export default ChangeApprovalPanel;
