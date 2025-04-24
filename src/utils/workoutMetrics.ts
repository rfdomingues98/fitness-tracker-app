import {LocationPoint} from '../types/data'

/**
 * Placeholder function to calculate workout metrics from a route.
 * TODO: Implement actual calculation logic.
 * @param route Array of location points.
 * @returns Calculated metrics (distance, pace, speed).
 */
export const calculateMetrics = (
  route: LocationPoint[]
): {
  distance: number
  avgPace: number
  avgSpeed: number
  maxSpeed: number
} => {
  console.log('Calculating metrics for route with', route.length, 'points')
  // Placeholder values - Replace with actual calculations
  const distance = route.length > 1 ? 100 * route.length : 0 // Dummy distance
  const durationSeconds =
    route.length > 1
      ? (route[route.length - 1].timestamp - route[0].timestamp) / 1000
      : 0
  const avgSpeed = durationSeconds > 0 ? distance / durationSeconds : 0
  const avgPace = distance > 0 ? durationSeconds / (distance / 1000) : 0 // seconds per km
  const maxSpeed = route.reduce((max, p) => Math.max(max, p.speed ?? 0), 0)

  return {
    distance: distance, // meters
    avgPace: avgPace, // seconds per kilometer
    avgSpeed: avgSpeed, // meters per second
    maxSpeed: maxSpeed, // meters per second
  }
}
