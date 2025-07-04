import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import Note from '../models/noteModel.js'

// @desc Get notes, optionally filter by university and course code
// @route GET /api/notes
// @access Private
const getNotes = asyncHandler(async (req, res) => {
  const query = {
    ...(req.query.university && {
      university: { $regex: req.query.university, $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode, $options: 'i' },
    }),
  }

  const notes = Note.find(query)

  res.status(200).json(notes)
})

// @desc Get note, send the PDF to the client
// @route GET /api/notes/:id
// @access Private
const getNote = asyncHandler(async (req, res) => {
  const note = Note.findById(req.params.id)

  if (!note) {
    res.status(400)
    throw new Error('Invalid ID')
  }

  res.status(200).json(note)
})

// @desc Upload note
// @route POST /api/notes
// @access Private
const uploadNote = asyncHandler(async (req, res) => {})

// @desc Update note
// @route PUT /api/notes/:id
// @access Private
const updateNote = asyncHandler(async (req, res) => {})

// @desc Delete note
// @route DELETE /api/notes/:id
// @access Private
const deleteNote = asyncHandler(async (req, res) => {})

export { getNotes, getNote, uploadNote, updateNote, deleteNote }
