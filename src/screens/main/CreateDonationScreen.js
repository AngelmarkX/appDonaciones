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
  // Alimentos
  { id: "bakery", label: "Panadería", icon: "🥖", type: "food" },
  { id: "dairy", label: "Lácteos", icon: "🥛", type: "food" },
  { id: "fruits", label: "Frutas y Verduras", icon: "🍎", type: "food" },
  { id: "meat", label: "Carnes", icon: "🥩", type: "food" },
  { id: "canned", label: "Enlatados", icon: "🥫", type: "food" },
  { id: "prepared", label: "Comida Preparada", icon: "🍱", type: "food" },
  { id: "sugar", label: "Azúcares", icon: "🍬", type: "food" },
  { id: "fats", label: "Grasas", icon: "🧈", type: "food" },
  { id: "cereals", label: "Cereales", icon: "🌾", type: "food" },
  { id: "beverages", label: "Bebidas", icon: "🥤", type: "food" },
  // Objetos generales
  { id: "furniture", label: "Muebles", icon: "🪑", type: "general" },
  { id: "electronics", label: "Electrónicos", icon: "📱", type: "general" },
  { id: "clothing", label: "Ropa", icon: "👕", type: "general" },
  { id: "books", label: "Libros", icon: "📚", type: "general" },
  { id: "toys", label: "Juguetes", icon: "🧸", type: "general" },
  { id: "appliances", label: "Electrodomésticos", icon: "🔌", type: "general" },
  { id: "tools", label: "Herramientas", icon: "🔧", type: "general" },
  { id: "sports", label: "Deportes", icon: "⚽", type: "general" },
  { id: "office", label: "Oficina", icon: "📎", type: "general" },
  { id: "other", label: "Otros", icon: "📦", type: "general" },
]

const CreateDonationScreen = ({ navigation }) => {
  const mapWebViewRef = useRef(null)

  const [donationItems, setDonationItems] = useState([
    {
      id: Date.now(),
      title: "",
      description: "",
      category: "",
      quantity: "",
      weight: "",
      expiryDate: "",
      donationReason: "",
      contactInfo: "",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState(0)

  const updateItemData = (index, field, value) => {
    setDonationItems((prev) => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], [field]: value }
      return newItems
    })
  }

  const addDonationItem = () => {
    const newItem = {
      id: Date.now(),
      title: "",
      description: "",
      category: "",
      quantity: "",
      weight: "",
      expiryDate: "",
      donationReason: "",
      contactInfo: "",
    }
    setDonationItems((prev) => [...prev, newItem])
    setEditingItemIndex(donationItems.length)
  }

  const removeDonationItem = (index) => {
    if (donationItems.length === 1) {
      Alert.alert("Error", "Debe haber al menos una donación")
      return
    }

    Alert.alert("Eliminar donación", "¿Estás seguro de que quieres eliminar esta donación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setDonationItems((prev) => prev.filter((_, i) => i !== index))
          if (editingItemIndex >= donationItems.length - 1) {
            setEditingItemIndex(Math.max(0, donationItems.length - 2))
          }
        },
      },
    ])
  }

  const validateAndFormatDate = (dateString) => {
    if (!dateString.trim()) return ""

    let cleanDate = dateString.replace(/[^\d-]/g, "")

    if (!/[-]/.test(cleanDate) && cleanDate.length >= 6) {
      if (cleanDate.length === 8) {
        const day = cleanDate.substring(0, 2)
        const month = cleanDate.substring(2, 4)
        const year = cleanDate.substring(4, 8)
        cleanDate = `${year}-${month}-${day}`
      } else if (cleanDate.length === 6) {
        const day = cleanDate.substring(0, 2)
        const month = cleanDate.substring(2, 4)
        const year = "20" + cleanDate.substring(4, 6)
        cleanDate = `${year}-${month}-${day}`
      }
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(cleanDate)) {
      return dateString
    }

    const date = new Date(cleanDate + "T00:00:00")
    if (isNaN(date.getTime())) {
      return dateString
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      return dateString
    }

    return cleanDate
  }

  const handleDateChange = (index, value) => {
    // Remove all non-numeric characters except hyphens
    const cleanValue = value.replace(/[^\d-]/g, "")

    // Remove any existing hyphens to rebuild the format
    let numbersOnly = cleanValue.replace(/-/g, "")

    // Limit to 8 digits maximum (YYYYMMDD)
    numbersOnly = numbersOnly.substring(0, 8)

    // Build the formatted string with automatic hyphens
    let formatted = ""

    if (numbersOnly.length > 0) {
      // Add year (first 4 digits)
      formatted = numbersOnly.substring(0, 4)

      if (numbersOnly.length > 4) {
        // Add hyphen and month (next 2 digits)
        formatted += "-" + numbersOnly.substring(4, 6)

        if (numbersOnly.length > 6) {
          // Add hyphen and day (last 2 digits)
          formatted += "-" + numbersOnly.substring(6, 8)
        }
      }
    }

    updateItemData(index, "expiryDate", formatted)
  }

  const handleMapMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)
      console.log("📨 [CREATE_DONATION] Mensaje del mapa:", message)

      switch (message.type) {
        case "MAP_READY":
          console.log("🗺️ [CREATE_DONATION] Mapa listo")
          setMapReady(true)
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
    }
  }

  const isFoodCategory = (categoryId) => {
    const category = CATEGORIES.find((c) => c.id === categoryId)
    return category?.type === "food"
  }

  const validateItem = (item, index) => {
    if (!item.title || !item.description || !item.category || !item.quantity) {
      return `Donación ${index + 1}: Completa título, descripción, categoría y cantidad`
    }

    if (isNaN(item.quantity) || Number.parseInt(item.quantity) <= 0) {
      return `Donación ${index + 1}: La cantidad debe ser un número válido mayor a 0`
    }

    if (item.weight && (isNaN(item.weight) || Number.parseFloat(item.weight) <= 0)) {
      return `Donación ${index + 1}: El peso debe ser un número válido mayor a 0`
    }

    if (item.expiryDate && isFoodCategory(item.category)) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(item.expiryDate)) {
        return `Donación ${index + 1}: La fecha debe tener el formato YYYY-MM-DD`
      }

      const date = new Date(item.expiryDate + "T00:00:00")
      if (isNaN(date.getTime())) {
        return `Donación ${index + 1}: La fecha de caducidad no es válida`
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) {
        return `Donación ${index + 1}: La fecha de caducidad no puede ser anterior a hoy`
      }
    }

    return null
  }

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Por favor selecciona una ubicación en el mapa")
      return
    }

    for (let i = 0; i < donationItems.length; i++) {
      const error = validateItem(donationItems[i], i)
      if (error) {
        Alert.alert("Error", error)
        setEditingItemIndex(i)
        return
      }
    }

    try {
      setLoading(true)

      const donations = donationItems.map((item) => ({
        title: item.title,
        description: item.description,
        category: item.category,
        quantity: Number.parseInt(item.quantity),
        weight: item.weight ? Number.parseFloat(item.weight) : null,
        donation_reason: item.donationReason || null,
        contact_info: item.contactInfo || null,
        expiry_date: item.expiryDate || null,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        pickup_latitude: selectedLocation.latitude,
        pickup_longitude: selectedLocation.longitude,
        pickup_address: selectedLocation.address,
      }))

      console.log("📤 [CREATE_DONATION] Enviando donaciones:", donations)

      const result = await donationService.createBatchDonations(donations)

      console.log("✅ [CREATE_DONATION] Donaciones creadas exitosamente:", result)

      Alert.alert(
        "Éxito",
        `${donations.length} donación${donations.length > 1 ? "es" : ""} creada${donations.length > 1 ? "s" : ""} exitosamente`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      )
    } catch (error) {
      console.error("❌ [CREATE_DONATION] Error creando donaciones:", error)
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const useCurrentLocation = async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para usar esta función")
        setLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const lat = Number.parseFloat(location.coords.latitude.toFixed(6))
      const lng = Number.parseFloat(location.coords.longitude.toFixed(6))

      let address = `Lat: ${lat}, Lng: ${lng}`

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "FoodDonationApp/1.0",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          if (data?.display_name) {
            address = data.display_name
          }
        } else {
          console.log("⚠️ [CREATE_DONATION] API de geocodificación no disponible, usando coordenadas")
        }
      } catch (geocodeError) {
        console.log("⚠️ [CREATE_DONATION] Error en geocodificación, usando coordenadas:", geocodeError.message)
      }

      const currentLocation = {
        latitude: lat,
        longitude: lng,
        address: address,
      }

      console.log("📍 [CREATE_DONATION] Ubicación actual seleccionada:", currentLocation)
      setSelectedLocation(currentLocation)
      setShowMap(false)
      setLoading(false)

      Alert.alert("Ubicación seleccionada", "Se ha seleccionado tu ubicación actual")
    } catch (error) {
      console.error("❌ [CREATE_DONATION] Error obteniendo ubicación actual:", error)
      Alert.alert("Error", "No se pudo obtener tu ubicación actual. Intenta seleccionarla en el mapa.")
      setLoading(false)
    }
  }

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
            
            const map = L.map('map').setView([4.8133, -75.6961], 13);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);
            
            let userMarker = null;
            let selectedMarker = null;
            let selectedLocation = null;
            
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
            
            async function getAddressFromCoords(lat, lng) {
                try {
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
            
            map.on('click', async function(e) {
                const lat = parseFloat(e.latlng.lat.toFixed(6));
                const lng = parseFloat(e.latlng.lng.toFixed(6));
                
                logToRN(\`🎯 Click en mapa: \${lat}, \${lng}\`);
                
                if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                }
                
                selectedMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: '<div class="location-marker"></div>',
                        className: 'custom-location-marker',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    })
                }).addTo(map);
                
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

  const currentItem = donationItems[editingItemIndex]

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Nueva Publicación</Text>
            <Text style={styles.subtitle}>Crea una o varias donaciones para la misma ubicación</Text>

            <View style={styles.locationSection}>
              <Text style={styles.locationLabel}>📍 Ubicación de recogida *</Text>
              <Text style={styles.locationHint}>Todas las donaciones compartirán esta ubicación</Text>
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

            <View style={styles.itemsTabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsTabs}>
                {donationItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemTab, editingItemIndex === index && styles.itemTabActive]}
                    onPress={() => setEditingItemIndex(index)}
                  >
                    <Text style={[styles.itemTabText, editingItemIndex === index && styles.itemTabTextActive]}>
                      {item.title || `Donación ${index + 1}`}
                    </Text>
                    {donationItems.length > 1 && (
                      <TouchableOpacity style={styles.itemTabDelete} onPress={() => removeDonationItem(index)}>
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={editingItemIndex === index ? colors.primary : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addItemTab} onPress={addDonationItem}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                  <Text style={styles.addItemText}>Agregar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.itemForm}>
              <Text style={styles.itemFormTitle}>
                Donación {editingItemIndex + 1} de {donationItems.length}
              </Text>

              <Input
                label="Título de la donación"
                value={currentItem.title}
                onChangeText={(value) => updateItemData(editingItemIndex, "title", value)}
                placeholder="Ej: Pan fresco del día"
                required
              />

              <Input
                label="Descripción"
                value={currentItem.description}
                onChangeText={(value) => updateItemData(editingItemIndex, "description", value)}
                placeholder="Describe los alimentos que donas"
                multiline
                numberOfLines={3}
                required
              />

              <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Categoría *</Text>
                <Text style={styles.categorySectionTitle}>🍽️ Alimentos</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.filter((c) => c.type === "food").map((category) => (
                    <Card
                      key={category.id}
                      style={[styles.categoryCard, currentItem.category === category.id && styles.categoryCardSelected]}
                      onPress={() => updateItemData(editingItemIndex, "category", category.id)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          currentItem.category === category.id && styles.categoryTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </Card>
                  ))}
                </View>

                <Text style={[styles.categorySectionTitle, styles.categorySectionTitleSpacing]}>📦 Objetos</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.filter((c) => c.type === "general").map((category) => (
                    <Card
                      key={category.id}
                      style={[styles.categoryCard, currentItem.category === category.id && styles.categoryCardSelected]}
                      onPress={() => updateItemData(editingItemIndex, "category", category.id)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          currentItem.category === category.id && styles.categoryTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </Card>
                  ))}
                </View>
              </View>

              <Input
                label="Cantidad"
                value={currentItem.quantity}
                onChangeText={(value) => updateItemData(editingItemIndex, "quantity", value)}
                placeholder="Número de unidades o porciones"
                keyboardType="numeric"
                required
              />

              <Input
                label="Peso (kg - opcional)"
                value={currentItem.weight}
                onChangeText={(value) => updateItemData(editingItemIndex, "weight", value)}
                placeholder="Ej: 2.5"
                keyboardType="decimal-pad"
              />

              <Input
                label="Motivo de la donación (opcional)"
                value={currentItem.donationReason}
                onChangeText={(value) => updateItemData(editingItemIndex, "donationReason", value)}
                placeholder="Ej: Excedente de producción, cerca de caducar..."
                multiline
                numberOfLines={2}
              />

              <Input
                label="Contacto (opcional)"
                value={currentItem.contactInfo}
                onChangeText={(value) => updateItemData(editingItemIndex, "contactInfo", value)}
                placeholder="Teléfono o email de contacto"
                keyboardType="default"
              />

              {currentItem.category && isFoodCategory(currentItem.category) && (
                <View style={styles.dateSection}>
                  <Input
                    label="Fecha de caducidad (opcional)"
                    value={currentItem.expiryDate}
                    onChangeText={(value) => handleDateChange(editingItemIndex, value)}
                    placeholder="YYYY-MM-DD (ej: 2024-12-25)"
                    keyboardType="numeric"
                  />
                  <Text style={styles.dateHint}>
                    💡 Formato: YYYY-MM-DD. También puedes escribir DDMMYYYY y se convertirá automáticamente
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Resumen de donaciones</Text>
              {donationItems.map((item, index) => (
                <View key={item.id} style={styles.summaryItem}>
                  <View style={styles.summaryItemHeader}>
                    <Text style={styles.summaryItemNumber}>{index + 1}</Text>
                    <Text style={styles.summaryItemTitle}>{item.title || "Sin título"}</Text>
                    {item.category && (
                      <Text style={styles.summaryItemCategory}>
                        {CATEGORIES.find((c) => c.id === item.category)?.icon}
                      </Text>
                    )}
                  </View>
                  {item.quantity && (
                    <Text style={styles.summaryItemDetail}>
                      Cantidad: {item.quantity} {item.weight ? `(${item.weight} kg)` : ""}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <Button
              title={`Publicar ${donationItems.length} donación${donationItems.length > 1 ? "es" : ""}`}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

            <View style={styles.mapActionsContainer}>
              <TouchableOpacity style={styles.currentLocationButton} onPress={useCurrentLocation} disabled={loading}>
                <Ionicons name="locate" size={20} color={colors.white} />
                <Text style={styles.currentLocationText}>
                  {loading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
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
  locationSection: {
    marginBottom: spacing["2xl"],
    padding: spacing.lg,
    backgroundColor: colors.primaryLight + "10",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary + "30",
  },
  locationLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationHint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: "italic",
  },
  selectLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.white,
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
  itemsTabsContainer: {
    marginBottom: spacing.xl,
  },
  itemsTabs: {
    flexDirection: "row",
  },
  itemTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
  },
  itemTabText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    maxWidth: 120,
  },
  itemTabTextActive: {
    color: colors.primary,
  },
  itemTabDelete: {
    marginLeft: spacing.xs,
  },
  addItemTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight + "10",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    gap: spacing.sm,
  },
  addItemText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  itemForm: {
    marginBottom: spacing.xl,
  },
  itemFormTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
  summarySection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  summaryItemNumber: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.white,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
  },
  summaryItemTitle: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  summaryItemCategory: {
    fontSize: 20,
  },
  summaryItemDetail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
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
  categorySectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  categorySectionTitleSpacing: {
    marginTop: spacing.xl,
  },
  mapActionsContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    gap: spacing.sm,
  },
  currentLocationText: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.medium,
  },
})

export default CreateDonationScreen
