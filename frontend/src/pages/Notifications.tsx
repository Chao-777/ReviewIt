import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Notification } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Notifications.css'

export default function Notifications() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    api.notifications.list().then(setList).finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const markRead = async (id: number) => {
    await api.notifications.markRead(id)
    setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllRead = async () => {
    await api.notifications.markAllRead()
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const goToItem = (n: Notification) => {
    if (n.relatedItemId) navigate(`/item/${n.relatedItemId}`)
  }

  if (!isAuthenticated) return null

  if (loading) return <div className="page-loading">Loading notifications…</div>

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {list.some((n) => !n.isRead) && (
          <button type="button" className="btn-secondary" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>
      <ul className="notifications-list">
        {list.map((n) => (
          <li
            key={n.id}
            className={`notification-item ${n.isRead ? '' : 'unread'}`}
            role="button"
            tabIndex={0}
            onClick={() => { markRead(n.id); goToItem(n); }}
            onKeyDown={(e) => e.key === 'Enter' && (markRead(n.id), goToItem(n))}
          >
            <span className="notification-type">{formatType(n.type)}</span>
            {n.fromUserName && <span className="notification-from">{n.fromUserName}</span>}
            <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
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
