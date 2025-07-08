import path from 'path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { getStorageFileName } from '../utils/noteUtils.js'

const storage = multer.diskStorage({
  destination: path.resolve('uploads'),
  filename: (req, file, cb) => {
    const user = req.user._id
    const title = path
      .basename(file.originalname, path.extname(file.originalname))
      .trim()
    const uuid = uuidv4()
    // Ensures unique file names
    cb(
      null,
      getStorageFileName({
        user,
        title,
        uuid,
      })
    )
  },
})

export { storage }
