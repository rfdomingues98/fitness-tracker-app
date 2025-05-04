import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import MapDisplay from '../components/MapDisplay'
import {MetricsDisplay} from '../components/MetricsDisplay'
import {ThemedView} from '../components/ThemedView'
import {useWorkoutSession} from '../providers/WorkoutSessionProvider'

const TrackingScreen = () => {
  const {isActive, startSession, stopSession} = useWorkoutSession()

  return (
    <ThemedView className='flex-1'>
      <MapDisplay />

      <View className='absolute bottom-20 left-2 right-2'>
        <MetricsDisplay />
      </View>

      <View className='absolute bottom-5 left-0 right-0 flex-row justify-center items-center'>
        {!isActive ? (
          <TouchableOpacity
            className='bg-green-500 p-4 rounded-full w-20 h-20 items-center justify-center shadow-lg'
            onPress={startSession}
          >
            <Text className='text-white font-bold'>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className='bg-red-500 p-4 rounded-full w-20 h-20 items-center justify-center shadow-lg'
            onPress={() => stopSession(true)}
          >
            <Text className='text-white font-bold'>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  )
}

export default TrackingScreen
