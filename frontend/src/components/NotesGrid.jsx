import Note from './Note.jsx'

function NotesGrid({ notesGridTitle, notes = [], error, setNotes }) {
  let emptyMsg = 'No notes were found.'
  if (notesGridTitle === 'Recently Viewed') {
    emptyMsg =
      'You haven’t viewed any notes yet. Start browsing and your recently viewed notes will show up here!'
  } else if (notesGridTitle === 'My Notes') {
    emptyMsg =
      'You haven’t uploaded any notes yet. Start sharing to help others!'
  }

  let errorMsg = 'There was an error fetching your notes. Please try again.'

  return (
    <section className="mb-6 mx-4">
      <h2 className="text-xl font-heading font-semibold mb-4">
        {notesGridTitle}
      </h2>
      {error ? (
        <div className="flex items-center justify-center px-4 py-8 bg-white rounded-md shadow-sm">
          <span className="text-gray-500 font-body text-lg">{errorMsg}</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-8 bg-white rounded-md shadow-sm">
          <span className="text-gray-500 font-body text-lg">{emptyMsg}</span>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notes.map((note) => (
            <Note
              key={note.id || note._id.toString()}
              note={note}
              setNotes={setNotes}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default NotesGrid
