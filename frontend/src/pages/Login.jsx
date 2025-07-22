import Navbar from '../components/Navbar.jsx'
import LoginForm from '../components/LoginForm.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset } from '../features/user/userSlice.js'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )

  useEffect(() => {
    if (user) {
      dispatch(reset())
      navigate('/')
      return
    }

    if (isError) {
      toast.error(message)
      dispatch(reset())
      return
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  return (
    <>
      <Navbar loading={false} />
      <LoginForm />
    </>
  )
}

export default Login
