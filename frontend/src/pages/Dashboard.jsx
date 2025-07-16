import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import NotesGrid from '../components/NotesGrid.jsx'
import { useSelector } from 'react-redux'

function Dashboard() {
  const { user } = useSelector((state) => state.user)
  return (
    <>
      <Navbar />
      <Hero />
      <NotesGrid
        notesGridTitle="Recently Viewed"
        notes={user.recentlyViewedNotes}
      />
      {/* TODO: Add a 'You might be interested in' section, will also require an additional route in the backend */}
    </>
  )
}

export default Dashboard
