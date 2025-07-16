import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import path from 'path'
import fs from 'fs'
import Note from '../models/noteModel.js'
import {
  getStorageFileName,
  getUuid,
  getTitle,
  deleteFile,
  deleteFileAndNote,
} from '../utils/noteUtils.js'

// TODO: Modify uploadNotes and getNoteFile to store and retrieve files from AWS instance

// @desc Get notes metadata, optionally filter/search by university and/or course code
// @route GET /api/notes
// @access Private
const getNotesMetadata = asyncHandler(async (req, res) => {
  const query = {
    user: { $ne: req.user._id }, // Exclude current user's notes
    ...(req.query.university && {
      university: { $regex: req.query.university.trim(), $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode.trim(), $options: 'i' },
    }),
    ...(req.query.title && {
      title: { $regex: req.query.title.trim(), $options: 'i' },
    }),
  }

  try {
    const notes = await Note.find(query)
      .populate('user', 'name _id')
      .sort({ createdAt: -1 })
    const processedNotes = notes.map((note) => {
      if (note.isAnonymous) {
        return {
          ...note.toObject(),
          user: {
            _id: note.user?._id,
            id: note.user?._id?.toString(),
            name: '-',
          },
        }
      }
      return note.toObject()
    })
    res.status(200).json(processedNotes)
  } catch (error) {
    console.log(error)
    throw error
  }
  // TODO: Add pagination, more filters e.g., sort alphabetically, date added, etc.
})

// @desc Get note file (PDF)
// @route GET /api/notes/:id/view
// @access Private
const getNoteFile = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      console.log(`Note ${req.params.id} not found in DB`)
      res.status(404)
      throw new Error('File not found')
    }
    const filePath = path.resolve(
      'backend',
      'uploads',
      getStorageFileName(note)
    )
    if (!fs.existsSync(filePath)) {
      console.log(`File ${getStorageFileName(note)} not found in storage`)
      res.status(404)
      throw new Error('File not found')
    }
    res.set('Content-Type', 'application/pdf')
    res.status(200).sendFile(filePath)
  } catch (error) {
    console.log(error)
    throw error
  }
})

// @desc Upload notes
// @route POST /api/notes
// @access Private
const uploadNotes = asyncHandler(async (req, res) => {
  /* This will run after multer middleware (if no error occurs), which will
   * parse form data, save notes to storage, and set req.body and req.files
   */
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error('No files submitted')
  }

  let savedNotes = []

  for (const file of req.files) {
    const title = getTitle(file.originalname)
    const uuid = getUuid(file.filename)
    try {
      const existingNote = await Note.findOne({
        user: req.user._id,
        university: req.body.university.trim(),
        courseCode: req.body.courseCode.trim().toUpperCase(),
        title,
      })
      if (existingNote) {
        res.status(400)
        throw new Error(
          'You have already uploaded a note with the same title for this course'
        )
      }
      const note = await Note.create({
        user: req.user._id,
        university: req.body.university.trim(),
        courseCode: req.body.courseCode.trim().toUpperCase(),
        title,
        isAnonymous: req.body.isAnonymous === 'true',
        uuid,
      })
      savedNotes.push(note)
    } catch (error) {
      let message
      if (error.code && error.code === 11000) {
        message =
          'Something went wrong while uploading your notes, please try again'
      }
      console.log(error)
      await deleteFile({
        user: req.user._id,
        title,
        uuid,
      })
      // for (const savedNote of savedNotes) {
      //   await deleteFileAndNote(savedNote)
      // }
      await Promise.allSettled(savedNotes.map(deleteFileAndNote))
      // Optimized for efficiency
      if (message) {
        throw new Error(message)
      } else {
        throw error
      }
    }
  }
  res.status(201).json(savedNotes)
})

// @desc Get current user's notes
// @route GET /api/users/me/notes
// @access Private
const getMyNotes = asyncHandler(async (req, res) => {
  const query = {
    user: req.user._id,
    ...(req.query.university && {
      university: { $regex: req.query.university.trim(), $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode.trim(), $options: 'i' },
    }),
    ...(req.query.title && {
      title: { $regex: req.query.title.trim(), $options: 'i' },
    }),
  }
  try {
    const notes = await Note.find(query)
      .populate('user', 'name _id')
      .sort({ createdAt: -1 })
    const processedNotes = notes.map((note) => {
      if (note.isAnonymous) {
        return {
          ...note.toObject(),
          user: {
            _id: note.user?._id,
            id: note.user?._id?.toString(),
            name: '-',
          },
        }
      }
      return note.toObject()
    })
    res.status(200).json(processedNotes)
  } catch (error) {
    console.log(error)
    throw error
  }
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

    if (!note.user.equals(req.user._id)) {
      res.status(403)
      throw new Error('Forbidden, you can only update your own notes')
    }

    if (req.body.university) note.university = req.body.university.trim()
    if (req.body.courseCode)
      note.courseCode = req.body.courseCode.trim().toUpperCase()

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
  let note

  try {
    note = await Note.findById(req.params.id)

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    if (!note.user.equals(req.user._id)) {
      res.status(403)
      throw new Error('Forbidden, you can only delete your own notes')
    }

    await deleteFile(note) // This will catch and log any error that occurs

    await note.deleteOne()

    // This order of deletion ensures both are attemped, regardless
    // of whether the other fails

    res.status(204).end()
  } catch (error) {
    note
      ? console.log(
          `Could not delete note ${note._id.toString()} from DB`,
          error
        )
      : console.log(error)
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
