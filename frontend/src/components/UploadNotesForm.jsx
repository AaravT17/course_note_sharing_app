function UploadNotesForm() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-6">
          Upload Notes
        </h2>

        <form className="space-y-5 font-body">
          {/* University */}
          <div>
            <label
              htmlFor="university"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              University
            </label>
            <input
              type="text"
              id="university"
              name="university"
              required
              placeholder="e.g. University of Toronto"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Course Code */}
          <div>
            <label
              htmlFor="courseCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Code
            </label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              required
              placeholder="e.g. CSC263"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PDF Notes (max 5 files, 10MB each)
            </label>
            <input
              type="file"
              id="note"
              name="note"
              accept="application/pdf"
              multiple
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 file:bg-blue-800 file:mr-2 file:text-white file:px-4 file:py-2 file:hover:bg-blue-700 file:rounded-md file:border-0 file:cursor-pointer text-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadNotesForm
