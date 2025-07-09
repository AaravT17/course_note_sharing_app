import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    university: {
      type: String,
      required: [true, 'Please add a university'],
    },
    courseCode: {
      type: String,
      required: [true, 'Please add a course code'],
    },
    title: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    // For storage, file name will be generated as <uuid>.pdf
    // This should ensure that no naming collisions occur
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Note', noteSchema)
