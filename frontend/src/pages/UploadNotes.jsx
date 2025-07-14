import Navbar from '../components/Navbar.jsx'
import UploadNotesForm from '../components/UploadNotesForm.jsx'

function UploadNotes() {
  return (
    <>
      <Navbar isLoggedIn={true} />
      <UploadNotesForm />
    </>
  )
}

export default UploadNotes
