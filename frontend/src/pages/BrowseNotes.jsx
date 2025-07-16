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
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    if (!user) {
      toast.error('Session expired. Please log in again.')
      dispatch(reset())
      navigate('/login')
      return
    }
  }, [user, error, navigate, dispatch])

  return (
    <>
      <Navbar />
      <NotesSearchBar
        searchBarTitle="Browse Notes"
        apiRoute="/api/notes"
        setNotes={setNotes}
        setError={setError}
      />
      <NotesGrid
        notesGridTitle="Results"
        notes={notes}
        error={error}
      />
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
