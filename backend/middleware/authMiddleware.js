import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

// TODO: Change authentication from access tokens to access + refresh tokens

const authenticateUser = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
      }
      token = token.trim()
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        throw new Error('User not found')
        // This error message will not be sent to the client, it is only for tracing the error
      }
      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  } else {
    res.status(401)
    throw new Error('Not authorized')
  }
})

export { authenticateUser }
