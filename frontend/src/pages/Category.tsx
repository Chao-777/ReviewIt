import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { api, ItemSummary } from '../api/client'
import StarRating from '../components/StarRating'
import './Category.css'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'best', label: 'Best rated' },
  { value: 'worst', label: 'Worst rated' },
  { value: 'mostreviews', label: 'Most reviews' },
] as const

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const [items, setItems] = useState<ItemSummary[]>([])
  const [categoryName, setCategoryName] = useState<string>('')
  const [sort, setSort] = useState<string>('latest')
  const [loading, setLoading] = useState(true)

  const id = categoryId ? parseInt(categoryId, 10) : 0

  useEffect(() => {
    const catId = Number.isNaN(id) ? undefined : id
    if (catId === 0 && !search) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.items.list({
      categoryId: Number.isNaN(id) || id === 0 ? undefined : id,
      search: search || undefined,
      sort,
    }).then((list) => {
      setItems(list)
      setLoading(false)
    }).catch(() => setLoading(false))

    if (catId && !Number.isNaN(catId)) {
      api.categories.list().then((r) => {
        const c = r.categories.find((x) => x.id === catId)
        setCategoryName(c?.name ?? '')
      })
    } else if (search) {
      setCategoryName(`Search: "${search}"`)
    }
  }, [id, search, sort])

  if (loading && items.length === 0) return <div className="page-loading">Loading…</div>

  return (
    <div className="category-page">
      <h1 className="page-title">{categoryName || 'Items'}</h1>
      <div className="toolbar">
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
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
      {!loading && items.length === 0 && (
        <p className="empty-state">No items found. Try another category or search.</p>
      )}
    </div>
  )
}
