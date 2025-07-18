import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  getNotesMetadata,
  getNoteFile,
  uploadNotes,
  updateNoteRating,
} from '../controllers/noteController.js'
import { storage } from '../config/upload.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { MAX_FILE_SIZE_MB, MAX_FILES } from '../config/constants.js'

const router = express.Router()

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!req.body || !req.body.university || !req.body.courseCode) {
      return cb(new Error('Missing fields'))
    }

    req.body.university = req.body.university.trim()
    req.body.courseCode = req.body.courseCode.trim().toUpperCase()

    if (
      path.extname(file.originalname).toLowerCase().trim() !== '.pdf' ||
      file.mimetype !== 'application/pdf'
    ) {
      return cb(new Error('Invalid file format'))
    }
    cb(null, true)
  },
})

router.get('/', authenticateUser, getNotesMetadata)

router.get('/:id/view', authenticateUser, getNoteFile)

router.post('/', authenticateUser, upload.array('note', MAX_FILES), uploadNotes)

router.patch('/:id/rating', authenticateUser, updateNoteRating)

export default router
