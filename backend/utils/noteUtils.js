import path from 'path'
import Note from '../models/noteModel.js'
import { getS3Client } from '../config/s3.js'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

// Helper functions for creating file names for storage and extracting
// information from files for storage in DB
const _slugify = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

const getS3Key = (note) => {
  return `notes/${note.uuid}.pdf`
}

const getTitle = (originalFileName) => {
  return path
    .basename(originalFileName.trim(), path.extname(originalFileName))
    .trim()
}

// Helper functions for handling cleanup following a failed upload
const deleteFile = async (note) => {
  const s3Client = getS3Client()
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: getS3Key(note),
      })
    )
  } catch (error) {
    console.error(
      `Could not delete file ${getS3Key(note)} from storage:`,
      error
    )
  }
}

const deleteNote = async (note) => {
  try {
    await Note.findByIdAndDelete(note._id)
  } catch (error) {
    console.error(
      `Could not delete note ${note._id.toString()} from DB:`,
      error
    )
  }
}

const deleteFileAndNote = async (note) => {
  await Promise.allSettled([deleteFile(note), deleteNote(note)])
}

const processNoteForDisplay = (note) => {
  if (note.isAnonymous) {
    return {
      ...note.toObject(),
      user: {
        _id: note.user?._id,
        id: note.user?._id?.toString(),
        name: '-',
      },
    }
  }
  return note.toObject()
}

export {
  getS3Key,
  getTitle,
  deleteFile,
  deleteFileAndNote,
  processNoteForDisplay,
}
