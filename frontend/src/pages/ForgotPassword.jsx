import Navbar from '../components/Navbar.jsx'
import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { reset } from '../features/user/userSlice.js'

function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    if (user) {
      dispatch(reset())
      navigate('/')
      return
    }
  }, [user, navigate, dispatch])

  return (
    <>
      <Navbar loading={false} />
      <ForgotPasswordForm />
    </>
  )
}

export default ForgotPassword
