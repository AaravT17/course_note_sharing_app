import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BrowseNotes, { getBrowseNotes } from './pages/BrowseNotes.jsx'
import MyNotes, { getMyNotes } from './pages/MyNotes.jsx'
import UploadNotes from './pages/UploadNotes.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  // TODO: Add a useEffect to automatically log in the user if there is a valid refresh token

  return (
    <>
      <Router>
        <div>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Protected routes */}
            {/* TODO: Wrap these routes within a ProtectedRoute component */}
            <Route
              path="/"
              element={<Dashboard />}
            />
            <Route
              path="/browse"
              element={<BrowseNotes />}
              loader={getBrowseNotes}
            />
            <Route
              path="/my-notes"
              element={<MyNotes />}
              loader={getMyNotes}
            />
            <Route
              path="/upload"
              element={<UploadNotes />}
            />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
