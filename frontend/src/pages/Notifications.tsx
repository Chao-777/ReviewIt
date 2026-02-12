import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Notification } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { notifyUnreadCountUpdated } from '../notifications'
import './Notifications.css'

export default function Notifications() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setError(null)
    api.notifications
      .list()
      .then(setList)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load notifications')
        setList([])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const markRead = async (id: number) => {
    try {
      await api.notifications.markRead(id)
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      notifyUnreadCountUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })))
      notifyUnreadCountUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark all as read')
    }
  }

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      await api.notifications.deleteSelected(ids)
      setList((prev) => prev.filter((n) => !ids.includes(n.id)))
      setSelectedIds(new Set())
      notifyUnreadCountUpdated()
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete notifications')
    }
  }

  const goToItem = (n: Notification) => {
    if (n.relatedItemId) navigate(`/item/${n.relatedItemId}`)
  }

  const handleItemClick = (n: Notification) => {
    markRead(n.id)
    goToItem(n)
  }

  if (!isAuthenticated) return null

  if (loading) return <div className="page-loading">Loading notifications…</div>

  const hasUnread = list.some((n) => !n.isRead)
  const hasSelection = selectedIds.size > 0

  return (
    <div className="notifications-page">
      {error && (
        <div className="notifications-error" role="alert">
          {error}
        </div>
      )}
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={markAllRead}
            disabled={!hasUnread}
          >
            Mark all read
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={deleteSelected}
            disabled={!hasSelection}
          >
            Delete selected {hasSelection ? `(${selectedIds.size})` : ''}
          </button>
        </div>
      </div>
      <ul className="notifications-list">
        {list.map((n) => (
          <li
            key={n.id}
            className={`notification-item ${n.isRead ? 'read' : 'unread'} ${selectedIds.has(n.id) ? 'selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => handleItemClick(n)}
            onKeyDown={(e) => e.key === 'Enter' && handleItemClick(n)}
          >
            <input
              type="checkbox"
              className="notification-checkbox"
              checked={selectedIds.has(n.id)}
              onChange={() => {}}
              onClick={(e) => toggleSelect(n.id, e)}
              aria-label={`Select notification`}
            />
            <div className="notification-body">
              <span className="notification-type">{formatType(n.type)}</span>
              {n.fromUserName && <span className="notification-from">{n.fromUserName}</span>}
              <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <p className="empty-state">No notifications yet.</p>
      )}
    </div>
  )
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    CommentOnReview: '💬 commented on your review',
    ThumbUpOnReview: '👍 liked your review',
    ThumbDownOnReview: '👎 reacted to your review',
    ReplyOnComment: '💬 replied to your comment',
  }
  return map[type] ?? type
}
