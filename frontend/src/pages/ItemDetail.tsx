import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, ItemDetail as ItemDetailType, ReviewCard } from '../api/client'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import './ItemDetail.css'

const REVIEW_SORT = [
  { value: 'thumbs', label: 'Most helpful' },
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'best', label: 'Best rated' },
  { value: 'worst', label: 'Worst rated' },
] as const

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const id = parseInt(itemId ?? '0', 10)
  const [item, setItem] = useState<ItemDetailType | null>(null)
  const [reviews, setReviews] = useState<ReviewCard[]>([])
  const [sort, setSort] = useState('thumbs')
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState<Record<number, string>>({})
  const [writingReview, setWritingReview] = useState(false)
  const [newReviewStars, setNewReviewStars] = useState(5)
  const [newReviewContent, setNewReviewContent] = useState('')

  const loadItem = () => {
    if (!id) return
    api.items.get(id).then(setItem).catch(() => setItem(null))
  }
  const loadReviews = () => {
    if (!id) return
    api.reviews.list(id, { sort }).then(setReviews)
  }

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setLoading(false)
      return
    }
    setLoading(true)
    loadItem()
    setLoading(false)
  }, [id])

  useEffect(() => {
    if (id && !Number.isNaN(id)) loadReviews()
  }, [id, sort])

  const handleThumb = async (reviewId: number, isUp: boolean) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      await api.reviews.reaction(reviewId, isUp)
      loadReviews()
    } catch (e) {
      console.error(e)
    }
  }

  const handleComment = async (reviewId: number) => {
    const text = commentText[reviewId]?.trim()
    if (!text || !isAuthenticated) {
      if (!isAuthenticated) navigate('/login')
      return
    }
    try {
      await api.comments.create(reviewId, text)
      setCommentText((prev) => ({ ...prev, [reviewId]: '' }))
      loadReviews()
      const r = reviews.find((x) => x.id === reviewId)
      if (r) api.comments.list(reviewId).then(() => {})
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!newReviewContent.trim()) return
    try {
      await api.reviews.create({ itemId: id, stars: newReviewStars, content: newReviewContent.trim() })
      setWritingReview(false)
      setNewReviewContent('')
      setNewReviewStars(5)
      loadItem()
      loadReviews()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading && !item) return <div className="page-loading">Loading…</div>
  if (!item) return <div className="page-loading">Item not found.</div>

  return (
    <div className="item-detail">
      <div className="item-detail-hero">
        <div className="item-detail-image">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" />
          ) : (
            <div className="item-detail-placeholder">📦</div>
          )}
        </div>
        <div className="item-detail-info">
          <h1 className="item-detail-name">{item.name}</h1>
          <p className="item-detail-category">{item.categoryName}</p>
          {item.description && <p className="item-detail-desc">{item.description}</p>}
          <div className="item-detail-meta">
            <StarRating value={Math.round(item.averageStars)} size="md" />
            <span>{item.averageStars.toFixed(1)}</span>
            <span>·</span>
            <span>{item.reviewCount} reviews</span>
          </div>
          {isAuthenticated && (
            <button type="button" className="btn-primary" onClick={() => setWritingReview(true)}>
              Write a review
            </button>
          )}
        </div>
      </div>

      {writingReview && (
        <div className="review-form-card">
          <h3>Your review</h3>
          <div className="review-form-stars">
            <span className="label">Rating:</span>
            <StarRating value={newReviewStars} max={5} interactive onChange={setNewReviewStars} />
          </div>
          <textarea
            placeholder="Share your experience…"
            value={newReviewContent}
            onChange={(e) => setNewReviewContent(e.target.value)}
            rows={4}
            className="review-form-textarea"
          />
          <div className="review-form-actions">
            <button type="button" className="btn-secondary" onClick={() => setWritingReview(false)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={handleSubmitReview} disabled={!newReviewContent.trim()}>
              Submit
            </button>
          </div>
        </div>
      )}

      <div className="reviews-section">
        <div className="toolbar">
          <h2>Reviews</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
            {REVIEW_SORT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-card-header">
              <StarRating value={r.stars} size="sm" />
              <span className="review-author">{r.userName}</span>
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="review-content">{r.content}</p>
            <div className="review-actions">
              <button
                type="button"
                className={`thumb-btn ${r.currentUserReaction === 1 ? 'active' : ''}`}
                onClick={() => handleThumb(r.id, true)}
                title="Thumbs up"
              >
                👍 {r.thumbsUp}
              </button>
              <button
                type="button"
                className={`thumb-btn ${r.currentUserReaction === -1 ? 'active' : ''}`}
                onClick={() => handleThumb(r.id, false)}
                title="Thumbs down"
              >
                👎 {r.thumbsDown}
              </button>
            </div>
            <div className="comments-block">
              <CommentsList reviewId={r.id} />
              {isAuthenticated && (
                <div className="comment-input-row">
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={commentText[r.id] ?? ''}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(r.id)}
                    className="comment-input"
                  />
                  <button type="button" className="btn-small" onClick={() => handleComment(r.id)}>Reply</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {reviews.length === 0 && !writingReview && (
          <p className="empty-state">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  )
}

function CommentsList({ reviewId }: { reviewId: number }) {
  const [comments, setComments] = useState<Array<{ id: number; userName: string; content: string; createdAt: string }>>([])
  useEffect(() => {
    api.comments.list(reviewId).then(setComments)
  }, [reviewId])
  if (comments.length === 0) return null
  return (
    <ul className="comments-list">
      {comments.map((c) => (
        <li key={c.id} className="comment-item">
          <strong>{c.userName}</strong>: {c.content}
          <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  )
}
