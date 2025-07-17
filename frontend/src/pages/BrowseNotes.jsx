import Navbar from '../components/Navbar.jsx'
import NotesSearchBar from '../components/NotesSearchBar.jsx'
import NotesGrid from '../components/NotesGrid.jsx'
import axiosPrivate from '../api/axiosPrivate.js'
import { useLoaderData } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function BrowseNotes() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const notesData = useLoaderData()
  const [notes, setNotes] = useState(notesData.notes)
  const [error, setError] = useState(notesData.error)
  const [loading, setLoading] = useState(false)
  const { user, isSuccess, isError, message } = useSelector(
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
            searchBarTitle="Browse Notes"
            apiRoute="/api/notes"
            setNotes={setNotes}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
          />
          <NotesGrid
            notesGridTitle="Results"
            notes={notes}
            error={error}
            setNotes={setNotes}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export const getBrowseNotes = async () => {
  try {
    const response = await axiosPrivate.get('/api/notes')
    return { notes: response.data, error: false }
  } catch (error) {
    return { notes: [], error: true }
  }
}

export default BrowseNotes
