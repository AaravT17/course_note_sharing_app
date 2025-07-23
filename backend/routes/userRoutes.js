import express from 'express'
import {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgotPassword,
  refreshAccessToken,
  resetPassword,
  getMe,
  updateMe,
  deleteMe,
} from '../controllers/userController.js'
import {
  getMyNotes,
  updateMyNote,
  deleteMyNote,
} from '../controllers/noteController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', registerUser)

router.get('/verify', verifyUser)

router.post('/login', loginUser)

router.post('/logout', logoutUser)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', resetPassword)

router.post('/auth/refresh', refreshAccessToken)

router.get('/me', authenticateUser, getMe)

router.put('/me', authenticateUser, updateMe)

router.delete('/me', authenticateUser, deleteMe)

router.get('/me/notes', authenticateUser, getMyNotes)

router.put('/me/notes/:id', authenticateUser, updateMyNote)

router.delete('/me/notes/:id', authenticateUser, deleteMyNote)

export default router
