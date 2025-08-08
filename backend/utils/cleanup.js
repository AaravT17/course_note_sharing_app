import User from '../models/userModel.js'

const deleteUnverifiedUsers = async () => {
  try {
    const deletedUsers = await User.deleteMany({
      isVerified: false,
      verificationTokenExpiry: { $lte: new Date() },
    })
    console.log(`Deleted ${deletedUsers.deletedCount} unverified users`)
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

export { deleteUnverifiedUsers }
