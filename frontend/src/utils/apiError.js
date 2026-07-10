export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (data?.fieldErrors) {
    return Object.values(data.fieldErrors).filter(Boolean).join(' ')
  }
  return data?.message || (error?.request ? 'The service is unavailable. Please try again shortly.' : fallback)
}
