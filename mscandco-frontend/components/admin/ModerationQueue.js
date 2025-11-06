'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Music,
  User,
  Image as ImageIcon,
  MessageSquare,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CONTENT_TYPE_ICONS = {
  release: Music,
  profile: User,
  image: ImageIcon,
  comment: MessageSquare,
  other: FileText
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  flagged: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-800'
}

export default function ModerationQueue() {
  const [queue, setQueue] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending,flagged')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    fetchQueue()
    fetchStats()
  }, [statusFilter, contentTypeFilter, priorityFilter])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: statusFilter
      })

      if (contentTypeFilter !== 'all') {
        params.append('contentType', contentTypeFilter)
      }

      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter)
      }

      const response = await fetch(`/api/admin/moderation/queue?${params}`)
      const result = await response.json()

      if (response.ok) {
        setQueue(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch moderation queue')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/moderation/stats')
      const result = await response.json()

      if (response.ok) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleApprove = async (moderationId) => {
    try {
      setProcessing(true)
      const response = await fetch('/api/admin/moderation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationId,
          notes: reviewNotes
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Remove from queue or update status
        setQueue(queue.filter(item => item.id !== moderationId))
        setSelectedItem(null)
        setReviewNotes('')
        fetchStats() // Refresh stats
      } else {
        alert(result.error || 'Failed to approve content')
      }
    } catch (err) {
      alert('Failed to approve content')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (moderationId) => {
    if (!rejectReason) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch('/api/admin/moderation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationId,
          reason: rejectReason,
          notes: reviewNotes
        })
      })

      const result = await response.json()

      if (response.ok) {
        setQueue(queue.filter(item => item.id !== moderationId))
        setSelectedItem(null)
        setReviewNotes('')
        setRejectReason('')
        fetchStats()
      } else {
        alert(result.error || 'Failed to reject content')
      }
    } catch (err) {
      alert('Failed to reject content')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.total_pending}</div>
              <p className="text-xs text-gray-500 mt-1">
                Avg. {formatDuration(stats.overview.avg_review_time_seconds)} review time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.overview.total_approved}
              </div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overview.total_rejected}
              </div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.moderator_performance.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active reviewers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending,flagged">Pending & Flagged</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="flagged">Flagged Only</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="release">Releases</SelectItem>
                  <SelectItem value="profile">Profiles</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
          <CardDescription>
            {queue.length} item{queue.length !== 1 ? 's' : ''} requiring review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading queue...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Queue is empty!</p>
              <p className="text-sm">All content has been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => {
                const ContentIcon = CONTENT_TYPE_ICONS[item.content_type] || FileText
                const isExpanded = selectedItem?.id === item.id

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <ContentIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge className={PRIORITY_COLORS[item.priority]}>
                              {item.priority}
                            </Badge>
                            <Badge className={STATUS_COLORS[item.status]}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline">{item.content_type}</Badge>
                          </div>

                          {item.content_details && item.content_type === 'release' && (
                            <div className="mb-2">
                              <h3 className="font-semibold text-lg">
                                {item.content_details.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                by {item.content_details.artist_name}
                              </p>
                            </div>
                          )}

                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Submitted by:</span>{' '}
                              {item.user?.name || item.user?.email || 'Unknown'}
                            </p>
                            <p>
                              <span className="font-medium">Submitted:</span>{' '}
                              {formatTimeAgo(item.created_at)}
                            </p>
                            {item.flag_reason && (
                              <p className="text-orange-600">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                <span className="font-medium">Flagged:</span> {item.flag_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(isExpanded ? null : item)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        {/* Content Preview */}
                        {item.content_details && item.content_type === 'release' && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Release Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Type:</span>{' '}
                                <span className="font-medium capitalize">
                                  {item.content_details.release_type}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Status:</span>{' '}
                                <span className="font-medium capitalize">
                                  {item.content_details.status}
                                </span>
                              </div>
                            </div>
                            {item.content_details.artwork_url && (
                              <div className="mt-4">
                                <img
                                  src={item.content_details.artwork_url}
                                  alt="Artwork"
                                  className="w-32 h-32 rounded-lg object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Review Notes */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Review Notes (Optional)
                          </label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>

                        {/* Rejection Reason */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rejection Reason (Required if rejecting)
                          </label>
                          <Select value={rejectReason} onValueChange={setRejectReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="copyright">Copyright Infringement</SelectItem>
                              <SelectItem value="explicit">Explicit Content</SelectItem>
                              <SelectItem value="quality">Quality Issues</SelectItem>
                              <SelectItem value="spam">Spam/Promotional</SelectItem>
                              <SelectItem value="guidelines">Violates Guidelines</SelectItem>
                              <SelectItem value="incomplete">Incomplete Information</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleApprove(item.id)}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>

                          <Button
                            onClick={() => handleReject(item.id)}
                            disabled={processing || !rejectReason}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>

                          <Button
                            onClick={() => {
                              setSelectedItem(null)
                              setReviewNotes('')
                              setRejectReason('')
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
