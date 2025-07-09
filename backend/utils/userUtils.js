import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const isStrongPassword = (password) => {
  return (
    password.length >= 12 && // Contains at least 12 characters
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
    from: `Course Note Sharing App <${process.env.EMAIL_FROM}>`,
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
  generateToken,
  isStrongPassword,
  hashVerificationToken,
  sendVerificationEmail,
}
