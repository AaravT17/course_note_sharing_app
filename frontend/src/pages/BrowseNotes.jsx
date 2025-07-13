import Navbar from '../components/Navbar.jsx'
import NotesSearchBar from '../components/NotesSearchBar.jsx'
import NotesDisplay from '../components/NotesDisplay.jsx'

function BrowseNotes() {
  const notes = [
    {
      id: 1,
      title: 'CSC207 – Lecture 1: Introduction to Software Design',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
    {
      id: 2,
      title:
        'CSC207 – Lecture 2: Strategy Pattern, Observer Pattern, and Why You Shouldn’t Panic (Yet)',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
    {
      id: 3,
      title: 'CSC207 – Lecture 3: SOLID Principles Recap',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
    {
      id: 4,
      title: 'CSC207 – Lecture 1: Introduction to Software Design',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
    {
      id: 5,
      title:
        'CSC207 – Lecture 2: Strategy Pattern, Observer Pattern, and Why You Shouldn’t Panic (Yet)',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
    {
      id: 6,
      title: 'CSC207 – Lecture 3: SOLID Principles Recap',
      courseCode: 'CSC207',
      university: 'University of Toronto',
    },
  ]

  return (
    <>
      <Navbar />
      <NotesSearchBar title="Browse Notes" />
      <NotesDisplay
        title="Results"
        notes={notes}
      />
    </>
  )
}

export default BrowseNotes
