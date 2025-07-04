import express from 'express'

import {
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/', loginUser) // login an existing user

router.post('/', registerUser) // register a new user

router.put('/:id', updateUser) // update recently viewed notes

router.delete('/:id', deleteUser) // delete account

export default router
