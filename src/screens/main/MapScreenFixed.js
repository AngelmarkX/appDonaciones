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

const MapScreenFixed = () => {
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
  const [safeMarkers, setSafeMarkers] = useState([])
  const [showMarkersToggle, setShowMarkersToggle] = useState(false)
  const [markerError, setMarkerError] = useState(null)

  useEffect(() => {
    requestLocationPermission()
    loadDonations()
  }, [])

  const requestLocationPermission = async () => {
    try {
      console.log("🔄 [MAP_FIXED] Solicitando permisos de ubicación...")
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log("📍 [MAP_FIXED] Estado de permisos:", status)

      if (status === "granted") {
        setLocationPermission(true)
        getCurrentLocation()
      }
    } catch (error) {
      console.error("❌ [MAP_FIXED] Error requesting location permission:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      console.log("🔄 [MAP_FIXED] Obteniendo ubicación actual...")

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      })

      console.log("📍 [MAP_FIXED] Ubicación obtenida:", {
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
      console.error("❌ [MAP_FIXED] Error getting current location:", error)
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

      console.log("🔄 [MAP_FIXED] Iniciando carga de donaciones...")

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const donationsData = await donationService.getDonations({ status: "available" })

      console.log("📊 [MAP_FIXED] Datos recibidos del servicio:", {
        type: typeof donationsData,
        isArray: Array.isArray(donationsData),
        length: donationsData?.length,
      })

      setDebugInfo(`Recibidas: ${donationsData?.length || 0} donaciones`)

      if (Array.isArray(donationsData)) {
        console.log("✅ [MAP_FIXED] Estableciendo donaciones en estado")
        setDonations(donationsData)

        // Procesar marcadores de forma ultra-segura
        processMarkersUltraSafe(donationsData)
      } else {
        console.warn("⚠️ [MAP_FIXED] Datos no son array, estableciendo array vacío")
        setDonations([])
        setSafeMarkers([])
        setDebugInfo("Error: datos no válidos")
      }
    } catch (error) {
      console.error("❌ [MAP_FIXED] Error completo en loadDonations:", error)
      setError(error.message)
      setDonations([])
      setSafeMarkers([])
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const processMarkersUltraSafe = (donationsData) => {
    try {
      console.log("🛡️ [MAP_FIXED] Procesando marcadores con máxima seguridad...")
      setMarkerError(null)

      if (!donationsData || !Array.isArray(donationsData) || donationsData.length === 0) {
        console.log("ℹ️ [MAP_FIXED] No hay donaciones para procesar")
        setSafeMarkers([])
        return
      }

      const processedMarkers = []

      for (let i = 0; i < donationsData.length; i++) {
        try {
          const donation = donationsData[i]

          // Validación extrema de la donación
          if (!donation) {
            console.warn(`⚠️ [MAP_FIXED] Donación ${i} es null/undefined`)
            continue
          }

          if (typeof donation !== "object") {
            console.warn(`⚠️ [MAP_FIXED] Donación ${i} no es objeto`)
            continue
          }

          if (!donation.hasOwnProperty("id") || donation.id === null || donation.id === undefined) {
            console.warn(`⚠️ [MAP_FIXED] Donación ${i} sin ID válido`)
            continue
          }

          const donationId = donation.id

          // Extraer coordenadas con máxima precaución
          let rawLat = null
          let rawLng = null

          // Intentar múltiples propiedades para latitud
          if (
            donation.hasOwnProperty("pickup_latitude") &&
            donation.pickup_latitude !== null &&
            donation.pickup_latitude !== undefined
          ) {
            rawLat = donation.pickup_latitude
          } else if (
            donation.hasOwnProperty("latitude") &&
            donation.latitude !== null &&
            donation.latitude !== undefined
          ) {
            rawLat = donation.latitude
          }

          // Intentar múltiples propiedades para longitud
          if (
            donation.hasOwnProperty("pickup_longitude") &&
            donation.pickup_longitude !== null &&
            donation.pickup_longitude !== undefined
          ) {
            rawLng = donation.pickup_longitude
          } else if (
            donation.hasOwnProperty("longitude") &&
            donation.longitude !== null &&
            donation.longitude !== undefined
          ) {
            rawLng = donation.longitude
          }

          console.log(`🔍 [MAP_FIXED] Donación ${donationId} - Coordenadas raw:`, { rawLat, rawLng })

          // Convertir a números con validación extrema
          let latitude = null
          let longitude = null

          if (rawLat !== null && rawLat !== undefined && rawLat !== "") {
            try {
              const latNum = Number(rawLat)
              if (Number.isFinite(latNum) && !Number.isNaN(latNum)) {
                latitude = latNum
              }
            } catch (latError) {
              console.warn(`⚠️ [MAP_FIXED] Error convirtiendo latitud de donación ${donationId}:`, latError)
            }
          }

          if (rawLng !== null && rawLng !== undefined && rawLng !== "") {
            try {
              const lngNum = Number(rawLng)
              if (Number.isFinite(lngNum) && !Number.isNaN(lngNum)) {
                longitude = lngNum
              }
            } catch (lngError) {
              console.warn(`⚠️ [MAP_FIXED] Error convirtiendo longitud de donación ${donationId}:`, lngError)
            }
          }

          // Si no hay coordenadas válidas, usar coordenadas por defecto
          if (latitude === null || longitude === null || latitude === 0 || longitude === 0) {
            console.log(`🔧 [MAP_FIXED] Donación ${donationId} - Usando coordenadas por defecto`)
            latitude = 4.8133 + (Math.random() - 0.5) * 0.001
            longitude = -75.6961 + (Math.random() - 0.5) * 0.001
          } else {
            // APLICAR MÚLTIPLES FIXES PARA COORDENADAS REALES
            console.log(`🔧 [MAP_FIXED] Donación ${donationId} - Aplicando fixes a coordenadas reales`)

            // Fix 1: Redondear a 4 decimales para evitar problemas de precisión
            latitude = Math.round(latitude * 10000) / 10000
            longitude = Math.round(longitude * 10000) / 10000

            // Fix 2: Verificar rango válido
            if (latitude < -90 || latitude > 90) {
              console.warn(`⚠️ [MAP_FIXED] Donación ${donationId} - Latitud fuera de rango, usando por defecto`)
              latitude = 4.8133
            }

            if (longitude < -180 || longitude > 180) {
              console.warn(`⚠️ [MAP_FIXED] Donación ${donationId} - Longitud fuera de rango, usando por defecto`)
              longitude = -75.6961
            }

            // Fix 3: Asegurar que no sean exactamente 0
            if (latitude === 0) latitude = 0.0001
            if (longitude === 0) longitude = 0.0001

            // Fix 4: Añadir variación mínima para evitar coordenadas idénticas
            latitude += (Math.random() - 0.5) * 0.0001
            longitude += (Math.random() - 0.5) * 0.0001
          }

          console.log(`✅ [MAP_FIXED] Donación ${donationId} - Coordenadas procesadas:`, { latitude, longitude })

          // Crear objeto coordinate completamente nuevo y limpio
          const coordinateObject = {}
          coordinateObject.latitude = latitude
          coordinateObject.longitude = longitude

          // Validación final del objeto coordinate
          if (!Number.isFinite(coordinateObject.latitude) || !Number.isFinite(coordinateObject.longitude)) {
            console.error(`❌ [MAP_FIXED] Donación ${donationId} - Coordinate object inválido`)
            continue
          }

          // Crear título y descripción seguros
          let safeTitle = "Donación"
          if (donation.hasOwnProperty("title") && donation.title && typeof donation.title === "string") {
            safeTitle = donation.title.toString().trim()
          }

          let safeDescription = "Sin descripción"
          if (donation.hasOwnProperty("category") && donation.category && typeof donation.category === "string") {
            safeDescription = donation.category.toString().trim()
          }

          // Crear marcador con datos ultra-seguros
          const safeMarker = {
            id: `marker-${donationId}`,
            key: `marker-${donationId}-${Date.now()}`, // Key único
            coordinate: coordinateObject,
            title: safeTitle,
            description: safeDescription,
            donationId: donationId,
          }

          // Validación final del marcador
          if (
            safeMarker.coordinate &&
            typeof safeMarker.coordinate === "object" &&
            Number.isFinite(safeMarker.coordinate.latitude) &&
            Number.isFinite(safeMarker.coordinate.longitude) &&
            safeMarker.title &&
            safeMarker.description
          ) {
            processedMarkers.push(safeMarker)
            console.log(`✅ [MAP_FIXED] Marcador ultra-seguro creado para donación ${donationId}`)
          } else {
            console.error(`❌ [MAP_FIXED] Marcador ${donationId} falló validación final`)
          }
        } catch (donationError) {
          console.error(`❌ [MAP_FIXED] Error procesando donación ${i}:`, donationError)
          setMarkerError(`Error procesando donación ${i}: ${donationError.message}`)
        }
      }

      console.log(`🎯 [MAP_FIXED] Total marcadores ultra-seguros procesados: ${processedMarkers.length}`)
      setSafeMarkers(processedMarkers)
      setDebugInfo(`Marcadores seguros: ${processedMarkers.length}`)
    } catch (globalError) {
      console.error("❌ [MAP_FIXED] Error global en processMarkersUltraSafe:", globalError)
      setSafeMarkers([])
      setMarkerError(`Error global: ${globalError.message}`)
      setDebugInfo("Error procesando marcadores")
    }
  }

  const onMapReady = () => {
    console.log("🗺️ [MAP_FIXED] Mapa listo")
    setMapReady(true)
  }

  const toggleMarkers = () => {
    setShowMarkersToggle(!showMarkersToggle)
    setMarkerError(null)
    console.log(`🔄 [MAP_FIXED] Toggle marcadores: ${!showMarkersToggle}`)
  }

  const renderMarkersUltraSafe = () => {
    try {
      if (!showMarkersToggle) {
        console.log("🔄 [MAP_FIXED] Marcadores desactivados por toggle")
        return null
      }

      if (!Array.isArray(safeMarkers) || safeMarkers.length === 0) {
        console.log("ℹ️ [MAP_FIXED] No hay marcadores seguros para renderizar")
        return null
      }

      console.log(`🎯 [MAP_FIXED] Renderizando ${safeMarkers.length} marcadores ultra-seguros`)

      const renderedMarkers = []

      for (let i = 0; i < safeMarkers.length; i++) {
        try {
          const markerData = safeMarkers[i]

          // Validación extrema antes de renderizar
          if (!markerData || typeof markerData !== "object") {
            console.warn(`⚠️ [MAP_FIXED] Marcador ${i} inválido`)
            continue
          }

          if (!markerData.coordinate || typeof markerData.coordinate !== "object") {
            console.warn(`⚠️ [MAP_FIXED] Marcador ${i} sin coordinate válido`)
            continue
          }

          if (!Number.isFinite(markerData.coordinate.latitude) || !Number.isFinite(markerData.coordinate.longitude)) {
            console.warn(`⚠️ [MAP_FIXED] Marcador ${i} con coordenadas no finitas`)
            continue
          }

          // Crear un nuevo objeto coordinate para cada render
          const renderCoordinate = {
            latitude: markerData.coordinate.latitude,
            longitude: markerData.coordinate.longitude,
          }

          console.log(`🔧 [MAP_FIXED] Renderizando marcador ${markerData.id} con coordinate:`, renderCoordinate)

          const markerComponent = (
            <Marker
              key={markerData.key}
              coordinate={renderCoordinate}
              title={markerData.title}
              description={markerData.description}
              pinColor={colors.primary}
              onError={(error) => {
                console.error(`❌ [MAP_FIXED] Error en marcador ${markerData.id}:`, error)
                setMarkerError(`Error en marcador ${markerData.id}: ${error.message}`)
              }}
            />
          )

          renderedMarkers.push(markerComponent)
          console.log(`✅ [MAP_FIXED] Marcador ${markerData.id} renderizado exitosamente`)
        } catch (markerRenderError) {
          console.error(`❌ [MAP_FIXED] Error renderizando marcador ${i}:`, markerRenderError)
          setMarkerError(`Error renderizando marcador ${i}: ${markerRenderError.message}`)
        }
      }

      console.log(`🎯 [MAP_FIXED] Total marcadores renderizados: ${renderedMarkers.length}`)
      return renderedMarkers
    } catch (globalRenderError) {
      console.error("❌ [MAP_FIXED] Error global en renderMarkersUltraSafe:", globalRenderError)
      setMarkerError(`Error global renderizando: ${globalRenderError.message}`)
      return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa Ultra-Seguro</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDonations}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showMarkersToggle && styles.toggleButtonActive]}
            onPress={toggleMarkers}
          >
            <Ionicons name="location" size={20} color={showMarkersToggle ? colors.white : colors.primary} />
          </TouchableOpacity>
          {locationPermission && (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Ionicons name="locate" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {markerError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={styles.errorBannerText}>{markerError}</Text>
        </View>
      )}

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
          onError={(error) => {
            console.error("❌ [MAP_FIXED] Error en MapView:", error)
            setError(`Error en mapa: ${error.message}`)
          }}
        >
          {renderMarkersUltraSafe()}
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
      </View>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          {debugInfo} | Mapa: {mapReady ? "✅" : "⏳"} | Marcadores: {showMarkersToggle ? "ON" : "OFF"} | Seguros:{" "}
          {safeMarkers.length}
        </Text>
      </View>

      {/* Lista de marcadores seguros para debugging */}
      {safeMarkers.length > 0 && (
        <View style={styles.markersList}>
          <Text style={styles.markersTitle}>Marcadores Ultra-Seguros ({safeMarkers.length})</Text>
          {safeMarkers.slice(0, 2).map((marker, index) => (
            <View key={marker.id} style={styles.markerItem}>
              <Text style={styles.markerItemTitle}>
                {index + 1}. {marker.title} (ID: {marker.donationId})
              </Text>
              <Text style={styles.markerItemDetails}>
                Lat: {marker.coordinate.latitude} - Lng: {marker.coordinate.longitude}
              </Text>
              <Text style={styles.markerItemValidation}>🛡️ Ultra-seguro y validado</Text>
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.error + "40",
  },
  errorBannerText: {
    fontSize: typography.sm,
    color: colors.error,
    marginLeft: spacing.sm,
    flex: 1,
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
  debugInfo: {
    position: "absolute",
    bottom: 140,
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
  markersList: {
    position: "absolute",
    bottom: 10,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white + "95",
    borderRadius: 8,
    padding: spacing.sm,
    maxHeight: 120,
  },
  markersTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  markerItem: {
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  markerItemTitle: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  markerItemDetails: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  markerItemValidation: {
    fontSize: 9,
    color: colors.success,
  },
})

export default MapScreenFixed
