import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {LocationPoint, WorkoutSession} from '../types/data'
import {loadData, saveData, WORKOUT_SESSIONS_KEY} from '../utils/storage'
import {calculateMetrics} from '../utils/workoutMetrics'
import {useLocation} from './LocationProvider'

interface WorkoutSessionContextState {
  session: WorkoutSession | null
  pastSessions: WorkoutSession[]
  isActive: boolean
  startSession: () => void
  stopSession: (save: boolean) => void
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
    clearLocationHistory,
    isTracking: isLocationTracking,
  } = useLocation()
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const loadInitialData = async () => {
      const loadedSessions =
        await loadData<WorkoutSession[]>(WORKOUT_SESSIONS_KEY)
      if (loadedSessions) {
        setPastSessions(loadedSessions)
        console.log(`Loaded ${loadedSessions.length} past sessions.`)
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (isActive && isLocationTracking && session?.startTime) {
      const now = Date.now()
      const currentDuration = Math.floor((now - session.startTime) / 1000)

      const currentRoute: LocationPoint[] = locationHistory.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: loc.altitude,
        timestamp: loc.timestamp,
        speed: loc.speed,
        accuracy: loc.accuracy,
      }))

      setSession((prevSession) => {
        if (!prevSession) return null

        return {
          ...prevSession,
          duration: currentDuration,
          route: currentRoute,
        }
      })
    }
  }, [isActive, isLocationTracking, locationHistory, session?.startTime])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isActive && session?.startTime) {
      intervalId = setInterval(() => {
        setSession((prevSession) => {
          if (!prevSession || !prevSession.startTime) return prevSession
          const now = Date.now()
          const currentDuration = Math.floor(
            (now - prevSession.startTime) / 1000
          )
          return {...prevSession, duration: currentDuration}
        })
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, session?.startTime])

  const startSession = useCallback(async () => {
    if (isActive) return

    console.log('Starting workout session...')
    await startTracking()
    const startTime = Date.now()
    const newSession: WorkoutSession = {
      id: startTime.toString(),
      startTime: startTime,
      endTime: null,
      duration: 0,
      distance: 0,
      avgPace: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      route: [],
      status: 'ongoing',
    }
    setSession(newSession)
    setIsActive(true)
  }, [isActive, startTracking])

  const stopSession = useCallback(
    async (save: boolean) => {
      if (!isActive || !session) return

      console.log(`Stopping workout session... Save: ${save}`)
      stopTracking()
      const endTime = Date.now()
      const finalDuration = Math.floor((endTime - session.startTime) / 1000)

      const finalRoute: LocationPoint[] = locationHistory.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: loc.altitude,
        timestamp: loc.timestamp,
        speed: loc.speed,
        accuracy: loc.accuracy,
      }))

      const finalMetrics = calculateMetrics(finalRoute)

      const finalSession: WorkoutSession = {
        ...session,
        endTime: endTime,
        duration: finalDuration,
        route: finalRoute,
        distance: finalMetrics.distance,
        avgPace: finalMetrics.avgPace,
        avgSpeed: finalMetrics.avgSpeed,
        maxSpeed: finalMetrics.maxSpeed,
        status: save ? 'completed' : 'discarded',
      }

      if (save) {
        const updatedPastSessions = [...pastSessions, finalSession]
        setPastSessions(updatedPastSessions)
        await saveData<WorkoutSession[]>(
          WORKOUT_SESSIONS_KEY,
          updatedPastSessions
        )
        console.log('Session saved locally.')
      } else {
        console.log('Session discarded.')
      }

      setSession(null)
      setIsActive(false)
      clearLocationHistory()
    },
    [
      isActive,
      session,
      stopTracking,
      pastSessions,
      locationHistory,
      clearLocationHistory,
    ]
  )

  const contextValue: WorkoutSessionContextState = {
    session,
    pastSessions,
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
