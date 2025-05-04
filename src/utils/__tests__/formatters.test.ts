import {formatDuration} from '../formatters'

describe('formatDuration', () => {
  it('should format 0 seconds correctly', () => {
    expect(formatDuration(0)).toBe('00:00:00')
  })

  it('should format less than a minute correctly', () => {
    expect(formatDuration(35)).toBe('00:00:35')
  })

  it('should format less than an hour correctly', () => {
    expect(formatDuration(125)).toBe('00:02:05') // 2 minutes and 5 seconds
  })

  it('should format exactly one hour correctly', () => {
    expect(formatDuration(3600)).toBe('01:00:00')
  })

  it('should format more than an hour correctly', () => {
    expect(formatDuration(3725)).toBe('01:02:05') // 1 hour, 2 minutes, 5 seconds
  })

  it('should handle large durations', () => {
    expect(formatDuration(86400)).toBe('24:00:00') // 24 hours
  })
})
