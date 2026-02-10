import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './CreateItem.css'

export default function CreateItem() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    api.categories.list().then((r) => {
      setCategories(r.categories)
      if (r.categories.length > 0)
        setCategoryId((prev) => prev || r.categories[0].id)
    })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }
    setError('')
    setLoading(true)
    try {
      const item = await api.items.create({
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        categoryId,
      })
      navigate(`/item/${item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="create-item-page">
      <h1>Create an item</h1>
      <form className="create-item-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label>
          Name <span className="required">*</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pizza Margherita"
            required
          />
        </label>
        <label>
          Category <span className="required">*</span>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Description <span className="muted">(optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the item"
            rows={3}
          />
        </label>
        <label>
          Image URL <span className="muted">(optional)</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create item'}
          </button>
        </div>
      </form>
    </div>
  )
}
