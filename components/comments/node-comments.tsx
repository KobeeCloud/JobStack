'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MessageSquare, Send, MoreVertical, Edit2, Trash2, 
  Reply, CheckCircle, AlertCircle, X, AtSign 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface Comment {
  id: string
  nodeId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  updatedAt?: Date
  resolved: boolean
  parentId?: string
  mentions?: string[]
}

interface NodeCommentsProps {
  nodeId: string
  nodeName: string
  comments: Comment[]
  currentUserId: string
  onAddComment: (nodeId: string, content: string, parentId?: string) => void
  onUpdateComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onResolveComment: (commentId: string, resolved: boolean) => void
  onClose: () => void
}

export function NodeComments({
  nodeId,
  nodeName,
  comments,
  currentUserId,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  onClose,
}: NodeCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const nodeComments = comments.filter(c => c.nodeId === nodeId)
  const visibleComments = showResolved 
    ? nodeComments 
    : nodeComments.filter(c => !c.resolved)

  // Group comments by parent
  const rootComments = visibleComments.filter(c => !c.parentId)
  const replies = visibleComments.filter(c => c.parentId)

  const handleSubmit = useCallback(() => {
    if (!newComment.trim()) return
    onAddComment(nodeId, newComment.trim(), replyingTo || undefined)
    setNewComment('')
    setReplyingTo(null)
  }, [newComment, nodeId, replyingTo, onAddComment])

  const handleEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editContent.trim()) return
    onUpdateComment(editingId, editContent.trim())
    setEditingId(null)
    setEditContent('')
  }, [editingId, editContent, onUpdateComment])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwn = comment.userId === currentUserId
    const isEditing = editingId === comment.id
    const commentReplies = replies.filter(r => r.parentId === comment.id)

    return (
      <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className={`p-3 rounded-lg ${comment.resolved ? 'bg-muted/30' : 'bg-muted/50'}`}>
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.userAvatar} />
              <AvatarFallback className="text-xs">
                {getInitials(comment.userName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
                {comment.updatedAt && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
                {comment.resolved && (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}

              {!isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  {!isReply && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  {!comment.resolved && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => onResolveComment(comment.id, true)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                  {comment.resolved && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => onResolveComment(comment.id, false)}
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Reopen
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isOwn && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(comment)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Replies */}
        {commentReplies.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="ml-8 mt-2 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Reply to ${comment.userName}...`}
              className="min-h-[60px]"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg">Comments</CardTitle>
            <Badge variant="secondary">{nodeComments.length}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          On: <strong>{nodeName}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {visibleComments.length} comments
            {!showResolved && nodeComments.some(c => c.resolved) && (
              <span> ({nodeComments.filter(c => c.resolved).length} resolved)</span>
            )}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? 'Hide resolved' : 'Show resolved'}
          </Button>
        </div>

        {/* Comments list */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-3 pr-4">
            {rootComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to comment</p>
              </div>
            ) : (
              rootComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* New comment input */}
        {!replyingTo && (
          <div className="flex gap-2 pt-2 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @mention to notify"
              className="min-h-[60px]"
            />
            <Button 
              size="icon" 
              onClick={handleSubmit} 
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook to manage comments
export function useComments(initialComments: Comment[] = []) {
  const [comments, setComments] = useState<Comment[]>(initialComments)

  const addComment = useCallback((nodeId: string, content: string, parentId?: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      nodeId,
      userId: 'current-user', // TODO: Get from auth
      userName: 'Current User',
      content,
      createdAt: new Date(),
      resolved: false,
      parentId,
    }
    setComments(prev => [...prev, newComment])
  }, [])

  const updateComment = useCallback((commentId: string, content: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, content, updatedAt: new Date() }
        : c
    ))
  }, [])

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId))
  }, [])

  const resolveComment = useCallback((commentId: string, resolved: boolean) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, resolved } : c
    ))
  }, [])

  const getCommentsForNode = useCallback((nodeId: string) => {
    return comments.filter(c => c.nodeId === nodeId)
  }, [comments])

  const getUnresolvedCount = useCallback((nodeId?: string) => {
    if (nodeId) {
      return comments.filter(c => c.nodeId === nodeId && !c.resolved).length
    }
    return comments.filter(c => !c.resolved).length
  }, [comments])

  return {
    comments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    getCommentsForNode,
    getUnresolvedCount,
  }
}
