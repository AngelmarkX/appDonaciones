import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "http://192.168.1.5:3006/api"

class AuthService {
  constructor() {
    this.token = null
    this.user = null
  }

  async login(email, password) {
    try {
      console.log("🔄 [AUTH] Iniciando login para:", email)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en login")
      }

      // Guardar token y usuario
      this.token = data.token
      this.user = data.user

      // Persistir en AsyncStorage
      await AsyncStorage.setItem("token", data.token)
      await AsyncStorage.setItem("user", JSON.stringify(data.user))

      console.log("✅ [AUTH] Login exitoso:", {
        hasToken: !!this.token,
        tokenStart: this.token ? this.token.substring(0, 10) + "..." : "none",
        user: this.user.email,
      })

      return data
    } catch (error) {
      console.error("❌ [AUTH] Error en login:", error)
      throw error
    }
  }

  async register(userData) {
    try {
      console.log("🔄 [AUTH] Iniciando registro para:", userData.email)

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en registro")
      }

      // Guardar token y usuario
      this.token = data.token
      this.user = data.user

      // Persistir en AsyncStorage
      await AsyncStorage.setItem("token", data.token)
      await AsyncStorage.setItem("user", JSON.stringify(data.user))

      console.log("✅ [AUTH] Registro exitoso:", {
        hasToken: !!this.token,
        user: this.user.email,
      })

      return data
    } catch (error) {
      console.error("❌ [AUTH] Error en registro:", error)
      throw error
    }
  }

  async logout() {
    try {
      console.log("🔄 [AUTH] Cerrando sesión...")

      this.token = null
      this.user = null

      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")

      console.log("✅ [AUTH] Sesión cerrada")
    } catch (error) {
      console.error("❌ [AUTH] Error cerrando sesión:", error)
    }
  }

  async loadStoredAuth() {
    try {
      console.log("🔄 [AUTH] Cargando autenticación almacenada...")

      const token = await AsyncStorage.getItem("token")
      const userStr = await AsyncStorage.getItem("user")

      if (token && userStr) {
        this.token = token
        this.user = JSON.parse(userStr)

        console.log("✅ [AUTH] Autenticación cargada:", {
          hasToken: !!this.token,
          tokenStart: this.token ? this.token.substring(0, 10) + "..." : "none",
          user: this.user?.email,
        })

        return true
      }

      console.log("ℹ️ [AUTH] No hay autenticación almacenada")
      return false
    } catch (error) {
      console.error("❌ [AUTH] Error cargando autenticación:", error)
      return false
    }
  }

  isAuthenticated() {
    const authenticated = !!(this.token && this.user)
    console.log("🔐 [AUTH] Verificando autenticación:", {
      authenticated,
      hasToken: !!this.token,
      hasUser: !!this.user,
      userEmail: this.user?.email,
    })
    return authenticated
  }

  getToken() {
    return this.token
  }

  getUser() {
    return this.user
  }

  getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    console.log("📋 [AUTH] Generando headers:", {
      hasAuth: !!headers.Authorization,
      authType: headers.Authorization ? "Bearer" : "none",
    })

    return headers
  }
}

export default new AuthService()
