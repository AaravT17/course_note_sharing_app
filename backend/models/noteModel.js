import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
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
    // for storage, file name will be generated as <user>_<title>_<uploadedAt>.pdf
    // this should ensure that no naming collisions occur
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Note', noteSchema)
