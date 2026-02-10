import { Outlet, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, logout, isAuthenticated } = useAuth()
  const q = searchParams.get('q') ?? ''

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[name="q"]')
    const v = input?.value?.trim()
    if (v) {
      navigate(`/search?q=${encodeURIComponent(v)}`)
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">Review It</Link>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            name="q"
            placeholder="Search anything…"
            defaultValue={q}
            className="search-input"
            aria-label="Search"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <button type="button" className="nav-link" onClick={() => navigate('/notifications')}>
                Notifications
              </button>
              <button type="button" className="nav-link" onClick={() => navigate('/create-item')}>
                Create item
              </button>
              <span className="nav-user">{user?.name}</span>
              <button type="button" className="nav-link" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="nav-link" onClick={() => navigate('/login')}>
                Log in
              </button>
              <button type="button" className="nav-link primary" onClick={() => navigate('/register')}>
                Sign up
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
