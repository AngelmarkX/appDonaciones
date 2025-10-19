"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Badge from "../../components/common/Badge"
import pdfExportService from "../../services/pdfExportService"

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: logout },
    ])
  }

  const handleExportPDF = async () => {
    try {
      Alert.alert("Exportando...", "Generando tu historial de donaciones en PDF")
      await pdfExportService.exportDonationHistory()
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF: " + error.message)
    }
  }

  const menuItems = [
    {
      icon: "person-outline",
      title: "Editar Perfil",
      subtitle: "Actualiza tu información personal",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "calendar-outline",
      title: "Días de Donación",
      subtitle:
        user?.userType === "donor"
          ? "Configura tus días disponibles para donar"
          : "Configura tus días disponibles para recibir",
      onPress: () => navigation.navigate("DonationDays"),
    },
    {
      icon: "download-outline",
      title: "Exportar Historial PDF",
      subtitle: "Descarga tu historial de donaciones",
      onPress: handleExportPDF,
    },
    {
      icon: "notifications-outline",
      title: "Notificaciones",
      subtitle: "Configura tus preferencias",
      onPress: () => navigation.navigate("NotificationSettings"),
    },
    {
      icon: "location-outline",
      title: "Ubicación",
      subtitle: "Gestiona tu ubicación",
      onPress: () => navigation.navigate("LocationSettings"),
    },
    {
      icon: "help-circle-outline",
      title: "Ayuda y Soporte",
      subtitle: "Obtén ayuda o contacta soporte",
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: "information-circle-outline",
      title: "Acerca de",
      subtitle: "Información de la aplicación",
      onPress: () => navigation.navigate("About"),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>

              <Badge
                variant={user?.userType === "donor" ? "primary" : "info"}
                size="small"
                style={styles.userTypeBadge}
              >
                {user?.userType === "donor" ? "Donante" : "Organización"}
              </Badge>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={24} color={colors.textSecondary} />
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
  profileCard: {
    margin: spacing.xl,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userTypeBadge: {
    alignSelf: "flex-start",
  },
  menuSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.error,
    marginLeft: spacing.sm,
  },
})

export default ProfileScreen
