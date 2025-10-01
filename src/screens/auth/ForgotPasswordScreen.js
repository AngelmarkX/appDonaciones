"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors, typography, spacing } from "../../styles"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu email")
      return
    }

    try {
      setLoading(true)
      // Simular envío de email
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Alert.alert("Email enviado", "Te hemos enviado un enlace para restablecer tu contraseña", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el email")
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
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="tu@email.com"
            />

            <Button title="Enviar enlace" onPress={handleResetPassword} loading={loading} style={styles.resetButton} />

            <Button title="Volver" onPress={() => navigation.goBack()} variant="outline" />
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
  resetButton: {
    marginTop: spacing.lg,
  },
})

export default ForgotPasswordScreen
