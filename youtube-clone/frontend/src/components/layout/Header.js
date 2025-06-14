"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Header.css"
import { useAuth } from "../../context/AuthContext"

function Header() {
  const [searchInput, setSearchInput] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput.trim())}`)
      setSearchInput("")
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__icon-button">
          <span>☰</span>
        </button>
        <Link to="/" className="header__logo">
          <span className="header__logo-text">YouTube</span>
        </Link>
      </div>

      <div className="header__center">
        <form className="header__search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="header__search-input"
          />
          <button type="submit" className="header__search-button">
            🔍
          </button>
        </form>
        <button className="header__mic-button">🎤</button>
      </div>

      <div className="header__right">
        {currentUser ? (
          <>
            <Link to="/upload" className="header__icon-button">
              ➕
            </Link>
            <button className="header__icon-button">🔔</button>
            <div className="header__user-menu">
              <button className="header__avatar-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                <img
                  src={currentUser.profilePicture || "/placeholder.svg?height=32&width=32"}
                  alt="Avatar"
                  className="header__avatar"
                />
              </button>

              {showUserMenu && (
                <div className="header__user-dropdown">
                  <div className="header__user-info">
                    <img
                      src={currentUser.profilePicture || "/placeholder.svg?height=40&width=40"}
                      alt="Avatar"
                      className="header__dropdown-avatar"
                    />
                    <div>
                      <p className="header__user-name">{currentUser.username}</p>
                      <p className="header__user-email">{currentUser.email}</p>
                    </div>
                  </div>
                  <Link to={`/channel/${currentUser.id}`} className="header__dropdown-item">
                    Your channel
                  </Link>
                  <Link to="/studio" className="header__dropdown-item">
                    YouTube Studio
                  </Link>
                  <button onClick={handleLogout} className="header__dropdown-item header__logout">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="header__sign-in">
            <span className="header__sign-in-icon">👤</span>
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
