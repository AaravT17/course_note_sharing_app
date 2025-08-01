import User from '../models/userModel.js'

const deleteUnverifiedUsers = async () => {
  try {
    const deletedUsers = await User.deleteMany({
      isVerified: false,
      verificationTokenExpiry: { $lt: new Date() },
    })
    console.log(`Deleted ${deletedUsers.deletedCount} unverified users`)
  } catch (error) {
    console.log('Cleanup failed:', error)
  }
}

export { deleteUnverifiedUsers }
