import mongoose, { Mongoose } from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    }, // This is the hashed password
    recentlyViewedNotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Note',
          required: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userSchema)
