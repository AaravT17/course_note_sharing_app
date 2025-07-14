import Navbar from '../components/Navbar.jsx'
import RegisterForm from '../components/RegisterForm.jsx'

function Register() {
  return (
    <>
      <Navbar isLoggedIn={false} />
      <RegisterForm />
    </>
  )
}

export default Register
