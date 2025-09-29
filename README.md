# Noteabl

A reliable, secure platform for students to share and explore university course notes — thoughtfully engineered for usability, scalability, and maintainability.

> 🔗 Live Site: [https://noteablapp.com](https://noteablapp.com)

## Table of Contents

- [Features](#features)
  - [For Students](#for-students)
  - [Technical Highlights](#technical-highlights)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project Locally](#running-the-project-locally)
  - [Running in Production](#running-in-production)
- [Usage](#usage)
- [License](#license)
- [Contact / Help](#contact--help)
- [Author](#author)

## Features

### For Students

- 🔐 Create an account with secure email verification and password reset
- 🏠 Access your recently viewed and liked notes from a personalized homepage
- 🔍 Discover course notes with filters for title, course code, academic year, and instructor, and sort results by most recent or most liked
- 🗂️ Browse a personalized collection of notes you have liked or uploaded for easy access and reference
- 📁 Upload your course notes as PDFs, with the option to display them anonymously
- 👍 Like and 👎 dislike notes to highlight useful content and make those notes easy to revisit
- ✏️ Edit and delete your uploaded notes to keep your collection up to date
- 💻 Designed for an optimal experience on desktop and laptop

### Technical Highlights

- 🧱 Modular backend built with **Node.js**, **Express**, and **MongoDB**
- ☁️ Secure file uploads stored on **AWS S3**, with unique naming and automatic cleanup
- 🔄 Robust upload failure handling with rollback to maintain data integrity
- 🛡️ Concurrency-safe design that uses atomic operations and transactions with automatic retries for transient errors to prevent race conditions and ensure consistent state under concurrent requests
- 🔑 Secure authentication using short-lived JWT access tokens paired with HTTP-only refresh tokens for seamless and secure session management
- 🔒 Email verification and password reset flows secured by hashed tokens with expiration
- ♻️ Consistent error handling implemented through custom middleware and `express-async-handler`
- ⚙️ Efficient cursor-based pagination with compound sorting by creation date or likes
- 🧠 Optimized database queries using compound indexes for fast filtering and sorting
- 🧹 Scheduled cleanup of unverified users via a cron job to maintain database hygiene
- 📬 Email delivery managed through **Resend**, with domain verification for reliability
- 🌐 Deployed on **Render** with HTTPS and a custom domain (`noteablapp.com`)
- 🚀 CI/CD pipeline to automate builds and deployments

### 📌 Notes

- The app is currently tailored for University of Toronto students. Support for other universities will be added in the future.
- Account verification emails may occasionally be delayed or filtered by some providers (e.g., university email systems). Users should check spam/junk folders. For now, it is recommended that users register with a private Gmail account. If you continue to experience issues with verification emails, please [contact me](#contact--help) for assistance.
- Uploads marked as anonymous are displayed anonymously to other users, but uploader identities are securely retained in the backend database for moderation and accountability.
- All backend and hosting services currently run on free-tier plans, which may result in occasional downtime, slower response times, or other service limitations.
- The scheduled cleanup cron job may be unreliable on the free Render tier, as the server can enter sleep mode when idle, preventing scheduled tasks from running on time.

## Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose
- **Authentication & Security:** JWT, HTTP-only cookies, bcryptjs
- **File Storage:** AWS S3
- **Email Services:** Resend (SPF, DKIM, DMARC configured)
- **Deployment & Hosting:** Render (single-server deployment), custom domain with HTTPS (`noteablapp.com`)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- MongoDB Atlas database with `users` and `notes` collections
- AWS account with S3 bucket configured
- Resend API key for email services
- Environment variables configured (see below)

---

### Installation

1. **Clone the repository:**

   ```
   git clone https://github.com/AaravT17/course_note_sharing_app.git
   cd course_note_sharing_app
   ```

2. **Install dependencies and start development servers:**

   ```
   npm install
   npm run dev
   ```

   This command installs dependencies and runs backend and frontend servers concurrently.

3. **Alternatively, run backend or frontend separately:**
   - Backend only:
     ```
     npm run server
     ```
   - Frontend only:
     ```
     npm run client
     ```

---

### Environment Variables

Create a `.env` file in the root directory and add the following keys:

```bash
NODE_ENV= # Application environment (e.g., development, production)
PORT= # Backend server port (default: 8000)
MONGO_URI= # MongoDB connection string
JWT_ACCESS_SECRET= # Secret key for JWT access tokens
JWT_REFRESH_SECRET= # Secret key for JWT refresh tokens
VITE_FRONTEND_BASE_URL= # Frontend base URL (e.g., http://localhost:3000)
VITE_BACKEND_BASE_URL= # Backend base URL (e.g., http://localhost:8000)
EMAIL_FROM= # Verified sender email address for outgoing emails
AWS_ACCESS_KEY_ID= # AWS access key ID for S3
AWS_SECRET_ACCESS_KEY= # AWS secret access key for S3
AWS_REGION= # AWS region where your S3 bucket is located
AWS_S3_BUCKET= # Name of your AWS S3 bucket
RESEND_API_KEY= # API key for Resend email service
```

---

### Running the Project Locally

- Backend runs on port 8000 by default
- Frontend runs on port 3000 by default
- Visit `http://localhost:3000` in your browser to access the app

---

### Running in Production

To build the frontend and prepare the backend for deployment, run:

```
npm run build
```

This command installs frontend dependencies, builds frontend assets, runs backend indexing scripts, and prepares the app for production.

Once the build process completes, to start the backend server and run the app in production, run:

```
npm start
```

### 📌 Notes

- In many production environments, the `PORT` environment variable is set automatically by the hosting provider, so manual configuration may not be necessary or useful.
- Similarly, the `NODE_ENV` variable is often predefined in production (typically set to `"production"`), and manually setting it can interfere with build scripts.

## Usage

1. **Create an Account**  
   Register with your email and set a secure password. Verify your email to activate your account and enable full access.

2. **Browse and Discover Notes**  
   Use the search bar and filters to find course notes by title, course code, academic year, or instructor. Sort results by most recent or most liked to quickly find what you need.

3. **Upload Notes**  
   Upload your course notes as PDFs. You can choose to display your uploads anonymously to other users while retaining control over your content.

4. **Interact with Notes**  
   Like or dislike notes to help highlight the most useful content. Your liked notes are saved for easy access later.

5. **Manage Your Notes**  
   Edit or delete notes you’ve uploaded to keep your collection current and organized.

6. **Personalized Homepage**  
   Access your recently viewed and liked notes quickly from your personalized homepage for convenience.

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.

## Contact / Help

If you have any questions, feedback, or need assistance, feel free to reach out via email:  
[aarav.tandon.004@gmail.com](mailto:aarav.tandon.004@gmail.com)

## Author

**Aarav Tandon**
