import React from 'react'
import {View} from 'react-native'
import {useLocation} from '../providers/LocationProvider'
import {useWorkoutSession} from '../providers/WorkoutSessionProvider'
import {formatDuration} from '../utils/formatters'
import {calculateDistance} from '../utils/geolocation'
import {ThemedText} from './ThemedText'

export const MetricsDisplay: React.FC = () => {
  const {session} = useWorkoutSession()
  const {locationHistory, currentLocation} = useLocation()

  const duration = session?.duration || 0

  let realTimeDistance = 0
  if (locationHistory.length > 1) {
    for (let i = 1; i < locationHistory.length; i++) {
      const prevPoint = locationHistory[i - 1]
      const currentPoint = locationHistory[i]
      realTimeDistance += calculateDistance(prevPoint, currentPoint)
    }
  }

  const speedMPS = currentLocation?.speed || 0
  const speedKPH = speedMPS > 0 ? speedMPS * 3.6 : 0

  const currentPace = duration / 60 / realTimeDistance

  return (
    <View className='bg-gray-200 p-4 rounded-lg shadow-md'>
      <View className='flex-row justify-around mb-2'>
        <View className='items-center'>
          <ThemedText type='label' className='text-gray-400'>
            Duration
          </ThemedText>
          <ThemedText type='metric' className='text-white text-2xl font-bold'>
            {formatDuration(duration)}
          </ThemedText>
        </View>
        <View className='items-center'>
          <ThemedText type='label' className='text-gray-400'>
            Distance
          </ThemedText>
          <ThemedText type='metric' className='text-white text-2xl font-bold'>
            {realTimeDistance.toFixed(2)} km
          </ThemedText>
        </View>
      </View>
      <View className='flex-row justify-around'>
        <View className='items-center'>
          <ThemedText type='label' className='text-gray-400'>
            Speed
          </ThemedText>
          <ThemedText type='metric' className='text-white text-2xl font-bold'>
            {speedKPH.toFixed(1)} km/h
          </ThemedText>
        </View>
        <View className='items-center'>
          <ThemedText type='label' className='text-gray-400'>
            Pace
          </ThemedText>
          <ThemedText type='metric' className='text-white text-2xl font-bold'>
            {currentPace > 0 && currentPace < Infinity
              ? currentPace.toFixed(2)
              : '--'}{' '}
            min/km
          </ThemedText>
        </View>
      </View>
    </View>
  )
}
