import {LocationProvider} from '@/src/providers/LocationProvider'
import {WorkoutSessionProvider} from '@/src/providers/WorkoutSessionProvider'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {useFonts} from 'expo-font'
import {Stack} from 'expo-router'
import {StatusBar} from 'expo-status-bar'
import {useColorScheme} from 'react-native'
import './global.css'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocationProvider>
        <WorkoutSessionProvider>
          <Stack>
            <Stack.Screen name='(tabs)' options={{headerShown: false}} />
            <Stack.Screen name='+not-found' />
          </Stack>
          <StatusBar style='auto' />
        </WorkoutSessionProvider>
      </LocationProvider>
    </ThemeProvider>
  )
}
