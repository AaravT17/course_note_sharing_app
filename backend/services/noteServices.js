import mongoose from 'mongoose'
import Note from '../models/noteModel.js'
import {
  getS3Key,
  processNoteForDisplay,
  escapeRegex,
} from '../utils/noteUtils.js'
import { MAX_NOTES_PER_SEARCH } from '../config/constants.js'
import { getS3Client } from '../config/s3.js'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

const getSortBy = (query) => {
  const validSortFields = ['createdAt', 'likes']
  let sortBy = query.sortBy?.trim()
  return validSortFields.includes(sortBy) ? sortBy : 'createdAt'
}

const buildSearchQuery = (query, sortBy) => {
  const cursorId = query.cursorId?.trim()
  const cursorValueRaw = query.cursorValue?.trim()
  let cursorClause = {}

  const title = query.title?.trim()
  const courseCode = query.courseCode?.trim()
  const academicYear = query.academicYear?.trim()
  const instructor = query.instructor?.trim()

  if (cursorId && !mongoose.Types.ObjectId.isValid(cursorId)) {
    throw new Error('Bad request')
  }

  if ((cursorId && !cursorValueRaw) || (!cursorId && cursorValueRaw)) {
    throw new Error('Bad request')
  }

  if (cursorId && cursorValueRaw) {
    let cursorValueParsed
    if (sortBy === 'createdAt') {
      if (isNaN(Date.parse(cursorValueRaw))) {
        throw new Error('Bad request')
      }
      cursorValueParsed = new Date(cursorValueRaw)
    } else {
      if (!Number.isInteger(Number(cursorValueRaw))) {
        throw new Error('Bad request')
      }
      cursorValueParsed = Number(cursorValueRaw)
    }
    cursorClause = {
      $or: [
        { [sortBy]: { $lt: cursorValueParsed } },
        { [sortBy]: cursorValueParsed, _id: { $lt: cursorId } },
      ],
    }
  }

  return {
    ...(title && {
      title: { $regex: escapeRegex(title), $options: 'i' },
    }),
    ...(courseCode && {
      courseCode: { $regex: escapeRegex(courseCode), $options: 'i' },
    }),
    ...(academicYear && { academicYear }),
    ...(instructor && {
      instructor: { $regex: escapeRegex(instructor), $options: 'i' },
    }),
    ...cursorClause,
  }
}

const getNotes = async (searchQuery, sortBy) => {
  const limit = MAX_NOTES_PER_SEARCH
  const notes = await Note.find(searchQuery)
    .sort({ [sortBy]: -1, _id: -1 })
    .limit(limit + 1)
    .populate('user', 'name _id')
  const hasMore = notes.length > limit
  const processedNotes = notes.slice(0, limit).map(processNoteForDisplay)
  return { processedNotes, hasMore }
}

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

export {
  getSortBy,
  buildSearchQuery,
  getNotes,
  deleteFile,
  deleteNote,
  deleteFileAndNote,
}
