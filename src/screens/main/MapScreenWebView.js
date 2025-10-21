"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"
import { useAuth } from "../../contexts/AuthContext"
import { getDefaultRegion } from "../../config/maps"

const { width, height } = Dimensions.get("window")

const MapScreenWebView = ({ route, navigation }) => {
  const { user } = useAuth()
  const webViewRef = useRef(null)
  const [donations, setDonations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [networkInfo, setNetworkInfo] = useState(null) // State to store network info
  const highlightDonation = route?.params?.highlightDonation

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      bakery: "Panadería",
      dairy: "Lácteos",
      fruits: "Frutas y Verduras",
      meat: "Carnes",
      canned: "Enlatados",
      prepared: "Comida Preparada",
      sugar: "Azúcares",
      fats: "Grasas",
      cereals: "Cereales",
      beverages: "Bebidas",
      other: "Otros",
      furniture: "Muebles",
      electronics: "Electrónicos",
      clothing: "Ropa",
      books: "Libros",
      toys: "Juguetes",
      appliances: "Electrodomésticos",
      tools: "Herramientas",
      sports: "Deportes",
      office: "Oficina",
    }
    return categoryLabels[category] || category
  }

  useEffect(() => {
    requestLocationPermission()
    loadDonations()
  }, [])

  useEffect(() => {
    if (mapReady && webViewRef.current) {
      console.log("🔄 [MAP_WEBVIEW] Enviando datos al mapa listo...")

      setTimeout(() => {
        // Enviar tipo de usuario al WebView
        if (user) {
          sendMessageToWebView("SET_USER_TYPE", { userType: user.userType })
        }

        if (userLocation) {
          console.log("📍 [MAP_WEBVIEW] Enviando ubicación de usuario:", userLocation)
          sendMessageToWebView("SET_USER_LOCATION", userLocation)
        }

        if (donations.length > 0) {
          console.log("🎯 [MAP_WEBVIEW] Enviando donaciones:", donations.length)
          sendMessageToWebView("SET_DONATIONS", donations)
        }

        if (highlightDonation) {
          console.log("🎯 [MAP_WEBVIEW] Resaltando donación específica:", highlightDonation)
          sendMessageToWebView("HIGHLIGHT_DONATION", highlightDonation)
        }

        sendMessageToWebView("ADD_TEST_MARKER", {
          latitude: 4.8133,
          longitude: -75.6961,
          title: "🧪 Marcador de Prueba",
          description: "Centro de Pereira - Marcador de prueba",
        })

        sendMessageToWebView("GET_NETWORK_INFO", {})
      }, 500)
    }
  }, [mapReady, userLocation, donations, highlightDonation, user])

  useEffect(() => {
    if (mapReady && donations.length > 0) {
      sendMessageToWebView("UPDATE_DONATIONS", donations)
    }
  }, [mapReady, donations])

  const sendMessageToWebView = (type, data) => {
    if (webViewRef.current) {
      const message = { type, data }
      console.log("📤 [MAP_WEBVIEW] Enviando mensaje:", message)
      webViewRef.current.postMessage(JSON.stringify(message))
    }
  }

  const requestLocationPermission = async () => {
    try {
      console.log("🔄 [MAP_WEBVIEW] Solicitando permisos de ubicación...")
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log("📍 [MAP_WEBVIEW] Estado de permisos:", status)

      if (status === "granted") {
        setLocationPermission(true)
        getCurrentLocation()
      }
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error requesting location permission:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      console.log("🔄 [MAP_WEBVIEW] Obteniendo ubicación actual...")

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      })

      console.log("📍 [MAP_WEBVIEW] Ubicación obtenida:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setUserLocation(newLocation)
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error getting current location:", error)
      const pereiraLocation = getDefaultRegion()
      const fallbackLocation = {
        latitude: pereiraLocation.latitude,
        longitude: pereiraLocation.longitude,
      }
      console.log("🔧 [MAP_WEBVIEW] Usando ubicación por defecto:", fallbackLocation)
      setUserLocation(fallbackLocation)
    }
  }

  const loadDonations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 [MAP_WEBVIEW] Iniciando carga de donaciones...")

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const donationsData = await donationService.getDonations({ status: "available" })

      console.log("📊 [MAP_WEBVIEW] Datos recibidos del servicio:", {
        type: typeof donationsData,
        isArray: Array.isArray(donationsData),
        length: donationsData?.length,
        firstItem: donationsData?.[0],
      })

      if (Array.isArray(donationsData) && donationsData.length > 0) {
        const processedDonations = donationsData.map((donation, index) => {
          console.log(`🔍 [MAP_WEBVIEW] Procesando donación ${index}:`, {
            id: donation.id,
            title: donation.title,
            pickup_latitude: donation.pickup_latitude,
            pickup_longitude: donation.pickup_longitude,
            latitude: donation.latitude,
            longitude: donation.longitude,
          })

          let latitude = Number.parseFloat(donation.pickup_latitude || donation.latitude)
          let longitude = Number.parseFloat(donation.pickup_longitude || donation.longitude)

          console.log(`🔍 [MAP_WEBVIEW] Coordenadas parseadas donación ${donation.id}:`, { latitude, longitude })

          if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
            latitude = 4.8133 + (Math.random() - 0.5) * 0.1
            longitude = -75.6961 + (Math.random() - 0.5) * 0.1
            console.log(`🔧 [MAP_WEBVIEW] Coordenadas generadas para donación ${donation.id}:`, { latitude, longitude })
          }

          const processed = {
            id: donation.id,
            title: donation.title || "Donación",
            description: donation.description || "Sin descripción",
            category: donation.category || "other",
            quantity: donation.quantity || 1,
            weight: donation.weight || null,
            donation_reason: donation.donation_reason || null,
            contact_info: donation.contact_info || null,
            latitude: latitude,
            longitude: longitude,
            donor_name: donation.donor_name || "Donante anónimo",
            expiry_date: donation.expiry_date,
            pickup_address: donation.pickup_address || "Dirección no especificada",
            donor_phone: donation.donor_phone || null,
          }

          console.log(`✅ [MAP_WEBVIEW] Donación procesada ${donation.id}:`, processed)
          return processed
        })

        console.log("🎯 [MAP_WEBVIEW] Total donaciones procesadas:", processedDonations.length)
        setDonations(processedDonations)
      } else {
        console.warn("⚠️ [MAP_WEBVIEW] No hay donaciones o datos inválidos")
        setDonations([])
      }
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error en loadDonations:", error)
      setError(error.message)
      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)
      console.log("📨 [MAP_WEBVIEW] Mensaje del WebView:", message)

      switch (message.type) {
        case "MAP_READY":
          console.log("🗺️ [MAP_WEBVIEW] Mapa web listo")
          setMapReady(true)
          break

        case "MARKER_CLICKED":
          console.log("📍 [MAP_WEBVIEW] Marcador clickeado:", message.data)
          handleMarkerClick(message.data)
          break

        case "RESERVE_DONATION":
          console.log("🎁 [MAP_WEBVIEW] Solicitud de reserva desde mapa:", message.data)
          handleReserveDonation(message.data)
          break

        case "MAP_ERROR":
          console.error("❌ [MAP_WEBVIEW] Error en mapa web:", message.data)
          setError(`Error en mapa: ${message.data}`)
          break

        case "CONSOLE_LOG":
          console.log("🌐 [WEBVIEW_CONSOLE]", message.data)
          break

        case "DONATIONS_SET":
          console.log("✅ [MAP_WEBVIEW] Donaciones establecidas en WebView:", message.data)
          break

        case "USER_LOCATION_SET":
          console.log("✅ [MAP_WEBVIEW] Ubicación establecida en WebView:", message.data)
          break

        case "TEST_MARKER_ADDED":
          console.log("🧪 [MAP_WEBVIEW] Marcador de prueba añadido:", message.data)
          break

        case "NETWORK_INFO":
          console.log("🌐 [MAP_WEBVIEW] Información de red recibida:", message.data)
          setNetworkInfo(message.data) // Store network info
          break

        case "DONATION_HIGHLIGHTED":
          console.log("🎯 [MAP_WEBVIEW] Donación resaltada:", message.data)
          break

        case "LOCATION_GROUP_CLICKED":
          console.log("📍 [MAP_WEBVIEW] Grupo de ubicación clickeado:", message.data)
          handleLocationGroupClick(message.data)
          break

        case "POPUP_CLOSED":
          setSelectedDonation(null)
          break

        case "UPDATE_DONATIONS":
          // This case is handled in the useEffect hook
          break

        default:
          console.log("📨 [MAP_WEBVIEW] Mensaje no reconocido:", message.type)
      }
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error procesando mensaje:", error)
    }
  }

  const handleLocationGroupClick = (locationData) => {
    console.log("📦 [MAP_WEBVIEW] Mostrando grupo de donaciones:", locationData)

    const donationsList = locationData.donations
      .map((d, index) => {
        const categoryLabel = getCategoryLabel(d.category)
        return `${index + 1}. ${d.title} (${categoryLabel})`
      })
      .join("\n")

    const message = `📍 ${locationData.address}\n\n${locationData.count} donaciones disponibles:\n\n${donationsList}`

    const buttons = [{ text: "Cerrar", style: "cancel" }]

    if (user?.userType === "organization") {
      buttons.unshift({
        text: "Ver Todas",
        onPress: () => {
          navigation.navigate("Donations", {
            filterByLocation: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            },
          })
        },
      })
    }

    Alert.alert(`📦 ${locationData.count} Donaciones`, message, buttons)
  }

  const handleReserveDonation = (donationData) => {
    console.log("🎁 [MAP_WEBVIEW] Navegando a pantalla de donaciones para reservar:", donationData.id)

    // Navegar a la pantalla de donaciones con la donación resaltada
    navigation.navigate("Donations", {
      highlightDonationId: donationData.id,
      autoReserve: true, // Opcionalmente podemos reservar automáticamente
    })
  }

  const handleMarkerClick = (donationData) => {
    console.log("🎯 [MAP_WEBVIEW] Donación seleccionada:", donationData)

    const formatSimpleDate = (dateString) => {
      if (!dateString) return "No especificada"
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "No especificada"
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      } catch (e) {
        return "No especificada"
      }
    }

    const categoryLabel = getCategoryLabel(donationData.category)
    const formattedDate = formatSimpleDate(donationData.expiry_date)

    let message = `📦 Categoría: ${categoryLabel}\n`
    message += `📏 Cantidad: ${donationData.quantity || "No especificada"}\n`

    if (donationData.weight) {
      message += `⚖️ Peso: ${donationData.weight} kg\n`
    }

    if (donationData.donation_reason) {
      message += `📝 Razón: ${donationData.donation_reason}\n`
    }

    message += `👤 Donante: ${donationData.donor_name || "Anónimo"}\n`
    message += `📅 Caduca: ${formattedDate}\n`
    message += `📍 Dirección: ${donationData.pickup_address || "No especificada"}\n`

    if (donationData.contact_info) {
      message += `📞 Contacto: ${donationData.contact_info}\n`
    } else if (donationData.donor_phone) {
      message += `📞 Teléfono: ${donationData.donor_phone}\n`
    }

    if (donationData.description) {
      message += `\n📝 Descripción:\n${donationData.description}`
    }

    const buttons = [{ text: "Cerrar", style: "cancel" }]

    // Si es organización, añadir botón de reservar
    if (user?.userType === "organization") {
      buttons.unshift({
        text: "🎁 Ir a Reservar",
        onPress: () => handleReserveDonation(donationData),
      })
    }

    // Botón de llamar si hay contacto
    if (donationData.donor_phone || donationData.contact_info) {
      buttons.unshift({
        text: "📞 Llamar",
        onPress: () => {
          const phoneNumber = donationData.contact_info || donationData.donor_phone
          Alert.alert("Llamar al donante", `¿Deseas llamar a ${phoneNumber}?`, [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Llamar",
              onPress: () => {
                Alert.alert("📞", `Llamando a ${phoneNumber}...`)
              },
            },
          ])
        },
      })
    }

    Alert.alert(`🎁 ${donationData.title}`, message, buttons)
  }

  const centerOnUser = () => {
    if (mapReady && webViewRef.current && userLocation) {
      sendMessageToWebView("CENTER_ON_USER", userLocation)
    }
  }

  const refreshMap = () => {
    loadDonations()
  }

  // Function to display network info in an Alert
  const showNetworkInfo = () => {
    if (networkInfo) {
      let infoMessage = "Información de Red:\n\n"
      infoMessage += `User Agent: ${networkInfo.userAgent || "N/A"}\n`
      infoMessage += `Referer: ${networkInfo.referer || "N/A"}\n`
      infoMessage += `IP Address: ${networkInfo.ip || "N/A"}\n`
      infoMessage += `Timestamp: ${new Date(networkInfo.timestamp).toLocaleString()}`
      Alert.alert("Detalles de Red", infoMessage)
    } else {
      Alert.Alert("Información de Red", "Aún no se ha recibido información de red.")
    }
  }

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mapa de Donaciones</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            
            /* Reduced font sizes and spacing for more compact full details modal */
            .full-details-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 16px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .full-details-modal {
                background: white;
                border-radius: 16px;
                max-width: 420px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .full-details-header {
                background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
                padding: 16px;
                color: white;
                border-radius: 16px 16px 0 0;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .full-details-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .full-details-close:hover {
                background: rgba(255,255,255,0.3);
                transform: rotate(90deg);
            }
            
            .full-details-title {
                font-size: 17px;
                font-weight: 700;
                margin: 0 0 8px 0;
                padding-right: 36px;
                line-height: 1.3;
            }
            
            .full-details-category-badge {
                background: rgba(255,255,255,0.25);
                backdrop-filter: blur(10px);
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .full-details-body {
                padding: 16px;
            }
            
            .full-details-section {
                margin-bottom: 20px;
            }
            
            .full-details-section-title {
                font-size: 13px;
                font-weight: 700;
                color: #2E7D32;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                padding-bottom: 6px;
                border-bottom: 2px solid #e8f5e9;
            }
            
            .full-details-info-row {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 10px;
                margin-bottom: 8px;
                border-left: 3px solid #4CAF50;
            }
            
            .full-details-info-icon {
                font-size: 18px;
                min-width: 24px;
                text-align: center;
            }
            
            .full-details-info-content {
                flex: 1;
            }
            
            .full-details-info-label {
                font-size: 10px;
                font-weight: 600;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                margin-bottom: 3px;
            }
            
            .full-details-info-value {
                font-size: 13px;
                color: #212529;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .full-details-stats-row {
                display: flex;
                gap: 10px;
                margin-bottom: 18px;
            }
            
            .full-details-stat-card {
                flex: 1;
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border: 2px solid #2196f3;
                border-radius: 12px;
                padding: 14px;
                text-align: center;
            }
            
            .full-details-stat-value {
                font-size: 22px;
                font-weight: 700;
                color: #1565c0;
                display: block;
                margin-bottom: 4px;
            }
            
            .full-details-stat-label {
                font-size: 10px;
                color: #1976d2;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                font-weight: 600;
            }
            
            .full-details-description-box {
                background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
                border: 2px solid #ffc107;
                border-radius: 12px;
                padding: 14px;
            }
            
            .full-details-description-text {
                font-size: 12px;
                color: #856404;
                line-height: 1.6;
                margin: 0;
            }
            
            .full-details-warning {
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border: 2px solid #ff9800;
                border-radius: 12px;
                padding: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .full-details-warning-icon {
                font-size: 26px;
            }
            
            .full-details-warning-text {
                flex: 1;
                font-size: 12px;
                color: #e65100;
                font-weight: 600;
                line-height: 1.4;
            }
            
            .full-details-buttons {
                display: flex;
                gap: 10px;
                padding: 16px;
                border-top: 2px solid #f0f0f0;
                position: sticky;
                bottom: 0;
                background: white;
                border-radius: 0 0 16px 16px;
            }
            
            .full-details-button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .full-details-button-primary {
                background: linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
            }
            
            .full-details-button-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(255, 111, 0, 0.4);
            }
            
            .full-details-button-secondary {
                background: #f8f9fa;
                color: #495057;
                border: 2px solid #dee2e6;
            }
            
            .full-details-button-secondary:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            /* </CHANGE> */
            
            /* Compact popup styling with reduced sizes */
            .custom-popup {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 280px;
                min-width: 240px;
            }
            
            .leaflet-popup-content-wrapper {
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                padding: 0;
                overflow: hidden;
            }
            
            .leaflet-popup-content {
                margin: 0;
                width: 100% !important;
            }
            
            .popup-header {
                background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
                padding: 10px 12px;
                color: white;
            }
            
            .popup-title {
                font-weight: 700;
                font-size: 15px;
                color: white;
                margin: 0 0 6px 0;
                line-height: 1.2;
            }
            
            .popup-category {
                background: rgba(255,255,255,0.25);
                backdrop-filter: blur(10px);
                color: white;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .popup-body {
                padding: 10px;
                background: white;
            }
            
            .popup-details {
                font-size: 12px;
                color: #333;
                line-height: 1.4;
            }
            
            .popup-detail-row {
                display: flex;
                align-items: flex-start;
                gap: 6px;
                margin-bottom: 6px;
                padding: 6px;
                background: #f8f9fa;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            
            .popup-detail-row:hover {
                background: #e9ecef;
                transform: translateX(2px);
            }
            
            .popup-detail-icon {
                font-size: 14px;
                min-width: 18px;
                text-align: center;
            }
            
            .popup-detail-content {
                flex: 1;
            }
            
            .popup-detail-label {
                font-weight: 600;
                color: #2E7D32;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-bottom: 1px;
                display: block;
            }
            
            .popup-detail-value {
                color: #495057;
                font-size: 12px;
            }
            
            .popup-description {
                background: #fff3cd;
                border-left: 3px solid #ffc107;
                padding: 8px;
                border-radius: 6px;
                margin-top: 8px;
                font-size: 11px;
                color: #856404;
                line-height: 1.4;
            }
            
            .popup-buttons-container {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e9ecef;
            }
            
            .popup-button {
                background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
                color: white;
                border: none;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            .popup-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(46, 125, 50, 0.35);
            }
            
            .popup-button:active {
                transform: translateY(0);
            }
            
            .popup-button-reserve {
                background: linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%);
                box-shadow: 0 2px 8px rgba(255, 111, 0, 0.25);
            }
            
            .popup-button-reserve:hover {
                box-shadow: 0 4px 12px rgba(255, 111, 0, 0.35);
            }
            
            .popup-button-icon {
                font-size: 14px;
            }
            
            .popup-stats {
                display: flex;
                gap: 6px;
                margin-top: 8px;
            }
            
            .popup-stat-badge {
                flex: 1;
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                padding: 6px;
                border-radius: 6px;
                text-align: center;
                border: 1px solid #90caf9;
            }
            
            .popup-stat-value {
                font-size: 14px;
                font-weight: 700;
                color: #1976d2;
                display: block;
            }
            
            .popup-stat-label {
                font-size: 9px;
                color: #1565c0;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-top: 2px;
                display: block;
            }
            
            .popup-expiry-warning {
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border: 1px solid #ffb74d;
                padding: 6px 10px;
                border-radius: 6px;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .popup-expiry-warning-icon {
                font-size: 16px;
            }
            
            .popup-expiry-warning-text {
                flex: 1;
                font-size: 11px;
                color: #e65100;
                font-weight: 600;
            }
            
            /* Compact multi-donation list styling */
            .popup-donation-list {
                max-height: 250px;
                overflow-y: auto;
            }
            
            .popup-donation-item {
                padding: 8px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .popup-donation-item:hover {
                background: #f5f5f5;
            }
            
            .popup-donation-item:last-child {
                border-bottom: none;
            }
            
            .donation-item-icon {
                font-size: 18px;
            }
            
            .donation-item-title {
                font-weight: bold;
                color: #2E7D32;
                font-size: 13px;
            }
            
            .donation-item-details {
                font-size: 11px;
                color: #666;
            }
            /* </CHANGE> */
            
            .highlighted-marker {
                animation: pulse 2s infinite;
                z-index: 1000 !important;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            .multi-donation-marker {
                position: relative;
            }
            .donation-count-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #FF5722;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            let currentUserType = null;
            
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
            
            async function getNetworkInfo() {
                const info = {
                    userAgent: navigator.userAgent,
                    referer: document.referrer,
                    ip: null,
                    timestamp: new Date().toISOString()
                };
                
                try {
                    const response = await fetch('https://api.ipify.org?format=json');
                    const data = await response.json();
                    info.ip = data.ip;
                } catch (e) {
                    logToRN('No se pudo obtener IP pública: ' + e.message);
                }
                
                logToRN('Información de red obtenida: ' + JSON.stringify(info, null, 2));
                
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'NETWORK_INFO',
                        data: info
                    }));
                } catch (e) {
                    logToRN('Error enviando info de red: ' + e.message);
                }
                
                return info;
            }
            
            logToRN('Iniciando mapa WebView...');
            
            const categoryLabels = {
              bakery: 'Panadería',
              dairy: 'Lácteos',
              fruits: 'Frutas y Verduras', 
              meat: 'Carnes',
              canned: 'Enlatados',
              prepared: 'Comida Preparada',
              sugar: 'Azúcares',
              fats: 'Grasas',
              cereals: 'Cereales',
              beverages: 'Bebidas',
              other: 'Otros',
              furniture: 'Muebles',
              electronics: 'Electrónicos',
              clothing: 'Ropa',
              books: 'Libros',
              toys: 'Juguetes',
              appliances: 'Electrodomésticos',
              tools: 'Herramientas',
              sports: 'Deportes',
              office: 'Oficina',
            };
            
            function getCategoryLabel(category) {
              return categoryLabels[category] || category;
            }

            function formatSimpleDate(dateString) {
              if (!dateString) return '';
              try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                });
              } catch (e) {
                return '';
              }
            }
            
            function isExpiringSoon(dateString) {
              if (!dateString) return false;
              try {
                const expiryDate = new Date(dateString);
                const today = new Date();
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 3;
              } catch (e) {
                return false;
              }
            }
            
            const map = L.map('map').setView([4.8133, -75.6961], 13);
            logToRN('Mapa inicializado');
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                headers: {
                    'User-Agent': 'FoodDonationApp/1.0 (React Native WebView)'
                }
            }).addTo(map);
            logToRN('CartoDB tiles añadidos');
            
            let userMarker = null;
            let donationMarkers = [];
            let testMarker = null;
            let userLocation = null;
            let donations = [];
            let highlightedMarker = null;
            
            const categoryIcons = {
                bakery: '🥖',
                dairy: '🥛', 
                fruits: '🍎',
                meat: '🥩',
                canned: '🥫',
                prepared: '🍱',
                sugar: '🍯',
                fats: '🧈',
                cereals: '🌾',
                beverages: '🥤',
                other: '📦',
                // Añadiendo iconos para categorías generales
                furniture: '🛋️',
                electronics: '💻',
                clothing: '👕',
                books: '📚',
                toys: '🧸',
                appliances: '💡',
                tools: '🔧',
                sports: '⚽',
                office: '🗄️',
            };
            
            const categoryColors = {
                bakery: '#f59e0b',
                dairy: '#3b82f6',
                fruits: '#10b981',
                meat: '#ef4444',
                canned: '#8b5cf6',
                prepared: '#ec4899',
                sugar: '#fbbf24',
                fats: '#f97316',
                cereals: '#a78bfa',
                beverages: '#06b6d4',
                other: '#6b7280',
                // Añadiendo colores para categorías generales
                furniture: '#a1604f',
                electronics: '#4a5568',
                clothing: '#9c6e5e',
                books: '#7c3a00',
                toys: '#d97706',
                appliances: '#1e40af',
                tools: '#4f46e5',
                sports: '#166534',
                office: '#6d28d9',
            };
            
            function createCustomIcon(category, emoji, isHighlighted, count) {
                emoji = emoji || null;
                isHighlighted = isHighlighted || false;
                count = count || null;
                
                const icon = emoji || categoryIcons[category] || '📦';
                const color = categoryColors[category] || '#6b7280';
                const size = isHighlighted ? 40 : 30;
                const borderColor = isHighlighted ? '#FF5722' : 'white';
                const borderWidth = isHighlighted ? 3 : 2;
                
                const countBadge = count && count > 1 ? '<div class="donation-count-badge">' + count + '</div>' : '';
                
                return L.divIcon({
                    html: '<div style="background: ' + color + '; width: ' + size + 'px; height: ' + size + 'px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ' + (isHighlighted ? 20 : 16) + 'px; border: ' + borderWidth + 'px solid ' + borderColor + '; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;" class="' + (isHighlighted ? 'highlighted-marker' : '') + '">' + icon + countBadge + '</div>',
                    className: 'custom-marker',
                    iconSize: [size, size],
                    iconAnchor: [size/2, size/2]
                });
            }
            
            function createMultiDonationPopup(locationGroup) {
              const donations = locationGroup.donations;
              const address = locationGroup.address;
              const latitude = locationGroup.latitude;
              const longitude = locationGroup.longitude;
              
              let donationsHTML = donations.map(function(donation, index) {
                const categoryLabel = getCategoryLabel(donation.category);
                const icon = categoryIcons[donation.category] || '📦';
                
                return '<div class="popup-donation-item" onclick="showFullDetails(' + donation.id + ')"><div style="display: flex; align-items: center; gap: 8px;"><span class="donation-item-icon">' + icon + '</span><div style="flex: 1;"><div class="donation-item-title">' + donation.title + '</div><div class="donation-item-details">' + categoryLabel + ' • ' + (donation.quantity || 'N/A') + '</div></div></div></div>';
              }).join('');
              // </CHANGE>
              
              let buttonsHTML = '';
              if (currentUserType === 'organization') {
                buttonsHTML = '<div class="popup-buttons-container"><button class="popup-button" onclick="viewAllAtLocation(' + latitude + ', ' + longitude + ')"><span class="popup-button-icon">📋</span> Ver Todas</button></div>';
              }
              
              return '<div class="custom-popup"><div class="popup-header"><div class="popup-title">📦 ' + donations.length + ' Donaciones</div><div class="popup-category">📍 ' + address + '</div></div><div class="popup-body"><div class="popup-donation-list">' + donationsHTML + '</div>' + buttonsHTML + '</div></div>';
            }
            
            function createPopupContent(donation) {
              const categoryLabel = getCategoryLabel(donation.category);
              const categoryIcon = categoryIcons[donation.category] || '📦';
              const formattedDate = formatSimpleDate(donation.expiry_date);
              const expiringSoon = isExpiringSoon(donation.expiry_date);
              
              let headerHTML = '<div class="popup-header">';
              headerHTML += '<div class="popup-title">' + donation.title + '</div>';
              headerHTML += '<div class="popup-category">' + categoryIcon + ' ' + categoryLabel + '</div>';
              headerHTML += '</div>';
              
              let bodyHTML = '<div class="popup-body">';
              
              // Stats badges for quantity and weight
              if (donation.quantity || donation.weight) {
                bodyHTML += '<div class="popup-stats">';
                if (donation.quantity) {
                  bodyHTML += '<div class="popup-stat-badge"><span class="popup-stat-value">' + donation.quantity + '</span><span class="popup-stat-label">Cantidad</span></div>';
                }
                if (donation.weight) {
                  bodyHTML += '<div class="popup-stat-badge"><span class="popup-stat-value">' + donation.weight + ' kg</span><span class="popup-stat-label">Peso</span></div>';
                }
                bodyHTML += '</div>';
              }
              
              bodyHTML += '<div class="popup-details">';
              
              if (donation.donor_name) {
                bodyHTML += '<div class="popup-detail-row"><div class="popup-detail-icon">👤</div><div class="popup-detail-content"><span class="popup-detail-label">Donante</span><div class="popup-detail-value">' + donation.donor_name + '</div></div></div>';
              }
              
              if (donation.pickup_address) {
                bodyHTML += '<div class="popup-detail-row"><div class="popup-detail-icon">📍</div><div class="popup-detail-content"><span class="popup-detail-label">Dirección</span><div class="popup-detail-value">' + donation.pickup_address + '</div></div></div>';
              }
              
              if (donation.contact_info || donation.donor_phone) {
                const contact = donation.contact_info || donation.donor_phone;
                bodyHTML += '<div class="popup-detail-row"><div class="popup-detail-icon">📞</div><div class="popup-detail-content"><span class="popup-detail-label">Contacto</span><div class="popup-detail-value">' + contact + '</div></div></div>';
              }
              
              if (donation.donation_reason) {
                bodyHTML += '<div class="popup-detail-row"><div class="popup-detail-icon">💭</div><div class="popup-detail-content"><span class="popup-detail-label">Razón</span><div class="popup-detail-value">' + donation.donation_reason + '</div></div></div>';
              }
              
              bodyHTML += '</div>';
              
              // Expiry warning if expiring soon
              if (formattedDate) {
                if (expiringSoon) {
                  bodyHTML += '<div class="popup-expiry-warning"><span class="popup-expiry-warning-icon">⚠️</span><span class="popup-expiry-warning-text">Caduca pronto: ' + formattedDate + '</span></div>';
                } else {
                  bodyHTML += '<div class="popup-detail-row"><div class="popup-detail-icon">📅</div><div class="popup-detail-content"><span class="popup-detail-label">Fecha de caducidad</span><div class="popup-detail-value">' + formattedDate + '</div></div></div>';
                }
              }
              
              if (donation.description) {
                bodyHTML += '<div class="popup-description"><strong>📝 Descripción:</strong><br>' + donation.description + '</div>';
              }
              
              let buttonsHTML = '';
              if (donation.id) {
                buttonsHTML = '<div class="popup-buttons-container">';
                buttonsHTML += '<button class="popup-button" onclick="showFullDetails(' + donation.id + ')">Ver Detalles Completos</button>';
                
                if (currentUserType === 'organization') {
                  buttonsHTML += '<button class="popup-button popup-button-reserve" onclick="reserveDonation(' + donation.id + ')"><span class="popup-button-icon">🎁</span> Reservar Donación</button>';
                }
                
                buttonsHTML += '</div>';
              }
              // </CHANGE>
              
              bodyHTML += buttonsHTML;
              bodyHTML += '</div>';
              
              return '<div class="custom-popup">' + headerHTML + bodyHTML + '</div>';
            }
            
            function showFullDetails(donationId) {
                logToRN('Mostrando detalles completos para donación: ' + donationId);
                let donation = donations.find(function(d) { return d.id === donationId; });
                
                if (!donation && highlightedMarker) {
                    const highlightedLatLng = highlightedMarker.getLatLng();
                    donation = {
                        id: donationId,
                        latitude: highlightedLatLng.lat,
                        longitude: highlightedLatLng.lng
                    };
                }
                
                if (!donation) {
                    logToRN('Donación no encontrada: ' + donationId);
                    return;
                }

                const categoryLabel = getCategoryLabel(donation.category);
                const categoryIcon = categoryIcons[donation.category] || '📦';
                const formattedDate = formatSimpleDate(donation.expiry_date);
                const expiringSoon = isExpiringSoon(donation.expiry_date);
                
                let modalHTML = '<div class="full-details-overlay" onclick="closeFullDetails(event)">';
                modalHTML += '<div class="full-details-modal" onclick="event.stopPropagation()">';
                
                // Header
                modalHTML += '<div class="full-details-header">';
                modalHTML += '<button class="full-details-close" onclick="closeFullDetails()">✕</button>';
                modalHTML += '<div class="full-details-title">' + donation.title + '</div>';
                modalHTML += '<div class="full-details-category-badge">' + categoryIcon + ' ' + categoryLabel + '</div>';
                modalHTML += '</div>';
                
                // Body
                modalHTML += '<div class="full-details-body">';
                
                // Stats cards
                if (donation.quantity || donation.weight) {
                    modalHTML += '<div class="full-details-stats-row">';
                    if (donation.quantity) {
                        modalHTML += '<div class="full-details-stat-card">';
                        modalHTML += '<span class="full-details-stat-value">' + donation.quantity + '</span>';
                        modalHTML += '<span class="full-details-stat-label">📦 Cantidad</span>';
                        modalHTML += '</div>';
                    }
                    if (donation.weight) {
                        modalHTML += '<div class="full-details-stat-card">';
                        modalHTML += '<span class="full-details-stat-value">' + donation.weight + ' kg</span>';
                        modalHTML += '<span class="full-details-stat-label">⚖️ Peso</span>';
                        modalHTML += '</div>';
                    }
                    modalHTML += '</div>';
                }
                
                // Expiry warning
                if (expiringSoon && formattedDate) {
                    modalHTML += '<div class="full-details-warning">';
                    modalHTML += '<span class="full-details-warning-icon">⚠️</span>';
                    modalHTML += '<span class="full-details-warning-text">¡Atención! Este producto caduca pronto: ' + formattedDate + '</span>';
                    modalHTML += '</div>';
                }
                
                // Donor information section
                if (donation.donor_name || donation.donor_phone || donation.contact_info) {
                    modalHTML += '<div class="full-details-section">';
                    modalHTML += '<div class="full-details-section-title">👤 Información del Donante</div>';
                    
                    if (donation.donor_name) {
                        modalHTML += '<div class="full-details-info-row">';
                        modalHTML += '<div class="full-details-info-icon">👤</div>';
                        modalHTML += '<div class="full-details-info-content">';
                        modalHTML += '<div class="full-details-info-label">Nombre</div>';
                        modalHTML += '<div class="full-details-info-value">' + donation.donor_name + '</div>';
                        modalHTML += '</div></div>';
                    }
                    
                    if (donation.donor_phone || donation.contact_info) {
                        const contact = donation.contact_info || donation.donor_phone;
                        modalHTML += '<div class="full-details-info-row">';
                        modalHTML += '<div class="full-details-info-icon">📞</div>';
                        modalHTML += '<div class="full-details-info-content">';
                        modalHTML += '<div class="full-details-info-label">Contacto</div>';
                        modalHTML += '<div class="full-details-info-value">' + contact + '</div>';
                        modalHTML += '</div></div>';
                    }
                    
                    modalHTML += '</div>';
                }
                
                // Product details section
                modalHTML += '<div class="full-details-section">';
                modalHTML += '<div class="full-details-section-title">📦 Detalles del Producto</div>';
                
                if (formattedDate && !expiringSoon) {
                    modalHTML += '<div class="full-details-info-row">';
                    modalHTML += '<div class="full-details-info-icon">📅</div>';
                    modalHTML += '<div class="full-details-info-content">';
                    modalHTML += '<div class="full-details-info-label">Fecha de Caducidad</div>';
                    modalHTML += '<div class="full-details-info-value">' + formattedDate + '</div>';
                    modalHTML += '</div></div>';
                }
                
                if (donation.donation_reason) {
                    modalHTML += '<div class="full-details-info-row">';
                    modalHTML += '<div class="full-details-info-icon">💭</div>';
                    modalHTML += '<div class="full-details-info-content">';
                    modalHTML += '<div class="full-details-info-label">Razón de Donación</div>';
                    modalHTML += '<div class="full-details-info-value">' + donation.donation_reason + '</div>';
                    modalHTML += '</div></div>';
                }
                
                modalHTML += '</div>';
                
                // Location section
                if (donation.pickup_address) {
                    modalHTML += '<div class="full-details-section">';
                    modalHTML += '<div class="full-details-section-title">📍 Ubicación de Recogida</div>';
                    modalHTML += '<div class="full-details-info-row">';
                    modalHTML += '<div class="full-details-info-icon">📍</div>';
                    modalHTML += '<div class="full-details-info-content">';
                    modalHTML += '<div class="full-details-info-label">Dirección</div>';
                    modalHTML += '<div class="full-details-info-value">' + donation.pickup_address + '</div>';
                    modalHTML += '</div></div>';
                    modalHTML += '</div>';
                }
                
                // Description
                if (donation.description) {
                    modalHTML += '<div class="full-details-section">';
                    modalHTML += '<div class="full-details-section-title">📝 Descripción</div>';
                    modalHTML += '<div class="full-details-description-box">';
                    modalHTML += '<p class="full-details-description-text">' + donation.description + '</p>';
                    modalHTML += '</div>';
                    modalHTML += '</div>';
                }
                
                modalHTML += '</div>';
                
                // Footer buttons
                modalHTML += '<div class="full-details-buttons">';
                if (currentUserType === 'organization') {
                    modalHTML += '<button class="full-details-button full-details-button-primary" onclick="reserveDonation(' + donation.id + ')">';
                    modalHTML += '<span>🎁</span> Reservar Donación';
                    modalHTML += '</button>';
                }
                modalHTML += '<button class="full-details-button full-details-button-secondary" onclick="closeFullDetails()">';
                modalHTML += '<span>✕</span> Cerrar';
                modalHTML += '</button>';
                modalHTML += '</div>';
                
                modalHTML += '</div></div>';
                // </CHANGE>
                
                // Add modal to body
                const modalContainer = document.createElement('div');
                modalContainer.id = 'fullDetailsModal';
                modalContainer.innerHTML = modalHTML;
                document.body.appendChild(modalContainer);
            }
            
            function closeFullDetails(event) {
                if (event) {
                    event.stopPropagation();
                }
                const modal = document.getElementById('fullDetailsModal');
                if (modal) {
                    modal.remove();
                }
            }
            // </CHANGE>
            
            function selectDonation(donationId) {
                logToRN('Seleccionando donación: ' + donationId);
                const donation = donations.find(function(d) { return d.id === donationId; });
                if (donation) {
                    try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MARKER_CLICKED',
                            data: donation
                        }));
                    } catch (e) {
                        logToRN('Error enviando click: ' + e.message);
                    }
                }
            }
            
            function reserveDonation(donationId) {
                logToRN('Reservando donación: ' + donationId);
                const donation = donations.find(function(d) { return d.id === donationId; });
                if (donation) {
                    try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'RESERVE_DONATION',
                            data: donation
                        }));
                    } catch (e) {
                        logToRN('Error enviando reserva: ' + e.message);
                    }
                }
            }
            
            function viewAllAtLocation(latitude, longitude) {
                logToRN('Viendo todas las donaciones en: ' + latitude + ', ' + longitude);
                const locationDonations = donations.filter(function(d) {
                    return Math.abs(d.latitude - latitude) < 0.0001 && Math.abs(d.longitude - longitude) < 0.0001;
                });
                
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'LOCATION_GROUP_CLICKED',
                        data: {
                            latitude: latitude,
                            longitude: longitude,
                            count: locationDonations.length,
                            donations: locationDonations,
                            address: locationDonations[0] ? locationDonations[0].pickup_address : 'Dirección no especificada'
                        }
                    }));
                } catch (e) {
                    logToRN('Error enviando grupo de ubicación: ' + e.message);
                }
            }
            
            function setUserType(data) {
                logToRN('Estableciendo tipo de usuario: ' + data.userType);
                currentUserType = data.userType;

                donationMarkers.forEach(function(marker, index) {
                    // Check if the marker is currently displaying a group popup
                    const currentPopupContent = marker.getPopup().getContent();
                    const isGroupPopup = currentPopupContent.includes('popup-donation-list');

                    if (isGroupPopup) {
                        // Re-render the group popup to include organization-specific buttons if needed
                        const locationGroups = donations.reduce(function(acc, d) {
                            const locationKey = Math.round(d.latitude / 0.0001) + '_' + Math.round(d.longitude / 0.0001);
                            if (!acc[locationKey]) {
                                acc[locationKey] = { 
                                    latitude: d.latitude, 
                                    longitude: d.longitude, 
                                    donations: [], 
                                    address: d.pickup_address || 'Dirección no especificada' 
                                };
                            }
                            acc[locationKey].donations.push(d);
                            return acc;
                        }, {});
                        
                        const locationGroup = Object.values(locationGroups).find(function(group) {
                            return group.latitude === marker.getLatLng().lat && group.longitude === marker.getLatLng().lng;
                        });
                        
                        if (locationGroup) {
                            marker.setPopupContent(createMultiDonationPopup(locationGroup));
                        }
                    }
                    // If it's not a group popup, individual popups don't typically change based on user type, so no update is needed here.
                });
            }
            
            function addTestMarker(testData) {
                logToRN('Añadiendo marcador de prueba: ' + JSON.stringify(testData));
                
                try {
                    if (testMarker) {
                        map.removeLayer(testMarker);
                        logToRN('Marcador de prueba anterior removido');
                    }
                    
                    testMarker = L.marker([testData.latitude, testData.longitude], {
                        icon: createCustomIcon('other', '🧪', false, null)
                    }).addTo(map);
                    
                    testMarker.bindPopup(createPopupContent(testData));
                    logToRN('Marcador de prueba añadido exitosamente');
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'TEST_MARKER_ADDED',
                        data: { success: true, coordinates: [testData.latitude, testData.longitude] }
                    }));
                    
                } catch (error) {
                    logToRN('Error añadiendo marcador de prueba: ' + error.message);
                }
            }
            
            function setUserLocation(location) {
                logToRN('Estableciendo ubicación de usuario: ' + JSON.stringify(location));
                userLocation = location;
                
                try {
                    if (userMarker) {
                        map.removeLayer(userMarker);
                        logToRN('Marcador de usuario anterior removido');
                    }
                    
                    userMarker = L.marker([location.latitude, location.longitude], {
                        icon: L.divIcon({
                            html: '<div style="background: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            className: 'user-marker',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map);
                    
                    userMarker.bindPopup('<div class="custom-popup"><div class="popup-title">Tu ubicación</div></div>');
                    logToRN('Marcador de usuario añadido');
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'USER_LOCATION_SET',
                        data: location
                    }));
                } catch (error) {
                    logToRN('Error estableciendo ubicación de usuario: ' + error.message);
                }
            }
            
            function setDonations(donationsData) {
                logToRN('Estableciendo donaciones: ' + donationsData.length + ' items');
                donations = donationsData;
                
                try {
                    donationMarkers.forEach(function(marker, index) {
                        map.removeLayer(marker);
                        logToRN('Removido marcador ' + index);
                    });
                    donationMarkers = [];
                    
                    const locationGroups = {};
                    const tolerance = 0.0001;
                    
                    donations.forEach(function(donation, index) {
                        logToRN('Procesando donación ' + index + ': ID=' + donation.id + ', lat=' + donation.latitude + ', lng=' + donation.longitude);
                        
                        if (donation.latitude && donation.longitude && 
                            !isNaN(donation.latitude) && !isNaN(donation.longitude)) {
                            
                            const locationKey = Math.round(donation.latitude / tolerance) + '_' + Math.round(donation.longitude / tolerance);
                            
                            if (!locationGroups[locationKey]) {
                                locationGroups[locationKey] = { 
                                    latitude: donation.latitude, 
                                    longitude: donation.longitude, 
                                    donations: [], 
                                    address: donation.pickup_address || 'Dirección no especificada' 
                                };
                            }
                            
                            locationGroups[locationKey].donations.push(donation);
                        } else {
                            logToRN('Donación ' + index + ' tiene coordenadas inválidas: lat=' + donation.latitude + ', lng=' + donation.longitude);
                        }
                    });
                    
                    Object.values(locationGroups).forEach(function(locationGroup, index) {
                        try {
                            const count = locationGroup.donations.length;
                            const firstDonation = locationGroup.donations[0];
                            
                            logToRN('Creando marcador para grupo con ' + count + ' donaciones en ' + locationGroup.latitude + ', ' + locationGroup.longitude);
                            
                            const marker = L.marker([locationGroup.latitude, locationGroup.longitude], {
                                icon: createCustomIcon(firstDonation.category, null, false, count)
                            }).addTo(map);
                            
                            if (count > 1) {
                                marker.bindPopup(createMultiDonationPopup(locationGroup));
                            } else {
                                marker.bindPopup(createPopupContent(firstDonation));
                            }
                            
                            donationMarkers.push(marker);
                            logToRN('Marcador de grupo ' + index + ' añadido con ' + count + ' donaciones');
                        } catch (markerError) {
                            logToRN('Error creando marcador de grupo ' + index + ': ' + markerError.message);
                        }
                    });
                    
                    logToRN('Total marcadores añadidos: ' + donationMarkers.length + ' (de ' + donations.length + ' donaciones)');
                    
                    if (donationMarkers.length > 0) {
                        try {
                            const group = new L.featureGroup(donationMarkers);
                            map.fitBounds(group.getBounds().pad(0.1));
                            logToRN('Vista ajustada para mostrar todos los marcadores');
                        } catch (boundsError) {
                            logToRN('Error ajustando vista: ' + boundsError.message);
                        }
                    } else {
                        logToRN('No hay marcadores para ajustar vista');
                    }
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DONATIONS_SET',
                        data: { count: donationMarkers.length, total: donations.length }
                    }));
                    
                } catch (error) {
                    logToRN('Error general estableciendo donaciones: ' + error.message);
                }
            }
            
            function centerOnUser() {
                if (userLocation) {
                    map.setView([userLocation.latitude, userLocation.longitude], 15);
                    logToRN('Vista centrada en usuario');
                } else {
                    logToRN('No hay ubicación de usuario para centrar');
                }
            }
            
            function highlightDonation(donationData) {
                try {
                    logToRN('Resaltando donación: ' + JSON.stringify(donationData));
                    
                    if (highlightedMarker) {
                        map.removeLayer(highlightedMarker);
                    }
                    
                    let fullDonation = donations.find(function(d) { return d.id === donationData.id; });
                    
                    if (!fullDonation) {
                        fullDonation = donationData;
                        donations.push(fullDonation);
                        logToRN('Donación agregada al array: ' + donationData.id);
                        // </CHANGE>
                    } else {
                        logToRN('Encontrada donación completa en array para ID ' + donationData.id);
                    }
                    
                    highlightedMarker = L.marker([fullDonation.latitude, fullDonation.longitude], {
                        icon: createCustomIcon(fullDonation.category, null, true, null)
                    }).addTo(map);
                    
                    highlightedMarker.bindPopup(createPopupContent(fullDonation));
                    
                    map.setView([fullDonation.latitude, fullDonation.longitude], 16);
                    
                    setTimeout(function() {
                        showFullDetails(fullDonation.id);
                    }, 800);
                    // </CHANGE>
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DONATION_HIGHLIGHTED',
                        data: { success: true, donation: fullDonation }
                    }));
                    
                } catch (error) {
                    logToRN('Error resaltando donación: ' + error.message);
                }
            }
            
            document.addEventListener('message', function(event) {
                handleMessage(event.data);
            });
            
            window.addEventListener('message', function(event) {
                handleMessage(event.data);
            });
            
            function handleMessage(data) {
                try {
                    const message = JSON.parse(data);
                    
                    switch (message.type) {
                        case 'SET_USER_TYPE':
                            setUserType(message.data);
                            break;
                        case 'SET_USER_LOCATION':
                            setUserLocation(message.data);
                            break;
                        case 'SET_DONATIONS':
                            setDonations(message.data);
                            break;
                        case 'CENTER_ON_USER':
                            centerOnUser();
                            break;
                        case 'ADD_TEST_MARKER':
                            addTestMarker(message.data);
                            break;
                        case 'GET_NETWORK_INFO':
                            getNetworkInfo();
                            break;
                        case 'HIGHLIGHT_DONATION':
                            highlightDonation(message.data);
                            break;
                        case 'UPDATE_DONATIONS':
                            updateDonations(message.data);
                            break;
                        default:
                            logToRN('Mensaje desconocido: ' + message.type);
                    }
                } catch (error) {
                    console.error('Error procesando mensaje:', error);
                }
            }
            
            map.whenReady(function() {
                logToRN('Mapa completamente listo');
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_READY',
                        data: true
                    }));
                } catch (e) {
                    logToRN('Error enviando MAP_READY: ' + e.message);
                }
            });
            
            map.on('error', function(error) {
                logToRN('Error en mapa: ' + error.message);
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_ERROR',
                        data: error.message
                    }));
                } catch (e) {
                    console.error('Error enviando MAP_ERROR:', e);
                }
            });
            
            logToRN('Script de mapa completamente cargado');
        </script>
    </body>
    </html>
  `

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa Web {highlightDonation && `- ${highlightDonation.title}`}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.networkButton} onPress={showNetworkInfo}>
            <Ionicons name="globe-outline" size={20} color={colors.info} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshMap}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          {locationPermission && (
            <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
              <Ionicons name="locate" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando mapa web...</Text>
            </View>
          )}
          onError={(error) => {
            console.error("❌ [MAP_WEBVIEW] Error en WebView:", error)
            setError(`Error en WebView: ${error.nativeEvent.description}`)
          }}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando donaciones...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorTitle}>Error al cargar mapa</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Reintentar" onPress={loadDonations} variant="outline" style={styles.retryButton} />
          </View>
        )}
      </View>
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
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  networkButton: {
    padding: spacing.sm,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  locationButton: {
    padding: spacing.sm,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
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
})

export default MapScreenWebView
