import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
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
    recentlyViewedNotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userSchema)
