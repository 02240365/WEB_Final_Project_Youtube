"use client"

// Sidebar.jsx - Navigation sidebar component
// Contains main navigation links and categories

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import "./Sidebar.css"
import { useAuth } from "../../context/AuthContext"

// Import icons
import HomeIcon from "../../assets/icons/home.svg"
import ShortsIcon from "../../assets/icons/shorts.svg"
import SubscriptionsIcon from "../../assets/icons/subscriptions.svg"
import HistoryIcon from "../../assets/icons/history.svg"
import YourVideosIcon from "../../assets/icons/your-videos.svg"
import WatchLaterIcon from "../../assets/icons/watch-later.svg"
import LikedVideosIcon from "../../assets/icons/liked-videos.svg"
import TrendingIcon from "../../assets/icons/trending.svg"
import MusicIcon from "../../assets/icons/music.svg"
import GamingIcon from "../../assets/icons/gaming.svg"
import NewsIcon from "../../assets/icons/news.svg"
import SportsIcon from "../../assets/icons/sports.svg"

function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const { currentUser } = useAuth()
  const location = useLocation()

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setExpanded(!expanded)
    // This would update a global state in a real app
    document.body.classList.toggle("sidebar-open")
  }

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setExpanded(false)
        document.body.classList.remove("sidebar-open")
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <nav className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}>
      <div className="sidebar__section">
        <Link to="/" className={`sidebar__item ${isActive("/") ? "sidebar__item--active" : ""}`}>
          <img src={HomeIcon || "/placeholder.svg"} alt="Home" className="sidebar__icon" />
          {expanded && <span className="sidebar__text">Home</span>}
        </Link>

        <Link to="/shorts" className={`sidebar__item ${isActive("/shorts") ? "sidebar__item--active" : ""}`}>
          <img src={ShortsIcon || "/placeholder.svg"} alt="Shorts" className="sidebar__icon" />
          {expanded && <span className="sidebar__text">Shorts</span>}
        </Link>

        <Link
          to="/subscriptions"
          className={`sidebar__item ${isActive("/subscriptions") ? "sidebar__item--active" : ""}`}
        >
          <img src={SubscriptionsIcon || "/placeholder.svg"} alt="Subscriptions" className="sidebar__icon" />
          {expanded && <span className="sidebar__text">Subscriptions</span>}
        </Link>
      </div>

      {expanded && currentUser && (
        <div className="sidebar__section">
          <h3 className="sidebar__heading">You</h3>

          <Link to="/channel/me" className={`sidebar__item ${isActive("/channel/me") ? "sidebar__item--active" : ""}`}>
            <img src={YourVideosIcon || "/placeholder.svg"} alt="Your channel" className="sidebar__icon" />
            <span className="sidebar__text">Your channel</span>
          </Link>

          <Link to="/history" className={`sidebar__item ${isActive("/history") ? "sidebar__item--active" : ""}`}>
            <img src={HistoryIcon || "/placeholder.svg"} alt="History" className="sidebar__icon" />
            <span className="sidebar__text">History</span>
          </Link>

          <Link
            to="/your-videos"
            className={`sidebar__item ${isActive("/your-videos") ? "sidebar__item--active" : ""}`}
          >
            <img src={YourVideosIcon || "/placeholder.svg"} alt="Your videos" className="sidebar__icon" />
            <span className="sidebar__text">Your videos</span>
          </Link>

          <Link
            to="/watch-later"
            className={`sidebar__item ${isActive("/watch-later") ? "sidebar__item--active" : ""}`}
          >
            <img src={WatchLaterIcon || "/placeholder.svg"} alt="Watch later" className="sidebar__icon" />
            <span className="sidebar__text">Watch later</span>
          </Link>

          <Link
            to="/liked-videos"
            className={`sidebar__item ${isActive("/liked-videos") ? "sidebar__item--active" : ""}`}
          >
            <img src={LikedVideosIcon || "/placeholder.svg"} alt="Liked videos" className="sidebar__icon" />
            <span className="sidebar__text">Liked videos</span>
          </Link>
        </div>
      )}

      {expanded && (
        <div className="sidebar__section">
          <h3 className="sidebar__heading">Explore</h3>

          <Link to="/trending" className={`sidebar__item ${isActive("/trending") ? "sidebar__item--active" : ""}`}>
            <img src={TrendingIcon || "/placeholder.svg"} alt="Trending" className="sidebar__icon" />
            <span className="sidebar__text">Trending</span>
          </Link>

          <Link to="/music" className={`sidebar__item ${isActive("/music") ? "sidebar__item--active" : ""}`}>
            <img src={MusicIcon || "/placeholder.svg"} alt="Music" className="sidebar__icon" />
            <span className="sidebar__text">Music</span>
          </Link>

          <Link to="/gaming" className={`sidebar__item ${isActive("/gaming") ? "sidebar__item--active" : ""}`}>
            <img src={GamingIcon || "/placeholder.svg"} alt="Gaming" className="sidebar__icon" />
            <span className="sidebar__text">Gaming</span>
          </Link>

          <Link to="/news" className={`sidebar__item ${isActive("/news") ? "sidebar__item--active" : ""}`}>
            <img src={NewsIcon || "/placeholder.svg"} alt="News" className="sidebar__icon" />
            <span className="sidebar__text">News</span>
          </Link>

          <Link to="/sports" className={`sidebar__item ${isActive("/sports") ? "sidebar__item--active" : ""}`}>
            <img src={SportsIcon || "/placeholder.svg"} alt="Sports" className="sidebar__icon" />
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
