import AsyncStorage from '@react-native-async-storage/async-storage'

// Prefix for all storage keys to avoid conflicts
const STORAGE_KEY_PREFIX = '@FitnessTracker:'

/**
 * Saves data to AsyncStorage.
 * Automatically stringifies the value.
 * @param key The key to save the data under (will be prefixed).
 * @param value The value to save (must be JSON serializable).
 */
export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(prefixedKey, jsonValue)
  } catch (e) {
    console.error(`Error saving data for key "${key}":`, e)
    // Handle saving error (e.g., report to an error service)
  }
}

/**
 * Loads data from AsyncStorage.
 * Automatically parses the JSON string.
 * Returns null if the key doesn't exist or if there's an error.
 * @param key The key to load data from (will be prefixed).
 * @returns The parsed data or null.
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    const jsonValue = await AsyncStorage.getItem(prefixedKey)
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : null
  } catch (e) {
    console.error(`Error loading data for key "${key}":`, e)
    // Handle loading error
    return null
  }
}

/**
 * Removes data from AsyncStorage.
 * @param key The key to remove data from (will be prefixed).
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    const prefixedKey = `${STORAGE_KEY_PREFIX}${key}`
    await AsyncStorage.removeItem(prefixedKey)
  } catch (e) {
    console.error(`Error removing data for key "${key}":`, e)
    // Handle removing error
  }
}

export const WORKOUT_SESSIONS_KEY = 'workoutSessions'
export const USER_PREFERENCES_KEY = 'userPreferences'
