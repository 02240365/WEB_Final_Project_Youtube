// auth.js - Authentication routes
// Handles user registration, login, logout, and token management

const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { prisma } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")
const { uploadAvatar, getFileUrl } = require("../middleware/upload")

const router = express.Router()

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  })

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || "your-refresh-secret", {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  })

  return { accessToken, refreshToken }
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request received:", req.body)
    const { email, username, password, firstName, lastName, isCreator = false } = req.body

    // Validation
    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? "Email already registered" : "Username already taken",
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    console.log("Creating new user:", { email, username, firstName, lastName, isCreator })

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        isCreator,
        channelName: isCreator ? `${firstName} ${lastName}` : null,
        profilePicture: "/uploads/avatars/default-avatar.png", // Default avatar
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        isCreator: true,
        verified: true,
        channelName: true,
        createdAt: true,
      },
    })

    console.log("User created successfully:", user.id)

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email })
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    console.log("User logged in successfully:", user.id)

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body

    // Delete refresh token from database
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [{ token: refreshToken }, { userId: req.user.id }],
        },
      })
    } else {
      // Delete all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.id },
      })
    }

    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        bannerImage: true,
        description: true,
        isCreator: true,
        verified: true,
        channelName: true,
        subscribers: true,
        totalViews: true,
        createdAt: true,
      },
    })

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
      error: error.message,
    })
  }
})

module.exports = router
