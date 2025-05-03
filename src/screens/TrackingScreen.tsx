import React, {useEffect} from 'react'
import {StyleSheet, View} from 'react-native'
import MapDisplay from '../components/MapDisplay'
import {useLocation} from '../providers/LocationProvider'

const TrackingScreen = () => {
  const {startTracking} = useLocation()
  useEffect(() => {
    startTracking()
  }, [])

  // TODO: Add controls to start/stop session

  return (
    <View style={styles.container}>
      <MapDisplay />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default TrackingScreen
