import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import {
  ACCESS_TOKEN_EXPIRY_MINS,
  REFRESH_TOKEN_EXPIRY_DAYS,
  MIN_PASSWORD_LENGTH,
} from '../config/constants.js'

const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRY_MINS}m`,
  })
}

const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  })
}

const isValidEmail = (email) => {
  return validator.isEmail(email)
}

const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: MIN_PASSWORD_LENGTH,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
}

const generateRandomToken = (length) => {
  return crypto.randomBytes(length).toString('hex')
}

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export {
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  hashToken,
  hashPassword,
}
