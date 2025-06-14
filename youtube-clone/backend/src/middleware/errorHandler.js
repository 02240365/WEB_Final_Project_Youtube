// errorHandler.js - Global error handling middleware
// Handles all errors and sends appropriate responses

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for debugging
  console.error("Error:", err)

  // Prisma validation error
  if (err.code === "P2002") {
    const message = "Duplicate field value entered"
    error = { message, statusCode: 400 }
  }

  // Prisma record not found
  if (err.code === "P2025") {
    const message = "Record not found"
    error = { message, statusCode: 404 }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    error = { message, statusCode: 401 }
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    error = { message, statusCode: 401 }
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = { message, statusCode: 400 }
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large"
    error = { message, statusCode: 400 }
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field"
    error = { message, statusCode: 400 }
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
