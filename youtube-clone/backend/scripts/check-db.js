// check-db.js - Database connection checker
// Verifies the database connection and schema

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log("Checking database connection...")

    // Test connection
    await prisma.$connect()
    console.log("✅ Database connection successful")

    // Get database info
    const dbInfo = await prisma.$queryRaw`SELECT current_database(), version();`
    console.log(`Connected to database: ${dbInfo[0].current_database}`)
    console.log(`PostgreSQL version: ${dbInfo[0].version}`)

    // Check tables
    console.log("\nChecking database tables:")

    // Check users table
    const userCount = await prisma.user.count()
    console.log(`- Users table: ${userCount} records`)

    // Check videos table
    const videoCount = await prisma.video.count()
    console.log(`- Videos table: ${videoCount} records`)

    // Check comments table
    const commentCount = await prisma.comment.count()
    console.log(`- Comments table: ${commentCount} records`)

    // Check likes table
    const likeCount = await prisma.like.count()
    console.log(`- Likes table: ${likeCount} records`)

    // Check subscriptions table
    const subscriptionCount = await prisma.subscription.count()
    console.log(`- Subscriptions table: ${subscriptionCount} records`)

    // Check refresh tokens table
    const tokenCount = await prisma.refreshToken.count()
    console.log(`- RefreshTokens table: ${tokenCount} records`)

    console.log("\nDatabase check completed successfully!")
  } catch (error) {
    console.error("❌ Database check failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
