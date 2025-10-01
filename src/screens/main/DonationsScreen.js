"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Badge from "../../components/common/Badge"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"

const DonationsScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")

  const loadDonations = async () => {
    try {
      setLoading(true)
      console.log("🔄 [DONATIONS_SCREEN] Cargando donaciones para usuario:", {
        id: user?.id,
        userType: user?.userType,
        filter,
      })

      let donationsData = []

      if (user?.userType === "donor") {
        // Para donantes: mostrar sus propias donaciones
        donationsData = await donationService.getMyDonations()
      } else {
        // Para organizaciones: mostrar donaciones disponibles Y las que han reservado
        const allDonations = await donationService.getDonations()
        donationsData = allDonations.filter(
          (donation) => donation.status === "available" || donation.reserved_by === user?.id,
        )
      }

      console.log("📋 [DONATIONS_SCREEN] Donaciones cargadas:", {
        total: donationsData.length,
        userType: user?.userType,
        sample: donationsData.slice(0, 2).map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          reserved_by: d.reserved_by,
          donor_confirmed: d.donor_confirmed,
          recipient_confirmed: d.recipient_confirmed,
        })),
      })

      // Aplicar filtro
      let filteredDonations = donationsData
      if (filter !== "all") {
        filteredDonations = donationsData.filter((donation) => donation.status === filter)
      }

      setDonations(filteredDonations)
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error cargando donaciones:", error)
      Alert.alert("Error", "No se pudieron cargar las donaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
  }, [filter])

  const handleReserve = async (donationId) => {
    try {
      console.log("🔄 [DONATIONS_SCREEN] Reservando donación:", donationId)
      await donationService.reserveDonation(donationId)
      Alert.alert("Éxito", "Donación reservada exitosamente")
      loadDonations() // Recargar lista
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error reservando:", error)
      Alert.alert("Error", error.message || "No se pudo reservar la donación")
    }
  }

  const handleConfirm = async (donationId) => {
    try {
      console.log("🔄 [DONATIONS_SCREEN] Confirmando donación:", donationId)
      await donationService.confirmDonation(donationId)
      Alert.alert("Éxito", "Confirmación registrada exitosamente")
      loadDonations() // Recargar lista
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error confirmando:", error)
      Alert.alert("Error", error.message || "No se pudo confirmar la donación")
    }
  }

  // NUEVA FUNCIÓN SIMPLE PARA VER EN MAPA
  const handleViewOnMap = (donation) => {
    console.log("🗺️ [DONATIONS_SCREEN] Navegando al mapa con donación:", donation.id)
    navigation.navigate("Map", {
      highlightDonation: {
        id: donation.id,
        title: donation.title,
        latitude: donation.pickup_latitude || donation.latitude,
        longitude: donation.pickup_longitude || donation.longitude,
        category: donation.category,
        description: donation.description,
      },
    })
  }

  const getCategoryColor = (category) => {
    return colors[category] || colors.other
  }

  const getCategoryLabel = (category) => {
    const categories = {
      bakery: "Panadería",
      dairy: "Lácteos",
      fruits: "Frutas y Verduras",
      meat: "Carnes",
      canned: "Enlatados",
      prepared: "Comida Preparada",
      other: "Otros",
    }
    return categories[category] || category
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "available":
        return "success"
      case "reserved":
        return "warning"
      case "completed":
        return "info"
      case "expired":
        return "error"
      default:
        return "default"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "reserved":
        return "Reservada"
      case "completed":
        return "Completada"
      case "expired":
        return "Expirada"
      default:
        return status
    }
  }

  const canReserve = (donation) => {
    return user?.userType === "organization" && donation.status === "available"
  }

  const canConfirm = (donation) => {
    if (donation.status !== "reserved") return false

    if (user?.userType === "donor") {
      return donation.donor_id === user?.id && !donation.donor_confirmed
    }

    if (user?.userType === "organization") {
      return donation.reserved_by === user?.id && !donation.recipient_confirmed
    }

    return false
  }

  const getConfirmationStatus = (donation) => {
    if (donation.status !== "reserved") return null

    const donorConfirmed = donation.donor_confirmed
    const recipientConfirmed = donation.recipient_confirmed

    if (donorConfirmed && recipientConfirmed) {
      return "Ambos confirmaron"
    } else if (donorConfirmed) {
      return "Donante confirmó"
    } else if (recipientConfirmed) {
      return "Organización confirmó"
    } else {
      return "Pendiente confirmación"
    }
  }

  // Verificar si la donación tiene coordenadas válidas
  const hasValidCoordinates = (donation) => {
    const lat = donation.pickup_latitude || donation.latitude
    const lng = donation.pickup_longitude || donation.longitude
    return lat && lng && !isNaN(Number.parseFloat(lat)) && !isNaN(Number.parseFloat(lng))
  }

  const renderDonation = ({ item: donation }) => (
    <Card style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle}>{donation.title}</Text>
        <Badge variant={getStatusBadgeVariant(donation.status)} size="small">
          {getStatusText(donation.status)}
        </Badge>
      </View>

      <Text style={styles.donationDescription} numberOfLines={2}>
        {donation.description}
      </Text>

      <View style={styles.donationInfo}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(donation.category) }]} />
          <Text style={styles.categoryText}>{getCategoryLabel(donation.category)}</Text>
        </View>

        <Text style={styles.quantityText}>Cantidad: {donation.quantity}</Text>
      </View>

      {donation.pickup_address && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {donation.pickup_address}
          </Text>
        </View>
      )}

      {/* Información de donante y receptor */}
      {donation.donor_name && (
        <View style={styles.userInfoContainer}>
          <Ionicons name="person-outline" size={16} color={colors.success} />
          <Text style={styles.userInfoText}>Donante: {donation.donor_name}</Text>
        </View>
      )}

      {donation.reserved_by && donation.status === "reserved" && (
        <View style={styles.userInfoContainer}>
          <Ionicons name="business-outline" size={16} color={colors.warning} />
          <Text style={styles.userInfoText}>
            Reservada por: {donation.reserved_by === user?.id ? user?.name : "Organización"}
          </Text>
        </View>
      )}

      {/* Estado de confirmación */}
      {donation.status === "reserved" && (
        <View style={styles.confirmationStatus}>
          <Text style={styles.confirmationText}>{getConfirmationStatus(donation)}</Text>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        {/* BOTÓN VER EN MAPA - SIMPLE */}
        {hasValidCoordinates(donation) && (
          <TouchableOpacity style={styles.mapButton} onPress={() => handleViewOnMap(donation)}>
            <Ionicons name="map-outline" size={16} color={colors.primary} />
            <Text style={styles.mapButtonText}>Ver en mapa</Text>
          </TouchableOpacity>
        )}

        {canReserve(donation) && (
          <Button
            title="Reservar"
            onPress={() => handleReserve(donation.id)}
            size="small"
            style={styles.actionButton}
          />
        )}

        {canConfirm(donation) && (
          <Button
            title="Confirmar entrega"
            onPress={() => handleConfirm(donation.id)}
            size="small"
            variant="outline"
            style={styles.actionButton}
          />
        )}
      </View>
    </Card>
  )

  const filterOptions = [
    { key: "all", label: "Todas" },
    { key: "available", label: "Disponibles" },
    { key: "reserved", label: "Reservadas" },
    { key: "completed", label: "Completadas" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {user?.userType === "donor" ? "Mis Donaciones" : "Donaciones Disponibles"}
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterButton, filter === option.key && styles.filterButtonActive]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de donaciones */}
      <FlatList
        data={donations}
        renderItem={renderDonation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDonations} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No hay donaciones</Text>
            <Text style={styles.emptyText}>
              {user?.userType === "donor"
                ? "Aún no has creado ninguna donación"
                : "No hay donaciones disponibles en este momento"}
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.xl,
  },
  donationCard: {
    marginBottom: spacing.lg,
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  donationTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  donationDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  donationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  quantityText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  addressText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  confirmationStatus: {
    backgroundColor: colors.gray50,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  confirmationText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    minWidth: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  emptyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  // NUEVOS ESTILOS PARA BOTÓN DE MAPA
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight + "20",
    borderRadius: 6,
    marginRight: "auto", // Empuja los otros botones a la derecha
  },
  mapButtonText: {
    fontSize: typography.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.medium,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  userInfoText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: typography.medium,
  },
})

export default DonationsScreen
