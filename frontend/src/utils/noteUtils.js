import { ACADEMIC_YEARS_DROPDOWN_LENGTH } from '../config/constants'

const getAcademicYears = () => {
  const currentYear = new Date().getFullYear()
  const academicYears = []
  for (let i = 0; i < ACADEMIC_YEARS_DROPDOWN_LENGTH; i++) {
    const year = currentYear - i
    academicYears.push(`${year}–${(year + 1).toString().slice(-2)}`)
  }
  return academicYears
}

const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear()
  return `${currentYear}–${(currentYear + 1).toString().slice(-2)}`
}

export { getAcademicYears, getCurrentAcademicYear }
