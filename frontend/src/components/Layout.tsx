import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './Layout.css'

const NOTIFICATIONS_UPDATED = 'notifications-updated'

export function notifyUnreadCountUpdated() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED))
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, logout, isAuthenticated } = useAuth()
  const q = searchParams.get('q') ?? ''
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = () => {
    if (!isAuthenticated) return
    api.notifications
      .list(true)
      .then((list) => setUnreadCount(list.length))
      .catch(() => setUnreadCount(0))
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchUnreadCount()
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount()
  }, [location.pathname, isAuthenticated])

  useEffect(() => {
    const handler = () => fetchUnreadCount()
    window.addEventListener(NOTIFICATIONS_UPDATED, handler)
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED, handler)
  }, [isAuthenticated])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[name="q"]')
    const v = input?.value?.trim()
    if (v) {
      navigate(`/search?q=${encodeURIComponent(v)}`)
    }
  }

  const closeDropdown = () => setDropdownOpen(false)

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
              <button type="button" className="nav-link" onClick={() => navigate('/create-item')}>
                Create item
              </button>
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-dropdown-trigger"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Account menu'}
                >
                  <span className="user-dropdown-name">{user?.name}</span>
                  {unreadCount > 0 && (
                    <span className="user-dropdown-trigger-badge" aria-label={`${unreadCount} unread`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  <span className="user-dropdown-chevron" aria-hidden>▼</span>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown-menu" role="menu">
                    <button
                      type="button"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        closeDropdown()
                        navigate('/notifications')
                      }}
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="user-dropdown-badge" aria-label={`${unreadCount} unread`}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="user-dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        closeDropdown()
                        logout()
                      }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="nav-guest-icon" aria-hidden>👤</span>
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
