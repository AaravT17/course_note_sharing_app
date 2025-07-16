import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'
import axiosPrivate from '../api/axiosPrivate.js'
import axiosPublic from '../api/axiosPublic.js'

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

function Note({ note }) {
  const { user } = useSelector((state) => state.user)

  const isMyNote = user._id.toString() === note.user._id.toString()

  // const isLiked = user.likedNotes.some(
  //   (id) => id.toString() === note._id.toString()
  // )

  // const isDisliked = user.dislikedNotes.some(
  //   (id) => id.toString() === note._id.toString()
  // )

  // TODO: Add liking and disliking functionality, and edit the global user's liked and disliked notes

  const handleViewNote = (e) => {
    console.log('View')
  }

  const handleDeleteNote = (e) => {
    e.stopPropagation()
    console.log('Delete')
  }

  const handleEditNote = (e) => {
    e.stopPropagation()
    console.log('Edit')
  }

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
            <User className="w-4 h-4" /> {note.user.name}
            {/* TODO: Add anonymity, both here and in the upload form */}
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <Clock className="w-4 h-4" /> {note.createdAt.toLocaleString()}
          </span>
        </div>

        {/* Rating Buttons */}
        {!isMyNote && (
          <div className="flex gap-4 mt-2 items-center text-sm text-gray-600">
            <button
              className="flex items-center gap-1 hover:text-blue-600 transition"
              onClick={handleLikeNote}
            >
              <ThumbsUp className="w-4 h-4" /> {note.likes}
            </button>
            <button
              className="flex items-center gap-1 hover:text-red-600 transition"
              onClick={handleDislikeNote}
            >
              <ThumbsDown className="w-4 h-4" /> {note.dislikes}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Edit/Delete */}
      {isMyNote && (
        <div className="flex flex-row gap-2 items-start self-start shrink-0">
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Edit Note"
            onClick={handleEditNote}
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Delete Note"
            onClick={handleDeleteNote}
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Note
