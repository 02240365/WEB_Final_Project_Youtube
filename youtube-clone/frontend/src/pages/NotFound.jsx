"use client"
import { Link } from "react-router-dom"
import "./NotFound.css"

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__icon">📺</div>
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__subtitle">Page Not Found</h2>
        <p className="not-found__message">The page you're looking for doesn't exist or has been moved.</p>

        <div className="not-found__actions">
          <Link to="/" className="not-found__home-btn">
            Go to Home
          </Link>
          <button onClick={() => window.history.back()} className="not-found__back-btn">
            Go Back
          </button>
        </div>

        <div className="not-found__suggestions">
          <h3 className="not-found__suggestions-title">You might want to:</h3>
          <ul className="not-found__suggestions-list">
            <li>
              <Link to="/" className="not-found__suggestion-link">
                Browse trending videos
              </Link>
            </li>
            <li>
              <Link to="/search/music" className="not-found__suggestion-link">
                Search for music videos
              </Link>
            </li>
            <li>
              <Link to="/upload" className="not-found__suggestion-link">
                Upload your own content
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NotFound
