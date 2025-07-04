import express from 'express'

import {
  getNotes,
  getNoteById,
  uploadNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js'

const router = express.Router()

router.get('/', getNotes)

router.get('/:id', getNoteById)

router.post('/', uploadNote)

router.put('/:id', updateNote)

router.delete('/:id', deleteNote)

export default router
