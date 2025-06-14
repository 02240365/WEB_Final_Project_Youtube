// init-db.js - Database initialization script
// Creates database tables and initial data

const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

// Function to run shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`)
    const output = execSync(command, { encoding: "utf8" })
    console.log(output)
    return true
  } catch (error) {
    console.error(`Command failed: ${command}`)
    console.error(error.message)
    return false
  }
}

// Create .env file if it doesn't exist
function createEnvFile() {
  const envPath = path.join(__dirname, "../.env")
  const envExamplePath = path.join(__dirname, "../.env.example")

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log("Creating .env file from .env.example")
    fs.copyFileSync(envExamplePath, envPath)
    console.log(".env file created")
  }
}

// Main function
async function initDatabase() {
  console.log("Starting database initialization...")

  // Create .env file if needed
  createEnvFile()

  // Run Prisma migrations
  console.log("\n1. Running Prisma migrations...")
  if (!runCommand("npx prisma migrate dev --name init")) {
    console.error("Failed to run migrations")
    process.exit(1)
  }

  // Generate Prisma client
  console.log("\n2. Generating Prisma client...")
  if (!runCommand("npx prisma generate")) {
    console.error("Failed to generate Prisma client")
    process.exit(1)
  }

  // Seed the database
  console.log("\n3. Seeding the database...")
  if (!runCommand("node prisma/seed.js")) {
    console.error("Failed to seed the database")
    process.exit(1)
  }

  console.log("\nDatabase initialization completed successfully!")
  console.log("\nYou can now start the server with: npm run dev")
}

// Run the initialization
initDatabase()
