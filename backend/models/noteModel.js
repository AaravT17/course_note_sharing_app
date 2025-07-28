import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    // For storage, file name will be generated as <uuid>.pdf
    // This should ensure that no naming collisions occur
  },
  {
    timestamps: true,
  }
)

noteSchema.index({ createdAt: -1, _id: -1 })
noteSchema.index({ likes: -1, _id: -1 })

export default mongoose.model('Note', noteSchema)
