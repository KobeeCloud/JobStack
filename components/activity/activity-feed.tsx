'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity, Plus, Trash2, Edit2, Link, Unlink, 
  Save, Share2, Download, Upload, Eye, Search,
  Filter, X, Clock, User, GitCommit
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export type ActivityType = 
  | 'node_added'
  | 'node_deleted'
  | 'node_updated'
  | 'edge_added'
  | 'edge_deleted'
  | 'diagram_saved'
  | 'diagram_shared'
  | 'diagram_exported'
  | 'diagram_imported'
  | 'version_saved'
  | 'version_restored'
  | 'comment_added'
  | 'comment_resolved'
  | 'collaborator_joined'
  | 'collaborator_left'

export interface ActivityEvent {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar?: string
  timestamp: Date
  details: {
    nodeId?: string
    nodeName?: string
    nodeType?: string
    edgeId?: string
    sourceName?: string
    targetName?: string
    versionName?: string
    format?: string
    message?: string
  }
}

interface ActivityFeedProps {
  activities: ActivityEvent[]
  onClose: () => void
}

const activityIcons: Record<ActivityType, typeof Plus> = {
  node_added: Plus,
  node_deleted: Trash2,
  node_updated: Edit2,
  edge_added: Link,
  edge_deleted: Unlink,
  diagram_saved: Save,
  diagram_shared: Share2,
  diagram_exported: Download,
  diagram_imported: Upload,
  version_saved: GitCommit,
  version_restored: GitCommit,
  comment_added: Activity,
  comment_resolved: Activity,
  collaborator_joined: User,
  collaborator_left: User,
}

const activityColors: Record<ActivityType, string> = {
  node_added: 'bg-green-500/10 text-green-600',
  node_deleted: 'bg-red-500/10 text-red-600',
  node_updated: 'bg-blue-500/10 text-blue-600',
  edge_added: 'bg-purple-500/10 text-purple-600',
  edge_deleted: 'bg-orange-500/10 text-orange-600',
  diagram_saved: 'bg-blue-500/10 text-blue-600',
  diagram_shared: 'bg-purple-500/10 text-purple-600',
  diagram_exported: 'bg-cyan-500/10 text-cyan-600',
  diagram_imported: 'bg-cyan-500/10 text-cyan-600',
  version_saved: 'bg-yellow-500/10 text-yellow-600',
  version_restored: 'bg-yellow-500/10 text-yellow-600',
  comment_added: 'bg-gray-500/10 text-gray-600',
  comment_resolved: 'bg-green-500/10 text-green-600',
  collaborator_joined: 'bg-green-500/10 text-green-600',
  collaborator_left: 'bg-orange-500/10 text-orange-600',
}

function getActivityMessage(activity: ActivityEvent): string {
  const { type, details } = activity
  
  switch (type) {
    case 'node_added':
      return `added ${details.nodeType || 'component'} "${details.nodeName}"`
    case 'node_deleted':
      return `deleted ${details.nodeType || 'component'} "${details.nodeName}"`
    case 'node_updated':
      return `updated "${details.nodeName}"`
    case 'edge_added':
      return `connected "${details.sourceName}" to "${details.targetName}"`
    case 'edge_deleted':
      return `disconnected "${details.sourceName}" from "${details.targetName}"`
    case 'diagram_saved':
      return 'saved the diagram'
    case 'diagram_shared':
      return `shared the diagram${details.message ? `: "${details.message}"` : ''}`
    case 'diagram_exported':
      return `exported diagram as ${details.format || 'file'}`
    case 'diagram_imported':
      return `imported diagram from ${details.format || 'file'}`
    case 'version_saved':
      return `saved version "${details.versionName}"`
    case 'version_restored':
      return `restored version "${details.versionName}"`
    case 'comment_added':
      return `commented on "${details.nodeName}"`
    case 'comment_resolved':
      return `resolved comment on "${details.nodeName}"`
    case 'collaborator_joined':
      return 'joined the diagram'
    case 'collaborator_left':
      return 'left the diagram'
    default:
      return 'performed an action'
  }
}

function groupActivitiesByDate(activities: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>()
  
  activities.forEach(activity => {
    let dateKey: string
    const date = new Date(activity.timestamp)
    
    if (isToday(date)) {
      dateKey = 'Today'
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday'
    } else {
      dateKey = format(date, 'MMMM d, yyyy')
    }
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(activity)
  })
  
  return groups
}

export function ActivityFeed({ activities, onClose }: ActivityFeedProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  const users = useMemo(() => {
    const userMap = new Map<string, { id: string; name: string }>()
    activities.forEach(a => {
      userMap.set(a.userId, { id: a.userId, name: a.userName })
    })
    return Array.from(userMap.values())
  }, [activities])

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = search === '' || 
        getActivityMessage(activity).toLowerCase().includes(search.toLowerCase()) ||
        activity.userName.toLowerCase().includes(search.toLowerCase())
      
      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesUser = userFilter === 'all' || activity.userId === userFilter
      
      return matchesSearch && matchesType && matchesUser
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [activities, search, typeFilter, userFilter])

  const groupedActivities = useMemo(() => {
    return groupActivitiesByDate(filteredActivities)
  }, [filteredActivities])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            <Badge variant="secondary">{activities.length}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Recent changes and updates to this diagram
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="node_added">Nodes Added</SelectItem>
                <SelectItem value="node_deleted">Nodes Deleted</SelectItem>
                <SelectItem value="node_updated">Nodes Updated</SelectItem>
                <SelectItem value="edge_added">Connections Added</SelectItem>
                <SelectItem value="edge_deleted">Connections Removed</SelectItem>
                <SelectItem value="diagram_saved">Saves</SelectItem>
                <SelectItem value="version_saved">Versions</SelectItem>
                <SelectItem value="comment_added">Comments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-6 pr-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activities found</p>
              </div>
            ) : (
              Array.from(groupedActivities.entries()).map(([dateKey, dateActivities]) => (
                <div key={dateKey}>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                    {dateKey}
                  </h3>
                  <div className="space-y-3">
                    {dateActivities.map(activity => {
                      const Icon = activityIcons[activity.type]
                      const color = activityColors[activity.type]
                      
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(activity.userName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {activity.userName}
                              </span>
                              <Badge variant="outline" className={`text-xs ${color}`}>
                                <Icon className="h-3 w-3 mr-1" />
                                {activity.type.split('_').join(' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getActivityMessage(activity)}
                            </p>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Hook to track activities
export function useActivityTracker() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])

  const trackActivity = useCallback((
    type: ActivityType,
    details: ActivityEvent['details'] = {}
  ) => {
    const activity: ActivityEvent = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId: 'current-user', // TODO: Get from auth
      userName: 'Current User',
      timestamp: new Date(),
      details,
    }
    
    setActivities(prev => [activity, ...prev])
    return activity
  }, [])

  const trackNodeAdded = useCallback((nodeId: string, nodeName: string, nodeType?: string) => {
    return trackActivity('node_added', { nodeId, nodeName, nodeType })
  }, [trackActivity])

  const trackNodeDeleted = useCallback((nodeId: string, nodeName: string, nodeType?: string) => {
    return trackActivity('node_deleted', { nodeId, nodeName, nodeType })
  }, [trackActivity])

  const trackNodeUpdated = useCallback((nodeId: string, nodeName: string) => {
    return trackActivity('node_updated', { nodeId, nodeName })
  }, [trackActivity])

  const trackEdgeAdded = useCallback((edgeId: string, sourceName: string, targetName: string) => {
    return trackActivity('edge_added', { edgeId, sourceName, targetName })
  }, [trackActivity])

  const trackEdgeDeleted = useCallback((edgeId: string, sourceName: string, targetName: string) => {
    return trackActivity('edge_deleted', { edgeId, sourceName, targetName })
  }, [trackActivity])

  const trackDiagramSaved = useCallback(() => {
    return trackActivity('diagram_saved')
  }, [trackActivity])

  const trackVersionSaved = useCallback((versionName: string) => {
    return trackActivity('version_saved', { versionName })
  }, [trackActivity])

  const trackExport = useCallback((format: string) => {
    return trackActivity('diagram_exported', { format })
  }, [trackActivity])

  return {
    activities,
    trackActivity,
    trackNodeAdded,
    trackNodeDeleted,
    trackNodeUpdated,
    trackEdgeAdded,
    trackEdgeDeleted,
    trackDiagramSaved,
    trackVersionSaved,
    trackExport,
    setActivities,
  }
}
