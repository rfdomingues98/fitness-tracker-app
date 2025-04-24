import * as Location from 'expo-location'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

interface LocationData {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

interface LocationContextState {
  foregroundPermissionStatus: Location.PermissionStatus | null
  backgroundPermissionStatus: Location.PermissionStatus | null
  currentLocation: LocationData | null
  locationHistory: LocationData[]
  isTracking: boolean
  checkPermissions: () => Promise<void>
  requestForegroundPermission: () => Promise<Location.PermissionStatus>
  requestBackgroundPermission: () => Promise<Location.PermissionStatus>
  startTracking: () => Promise<void>
  stopTracking: () => void
}

const LocationContext = createContext<LocationContextState | undefined>(
  undefined
)

interface LocationProviderProps {
  children: ReactNode
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [foregroundPermissionStatus, setForegroundPermissionStatus] =
    useState<Location.PermissionStatus | null>(null)
  const [backgroundPermissionStatus, setBackgroundPermissionStatus] =
    useState<Location.PermissionStatus | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  )
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  )

  const checkPermissions = async () => {
    const foreground = await Location.getForegroundPermissionsAsync()
    setForegroundPermissionStatus(foreground.status)
    const background = await Location.getBackgroundPermissionsAsync()
    setBackgroundPermissionStatus(background.status)
  }

  const requestForegroundPermission =
    async (): Promise<Location.PermissionStatus> => {
      const {status} = await Location.requestForegroundPermissionsAsync()
      setForegroundPermissionStatus(status)
      return status
    }

  const requestBackgroundPermission =
    async (): Promise<Location.PermissionStatus> => {
      // First, ensure foreground permission is granted
      const foregroundStatus = await requestForegroundPermission()
      if (foregroundStatus !== Location.PermissionStatus.GRANTED) {
        console.warn(
          'Foreground permission is required before requesting background permission.'
        )
        // Return the current background status or a denied status
        const currentBackground = await Location.getBackgroundPermissionsAsync()
        setBackgroundPermissionStatus(currentBackground.status)
        return currentBackground.status
      }

      // Now request background permission
      const {status} = await Location.requestBackgroundPermissionsAsync()
      setBackgroundPermissionStatus(status)
      return status
    }

  const startTracking = async () => {
    if (isTracking) return

    let fgStatus = foregroundPermissionStatus
    if (fgStatus !== Location.PermissionStatus.GRANTED) {
      fgStatus = await requestForegroundPermission()
    }

    if (fgStatus !== Location.PermissionStatus.GRANTED) {
      console.error('Foreground location permission not granted.')
      // Consider throwing an error or providing user feedback
      return
    }

    // Optional: Check/request background permission if needed for the app's logic
    let bgStatus = backgroundPermissionStatus
    if (bgStatus !== Location.PermissionStatus.GRANTED) {
      bgStatus = await requestBackgroundPermission()
      if (bgStatus !== Location.PermissionStatus.GRANTED) {
        console.warn(
          'Background location permission not granted. Tracking might be limited.'
        )
      }
    }

    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      })
      const formattedInitialLocation = formatLocationObject(initialLocation)
      setCurrentLocation(formattedInitialLocation)
      setLocationHistory([formattedInitialLocation])

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500, // Update every half second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const formattedLocation = formatLocationObject(location)
          setCurrentLocation(formattedLocation)
          setLocationHistory((prev) => [...prev, formattedLocation])
        }
      )
      setIsTracking(true)
    } catch (error) {
      console.error('Error starting location tracking:', error)
      setIsTracking(false)
    }
  }

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
    }
    setIsTracking(false)
    // Optionally clear history or last location
    // setCurrentLocation(null);
    // setLocationHistory([]);
  }

  const formatLocationObject = (
    location: Location.LocationObject
  ): LocationData => ({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude,
    accuracy: location.coords.accuracy,
    altitudeAccuracy: location.coords.altitudeAccuracy,
    heading: location.coords.heading,
    speed: location.coords.speed,
    timestamp: location.timestamp,
  })

  useEffect(() => {
    checkPermissions()

    return () => {
      stopTracking()
    }
  }, [])

  const contextValue: LocationContextState = {
    foregroundPermissionStatus,
    backgroundPermissionStatus,
    currentLocation,
    locationHistory,
    isTracking,
    checkPermissions,
    requestForegroundPermission,
    requestBackgroundPermission,
    startTracking,
    stopTracking,
  }

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = (): LocationContextState => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
