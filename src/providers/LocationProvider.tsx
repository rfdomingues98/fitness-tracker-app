import * as Location from 'expo-location'
import {DeviceMotion} from 'expo-sensors'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

export interface LocationData {
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
  clearLocationHistory: () => void
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
      const {status} = await Location.requestBackgroundPermissionsAsync()
      setBackgroundPermissionStatus(status)
      return status
    }

  const startTracking = async () => {
    if (isTracking) return

    console.log('Starting tracking')
    let fgStatus = foregroundPermissionStatus
    console.log('Foreground permission status:', fgStatus)
    if (fgStatus !== Location.PermissionStatus.GRANTED) {
      fgStatus = await requestForegroundPermission()
    }

    if (fgStatus !== Location.PermissionStatus.GRANTED) {
      console.error('Foreground location permission not granted.')
      // TODO: Provide user some feedback
      return
    }

    /* let bgStatus = backgroundPermissionStatus
    console.log('Background permission status:', bgStatus)
    if (bgStatus !== Location.PermissionStatus.GRANTED) {
      bgStatus = await requestBackgroundPermission()
      if (bgStatus !== Location.PermissionStatus.GRANTED) {
        console.warn(
          'Background location permission not granted. Tracking might be limited.'
        )
      }
    } */

    console.log('Starting location tracking', fgStatus)
    try {
      console.log('Getting initial location')
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      })
      const formattedInitialLocation = formatLocationObject(initialLocation)
      setCurrentLocation(formattedInitialLocation)
      setLocationHistory([formattedInitialLocation])

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 200, // Update every half second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const formattedLocation = formatLocationObject(location)
          setCurrentLocation(formattedLocation)
          console.log('Current Location:', formattedLocation)
          setLocationHistory((prev) => [...prev, formattedLocation])
        }
      )

      setIsTracking(true)
    } catch (error) {
      console.error('Error starting location/motion tracking:', error)
      setIsTracking(false)
    }
  }

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
    }
    setIsTracking(false)
  }

  const clearLocationHistory = () => {
    setLocationHistory([])
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
    // Check if DeviceMotion is available
    DeviceMotion.isAvailableAsync().then((available) => {
      if (!available) {
        console.warn('Device Motion sensor is not available on this device.')
      }
    })

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
    clearLocationHistory,
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
