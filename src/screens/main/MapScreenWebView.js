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

const MapScreenWebView = ({ route }) => {
  const { user } = useAuth()
  const webViewRef = useRef(null)
  const [donations, setDonations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState("")
  const [mapReady, setMapReady] = useState(false)
  const [webViewLogs, setWebViewLogs] = useState([])
  const [networkInfo, setNetworkInfo] = useState({})
  const highlightDonation = route?.params?.highlightDonation

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      bakery: "Panadería",
      dairy: "Lácteos",
      fruits: "Frutas y Verduras",
      meat: "Carnes",
      canned: "Enlatados",
      prepared: "Comida Preparada",
      other: "Otros",
    }
    return categoryLabels[category] || category
  }

  useEffect(() => {
    requestLocationPermission()
    loadDonations()
  }, [])

  // Enviar datos al WebView cuando esté listo
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      console.log("🔄 [MAP_WEBVIEW] Enviando datos al mapa listo...")

      // Pequeño delay para asegurar que el WebView esté completamente listo
      setTimeout(() => {
        if (userLocation) {
          console.log("📍 [MAP_WEBVIEW] Enviando ubicación de usuario:", userLocation)
          sendMessageToWebView("SET_USER_LOCATION", userLocation)
        }

        if (donations.length > 0) {
          console.log("🎯 [MAP_WEBVIEW] Enviando donaciones:", donations.length)
          sendMessageToWebView("SET_DONATIONS", donations)
        }

        // RESALTAR DONACIÓN ESPECÍFICA SI VIENE DE NAVEGACIÓN
        if (highlightDonation) {
          console.log("🎯 [MAP_WEBVIEW] Resaltando donación específica:", highlightDonation)
          sendMessageToWebView("HIGHLIGHT_DONATION", highlightDonation)
        }

        // Siempre enviar marcador de prueba
        sendMessageToWebView("ADD_TEST_MARKER", {
          latitude: 4.8133,
          longitude: -75.6961,
          title: "🧪 Marcador de Prueba",
          description: "Centro de Pereira - Marcador de prueba",
        })

        // Obtener información de red
        sendMessageToWebView("GET_NETWORK_INFO", {})
      }, 500)
    }
  }, [mapReady, userLocation, donations, highlightDonation])

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
      setDebugInfo("Cargando...")

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
        // Procesar donaciones para el mapa web con logs detallados
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

          // Si no hay coordenadas válidas, generar coordenadas simuladas
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
            latitude: latitude,
            longitude: longitude,
            donor_name: donation.donor_name || "Donante anónimo",
            expiry_date: donation.expiry_date,
            pickup_address: donation.pickup_address || "Dirección no especificada",
            donor_phone: donation.donor_phone || null, // Añadir teléfono si está disponible
          }

          console.log(`✅ [MAP_WEBVIEW] Donación procesada ${donation.id}:`, processed)
          return processed
        })

        console.log("🎯 [MAP_WEBVIEW] Total donaciones procesadas:", processedDonations.length)
        setDonations(processedDonations)
        setDebugInfo(`Cargadas: ${processedDonations.length} donaciones`)
      } else {
        console.warn("⚠️ [MAP_WEBVIEW] No hay donaciones o datos inválidos")
        setDonations([])
        setDebugInfo("No hay donaciones")
      }
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error en loadDonations:", error)
      setError(error.message)
      setDonations([])
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)
      console.log("📨 [MAP_WEBVIEW] Mensaje del WebView:", message)

      // Añadir log a la lista para mostrar en UI
      setWebViewLogs((prev) => [
        ...prev.slice(-4),
        `${message.type}: ${JSON.stringify(message.data).substring(0, 50)}...`,
      ])

      switch (message.type) {
        case "MAP_READY":
          console.log("🗺️ [MAP_WEBVIEW] Mapa web listo")
          setMapReady(true)
          break

        case "MARKER_CLICKED":
          console.log("📍 [MAP_WEBVIEW] Marcador clickeado:", message.data)
          handleMarkerClick(message.data)
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
          setNetworkInfo(message.data)
          break

        case "DONATION_HIGHLIGHTED":
          console.log("🎯 [MAP_WEBVIEW] Donación resaltada:", message.data)
          break

        default:
          console.log("📨 [MAP_WEBVIEW] Mensaje no reconocido:", message.type)
      }
    } catch (error) {
      console.error("❌ [MAP_WEBVIEW] Error procesando mensaje:", error)
    }
  }

  const handleMarkerClick = (donationData) => {
    console.log("🎯 [MAP_WEBVIEW] Donación seleccionada:", donationData)

    // Formatear fecha de caducidad
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

    // Crear mensaje detallado
    let message = `📦 Categoría: ${categoryLabel}\n`
    message += `📏 Cantidad: ${donationData.quantity || "No especificada"}\n`
    message += `👤 Donante: ${donationData.donor_name || "Anónimo"}\n`
    message += `📅 Caduca: ${formattedDate}\n`
    message += `📍 Dirección: ${donationData.pickup_address || "No especificada"}\n`

    // Añadir teléfono si está disponible
    if (donationData.donor_phone) {
      message += `📞 Teléfono: ${donationData.donor_phone}\n`
    }

    if (donationData.description) {
      message += `\n📝 Descripción:\n${donationData.description}`
    }

    Alert.alert(`🎁 ${donationData.title}`, message, [
      { text: "Cerrar", style: "cancel" },
      ...(donationData.donor_phone
        ? [
            {
              text: "📞 Llamar",
              onPress: () => {
                Alert.alert("Llamar al donante", `¿Deseas llamar a ${donationData.donor_phone}?`, [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Llamar",
                    onPress: () => {
                      // Aquí se podría implementar la llamada real
                      Alert.alert("📞", `Llamando a ${donationData.donor_phone}...`)
                    },
                  },
                ])
              },
            },
          ]
        : []),
    ])
  }

  const centerOnUser = () => {
    if (mapReady && webViewRef.current && userLocation) {
      sendMessageToWebView("CENTER_ON_USER", userLocation)
    }
  }

  const refreshMap = () => {
    loadDonations()
  }

  const showDebugInfo = () => {
    const networkDetails = networkInfo.userAgent
      ? `User-Agent: ${networkInfo.userAgent.substring(0, 100)}...\nIP: ${networkInfo.ip || "No detectada"}\nReferer: ${
          networkInfo.referer || "Ninguno"
        }`
      : "Información de red no disponible"

    Alert.alert(
      "🔍 Debug Info Completo",
      `📊 DATOS:
Donaciones: ${donations.length}
Mapa listo: ${mapReady}
Ubicación: ${userLocation ? "Sí" : "No"}
Resaltar: ${highlightDonation ? highlightDonation.title : "Ninguna"}

🌐 RED:
${networkDetails}

📝 LOGS:
${webViewLogs.join("\n")}`,
      [{ text: "OK" }],
    )
  }

  const showNetworkInfo = () => {
    Alert.alert(
      "🌐 Tu 'Servidor' (Información de Red)",
      `🔍 ESTO ES LO QUE VE OPENSTREETMAP:

📱 User-Agent:
${networkInfo.userAgent || "Cargando..."}

🌍 IP Pública:
${networkInfo.ip || "No detectada"}

📡 Referer:
${networkInfo.referer || "Ninguno"}

⚠️ NOTA: Tu "servidor" es tu dispositivo móvil conectado a internet. OpenStreetMap ve estas requests como viniendo de tu IP.`,
      [{ text: "Entendido" }],
    )
  }

  // HTML del mapa con funcionalidad de resaltado
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
            .custom-popup {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .popup-title {
                font-weight: bold;
                font-size: 16px;
                color: #2E7D32;
                margin-bottom: 8px;
            }
            .popup-category {
                background: #4CAF50;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                display: inline-block;
                margin-bottom: 8px;
            }
            .popup-details {
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }
            .popup-button {
                background: #2E7D32;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                margin-top: 8px;
            }
            .popup-button:hover {
                background: #1B5E20;
            }
            /* ESTILOS PARA MARCADOR RESALTADO */
            .highlighted-marker {
                animation: pulse 2s infinite;
                z-index: 1000 !important;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Función para enviar logs a React Native
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
            
            // Función para obtener información de red
            async function getNetworkInfo() {
                const info = {
                    userAgent: navigator.userAgent,
                    referer: document.referrer,
                    ip: null,
                    timestamp: new Date().toISOString()
                };
                
                // Intentar obtener IP pública
                try {
                    const response = await fetch('https://api.ipify.org?format=json');
                    const data = await response.json();
                    info.ip = data.ip;
                } catch (e) {
                    logToRN('⚠️ No se pudo obtener IP pública: ' + e.message);
                }
                
                logToRN('🌐 Información de red obtenida: ' + JSON.stringify(info, null, 2));
                
                // Enviar a React Native
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'NETWORK_INFO',
                        data: info
                    }));
                } catch (e) {
                    logToRN('❌ Error enviando info de red: ' + e.message);
                }
                
                return info;
            }
            
            logToRN('🚀 Iniciando mapa WebView...');
            
            // Función para traducir categorías al español
            function getCategoryLabel(category) {
              const categoryLabels = {
                bakery: 'Panadería',
                dairy: 'Lácteos',
                fruits: 'Frutas y Verduras', 
                meat: 'Carnes',
                canned: 'Enlatados',
                prepared: 'Comida Preparada',
                other: 'Otros'
              };
              return categoryLabels[category] || category;
            }

            // Función para formatear fecha simple
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
            
            // Inicializar mapa con CartoDB tiles (más estable que OpenStreetMap)
            const map = L.map('map').setView([4.8133, -75.6961], 13);
            logToRN('🗺️ Mapa inicializado');
            
            // Usar CartoDB tiles en lugar de OpenStreetMap para evitar bloqueos
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                // Headers personalizados para identificar la app
                headers: {
                    'User-Agent': 'FoodDonationApp/1.0 (React Native WebView)'
                }
            }).addTo(map);
            logToRN('🌍 CartoDB tiles añadidos');
            
            // Variables globales
            let userMarker = null;
            let donationMarkers = [];
            let testMarker = null;
            let userLocation = null;
            let donations = [];
            let highlightedMarker = null; // NUEVA VARIABLE PARA MARCADOR RESALTADO
            
            // Iconos personalizados
            const categoryIcons = {
                bakery: '🥖',
                dairy: '🥛', 
                fruits: '🍎',
                meat: '🥩',
                canned: '🥫',
                prepared: '🍱',
                other: '📦'
            };
            
            const categoryColors = {
                bakery: '#f59e0b',
                dairy: '#3b82f6',
                fruits: '#10b981',
                meat: '#ef4444',
                canned: '#8b5cf6',
                prepared: '#ec4899',
                other: '#6b7280'
            };
            
            // Función para crear marcador personalizado
            function createCustomIcon(category, emoji = null, isHighlighted = false) {
                const icon = emoji || categoryIcons[category] || '📦';
                const color = categoryColors[category] || '#6b7280';
                const size = isHighlighted ? 40 : 30; // MARCADOR MÁS GRANDE SI ESTÁ RESALTADO
                const borderColor = isHighlighted ? '#FF5722' : 'white'; // BORDE NARANJA SI ESTÁ RESALTADO
                const borderWidth = isHighlighted ? 3 : 2;
                
                return L.divIcon({
                    html: \`<div style="
                        background: \${color};
                        width: \${size}px;
                        height: \${size}px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: \${isHighlighted ? 20 : 16}px;
                        border: \${borderWidth}px solid \${borderColor};
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    " class="\${isHighlighted ? 'highlighted-marker' : ''}">\${icon}</div>\`,
                    className: 'custom-marker',
                    iconSize: [size, size],
                    iconAnchor: [size/2, size/2]
                });
            }
            
            // Función para crear popup personalizado
            function createPopupContent(donation) {
              const categoryLabel = getCategoryLabel(donation.category);
              const formattedDate = formatSimpleDate(donation.expiry_date);
              
              return \`
                <div class="custom-popup">
                  <div class="popup-title">\${donation.title}</div>
                  <div class="popup-category">\${categoryLabel}</div>
                  <div class="popup-details">
                    \${donation.quantity ? \`<strong>Cantidad:</strong> \${donation.quantity}<br>\` : ''}
                    \${donation.donor_name ? \`<strong>Donante:</strong> \${donation.donor_name}<br>\` : ''}
                    \${formattedDate ? \`<strong>Caduca:</strong> \${formattedDate}<br>\` : ''}
                    \${donation.pickup_address ? \`<strong>Dirección:</strong> \${donation.pickup_address}\` : ''}
                    \${donation.description ? \`<br><strong>Descripción:</strong> \${donation.description}\` : ''}
                  </div>
                  \${donation.id ? \`<button class="popup-button" onclick="selectDonation(\${donation.id})">Ver Detalles</button>\` : ''}
                </div>
              \`;
            }
            
            // Función para seleccionar donación
            function selectDonation(donationId) {
                logToRN(\`🎯 Seleccionando donación: \${donationId}\`);
                const donation = donations.find(d => d.id === donationId);
                if (donation) {
                    try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MARKER_CLICKED',
                            data: donation
                        }));
                    } catch (e) {
                        logToRN(\`❌ Error enviando click: \${e.message}\`);
                    }
                }
            }
            
            // Función para añadir marcador de prueba
            function addTestMarker(testData) {
                logToRN(\`🧪 Añadiendo marcador de prueba: \${JSON.stringify(testData)}\`);
                
                try {
                    if (testMarker) {
                        map.removeLayer(testMarker);
                        logToRN('🗑️ Marcador de prueba anterior removido');
                    }
                    
                    testMarker = L.marker([testData.latitude, testData.longitude], {
                        icon: createCustomIcon('other', '🧪')
                    }).addTo(map);
                    
                    testMarker.bindPopup(createPopupContent(testData));
                    logToRN('✅ Marcador de prueba añadido exitosamente');
                    
                    // Notificar a React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'TEST_MARKER_ADDED',
                        data: { success: true, coordinates: [testData.latitude, testData.longitude] }
                    }));
                    
                } catch (error) {
                    logToRN(\`❌ Error añadiendo marcador de prueba: \${error.message}\`);
                }
            }
            
            // Función para establecer ubicación del usuario
            function setUserLocation(location) {
                logToRN(\`📍 Estableciendo ubicación de usuario: \${JSON.stringify(location)}\`);
                userLocation = location;
                
                try {
                    if (userMarker) {
                        map.removeLayer(userMarker);
                        logToRN('🗑️ Marcador de usuario anterior removido');
                    }
                    
                    userMarker = L.marker([location.latitude, location.longitude], {
                        icon: L.divIcon({
                            html: \`<div style="
                                background: #2196F3;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            "></div>\`,
                            className: 'user-marker',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map);
                    
                    userMarker.bindPopup('<div class="custom-popup"><div class="popup-title">Tu ubicación</div></div>');
                    logToRN('✅ Marcador de usuario añadido');
                    
                    // Notificar a React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'USER_LOCATION_SET',
                        data: location
                    }));
                } catch (error) {
                    logToRN(\`❌ Error estableciendo ubicación de usuario: \${error.message}\`);
                }
            }
            
            // Función para establecer donaciones
            function setDonations(donationsData) {
                logToRN(\`🎯 Estableciendo donaciones: \${donationsData.length} items\`);
                donations = donationsData;
                
                try {
                    // Limpiar marcadores existentes
                    donationMarkers.forEach((marker, index) => {
                        map.removeLayer(marker);
                        logToRN(\`🗑️ Removido marcador \${index}\`);
                    });
                    donationMarkers = [];
                    
                    // Añadir nuevos marcadores
                    donations.forEach((donation, index) => {
                        logToRN(\`🔍 Procesando donación \${index}: ID=\${donation.id}, lat=\${donation.latitude}, lng=\${donation.longitude}\`);
                        
                        if (donation.latitude && donation.longitude && 
                            !isNaN(donation.latitude) && !isNaN(donation.longitude)) {
                            
                            try {
                                const marker = L.marker([donation.latitude, donation.longitude], {
                                    icon: createCustomIcon(donation.category)
                                }).addTo(map);
                                
                                marker.bindPopup(createPopupContent(donation));
                                donationMarkers.push(marker);
                                logToRN(\`✅ Marcador \${index} añadido exitosamente para donación \${donation.id}\`);
                            } catch (markerError) {
                                logToRN(\`❌ Error creando marcador \${index}: \${markerError.message}\`);
                            }
                        } else {
                            logToRN(\`⚠️ Donación \${index} tiene coordenadas inválidas: lat=\${donation.latitude}, lng=\${donation.longitude}\`);
                        }
                    });
                    
                    logToRN(\`🎯 Total marcadores añadidos: \${donationMarkers.length}\`);
                    
                    // Ajustar vista para mostrar todos los marcadores
                    if (donationMarkers.length > 0) {
                        try {
                            const group = new L.featureGroup(donationMarkers);
                            map.fitBounds(group.getBounds().pad(0.1));
                            logToRN('🔍 Vista ajustada para mostrar todos los marcadores');
                        } catch (boundsError) {
                            logToRN(\`⚠️ Error ajustando vista: \${boundsError.message}\`);
                        }
                    } else {
                        logToRN('⚠️ No hay marcadores para ajustar vista');
                    }
                    
                    // Notificar a React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DONATIONS_SET',
                        data: { count: donationMarkers.length, total: donations.length }
                    }));
                    
                } catch (error) {
                    logToRN(\`❌ Error general estableciendo donaciones: \${error.message}\`);
                }
            }
            
            // Función para centrar en usuario
            function centerOnUser() {
                if (userLocation) {
                    map.setView([userLocation.latitude, userLocation.longitude], 15);
                    logToRN('🎯 Vista centrada en usuario');
                } else {
                    logToRN('⚠️ No hay ubicación de usuario para centrar');
                }
            }
            
            // NUEVA FUNCIÓN PARA RESALTAR DONACIÓN ESPECÍFICA
            function highlightDonation(donationData) {
                try {
                    logToRN('🎯 Resaltando donación: ' + JSON.stringify(donationData));
                    
                    // Limpiar marcador resaltado anterior
                    if (highlightedMarker) {
                        map.removeLayer(highlightedMarker);
                    }
                    
                    // Buscar la donación completa en el array de donaciones
                    let fullDonation = donations.find(d => d.id === donationData.id);
                    
                    // Si no se encuentra, usar los datos que vienen del parámetro
                    if (!fullDonation) {
                        fullDonation = donationData;
                        logToRN('Usando datos del parámetro para donación ' + donationData.id);
                    } else {
                        logToRN('Encontrada donación completa en array para ID ' + donationData.id);
                    }
                    
                    // Crear marcador resaltado con toda la información
                    highlightedMarker = L.marker([fullDonation.latitude, fullDonation.longitude], {
                        icon: createCustomIcon(fullDonation.category, null, true) // isHighlighted = true
                    }).addTo(map);
                    
                    // Usar toda la información disponible para el popup
                    highlightedMarker.bindPopup(createPopupContent(fullDonation));
                    
                    // Centrar mapa en la donación resaltada
                    map.setView([fullDonation.latitude, fullDonation.longitude], 16);
                    
                    // Abrir popup automáticamente
                    setTimeout(() => {
                        highlightedMarker.openPopup();
                    }, 500);
                    
                    // Notificar a React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DONATION_HIGHLIGHTED',
                        data: { success: true, donation: fullDonation }
                    }));
                    
                } catch (error) {
                    logToRN('❌ Error resaltando donación: ' + error.message);
                }
            }
            
            // Escuchar mensajes de React Native
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
                        case 'HIGHLIGHT_DONATION': // NUEVO CASO PARA RESALTAR DONACIÓN
                            highlightDonation(message.data);
                            break;
                        default:
                            logToRN('Tipo de mensaje no reconocido:', message.type);
                    }
                } catch (error) {
                    console.error('Error procesando mensaje:', error);
                }
            }
            
            // Notificar que el mapa está listo
            map.whenReady(function() {
                logToRN('✅ Mapa completamente listo');
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_READY',
                        data: true
                    }));
                } catch (e) {
                    logToRN(\`❌ Error enviando MAP_READY: \${e.message}\`);
                }
            });
            
            // Manejar errores
            map.on('error', function(error) {
                logToRN(\`❌ Error en mapa: \${error.message}\`);
                try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_ERROR',
                        data: error.message
                    }));
                } catch (e) {
                    console.error('Error enviando MAP_ERROR:', e);
                }
            });
            
            logToRN('🎉 Script de mapa completamente cargado');
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
            <Ionicons name="globe" size={20} color={colors.info} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
            <Ionicons name="bug" size={20} color={colors.secondary} />
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

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          {debugInfo} | Mapa: {mapReady ? "✅" : "⏳"} | Ubicación: {userLocation ? "✅" : "❌"} | Donaciones:{" "}
          {donations.length}
        </Text>
        {webViewLogs.length > 0 && (
          <Text style={styles.webViewLogText}>WebView: {webViewLogs[webViewLogs.length - 1]}</Text>
        )}
        {networkInfo.ip && (
          <Text style={styles.networkInfoText}>
            🌐 Tu IP: {networkInfo.ip} | User-Agent: {networkInfo.userAgent?.substring(0, 30)}...
          </Text>
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
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  networkButton: {
    padding: spacing.sm,
  },
  debugButton: {
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
  debugInfo: {
    backgroundColor: colors.black + "80",
    padding: spacing.sm,
  },
  debugText: {
    fontSize: typography.xs,
    color: colors.white,
    textAlign: "center",
  },
  webViewLogText: {
    fontSize: 10,
    color: colors.yellow,
    textAlign: "center",
    marginTop: 2,
  },
  networkInfoText: {
    fontSize: 9,
    color: colors.info,
    textAlign: "center",
    marginTop: 2,
  },
})

export default MapScreenWebView
