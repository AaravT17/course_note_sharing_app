import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axiosPrivate from '../api/axiosPrivate.js'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { reset } from '../features/user/userSlice.js'
import { MAX_FILE_SIZE_MB, MAX_FILES } from '../config/constants.js'
import { X, FileText } from 'lucide-react'

function UploadNotesForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const { user, isError } = useSelector((state) => state.user)

  const [notesMetadata, setNotesMetadata] = useState({
    university: '',
    courseCode: '',
    isAnonymous: false,
  })

  const { university, courseCode, isAnonymous } = notesMetadata

  const handleCheckboxChange = (e) => {
    setNotesMetadata((prevMetadata) => ({
      ...prevMetadata,
      isAnonymous: e.target.checked,
    }))
  }

  const handleInputChange = (e) => {
    setNotesMetadata((prevMetadata) => {
      return {
        ...prevMetadata,
        [e.target.name]:
          e.target.name === 'courseCode'
            ? e.target.value.toUpperCase()
            : e.target.value,
      }
    })
  }

  const handleFileChange = (e) => {
    const addedFiles = Array.from(e.target.files)
    let invalidFiles = false
    let newFiles = []
    addedFiles.forEach((addedFile) => {
      if (addedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        invalidFiles = true
        return
      }
      if (
        !selectedFiles.some(
          (file) => file.name === addedFile.name && file.size === addedFile.size
        )
      ) {
        if (newFiles.length + selectedFiles.length < MAX_FILES) {
          newFiles.push(addedFile)
        } else {
          invalidFiles = true
        }
      }
    })

    if (newFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
    }

    if (invalidFiles) {
      toast.error(
        `You can only upload up to ${MAX_FILES} files, each up to ${MAX_FILE_SIZE_MB}MB.`
      )
    }

    e.target.value = null
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => {
      const newFiles = [...prevFiles]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleUpload = async (e) => {
    setLoading(true)
    e.preventDefault()
    if (university.trim() === '' || courseCode.trim() === '') {
      toast.error('Please fill in all fields')
      setLoading(false)
      return
    }
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload')
      setLoading(false)
      return
    }
    const formData = new FormData()
    formData.append('university', university.trim())
    formData.append('courseCode', courseCode.trim().toUpperCase())
    formData.append('isAnonymous', isAnonymous ? 'true' : 'false')
    selectedFiles.forEach((file) => {
      formData.append('note', file)
    })
    try {
      await axiosPrivate.post('/api/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess(true)
    } catch (error) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      toast.success('Notes uploaded successfully!')
      setSuccess(false)
      setSelectedFiles([])
      setNotesMetadata({ university: '', courseCode: '', isAnonymous: false })
      navigate('/my-notes')
      return
    }

    if (error) {
      toast.error('Failed to upload notes. Please try again.')
      setError(false)
      return
    }
  }, [user, isError, navigate, dispatch])

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-6">
          Upload Notes
        </h2>

        <form
          className="space-y-5 font-body"
          onSubmit={handleUpload}
        >
          {/* University */}
          <div>
            <label
              htmlFor="university"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              University
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={university}
              onChange={handleInputChange}
              disabled={loading}
              required
              placeholder="e.g. University of Toronto"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Course Code */}
          <div>
            <label
              htmlFor="courseCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Code
            </label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={courseCode}
              onChange={handleInputChange}
              disabled={loading}
              required
              placeholder="e.g. CSC263"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PDF Notes (max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
            </label>
            <input
              type="file"
              id="note"
              name="note"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              multiple
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 file:bg-blue-800 file:mr-2 file:text-white file:px-4 file:py-2 file:hover:bg-blue-700 file:rounded-md file:border-0 file:cursor-pointer text-gray-400"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-gray-700 font-semibold mb-2">
                Selected Files
              </h3>
              <ul className="flex flex-col gap-2">
                {selectedFiles.map((file, index) => (
                  <li
                    key={file.name + file.size + index}
                    className="flex items-center justify-between bg-gray-50 rounded-md border border-gray-200 px-3 py-2"
                  >
                    {/* Note Icon and File Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText
                        className="w-4 h-4 text-blue-700 shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        className="truncate font-medium text-gray-900"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    </div>
                    {/* File Size */}
                    <span className="text-gray-500 text-sm mx-4 shrink-0">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 rounded-full text-gray-400 hover:text-red-600 focus:ring-2 focus:ring-red-200 transition p-1"
                      aria-label={`Remove file ${file.name}`}
                    >
                      <X
                        className="w-4 h-4"
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Anonymously Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="uploadAnonymously"
              name="uploadAnonymously"
              checked={isAnonymous}
              disabled={loading}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="uploadAnonymously"
              className="text-gray-700 text-sm font-medium"
            >
              Upload Anonymously
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            disabled={selectedFiles.length === 0 || loading}
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadNotesForm
