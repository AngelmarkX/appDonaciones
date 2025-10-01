"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Badge from "../../components/common/Badge"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"
import { useAuth } from "../../contexts/AuthContext"
import { formatDate, getDaysUntilExpiry } from "../../utils/dateUtils"
import { calculateDistance, formatDistance } from "../../utils/locationUtils"

const MapScreenSimple = () => {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)

  useEffect(() => {
    requestLocationPermission()
    loadDonations()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        setLocationPermission(true)
        getCurrentLocation()
      }
    } catch (error) {
      console.error("Error requesting location permission:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (error) {
      console.error("Error getting current location:", error)
    }
  }

  const loadDonations = async () => {
    try {
      setLoading(true)
      const data = await donationService.getDonations({ status: "available" })

      // Procesar donaciones con coordenadas
      const donationsWithCoords = data.map((donation) => {
        let latitude = Number.parseFloat(donation.pickup_latitude)
        let longitude = Number.parseFloat(donation.pickup_longitude)

        // Si no hay coordenadas válidas, generar coordenadas simuladas alrededor de Pereira
        if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
          latitude = 4.8133 + (Math.random() - 0.5) * 0.1
          longitude = -75.6961 + (Math.random() - 0.5) * 0.1
        }

        return {
          ...donation,
          latitude,
          longitude,
        }
      })

      setDonations(donationsWithCoords)
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las donaciones")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    return colors[category] || colors.other
  }

  const getCategoryIcon = (category) => {
    const icons = {
      bakery: "🥖",
      dairy: "🥛",
      fruits: "🍎",
      meat: "🥩",
      canned: "🥫",
      prepared: "🍱",
      other: "📦",
    }
    return icons[category] || "📦"
  }

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

  const getDistanceFromUser = (donation) => {
    if (!userLocation) return null

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      donation.latitude,
      donation.longitude,
    )

    return distance
  }

  const handleReserveDonation = async (donationId) => {
    try {
      Alert.alert("Reservar Donación", "¿Estás seguro de que quieres reservar esta donación?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reservar",
          onPress: async () => {
            try {
              await donationService.reserveDonation(donationId)
              Alert.alert("Éxito", "Donación reservada exitosamente")
              loadDonations()
            } catch (error) {
              Alert.alert("Error", error.message)
            }
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la reserva")
    }
  }

  const renderDonation = ({ item }) => {
    const distance = getDistanceFromUser(item)
    const daysUntilExpiry = item.expiry_date ? getDaysUntilExpiry(item.expiry_date) : null

    return (
      <Card style={styles.donationCard}>
        <View style={styles.donationHeader}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          </View>
          <View style={styles.donationInfo}>
            <Text style={styles.donationTitle}>{item.title}</Text>
            <Badge variant="success" size="small">
              Disponible
            </Badge>
          </View>
          {distance && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.donationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.donationDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Cantidad: {item.quantity}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Categoría: {getCategoryLabel(item.category)}</Text>
          </View>

          {item.expiry_date && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
              <Text style={[styles.detailText, daysUntilExpiry <= 1 && styles.urgentText]}>
                Caduca: {formatDate(item.expiry_date)}
                {daysUntilExpiry !== null && (
                  <Text style={styles.daysText}>
                    {daysUntilExpiry <= 0 ? " (Expirado)" : ` (${daysUntilExpiry} días)`}
                  </Text>
                )}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.pickup_address}
            </Text>
          </View>

          {item.donor_name && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={colors.primary} />
              <Text style={styles.donorText}>Por: {item.donor_name}</Text>
            </View>
          )}
        </View>

        <View style={styles.donationActions}>
          <Button
            title="Ver Detalles"
            variant="outline"
            size="small"
            onPress={() => Alert.alert("Próximamente", "Vista de detalles completos")}
            style={styles.actionButton}
          />
          <Button
            title="Reservar"
            size="small"
            onPress={() => handleReserveDonation(item.id)}
            style={styles.actionButton}
          />
        </View>
      </Card>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donaciones Disponibles</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDonations}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          {locationPermission && (
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Ionicons name="locate" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando donaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={donations}
          renderItem={renderDonation}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={64} color={colors.gray400} />
              <Text style={styles.emptyText}>No hay donaciones disponibles</Text>
              <Button title="Recargar" onPress={loadDonations} variant="outline" style={styles.reloadButton} />
            </View>
          }
        />
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll}>
          {[
            { id: "bakery", label: "Panadería", icon: "🥖" },
            { id: "dairy", label: "Lácteos", icon: "🥛" },
            { id: "fruits", label: "Frutas y Verduras", icon: "🍎" },
            { id: "meat", label: "Carnes", icon: "🥩" },
            { id: "canned", label: "Enlatados", icon: "🥫" },
            { id: "prepared", label: "Comida Preparada", icon: "🍱" },
            { id: "other", label: "Otros", icon: "📦" },
          ].map((category) => (
            <View key={category.id} style={styles.legendItem}>
              <View style={[styles.legendMarker, { borderColor: getCategoryColor(category.id) }]}>
                <Text style={styles.legendIcon}>{category.icon}</Text>
              </View>
              <Text style={styles.legendLabel}>{category.label}</Text>
            </View>
          ))}
        </ScrollView>
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
  refreshButton: {
    padding: spacing.sm,
  },
  locationButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: spacing.xl,
  },
  donationCard: {
    marginBottom: spacing.lg,
  },
  donationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
  },
  donationInfo: {
    flex: 1,
  },
  donationTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  distanceContainer: {
    alignItems: "center",
  },
  distanceText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.primary,
  },
  donationDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.base,
    marginBottom: spacing.md,
  },
  donationDetails: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    textTransform: "capitalize",
  },
  urgentText: {
    color: colors.error,
  },
  daysText: {
    fontSize: typography.xs,
    color: colors.textLight,
  },
  donorText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
    marginLeft: spacing.sm,
  },
  donationActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  reloadButton: {
    marginTop: spacing.lg,
  },
  legend: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  legendScroll: {
    paddingHorizontal: spacing.xl,
  },
  legendItem: {
    alignItems: "center",
    marginRight: spacing.lg,
  },
  legendMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  legendIcon: {
    fontSize: 12,
  },
  legendLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
})

export default MapScreenSimple
