import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  setRecentlyViewedNotes,
  setLikedAndDislikedNotes,
} from '../features/user/userSlice.js'
import axiosPrivate from '../api/axiosPrivate.js'
import { getAcademicYears } from '../utils/noteUtils.js'

import {
  BookOpenText,
  Calendar,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash,
} from 'lucide-react'

import { ChalkboardTeacher } from 'phosphor-react'

function Note({
  note,
  setNotes,
  loading = false,
  setLoading,
  allowEditAndDelete = false,
}) {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.user)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editNoteFormData, setEditNoteFormData] = useState({
    courseCode: note.courseCode,
    academicYear: note.academicYear,
    instructor: note.instructor || '',
    isAnonymous: note.isAnonymous,
  })

  const isMyNote = user._id.toString() === note.user?._id?.toString()

  const isLiked = user.likedNotes.some(
    (id) => id.toString() === note._id.toString()
  )

  const isDisliked = user.dislikedNotes.some(
    (id) => id.toString() === note._id.toString()
  )

  const handleViewNote = async (e) => {
    e.stopPropagation()
    if (loading || isLoading) return
    setLoading(true)
    try {
      const responseFile = await axiosPrivate.get(
        `/api/notes/${note._id.toString()}/view`,
        {
          responseType: 'blob',
        }
      )
      const blobUrl = URL.createObjectURL(responseFile.data)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      const updatedNotes = [
        note,
        ...user.recentlyViewedNotes.filter(
          (recentNote) => recentNote._id.toString() !== note._id.toString()
        ),
      ]

      try {
        const responseRecentNotes = await axiosPrivate.patch('/api/users/me', {
          recentlyViewedNotes: updatedNotes.map((note) => note._id),
        })
        dispatch(
          setRecentlyViewedNotes(
            responseRecentNotes.data.user.recentlyViewedNotes
          )
        )
      } catch (updateRecentNotesError) {}
    } catch (viewNoteError) {
      toast.error(
        viewNoteError.response?.data?.message !== 'An error occurred'
          ? viewNoteError.response.data.message
          : 'Failed to view note. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDeleteNote = async (e) => {
    e.stopPropagation()
    if (loading || isLoading) return
    setLoading(true)
    try {
      await axiosPrivate.delete(`/api/users/me/notes/${note._id.toString()}`)
      setNotes((prevNotes) =>
        prevNotes.filter(
          (prevNote) => prevNote._id.toString() !== note._id.toString()
        )
      )
      if (
        user.recentlyViewedNotes.some(
          (n) => n._id.toString() === note._id.toString()
        )
      ) {
        dispatch(
          setRecentlyViewedNotes(
            user.recentlyViewedNotes.filter(
              (recentNote) => recentNote._id.toString() !== note._id.toString()
            )
          )
        )
      }
      toast.success('Note deleted successfully.')
    } catch (error) {
      toast.error(
        error.response?.data?.message !== 'An error occurred'
          ? error.response.data.message
          : 'Failed to delete note. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLikeNote = async (e) => {
    e.stopPropagation()
    if (loading || isLoading) return
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/notes/${note._id.toString()}/rating`,
        {
          likes: isLiked ? '-' : '+',
          ...(isDisliked && { dislikes: '-' }),
        }
      )
      dispatch(setLikedAndDislikedNotes(response.data))
      setNotes((prevNotes) =>
        prevNotes.map((prevNote) =>
          prevNote._id.toString() === note._id.toString()
            ? {
                ...prevNote,
                likes: response.data.likes,
                dislikes: response.data.dislikes,
              }
            : prevNote
        )
      )
      if (
        user.recentlyViewedNotes.some(
          (n) => n._id.toString() === note._id.toString()
        )
      ) {
        dispatch(
          setRecentlyViewedNotes(
            user.recentlyViewedNotes.map((recentNote) =>
              recentNote._id.toString() === note._id.toString()
                ? {
                    ...recentNote,
                    likes: response.data.likes,
                    dislikes: response.data.dislikes,
                  }
                : recentNote
            )
          )
        )
      }
    } catch (error) {
      toast.error(
        isLiked
          ? 'Failed to remove like from note. Please try again later.'
          : 'Failed to like note. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDislikeNote = async (e) => {
    e.stopPropagation()
    if (loading || isLoading) return
    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/notes/${note._id.toString()}/rating`,
        {
          ...(isLiked && { likes: '-' }),
          dislikes: isDisliked ? '-' : '+',
        }
      )
      dispatch(setLikedAndDislikedNotes(response.data))
      setNotes((prevNotes) =>
        prevNotes.map((prevNote) =>
          prevNote._id.toString() === note._id.toString()
            ? {
                ...prevNote,
                likes: response.data.likes,
                dislikes: response.data.dislikes,
              }
            : prevNote
        )
      )
      if (
        user.recentlyViewedNotes.some(
          (n) => n._id.toString() === note._id.toString()
        )
      ) {
        dispatch(
          setRecentlyViewedNotes(
            user.recentlyViewedNotes.map((recentNote) =>
              recentNote._id.toString() === note._id.toString()
                ? {
                    ...recentNote,
                    likes: response.data.likes,
                    dislikes: response.data.dislikes,
                  }
                : recentNote
            )
          )
        )
      }
    } catch (error) {
      toast.error(
        isDisliked
          ? 'Failed to remove dislike from note. Please try again later.'
          : 'Failed to dislike note. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (e) => {
    setEditNoteFormData((prevMetadata) => ({
      ...prevMetadata,
      isAnonymous: e.target.checked,
    }))
  }

  const handleChange = (e) => {
    setEditNoteFormData((prevMetadata) => {
      return {
        ...prevMetadata,
        [e.target.name]:
          e.target.name === 'courseCode'
            ? e.target.value.trim().toUpperCase()
            : e.target.value,
      }
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (loading || isLoading) return
    const courseCode = editNoteFormData.courseCode?.trim().toUpperCase()
    const academicYear = editNoteFormData.academicYear?.trim()
    const instructor = editNoteFormData.instructor?.trim()
    const isAnonymous = editNoteFormData.isAnonymous

    if (!courseCode || !academicYear) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const response = await axiosPrivate.patch(
        `/api/users/me/notes/${note._id.toString()}`,
        {
          courseCode,
          academicYear,
          ...(instructor && { instructor }),
          isAnonymous,
        }
      )
      setNotes((prevNotes) =>
        prevNotes.map((prevNote) =>
          prevNote._id.toString() === note._id.toString()
            ? response.data
            : prevNote
        )
      )
      if (
        user.recentlyViewedNotes.some(
          (n) => n._id.toString() === note._id.toString()
        )
      ) {
        dispatch(
          setRecentlyViewedNotes(
            user.recentlyViewedNotes.map((recentNote) =>
              recentNote._id.toString() === note._id.toString()
                ? response.data
                : recentNote
            )
          )
        )
      }
      setEditNoteFormData({
        courseCode: response.data.courseCode,
        academicYear: response.data.academicYear,
        instructor: response.data.instructor || '',
        isAnonymous: response.data.isAnonymous,
      })
      toast.success('Note updated successfully!')
    } catch (error) {
      setEditNoteFormData({
        courseCode: note.courseCode,
        academicYear: note.academicYear,
        instructor: note.instructor || '',
        isAnonymous: note.isAnonymous,
      })
      toast.error(
        error.response?.data?.message !== 'An error occurred'
          ? error.response.data.message
          : 'Failed to update note. Please try again later.'
      )
    } finally {
      setLoading(false)
      setShowEditForm(false)
    }
  }

  return (
    <div
      className={`font-body rounded-xl border hover:shadow-md transition p-4 bg-white flex justify-between gap-4 ${
        !showDeleteConfirm && !showEditForm ? 'cursor-pointer' : ''
      }`}
      onClick={handleViewNote}
      disabled={loading || isLoading || showDeleteConfirm || showEditForm}
    >
      {/* Left Column */}
      <div className="flex flex-col gap-2 min-w-0 w-full">
        {/* Title */}
        <h3
          className="font-semibold text-gray-800 truncate"
          title={note.title}
        >
          {note.title}
        </h3>

        {/* Metadata */}
        <div className="text-sm text-gray-600 flex flex-col gap-1">
          <span className="flex items-center gap-1">
            <BookOpenText className="w-4 h-4" /> {note.courseCode}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {note.academicYear}
          </span>
          <span className="flex items-center gap-1">
            <ChalkboardTeacher
              size={16}
              weight="regular"
              className="shrink-0"
            />
            {note.instructor || '-'}
          </span>
          <div className="flex flex-col gap-1 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {isMyNote
                ? 'You'
                : note.isAnonymous
                  ? '-'
                  : note.user?.name || '-'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Rating Buttons */}
        <div className="flex gap-4 mt-2 items-center text-sm text-gray-600">
          <button
            className={`flex items-center gap-1 transition ${
              isLiked ? 'text-blue-600' : isMyNote ? '' : 'hover:text-blue-600'
            }`}
            onClick={handleLikeNote}
            disabled={
              loading ||
              isLoading ||
              isMyNote ||
              showDeleteConfirm ||
              showEditForm
            }
          >
            <ThumbsUp className="w-4 h-4" /> {note.likes || 0}
          </button>
          <button
            className={`flex items-center gap-1 transition ${
              isDisliked ? 'text-red-600' : isMyNote ? '' : 'hover:text-red-600'
            }`}
            onClick={handleDislikeNote}
            disabled={
              loading ||
              isLoading ||
              isMyNote ||
              showDeleteConfirm ||
              showEditForm
            }
          >
            <ThumbsDown className="w-4 h-4" /> {note.dislikes || 0}
          </button>
        </div>
      </div>

      {/* Right Column: Edit/Delete */}
      {isMyNote && allowEditAndDelete && (
        <div className="flex flex-row gap-2 items-start self-start shrink-0">
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Edit Note"
            onClick={(e) => {
              e.stopPropagation()
              if (loading || isLoading) return
              setShowEditForm(true)
            }}
            disabled={loading || isLoading || showDeleteConfirm || showEditForm}
          >
            <Pencil className="w-4 h-4 text-gray-800" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Delete Note"
            onClick={(e) => {
              e.stopPropagation()
              if (loading || isLoading) return
              setShowDeleteConfirm(true)
            }}
            disabled={loading || isLoading || showDeleteConfirm || showEditForm}
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Delete this note?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this note?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (loading || isLoading) return
                  setShowDeleteConfirm(false)
                }}
                className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteNote}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="bg-white rounded-2xl shadow-md p-6 w-[90%] max-w-md font-body">
            <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-1">
              Edit Note
            </h2>
            <p
              className="font-heading font-semibold text-gray-700 text-center truncate max-w-xs sm:max-w-sm mx-auto px-2 mb-3"
              title={note.title}
            >
              {note.title}
            </p>

            <form
              className="space-y-5"
              onSubmit={handleEditSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseCode"
                  name="courseCode"
                  value={editNoteFormData.courseCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g. CSC110"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="academicYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Academic year
                </label>
                <div className="bg-white border border-gray-300 rounded-md px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                  <select
                    id="academicYear"
                    name="academicYear"
                    value={editNoteFormData.academicYear}
                    onChange={handleChange}
                    required
                    disabled={loading || isLoading}
                    className="w-full bg-transparent outline-none text-gray-800 text-sm"
                  >
                    {getAcademicYears().map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor (optional)
                </label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={editNoteFormData.instructor}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="displayAnonymously"
                  name="displayAnonymously"
                  checked={editNoteFormData.isAnonymous}
                  onChange={handleCheckboxChange}
                  disabled={loading || isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="displayAnonymously"
                  className="text-sm font-medium text-gray-700"
                >
                  Display Anonymously
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditNoteFormData({
                      courseCode: note.courseCode,
                      academicYear: note.academicYear,
                      instructor: note.instructor || '',
                      isAnonymous: note.isAnonymous,
                    })
                    setShowEditForm(false)
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                  disabled={loading || isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-md bg-blue-800 text-white hover:bg-blue-700"
                  disabled={loading || isLoading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Note
