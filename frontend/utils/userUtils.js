const isStrongPassword = (password) => {
  return (
    password.length >= 12 && // Contains at least 12 characters
    /[A-Z]/.test(password) && // Contains at least one uppercase letter
    /[a-z]/.test(password) && // Contains at least one lowercase letter
    /\d/.test(password) && // Contains at least one digit
    /[^a-zA-Z0-9]/.test(password) // Contains at least one special character
  )
}

export { isStrongPassword }
