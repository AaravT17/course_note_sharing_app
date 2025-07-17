import { RouterProvider } from 'react-router-dom'
import router from './router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  // TODO: Add a useEffect to automatically log in the user if there is a valid refresh token
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
