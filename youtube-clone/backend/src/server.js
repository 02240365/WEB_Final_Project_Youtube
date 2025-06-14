// server.js - Main server file
// Entry point for the backend application

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
require("dotenv").config()
const fs = require("fs")
const { connectDB, prisma } = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const videoRoutes = require("./routes/videos")
const userRoutes = require("./routes/users")
const commentRoutes = require("./routes/comments")
const channelRoutes = require("./routes/channels")
const searchRoutes = require("./routes/search")

// Import middleware
const errorHandler = require("./middleware/errorHandler")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for development
  }),
)

// CORS configuration for production
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
    "https://youtube-clone-frontend.onrender.com", // Add your frontend URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads")
const videosDir = path.join(uploadsDir, "videos")
const thumbnailsDir = path.join(uploadsDir, "thumbnails")
const avatarsDir = path.join(uploadsDir, "avatars")
// Create directories if they don't exist
;[uploadsDir, videosDir, thumbnailsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
})

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

// Body parsing middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files (uploaded videos and thumbnails)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"), {
    maxAge: "1d",
    etag: true,
  }),
)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "YouTube Clone API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API status endpoint
app.get("/api/status", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as result`

    res.status(200).json({
      status: "ok",
      message: "API is running",
      database: "connected",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database connection error in status check:", error)
    res.status(500).json({
      status: "error",
      message: "API is running but database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Database test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    // Test database connection and query
    const result = await prisma.$queryRaw`SELECT current_database(), version();`

    // Try to create a test record
    const testUser = await prisma.user
      .findFirst({
        where: { email: "test@example.com" },
        select: { id: true, email: true },
      })
      .catch((e) => null)

    res.status(200).json({
      status: "ok",
      message: "Database connection successful",
      database: result[0].current_database,
      version: result[0].version,
      testUser: testUser || "No test user found",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    res.status(500).json({
      status: "error",
      message: "Database test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Test file endpoint
app.get("/test-file/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params
  const filePath = path.join(__dirname, `../public/uploads/${folder}/${filename}`)

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({
      status: "error",
      message: "File not found",
      path: filePath,
      exists: false,
    })
  }
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/videos", videoRoutes)
app.use("/api/users", userRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/channels", channelRoutes)
app.use("/api/search", searchRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "YouTube Clone API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      videos: "/api/videos",
      users: "/api/users",
      comments: "/api/comments",
      channels: "/api/channels",
      search: "/api/search",
    },
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`🔗 API URL: http://localhost:${PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

// Export for testing
module.exports = app
