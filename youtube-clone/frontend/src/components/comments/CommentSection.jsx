"use client"

// CommentSection.jsx - Component for displaying and adding comments
// Used on the video page

import { useState } from "react"
import "./CommentSection.css"
import { useAuth } from "../../context/AuthContext"
import CommentItem from "./CommentItem"
import { toast } from "react-toastify"

function CommentSection({ videoId, comments = [], onAddComment }) {
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentUser, user } = useAuth()

  // Use either currentUser or user, whichever is available
  const authUser = currentUser || user

  // Ensure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : []

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      return
    }

    if (!authUser) {
      toast.error("You must be logged in to comment")
      return
    }

    try {
      setIsSubmitting(true)

      // Call the onAddComment function passed from parent
      if (onAddComment) {
        await onAddComment(commentText)
      }

      // Clear the comment input
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section__title">
        {safeComments.length} {safeComments.length === 1 ? "Comment" : "Comments"}
      </h3>

      {/* Comment form */}
      <div className="comment-section__form-container">
        {authUser ? (
          <img
            src={authUser.profilePicture || "/default-avatar.png"}
            alt={authUser.username}
            className="comment-section__user-avatar"
          />
        ) : (
          <div className="comment-section__user-avatar comment-section__user-avatar--placeholder" />
        )}

        <form className="comment-section__form" onSubmit={handleSubmitComment}>
          <input
            type="text"
            placeholder={authUser ? "Add a comment..." : "Sign in to comment"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="comment-section__input"
            disabled={!authUser || isSubmitting}
          />

          <div className="comment-section__form-actions">
            <button
              type="button"
              className="comment-section__cancel-btn"
              onClick={() => setCommentText("")}
              disabled={!commentText || isSubmitting}
            >
              Cancel
            </button>

            <button type="submit" className="comment-section__submit-btn" disabled={!commentText || isSubmitting}>
              {isSubmitting ? "Commenting..." : "Comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments list */}
      <div className="comment-section__list">
        {safeComments.length > 0 ? (
          safeComments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <p className="comment-section__no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}

export default CommentSection
