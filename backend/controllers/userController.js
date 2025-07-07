import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import bcrypt from 'bcryptjs'
import User from '../models/userModel.js'
import { generateToken, isStrongPassword } from '../utils/userUtils.js'

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

  if (!isStrongPassword(password)) {
    res.status(400)
    throw new Error(
      'Password must be at least 12 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    )
  }

  // TODO: Add some more checks for validity of email

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

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      recentlyViewedNotes: user.recentlyViewedNotes,
      token: generateToken(user.id),
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

  const user = await User.findOne({ email })

  if (!(user && (await bcrypt.compare(password, user.password)))) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  // All checks complete, input data is valid, we can login the user
  res.status(200).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    recentlyViewedNotes: user.recentlyViewedNotes,
    token: generateToken(user.id),
  })
})

// @desc Get current user's data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    recentlyViewedNotes: req.user.recentlyViewedNotes,
  })
})

// @desc Update current user's data
// @route PUT /api/users/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400)
    throw new Error('Missing fields')
  }
  if (req.body.recentlyViewedNotes)
    req.user.recentlyViewedNotes = req.body.recentlyViewedNotes
  try {
    const updatedUser = await req.user.save()
    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      recentlyViewedNotes: updatedUser.recentlyViewedNotes,
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      res.status(400)
      throw new Error('Bad request')
    }
    throw error
  }

  // TODO: Add update password functionality
})

// @desc Delete current user
// @route DELETE /api/users/me
// @access Private
const deleteMe = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id)
    if (!user) {
      res.status(404)
      return next(new Error('User not found'))
    }
    res.status(204).end()
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') res.status(400)
    throw error
  }
})

export { registerUser, loginUser, getMe, updateMe, deleteMe }
