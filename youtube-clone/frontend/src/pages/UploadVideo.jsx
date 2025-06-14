"use client"

// UploadVideo.jsx - Video upload page component
// Allows creators to upload videos with metadata

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./UploadVideo.css"
import { uploadVideo } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"

// Video categories
const categories = [
  "Entertainment",
  "Music",
  "Gaming",
  "News",
  "Sports",
  "Education",
  "Science & Technology",
  "Comedy",
  "Movies",
  "Anime",
  "Cooking",
  "Travel",
  "Fashion",
  "Fitness",
  "Other",
]

function UploadVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    videoFile: null,
    thumbnail: null,
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState(false)

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))

      // Clear error
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }))
      }
    }
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Check if it's a video file
      if (file.type.startsWith("video/")) {
        setFormData((prev) => ({
          ...prev,
          videoFile: file,
        }))
      } else {
        toast.error("Please select a valid video file")
      }
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.videoFile) {
      newErrors.videoFile = "Video file is required"
    } else {
      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB in bytes
      if (formData.videoFile.size > maxSize) {
        newErrors.videoFile = "Video file must be less than 500MB"
      }

      // Check file type
      if (!formData.videoFile.type.startsWith("video/")) {
        newErrors.videoFile = "Please select a valid video file"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Prepare upload data
      const uploadData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        videoFile: formData.videoFile,
        thumbnail: formData.thumbnail,
      }

      // Simulate upload progress (in a real app, this would come from the upload request)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const result = await uploadVideo(uploadData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success("Video uploaded successfully!")

      // Redirect to the uploaded video
      navigate(`/video/${result.id}`)
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error(error.message || "Failed to upload video")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="upload-video">
      <div className="upload-video__container">
        <div className="upload-video__header">
          <h1 className="upload-video__title">Upload Video</h1>
          <p className="upload-video__subtitle">Share your content with the world</p>
        </div>

        <form className="upload-video__form" onSubmit={handleSubmit}>
          {/* Video file upload */}
          <div className="upload-video__section">
            <h2 className="upload-video__section-title">Video File</h2>

            <div
              className={`upload-video__drop-zone ${dragActive ? "upload-video__drop-zone--active" : ""} ${formData.videoFile ? "upload-video__drop-zone--has-file" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.videoFile ? (
                <div className="upload-video__file-info">
                  <div className="upload-video__file-icon">🎥</div>
                  <div className="upload-video__file-details">
                    <p className="upload-video__file-name">{formData.videoFile.name}</p>
                    <p className="upload-video__file-size">{formatFileSize(formData.videoFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    className="upload-video__remove-file"
                    onClick={() => setFormData((prev) => ({ ...prev, videoFile: null }))}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-video__drop-content">
                  <div className="upload-video__drop-icon">📁</div>
                  <p className="upload-video__drop-text">
                    Drag and drop your video file here, or{" "}
                    <label className="upload-video__file-label">
                      browse
                      <input
                        type="file"
                        name="videoFile"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="upload-video__file-input"
                      />
                    </label>
                  </p>
                  <p className="upload-video__drop-hint">Supported formats: MP4, AVI, MOV, WMV (Max 500MB)</p>
                </div>
              )}
            </div>

            {errors.videoFile && <span className="upload-video__error">{errors.videoFile}</span>}
          </div>

          {/* Thumbnail upload */}
          <div className="upload-video__section">
            <h2 className="upload-video__section-title">Thumbnail (Optional)</h2>

            <div className="upload-video__thumbnail-upload">
              <label className="upload-video__thumbnail-label">
                {formData.thumbnail ? (
                  <div className="upload-video__thumbnail-preview">
                    <img
                      src={URL.createObjectURL(formData.thumbnail) || "/placeholder.svg"}
                      alt="Thumbnail preview"
                      className="upload-video__thumbnail-image"
                    />
                    <div className="upload-video__thumbnail-overlay">
                      <span>Change thumbnail</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-video__thumbnail-placeholder">
                    <span className="upload-video__thumbnail-icon">🖼️</span>
                    <span>Upload thumbnail</span>
                  </div>
                )}
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="upload-video__file-input"
                />
              </label>
            </div>
          </div>

          {/* Video details */}
          <div className="upload-video__section">
            <h2 className="upload-video__section-title">Video Details</h2>

            <div className="upload-video__field">
              <label htmlFor="title" className="upload-video__label">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`upload-video__input ${errors.title ? "upload-video__input--error" : ""}`}
                placeholder="Enter video title"
                maxLength="100"
                disabled={uploading}
              />
              <div className="upload-video__char-count">{formData.title.length}/100</div>
              {errors.title && <span className="upload-video__error">{errors.title}</span>}
            </div>

            <div className="upload-video__field">
              <label htmlFor="description" className="upload-video__label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`upload-video__textarea ${errors.description ? "upload-video__textarea--error" : ""}`}
                placeholder="Tell viewers about your video"
                rows="5"
                disabled={uploading}
              />
              {errors.description && <span className="upload-video__error">{errors.description}</span>}
            </div>

            <div className="upload-video__row">
              <div className="upload-video__field">
                <label htmlFor="category" className="upload-video__label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`upload-video__select ${errors.category ? "upload-video__select--error" : ""}`}
                  disabled={uploading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="upload-video__error">{errors.category}</span>}
              </div>

              <div className="upload-video__field">
                <label htmlFor="tags" className="upload-video__label">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="upload-video__input"
                  placeholder="Enter tags separated by commas"
                  disabled={uploading}
                />
                <div className="upload-video__hint">Separate tags with commas (e.g., gaming, tutorial, fun)</div>
              </div>
            </div>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="upload-video__progress">
              <div className="upload-video__progress-bar">
                <div className="upload-video__progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="upload-video__progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {/* Form actions */}
          <div className="upload-video__actions">
            <button
              type="button"
              className="upload-video__cancel-btn"
              onClick={() => navigate("/")}
              disabled={uploading}
            >
              Cancel
            </button>

            <button type="submit" className="upload-video__submit-btn" disabled={uploading || !formData.videoFile}>
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadVideo
