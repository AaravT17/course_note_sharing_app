import Navbar from '../components/Navbar.jsx'
import ResetPasswordForm from '../components/ResetPasswordForm.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { reset } from '../features/user/userSlice.js'

function ResetPassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    if (user) {
      navigate('/')
      dispatch(reset())
      return
    }
  }, [user, navigate, dispatch])

  return (
    <>
      <Navbar loading={false} />
      <ResetPasswordForm />
    </>
  )
}

export default ResetPassword
