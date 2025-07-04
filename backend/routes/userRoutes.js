import express from 'express'

import {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'

const router = express.Router()

router.post('/', registerUser)

router.post('/login', loginUser)

router.get('/me', getUser)

router.put('/me', updateUser)

router.delete('/me', deleteUser)

export default router
