import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import { v4 as uuidv4 } from 'uuid'
import Note from '../models/noteModel.js'
import User from '../models/userModel.js'
import { getS3Client } from '../config/s3.js'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  getS3Key,
  getTitle,
  processNoteForDisplay,
} from '../utils/noteUtils.js'
import {
  MAX_LIKED_NOTES_DASHBOARD,
  MAX_RETRIES_TRANSACTIONS,
} from '../config/constants.js'
import {
  getSortBy,
  buildSearchQuery,
  getNotes,
  deleteFile,
  deleteNote,
  deleteFileAndNote,
} from '../services/noteServices.js'
import mongoose from 'mongoose'

// @desc Get notes uploaded by other users, optionally search/filter by title, course code, academic year, and instructor, and sort by recency or likes
// Supports cursor-based pagination
// @route GET /api/notes
// @access Private
const getBrowseNotes = asyncHandler(async (req, res) => {
  const sortBy = getSortBy(req.query)
  let searchQuery
  try {
    searchQuery = {
      user: { $ne: req.user._id },
      ...buildSearchQuery(req.query, sortBy),
    }
  } catch (error) {
    res.status(400)
    throw error
  }

  try {
    const { processedNotes, hasMore } = await getNotes(searchQuery, sortBy)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
})

// @desc Get note file
// @route GET /api/notes/:id/view
// @access Private
const getNoteFile = asyncHandler(async (req, res) => {
  const s3Client = getS3Client()
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      res.status(404)
      throw new Error('File not found')
    }
    try {
      const fileResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: getS3Key(note),
        })
      )
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${note.title}.pdf"`
      )
      res.status(200)
      fileResponse.Body.pipe(res)
    } catch (readFileError) {
      if (
        readFileError.name === 'NoSuchKey' ||
        readFileError.Code === 'NoSuchKey'
      ) {
        res.status(404)
        throw new Error('File not found')
      }
      if (
        readFileError.name === 'AccessDenied' ||
        readFileError.Code === 'AccessDenied'
      ) {
        throw new Error('Access denied')
      }
      throw readFileError
    }
  } catch (error) {
    let message
    if (error.message === 'File not found') {
      message = 'File not found'
    }
    throw new Error(message || 'Failed to retrieve file')
  }
})

// @desc Upload notes
// @route POST /api/notes
// @access Private
const uploadNotes = asyncHandler(async (req, res) => {
  /* This will run after multer middleware (if no error occurs), which will
   * parse form data and set req.body and req.files, req.files will be an array
   * of files, and the files' content will be in a buffer in memory
   */
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error('No files submitted')
  }

  const courseCode = req.body.courseCode.trim().toUpperCase()
  const academicYear = req.body.academicYear.trim()
  const instructor = req.body.instructor?.trim()
  const isAnonymous = req.body.isAnonymous?.trim()

  const s3Client = getS3Client()

  let savedNotes = []

  for (const file of req.files) {
    const title = getTitle(file.originalname)
    const uuid = uuidv4()
    let note
    try {
      try {
        note = await Note.create({
          user: req.user._id,
          title,
          courseCode,
          academicYear,
          ...(instructor && { instructor }),
          isAnonymous: isAnonymous === 'true',
          uuid,
        })
      } catch (dbUploadError) {
        if (dbUploadError.code === 11000 && !dbUploadError.keyPattern?.uuid) {
          // Duplicate key error, a note with the same metadata already exists
          res.status(409)
          throw new Error(
            'Duplicate note: you have already uploaded a note with the same title, course code, academic year, and instructor'
          )
        } else {
          console.error(dbUploadError)
          throw new Error('Something went wrong, please try again later')
        }
      }
      try {
        // Note has been saved to DB, now upload file to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: getS3Key(note),
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        )
        savedNotes.push(note)
      } catch (s3UploadError) {
        console.error(s3UploadError)
        await deleteNote(note)
        throw new Error('Something went wrong, please try again later')
      }
    } catch (error) {
      await Promise.allSettled(savedNotes.map(deleteFileAndNote))
      throw error
    }
  }
  res.status(201).json(savedNotes)
})

// @desc Like/dislike a note
// @route PATCH /api/notes/:id/rating
// @access Private
const updateNoteRating = asyncHandler(async (req, res) => {
  if (!req.body || (!req.body.likes?.trim() && !req.body.dislikes?.trim())) {
    res.status(400)
    throw new Error('Bad request')
  }
  // Use a transaction to ensure that both the Note and User documents are
  // updated atomically. This prevents race conditions from causing incorrect/
  // inconsistent state, e.g. a user liking the same note twice, or a note's
  // likes/dislikes count being incorrect due to concurrent updates. Wrap in
  // a loop to automatically retry if a TransientTransactionError or
  // UnknownTransactionCommitResult occurs
  let updatedUser
  let updatedNote
  let session
  let i
  for (i = 0; i < MAX_RETRIES_TRANSACTIONS; i++) {
    try {
      session = await mongoose.startSession()
      session.startTransaction()
    } catch (error) {
      console.error('Could not start transaction session:', error)
      throw new Error('Something went wrong, please try again later')
    }

    try {
      // Refetch user inside the transaction session
      const user = await User.findById(req.user._id).session(session)
      if (!user) {
        throw new Error('User not found')
      }

      const note = await Note.findById(req.params.id).session(session)
      if (!note) {
        throw new Error('Note not found')
      }

      const likes = req.body.likes?.trim()
      const dislikes = req.body.dislikes?.trim()

      if (likes === '+' && !user.likedNotes.includes(note._id)) {
        note.likes += 1
        user.likedNotes = [
          note._id,
          ...user.likedNotes.filter(
            (id) => id.toString() !== note._id.toString()
          ),
        ]
      } else if (
        likes === '-' &&
        note.likes > 0 &&
        user.likedNotes.includes(note._id)
      ) {
        note.likes -= 1
        user.likedNotes = user.likedNotes.filter(
          (id) => id.toString() !== note._id.toString()
        )
      }

      if (dislikes === '+' && !user.dislikedNotes.includes(note._id)) {
        note.dislikes += 1
        user.dislikedNotes = [
          note._id,
          ...user.dislikedNotes.filter(
            (id) => id.toString() !== note._id.toString()
          ),
        ]
      } else if (
        dislikes === '-' &&
        note.dislikes > 0 &&
        user.dislikedNotes.includes(note._id)
      ) {
        note.dislikes -= 1
        user.dislikedNotes = user.dislikedNotes.filter(
          (id) => id.toString() !== note._id.toString()
        )
      }

      updatedNote = await note.save({ session })
      updatedUser = await user.save({ session })

      await session.commitTransaction()
      break
    } catch (error) {
      await session.abortTransaction()
      if (
        !(
          error.errorLabels?.includes('TransientTransactionError') ||
          error.errorLabels?.includes('UnknownTransactionCommitResult')
        )
      ) {
        console.error(error)
        if (error.message === 'Note not found') {
          res.status(404)
          throw error
        }
        throw new Error('Something went wrong, please try again later')
      }
    } finally {
      session.endSession()
    }
  }

  if (i === MAX_RETRIES_TRANSACTIONS) {
    res.status(503)
    throw new Error('Something went wrong, please try again later')
  }

  try {
    await updatedUser.populate({
      path: 'likedNotes',
      populate: { path: 'user', select: 'name _id' },
    })
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }

  const likedNotes = updatedUser.likedNotes.filter(Boolean)
  const likedNotesDisplay = likedNotes
    .slice(0, MAX_LIKED_NOTES_DASHBOARD)
    .map(processNoteForDisplay)

  updatedUser.likedNotes = likedNotes.map((note) => note._id)

  res.status(200).json({
    likes: updatedNote.likes,
    dislikes: updatedNote.dislikes,
    likedNotesDisplay,
    likedNotes: updatedUser.likedNotes,
    dislikedNotes: updatedUser.dislikedNotes,
  })
})

// @desc Get notes uploaded by the current user, optionally search/filter by title, course code, academic year, and instructor, and sort by recency or likes
// Supports cursor-based pagination
// @route GET /api/users/me/notes
// @access Private
const getMyNotes = asyncHandler(async (req, res) => {
  const sortBy = getSortBy(req.query)
  let searchQuery
  try {
    searchQuery = {
      user: req.user._id,
      ...buildSearchQuery(req.query, sortBy),
    }
  } catch (error) {
    res.status(400)
    throw error
  }

  try {
    const { processedNotes, hasMore } = await getNotes(searchQuery, sortBy)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
})

// @desc Get notes liked by the current user, optionally search/filter by title, course code, academic year, and instructor, and sort by recency or likes
// Supports cursor-based pagination
// @route GET /api/users/me/notes/liked
// @access Private
const getLikedNotes = asyncHandler(async (req, res) => {
  const sortBy = getSortBy(req.query)
  let searchQuery
  try {
    searchQuery = {
      _id: { $in: req.user.likedNotes },
      ...buildSearchQuery(req.query, sortBy),
    }
  } catch (error) {
    res.status(400)
    throw error
  }

  try {
    const { processedNotes, hasMore } = await getNotes(searchQuery, sortBy)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
})

// @desc Update current user's note
// @route PATCH /api/users/me/notes/:id
// @access Private
const updateMyNote = asyncHandler(async (req, res) => {
  const courseCode = req.body.courseCode?.trim()
  const academicYear = req.body.academicYear?.trim()
  const instructor = req.body.instructor?.trim()

  if (!courseCode || !academicYear) {
    res.status(400)
    throw new Error('Please fill in all required fields')
  }

  const update = {
    $set: {
      courseCode: courseCode.toUpperCase(),
      academicYear,
      ...(typeof req.body.isAnonymous === 'boolean'
        ? { isAnonymous: req.body.isAnonymous }
        : {}),
    },
    $unset: {},
  }

  if (instructor) {
    update.$set.instructor = instructor
  } else {
    update.$unset.instructor = 1
  }

  let note
  try {
    note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      update,
      { upsert: false, new: true }
    ).populate('user', 'name _id')
  } catch (error) {
    if (error.code === 11000) {
      res.status(409)
      throw new Error(
        'Duplicate note: you have already uploaded a note with the same title, course code, academic year, and instructor'
      )
    } else {
      console.error(error)
      throw error
    }
  }

  if (note) {
    const processedNote = processNoteForDisplay(note)
    return res.status(200).json(processedNote)
  } else {
    res.status(404)
    throw new Error('Note not found')
  }
})

// @desc Delete current user's note
// @route DELETE /api/users/me/notes/:id
// @access Private
const deleteMyNote = asyncHandler(async (req, res) => {
  let note
  try {
    note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    await deleteFile(note) // This will catch and log any error that occurs

    await note.deleteOne()

    // This order of deletion ensures both are attemped, regardless
    // of whether the other fails (deleteFile does not throw an error, it
    // catches and logs it)

    res.status(204).end()
  } catch (error) {
    note
      ? console.error(
          `Could not delete note ${note._id.toString()} from DB:`,
          error
        )
      : console.error(error)
    throw error
  }
})

export {
  getBrowseNotes,
  getNoteFile,
  uploadNotes,
  updateNoteRating,
  getMyNotes,
  getLikedNotes,
  updateMyNote,
  deleteMyNote,
}
