import Navbar from '../components/Navbar.jsx'
import RegisterForm from '../components/RegisterForm.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )

  useEffect(() => {
    if (user) {
      navigate('/')
      dispatch(reset())
      return
    }

    if (isError) {
      toast.error(message)
      dispatch(reset())
      return
    }

    if (isSuccess) {
      toast.success(
        'Registration successful! A verification link has been sent to your email. Please check your inbox to activate your account.'
      )
      dispatch(reset())
      navigate('/login')
      return
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  return (
    <>
      <Navbar loading={false} />
      <RegisterForm />
    </>
  )
}

export default Register
