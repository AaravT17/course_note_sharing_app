import { MAX_FILE_SIZE_MB, MAX_FILES } from '../config/constants.js'

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  let message = err.message || 'An error occurred'
  // err.message should always be defined if control is passed to errorHandler,
  // but for robustness, this condition was added
  if (message.toLowerCase() === 'invalid file format') {
    statusCode = 400
    message = 'Invalid file format'
  } else if (message.toLowerCase() === 'missing fields') {
    statusCode = 400
    message = 'Missing fields'
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = `File too large, maximum allowed is ${MAX_FILE_SIZE_MB}MB`
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400
    message = `Too many files, maximum allowed is ${MAX_FILES}`
  }
  res.status(statusCode).json({
    message,
  })
}
