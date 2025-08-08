import validator from 'validator'
import { MIN_PASSWORD_LENGTH } from '../config/constants.js'

const isValidEmail = (email) => {
  return validator.isEmail(email)
}

const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: MIN_PASSWORD_LENGTH,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
}

export { isValidEmail, isStrongPassword }
