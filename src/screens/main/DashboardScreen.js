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
    reservedDonations: 0,
    totalWeight: 0,
    pendingConfirmations: 0,
  })
  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, donationsData, allDonations] = await Promise.all([
        donationService.getStats(),
        donationService.getMyDonations(),
        donationService.getDonations(),
      ])

      let reserved = 0
      let totalWeight = 0
      let pendingConfirmations = 0

      if (user?.userType === "donor") {
        reserved = donationsData.filter((d) => d.status === "reserved").length
        totalWeight = donationsData.reduce((sum, d) => sum + (Number.parseFloat(d.weight) || 0), 0)
        pendingConfirmations = donationsData.filter((d) => d.status === "reserved" && !d.donor_confirmed_at).length
      } else {
        const myReservedDonations = allDonations.filter((d) => d.reserved_by === user?.id)
        reserved = myReservedDonations.filter((d) => d.status === "reserved").length
        totalWeight = myReservedDonations.reduce((sum, d) => sum + (Number.parseFloat(d.weight) || 0), 0)
        pendingConfirmations = myReservedDonations.filter(
          (d) => d.status === "reserved" && !d.recipient_confirmed_at,
        ).length
      }

      setStats({
        ...statsData,
        reservedDonations: reserved,
        totalWeight: totalWeight,
        pendingConfirmations: pendingConfirmations,
      })
      setRecentDonations(donationsData.slice(0, 3))
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
      // Alimentos
      bakery: "Panadería",
      dairy: "Lácteos",
      fruits: "Frutas y Verduras",
      vegetables: "Verduras",
      meat: "Carnes",
      canned: "Enlatados",
      prepared: "Comida Preparada",
      beverages: "Bebidas",
      grains: "Granos y Cereales",
      snacks: "Snacks",
      // Objetos generales
      clothing: "Ropa",
      furniture: "Muebles",
      electronics: "Electrónicos",
      books: "Libros",
      toys: "Juguetes",
      sports: "Deportes",
      tools: "Herramientas",
      kitchenware: "Utensilios de Cocina",
      hygiene: "Higiene Personal",
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

  const showDonationDetails = (donation) => {
    console.log("🔍 [DASHBOARD] Datos de donación:", donation)

    const formatDate = (dateString) => {
      if (!dateString) return "No especificada"

      try {
        let date
        if (dateString.includes("T")) {
          date = new Date(dateString)
        } else if (dateString.includes("-")) {
          date = new Date(dateString + "T00:00:00")
        } else {
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
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Bienvenido de nuevo</Text>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userType}>
                {user?.userType === "donor" ? "Comercio Donante" : "Organización Receptora"}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
                <View style={styles.iconCircle}>
                  <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                  {getUnreadCount() > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{getUnreadCount()}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <View style={[styles.iconCircle, styles.logoutCircle]}>
                  <Ionicons name="log-out-outline" size={22} color={colors.error} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Resumen General</Text>

          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, styles.mainStatCard]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="gift" size={32} color={colors.white} />
              </View>
              <Text style={styles.mainStatNumber}>{stats.totalDonations}</Text>
              <Text style={styles.mainStatLabel}>
                {user?.userType === "donor" ? "Donaciones Creadas" : "Donaciones Totales"}
              </Text>
            </Card>

            <View style={styles.secondaryStatsContainer}>
              <Card style={styles.secondaryStatCard}>
                <View style={[styles.statBadge, { backgroundColor: colors.success + "20" }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.secondaryStatNumber}>{stats.activeDonations}</Text>
                <Text style={styles.secondaryStatLabel}>Activas</Text>
              </Card>

              <Card style={styles.secondaryStatCard}>
                <View style={[styles.statBadge, { backgroundColor: colors.warning + "20" }]}>
                  <Ionicons name="time" size={20} color={colors.warning} />
                </View>
                <Text style={styles.secondaryStatNumber}>{stats.reservedDonations}</Text>
                <Text style={styles.secondaryStatLabel}>Reservadas</Text>
              </Card>

              <Card style={styles.secondaryStatCard}>
                <View style={[styles.statBadge, { backgroundColor: colors.info + "20" }]}>
                  <Ionicons name="checkmark-done" size={20} color={colors.info} />
                </View>
                <Text style={styles.secondaryStatNumber}>{stats.completedDonations}</Text>
                <Text style={styles.secondaryStatLabel}>Completadas</Text>
              </Card>

              <Card style={styles.secondaryStatCard}>
                <View style={[styles.statBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name="scale" size={20} color={colors.primary} />
                </View>
                <Text style={styles.secondaryStatNumber}>{stats.totalWeight.toFixed(1)} kg</Text>
                <Text style={styles.secondaryStatLabel}>Peso Total</Text>
              </Card>
            </View>
          </View>

          {stats.pendingConfirmations > 0 && (
            <Card style={styles.alertCard}>
              <View style={styles.alertContent}>
                <View style={styles.alertIcon}>
                  <Ionicons name="alert-circle" size={24} color={colors.warning} />
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>Confirmaciones Pendientes</Text>
                  <Text style={styles.alertDescription}>
                    Tienes {stats.pendingConfirmations} {stats.pendingConfirmations === 1 ? "donación" : "donaciones"}{" "}
                    esperando tu confirmación
                  </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Donations")}>
                  <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          <View style={styles.quickActionsGrid}>
            {user?.userType === "donor" ? (
              <>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate("CreateDonation")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.success + "20" }]}>
                    <Ionicons name="add-circle" size={28} color={colors.success} />
                  </View>
                  <Text style={styles.quickActionTitle}>Nueva Donación</Text>
                  <Text style={styles.quickActionDescription}>Crear una nueva publicación</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate("Donations")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="list" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Mis Donaciones</Text>
                  <Text style={styles.quickActionDescription}>Ver todas mis publicaciones</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate("Map")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="map" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.quickActionTitle}>Ver Mapa</Text>
                  <Text style={styles.quickActionDescription}>Buscar donaciones cercanas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate("Donations")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.success + "20" }]}>
                    <Ionicons name="gift" size={28} color={colors.success} />
                  </View>
                  <Text style={styles.quickActionTitle}>Mis Reservas</Text>
                  <Text style={styles.quickActionDescription}>Ver donaciones reservadas</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {user?.userType === "donor" ? "Donaciones Recientes" : "Actividad Reciente"}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Donations")}>
              <Text style={styles.seeAllText}>Ver todas →</Text>
            </TouchableOpacity>
          </View>

          {recentDonations.length > 0 ? (
            recentDonations.map((donation) => (
              <TouchableOpacity key={donation.id} onPress={() => showDonationDetails(donation)} activeOpacity={0.7}>
                <Card style={styles.donationCard}>
                  <View style={styles.donationHeader}>
                    <View style={styles.donationTitleContainer}>
                      <Text style={styles.donationTitle}>{donation.title}</Text>
                      <View style={styles.donationMeta}>
                        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(donation.category) }]} />
                        <Text style={styles.categoryText}>{getCategoryLabel(donation.category)}</Text>
                      </View>
                    </View>
                    <Badge variant={getStatusBadgeVariant(donation.status)} size="small">
                      {getStatusText(donation.status)}
                    </Badge>
                  </View>

                  <Text style={styles.donationDescription} numberOfLines={2}>
                    {donation.description}
                  </Text>

                  <View style={styles.donationInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>{donation.quantity} unidades</Text>
                    </View>
                    {donation.weight && (
                      <View style={styles.infoItem}>
                        <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{donation.weight} kg</Text>
                      </View>
                    )}
                    {donation.expiry_date && (
                      <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>
                          {new Date(donation.expiry_date).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.clickIndicator}>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="file-tray-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyText}>
                {user?.userType === "donor" ? "No tienes donaciones recientes" : "No tienes actividad reciente"}
              </Text>
              <Button
                title={user?.userType === "donor" ? "Crear primera donación" : "Buscar donaciones"}
                onPress={() => navigation.navigate(user?.userType === "donor" ? "CreateDonation" : "Map")}
                variant="outline"
                size="small"
                style={styles.emptyButton}
              />
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consejos Útiles</Text>
          <Card style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="bulb" size={24} color={colors.warning} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Tip del día</Text>
              <Text style={styles.tipText}>
                {user?.userType === "donor"
                  ? "Asegúrate de indicar la fecha de caducidad correcta y el peso aproximado para ayudar a las organizaciones a planificar mejor la recogida."
                  : "Revisa regularmente el mapa para encontrar nuevas donaciones cerca de tu ubicación. Confirma las reservas a tiempo para ayudar a los comercios."}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userType: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoutCircle: {
    backgroundColor: colors.error + "15",
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  logoutButton: {},
  statsSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  statsSectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    gap: spacing.md,
  },
  mainStatCard: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: "center",
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  mainStatNumber: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  mainStatLabel: {
    fontSize: typography.base,
    color: colors.white,
    textAlign: "center",
    opacity: 0.9,
  },
  secondaryStatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  secondaryStatCard: {
    flex: 1,
    minWidth: "47%",
    padding: spacing.lg,
    alignItems: "center",
    borderRadius: 12,
  },
  statBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  secondaryStatNumber: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  secondaryStatLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  alertCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.warning + "10",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  alertDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
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
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  quickActionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  quickActionDescription: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  donationCard: {
    marginBottom: spacing.md,
    position: "relative",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  donationTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  donationTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  donationMeta: {
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
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  donationDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  donationInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  clickIndicator: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    transform: [{ translateY: -9 }],
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
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
    flexDirection: "row",
    backgroundColor: colors.warning + "10",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: 12,
    padding: spacing.lg,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
})

export default DashboardScreen
