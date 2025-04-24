import {LocationSheet} from '@/src/components/LocationSheet'
import {useLocation} from '@/src/providers/LocationProvider'
import React, {useEffect} from 'react'
import {StyleSheet, Text, View} from 'react-native'

export default function Index() {
  const {currentLocation, startTracking} = useLocation()

  useEffect(() => {
    startTracking()
  }, [startTracking])

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text>Fetching location...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LocationSheet />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})
