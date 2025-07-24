import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import axiosPrivate from './api/axiosPrivate.js'
import { useDispatch } from 'react-redux'
import { setUser } from './features/user/userSlice.js'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        const response = await axiosPrivate.get('/api/users/me', {
          skipFailedRefreshHandling: true,
        })
        dispatch(setUser(response.data.user))
      } catch (error) {
        console.log('No refresh token found')
      }
    }

    attemptAutoLogin()
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
