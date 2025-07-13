import { BookOpenText, GraduationCap, Clock, User } from 'lucide-react'

function Note({ note }) {
  const now = new Date().toLocaleString()

  return (
    <button className="text-left font-body rounded-xl border hover:shadow-md transition p-4 bg-white flex flex-col gap-2">
      {/* Title */}
      <h3
        className="font-semibold text-gray-800 truncate max-w-full"
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
    </button>
  )
}

export default Note
