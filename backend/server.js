import express from 'express'
import dotenv from 'dotenv'
dotenv.config() // Gives access to environment variables in .env file
import cookieParser from 'cookie-parser'
import cron from 'node-cron'
import userRouter from './routes/userRoutes.js'
import noteRouter from './routes/noteRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
import { deleteUnverifiedUsers } from './utils/cleanup.js'
import { initS3Client } from './config/s3.js'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import fs from 'fs'

const port = process.env.PORT || 8000

const app = express()

console.log('mounting cors')

app.use(
  cors({
    origin: process.env.VITE_FRONTEND_BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
)
console.log('mounted cors')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production') {
  console.log('mounting static')
  app.use(express.static(path.resolve(__dirname, '../frontend/dist')))
  console.log('mounted static')
}

console.log('mounting mid')
// Middleware to parse JSON and URL-encoded request body data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Middleware to parse cookies
app.use(cookieParser())
console.log('mounted mid')

console.log('mounting users')

app.use('/api/users', userRouter)
console.log('mounted users')
console.log('mounting notes')
app.use('/api/notes', noteRouter)
console.log('mounted notes')

if (process.env.NODE_ENV === 'production') {
  console.log('mounting catch-all route')
  app.get('*', (req, res) => {
    res.send('Catch-all route works!')
  })
  console.log('mounted catch-all route')
}

app.use(errorHandler)

async function main() {
  await connectDB()
  // Ensures DB connection is established before the server starts listening for requests
  cron.schedule('0 0 * * *', deleteUnverifiedUsers)
  console.log('Cleanup process active...')
  initS3Client()
  app.listen(port, () => console.log(`Server running on port ${port}...`))
}

main()
