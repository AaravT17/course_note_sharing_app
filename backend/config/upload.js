import path from 'path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { getStorageFileName, getTitle } from '../utils/noteUtils.js'

const storage = multer.diskStorage({
  destination: path.resolve('backend', 'uploads'),
  filename: (req, file, cb) => {
    const user = req.user._id
    const title = getTitle(file.originalname)
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
