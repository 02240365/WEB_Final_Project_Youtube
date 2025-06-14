// database.js - Database configuration and connection
// Sets up PostgreSQL connection using Prisma

const { PrismaClient } = require("@prisma/client")

// Create Prisma client instance with detailed logging
const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
})

// Set up query logging
prisma.$on("query", (e) => {
  console.log("Query: " + e.query)
  console.log("Params: " + e.params)
  console.log("Duration: " + e.duration + "ms")
})

// Database connection function with retry logic
const connectDB = async () => {
  let retries = 5
  while (retries) {
    try {
      // Test the connection
      await prisma.$connect()
      console.log("✅ Database connected successfully to PostgreSQL")

      // Log database info
      const result = await prisma.$queryRaw`SELECT current_database(), version();`
      console.log(`Connected to database: ${result[0].current_database}`)
      console.log(`PostgreSQL version: ${result[0].version}`)

      return true
    } catch (error) {
      console.error(`❌ Database connection attempt failed (${retries} retries left):`, error)
      retries -= 1
      // Wait before retrying
      await new Promise((res) => setTimeout(res, 5000))
    }
  }

  console.error("❌ Failed to connect to database after multiple attempts")
  return false
}

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await prisma.$disconnect()
    console.log("📴 Database disconnected")
  } catch (error) {
    console.error("Error disconnecting from database:", error)
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  await disconnectDB()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await disconnectDB()
  process.exit(0)
})

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
}
