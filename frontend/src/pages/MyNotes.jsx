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

function MyNotes() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const notesData = useLoaderData()
  const [notes, setNotes] = useState(notesData.notes)
  const [error, setError] = useState(notesData.error)
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
          <NotesSearchBar
            searchBarTitle="Search Your Notes"
            apiRoute="/api/users/me/notes"
            setNotes={setNotes}
            setError={setError}
          />
          <NotesGrid
            notesGridTitle="My Notes"
            notes={notes}
            error={error}
            setNotes={setNotes}
          />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export const getMyNotes = async () => {
  try {
    const response = await axiosPrivate.get('/api/users/me/notes')
    return { notes: response.data, error: false }
  } catch (error) {
    return { notes: [], error: true }
  }
}

export default MyNotes
