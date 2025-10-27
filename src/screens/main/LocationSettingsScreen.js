"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"

const LocationSettingsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubicación</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mensaje temporal */}
      <View style={styles.center}>
        <Text style={styles.text}>🚧 En construcción 🚧</Text>
        <Text style={styles.subtext}>Estamos trabajando en esta sección.</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  text: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  subtext: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
})

export default LocationSettingsScreen
