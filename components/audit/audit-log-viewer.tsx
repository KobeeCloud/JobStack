'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Activity,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'share'
  | 'login'
  | 'logout'
  | 'permission_change'
  | 'settings_change'
  | 'api_call';

export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  status: AuditStatus;
  user: {
    id: string;
    email: string;
    name: string;
    ipAddress?: string;
    userAgent?: string;
  };
  resource: {
    type: 'diagram' | 'node' | 'edge' | 'user' | 'team' | 'settings' | 'api_key';
    id: string;
    name?: string;
  };
  details: {
    description: string;
    changes?: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
    metadata?: Record<string, unknown>;
  };
  location?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  actions?: AuditAction[];
  severity?: AuditSeverity[];
  status?: AuditStatus[];
  userId?: string;
  resourceType?: string;
  searchQuery?: string;
}

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onExport?: (filters: AuditFilters) => void;
  onRefresh?: () => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Created',
  read: 'Viewed',
  update: 'Updated',
  delete: 'Deleted',
  export: 'Exported',
  import: 'Imported',
  share: 'Shared',
  login: 'Logged in',
  logout: 'Logged out',
  permission_change: 'Changed permissions',
  settings_change: 'Changed settings',
  api_call: 'API call',
};

const SEVERITY_CONFIG: Record<
  AuditSeverity,
  { icon: typeof Info; color: string; bgColor: string }
> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  critical: { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
};

const STATUS_CONFIG: Record<
  AuditStatus,
  { icon: typeof CheckCircle; color: string }
> = {
  success: { icon: CheckCircle, color: 'text-green-500' },
  failure: { icon: XCircle, color: 'text-red-500' },
  pending: { icon: Clock, color: 'text-yellow-500' },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatTimestamp(date);
}

// ============================================================================
// Log Entry Component
// ============================================================================

function AuditLogEntryItem({
  entry,
  expanded,
  onToggle,
}: {
  entry: AuditLogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severityConfig = SEVERITY_CONFIG[entry.severity];
  const statusConfig = STATUS_CONFIG[entry.status];
  const SeverityIcon = severityConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'border rounded-lg transition-all',
        expanded ? 'shadow-md' : 'hover:shadow-sm'
      )}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Severity Icon */}
        <div className={cn('p-2 rounded-lg', severityConfig.bgColor)}>
          <SeverityIcon className={cn('h-4 w-4', severityConfig.color)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {ACTION_LABELS[entry.action]}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600 truncate">
              {entry.resource.name || entry.resource.id}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              ({entry.resource.type})
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {entry.user.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(entry.timestamp)}
            </span>
            {entry.user.ipAddress && (
              <span className="text-gray-400">{entry.user.ipAddress}</span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          <div className="pt-4 space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">
                Description
              </h4>
              <p className="text-sm">{entry.details.description}</p>
            </div>

            {/* Changes */}
            {entry.details.changes && entry.details.changes.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Changes
                </h4>
                <div className="bg-white rounded border divide-y">
                  {entry.details.changes.map((change, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-2 text-sm"
                    >
                      <span className="font-medium text-gray-700 w-32 truncate">
                        {change.field}
                      </span>
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs line-through">
                        {JSON.stringify(change.oldValue)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
                        {JSON.stringify(change.newValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">
                  User Details
                </h4>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    {entry.user.email}
                  </p>
                  <p>
                    <span className="text-gray-500">IP:</span>{' '}
                    {entry.user.ipAddress || 'N/A'}
                  </p>
                  {entry.user.userAgent && (
                    <p className="truncate">
                      <span className="text-gray-500">Agent:</span>{' '}
                      {entry.user.userAgent}
                    </p>
                  )}
                </div>
              </div>
              {entry.location && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">
                    Location
                  </h4>
                  <div className="text-xs">
                    <p>
                      {entry.location.city && `${entry.location.city}, `}
                      {entry.location.country || 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-400 pt-2 border-t">
              Full timestamp: {formatTimestamp(entry.timestamp)} • Entry ID:{' '}
              {entry.id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Filter Panel
// ============================================================================

function FilterPanel({
  filters,
  onFilterChange,
  onClear,
}: {
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  onClear: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Severity */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Severity</label>
          <select
            className="w-full h-9 px-2 border rounded text-sm"
            value={filters.severity?.[0] || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                severity: e.target.value
                  ? [e.target.value as AuditSeverity]
                  : undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <select
            className="w-full h-9 px-2 border rounded text-sm"
            value={filters.status?.[0] || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value
                  ? [e.target.value as AuditStatus]
                  : undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Action</label>
          <select
            className="w-full h-9 px-2 border rounded text-sm"
            value={filters.actions?.[0] || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                actions: e.target.value
                  ? [e.target.value as AuditAction]
                  : undefined,
              })
            }
          >
            <option value="">All</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Resource</label>
          <select
            className="w-full h-9 px-2 border rounded text-sm"
            value={filters.resourceType || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                resourceType: e.target.value || undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="diagram">Diagrams</option>
            <option value="node">Nodes</option>
            <option value="edge">Edges</option>
            <option value="user">Users</option>
            <option value="team">Teams</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AuditLogViewer({
  logs,
  onExport,
  onRefresh,
  className,
}: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AuditFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = [
          log.user.name,
          log.user.email,
          log.resource.name,
          log.details.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      // Severity filter
      if (filters.severity?.length && !filters.severity.includes(log.severity)) {
        return false;
      }

      // Status filter
      if (filters.status?.length && !filters.status.includes(log.status)) {
        return false;
      }

      // Action filter
      if (filters.actions?.length && !filters.actions.includes(log.action)) {
        return false;
      }

      // Resource type filter
      if (
        filters.resourceType &&
        log.resource.type !== filters.resourceType
      ) {
        return false;
      }

      // Date filter
      if (filters.startDate && log.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && log.timestamp > filters.endDate) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, filters]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    onExport?.({ ...filters, searchQuery });
  }, [onExport, filters, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const critical = filteredLogs.filter((l) => l.severity === 'critical').length;
    const failed = filteredLogs.filter((l) => l.status === 'failure').length;
    return { total: filteredLogs.length, critical, failed };
  }, [filteredLogs]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Logs
          </h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm mb-4">
          <span className="text-gray-500">
            <span className="font-medium text-gray-900">{stats.total}</span> entries
          </span>
          {stats.critical > 0 && (
            <span className="text-red-600">
              <span className="font-medium">{stats.critical}</span> critical
            </span>
          )}
          {stats.failed > 0 && (
            <span className="text-yellow-600">
              <span className="font-medium">{stats.failed}</span> failed
            </span>
          )}
        </div>

        {/* Search & Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onClear={() => setFilters({})}
            />
          </div>
        )}
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Eye className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No audit logs found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <AuditLogEntryItem
              key={entry.id}
              entry={entry}
              expanded={expandedIds.has(entry.id)}
              onToggle={() => toggleExpanded(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Export utility for CSV generation
// ============================================================================

export function exportLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = [
    'Timestamp',
    'Action',
    'Severity',
    'Status',
    'User',
    'Email',
    'IP Address',
    'Resource Type',
    'Resource ID',
    'Resource Name',
    'Description',
  ];

  const rows = logs.map((log) => [
    log.timestamp.toISOString(),
    log.action,
    log.severity,
    log.status,
    log.user.name,
    log.user.email,
    log.user.ipAddress || '',
    log.resource.type,
    log.resource.id,
    log.resource.name || '',
    log.details.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default AuditLogViewer;
