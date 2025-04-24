import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'
import * as Location from 'expo-location'
import React from 'react'
import {Button, Text} from 'react-native'
import {LocationProvider, useLocation} from '../LocationProvider'

// --- Mocks ---
// Mock the expo-location module
jest.mock('expo-location', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    Highest: 6, // Mock enum values (actual value doesn't matter much here)
    BestForNavigation: 5,
  },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}))

// Type helpers for mocked functions
const mockedGetForegroundPermissionsAsync =
  Location.getForegroundPermissionsAsync as jest.Mock
const mockedRequestForegroundPermissionsAsync =
  Location.requestForegroundPermissionsAsync as jest.Mock
const mockedGetBackgroundPermissionsAsync =
  Location.getBackgroundPermissionsAsync as jest.Mock
const mockedRequestBackgroundPermissionsAsync =
  Location.requestBackgroundPermissionsAsync as jest.Mock
const mockedGetCurrentPositionAsync =
  Location.getCurrentPositionAsync as jest.Mock
const mockedWatchPositionAsync = Location.watchPositionAsync as jest.Mock

// Mock subscription object for watchPositionAsync
const mockSubscription = {
  remove: jest.fn(),
}

// --- Test Component ---
const TestConsumer = () => {
  const {
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
  } = useLocation()

  return (
    <>
      <Text testID='fg-perm'>{foregroundPermissionStatus ?? 'null'}</Text>
      <Text testID='bg-perm'>{backgroundPermissionStatus ?? 'null'}</Text>
      <Text testID='tracking'>{String(isTracking)}</Text>
      <Text testID='location-lat'>{currentLocation?.latitude ?? 'null'}</Text>
      <Text testID='history-count'>{locationHistory.length}</Text>
      <Button
        title='Check Perms'
        testID='check-perms'
        onPress={checkPermissions}
      />
      <Button
        title='Req FG Perm'
        testID='req-fg'
        onPress={requestForegroundPermission}
      />
      <Button
        title='Req BG Perm'
        testID='req-bg'
        onPress={requestBackgroundPermission}
      />
      <Button
        title='Start Track'
        testID='start-track'
        onPress={startTracking}
      />
      <Button title='Stop Track' testID='stop-track' onPress={stopTracking} />
      <Button
        title='Clear Hist'
        testID='clear-hist'
        onPress={clearLocationHistory}
      />
    </>
  )
}

// --- Helper Functions ---
const renderProvider = () => {
  return render(
    <LocationProvider>
      <TestConsumer />
    </LocationProvider>
  )
}

// Helper to create mock LocationObject from expo-location
const createMockExpoLocation = (
  timestamp: number
): Location.LocationObject => ({
  coords: {
    latitude: 40 + timestamp * 0.00001, // Make coords slightly different
    longitude: -74 + timestamp * 0.00001,
    altitude: 50,
    accuracy: 5,
    altitudeAccuracy: 5,
    heading: 0,
    speed: 5,
  },
  timestamp,
})

describe('LocationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default permissions: undetermined
    mockedGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.UNDETERMINED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.UNDETERMINED,
    })
    mockedRequestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    }) // Default deny on request
    mockedRequestBackgroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    })
    mockedGetCurrentPositionAsync.mockRejectedValue(
      new Error('Permission not granted')
    ) // Default reject position fetches
    mockedWatchPositionAsync.mockResolvedValue(mockSubscription) // Default resolve watch
  })

  it('renders with initial state and checks permissions on mount', async () => {
    mockedGetForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.DENIED,
    })

    renderProvider()

    // Check initial state (before async check finishes) might show null/false
    expect(screen.getByTestId('fg-perm').props.children).toBe('null')
    expect(screen.getByTestId('bg-perm').props.children).toBe('null')
    expect(screen.getByTestId('tracking').props.children).toBe('false')
    expect(screen.getByTestId('history-count').props.children).toBe(0)

    // Wait for permissions check to complete
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    )
    await waitFor(() =>
      expect(mockedGetBackgroundPermissionsAsync).toHaveBeenCalledTimes(1)
    )

    // Check state after permissions check
    expect(screen.getByTestId('fg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
    expect(screen.getByTestId('bg-perm').props.children).toBe(
      Location.PermissionStatus.DENIED
    )
  })

  it('checkPermissions updates status', async () => {
    mockedGetForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.DENIED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })

    renderProvider()
    // Wait for initial check
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    )
    await waitFor(() =>
      expect(mockedGetBackgroundPermissionsAsync).toHaveBeenCalledTimes(1)
    )

    // Manually trigger check again with different results
    mockedGetForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })

    await act(async () => {
      fireEvent.press(screen.getByTestId('check-perms'))
    })

    expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(2)
    expect(mockedGetBackgroundPermissionsAsync).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('fg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
    expect(screen.getByTestId('bg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
  })

  it('requestForegroundPermission updates status', async () => {
    mockedRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })
    renderProvider()

    await act(async () => {
      fireEvent.press(screen.getByTestId('req-fg'))
    })

    expect(mockedRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('fg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
  })

  it('requestBackgroundPermission requests foreground first if needed', async () => {
    // Setup: FG undetermined, BG undetermined initially
    mockedGetForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.UNDETERMINED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.UNDETERMINED,
    })
    // Mock FG request grants, BG request grants
    mockedRequestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedRequestBackgroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.GRANTED,
    })

    renderProvider()
    // Wait for initial checks
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    )

    await act(async () => {
      fireEvent.press(screen.getByTestId('req-bg'))
    })

    // FG should have been requested (and granted), then BG requested (and granted)
    expect(mockedRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    expect(mockedRequestBackgroundPermissionsAsync).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('fg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
    expect(screen.getByTestId('bg-perm').props.children).toBe(
      Location.PermissionStatus.GRANTED
    )
  })

  it('startTracking fails if foreground permission not granted', async () => {
    mockedGetForegroundPermissionsAsync.mockResolvedValueOnce({
      status: Location.PermissionStatus.DENIED,
    })
    renderProvider()
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    ) // Wait for initial check

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-track'))
    })

    // FG permission was denied, so requestForeground should be called
    expect(mockedRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    // Since requestForeground defaults to DENIED in mock setup, tracking should not start
    expect(mockedGetCurrentPositionAsync).not.toHaveBeenCalled()
    expect(mockedWatchPositionAsync).not.toHaveBeenCalled()
    expect(screen.getByTestId('tracking').props.children).toBe('false')
  })

  it('startTracking successfully starts watching position if permissions granted', async () => {
    const initialTime = Date.now()
    const mockInitialLocation = createMockExpoLocation(initialTime)
    const mockWatchLocation = createMockExpoLocation(initialTime + 1000)

    // Setup: Grant all permissions
    mockedGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetBackgroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetCurrentPositionAsync.mockResolvedValue(mockInitialLocation)

    // Mock the watcher callback registration
    let watchCallback: ((location: Location.LocationObject) => void) | null =
      null
    mockedWatchPositionAsync.mockImplementationOnce(
      async (options, callback) => {
        watchCallback = callback // Capture the callback
        return mockSubscription
      }
    )

    renderProvider()
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalledTimes(1)
    ) // Wait for initial check

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-track'))
    })

    // Permissions were granted, no requests needed
    expect(mockedRequestForegroundPermissionsAsync).not.toHaveBeenCalled()
    expect(mockedRequestBackgroundPermissionsAsync).not.toHaveBeenCalled()
    // Get initial position and start watching
    expect(mockedGetCurrentPositionAsync).toHaveBeenCalledTimes(1)
    expect(mockedWatchPositionAsync).toHaveBeenCalledTimes(1)

    // Check state after initial position
    await waitFor(() =>
      expect(screen.getByTestId('tracking').props.children).toBe('true')
    )
    expect(screen.getByTestId('location-lat').props.children).toBe(
      mockInitialLocation.coords.latitude
    )
    expect(screen.getByTestId('history-count').props.children).toBe(1) // Initial location added

    // Simulate a location update from the watcher
    expect(watchCallback).not.toBeNull()
    if (watchCallback) {
      await act(async () => {
        watchCallback!(mockWatchLocation)
      })
    }

    // Check state after watched location update
    expect(screen.getByTestId('location-lat').props.children).toBe(
      mockWatchLocation.coords.latitude
    )
    expect(screen.getByTestId('history-count').props.children).toBe(2) // Watched location added
  })

  it('stopTracking removes subscription and sets tracking to false', async () => {
    // Arrange: Start tracking first
    mockedGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetCurrentPositionAsync.mockResolvedValue(
      createMockExpoLocation(Date.now())
    )
    mockedWatchPositionAsync.mockResolvedValue(mockSubscription)

    renderProvider()
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalled()
    )

    await act(async () => {
      fireEvent.press(screen.getByTestId('start-track'))
    })
    await waitFor(() =>
      expect(screen.getByTestId('tracking').props.children).toBe('true')
    )

    // Act: Stop tracking
    await act(async () => {
      fireEvent.press(screen.getByTestId('stop-track'))
    })

    // Assert
    expect(mockSubscription.remove).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('tracking').props.children).toBe('false')
  })

  it('clearLocationHistory clears the history state', async () => {
    // Arrange: Start tracking and get some history
    const mockInitialLoc = createMockExpoLocation(Date.now())
    const mockWatchLoc = createMockExpoLocation(Date.now() + 1000)
    mockedGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    })
    mockedGetCurrentPositionAsync.mockResolvedValue(mockInitialLoc)
    let watchCallback: ((location: Location.LocationObject) => void) | null =
      null
    mockedWatchPositionAsync.mockImplementationOnce(
      async (options, callback) => {
        watchCallback = callback
        return mockSubscription
      }
    )

    renderProvider()
    await waitFor(() =>
      expect(mockedGetForegroundPermissionsAsync).toHaveBeenCalled()
    )
    await act(async () => {
      fireEvent.press(screen.getByTestId('start-track'))
    })
    await waitFor(() =>
      expect(screen.getByTestId('history-count').props.children).toBe(1)
    )
    if (watchCallback)
      await act(async () => {
        watchCallback!(mockWatchLoc)
      })
    await waitFor(() =>
      expect(screen.getByTestId('history-count').props.children).toBe(2)
    )

    // Act: Clear history
    await act(async () => {
      fireEvent.press(screen.getByTestId('clear-hist'))
    })

    // Assert
    expect(screen.getByTestId('history-count').props.children).toBe(0)
  })
})
