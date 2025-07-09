import User from '../models/userModel.js'

const deleteUnverifiedUsers = async () => {
  try {
    await User.deleteMany({
      isVerified: false,
      verificationTokenExpiry: { $lt: Date.now() },
    })
  } catch (error) {
    console.log('Cleanup failed', error)
  }
}

export { deleteUnverifiedUsers }
