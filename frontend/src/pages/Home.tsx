import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string; icon: string | null; itemCount: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories.list().then((r) => {
      setCategories(r.categories)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Loading categories…</div>

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
    </div>
  )
}
