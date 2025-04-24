import {StyleSheet, Text, View} from 'react-native'
import {useLocation} from '../providers/LocationProvider'
import {formatNumber} from '../utils/formatNumber'

export const LocationSheet = () => {
  const {currentLocation} = useLocation()
  if (!currentLocation) return null
  return (
    <View style={styles.infoPanel}>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Lat: {formatNumber(currentLocation.latitude, 6)}
        </Text>
        <Text style={styles.infoText}>
          Lon: {formatNumber(currentLocation.longitude, 6)}
        </Text>
        <Text style={styles.infoText}>
          Alt: {formatNumber(currentLocation.altitude, 1)} m
        </Text>
        <Text style={styles.infoText}>
          Acc: {formatNumber(currentLocation.accuracy, 1)} m
        </Text>
        <Text style={styles.infoText}>
          Head: {formatNumber(currentLocation.heading, 0)}°
        </Text>
        <Text style={styles.infoText}>
          Speed: {formatNumber(currentLocation.speed, 1)} m/s
        </Text>
        <Text style={styles.infoText}>
          Time: {new Date(currentLocation.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Speed: {formatNumber((currentLocation.speed ?? 0) * 3.6, 1)} km/h
        </Text>
        <Text style={styles.infoText}>Distance: 0.00 km</Text>
        <Text style={styles.infoText}>Pace: --:-- min/km</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoPanel: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
    borderTopWidth: 1,
    borderTopColor: '#444',
    gap: 20,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2, // Add slight spacing between lines
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
})
