import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import NotesGrid from '../components/NotesGrid.jsx'

function Dashboard() {
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
      <Navbar isLoggedIn={true} />
      <Hero />
      <NotesGrid
        title="Recently Viewed"
        notes={notes}
      />
      {/* TODO: Add a 'You might be interested in' section, will also require an additional route in the backend */}
      <NotesGrid
        title="You Might Be Interested In..."
        notes={notes}
      />
    </>
  )
}

export default Dashboard
