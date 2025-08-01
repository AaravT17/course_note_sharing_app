import dotenv from 'dotenv'
dotenv.config() // Load environment variables from .env file
import { deleteUnverifiedUsers } from '../utils/cleanup.js'
import connectDB from '../config/db.js'

const deleteUnverifiedUsersScript = async () => {
  await connectDB() // Ensure DB connection is established before running cleanup
  console.log(`[${new Date().toISOString()}] Running cleanup process...`)
  await deleteUnverifiedUsers()
}

deleteUnverifiedUsersScript()
