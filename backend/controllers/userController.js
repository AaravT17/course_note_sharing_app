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
  res.json({ message: 'Register user' })
})

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  res.json({ message: 'Login user' })
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

export { registerUser, loginUser, getUser, updateUser, deleteUser }
