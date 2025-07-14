import express from 'express'
import dotenv from 'dotenv'
dotenv.config() // Gives access to environment variables in .env file
import cookieParser from 'cookie-parser'
import fs from 'fs'
import path from 'path'
import cron from 'node-cron'
import userRouter from './routes/userRoutes.js'
import noteRouter from './routes/noteRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
import { deleteUnverifiedUsers } from './utils/cleanup.js'

const port = process.env.PORT || 5000

const app = express()

// Middleware to parse JSON and URL-encoded request body data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Middleware to parse cookies
app.use(cookieParser())

app.use('/api/users', userRouter)
app.use('/api/notes', noteRouter)

app.use(errorHandler)

async function main() {
  const uploadsDir = path.resolve('backend', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
  }
  await connectDB()
  // Ensures DB connection is established before the server starts listening for requests
  cron.schedule('0 0 * * *', deleteUnverifiedUsers)
  console.log('Cleanup process active...')
  app.listen(port, () => console.log(`Server running on port ${port}...`))
}

main()
