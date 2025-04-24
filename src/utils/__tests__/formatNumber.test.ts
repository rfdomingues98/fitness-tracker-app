import {formatNumber} from '../formatNumber'

describe('formatNumber Utility', () => {
  it('returns "N/A" for null input', () => {
    expect(formatNumber(null)).toBe('N/A')
  })

  it('returns "N/A" for undefined input', () => {
    expect(formatNumber(undefined)).toBe('N/A')
  })

  it('formats a positive integer with default 2 fraction digits', () => {
    expect(formatNumber(123)).toBe('123.00')
  })

  it('formats a positive float with default 2 fraction digits (rounding)', () => {
    expect(formatNumber(123.456)).toBe('123.46')
    expect(formatNumber(123.454)).toBe('123.45')
  })

  it('formats a negative float with default 2 fraction digits', () => {
    expect(formatNumber(-12.345)).toBe('-12.35')
  })

  it('formats zero with default 2 fraction digits', () => {
    expect(formatNumber(0)).toBe('0.00')
  })

  it('formats a number with 0 fraction digits', () => {
    expect(formatNumber(123.789, 0)).toBe('124') // Rounds up
    expect(formatNumber(123.45, 0)).toBe('123') // Rounds down
  })

  it('formats a number with 1 fraction digit', () => {
    expect(formatNumber(12.34, 1)).toBe('12.3')
    expect(formatNumber(12.35, 1)).toBe('12.3')
  })

  it('formats a number with more fraction digits than original', () => {
    expect(formatNumber(12.3, 3)).toBe('12.300')
  })
})
