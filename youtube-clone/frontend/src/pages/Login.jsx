"use client"

// Login.jsx - Login page component
// Handles user authentication

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "./Login.css"
import { useAuth } from "../context/AuthContext"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination or default to home
  const from = location.state?.from?.pathname || "/"

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

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
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
      await login(formData.email, formData.password)

      // Redirect to intended destination
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Login failed:", error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__header">
          <h1 className="login__title">Sign in</h1>
          <p className="login__subtitle">to continue to YouTube</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {errors.submit && <div className="login__error-message">{errors.submit}</div>}

          <div className="login__field">
            <label htmlFor="email" className="login__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`login__input ${errors.email ? "login__input--error" : ""}`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="login__field-error">{errors.email}</span>}
          </div>

          <div className="login__field">
            <label htmlFor="password" className="login__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`login__input ${errors.password ? "login__input--error" : ""}`}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="login__field-error">{errors.password}</span>}
          </div>

          <div className="login__forgot-password">
            <Link to="/forgot-password" className="login__forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login__submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login__footer">
          <p className="login__footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="login__footer-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
