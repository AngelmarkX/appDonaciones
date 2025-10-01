import authService from "./authService"

const API_BASE_URL = "http://192.168.1.5:3006/api"

class DonationService {
  async getDonations(filters = {}) {
    try {
      console.log("🔄 [DONATION_SERVICE] Iniciando getDonations...")
      console.log("📋 [DONATION_SERVICE] Filtros:", filters)

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key])
        }
      })

      const url = `${API_BASE_URL}/donations?${queryParams.toString()}`
      console.log("🌐 [DONATION_SERVICE] URL:", url)

      const headers = authService.getAuthHeaders()
      console.log("📋 [DONATION_SERVICE] Headers:", {
        hasAuth: !!headers.Authorization,
        contentType: headers["Content-Type"],
      })

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        timeout: 10000,
      })

      console.log("📡 [DONATION_SERVICE] Response status:", response.status)
      console.log("📡 [DONATION_SERVICE] Response ok:", response.ok)

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ [DONATION_SERVICE] Error response:", errorText)
        throw new Error(`Error del servidor: ${response.status}`)
      }

      // Obtener el texto crudo primero
      const rawText = await response.text()
      console.log("📄 [DONATION_SERVICE] Raw response text:", rawText.substring(0, 500) + "...")

      // Intentar parsear JSON
      let data
      try {
        data = JSON.parse(rawText)
        console.log("✅ [DONATION_SERVICE] JSON parseado exitosamente")
      } catch (parseError) {
        console.error("❌ [DONATION_SERVICE] Error parseando JSON:", parseError)
        console.error("📄 [DONATION_SERVICE] Raw text completo:", rawText)
        throw new Error("Respuesta del servidor no es JSON válido")
      }

      // Inspeccionar la estructura de datos
      console.log("🔍 [DONATION_SERVICE] Tipo de data:", typeof data)
      console.log("🔍 [DONATION_SERVICE] Es array:", Array.isArray(data))
      console.log("🔍 [DONATION_SERVICE] Longitud:", data?.length)

      if (data === null) {
        console.warn("⚠️ [DONATION_SERVICE] Data es null")
        return []
      }

      if (data === undefined) {
        console.warn("⚠️ [DONATION_SERVICE] Data es undefined")
        return []
      }

      if (!Array.isArray(data)) {
        console.error("❌ [DONATION_SERVICE] Data no es array:", {
          type: typeof data,
          constructor: data?.constructor?.name,
          keys: Object.keys(data || {}),
          value: data,
        })
        return []
      }

      // Inspeccionar cada elemento del array
      console.log("🔍 [DONATION_SERVICE] Inspeccionando elementos del array:")
      data.forEach((item, index) => {
        console.log(`📦 [DONATION_SERVICE] Item ${index}:`, {
          type: typeof item,
          isNull: item === null,
          isUndefined: item === undefined,
          keys: item ? Object.keys(item) : "N/A",
          id: item?.id,
          title: item?.title,
          category: item?.category,
          // Mostrar todas las variantes de coordenadas
          pickup_latitude: item?.pickup_latitude,
          pickup_longitude: item?.pickup_longitude,
          latitude: item?.latitude,
          longitude: item?.longitude,
        })

        // Inspeccionar propiedades críticas
        if (item) {
          const criticalProps = [
            "id",
            "title",
            "category",
            "pickup_latitude",
            "pickup_longitude",
            "latitude",
            "longitude",
          ]
          criticalProps.forEach((prop) => {
            const value = item[prop]
            if (value === undefined) {
              console.warn(`⚠️ [DONATION_SERVICE] Item ${index}.${prop} es undefined`)
            } else if (value === null) {
              console.warn(`⚠️ [DONATION_SERVICE] Item ${index}.${prop} es null`)
            } else if (value === "") {
              console.warn(`⚠️ [DONATION_SERVICE] Item ${index}.${prop} es string vacío`)
            }
          })
        }
      })

      // Validar y normalizar cada donación
      const validDonations = data.filter((donation, index) => {
        console.log(`🔍 [DONATION_SERVICE] Validando donación ${index}:`)

        if (!donation) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} es null/undefined:`, donation)
          return false
        }

        if (typeof donation !== "object") {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} no es objeto:`, typeof donation, donation)
          return false
        }

        if (!donation.id) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} sin ID:`, donation)
          return false
        }

        if (!donation.title) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} sin título:`, donation)
          return false
        }

        if (!donation.category) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} sin categoría:`, donation)
          return false
        }

        // Priorizar pickup_latitude/pickup_longitude, luego latitude/longitude
        const lat = donation.pickup_latitude || donation.latitude
        const lng = donation.pickup_longitude || donation.longitude

        console.log(`🔍 [DONATION_SERVICE] Coordenadas originales donación ${donation.id}:`, {
          pickup_latitude: donation.pickup_latitude,
          pickup_longitude: donation.pickup_longitude,
          latitude: donation.latitude,
          longitude: donation.longitude,
          selected_lat: lat,
          selected_lng: lng,
        })

        if (!lat || !lng) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} sin coordenadas:`, {
            pickup_latitude: donation.pickup_latitude,
            pickup_longitude: donation.pickup_longitude,
            latitude: donation.latitude,
            longitude: donation.longitude,
          })
          return false
        }

        const latNum = Number.parseFloat(lat)
        const lngNum = Number.parseFloat(lng)

        if (isNaN(latNum) || isNaN(lngNum)) {
          console.error(`❌ [DONATION_SERVICE] Donación ${index} coordenadas inválidas:`, {
            lat,
            lng,
            latNum,
            lngNum,
          })
          return false
        }

        // Normalizar las coordenadas en el objeto
        donation.latitude = latNum
        donation.longitude = lngNum
        donation.pickup_latitude = latNum
        donation.pickup_longitude = lngNum

        console.log(`✅ [DONATION_SERVICE] Donación ${index} válida y normalizada:`, {
          id: donation.id,
          title: donation.title,
          category: donation.category,
          coordinates: { lat: latNum, lng: lngNum },
        })

        return true
      })

      console.log(`✅ [DONATION_SERVICE] ${validDonations.length} donaciones válidas de ${data.length} totales`)

      return validDonations
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error completo:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
      throw error
    }
  }

  async createDonation(donationData) {
    try {
      console.log("🔄 [DONATION_SERVICE] Creando donación:", donationData)

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      // Validar que las coordenadas estén presentes
      if (!donationData.latitude || !donationData.longitude) {
        throw new Error("Las coordenadas de ubicación son requeridas")
      }

      // Asegurar que las coordenadas sean números
      const processedData = {
        ...donationData,
        latitude: Number.parseFloat(donationData.latitude),
        longitude: Number.parseFloat(donationData.longitude),
        pickup_latitude: Number.parseFloat(donationData.pickup_latitude || donationData.latitude),
        pickup_longitude: Number.parseFloat(donationData.pickup_longitude || donationData.longitude),
      }

      console.log("📤 [DONATION_SERVICE] Datos procesados para envío:", processedData)

      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(processedData),
      })

      console.log("📡 [DONATION_SERVICE] Create response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [DONATION_SERVICE] Create error:", errorData)
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ [DONATION_SERVICE] Donación creada:", result)
      return result
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error creating donation:", error)
      throw error
    }
  }

  async reserveDonation(donationId) {
    try {
      console.log("🔄 [DONATION_SERVICE] Reservando donación:", donationId)

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      const response = await fetch(`${API_BASE_URL}/donations/${donationId}/reserve`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
      })

      console.log("📡 [DONATION_SERVICE] Reserve response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [DONATION_SERVICE] Reserve error:", errorData)
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ [DONATION_SERVICE] Donación reservada:", result)
      return result
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error reserving donation:", error)
      throw error
    }
  }

  // NUEVA FUNCIÓN SIMPLE PARA CONFIRMAR
  async confirmDonation(donationId) {
    try {
      console.log("🔄 [DONATION_SERVICE] Confirmando donación:", donationId)

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      const response = await fetch(`${API_BASE_URL}/donations/${donationId}/confirm`, {
        method: "POST",
        headers: authService.getAuthHeaders(),
      })

      console.log("📡 [DONATION_SERVICE] Confirm response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [DONATION_SERVICE] Confirm error:", errorData)
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ [DONATION_SERVICE] Donación confirmada:", result)
      return result
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error confirming donation:", error)
      throw error
    }
  }

  async getMyDonations() {
    try {
      console.log("🔄 [DONATION_SERVICE] Obteniendo mis donaciones...")

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      const response = await fetch(`${API_BASE_URL}/donations/my`, {
        method: "GET",
        headers: authService.getAuthHeaders(),
      })

      console.log("📡 [DONATION_SERVICE] My donations response status:", response.status)

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ [DONATION_SERVICE] Mis donaciones:", {
        type: typeof data,
        isArray: Array.isArray(data),
        length: data?.length,
      })

      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error getting my donations:", error)
      return []
    }
  }

  async getStats() {
    try {
      console.log("🔄 [DONATION_SERVICE] Obteniendo estadísticas...")

      if (!authService.isAuthenticated()) {
        throw new Error("Usuario no autenticado")
      }

      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: "GET",
        headers: authService.getAuthHeaders(),
      })

      console.log("📡 [DONATION_SERVICE] Stats response status:", response.status)

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ [DONATION_SERVICE] Estadísticas:", data)

      return (
        data || {
          totalDonations: 0,
          activeDonations: 0,
          completedDonations: 0,
          impactScore: 0,
        }
      )
    } catch (error) {
      console.error("❌ [DONATION_SERVICE] Error getting stats:", error)
      return {
        totalDonations: 0,
        activeDonations: 0,
        completedDonations: 0,
        impactScore: 0,
      }
    }
  }
}

export default new DonationService()
