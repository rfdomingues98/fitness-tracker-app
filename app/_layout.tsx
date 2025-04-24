import {LocationProvider} from '@/src/providers/LocationProvider'
import {Stack} from 'expo-router'

export default function RootLayout() {
  return (
    <LocationProvider>
      <Stack screenOptions={{headerShown: false}} />
    </LocationProvider>
  )
}
