// watch-data.js - Real-time database watcher
// Monitors database changes in real-time

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

let lastCounts = {}

async function getCurrentCounts() {
  const counts = {
    users: await prisma.user.count(),
    videos: await prisma.video.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.like.count(),
    subscriptions: await prisma.subscription.count(),
  }
  return counts
}

async function watchDatabase() {
  console.log("👀 Watching YouTube Clone Database for changes...")
  console.log("Press Ctrl+C to stop\n")

  // Get initial counts
  lastCounts = await getCurrentCounts()
  console.log("Initial counts:", lastCounts)
  console.log("Watching for changes...\n")

  setInterval(async () => {
    try {
      const currentCounts = await getCurrentCounts()

      // Check for changes
      let hasChanges = false
      for (const [table, count] of Object.entries(currentCounts)) {
        if (lastCounts[table] !== count) {
          const diff = count - lastCounts[table]
          console.log(`📝 ${table}: ${lastCounts[table]} → ${count} (${diff > 0 ? "+" : ""}${diff})`)
          hasChanges = true
        }
      }

      if (hasChanges) {
        console.log(`⏰ ${new Date().toLocaleTimeString()}\n`)
        lastCounts = currentCounts
      }
    } catch (error) {
      console.error("Error checking database:", error)
    }
  }, 2000) // Check every 2 seconds
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Stopping database watcher...")
  await prisma.$disconnect()
  process.exit(0)
})

watchDatabase()
