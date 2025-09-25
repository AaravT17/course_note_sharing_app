import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import {
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  hashToken,
  hashPassword,
} from '../utils/userUtils.js'
import { processNoteForDisplay } from '../utils/noteUtils.js'
import {
  VERIFICATION_LINK_EXPIRY_HRS,
  REFRESH_TOKEN_EXPIRY_DAYS,
  PASSWORD_RESET_EXPIRY_MINS,
  MAX_RECENT_NOTES,
  MIN_PASSWORD_LENGTH,
  RANDOM_TOKEN_LENGTH_BYTES,
} from '../config/constants.js'
import {
  populateAndSanitizeUserNotes,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/userServices.js'

// @desc Register user, pending verification
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  if (
    !req.body ||
    !req.body.name?.trim() ||
    !req.body.email?.trim() ||
    !req.body.password?.trim() ||
    !req.body.confirmPassword?.trim()
  ) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const name = req.body.name.trim()
  const email = req.body.email.trim().toLowerCase()
  const password = req.body.password.trim()
  const confirmPassword = req.body.confirmPassword.trim()

  if (!isValidEmail(email)) {
    res.status(400)
    throw new Error('Invalid email address')
  }

  if (password !== confirmPassword) {
    res.status(400)
    throw new Error('Passwords do not match')
  }

  if (!isStrongPassword(password)) {
    res.status(400)
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character`
    )
  }

  /* All checks complete, input data is valid, we can register the user.
   * We need not manually check whether there already exists a user with
   * the same email, MongoDB does this for us and throws an appropriate
   * error if a duplicate key error occurs.
   */

  // Hash the password before saving it to DB
  const hashedPassword = await hashPassword(password)

  // Generate a verification token
  const token = generateRandomToken(RANDOM_TOKEN_LENGTH_BYTES)
  const hashedToken = hashToken(token)

  try {
    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(
        Date.now() + 1000 * 60 * 60 * VERIFICATION_LINK_EXPIRY_HRS
      ),
    })
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      // Duplicate key error, a user with the given email already exists
      let user
      try {
        user = await User.findOneAndUpdate(
          { email, isVerified: false },
          {
            $set: {
              name,
              password: hashedPassword,
              verificationToken: hashedToken,
              verificationTokenExpiry: new Date(
                Date.now() + 1000 * 60 * 60 * VERIFICATION_LINK_EXPIRY_HRS
              ),
            },
            // Saved user data is from the latest registration attempt
          },
          { upsert: false, new: true }
          // Do not create a new user, only update an existing one, if any
        )
      } catch (err) {
        console.error(err)
        throw new Error('Something went wrong, please try again later')
      }

      if (user) {
        // Send verification email
        const verificationLink = `${process.env.VITE_FRONTEND_BASE_URL}/verify?token=${token}`
        await sendVerificationEmail(email, verificationLink)
        // On failure, this logs the error and throws

        return res.status(201).end()
      } else {
        // No user found, so the existing user with the given email is already verified
        res.status(409)
        throw new Error('A user with the given email already exists')
      }
    } else {
      // Some other error occurred, log it and return a generic error message
      console.error(error)
      throw new Error('Something went wrong, please try again later')
    }
  }

  // Send verification email
  const verificationLink = `${process.env.VITE_FRONTEND_BASE_URL}/verify?token=${token}`
  await sendVerificationEmail(email, verificationLink)
  // On failure, this logs the error and throws

  return res.status(201).end()
})

// TODO: For existing but unverified users, create a new endpoint specifically
// for resending the verification email rather than requiring them to re-register
// and handling it at the registration endpoint

// @desc Verify user's email
// @route POST /api/users/verify
// @access Public
const verifyUser = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.token?.trim()) {
    res.status(400)
    throw new Error('Invalid link')
  }

  // TODO: After verification, make the user reset their password for security,
  // set the password to some random value and send them a password reset link

  /* To prevent any race conditions, use findOneAndUpdate. This will allow us
   * to find and update the user atomically. On failure, narrow down the reason
   * for failure (invalid link, expired link, or internal error) and respond
   * accordingly. On success, return immediately.
   */
  const hashedToken = hashToken(req.body.token.trim())
  let user
  try {
    user = await User.findOneAndUpdate(
      {
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: Date.now() },
        isVerified: false, // not strictly necessary, but good to have
      },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
      },
      { upsert: false, new: true }
      // return the updated document, currently unused, but may be useful later
    )

    if (user) {
      return res.status(200).json({ message: 'Success' })
    }

    user = await User.findOneAndDelete({
      verificationToken: hashedToken,
      isVerified: false, // again, not strictly necessary, but good to have
    })

    if (user) {
      // A user with the matching token exists, but the token has expired
      res.status(400)
      throw new Error('Expired link')
    }

    // If we reach here, the token is invalid rather than expired
    res.status(400)
    throw new Error('Invalid link')
  } catch (error) {
    console.error(error)
    throw error
  }
})

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.email?.trim() || !req.body.password?.trim()) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const email = req.body.email.trim().toLowerCase()
  const password = req.body.password.trim()

  let user
  try {
    user = await User.findOne({ email })
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  if (!user.isVerified) {
    res.status(403)
    throw new Error('Please verify your email before logging in')
  }

  try {
    const { processedRecentNotes, processedLikedNotesDisplay } =
      await populateAndSanitizeUserNotes(user)

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
        recentlyViewedNotes: processedRecentNotes,
        likedNotesDisplay: processedLikedNotesDisplay,
        likedNotes: user.likedNotes,
        dislikedNotes: user.dislikedNotes,
      },
      accessToken: generateAccessToken(user._id.toString()),
    })

    // Save the user to remove any stale notes, do this after sending the
    // response to avoid slowing down login
    user.save().catch((error) => {
      console.error('Failed to remove stale notes from user:', error)
    })
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }
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
  if (!req.body || !req.body.email?.trim()) {
    res.status(400)
    throw new Error('Missing fields')
  }

  const email = req.body.email.trim().toLowerCase()
  const token = generateRandomToken(RANDOM_TOKEN_LENGTH_BYTES)

  let user
  try {
    user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          passwordResetToken: hashToken(token),
          passwordResetTokenExpiry: new Date(
            Date.now() + 1000 * 60 * PASSWORD_RESET_EXPIRY_MINS
          ),
        },
      },
      { upsert: false, new: true }
    )
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }

  if (user) {
    // Send password reset email
    const passwordResetLink = `${process.env.VITE_FRONTEND_BASE_URL || ''}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, passwordResetLink)
    // On failure, this logs the error and throws
  }

  // Same response regardless of whether a user with the given email exists or
  // not, this is to prevent user enumeration attacks
  return res.status(200).json({
    message: 'If this email is registered, a password reset link has been sent',
  })
})

// @desc Reset password
// @route POST /api/users/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.token?.trim()) {
    res.status(400)
    throw new Error('Invalid link')
  }

  if (!req.body.password?.trim() || !req.body.confirmPassword?.trim()) {
    res.status(400)
    throw new Error('Missing fields')
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
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character`
    )
  }

  /* Use findOneAndUpdate to atomically find and update the user's
   * password. This prevents two concurrent requests from both
   * succeeding and causing confusion as to which password is valid
   * afterwards.
   */
  const hashedToken = hashToken(req.body.token.trim())

  let user
  try {
    user = await User.findOneAndUpdate(
      {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { $gt: Date.now() },
      },
      {
        $set: { password: await hashPassword(password) },
        $unset: { passwordResetToken: 1, passwordResetTokenExpiry: 1 },
      },
      { upsert: false, new: true }
    )
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }

  if (user) {
    return res.status(200).json({
      message: 'Password reset successful!',
    })
  }

  try {
    user = await User.findOne({
      passwordResetToken: hashedToken,
    })
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }

  if (user) {
    // The user with the matching token exists, but the token has expired
    res.status(400)
    throw new Error('Link expired, please request a new password reset link')
  } else {
    res.status(400)
    throw new Error('Invalid link')
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
    console.error(error)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    })
    res.status(401)
    throw new Error('Unauthorized, please login again')
  }
})

// @desc Get current user's data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  try {
    const { processedRecentNotes, processedLikedNotesDisplay } =
      await populateAndSanitizeUserNotes(req.user)

    res.status(200).json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        recentlyViewedNotes: processedRecentNotes,
        likedNotesDisplay: processedLikedNotesDisplay,
        likedNotes: req.user.likedNotes,
        dislikedNotes: req.user.dislikedNotes,
      },
    })

    // Save the user to remove any stale notes, do this after sending the
    // response to avoid slowing down the request
    req.user.save().catch((error) => {
      console.error('Failed to remove stale notes from user:', error)
    })
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong, please try again later')
  }
})

// TODO: Add a route specifically for updating users' recently viewed notes,
// or incorporate it into the note viewing route

// TODO: Change the mechanism for updating users' recently viewed notes, rather
// than sending an array of note IDs from the frontend, send just the ID of the
// most recently viewed note and update the array in the backend, this is both
// safer in terms of maintaining correct state and more efficient

// @desc Update current user's data
// @route PATCH /api/users/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400)
    throw new Error('Missing fields')
  }

  if (req.body.recentlyViewedNotes) {
    if (
      !Array.isArray(req.body.recentlyViewedNotes) ||
      !req.body.recentlyViewedNotes.every(mongoose.Types.ObjectId.isValid)
    ) {
      res.status(400)
      throw new Error('Bad request')
    } else {
      req.user.recentlyViewedNotes = req.body.recentlyViewedNotes
    }
  }

  try {
    await req.user.populate({
      path: 'recentlyViewedNotes',
      populate: { path: 'user', select: 'name _id' },
    })

    const notes = req.user.recentlyViewedNotes
      .filter(Boolean)
      .slice(0, MAX_RECENT_NOTES)

    const processedNotes = notes.map(processNoteForDisplay)
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
    console.error(error)
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
const deleteMe = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    })
    res.status(204).end()
  } catch (error) {
    console.error(
      `Failed to delete user ${req.user?._id?.toString() || 'UNKNOWN'}:`,
      error
    )
    if (error.name === 'CastError') {
      res.status(400)
      throw new Error('Bad request')
    }
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
