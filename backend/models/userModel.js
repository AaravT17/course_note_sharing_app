import mongoose, { Mongoose } from 'mongoose'
import { VERIFICATION_LINK_EXPIRY_HRS } from '../config/constants.js'

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
      index: true,
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
    likedNotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Note',
        },
      ],
      default: [],
    },
    dislikedNotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Note',
        },
      ],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * VERIFICATION_LINK_EXPIRY_HRS,
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
)

export default mongoose.model('User', userSchema)
