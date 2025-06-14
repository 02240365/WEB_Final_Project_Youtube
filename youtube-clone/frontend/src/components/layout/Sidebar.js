"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "./Sidebar.css"
import { useAuth } from "../../context/AuthContext"

function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const { currentUser } = useAuth()
  const location = useLocation()

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}>
      <div className="sidebar__section">
        <Link to="/" className={`sidebar__item ${isActive("/") ? "sidebar__item--active" : ""}`}>
          <span className="sidebar__icon">🏠</span>
          {expanded && <span className="sidebar__text">Home</span>}
        </Link>

        <Link to="/shorts" className={`sidebar__item ${isActive("/shorts") ? "sidebar__item--active" : ""}`}>
          <span className="sidebar__icon">⚡</span>
          {expanded && <span className="sidebar__text">Shorts</span>}
        </Link>

        <Link
          to="/subscriptions"
          className={`sidebar__item ${isActive("/subscriptions") ? "sidebar__item--active" : ""}`}
        >
          <span className="sidebar__icon">📺</span>
          {expanded && <span className="sidebar__text">Subscriptions</span>}
        </Link>
      </div>

      {expanded && currentUser && (
        <div className="sidebar__section">
          <h3 className="sidebar__heading">You</h3>

          <Link to="/channel/me" className={`sidebar__item ${isActive("/channel/me") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">👤</span>
            <span className="sidebar__text">Your channel</span>
          </Link>

          <Link to="/history" className={`sidebar__item ${isActive("/history") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">📜</span>
            <span className="sidebar__text">History</span>
          </Link>

          <Link
            to="/your-videos"
            className={`sidebar__item ${isActive("/your-videos") ? "sidebar__item--active" : ""}`}
          >
            <span className="sidebar__icon">🎬</span>
            <span className="sidebar__text">Your videos</span>
          </Link>

          <Link
            to="/watch-later"
            className={`sidebar__item ${isActive("/watch-later") ? "sidebar__item--active" : ""}`}
          >
            <span className="sidebar__icon">⏰</span>
            <span className="sidebar__text">Watch later</span>
          </Link>

          <Link
            to="/liked-videos"
            className={`sidebar__item ${isActive("/liked-videos") ? "sidebar__item--active" : ""}`}
          >
            <span className="sidebar__icon">👍</span>
            <span className="sidebar__text">Liked videos</span>
          </Link>
        </div>
      )}

      {expanded && (
        <div className="sidebar__section">
          <h3 className="sidebar__heading">Explore</h3>

          <Link to="/trending" className={`sidebar__item ${isActive("/trending") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">🔥</span>
            <span className="sidebar__text">Trending</span>
          </Link>

          <Link to="/music" className={`sidebar__item ${isActive("/music") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">🎵</span>
            <span className="sidebar__text">Music</span>
          </Link>

          <Link to="/gaming" className={`sidebar__item ${isActive("/gaming") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">🎮</span>
            <span className="sidebar__text">Gaming</span>
          </Link>

          <Link to="/news" className={`sidebar__item ${isActive("/news") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">📰</span>
            <span className="sidebar__text">News</span>
          </Link>

          <Link to="/sports" className={`sidebar__item ${isActive("/sports") ? "sidebar__item--active" : ""}`}>
            <span className="sidebar__icon">⚽</span>
            <span className="sidebar__text">Sports</span>
          </Link>
        </div>
      )}

      {expanded && !currentUser && (
        <div className="sidebar__section sidebar__sign-in-section">
          <p className="sidebar__sign-in-text">Sign in to like videos, comment, and subscribe.</p>
          <Link to="/login" className="sidebar__sign-in-button">
            <span className="sidebar__sign-in-icon">👤</span>
            Sign in
          </Link>
        </div>
      )}

      {expanded && (
        <div className="sidebar__footer">
          <div className="sidebar__footer-links">
            <a href="#" className="sidebar__footer-link">
              About
            </a>
            <a href="#" className="sidebar__footer-link">
              Press
            </a>
            <a href="#" className="sidebar__footer-link">
              Copyright
            </a>
            <a href="#" className="sidebar__footer-link">
              Contact
            </a>
            <a href="#" className="sidebar__footer-link">
              Terms
            </a>
            <a href="#" className="sidebar__footer-link">
              Privacy
            </a>
          </div>
          <p className="sidebar__copyright">© 2025 YouTube Clone</p>
        </div>
      )}
    </nav>
  )
}

export default Sidebar
