import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
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

const isStrongPassword = (password) => {
  return (
    password.length >= MIN_PASSWORD_LENGTH && // Is sufficiently long
    /[A-Z]/.test(password) && // Contains at least one uppercase letter
    /[a-z]/.test(password) && // Contains at least one lowercase letter
    /\d/.test(password) && // Contains at least one digit
    /[^a-zA-Z0-9]/.test(password) // Contains at least one special character
  )
}

const hashVerificationToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const sendVerificationEmail = async (toEmail, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: `Noteable <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Verify your account',
    html: `<p>Please verify your account by clicking the link: <a href="${verificationLink}">Verify Account</a></p>`,
    text: `Please verify your account by clicking the link: ${verificationLink}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully')
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  isStrongPassword,
  hashVerificationToken,
  sendVerificationEmail,
}
