import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import path from 'path'
import fs from 'fs'
import Note from '../models/noteModel.js'
import { getStorageFileName } from '../utils/noteUtils.js'

// @desc Get notes metadata, optionally filter/search by university and/or course code
// @route GET /api/notes
// @access Private
const getNotesMetadata = asyncHandler(async (req, res) => {
  const query = {
    ...(req.query.university && {
      university: { $regex: req.query.university, $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode, $options: 'i' },
    }),
  }

  try {
    const notes = await Note.find(query).sort({ createdAt: -1 })
    res.status(200).json(notes)
  } catch (error) {
    console.log(error)
    throw error
  }

  // TODO: Add pagination, more filters e.g., sort alphabetically, date added, etc.
})

// TODO: Add a getNoteMetadata, or getRecentlyViewedNotesMetadata route handler,
// will be used to populate users' recently viewed notes in the frontend

// @desc Get note file (PDF)
// @route GET /api/notes/:id/view
// @access Private
const getNoteFile = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      res.status(404)
      throw new Error('File not found')
    }
    // TODO: Use note to construct saved file name and send the file to the client
  } catch (error) {}
})

// @desc Upload notes
// @route POST /api/notes
// @access Private
const uploadNotes = asyncHandler(async (req, res) => {
  /* This will run after multer middleware (if no error occurs), which will
   * parse form data and set req.body and req.file/req.files
   */
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error('No files submitted')
  }

  let savedNotes = []

  for (const file of req.files) {
    const title = path
      .basename(file.originalname, path.extname(file.originalname))
      .trim()
    const uuid = file.filename.slice(
      file.filename.lastIndexOf('_') + 1,
      file.filename.lastIndexOf('.')
    )
    try {
      const note = await Note.create({
        userId: req.user.id,
        university: req.body.university,
        courseCode: req.body.courseCode,
        title,
        uuid,
      })
      savedNotes.push(note)
    } catch (error) {
      console.log(error)
      // TODO: Add cleanup code to delete files from storage and DB
    }
  }
  res.status(201).json(savedNotes)
})

// @desc Get current user's notes
// @route GET /api/users/me/notes
// @access Private
const getMyNotes = asyncHandler(async (req, res) => {
  const query = {
    userId: req.user.id,
    ...(req.query.university && {
      university: { $regex: req.query.university, $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode, $options: 'i' },
    }),
  }
  const notes = await Note.find(query).sort({
    createdAt: -1,
  })
  res.status(200).json(notes)
})

// @desc Update current user's note
// @route PUT /api/users/me/notes/:id
// @access Private
const updateMyNote = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    if (!note.userId.equals(req.user._id)) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    if (req.body.university) note.university = req.body.university
    if (req.body.courseCode) note.courseCode = req.body.courseCode

    const updatedNote = await note.save()

    res.status(200).json(updatedNote)
  } catch (error) {
    console.log(error)
    throw error
  }
})

// @desc Delete current user's note
// @route DELETE /api/users/me/notes/:id
// @access Private
const deleteMyNote = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    if (!note.userId.equals(req.user._id)) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    await note.deleteOne()

    try {
      await fs.unlink(
        path.resolve(
          'uploads',
          getStorageFileName(note.userId.toString(), note.title, note.uuid)
        )
      )
    } catch (error) {
      console.log(
        `Could not delete file ${getStorageFileName(
          note.userId.toString(),
          note.title,
          note.uuid
        )}`
      )
    }

    res.status(204).end()
  } catch (error) {
    console.log(error)
    throw error
  }
})

export {
  getNotesMetadata,
  getNoteFile,
  uploadNotes,
  getMyNotes,
  updateMyNote,
  deleteMyNote,
}
