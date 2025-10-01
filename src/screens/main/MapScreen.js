"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"
import { useAuth } from "../../contexts/AuthContext"
import { getDefaultRegion } from "../../config/maps"

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const MapScreen = () => {
  const { user } = useAuth()
  const mapRef = useRef(null)
  const [donations, setDonations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [error, setError] = useState(null)
  const [mapRegion, setMapRegion] = useState(getDefaultRegion())
  const [debugInfo, setDebugInfo] = useState("")
  const [showMarkers, setShowMarkers] = useState(false)

  useEffect(() => {
    requestLocationPermission()
    loadDonations()
  }, [])

  // Efecto para mostrar marcadores después de que todo esté listo
  useEffect(() => {
    if (mapReady && Array.isArray(donations) && donations.length > 0) {
      console.log("🎯 [MAP_SCREEN] Activando marcadores después de delay...")
      // Delay más largo para asegurar estabilidad
      setTimeout(() => {
        setShowMarkers(true)
      }, 2000)
    } else {
      setShowMarkers(false)
    }
  }, [mapReady, donations])

  const requestLocationPermission = async () => {
    try {
      console.log("🔄 [MAP_SCREEN] Solicitando permisos de ubicación...")
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log("📍 [MAP_SCREEN] Estado de permisos:", status)

      if (status === "granted") {
        setLocationPermission(true)
        getCurrentLocation()
      }
    } catch (error) {
      console.error("❌ [MAP_SCREEN] Error requesting location permission:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      console.log("🔄 [MAP_SCREEN] Obteniendo ubicación actual...")

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      })

      console.log("📍 [MAP_SCREEN] Ubicación obtenida:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setUserLocation(newLocation)

      const newRegion = {
        ...newLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }

      setMapRegion(newRegion)

      if (mapRef.current && mapReady) {
        setTimeout(() => {
          mapRef.current.animateToRegion(newRegion, 1000)
        }, 500)
      }
    } catch (error) {
      console.error("❌ [MAP_SCREEN] Error getting current location:", error)
      const pereiraLocation = getDefaultRegion()
      setUserLocation({
        latitude: pereiraLocation.latitude,
        longitude: pereiraLocation.longitude,
      })
      setMapRegion(pereiraLocation)
    }
  }

  const loadDonations = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo("Cargando...")
      setShowMarkers(false)

      console.log("🔄 [MAP_SCREEN] Iniciando carga de donaciones...")

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const donationsData = await donationService.getDonations({ status: "available" })

      console.log("📊 [MAP_SCREEN] Datos recibidos del servicio:", {
        type: typeof donationsData,
        isArray: Array.isArray(donationsData),
        length: donationsData?.length,
      })

      setDebugInfo(`Recibidas: ${donationsData?.length || 0} donaciones`)

      if (Array.isArray(donationsData)) {
        console.log("✅ [MAP_SCREEN] Estableciendo donaciones en estado")
        setDonations(donationsData)
        setDebugInfo(`Válidas: ${donationsData.length} donaciones`)
      } else {
        console.warn("⚠️ [MAP_SCREEN] Datos no son array, estableciendo array vacío")
        setDonations([])
        setDebugInfo("Error: datos no válidos")
      }
    } catch (error) {
      console.error("❌ [MAP_SCREEN] Error completo en loadDonations:", error)
      setError(error.message)
      setDonations([])
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const onMapReady = () => {
    console.log("🗺️ [MAP_SCREEN] Mapa listo")
    setMapReady(true)
  }

  // Función ultra-minimalista para crear marcadores
  const renderMarkers = () => {
    try {
      if (!showMarkers) {
        console.log("⏳ [MAP_SCREEN] Marcadores deshabilitados")
        return null
      }

      if (!Array.isArray(donations) || donations.length === 0) {
        console.log("ℹ️ [MAP_SCREEN] No hay donaciones para mostrar marcadores")
        return null
      }

      console.log(`🎯 [MAP_SCREEN] Renderizando ${donations.length} marcadores minimalistas`)

      const markers = []

      for (let i = 0; i < donations.length; i++) {
        const donation = donations[i]

        // Validación mínima
        if (!donation || !donation.id) {
          console.warn(`⚠️ [MAP_SCREEN] Saltando donación ${i}: inválida`)
          continue
        }

        const lat = donation.pickup_latitude || donation.latitude
        const lng = donation.pickup_longitude || donation.longitude

        if (!lat || !lng) {
          console.warn(`⚠️ [MAP_SCREEN] Saltando donación ${donation.id}: sin coordenadas`)
          continue
        }

        const latitude = Number.parseFloat(lat)
        const longitude = Number.parseFloat(lng)

        if (isNaN(latitude) || isNaN(longitude)) {
          console.warn(`⚠️ [MAP_SCREEN] Saltando donación ${donation.id}: coordenadas NaN`)
          continue
        }

        // Props ultra-minimalistas para el marcador
        const markerProps = {
          key: `marker-${donation.id}`,
          coordinate: {
            latitude: latitude,
            longitude: longitude,
          },
        }

        console.log(`✅ [MAP_SCREEN] Creando marcador minimalista ${i} para donación ${donation.id}`)

        try {
          markers.push(<Marker {...markerProps} />)
        } catch (markerError) {
          console.error(`❌ [MAP_SCREEN] Error creando marcador ${i}:`, markerError)
        }
      }

      console.log(`🎯 [MAP_SCREEN] ${markers.length} marcadores minimalistas creados`)
      return markers
    } catch (error) {
      console.error("❌ [MAP_SCREEN] Error en renderMarkers:", error)
      return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Donaciones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDonations}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          {locationPermission && (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Ionicons name="locate" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.toggleButton} onPress={() => setShowMarkers(!showMarkers)}>
            <Ionicons
              name={showMarkers ? "eye" : "eye-off"}
              size={20}
              color={showMarkers ? colors.success : colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={null}
          initialRegion={mapRegion}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          onMapReady={onMapReady}
          onRegionChangeComplete={setMapRegion}
          mapType="standard"
          // Props minimalistas
          moveOnMarkerPress={false}
          showsBuildings={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          showsTraffic={false}
        >
          {renderMarkers()}
        </MapView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando donaciones...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorTitle}>Error al cargar donaciones</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Reintentar" onPress={loadDonations} variant="outline" style={styles.retryButton} />
          </View>
        )}

        {!loading && !error && Array.isArray(donations) && donations.length === 0 && mapReady && (
          <View style={styles.emptyOverlay}>
            <Ionicons name="map-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No hay donaciones disponibles</Text>
            <Button title="Recargar" onPress={loadDonations} variant="outline" style={styles.reloadButton} />
          </View>
        )}
      </View>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          {debugInfo} | Mapa: {mapReady ? "✅" : "⏳"} | Marcadores: {showMarkers ? "✅" : "❌"} | Usuario:{" "}
          {user?.email || "N/A"}
        </Text>
      </View>

      {/* Lista de donaciones como fallback */}
      {Array.isArray(donations) && donations.length > 0 && (
        <View style={styles.donationsList}>
          <Text style={styles.donationsTitle}>Donaciones ({donations.length})</Text>
          {donations.slice(0, 3).map((donation, index) => (
            <View key={donation.id} style={styles.donationItem}>
              <Text style={styles.donationItemTitle}>{donation.title}</Text>
              <Text style={styles.donationItemDetails}>
                {donation.category} - {donation.quantity} unidades
              </Text>
              <Text style={styles.donationItemCoords}>
                📍 {donation.pickup_latitude?.toFixed(4)}, {donation.pickup_longitude?.toFixed(4)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  locationButton: {
    padding: spacing.sm,
  },
  toggleButton: {
    padding: spacing.sm,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.white,
  },
  errorOverlay: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  emptyOverlay: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  reloadButton: {
    marginTop: spacing.lg,
  },
  debugInfo: {
    position: "absolute",
    bottom: 120,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.black + "80",
    borderRadius: 8,
    padding: spacing.sm,
  },
  debugText: {
    fontSize: typography.xs,
    color: colors.white,
    textAlign: "center",
  },
  donationsList: {
    position: "absolute",
    bottom: 10,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white + "95",
    borderRadius: 8,
    padding: spacing.sm,
    maxHeight: 100,
  },
  donationsTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  donationItem: {
    marginBottom: spacing.xs,
  },
  donationItemTitle: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  donationItemDetails: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  donationItemCoords: {
    fontSize: 9,
    color: colors.primary,
  },
})

export default MapScreen
