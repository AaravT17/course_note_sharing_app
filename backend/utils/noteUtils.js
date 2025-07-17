import { promises as fs } from 'fs'
import path from 'path'
import Note from '../models/noteModel.js'

// Helper functions for creating file names for storage and extract information
// from files for storage in DB
const _slugify = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

const getStorageFileName = (note) => {
  return `${note.uuid}.pdf`.trim()
}

const getUuid = (storageFileName) => {
  return storageFileName.slice(0, storageFileName.lastIndexOf('.')).trim()
}

const getTitle = (originalFileName) => {
  return path.basename(originalFileName, path.extname(originalFileName)).trim()
}

// Helper functions for handling cleanup following a failed upload
const deleteFile = async (note) => {
  try {
    await fs.unlink(
      path.resolve('backend', 'uploads', getStorageFileName(note))
    )
  } catch (error) {
    console.log(
      `Could not delete file ${getStorageFileName(note)} from storage`,
      error
    )
  }
}

const deleteFileAndNote = async (note) => {
  try {
    await fs.unlink(
      path.resolve('backend', 'uploads', getStorageFileName(note))
    )
  } catch (error) {
    console.log(
      `Could not delete file ${getStorageFileName(note)} from storage`,
      error
    )
  }
  try {
    await Note.findByIdAndDelete(note._id)
  } catch (error) {
    console.log(`Could not delete note ${note._id.toString()} from DB`, error)
  }
}

export { getStorageFileName, getUuid, getTitle, deleteFile, deleteFileAndNote }
