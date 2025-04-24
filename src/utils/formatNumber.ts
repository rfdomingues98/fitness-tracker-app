export const formatNumber = (
  num: number | null | undefined,
  fractionDigits: number = 2
): string => {
  if (num === null || num === undefined) {
    return 'N/A'
  }
  return num.toFixed(fractionDigits)
}
