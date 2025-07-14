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

function Note({ note, isMyNotesPage = false }) {
  const now = new Date().toLocaleString()

  return (
    <div className="font-body rounded-xl border hover:shadow-md transition p-4 bg-white flex justify-between gap-4">
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
            <User className="w-4 h-4" /> Aarav Tandon
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <Clock className="w-4 h-4" /> {now}
          </span>
        </div>

        {/* Rating Buttons */}
        <div className="flex gap-4 mt-2 items-center text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-blue-600 transition">
            <ThumbsUp className="w-4 h-4" /> 12
          </button>
          <button className="flex items-center gap-1 hover:text-red-600 transition">
            <ThumbsDown className="w-4 h-4" /> 3
          </button>
        </div>
      </div>

      {/* Right Column: Edit/Delete */}
      {isMyNotesPage && (
        <div className="flex flex-row gap-2 items-start self-start shrink-0">
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Edit Note"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 transition"
            title="Delete Note"
          >
            <Trash className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  )
}

export default Note
