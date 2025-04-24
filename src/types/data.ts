/**
 * Represents a single GPS coordinate with a timestamp.
 */
export interface LocationPoint {
  latitude: number
  longitude: number
  altitude: number | null
  timestamp: number // Unix timestamp (ms)
  speed: number | null // Speed in m/s
  accuracy: number | null // Position accuracy in meters
}

/**
 * Represents a completed or ongoing workout session.
 */
export interface WorkoutSession {
  id: string // Unique identifier (e.g., UUID or timestamp-based)
  startTime: number // Unix timestamp (ms)
  endTime: number | null // Unix timestamp (ms), null if ongoing
  duration: number // Duration in seconds
  distance: number // Distance in meters
  avgPace: number // Average pace in seconds per kilometer
  avgSpeed: number // Average speed in meters per second
  maxSpeed: number // Maximum speed recorded during the session
  route: LocationPoint[] // Array of location points tracking the route
  status: 'ongoing' | 'paused' | 'completed' | 'discarded'
}

/**
 * Represents user-configurable preferences.
 */
export interface UserPreferences {
  units: 'km' | 'mi'
  mapStyle: 'street' | 'satellite'
}
