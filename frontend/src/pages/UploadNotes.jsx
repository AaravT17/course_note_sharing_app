import Navbar from '../components/Navbar.jsx'
import UploadNotesForm from '../components/UploadNotesForm.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function UploadNotes() {
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
          <UploadNotesForm />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default UploadNotes
