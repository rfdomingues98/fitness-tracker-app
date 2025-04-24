import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {LocationData, useLocation} from './LocationProvider'

interface WorkoutSession {
  startTime: number | null
  endTime: number | null
  duration: number // in seconds
  routeData: LocationData[]
  // Add distance, pace, etc. later
}

interface WorkoutSessionContextState {
  session: WorkoutSession | null
  isActive: boolean
  startSession: () => void
  stopSession: () => void
}

const WorkoutSessionContext = createContext<
  WorkoutSessionContextState | undefined
>(undefined)

interface WorkoutSessionProviderProps {
  children: ReactNode
}

export const WorkoutSessionProvider: React.FC<WorkoutSessionProviderProps> = ({
  children,
}) => {
  const {
    startTracking,
    stopTracking,
    locationHistory,
    isTracking: isLocationTracking,
  } = useLocation()
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (isActive && isLocationTracking && sessionStartTime) {
      const now = Date.now()
      const currentDuration = Math.floor((now - sessionStartTime) / 1000)

      setSession((prevSession) => ({
        startTime: sessionStartTime,
        endTime: null,
        duration: currentDuration,
        routeData: locationHistory,
      }))
    }
    // Only re-run when locationHistory changes during an active session
  }, [isActive, isLocationTracking, locationHistory, sessionStartTime])

  // Effect to track duration using an interval when active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isActive && sessionStartTime) {
      intervalId = setInterval(() => {
        const now = Date.now()
        const currentDuration = Math.floor((now - sessionStartTime) / 1000)
        setSession((prevSession) => ({
          ...(prevSession as WorkoutSession),
          duration: currentDuration,
        }))
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, sessionStartTime])

  const startSession = useCallback(async () => {
    if (isActive) return

    console.log('Starting workout session...')
    await startTracking()
    const startTime = Date.now()
    setSessionStartTime(startTime)
    setIsActive(true)
    setSession({
      startTime: startTime,
      endTime: null,
      duration: 0,
      routeData: [],
    })
  }, [isActive, startTracking])

  const stopSession = useCallback(() => {
    if (!isActive || !sessionStartTime) return

    console.log('Stopping workout session...')
    stopTracking()
    const endTime = Date.now()
    const finalDuration = Math.floor((endTime - sessionStartTime) / 1000)

    setSession((prevSession) => ({
      ...(prevSession as WorkoutSession),
      endTime: endTime,
      duration: finalDuration,
      routeData: locationHistory,
    }))
    setIsActive(false)
    setSessionStartTime(null)
    // TODO: Save session data to backend
    console.log('Session stopped. Final data:', session)
  }, [isActive, stopTracking, sessionStartTime, locationHistory, session])

  const contextValue: WorkoutSessionContextState = {
    session,
    isActive,
    startSession,
    stopSession,
  }

  return (
    <WorkoutSessionContext.Provider value={contextValue}>
      {children}
    </WorkoutSessionContext.Provider>
  )
}

export const useWorkoutSession = (): WorkoutSessionContextState => {
  const context = useContext(WorkoutSessionContext)
  if (context === undefined) {
    throw new Error(
      'useWorkoutSession must be used within a WorkoutSessionProvider'
    )
  }
  return context
}
