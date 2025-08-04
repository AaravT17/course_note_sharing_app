import Note from './Note.jsx'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axiosPrivate from '../api/axiosPrivate.js'

function NotesGrid({
  notesGridTitle,
  apiRoute = '',
  notes = [],
  setNotes,
  error = false,
  setError = () => {},
  loading = false,
  setLoading,
  searchQuery = {
    title: '',
    courseCode: '',
    academicYear: '',
    instructor: '',
  },
  sortBy = 'createdAt',
  allowLoadMore = false,
  hasMore = false,
  setHasMore = () => {},
  allowEditAndDelete = false,
}) {
  const { isLoading } = useSelector((state) => state.user)

  const { title, courseCode, academicYear, instructor } = searchQuery

  let emptyMsg = 'No notes were found.'
  if (notesGridTitle === 'Recently Viewed') {
    emptyMsg = 'You haven’t viewed any notes yet.'
  } else if (notesGridTitle === 'Liked Notes' && !allowLoadMore) {
    emptyMsg = 'You haven’t liked any notes yet.'
  }

  let errorMsg = 'There was an error fetching your notes. Please try again.'

  const handleLoadMore = async (e) => {
    e.preventDefault()
    if (loading || isLoading) return
    const lastNote = notes[notes.length - 1]
    if (!lastNote) return
    setLoading(true)
    try {
      const response = await axiosPrivate.get(apiRoute, {
        params: {
          ...(title.trim() !== '' && { title: title.trim() }),
          ...(courseCode.trim() !== '' && { courseCode: courseCode.trim() }),
          ...(academicYear.trim() !== '' && {
            academicYear: academicYear.trim(),
          }),
          ...(instructor.trim() !== '' && { instructor: instructor.trim() }),
          sortBy,
          cursorId: lastNote._id.toString(),
          cursorValue:
            sortBy === 'createdAt' ? lastNote.createdAt.trim() : lastNote.likes,
        },
      })
      setNotes((prevNotes) => [...prevNotes, ...response.data.notes])
      setHasMore(response.data.hasMore)
      setError(false)
    } catch (error) {
      toast.error(
        error.response?.data?.message !== 'An error occurred'
          ? error.response.data.message
          : 'Failed to load more notes. Please try again later.'
      )
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-6 mx-4">
      <h2 className="text-xl font-heading font-semibold mb-4">
        {notesGridTitle}
      </h2>
      {error && notes.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-8 bg-white rounded-md shadow-sm">
          <span className="text-gray-500 font-body text-lg">{errorMsg}</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-8 bg-white rounded-md shadow-sm">
          <span className="text-gray-500 font-body text-lg">{emptyMsg}</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {notes.map((note) => (
              <Note
                key={note._id.toString()}
                note={note}
                setNotes={setNotes}
                loading={loading}
                setLoading={setLoading}
                allowEditAndDelete={allowEditAndDelete}
              />
            ))}
          </div>
          {allowLoadMore && hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading || isLoading}
                className="px-6 py-2 bg-white text-blue-800 font-semibold rounded-md shadow-sm border border-blue-600 hover:bg-blue-50 transition"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default NotesGrid
