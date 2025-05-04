// Helper function to format seconds into HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const hoursStr = String(hours).padStart(2, '0')
  const minutesStr = String(minutes).padStart(2, '0')
  const secsStr = String(secs).padStart(2, '0')

  return `${hoursStr}:${minutesStr}:${secsStr}`
}
