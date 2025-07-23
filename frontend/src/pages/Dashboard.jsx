import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import NotesGrid from '../components/NotesGrid.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user && isError) {
      toast.error('Session expired. Please log in again.')
      dispatch(reset())
      navigate('/login')
      return
    }

    if (isSuccess && !user) {
      toast.success('Logout successful!')
      dispatch(reset())
      navigate('/login')
      return
    }

    if (!user) {
      dispatch(reset())
      navigate('/login')
      return
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  return (
    <>
      {user ? (
        <>
          <Navbar loading={loading} />
          <Hero />
          <NotesGrid
            notesGridTitle="Recently Viewed"
            apiRoute=""
            notes={user.recentlyViewedNotes}
            setNotes={() => {}}
            error={false}
            setError={() => {}}
            loading={loading}
            setLoading={setLoading}
            searchQuery={{
              title: '',
              courseCode: '',
              university: '',
            }}
            sortBy="createdAt"
            allowLoadMore={false}
            hasMore={false}
            setHasMore={() => {}}
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
