import { createBrowserRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import BrowseNotes, { getBrowseNotes } from './pages/BrowseNotes.jsx'
import MyNotes, { getMyNotes } from './pages/MyNotes.jsx'
import UploadNotes from './pages/UploadNotes.jsx'
import VerifySuccess from './pages/VerifySuccess.jsx'
import VerifyExpired from './pages/VerifyExpired.jsx'
import VerifyInvalid from './pages/VerifyInvalid.jsx'
import VerifyInternalError from './pages/VerifyInternalError.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/browse', element: <BrowseNotes />, loader: getBrowseNotes },
  { path: '/my-notes', element: <MyNotes />, loader: getMyNotes },
  { path: '/upload', element: <UploadNotes /> },

  // Email verification routes
  { path: '/verify/success', element: <VerifySuccess /> },
  { path: '/verify/expired', element: <VerifyExpired /> },
  { path: '/verify/invalid', element: <VerifyInvalid /> },
  { path: '/verify/internal-error', element: <VerifyInternalError /> },
])

export default router
