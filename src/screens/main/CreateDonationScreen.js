"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import Card from "../../components/common/Card"
import donationService from "../../services/donationService"

const CATEGORIES = [
  { id: "bakery", label: "Panadería", icon: "🥖" },
  { id: "dairy", label: "Lácteos", icon: "🥛" },
  { id: "fruits", label: "Frutas y Verduras", icon: "🍎" },
  { id: "meat", label: "Carnes", icon: "🥩" },
  { id: "canned", label: "Enlatados", icon: "🥫" },
  { id: "prepared", label: "Comida Preparada", icon: "🍱" },
  { id: "other", label: "Otros", icon: "📦" },
]

const CreateDonationScreen = ({ navigation }) => {
  const mapWebViewRef = useRef(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    expiryDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // FUNCIÓN MEJORADA PARA VALIDAR Y FORMATEAR FECHA
  const validateAndFormatDate = (dateString) => {
    if (!dateString.trim()) return ""

    // Remover espacios y caracteres especiales excepto números y guiones
    let cleanDate = dateString.replace(/[^\d-]/g, "")

    // Si solo tiene números, intentar formatear automáticamente
    if (!/[-]/.test(cleanDate) && cleanDate.length >= 6) {
      if (cleanDate.length === 8) {
        // DDMMYYYY -> YYYY-MM-DD
        const day = cleanDate.substring(0, 2)
        const month = cleanDate.substring(2, 4)
        const year = cleanDate.substring(4, 8)
        cleanDate = `${year}-${month}-${day}`
      } else if (cleanDate.length === 6) {
        // DDMMYY -> 20YY-MM-DD
        const day = cleanDate.substring(0, 2)
        const month = cleanDate.substring(2, 4)
        const year = "20" + cleanDate.substring(4, 6)
        cleanDate = `${year}-${month}-${day}`
      }
    }

    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(cleanDate)) {
      return dateString // Devolver original si no se puede formatear
    }

    // Validar que sea una fecha válida
    const date = new Date(cleanDate + "T00:00:00")
    if (isNaN(date.getTime())) {
      return dateString // Devolver original si la fecha es inválida
    }

    // Validar que no sea una fecha pasada
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      return dateString // Devolver original si es fecha pasada
    }

    return cleanDate
  }

  const handleDateChange = (value) => {
    const formattedDate = validateAndFormatDate(value)
    updateFormData("expiryDate", formattedDate)
  }

  const handleMapMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)
      console.log("📨 [CREATE_DONATION] Mensaje del mapa:", message)

      switch (message.type) {
        case "MAP_READY":
          console.log("🗺️ [CREATE_DONATION] Mapa listo")
          setMapReady(true)
          // Obtener ubicación actual del usuario
          getCurrentLocationForMap()
          break

        case "LOCATION_SELECTED":
          console.log("📍 [CREATE_DONATION] Ubicación seleccionada:", message.data)
          setSelectedLocation(message.data)
          break

        case "CONSOLE_LOG":
          console.log("🌐 [MAP_CONSOLE]", message.data)
          break

        default:
          console.log("📨 [CREATE_DONATION] Mensaje no reconocido:", message.type)
      }
    } catch (error) {
      console.error("❌ [CREATE_DONATION] Error procesando mensaje del mapa:", error)
    }
  }

  const getCurrentLocationForMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }

        console.log("📍 [CREATE_DONATION] Ubicación del usuario obtenida:", userLocation)

        // Enviar ubicación al mapa
        if (mapWebViewRef.current) {
          mapWebViewRef.current.postMessage(
            JSON.stringify({
              type: "SET_USER_LOCATION",
              data: userLocation,
            }),
          )
        }
      }
    } catch (error) {
      console.error("❌ [CREATE_DONATION] Error obteniendo ubicación:", error)
      // Usar ubicación por defecto (Pereira)
      const defaultLocation = {
        latitude: 4.8133,
        longitude: -75.6961,
      }

      console.log("🔧 [CREATE_DONATION] Usando ubicación por defecto:", defaultLocation)

      if (mapWebViewRef.current) {
        mapWebViewRef.current.postMessage(
          JSON.stringify({
            type: "SET_USER_LOCATION",
            data: defaultLocation,
          }),
        )
      }
    }
  }

  const handleLocationConfirm = () => {
    if (selectedLocation) {
      console.log("✅ [CREATE_DONATION] Ubicación confirmada:", selectedLocation)
      setShowMap(false)
      setFormData((prev) => ({ ...prev, pickupAddress: selectedLocation.address }))
    }
  }

  const handleSubmit = async () => {
    const { title, description, category, quantity, expiryDate } = formData

    if (!title || !description || !category || !quantity) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    if (isNaN(quantity) || Number.parseInt(quantity) <= 0) {
      Alert.alert("Error", "La cantidad debe ser un número válido mayor a 0")
      return
    }

    if (!selectedLocation) {
      Alert.alert("Error", "Por favor selecciona una ubicación en el mapa")
      return
    }

    // VALIDACIÓN MEJORADA DE FECHA
    if (expiryDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(expiryDate)) {
        Alert.alert("Error", "La fecha debe tener el formato YYYY-MM-DD (ej: 2024-12-25)")
        return
      }

      const date = new Date(expiryDate + "T00:00:00")
      if (isNaN(date.getTime())) {
        Alert.alert("Error", "La fecha de caducidad no es válida")
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) {
        Alert.alert("Error", "La fecha de caducidad no puede ser anterior a hoy")
        return
      }
    }

    try {
      setLoading(true)

      // Preparar datos de la donación con coordenadas
      const donationData = {
        title,
        description,
        category,
        quantity: Number.parseInt(quantity),
        // Coordenadas principales
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        // Coordenadas específicas de pickup (para compatibilidad)
        pickup_latitude: selectedLocation.latitude,
        pickup_longitude: selectedLocation.longitude,
        pickup_address: selectedLocation.address,
      }

      // Añadir fecha de caducidad si existe (formato correcto)
      if (expiryDate) {
        donationData.expiry_date = expiryDate
      }

      console.log("📤 [CREATE_DONATION] Enviando datos de donación:", donationData)

      const result = await donationService.createDonation(donationData)

      console.log("✅ [CREATE_DONATION] Donación creada exitosamente:", result)

      Alert.alert("Éxito", "Donación creada exitosamente", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("❌ [CREATE_DONATION] Error creando donación:", error)
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  // HTML del mapa para seleccionar ubicación
  const locationMapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seleccionar Ubicación</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .location-marker {
                background: #2E7D32;
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .location-marker::after {
                content: '📍';
                transform: rotate(45deg);
                font-size: 16px;
            }
            .user-marker {
                background: #2196F3;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            function logToRN(message) {
                console.log(message);
                try {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'CONSOLE_LOG',
                            data: message
                        }));
                    }
                } catch (e) {
                    console.error('Error enviando log:', e);
                }
            }
            
            logToRN('🚀 Iniciando mapa de selección de ubicación...');
            
            // Inicializar mapa
            const map = L.map('map').setView([4.8133, -75.6961], 13);
            
            // Añadir tiles de CartoDB
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);
            
            let userMarker = null;
            let selectedMarker = null;
            let selectedLocation = null;
            
            // Función para crear marcador de usuario
            function setUserLocation(location) {
                logToRN(\`📍 Estableciendo ubicación de usuario: \${JSON.stringify(location)}\`);
                
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                userMarker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        html: '<div class="user-marker"></div>',
                        className: 'custom-user-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);
                
                userMarker.bindPopup('Tu ubicación actual');
                map.setView([location.latitude, location.longitude], 15);
                logToRN('✅ Ubicación de usuario establecida');
            }
            
            // Función para obtener dirección aproximada
            async function getAddressFromCoords(lat, lng) {
                try {
                    // Usar Nominatim para geocodificación inversa
                    const response = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&zoom=18&addressdetails=1\`);
                    const data = await response.json();
                    
                    if (data && data.display_name) {
                        return data.display_name;
                    } else {
                        return \`Lat: \${lat.toFixed(6)}, Lng: \${lng.toFixed(6)}\`;
                    }
                } catch (error) {
                    logToRN(\`⚠️ Error obteniendo dirección: \${error.message}\`);
                    return \`Lat: \${lat.toFixed(6)}, Lng: \${lng.toFixed(6)}\`;
                }
            }
            
            // Manejar click en el mapa
            map.on('click', async function(e) {
                const lat = parseFloat(e.latlng.lat.toFixed(6));
                const lng = parseFloat(e.latlng.lng.toFixed(6));
                
                logToRN(\`🎯 Click en mapa: \${lat}, \${lng}\`);
                
                // Remover marcador anterior
                if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                }
                
                // Añadir nuevo marcador
                selectedMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: '<div class="location-marker"></div>',
                        className: 'custom-location-marker',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(map);
                
                // Obtener dirección
                const address = await getAddressFromCoords(lat, lng);
                
                selectedMarker.bindPopup(\`
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong>Ubicación seleccionada</strong><br>
                        <small>Lat: \${lat}, Lng: \${lng}</small><br>
                        <small>\${address}</small>
                    </div>
                \`).openPopup();
                
                selectedLocation = {
                    latitude: lat,
                    longitude: lng,
                    address: address
                };
                
                logToRN(\`✅ Ubicación seleccionada: \${JSON.stringify(selectedLocation)}\`);
                
                // Enviar ubicación seleccionada a React Native
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'LOCATION_SELECTED',
                        data: selectedLocation
                    }));
                    logToRN('✅ Ubicación enviada a React Native');
                } catch (error) {
                    logToRN(\`❌ Error enviando ubicación: \${error.message}\`);
                }
            });
            
            // Escuchar mensajes de React Native
            document.addEventListener('message', handleMessage);
            window.addEventListener('message', handleMessage);
            
            function handleMessage(event) {
                try {
                    const message = JSON.parse(event.data);
                    logToRN(\`📨 Mensaje recibido: \${message.type}\`);
                    
                    switch (message.type) {
                        case 'SET_USER_LOCATION':
                            setUserLocation(message.data);
                            break;
                        default:
                            logToRN(\`⚠️ Tipo de mensaje no reconocido: \${message.type}\`);
                    }
                } catch (error) {
                    logToRN(\`❌ Error procesando mensaje: \${error.message}\`);
                }
            }
            
            // Notificar que el mapa está listo
            map.whenReady(function() {
                logToRN('✅ Mapa de selección listo');
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_READY',
                        data: true
                    }));
                } catch (e) {
                    logToRN(\`❌ Error enviando MAP_READY: \${e.message}\`);
                }
            });
            
            logToRN('🎉 Script de mapa de selección cargado');
        </script>
    </body>
    </html>
  `

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Nueva Donación</Text>
            <Text style={styles.subtitle}>Completa la información de tu donación</Text>

            <Input
              label="Título de la donación"
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              placeholder="Ej: Pan fresco del día"
              required
            />

            <Input
              label="Descripción"
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="Describe los alimentos que donas"
              multiline
              numberOfLines={3}
              required
            />

            <View style={styles.categorySection}>
              <Text style={styles.categoryLabel}>Categoría *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <Card
                    key={category.id}
                    style={[styles.categoryCard, formData.category === category.id && styles.categoryCardSelected]}
                    onPress={() => updateFormData("category", category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[styles.categoryText, formData.category === category.id && styles.categoryTextSelected]}
                    >
                      {category.label}
                    </Text>
                  </Card>
                ))}
              </View>
            </View>

            <Input
              label="Cantidad"
              value={formData.quantity}
              onChangeText={(value) => updateFormData("quantity", value)}
              placeholder="Número de unidades o porciones"
              keyboardType="numeric"
              required
            />

            <View style={styles.dateSection}>
              <Input
                label="Fecha de caducidad (opcional)"
                value={formData.expiryDate}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD (ej: 2024-12-25)"
                keyboardType="numeric"
              />
              <Text style={styles.dateHint}>
                💡 Formato: YYYY-MM-DD. También puedes escribir DDMMYYYY y se convertirá automáticamente
              </Text>
            </View>

            <View style={styles.locationSection}>
              <Text style={styles.locationLabel}>Ubicación de recogida *</Text>
              {selectedLocation ? (
                <View style={styles.selectedLocationContainer}>
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View style={styles.locationText}>
                      <Text style={styles.locationCoords}>
                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.locationAddress} numberOfLines={2}>
                        {selectedLocation.address}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.changeLocationButton} onPress={() => setShowMap(true)}>
                    <Text style={styles.changeLocationText}>Cambiar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectLocationButton} onPress={() => setShowMap(true)}>
                  <Ionicons name="map" size={20} color={colors.primary} />
                  <Text style={styles.selectLocationText}>Seleccionar en mapa</Text>
                </TouchableOpacity>
              )}
            </View>

            <Button title="Crear Donación" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal del mapa */}
      {showMap && (
        <Modal visible={showMap} animationType="slide" presentationStyle="fullScreen">
          <SafeAreaView style={styles.mapModal}>
            <View style={styles.mapHeader}>
              <TouchableOpacity style={styles.mapCloseButton} onPress={() => setShowMap(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.mapTitle}>Seleccionar Ubicación</Text>
              <TouchableOpacity
                style={[styles.mapConfirmButton, !selectedLocation && styles.mapConfirmButtonDisabled]}
                onPress={handleLocationConfirm}
                disabled={!selectedLocation}
              >
                <Text style={[styles.mapConfirmText, !selectedLocation && styles.mapConfirmTextDisabled]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>

            <WebView
              ref={mapWebViewRef}
              source={{ html: locationMapHTML }}
              style={styles.mapWebView}
              onMessage={handleMapMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />

            <View style={styles.mapInstructions}>
              <Text style={styles.instructionsText}>Toca en el mapa para seleccionar la ubicación de recogida</Text>
              {selectedLocation && (
                <Text style={styles.selectedLocationText}>
                  📍 Ubicación: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing["2xl"],
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  categoryCard: {
    width: "30%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  categoryTextSelected: {
    color: colors.primary,
    fontWeight: typography.medium,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateHint: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  locationSection: {
    marginBottom: spacing.lg,
  },
  locationLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  selectLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.primaryLight + "10",
    gap: spacing.md,
  },
  selectLocationText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  locationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationCoords: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  locationAddress: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  changeLocationButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  changeLocationText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.medium,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  // Estilos del modal del mapa
  mapModal: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  mapCloseButton: {
    padding: spacing.sm,
  },
  mapTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  mapConfirmButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  mapConfirmButtonDisabled: {
    backgroundColor: colors.border,
  },
  mapConfirmText: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.medium,
  },
  mapConfirmTextDisabled: {
    color: colors.textLight,
  },
  mapWebView: {
    flex: 1,
  },
  mapInstructions: {
    padding: spacing.lg,
    backgroundColor: colors.primaryLight + "10",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  instructionsText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedLocationText: {
    fontSize: typography.sm,
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.sm,
    fontFamily: "monospace",
  },
})

export default CreateDonationScreen
