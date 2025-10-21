"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors, typography, spacing } from "../../styles"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import authService from "../../services/authService"

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1) // 1: email, 2: código y nueva contraseña
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu email")
      return
    }

    try {
      setLoading(true)
      await authService.forgotPassword(email)

      Alert.alert("Código enviado", "Revisa tu email para obtener el código de recuperación (también revisa spam)", [
        { text: "OK", onPress: () => setStep(2) },
      ])
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo enviar el código")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setLoading(true)
      await authService.resetPassword(email, code, newPassword)

      Alert.alert("¡Éxito!", "Tu contraseña ha sido actualizada", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ])
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo restablecer la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Ingresa tu email y te enviaremos un código de recuperación"
                : "Ingresa el código que recibiste y tu nueva contraseña"}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              <>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="tu@email.com"
                />

                <Button title="Enviar código" onPress={handleRequestCode} loading={loading} style={styles.button} />
              </>
            ) : (
              <>
                <Input
                  label="Código de recuperación"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  placeholder="123456"
                  maxLength={6}
                />

                <Input
                  label="Nueva contraseña"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Mínimo 6 caracteres"
                />

                <Input
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Repite tu contraseña"
                />

                <Button
                  title="Restablecer contraseña"
                  onPress={handleResetPassword}
                  loading={loading}
                  style={styles.button}
                />

                <Button title="Volver a solicitar código" onPress={() => setStep(1)} variant="outline" />
              </>
            )}

            <Button title="Volver al login" onPress={() => navigation.navigate("Login")} variant="outline" />
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
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
    lineHeight: typography.lineHeight.relaxed * typography.base,
  },
  form: {
    gap: spacing.lg,
  },
  button: {
    marginTop: spacing.lg,
  },
})

export default ForgotPasswordScreen
