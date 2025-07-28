import Note from '../models/noteModel.js'
import User from '../models/userModel.js'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from '../config/db.js'

const createIndexes = async () => {
  try {
    await connectDB()
    await Note.syncIndexes()
    await User.syncIndexes()
    console.log('Indexes created successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()
