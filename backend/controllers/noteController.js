import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import Note from '../models/noteModel.js'
import { getS3Client } from '../config/s3.js'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  getS3Key,
  getTitle,
  deleteFile,
  deleteFileAndNote,
  processNoteForDisplay,
} from '../utils/noteUtils.js'
import {
  MAX_NOTES_PER_SEARCH,
  MAX_LIKED_NOTES_DASHBOARD,
} from '../config/constants.js'

// @desc Get notes metadata, optionally filter/search by university and/or course code
// @route GET /api/notes
// @access Private
const getNotesMetadata = asyncHandler(async (req, res) => {
  if (
    req.query.cursorId &&
    !mongoose.Types.ObjectId.isValid(req.query.cursorId.trim())
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  if (
    (req.query.cursorId && !req.query.cursorValue) ||
    (!req.query.cursorId && req.query.cursorValue)
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  const validSortFields = ['createdAt', 'likes']
  const sortBy = validSortFields.includes(req.query.sortBy?.trim())
    ? req.query.sortBy.trim()
    : 'createdAt'

  let cursorClause = {}
  let cursorValue = null

  if (req.query.cursorId && req.query.cursorValue) {
    if (sortBy === 'createdAt') {
      if (isNaN(Date.parse(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = new Date(req.query.cursorValue.trim())
    } else {
      if (isNaN(parseInt(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = parseInt(req.query.cursorValue.trim())
    }
    cursorClause = {
      $or: [
        { [sortBy]: { $lt: cursorValue } },
        { [sortBy]: cursorValue, _id: { $lt: req.query.cursorId.trim() } },
      ],
    }
  }

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
    ...cursorClause,
  }

  const limit = MAX_NOTES_PER_SEARCH

  try {
    const notes = await Note.find(query)
      .sort({ [sortBy]: -1, _id: -1 })
      .limit(limit + 1)
      .populate('user', 'name _id')
    const hasMore = notes.length > limit
    const processedNotes = notes.slice(0, limit).map(processNoteForDisplay)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
  } catch (error) {
    console.log(error)
    throw error
  }
})

// @desc Get note file (PDF)
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
      if (readFileError.name === 'NoSuchKey') {
        res.status(404)
        throw new Error('File not found')
      }
      if (readFileError.name === 'AccessDenied') {
        throw new Error('Access denied')
      }
      throw readFileError
    }
  } catch (error) {
    console.log(error)
    let message
    if (error.message === 'File not found') {
      message = 'File not found'
    }
    throw new Error(message || 'Failed to retrieve file from storage')
  }
})

// @desc Upload notes
// @route POST /api/notes
// @access Private
const uploadNotes = asyncHandler(async (req, res) => {
  /* This will run after multer middleware (if no error occurs), which will
   * parse form data and set req.body and req.files, req.files will be an array of files, and the files' content will be in a buffer in memory
   */
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error('No files submitted')
  }

  const university = req.body.university.trim()
  const courseCode = req.body.courseCode.trim().toUpperCase()

  const existingNote = await Note.findOne({
    user: req.user._id,
    university,
    courseCode,
    title: { $in: req.files.map((file) => getTitle(file.originalname)) },
  })

  if (existingNote) {
    res.status(409)
    throw new Error(
      'You have already uploaded a note with the same title for this course'
    )
  }

  const s3Client = getS3Client()

  let savedNotes = []

  for (const file of req.files) {
    const title = getTitle(file.originalname)
    const uuid = uuidv4().trim()
    try {
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: getS3Key({
              user: req.user._id,
              title,
              uuid,
            }),
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        )
      } catch (s3UploadError) {
        throw new Error('Failed to upload file to storage')
      }
      try {
        const note = await Note.create({
          user: req.user._id,
          university,
          courseCode,
          title,
          isAnonymous: req.body.isAnonymous === 'true',
          uuid,
        })
        savedNotes.push(note)
      } catch (dbUploadError) {
        await deleteFile({
          user: req.user._id,
          title,
          uuid,
        })
        const error = new Error('Failed to save note to DB')
        if (dbUploadError.code === 11000) {
          error.code = 11000
        }
        throw error
      }
    } catch (error) {
      console.log(error)
      let message
      if (error.code === 11000) {
        message =
          'Something went wrong while uploading your notes, please try again'
      }
      await Promise.allSettled(savedNotes.map(deleteFileAndNote))
      if (message) {
        throw new Error(message)
      } else {
        throw error
      }
    }
  }
  res.status(201).json(savedNotes)
})

// @desc Like/dislike a note
// @route PATCH /api/notes/:id/rating
// @access Private
const updateNoteRating = asyncHandler(async (req, res) => {
  if (!req.body || (!req.body.likes && !req.body.dislikes)) {
    res.status(400)
    throw new Error('Bad request')
  }

  const note = await Note.findById(req.params.id)

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  const prevLikes = note.likes
  const prevDislikes = note.dislikes
  const userPrevLikedNotes = req.user.likedNotes || []
  const userPrevDislikedNotes = req.user.dislikedNotes || []

  if (req.body.likes === '+') {
    note.likes += 1
    req.user.likedNotes = [
      note._id,
      ...req.user.likedNotes.filter(
        (id) => id.toString() !== note._id.toString()
      ),
    ]
  } else if (req.body.likes === '-' && note.likes > 0) {
    note.likes -= 1
    req.user.likedNotes = req.user.likedNotes.filter(
      (id) => id.toString() !== note._id.toString()
    )
  }
  if (req.body.dislikes === '+') {
    note.dislikes += 1
    req.user.dislikedNotes = [
      note._id,
      ...req.user.dislikedNotes.filter(
        (id) => id.toString() !== note._id.toString()
      ),
    ]
  } else if (req.body.dislikes === '-' && note.dislikes > 0) {
    note.dislikes -= 1
    req.user.dislikedNotes = req.user.dislikedNotes.filter(
      (id) => id.toString() !== note._id.toString()
    )
  }

  try {
    let updatedUser
    let updatedNote
    await req.user.populate({
      path: 'likedNotes',
      populate: { path: 'user', select: 'name _id' },
    })
    const likedNotes = req.user.likedNotes.filter(Boolean)
    const likedNotesDisplay = likedNotes
      .slice(0, MAX_LIKED_NOTES_DASHBOARD)
      .map(processNoteForDisplay)
      .map((likedNote) =>
        likedNote._id.toString() === note._id.toString()
          ? { ...likedNote, likes: note.likes, dislikes: note.dislikes }
          : likedNote
      )
    // Here, it is important that processNoteForDisplay is called first,
    // processNoteForDisplay only works reliably on Mongoose documents
    req.user.likedNotes = likedNotes.map((note) => note._id)
    try {
      updatedUser = await req.user.save()
    } catch (userSaveError) {
      throw new Error('USER_SAVE_ERROR')
    }
    try {
      updatedNote = await note.save()
    } catch (noteSaveError) {
      throw new Error('NOTE_SAVE_ERROR')
    }
    res.status(200).json({
      likes: updatedNote.likes,
      dislikes: updatedNote.dislikes,
      likedNotesDisplay,
      likedNotes: updatedUser.likedNotes,
      dislikedNotes: updatedUser.dislikedNotes,
    })
  } catch (error) {
    if (error.message === 'USER_SAVE_ERROR') {
      note.likes = prevLikes
      note.dislikes = prevDislikes
      try {
        await note.save()
      } catch (_) {}
    } else if (error.message === 'NOTE_SAVE_ERROR') {
      req.user.likedNotes = userPrevLikedNotes
      req.user.dislikedNotes = userPrevDislikedNotes
      try {
        await req.user.save()
      } catch (_) {}
    }
    throw new Error(
      "Failed to update note's likes and dislikes, please try again"
    )
  }
})

// @desc Get current user's notes
// @route GET /api/users/me/notes
// @access Private
const getMyNotes = asyncHandler(async (req, res) => {
  if (
    req.query.cursorId &&
    !mongoose.Types.ObjectId.isValid(req.query.cursorId.trim())
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  if (
    (req.query.cursorId && !req.query.cursorValue) ||
    (!req.query.cursorId && req.query.cursorValue)
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  const validSortFields = ['createdAt', 'likes']
  const sortBy = validSortFields.includes(req.query.sortBy?.trim())
    ? req.query.sortBy.trim()
    : 'createdAt'

  let cursorClause = {}
  let cursorValue = null

  if (req.query.cursorId && req.query.cursorValue) {
    if (sortBy === 'createdAt') {
      if (isNaN(Date.parse(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = new Date(req.query.cursorValue.trim())
    } else {
      if (isNaN(parseInt(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = parseInt(req.query.cursorValue.trim())
    }
    cursorClause = {
      $or: [
        { [sortBy]: { $lt: cursorValue } },
        { [sortBy]: cursorValue, _id: { $lt: req.query.cursorId.trim() } },
      ],
    }
  }

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
    ...cursorClause,
  }

  const limit = MAX_NOTES_PER_SEARCH

  try {
    const notes = await Note.find(query)
      .sort({ [sortBy]: -1, _id: -1 })
      .limit(limit + 1)
      .populate('user', 'name _id')
    const hasMore = notes.length > limit
    const processedNotes = notes.slice(0, limit).map(processNoteForDisplay)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
  } catch (error) {
    console.log(error)
    throw error
  }
})

// @desc Get notes liked by current user
// @route GET /api/users/me/notes/liked
// @access Private
const getLikedNotes = asyncHandler(async (req, res) => {
  if (
    req.query.cursorId &&
    !mongoose.Types.ObjectId.isValid(req.query.cursorId.trim())
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  if (
    (req.query.cursorId && !req.query.cursorValue) ||
    (!req.query.cursorId && req.query.cursorValue)
  ) {
    res.status(400)
    throw new Error('Bad request')
  }

  const validSortFields = ['createdAt', 'likes']
  const sortBy = validSortFields.includes(req.query.sortBy?.trim())
    ? req.query.sortBy.trim()
    : 'createdAt'

  let cursorClause = {}
  let cursorValue = null

  if (req.query.cursorId && req.query.cursorValue) {
    if (sortBy === 'createdAt') {
      if (isNaN(Date.parse(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = new Date(req.query.cursorValue.trim())
    } else {
      if (isNaN(parseInt(req.query.cursorValue.trim()))) {
        res.status(400)
        throw new Error('Bad request')
      }
      cursorValue = parseInt(req.query.cursorValue.trim())
    }
    cursorClause = {
      $or: [
        { [sortBy]: { $lt: cursorValue } },
        { [sortBy]: cursorValue, _id: { $lt: req.query.cursorId.trim() } },
      ],
    }
  }

  const query = {
    _id: { $in: req.user.likedNotes },
    ...(req.query.university && {
      university: { $regex: req.query.university.trim(), $options: 'i' },
    }),
    ...(req.query.courseCode && {
      courseCode: { $regex: req.query.courseCode.trim(), $options: 'i' },
    }),
    ...(req.query.title && {
      title: { $regex: req.query.title.trim(), $options: 'i' },
    }),
    ...cursorClause,
  }

  const limit = MAX_NOTES_PER_SEARCH

  try {
    const notes = await Note.find(query)
      .sort({ [sortBy]: -1, _id: -1 })
      .limit(limit + 1)
      .populate('user', 'name _id')
    const hasMore = notes.length > limit
    const processedNotes = notes.slice(0, limit).map(processNoteForDisplay)
    res.status(200).json({
      notes: processedNotes,
      hasMore,
    })
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
  updateNoteRating,
  getMyNotes,
  getLikedNotes,
  updateMyNote,
  deleteMyNote,
}
