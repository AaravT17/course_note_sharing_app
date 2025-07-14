import Note from './Note.jsx'

function NotesGrid({ title, notes, isMyNotesPage = false }) {
  return (
    <section className="mb-6 mr-4 ml-4">
      <h2 className="text-xl font-heading font-semibold mb-4">{title}</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            isMyNotesPage={isMyNotesPage}
          />
        ))}
      </div>
    </section>
  )
}

export default NotesGrid
