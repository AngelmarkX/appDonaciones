"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useNotifications } from "../../contexts/NotificationContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Badge from "../../components/common/Badge"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth()
  const { getUnreadCount } = useNotifications()
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
  })
  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, donationsData] = await Promise.all([
        donationService.getStats(),
        donationService.getMyDonations(),
      ])

      setStats(statsData)
      setRecentDonations(donationsData.slice(0, 3)) // Últimas 3 donaciones
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: logout },
    ])
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

  // FUNCIÓN MEJORADA PARA MOSTRAR DETALLES
  const showDonationDetails = (donation) => {
    console.log("🔍 [DASHBOARD] Datos de donación:", donation)

    const formatDate = (dateString) => {
      if (!dateString) return "No especificada"

      try {
        // Intentar diferentes formatos de fecha
        let date
        if (dateString.includes("T")) {
          // Formato ISO: 2024-05-20T00:00:00.000Z
          date = new Date(dateString)
        } else if (dateString.includes("-")) {
          // Formato YYYY-MM-DD
          date = new Date(dateString + "T00:00:00")
        } else {
          // Otros formatos
          date = new Date(dateString)
        }

        if (isNaN(date.getTime())) {
          console.log("⚠️ [DASHBOARD] Fecha inválida:", dateString)
          return "Fecha inválida"
        }

        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      } catch (error) {
        console.error("❌ [DASHBOARD] Error formateando fecha:", error)
        return "Error en fecha"
      }
    }

    // Revisar todos los posibles campos de fecha
    const expiryDate = donation.expiry_date || donation.expiration_date || donation.expires_at || donation.expire_date
    console.log("📅 [DASHBOARD] Campo de fecha encontrado:", expiryDate)

    const details = [
      `📅 Expira: ${formatDate(expiryDate)}`,
      `📦 Cantidad: ${donation.quantity || "No especificada"}`,
      `🏷️ Categoría: ${getCategoryLabel(donation.category)}`,
      donation.donor_name ? `👤 Donante: ${donation.donor_name}` : null,
      donation.reserved_by && donation.status === "reserved"
        ? `🏢 Reservada por: ${donation.reserved_by === user?.id ? user?.name : "Organización"}`
        : null,
      donation.pickup_address ? `📍 Dirección: ${donation.pickup_address}` : null,
    ]
      .filter(Boolean)
      .join("\n\n")

    Alert.alert(donation.title, `${donation.description}\n\n${details}`, [
      { text: "Cerrar", style: "cancel" },
      { text: "Ver todas", onPress: () => navigation.navigate("Donations") },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboardData} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
              {getUnreadCount() > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{getUnreadCount()}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donaciones</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeDonations}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedDonations}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          {user?.userType === "donor" ? (
            <Button
              title="Nueva Donación"
              onPress={() => navigation.navigate("CreateDonation")}
              style={styles.actionButton}
              icon="add-circle-outline"
            />
          ) : (
            <Button
              title="Ver Donaciones Disponibles"
              onPress={() => navigation.navigate("Map")}
              style={styles.actionButton}
              icon="map-outline"
            />
          )}
        </View>

        {/* Recent Donations */}
        {user?.userType === "donor" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Donaciones Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Donations")}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {recentDonations.length > 0 ? (
              recentDonations.map((donation) => (
                <TouchableOpacity key={donation.id} onPress={() => showDonationDetails(donation)} activeOpacity={0.7}>
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

                    {/* Información de usuario */}
                    <View style={styles.donationUsers}>
                      {donation.donor_name && (
                        <Text style={styles.donorText}>
                          <Ionicons name="person" size={14} color={colors.success} /> {donation.donor_name}
                        </Text>
                      )}
                      {donation.reserved_by && donation.status === "reserved" && (
                        <Text style={styles.recipientText}>
                          <Ionicons name="business" size={14} color={colors.warning} />
                          {donation.reserved_by === user?.id ? ` Reservada por ${user?.name}` : " Reservada"}
                        </Text>
                      )}
                    </View>

                    <View style={styles.donationFooter}>
                      <View style={styles.categoryContainer}>
                        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(donation.category) }]} />
                        <Text style={styles.categoryText}>{getCategoryLabel(donation.category)}</Text>
                      </View>

                      <Text style={styles.quantityText}>Cantidad: {donation.quantity}</Text>
                    </View>

                    {/* Indicador de que es clickeable */}
                    <View style={styles.clickIndicator}>
                      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tienes donaciones recientes</Text>
                <Button
                  title="Crear primera donación"
                  onPress={() => navigation.navigate("CreateDonation")}
                  variant="outline"
                  size="small"
                  style={styles.emptyButton}
                />
              </Card>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos</Text>
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color={colors.warning} />
              <Text style={styles.tipTitle}>Tip del día</Text>
            </View>
            <Text style={styles.tipText}>
              {user?.userType === "donor"
                ? "Asegúrate de indicar la fecha de caducidad correcta para ayudar a las organizaciones a planificar mejor."
                : "Revisa regularmente el mapa para encontrar nuevas donaciones cerca de tu ubicación."}
            </Text>
          </Card>
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
  scrollView: {
    flex: 1,
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
  greeting: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notificationButton: {
    position: "relative",
    padding: spacing.sm,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
  },
  statNumber: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  actionButton: {
    marginTop: spacing.md,
  },
  donationCard: {
    marginBottom: spacing.md,
    position: "relative",
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
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  tipCard: {
    backgroundColor: colors.gray50,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  tipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  donationUsers: {
    marginBottom: spacing.sm,
  },
  donorText: {
    fontSize: typography.xs,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  recipientText: {
    fontSize: typography.xs,
    color: colors.warning,
  },
  clickIndicator: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
})

export default DashboardScreen
