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

const port = process.env.PORT || 8000

const app = express()

app.use((req, res, next) => {
  if (
    req.headers?.host === 'noteabl.onrender.com' ||
    req.headers?.host === 'www.noteablapp.com'
  ) {
    return res.redirect(301, `${process.env.VITE_FRONTEND_BASE_URL}${req.url}`)
  }
  next()
})

app.use(
  cors({
    origin: process.env.VITE_FRONTEND_BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production')
  app.use(express.static(path.resolve(__dirname, '../frontend/dist')))

// Middleware to parse JSON and URL-encoded request body data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Middleware to parse cookies
app.use(cookieParser())

app.use('/api/users', userRouter)
app.use('/api/notes', noteRouter)

if (process.env.NODE_ENV === 'production') {
  app.use('/*wildcard', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'))
  })
}

app.use(errorHandler)

async function main() {
  await connectDB()
  // Ensures DB connection is established before the server starts listening for requests
  cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running daily cleanup...`)
    await deleteUnverifiedUsers()
  })
  console.log('Cleanup process active...')
  initS3Client()
  app.listen(port, () => console.log(`Server running on port ${port}...`))
}

main()
