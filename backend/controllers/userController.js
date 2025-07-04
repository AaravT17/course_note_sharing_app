import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */
import User from '../models/userModel.js'

// @desc Register user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {})

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {})

// @desc Get user data
// @route GET /api/users/me
// @access Private
const getUser = asyncHandler(async (req, res) => {})

// @desc Update user
// @route PUT /api/users/me
// @access Private
const updateUser = asyncHandler(async (req, res) => {})

// @desc Delete user
// @route DELETE /api/users/me
// @access Private
const deleteUser = asyncHandler(async (req, res) => {})

export { registerUser, loginUser, getUser, updateUser, deleteUser }
