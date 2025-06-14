"use client"

// Register.jsx - Registration page component
// Handles user account creation

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Register.css"
import { useAuth } from "../context/AuthContext"

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    isCreator: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { register } = useAuth()
  const navigate = useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
      setLoading(true)

      // Prepare user data (exclude confirmPassword)
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isCreator: formData.isCreator,
      }

      await register(userData)

      // Redirect to home page
      navigate("/")
    } catch (error) {
      console.error("Registration failed:", error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__header">
          <h1 className="register__title">Create your account</h1>
          <p className="register__subtitle">Join YouTube today</p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          {errors.submit && <div className="register__error-message">{errors.submit}</div>}

          <div className="register__row">
            <div className="register__field">
              <label htmlFor="firstName" className="register__label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`register__input ${errors.firstName ? "register__input--error" : ""}`}
                placeholder="Enter your first name"
                disabled={loading}
              />
              {errors.firstName && <span className="register__field-error">{errors.firstName}</span>}
            </div>

            <div className="register__field">
              <label htmlFor="lastName" className="register__label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`register__input ${errors.lastName ? "register__input--error" : ""}`}
                placeholder="Enter your last name"
                disabled={loading}
              />
              {errors.lastName && <span className="register__field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="register__field">
            <label htmlFor="username" className="register__label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`register__input ${errors.username ? "register__input--error" : ""}`}
              placeholder="Choose a username"
              disabled={loading}
            />
            {errors.username && <span className="register__field-error">{errors.username}</span>}
          </div>

          <div className="register__field">
            <label htmlFor="email" className="register__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`register__input ${errors.email ? "register__input--error" : ""}`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="register__field-error">{errors.email}</span>}
          </div>

          <div className="register__row">
            <div className="register__field">
              <label htmlFor="password" className="register__label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`register__input ${errors.password ? "register__input--error" : ""}`}
                placeholder="Create a password"
                disabled={loading}
              />
              {errors.password && <span className="register__field-error">{errors.password}</span>}
            </div>

            <div className="register__field">
              <label htmlFor="confirmPassword" className="register__label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`register__input ${errors.confirmPassword ? "register__input--error" : ""}`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              {errors.confirmPassword && <span className="register__field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="register__checkbox-field">
            <label className="register__checkbox-label">
              <input
                type="checkbox"
                name="isCreator"
                checked={formData.isCreator}
                onChange={handleChange}
                className="register__checkbox"
                disabled={loading}
              />
              <span className="register__checkbox-text">I want to create and upload content (Creator account)</span>
            </label>
          </div>

          <button type="submit" className="register__submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="register__footer">
          <p className="register__footer-text">
            Already have an account?{" "}
            <Link to="/login" className="register__footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
