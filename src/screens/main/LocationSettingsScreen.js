"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

const LocationSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState({
    address: "Calle 123 #45-67, Bogotá",
    latitude: "4.6097",
    longitude: "-74.0817",
    radius: "5",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      Alert.alert("Éxito", "Ubicación actualizada correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la ubicación")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    Alert.alert("Obtener Ubicación", "¿Deseas usar tu ubicación actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí",
        onPress: () => {
          // Simular obtención de ubicación
          setLocationData({
            ...locationData,
            address: "Mi ubicación actual",
            latitude: "4.6097",
            longitude: "-74.0817",
          })
          Alert.alert("Éxito", "Ubicación obtenida correctamente")
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubicación</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ubicación Principal</Text>

          <Input
            label="Dirección"
            value={locationData.address}
            onChangeText={(text) => setLocationData({ ...locationData, address: text })}
            placeholder="Ingresa tu dirección"
            leftIcon="location-outline"
          />

          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateInput}>
              <Input
                label="Latitud"
                value={locationData.latitude}
                onChangeText={(text) => setLocationData({ ...locationData, latitude: text })}
                placeholder="4.6097"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Input
                label="Longitud"
                value={locationData.longitude}
                onChangeText={(text) => setLocationData({ ...locationData, longitude: text })}
                placeholder="-74.0817"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Ionicons name="locate" size={20} color={colors.primary} />
            <Text style={styles.locationButtonText}>Usar mi ubicación actual</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Preferencias de Búsqueda</Text>

          <Input
            label="Radio de búsqueda (km)"
            value={locationData.radius}
            onChangeText={(text) => setLocationData({ ...locationData, radius: text })}
            placeholder="5"
            keyboardType="numeric"
            leftIcon="radio-outline"
          />

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Este radio determina qué tan lejos buscar donaciones disponibles desde tu ubicación.
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Vista del Mapa</Text>

          <View style={styles.mapPreview}>
            <Ionicons name="map" size={48} color={colors.gray400} />
            <Text style={styles.mapPreviewText}>Vista previa del mapa</Text>
            <Text style={styles.mapPreviewSubtext}>{locationData.address}</Text>
          </View>

          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.mapButtonText}>Ver en mapa completo</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Guardando..." : "Guardar Ubicación"}
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
  section: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  coordinatesRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  coordinateInput: {
    flex: 1,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  locationButtonText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
    marginLeft: spacing.sm,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.infoLight,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  mapPreview: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  mapPreviewText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: typography.medium,
  },
  mapPreviewSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.md,
  },
  mapButtonText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
})

export default LocationSettingsScreen
