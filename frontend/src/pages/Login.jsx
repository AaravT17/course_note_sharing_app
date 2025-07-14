import Navbar from '../components/Navbar.jsx'
import LoginForm from '../components/LoginForm.jsx'

function Login() {
  return (
    <>
      <Navbar isLoggedIn={false} />
      <LoginForm />
    </>
  )
}

export default Login
