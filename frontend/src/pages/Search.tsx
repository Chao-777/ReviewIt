import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api, ItemSummary } from '../api/client'
import StarRating from '../components/StarRating'
import './Category.css'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'best', label: 'Best rated' },
  { value: 'worst', label: 'Worst rated' },
  { value: 'mostreviews', label: 'Most reviews' },
] as const

export default function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [items, setItems] = useState<ItemSummary[]>([])
  const [sort, setSort] = useState<string>('latest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q.trim()) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    api.items.list({ search: q.trim(), sort })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [q, sort])

  if (!q.trim()) {
    return (
      <div className="category-page">
        <h1 className="page-title">Search</h1>
        <p className="empty-state">Enter a term in the search bar above.</p>
      </div>
    )
  }

  return (
    <div className="category-page">
      <h1 className="page-title">Search: &ldquo;{q}&rdquo;</h1>
      <div className="toolbar">
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {loading && items.length === 0 ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <Link key={item.id} to={`/item/${item.id}`} className="item-card">
              <div className="item-card-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" />
                ) : (
                  <div className="item-card-placeholder">📦</div>
                )}
              </div>
              <div className="item-card-body">
                <h3 className="item-card-name">{item.name}</h3>
                <div className="item-card-meta">
                  <StarRating value={Math.round(item.averageStars)} size="sm" />
                  <span>{item.averageStars.toFixed(1)}</span>
                  <span>·</span>
                  <span>{item.reviewCount} reviews</span>
                </div>
                {item.mostPopularReviewSnippet && (
                  <p className="item-card-snippet">{item.mostPopularReviewSnippet}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <p className="empty-state">No items found for &ldquo;{q}&rdquo;.</p>
      )}
    </div>
  )
}
