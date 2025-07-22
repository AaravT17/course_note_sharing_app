import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import {
  generateAccessToken,
  generateRefreshToken,
  isStrongPassword,
  hashToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/userUtils.js'
import {
  VERIFICATION_LINK_EXPIRY_HRS,
  REFRESH_TOKEN_EXPIRY_DAYS,
  PASSWORD_RESET_EXPIRY_MINS,
  MAX_RECENT_NOTES,
  MIN_PASSWORD_LENGTH,
} from '../config/constants.js'

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
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character`
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

  const hashedToken = hashToken(token)

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(
        Date.now() + 1000 * 60 * 60 * VERIFICATION_LINK_EXPIRY_HRS
      ),
    })

    const verificationLink = `${process.env.VITE_BACKEND_BASE_URL}/api/users/verify?token=${token}`

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

// @desc Verify user's email
// @route GET /api/users/verify
// @access Public
const verifyUser = asyncHandler(async (req, res) => {
  const frontendBaseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : import.meta.env.VITE_FRONTEND_BASE_URL
  if (!req.query || !req.query.token) {
    return res.redirect(`${frontendBaseUrl}/verify/invalid`)
  }

  const user = await User.findOne({
    verificationToken: hashToken(req.query.token.trim()),
  })

  if (!user) {
    return res.redirect(`${frontendBaseUrl}/verify/invalid`)
  }

  if (user.verificationTokenExpiry < Date.now()) {
    try {
      await user.deleteOne()
    } catch (error) {
      console.log(`Could not delete user ${user._id.toString()}`)
    }
    return res.redirect(`${frontendBaseUrl}/verify/expired`)
  }

  user.isVerified = true
  user.verificationToken = undefined
  user.verificationTokenExpiry = undefined
  try {
    await user.save()
    return res.redirect(`${frontendBaseUrl}/verify/success`)
  } catch (error) {
    console.log(error)
    return res.redirect(`${frontendBaseUrl}/verify/internal-error`)
  }
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

  await user.populate({
    path: 'recentlyViewedNotes',
    populate: { path: 'user', select: 'name _id' },
  })

  const notes = user.recentlyViewedNotes.slice(0, MAX_RECENT_NOTES)

  const processedNotes = notes.map((note) => {
    if (note.isAnonymous) {
      return {
        ...note.toObject(),
        user: {
          _id: note.user?._id,
          id: note.user?._id?.toString(),
          name: '-',
        },
      }
    }
    return note.toObject()
  })

  user.recentlyViewedNotes = notes.map((note) => note._id)

  await user.save()

  res.cookie('refreshToken', generateRefreshToken(user._id.toString()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  })

  // All checks complete, input data is valid, we can login the user
  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      recentlyViewedNotes: processedNotes,
      likedNotes: user.likedNotes,
      dislikedNotes: user.dislikedNotes,
    },
    accessToken: generateAccessToken(user._id.toString()),
  })
})

// @desc Logout user
// @route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
  })

  res.status(204).end()
})

// @desc Send password reset email
// @route POST /api/users/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.email) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const email = req.body.email.trim().toLowerCase()

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(200).json({
      message:
        'If this email is registered, a password reset link has been sent',
    })
  }

  const token = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = hashToken(token)
  user.passwordResetTokenExpiry = new Date(
    Date.now() + 1000 * 60 * PASSWORD_RESET_EXPIRY_MINS
  )

  try {
    await user.save()
    const passwordResetLink = `${process.env.VITE_FRONTEND_BASE_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, passwordResetLink)
  } catch (error) {
    console.log(error)
  }

  res.status(200).json({
    message: 'If this email is registered, a password reset link has been sent',
  })
})

// @desc Reset password
// @route POST /api/users/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.password || !req.body.confirmPassword) {
    res.status(400)
    throw new Error('Missing fields')
  }

  if (!req.query || !req.query.token) {
    res.status(400)
    throw new Error('Bad request')
  }

  const password = req.body.password.trim()
  const confirmPassword = req.body.confirmPassword.trim()

  if (password !== confirmPassword) {
    res.status(400)
    throw new Error('Passwords do not match')
  }

  if (!isStrongPassword(password)) {
    res.status(400)
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character`
    )
  }

  const user = await User.findOne({
    passwordResetToken: hashToken(req.query.token.trim()),
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid link')
  }

  if (user.passwordResetTokenExpiry < Date.now()) {
    res.status(400)
    throw new Error('Link expired, please request a new password reset link')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  user.password = hashedPassword
  user.passwordResetToken = undefined
  user.passwordResetTokenExpiry = undefined
  try {
    await user.save()
    res.status(200).json({
      message: 'Password reset successful!',
    })
  } catch (error) {
    console.log(error)
    throw error
  }
})

// @desc Refresh access token
// @route POST /api/users/auth/refresh
// @access Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    res.status(401)
    throw new Error('Unauthorized, please login again')
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    if (!decoded || decoded.type !== 'refresh') {
      throw new Error('Unauthorized, invalid refresh token')
    }
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      throw new Error('User not found')
    }
    res.status(200).json({
      accessToken: generateAccessToken(user._id.toString()),
    })
  } catch (error) {
    console.log(error)
    res.status(401)
    throw new Error('Unauthorized, please login again')
  }
})

// @desc Get current user's data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  await req.user.populate({
    path: 'recentlyViewedNotes',
    populate: { path: 'user', select: 'name _id' },
  })

  const notes = req.user.recentlyViewedNotes.slice(0, MAX_RECENT_NOTES)

  const processedNotes = notes.map((note) => {
    if (note.isAnonymous) {
      return {
        ...note.toObject(),
        user: {
          _id: note.user?._id,
          id: note.user?._id?.toString(),
          name: '-',
        },
      }
    }
    return note.toObject()
  })

  req.user.recentlyViewedNotes = notes.map((note) => note._id)

  await req.user.save()

  res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      recentlyViewedNotes: processedNotes,
      likedNotes: req.user.likedNotes,
      dislikedNotes: req.user.dislikedNotes,
    },
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
    await req.user.populate({
      path: 'recentlyViewedNotes',
      populate: { path: 'user', select: 'name _id' },
    })

    const notes = req.user.recentlyViewedNotes.slice(0, MAX_RECENT_NOTES)

    const processedNotes = notes.map((note) => {
      if (note.isAnonymous) {
        return {
          ...note.toObject(),
          user: {
            _id: note.user?._id,
            id: note.user?._id?.toString(),
            name: '-',
          },
        }
      }
      return note.toObject()
    })
    req.user.recentlyViewedNotes = notes.map((note) => note._id)
    const updatedUser = await req.user.save()
    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        recentlyViewedNotes: processedNotes,
        likedNotes: updatedUser.likedNotes,
        dislikedNotes: updatedUser.dislikedNotes,
      },
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
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    })
    res.status(204).end()
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') res.status(400)
    throw error
  }
})

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  getMe,
  updateMe,
  deleteMe,
}
