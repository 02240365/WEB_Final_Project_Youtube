// server.js - Main server file
// Entry point for the backend application

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const fs = require("fs")
const { connectDB, prisma } = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const videosRoutes = require("./routes/videos")
const commentsRoutes = require("./routes/comments")
const channelsRoutes = require("./routes/channels")
const searchRoutes = require("./routes/search")
const usersRoutes = require("./routes/users")

// Import middleware
const errorHandler = require("./middleware/errorHandler")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5001

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

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")))
app.use(express.static(path.join(__dirname, "../public")))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
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

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/videos", videosRoutes)
app.use("/api/comments", commentsRoutes)
app.use("/api/channels", channelsRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/users", usersRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
async function startServer() {
  console.log("Starting server...")
  console.log("Environment:", process.env.NODE_ENV)
  console.log("Database URL:", process.env.DATABASE_URL ? "Set (hidden for security)" : "Not set")

  const isConnected = await connectDB()

  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📁 Uploads directory: ${uploadsDir}`)
      console.log(`🌐 API available at http://localhost:${PORT}/api`)
    })
  } else {
    console.error("❌ Failed to start server due to database connection error")
    process.exit(1)
  }
}

// Export for testing
module.exports = { app, prisma, connectDB }

// Start server if this file is run directly
if (require.main === module) {
  startServer()
}
