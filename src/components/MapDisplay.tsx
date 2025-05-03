import Icons from '@expo/vector-icons/MaterialIcons'
import MapBoxGL, {
  FillExtrusionLayer,
  Images,
  LineLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  StyleURL,
  UserTrackingMode,
  Viewport,
} from '@rnmapbox/maps'
import React, {useRef, useState} from 'react'
import {StyleSheet, useColorScheme, View} from 'react-native'
import {useLocation} from '../providers/LocationProvider'

MapBoxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string)

const MapDisplay: React.FC = () => {
  const {currentLocation, locationHistory} = useLocation()
  const cameraRef = useRef<MapBoxGL.Camera>(null)
  const [cameraFollowHeading, setCameraFollowHeading] = useState(false)
  const [isViewportIdle, setIsViewportIdle] = useState(true)

  const colorTheme = useColorScheme()
  const viewportRef = useRef<Viewport>(null)
  const routeCoordinates = locationHistory.map((point) => [
    point.longitude,
    point.latitude,
  ])

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  }

  const onCenter = () => {
    setCameraFollowHeading((current) => !current)
    if (viewportRef.current) {
      // This might not be strictly necessary if followUserLocation={true} works as expected
      // viewportRef.current.transitionTo({ type: 'followPuck' }, {maxDuration: 500})
    }
  }

  const images = {
    topImage: require('@/assets/images/location-puck.png'),
  }

  MapBoxGL.locationManager.setMinDisplacement(1)
  const layerStyles = {
    building: {
      fillExtrusionHeight: ['get', 'height'],
      fillExtrusionBase: ['get', 'min_height'],
      fillExtrusionColor: 'blue',
    },
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={colorTheme === 'dark' ? StyleURL.Dark : StyleURL.Light}
        compassEnabled
        compassPosition={{bottom: 10, right: 10}}
        zoomEnabled
        logoEnabled={false}
        localizeLabels
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Viewport
          ref={viewportRef}
          onStatusChanged={(event) => {
            console.log({event})
            setIsViewportIdle(event.to.kind === 'idle')
          }}
        />
        <MapBoxGL.Camera
          ref={cameraRef}
          zoomLevel={16}
          pitch={60}
          followPitch={45}
          followZoomLevel={16}
          followUserLocation
          followUserMode={
            cameraFollowHeading
              ? UserTrackingMode.FollowWithHeading
              : UserTrackingMode.Follow
          }
        />

        <FillExtrusionLayer
          id='building3d'
          existing
          sourceLayerID='building'
          style={layerStyles.building}
          minZoomLevel={16}
          maxZoomLevel={16}
        />

        {routeCoordinates.length > 1 && (
          <ShapeSource id='routeSource' shape={routeGeoJSON}>
            <LineLayer
              id='routeLine'
              style={{
                lineColor: colorTheme === 'dark' ? 'white' : '#3C84F7',
                lineWidth: 3,
              }}
            />
          </ShapeSource>
        )}
        <Images images={images} />
        <LocationPuck visible={true} topImage='topImage' scale={1.0} />
      </MapView>
      <View style={styles.centerOnUserContainer}>
        <Icons.Button
          name={
            isViewportIdle
              ? cameraFollowHeading
                ? 'navigation'
                : 'gps-fixed'
              : 'gps-not-fixed'
          }
          backgroundColor='white'
          color='black'
          iconStyle={{marginRight: 0}}
          borderRadius={100}
          size={28}
          onPress={onCenter}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  centerOnUserContainer: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    borderRadius: 100,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 5,
  },
})

export default MapDisplay
