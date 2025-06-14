"use client"

// CommentItem.jsx - Component for displaying a single comment
// Used in the CommentSection component

import { useState } from "react"
import { Link } from "react-router-dom"
import "./CommentItem.css"
import { formatDistanceToNow } from "date-fns"

function CommentItem({ comment }) {
  const [likes, setLikes] = useState(comment.likes || 0)
  const [dislikes, setDislikes] = useState(comment.dislikes || 0)
  const [userAction, setUserAction] = useState(null) // 'like', 'dislike', or null

  // Format the comment date
  const formatCommentDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  // Handle like button click
  const handleLike = () => {
    if (userAction === "like") {
      // User is unliking
      setLikes(likes - 1)
      setUserAction(null)
    } else {
      // User is liking
      setLikes(likes + 1)

      // If user previously disliked, remove the dislike
      if (userAction === "dislike") {
        setDislikes(dislikes - 1)
      }

      setUserAction("like")
    }
  }

  // Handle dislike button click
  const handleDislike = () => {
    if (userAction === "dislike") {
      // User is undisliking
      setDislikes(dislikes - 1)
      setUserAction(null)
    } else {
      // User is disliking
      setDislikes(dislikes + 1)

      // If user previously liked, remove the like
      if (userAction === "like") {
        setLikes(likes - 1)
      }

      setUserAction("dislike")
    }
  }

  return (
    <div className="comment-item">
      <Link to={`/channel/${comment.user.id}`} className="comment-item__avatar-link">
        <img
          src={comment.user.profilePicture || "/placeholder.svg?height=40&width=40"}
          alt={comment.user.username}
          className="comment-item__avatar"
        />
      </Link>

      <div className="comment-item__content">
        <div className="comment-item__header">
          <Link to={`/channel/${comment.user.id}`} className="comment-item__username">
            {comment.user.username}
          </Link>
          <span className="comment-item__date">{formatCommentDate(comment.createdAt)}</span>
        </div>

        <p className="comment-item__text">{comment.text}</p>

        <div className="comment-item__actions">
          <button
            className={`comment-item__action-btn ${userAction === "like" ? "comment-item__action-btn--active" : ""}`}
            onClick={handleLike}
          >
            <span className="comment-item__action-icon">👍</span>
            {likes > 0 && <span className="comment-item__action-count">{likes}</span>}
          </button>

          <button
            className={`comment-item__action-btn ${userAction === "dislike" ? "comment-item__action-btn--active" : ""}`}
            onClick={handleDislike}
          >
            <span className="comment-item__action-icon">👎</span>
          </button>

          <button className="comment-item__reply-btn">Reply</button>
        </div>
      </div>
    </div>
  )
}

export default CommentItem
