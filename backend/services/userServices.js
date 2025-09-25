import { processNoteForDisplay } from '../utils/noteUtils.js'
import {
  MAX_RECENT_NOTES,
  MAX_LIKED_NOTES_DASHBOARD,
} from '../config/constants.js'
import { Resend } from 'resend'

const populateAndSanitizeUserNotes = async (user) => {
  /* Populate the user's recentlyViewedNotes, likedNotes, and dislikedNotes to
   * get the actual note objects and send those back to the client, and in the
   * DB, update the fields to store only the IDs of the notes that still exist
   */

  await user.populate([
    {
      path: 'recentlyViewedNotes',
      populate: { path: 'user', select: 'name _id' },
    },
    {
      path: 'likedNotes',
      populate: { path: 'user', select: 'name _id' },
    },
    {
      path: 'dislikedNotes',
      populate: { path: 'user', select: 'name _id' },
    },
  ])

  const recentNotes = user.recentlyViewedNotes
    .filter(Boolean)
    .slice(0, MAX_RECENT_NOTES)

  const processedRecentNotes = recentNotes.map(processNoteForDisplay)

  user.recentlyViewedNotes = recentNotes.map((note) => note._id)

  const likedNotes = user.likedNotes.filter(Boolean)

  const processedLikedNotesDisplay = likedNotes
    .slice(0, MAX_LIKED_NOTES_DASHBOARD)
    .map(processNoteForDisplay)

  user.likedNotes = likedNotes.map((note) => note._id)

  user.dislikedNotes = user.dislikedNotes
    .filter(Boolean)
    .map((note) => note._id)

  return { processedRecentNotes, processedLikedNotesDisplay }
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
    throw new Error('Failed to send verification email, please try again later')
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
    throw new Error(
      'Failed to send password reset email, please try again later'
    )
  }
}

export {
  populateAndSanitizeUserNotes,
  sendVerificationEmail,
  sendPasswordResetEmail,
}
