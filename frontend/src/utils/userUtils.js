import { MIN_PASSWORD_LENGTH } from '../config/constants.js'

const isStrongPassword = (password) => {
  return (
    password.length >= MIN_PASSWORD_LENGTH && // Is sufficiently long
    /[A-Z]/.test(password) && // Contains at least one uppercase letter
    /[a-z]/.test(password) && // Contains at least one lowercase letter
    /\d/.test(password) && // Contains at least one digit
    /[^a-zA-Z0-9]/.test(password) // Contains at least one special character
  )
}

export { isStrongPassword }
