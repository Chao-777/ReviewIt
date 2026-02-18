import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, ItemSummary } from '../api/client'
import StarRating from '../components/StarRating'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string; icon: string | null; itemCount: number }>>([])
  const [featured, setFeatured] = useState<ItemSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.categories.list(),
      api.items.list({ sort: 'best', pageSize: 8 }),
    ])
      .then(([catRes, items]) => {
        setCategories(catRes.categories)
        setFeatured(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Loading…</div>

  return (
    <div className="home">
      <h1 className="home-title">Rate &amp; review anything</h1>
      <p className="home-subtitle">Pick a category to explore, or use the search bar above.</p>
      <div className="category-grid">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="category-card"
            onClick={() => navigate(`/category/${c.id}`)}
          >
            <span className="category-icon">{c.icon ?? '📁'}</span>
            <span className="category-name">{c.name}</span>
            <span className="category-count">{c.itemCount} items</span>
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <section className="home-featured">
          <h2 className="home-featured-title">Featured</h2>
          <p className="home-featured-subtitle">Top-rated items across all categories</p>
          <div className="home-featured-grid">
            {featured.map((item) => (
              <Link key={item.id} to={`/item/${item.id}`} className="home-item-card">
                <div className="home-item-card-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" />
                  ) : (
                    <div className="home-item-card-placeholder">📦</div>
                  )}
                </div>
                <div className="home-item-card-body">
                  <h3 className="home-item-card-name">{item.name}</h3>
                  <span className="home-item-card-category">{item.categoryName}</span>
                  <div className="home-item-card-meta">
                    <StarRating value={Math.round(item.averageStars)} size="sm" />
                    <span>{item.averageStars.toFixed(1)}</span>
                    <span>·</span>
                    <span>{item.reviewCount} reviews</span>
                  </div>
                  {item.mostPopularReviewSnippet && (
                    <p className="home-item-card-snippet">{item.mostPopularReviewSnippet}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
