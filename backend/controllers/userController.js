import asyncHandler from 'express-async-handler'
/* When interacting with the database, each of the route handlers will
 * become async, and wrapping them in the asyncHandler allows us to avoid
 * having to write try/catch blocks for error handling in each function
 */

// @desc Login user
// @route GET /api/users
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  res.json({message: 'Login user'})
})

// @desc Register user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400)
    throw new Error("Please fill in the name field")
  }
  res.json({message: 'Register user'})
})

// @desc Update user
// @route PUT /api/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  res.json({message: `Update user ${req.params.id}`})
})

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  res.json({message: `Delete user ${req.params.id}`})
})

export { loginUser, registerUser, updateUser, deleteUser }