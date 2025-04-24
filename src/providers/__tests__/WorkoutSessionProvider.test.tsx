import {act, fireEvent, render, screen} from '@testing-library/react-native'
import React from 'react'
import {Button, Text} from 'react-native'
import {LocationPoint, WorkoutSession} from '../../types/data'
import * as Storage from '../../utils/storage'
import * as Metrics from '../../utils/workoutMetrics'
import {useLocation} from '../LocationProvider'
import {
  WorkoutSessionProvider,
  useWorkoutSession,
} from '../WorkoutSessionProvider'

// --- Mocks ---
// Mock the useLocation hook
jest.mock('../LocationProvider', () => ({
  useLocation: jest.fn(),
}))
const mockedUseLocation = useLocation as jest.Mock

// Mock storage functions
jest.mock('../../utils/storage', () => ({
  saveData: jest.fn(),
  loadData: jest.fn(),
  WORKOUT_SESSIONS_KEY: 'mockWorkoutSessions', // Use a consistent key
}))
const mockedLoadData = Storage.loadData as jest.Mock
const mockedSaveData = Storage.saveData as jest.Mock

// Mock metrics calculation
jest.mock('../../utils/workoutMetrics', () => ({
  calculateMetrics: jest.fn(),
}))
const mockedCalculateMetrics = Metrics.calculateMetrics as jest.Mock

// --- Test Component ---
// A simple component to consume the context
const TestConsumer = () => {
  const {session, pastSessions, isActive, startSession, stopSession} =
    useWorkoutSession()
  return (
    <>
      <Text testID='is-active'>{String(isActive)}</Text>
      <Text testID='session-id'>{session?.id ?? 'null'}</Text>
      <Text testID='past-sessions-count'>{pastSessions.length}</Text>
      <Button title='Start' testID='start-button' onPress={startSession} />
      <Button
        title='Stop & Save'
        testID='stop-save-button'
        onPress={() => stopSession(true)}
      />
      <Button
        title='Stop & Discard'
        testID='stop-discard-button'
        onPress={() => stopSession(false)}
      />
    </>
  )
}

// --- Helper Functions ---
const renderProvider = () => {
  return render(
    <WorkoutSessionProvider>
      <TestConsumer />
    </WorkoutSessionProvider>
  )
}

// Helper to create mock LocationPoint
const createMockLocation = (timestamp: number): LocationPoint => ({
  latitude: 1,
  longitude: 1,
  altitude: 10,
  timestamp,
  speed: 5,
  accuracy: 5,
})

// Default mock values for useLocation
const mockLocationContextValue = {
  startTracking: jest.fn().mockResolvedValue(undefined),
  stopTracking: jest.fn(),
  clearLocationHistory: jest.fn(),
  locationHistory: [],
  isTracking: false,
  // Other fields might be needed if used by the provider
  currentLocation: null,
  foregroundPermissionStatus: null,
  backgroundPermissionStatus: null,
  checkPermissions: jest.fn(),
  requestForegroundPermission: jest.fn(),
  requestBackgroundPermission: jest.fn(),
}

// Default mock values for metrics
const mockMetricsValue = {
  distance: 1000,
  avgPace: 300,
  avgSpeed: 3.33,
  maxSpeed: 5,
}

describe('WorkoutSessionProvider', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Provide default mock implementation for useLocation
    mockedUseLocation.mockReturnValue(mockLocationContextValue)
    // Default empty load
    mockedLoadData.mockResolvedValue(null)
    // Default metrics return
    mockedCalculateMetrics.mockReturnValue(mockMetricsValue)
  })

  it('loads past sessions from storage on mount', async () => {
    const initialSessions: WorkoutSession[] = [
      {
        id: 's1',
        startTime: Date.now() - 200000,
        endTime: Date.now() - 100000,
        duration: 100,
        distance: 1000,
        avgPace: 100,
        avgSpeed: 10,
        maxSpeed: 15,
        route: [],
        status: 'completed',
      },
    ]
    mockedLoadData.mockResolvedValueOnce(initialSessions)

    renderProvider()

    // Wait for the async load to complete and state to update
    expect(await screen.findByText('1')).toBeTruthy() // past-sessions-count
    expect(mockedLoadData).toHaveBeenCalledWith(Storage.WORKOUT_SESSIONS_KEY)
  })

  it('starts a session correctly', async () => {
    renderProvider()

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-button'))
    })

    // Check mocks
    expect(mockLocationContextValue.startTracking).toHaveBeenCalledTimes(1)
    // Check state update
    expect(await screen.findByText('true')).toBeTruthy() // is-active
    expect(screen.getByTestId('session-id').props.children).not.toBe('null')
  })

  it('does not start a session if already active', async () => {
    mockedUseLocation.mockReturnValue({...mockLocationContextValue}) // Start with default inactive

    renderProvider()

    // Start first time
    await act(async () => {
      fireEvent.press(screen.getByTestId('start-button'))
    })
    expect(mockLocationContextValue.startTracking).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('is-active').props.children).toBe('true')

    // Try starting again (simulate state being active - though the test component reflects context)
    // For simplicity, we check if startTracking is called again
    await act(async () => {
      fireEvent.press(screen.getByTestId('start-button'))
    })
    expect(mockLocationContextValue.startTracking).toHaveBeenCalledTimes(1) // Should not be called again
  })

  it('stops and saves a session correctly', async () => {
    // Arrange: Start a session first
    renderProvider()
    await act(async () => {
      fireEvent.press(screen.getByTestId('start-button'))
    })
    const sessionId = screen.getByTestId('session-id').props.children
    expect(await screen.findByText('true')).toBeTruthy() // is-active

    // Simulate some location history
    const mockRoute = [
      createMockLocation(Date.now() - 10000),
      createMockLocation(Date.now()),
    ]
    mockedUseLocation.mockReturnValue({
      ...mockLocationContextValue,
      isTracking: true, // Simulate tracking active
      locationHistory: mockRoute,
    })

    // Act: Stop and Save
    await act(async () => {
      fireEvent.press(screen.getByTestId('stop-save-button'))
    })

    // Assert: Check mocks and state
    expect(mockLocationContextValue.stopTracking).toHaveBeenCalledTimes(1)
    expect(mockLocationContextValue.clearLocationHistory).toHaveBeenCalledTimes(
      1
    )
    expect(mockedCalculateMetrics).toHaveBeenCalledWith(expect.any(Array)) // Check if called with route points
    expect(mockedSaveData).toHaveBeenCalledTimes(1)
    // Check that saved data includes the new session
    const savedData = mockedSaveData.mock.calls[0][1] // Second argument of the first call
    expect(savedData).toBeInstanceOf(Array)
    expect(savedData.length).toBe(1)
    expect(savedData[0].id).toBe(sessionId)
    expect(savedData[0].status).toBe('completed')
    expect(savedData[0].distance).toBe(mockMetricsValue.distance) // Check if metrics were included

    // Check final state
    expect(await screen.findByText('false')).toBeTruthy() // is-active should be false
    expect(screen.getByTestId('session-id').props.children).toBe('null')
    expect(screen.getByTestId('past-sessions-count').props.children).toBe(1) // Count updated
  })

  it('stops and discards a session correctly', async () => {
    // Arrange: Start a session first
    renderProvider()
    await act(async () => {
      fireEvent.press(screen.getByTestId('start-button'))
    })
    expect(await screen.findByText('true')).toBeTruthy() // is-active

    // Simulate some location history
    const mockRoute = [createMockLocation(Date.now() - 5000)]
    mockedUseLocation.mockReturnValue({
      ...mockLocationContextValue,
      isTracking: true,
      locationHistory: mockRoute,
    })

    // Act: Stop and Discard
    await act(async () => {
      fireEvent.press(screen.getByTestId('stop-discard-button'))
    })

    // Assert: Check mocks and state
    expect(mockLocationContextValue.stopTracking).toHaveBeenCalledTimes(1)
    expect(mockLocationContextValue.clearLocationHistory).toHaveBeenCalledTimes(
      1
    )
    expect(mockedCalculateMetrics).toHaveBeenCalledWith(expect.any(Array)) // Still calculates metrics before deciding status
    expect(mockedSaveData).not.toHaveBeenCalled() // Save should NOT be called

    // Check final state
    expect(await screen.findByText('false')).toBeTruthy() // is-active should be false
    expect(screen.getByTestId('session-id').props.children).toBe('null')
    expect(screen.getByTestId('past-sessions-count').props.children).toBe(0) // Past sessions remain unchanged (assuming none loaded initially)
  })

  // TODO: Add tests for session updates during tracking (useEffect logic)
  // This requires more complex mocking of intervals and location updates.
})
