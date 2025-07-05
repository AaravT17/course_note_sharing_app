import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/userModel.js'

// @desc Register user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const { name, email, password, confirmPassword } = req.body

  if (!name || !email || !password || !confirmPassword) {
    res.status(400)
    throw new Error('Missing fields')
  }

  if (password !== confirmPassword) {
    res.status(400)
    throw new Error('Passwords do not match')
  }

  // TODO: Add some more checks for validity of email, strength of password

  /* All checks complete, input data is valid, we can register the user
   * We need not manually check whether there already exists a user with
   * the same email, MongoDB does this for us
   */

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201)
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: _generateToken(user.id),
    })
  } catch (error) {
    if (error.code && error.code === 11000) {
      res.status(409)
      throw new Error('A user with the given email already exists')
    }
    throw error // If some other error occurs, pass it to the error handling middleware
  }
})

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const user = User.findOne({ email })

  if (!(user && (await bcrypt.compare(password, user.password)))) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  // All checks complete, input data is valid, we can login the user
  res.status(200)
  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: _generateToken(user.id),
  })
})

// @desc Get user data
// @route GET /api/users/me
// @access Private
const getUser = asyncHandler(async (req, res) => {
  res.json({ message: 'Get user' })
})

// @desc Update user
// @route PUT /api/users/me
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  res.json({ message: 'Update user' })
})

// @desc Delete user
// @route DELETE /api/users/me
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  res.json({ message: 'Delete user' })
})

const _generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

export { registerUser, loginUser, getUser, updateUser, deleteUser }
