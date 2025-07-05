import mongoose from 'mongoose'

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
    }, // the password will be hashed
    recentNotes: {
      type: [
        new mongoose.Schema(
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
              ref: 'Note',
            },
            title: {
              type: String,
              required: true,
            },
          },
          {
            _id: false,
          }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userSchema)
