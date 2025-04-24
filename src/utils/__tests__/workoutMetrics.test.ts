import {LocationPoint} from '../../types/data'
import {calculateMetrics} from '../workoutMetrics'

// Helper to create LocationPoint mocks
const createMockPoint = (
  timestamp: number,
  speed: number | null = 5
): LocationPoint => ({
  latitude: 40.7128, // Example coords
  longitude: -74.006,
  altitude: 50,
  timestamp,
  speed,
  accuracy: 5,
})

describe('Workout Metrics Calculation (Placeholder)', () => {
  it('returns zero metrics for empty route', () => {
    const metrics = calculateMetrics([])
    expect(metrics).toEqual({
      distance: 0,
      avgPace: 0,
      avgSpeed: 0,
      maxSpeed: 0,
    })
  })

  it('returns zero metrics for single point route', () => {
    const point = createMockPoint(Date.now())
    const metrics = calculateMetrics([point])
    expect(metrics).toEqual({
      distance: 0,
      avgPace: 0,
      avgSpeed: 0,
      maxSpeed: point.speed ?? 0, // Max speed should reflect the single point
    })
  })

  it('calculates placeholder metrics for multi-point route', () => {
    const startTime = Date.now()
    const route: LocationPoint[] = [
      createMockPoint(startTime, 5),
      createMockPoint(startTime + 10000, 6), // 10 seconds later
      createMockPoint(startTime + 20000, 4), // 20 seconds later
    ]

    const metrics = calculateMetrics(route)

    // WARNING: These expectations are based on the *placeholder* logic
    const expectedDistance = 100 * route.length // 300
    const expectedDuration = (route[2].timestamp - route[0].timestamp) / 1000 // 20s
    const expectedAvgSpeed = expectedDistance / expectedDuration // 300 / 20 = 15 m/s
    const expectedAvgPace = expectedDuration / (expectedDistance / 1000) // 20 / (300/1000) = 20 / 0.3 = 66.66... s/km
    const expectedMaxSpeed = 6

    expect(metrics.distance).toBeCloseTo(expectedDistance)
    expect(metrics.avgSpeed).toBeCloseTo(expectedAvgSpeed)
    expect(metrics.avgPace).toBeCloseTo(expectedAvgPace)
    expect(metrics.maxSpeed).toBe(expectedMaxSpeed)
  })

  it('correctly identifies max speed', () => {
    const route: LocationPoint[] = [
      createMockPoint(Date.now(), 5),
      createMockPoint(Date.now() + 1000, 7),
      createMockPoint(Date.now() + 2000, 6),
      createMockPoint(Date.now() + 3000, null), // Test null speed
    ]
    const metrics = calculateMetrics(route)
    expect(metrics.maxSpeed).toBe(7)
  })
})
