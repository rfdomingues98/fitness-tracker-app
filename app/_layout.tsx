import {LocationProvider} from '@/src/providers/LocationProvider'
import {WorkoutSessionProvider} from '@/src/providers/WorkoutSessionProvider'
import {Stack} from 'expo-router'

export default function RootLayout() {
  return (
    <LocationProvider>
      <WorkoutSessionProvider>
        <Stack screenOptions={{headerShown: false}} />
      </WorkoutSessionProvider>
    </LocationProvider>
  )
}
