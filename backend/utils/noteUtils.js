import { promises as fs } from 'fs'
import path from 'path'

const _slugify = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

const getStorageFileName = (note) => {
  return `${note.user.toString()}_${_slugify(note.title).slice(0, 50)}_${
    note.uuid
  }.pdf`
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

export { getStorageFileName, deleteFile, deleteFileAndNote }
