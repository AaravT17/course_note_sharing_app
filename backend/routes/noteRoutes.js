import express from 'express'
import multer from 'multer'
import {
  getBrowseNotes,
  getNoteFile,
  uploadNotes,
  updateNoteRating,
} from '../controllers/noteController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import { MAX_FILE_SIZE_MB, MAX_FILES } from '../config/constants.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !req.body ||
      !req.body.courseCode?.trim() ||
      !req.body.academicYear?.trim()
    ) {
      return cb(new Error('Missing fields'), false)
    }

    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Invalid file format'), false)
    }

    cb(null, true)
  },
})

router.get('/', authenticateUser, getBrowseNotes)

router.get('/:id/view', authenticateUser, getNoteFile)

router.post('/', authenticateUser, upload.array('note', MAX_FILES), uploadNotes)

router.patch('/:id/rating', authenticateUser, updateNoteRating)

export default router
