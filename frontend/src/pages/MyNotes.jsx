import Navbar from '../components/Navbar.jsx'
import NotesSearchBar from '../components/NotesSearchBar.jsx'
import NotesGrid from '../components/NotesGrid.jsx'
import { useLoaderData } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function MyNotes() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const notesData = useLoaderData()
  const [notes, setNotes] = useState(notesData.notes)
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    courseCode: '',
    academicYear: '',
    instructor: '',
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [hasMore, setHasMore] = useState(notesData.hasMore)
  const [error, setError] = useState(notesData.error)
  const [loading, setLoading] = useState(false)

  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )

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
          <NotesSearchBar
            searchBarTitle="Search My Notes"
            apiRoute="/api/users/me/notes"
            setNotes={setNotes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            setHasMore={setHasMore}
          />
          <NotesGrid
            notesGridTitle="My Notes"
            apiRoute="/api/users/me/notes"
            notes={notes}
            setNotes={setNotes}
            error={error}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            searchQuery={searchQuery}
            sortBy={sortBy}
            allowLoadMore={true}
            hasMore={hasMore}
            setHasMore={setHasMore}
            allowDelete={true}
          />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default MyNotes
