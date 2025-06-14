// upload.js - File upload middleware
// Handles file uploads for videos, thumbnails, and profile pictures

const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ["public/uploads/videos", "public/uploads/thumbnails", "public/uploads/avatars"]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`📁 Created directory: ${dir}`)
    }
  })
}

// Initialize upload directories
createUploadDirs()

// Storage configuration for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/videos/")
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// Storage configuration for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/thumbnails/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// Storage configuration for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatars/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("video/")) {
    cb(null, true)
  } else {
    cb(new Error("Only video files are allowed!"), false)
  }
}

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

// Upload middleware for videos
const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: videoFileFilter,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
])

// Upload middleware for profile pictures
const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
])

// Helper function to get file URL
const getFileUrl = (req, filePath) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`
  return `${baseUrl}/uploads/${filePath}`
}

// Helper function to get relative file path
const getRelativeFilePath = (filePath) => {
  return `/uploads/${filePath}`
}

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
      })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
      })
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field",
      })
    }
  }

  if (error.message === "Only video files are allowed!" || error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  next(error)
}

module.exports = {
  uploadVideo,
  uploadProfile,
  getFileUrl,
  getRelativeFilePath,
  handleUploadError,
}
