import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  setRecentlyViewedNotes,
  setLikedAndDislikedNotes,
} from '../features/user/userSlice.js'
import axiosPrivate from '../api/axiosPrivate.js'

import {
  BookOpenText,
  Calendar,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Trash,
} from 'lucide-react'

import { ChalkboardTeacher } from 'phosphor-react'

function Note({
  note,
  setNotes,
  loading = false,
  setLoading,
  allowDelete = false,
}) {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.user)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
        const responseRecentNotes = await axiosPrivate.put('/api/users/me', {
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

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (loading || isLoading) return
    setShowDeleteConfirm(true)
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

  return (
    <div
      className={`font-body rounded-xl border hover:shadow-md transition p-4 bg-white flex justify-between gap-4 ${
        !showDeleteConfirm ? 'cursor-pointer' : ''
      }`}
      onClick={handleViewNote}
      disabled={loading || isLoading || showDeleteConfirm}
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
            disabled={loading || isLoading || isMyNote || showDeleteConfirm}
          >
            <ThumbsUp className="w-4 h-4" /> {note.likes || 0}
          </button>
          <button
            className={`flex items-center gap-1 transition ${
              isDisliked ? 'text-red-600' : isMyNote ? '' : 'hover:text-red-600'
            }`}
            onClick={handleDislikeNote}
            disabled={loading || isLoading || isMyNote || showDeleteConfirm}
          >
            <ThumbsDown className="w-4 h-4" /> {note.dislikes || 0}
          </button>
        </div>
      </div>

      {/* Right Column: Edit/Delete/Report */}
      {isMyNote && allowDelete && (
        <div className="flex flex-row gap-2 items-start self-start shrink-0">
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Delete Note"
            onClick={handleDeleteClick}
            disabled={loading || isLoading || showDeleteConfirm}
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation()
            return
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
    </div>
  )
}

export default Note
