import { Search, BookOpenText, GraduationCap, Landmark } from 'lucide-react'
import axiosPrivate from '../api/axiosPrivate'
import { useState } from 'react'

function NotesSearchBar({ searchBarTitle, apiRoute, setNotes, setError }) {
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    courseCode: '',
    university: '',
  })

  const { title, courseCode, university } = searchQuery

  const handleChange = (e) => {
    setSearchQuery((prevState) => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
      }
    })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.get(apiRoute, {
        params: {
          ...(title.trim() !== '' && { title: title.trim() }),
          ...(courseCode.trim() !== '' && { courseCode: courseCode.trim() }),
          ...(university.trim() !== '' && { university: university.trim() }),
        },
      })
      setNotes(response.data)
      setError(false)
    } catch (error) {
      setNotes([])
      setError(true)
    }
  }

  return (
    <div className="bg-blue-800 mb-6 rounded-lg px-4 py-10 sm:py-12">
      <form
        className="max-w-5xl mx-auto space-y-6"
        onSubmit={handleSearch}
      >
        {/* Title */}
        <h2 className="text-white text-3xl font-heading font-bold text-center">
          {searchBarTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 font-body">
          {/* Title */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <BookOpenText className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="Search by title"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* Course Code */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={courseCode}
              onChange={handleChange}
              placeholder="Search by course code"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* University */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <Landmark className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="university"
              name="university"
              value={university}
              onChange={handleChange}
              placeholder="Search by university"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="flex items-center justify-center bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 transition shadow-sm"
            disabled={!title.trim() && !courseCode.trim() && !university.trim()}
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>
      </form>
    </div>
  )
}

export default NotesSearchBar
