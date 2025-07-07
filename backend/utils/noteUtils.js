const slugify = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

const getStorageFileName = (userId, title, uuid) => {
  return `${userId}_${slugify(title).slice(0, 50)}_${uuid}.pdf`
}

export { slugify, getStorageFileName }
