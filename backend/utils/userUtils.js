import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import { Resend } from 'resend'
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

const sendVerificationEmail = async (toEmail, verificationLink) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `Noteabl <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Verify your account',
    html: `<p>Please verify your account by clicking the link: <a href="${verificationLink}">Verify Account</a></p>`,
    text: `Please verify your account by clicking the link: ${verificationLink}`,
  })

  if (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

const sendPasswordResetEmail = async (toEmail, passwordResetLink) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `Noteabl <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Reset your password',
    html: `<p>Please click the link to reset your password: <a href="${passwordResetLink}">Reset password</a></p>`,
    text: `Please click the link to reset your password: ${passwordResetLink}`,
  })

  if (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  hashToken,
  hashPassword,
  sendVerificationEmail,
  sendPasswordResetEmail,
}
