import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const authenticateUser = asyncHandler(async (req, res, next) => {
  let token
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    res.status(401)
    throw new Error('Unauthorized')
  }

  try {
    token = req.headers.authorization.split(' ')[1]
    if (!token) {
      throw new Error('Unauthorized, no token')
    }
    token = token.trim()
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    if (!decoded || decoded.type !== 'access') {
      throw new Error('Unauthorized, invalid access token')
    }
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      throw new Error('User not found')
      // This error message will not be sent to the client, it is only for tracing the error
    }
    next()
  } catch (error) {
    console.log(error)
    res.status(401)
    throw new Error('Unauthorized')
  }
})

export { authenticateUser }
