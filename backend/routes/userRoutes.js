import express from 'express'
import {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'
import { protectRoute } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', registerUser)

router.post('/login', loginUser)

router.get('/me', protectRoute, getUser)

router.put('/me', protectRoute, updateUser)

router.delete('/me', protectRoute, deleteUser)

export default router
