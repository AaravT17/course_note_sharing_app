import express from 'express'

import { loginUser, registerUser, updateUser, deleteUser } from '../controllers/userController.js'

const router = express.Router()

router.get('/', loginUser)

router.post('/', registerUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)

export default router