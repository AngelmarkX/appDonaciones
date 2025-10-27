"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import authService from "../../services/authService"

const EditProfileScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("[v0] Fetching complete profile data...")
        const response = await fetch(`https://backend-production-b28f.up.railway.app/api/users/profile`, {
          method: "GET",
          headers: authService.getAuthHeaders(),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Profile data fetched:", data)

          if (data.user) {
            setFormData({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              address: data.user.address || "",
            })
          }
        } else {
          console.log("[v0] Failed to fetch profile, using context data")
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      console.log("🔄 [EDIT_PROFILE] Actualizando perfil:", {
        phone: formData.phone,
        address: formData.address,
      })

      const response = await fetch(`https://backend-production-b28f.up.railway.app/api/users/profile`, {
        method: "PUT",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando perfil")
      }

      console.log("✅ [EDIT_PROFILE] Perfil actualizado:", data)

      Alert.alert("Éxito", "Perfil actualizado correctamente", [{ text: "OK", onPress: () => navigation.goBack() }])
    } catch (error) {
      console.error("❌ [EDIT_PROFILE] Error:", error)
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.formCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{formData.name?.charAt(0)?.toUpperCase() || "U"}</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre"
              value={formData.name}
              placeholder="Nombre"
              leftIcon="person-outline"
              editable={false}
              style={styles.disabledInput}
            />

            <Input
              label="Email"
              value={formData.email}
              placeholder="tu@email.com"
              leftIcon="mail-outline"
              editable={false}
              style={styles.disabledInput}
            />

            <Input
              label="Teléfono"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+57 300 123 4567"
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />

            <Input
              label="Dirección"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Calle 123 #45-67"
              leftIcon="location-outline"
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Guardando..." : "Guardar Cambios"}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography["3xl"],
    fontWeight: typography.bold,
    color: colors.white,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  changePhotoText: {
    fontSize: typography.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.medium,
  },
  form: {
    gap: spacing.lg,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  disabledInput: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.6,
  },
})

export default EditProfileScreen
