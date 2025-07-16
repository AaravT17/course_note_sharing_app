import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'
import axiosPrivate from '../api/axiosPrivate.js'

import {
  BookOpenText,
  GraduationCap,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash,
} from 'lucide-react'

function Note({ note, setNotes }) {
  const { user } = useSelector((state) => state.user)
  const [isLoading, setIsLoading] = useState(false)

  const isMyNote = user._id.toString() === note.user._id.toString()

  // const isLiked = user.likedNotes.some(
  //   (id) => id.toString() === note._id.toString()
  // )

  // const isDisliked = user.dislikedNotes.some(
  //   (id) => id.toString() === note._id.toString()
  // )

  // TODO: Add liking and disliking functionality, and edit the global user's liked and disliked notes

  const handleViewNote = async (e) => {
    e.stopPropagation()
    if (isLoading) return
    setIsLoading(true)
    try {
      const response = await axiosPrivate.get(
        `/api/notes/${note._id.toString()}/view`,
        {
          responseType: 'blob',
        }
      )
      const blobUrl = URL.createObjectURL(response.data)
      window.open(blobUrl, '_blank')
    } catch (error) {
      toast.error('Failed to view note. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this note?')) return
    setIsLoading(true)
    try {
      await axiosPrivate.delete(`/api/users/me/notes/${note._id.toString()}`)
      setNotes((prevNotes) =>
        prevNotes.filter(
          (prevNote) => prevNote._id.toString() !== note._id.toString()
        )
      )
      toast.success('Note deleted successfully.')
    } catch (error) {
      toast.error('Failed to delete note. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // const handleEditNote = (e) => {
  //   e.stopPropagation()
  //   console.log('Edit')
  // }

  const handleLikeNote = (e) => {
    e.stopPropagation()
    console.log('Like')
  }

  const handleDislikeNote = (e) => {
    e.stopPropagation()
    console.log('Dislike')
  }

  return (
    <div
      className="font-body rounded-xl border hover:shadow-md transition p-4 bg-white flex justify-between gap-4"
      onClick={handleViewNote}
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
            <GraduationCap className="w-4 h-4" /> {note.university}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />{' '}
            {note.isAnonymous ? '-' : note.user.name}
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <Clock className="w-4 h-4" />{' '}
            {new Date(note.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Rating Buttons */}
        {!isMyNote && (
          <div className="flex gap-4 mt-2 items-center text-sm text-gray-600">
            <button
              className="flex items-center gap-1 hover:text-blue-600 transition"
              onClick={handleLikeNote}
              disabled={isLoading}
            >
              <ThumbsUp className="w-4 h-4" /> {note.likes || 0}
            </button>
            <button
              className="flex items-center gap-1 hover:text-red-600 transition"
              onClick={handleDislikeNote}
              disabled={isLoading}
            >
              <ThumbsDown className="w-4 h-4" /> {note.dislikes || 0}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Edit/Delete */}
      {isMyNote && (
        <div className="flex flex-row gap-2 items-start self-start shrink-0">
          {/* <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Edit Note"
            onClick={handleEditNote}
            disabled={isLoading}
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button> */}
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Delete Note"
            onClick={handleDeleteNote}
            disabled={isLoading}
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Note
