"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("🔄 [CONTEXT] Verificando estado de autenticación...")

        // Cargar autenticación almacenada
        const hasStoredAuth = await authService.loadStoredAuth()

        if (hasStoredAuth) {
          const currentUser = authService.getUser()
          const currentToken = authService.getToken()

          console.log("📊 [CONTEXT] Estado cargado:", {
            hasUser: !!currentUser,
            hasToken: !!currentToken,
            userEmail: currentUser?.email,
          })

          if (currentUser && currentToken) {
            setUser(currentUser)
            console.log("✅ [CONTEXT] Usuario autenticado restaurado")
          }
        } else {
          console.log("ℹ️ [CONTEXT] No hay autenticación almacenada")
        }
      } catch (error) {
        console.error("❌ [CONTEXT] Error verificando autenticación:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log("🔄 [CONTEXT] Iniciando login...")

      const response = await authService.login(email, password)
      setUser(response.user)

      console.log("✅ [CONTEXT] Login exitoso, usuario establecido")
      return response
    } catch (error) {
      console.error("❌ [CONTEXT] Error en login:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      console.log("🔄 [CONTEXT] Iniciando registro...")

      const response = await authService.register(userData)
      setUser(response.user)

      console.log("✅ [CONTEXT] Registro exitoso, usuario establecido")
      return response
    } catch (error) {
      console.error("❌ [CONTEXT] Error en registro:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("🔄 [CONTEXT] Cerrando sesión...")

      await authService.logout()
      setUser(null)

      console.log("✅ [CONTEXT] Sesión cerrada, usuario limpiado")
    } catch (error) {
      console.error("❌ [CONTEXT] Error cerrando sesión:", error)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
