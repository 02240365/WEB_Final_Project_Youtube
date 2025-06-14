// auth.js - Authentication middleware
// Handles JWT token verification and user authentication

const jwt = require("jsonwebtoken")
const { prisma } = require("../config/database")

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        isCreator: true,
        verified: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}

// Middleware to check if user is a creator
const requireCreator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    })
  }

  if (!req.user.isCreator) {
    return res.status(403).json({
      success: false,
      message: "Creator account required",
    })
  }

  next()
}

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          isCreator: true,
          verified: true,
        },
      })

      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}

module.exports = {
  authenticateToken,
  requireCreator,
  optionalAuth,
}
