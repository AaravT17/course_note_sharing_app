import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/userModel.js'
import {
  generateToken,
  isStrongPassword,
  hashVerificationToken,
  sendVerificationEmail,
} from '../utils/userUtils.js'
import { VERIFICATION_LINK_EXPIRY_HRS } from '../config/constants.js'

// @desc Register user, pending verification
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  if (
    !req.body ||
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword
  ) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const name = req.body.name.trim()
  const email = req.body.email.trim().toLowerCase()
  const password = req.body.password.trim()
  const confirmPassword = req.body.confirmPassword.trim()

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

  /* All checks complete, input data is valid, we can register the user
   * We need not manually check whether there already exists a user with
   * the same email, MongoDB does this for us
   */

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const token = crypto.randomBytes(32).toString('hex')

  const hashedToken = hashVerificationToken(token)

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry:
        Date.now() + 1000 * 60 * 60 * VERIFICATION_LINK_EXPIRY_HRS,
    })

    const verificationLink = `${
      process.env.BACKEND_BASE_URL
    }/api/users/verify?userId=${user._id.toString()}&token=${token}`

    await sendVerificationEmail(email, verificationLink)

    res.status(201).end()
  } catch (error) {
    if (error.code && error.code === 11000) {
      res.status(409)
      throw new Error('A user with the given email already exists')
    }
    throw error // If some other error occurs, pass it to the error handling middleware
  }
})

// @desc Verify user
// @route GET /api/users/verify
// @access Public
const verifyUser = asyncHandler(async (req, res) => {
  // TODO: Change all responses to redirect the user to the login page upon
  // success or in case the user's account has already been verified, or to a
  // 'Something went wrong' page with an appropriate message in case of an error
  if (!req.query || !req.query.userId || !req.query.token) {
    res.status(400)
    throw new Error('Bad request')
  }

  const user = await User.findById(req.query.userId.trim())

  if (!user) {
    res.status(400)
    throw new Error('User not found')
  }

  if (user.isVerified) {
    res.status(400)
    throw new Error('Email has already been verified')
  }

  if (!user.verificationToken) {
    try {
      await user.deleteOne()
    } catch (error) {
      console.log(`Could not delete user ${user._id.toString()}`)
    }
    res.status(400)
    throw new Error(
      'Something went wrong while registering your account, please re-register your account'
    )
  }

  const hashedToken = hashVerificationToken(req.query.token.trim())

  if (hashedToken !== user.verificationToken) {
    try {
      await user.deleteOne()
    } catch (error) {
      console.log(`Could not delete user ${user._id.toString()}`)
    }
    res.status(400)
    throw new Error(
      'Invalid verification link, please re-register your account'
    )
  }

  if (user.verificationTokenExpiry < Date.now()) {
    try {
      await user.deleteOne()
    } catch (error) {
      console.log(`Could not delete user ${user._id.toString()}`)
    }
    res.status(400)
    throw new Error(
      'Verification link has expired, please re-register your account'
    )
  }

  user.isVerified = true
  user.verificationToken = undefined
  user.verificationTokenExpiry = undefined
  await user.save()
  res.status(200).json({
    message: 'Your email has been verified',
  })
})

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const email = req.body.email.trim().toLowerCase()
  const password = req.body.password.trim()

  const user = await User.findOne({ email })

  if (!(user && (await bcrypt.compare(password, user.password)))) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  if (!user.isVerified) {
    res.status(403)
    throw new Error('Please verify your email before logging in')
  }

  /* Populate the user's recentlyViewedNotes to get the actual note objects and
   * send those back to the client, and in the DB, update the field to store
   * only the IDs of the notes that still exist (those that are missing from the
   * populated list have likely been deleted)
   */

  await user.populate('recentlyViewedNotes')

  const notes = user.recentlyViewedNotes

  user.recentlyViewedNotes = notes.map((note) => note._id)

  await user.save()

  // All checks complete, input data is valid, we can login the user
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    recentlyViewedNotes: notes,
    token: generateToken(user.id),
  })
})

// @desc Get current user's data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  await req.user.populate('recentlyViewedNotes')

  const notes = req.user.recentlyViewedNotes

  req.user.recentlyViewedNotes = notes.map((note) => note._id)

  await req.user.save()

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    recentlyViewedNotes: notes,
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
  if (req.body.recentlyViewedNotes) {
    // req.body.recentlyViewedNotes would be an array of note IDs
    req.user.recentlyViewedNotes = req.body.recentlyViewedNotes
  }
  try {
    await req.user.populate('recentlyViewedNotes')
    const notes = req.user.recentlyViewedNotes
    req.user.recentlyViewedNotes = notes.map((note) => note._id)
    const updatedUser = await req.user.save()
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      recentlyViewedNotes: notes,
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      res.status(400)
      throw new Error('Bad request')
    }
    throw error
  }
})

// TODO: Add forgot password functionality

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

export { registerUser, verifyUser, loginUser, getMe, updateMe, deleteMe }
