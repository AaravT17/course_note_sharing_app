import express from 'express'
import dotenv from 'dotenv'
dotenv.config() // Gives access to environment variables in .env file
import fs from 'fs'
import path from 'path'
import userRouter from './routes/userRoutes.js'
import noteRouter from './routes/noteRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'

const port = process.env.PORT || 5000

const app = express()

// Middleware to parse JSON and URL-encoded request body data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', userRouter)
app.use('/api/notes', noteRouter)

app.use(errorHandler)

async function main() {
  const uploadsDir = path.resolve('uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
  }
  await connectDB()
  // Ensures DB connection is established before the server starts listening for requests
  app.listen(port, () => console.log(`Server running on port ${port}...`))
}

main()
