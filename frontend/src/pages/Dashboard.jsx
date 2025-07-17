import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import NotesGrid from '../components/NotesGrid.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isError } = useSelector((state) => state.user)

  useEffect(() => {
    if (!user && isError) {
      toast.error('Session expired. Please log in again.')
      dispatch(reset())
      navigate('/login')
      return
    }

    if (!user) {
      dispatch(reset())
      navigate('/login')
      return
    }
  }, [user, isError, navigate, dispatch])

  return (
    <>
      {user ? (
        <>
          <Navbar />
          <Hero />
          <NotesGrid
            notesGridTitle="Recently Viewed"
            notes={user.recentlyViewedNotes}
            error={false}
            setNotes={() => {}}
          />
          {/* TODO: Add a 'You might be interested in' section, will also require an additional route in the backend */}
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default Dashboard
