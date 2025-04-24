import AsyncStorage from '@react-native-async-storage/async-storage'
import {loadData, removeData, saveData, WORKOUT_SESSIONS_KEY} from '../storage'

// Use the actual mocked AsyncStorage for testing
const mockedAsyncStorage = AsyncStorage

const STORAGE_KEY_PREFIX = '@FitnessTracker:'

describe('AsyncStorage Utilities', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockedAsyncStorage.clear()
    jest.clearAllMocks()
  })

  it('saveData correctly saves stringified data with prefix', async () => {
    const key = 'testKey'
    const data = {id: 1, name: 'Test Item'}
    const expectedPrefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    const expectedJsonValue = JSON.stringify(data)

    await saveData(key, data)

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      expectedPrefixedKey,
      expectedJsonValue
    )
  })

  it('loadData correctly loads and parses data', async () => {
    const key = 'testKey'
    const data = {id: 2, value: 'Loaded Value'}
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    await mockedAsyncStorage.setItem(prefixedKey, JSON.stringify(data))

    const loaded = await loadData<typeof data>(key)

    expect(mockedAsyncStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(prefixedKey)
    expect(loaded).toEqual(data)
  })

  it('loadData returns null if key does not exist', async () => {
    const key = 'nonExistentKey'
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`

    const loaded = await loadData(key)

    expect(mockedAsyncStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(prefixedKey)
    expect(loaded).toBeNull()
  })

  it('loadData returns null and logs error on parse error', async () => {
    const key = 'invalidDataKey'
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    const invalidJson = '{"id": 3, value: "Unquoted String"}' // Invalid JSON
    await mockedAsyncStorage.setItem(prefixedKey, invalidJson)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const loaded = await loadData(key)

    expect(mockedAsyncStorage.getItem).toHaveBeenCalledTimes(1)
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(prefixedKey)
    expect(loaded).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('removeData correctly removes data', async () => {
    const key = 'removeKey'
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    // Add item first to ensure remove is called
    await mockedAsyncStorage.setItem(prefixedKey, '{}')

    await removeData(key)

    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1)
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(prefixedKey)
  })

  // Example using predefined keys
  it('can save and load using WORKOUT_SESSIONS_KEY', async () => {
    const sessions = [
      {id: 's1', distance: 1000},
      {id: 's2', distance: 2000},
    ]
    await saveData(WORKOUT_SESSIONS_KEY, sessions)
    const loaded = await loadData<typeof sessions>(WORKOUT_SESSIONS_KEY)
    expect(loaded).toEqual(sessions)
  })
})
