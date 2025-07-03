import express from 'express'
import dotenv from 'dotenv'
dotenv.config() // Gives access to environment variables in .env file
import userRouter from './routes/userRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'

const port = process.env.PORT || 5000

const app = express()

// Middleware to parse JSON and URL-encoded request body data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', userRouter)

app.use(errorHandler)

app.listen(port, () => console.log(`Server running on port ${port}...`))