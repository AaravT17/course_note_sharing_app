import Navbar from '../components/Navbar.jsx'
import UploadNotesForm from '../components/UploadNotesForm.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function UploadNotes() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

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
          <UploadNotesForm
            loading={loading}
            setLoading={setLoading}
            success={success}
            setSuccess={setSuccess}
            error={error}
            setError={setError}
          />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default UploadNotes
