"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../contexts/AuthContext"
import { colors, typography, spacing } from "../../styles"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "donor",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone, userType, address } = formData

    if (!name || !email || !password || !phone) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setLoading(true)
      await register({
        name,
        email,
        password,
        phone,
        userType,
        address,
      })
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad de donantes</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre completo"
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              placeholder="Tu nombre completo"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="tu@email.com"
            />

            <Input
              label="Teléfono"
              value={formData.phone}
              onChangeText={(value) => updateFormData("phone", value)}
              keyboardType="phone-pad"
              placeholder="+34 123 456 789"
            />

            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>Tipo de usuario</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[styles.userTypeButton, formData.userType === "donor" && styles.userTypeButtonActive]}
                  onPress={() => updateFormData("userType", "donor")}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      formData.userType === "donor" && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Donante
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.userTypeButton, formData.userType === "organization" && styles.userTypeButtonActive]}
                  onPress={() => updateFormData("userType", "organization")}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      formData.userType === "organization" && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Organización
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="Dirección (opcional)"
              value={formData.address}
              onChangeText={(value) => updateFormData("address", value)}
              placeholder="Tu dirección"
              multiline
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
            />

            <Input
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              secureTextEntry
              placeholder="Repite tu contraseña"
            />

            <Button title="Crear Cuenta" onPress={handleRegister} loading={loading} style={styles.registerButton} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.footerLink} onPress={() => navigation.navigate("Login")}>
                Inicia sesión
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  userTypeContainer: {
    marginBottom: spacing.lg,
  },
  userTypeLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  userTypeButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  userTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userTypeButtonText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  userTypeButtonTextActive: {
    color: colors.white,
    fontWeight: typography.medium,
  },
  registerButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: typography.medium,
  },
})

export default RegisterScreen
