import path from 'path'

// Helper functions for creating file names for storage and extracting
// information from files for storage in DB
const slugify = (title) => {
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

// Helper function to escape special regex characters in search strings
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export { getS3Key, getTitle, processNoteForDisplay, escapeRegex }
