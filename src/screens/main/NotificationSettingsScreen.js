"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"

const NotificationSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    newDonations: true,
    reservations: true,
    messages: true,
    reminders: false,
    marketing: false,
    push: true,
    email: true,
    sms: false,
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      Alert.alert("Éxito", "Configuración guardada correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la configuración")
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const NotificationItem = ({ title, subtitle, value, onToggle, icon }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.gray300, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.gray500}
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Tipos de Notificación</Text>

          <NotificationItem
            title="Nuevas Donaciones"
            subtitle="Cuando hay donaciones disponibles cerca"
            value={settings.newDonations}
            onToggle={() => toggleSetting("newDonations")}
            icon="gift-outline"
          />

          <NotificationItem
            title="Reservas"
            subtitle="Confirmaciones y actualizaciones de reservas"
            value={settings.reservations}
            onToggle={() => toggleSetting("reservations")}
            icon="bookmark-outline"
          />

          <NotificationItem
            title="Mensajes"
            subtitle="Mensajes de otros usuarios"
            value={settings.messages}
            onToggle={() => toggleSetting("messages")}
            icon="chatbubble-outline"
          />

          <NotificationItem
            title="Recordatorios"
            subtitle="Recordatorios de recogida y fechas límite"
            value={settings.reminders}
            onToggle={() => toggleSetting("reminders")}
            icon="time-outline"
          />

          <NotificationItem
            title="Marketing"
            subtitle="Noticias y promociones de la app"
            value={settings.marketing}
            onToggle={() => toggleSetting("marketing")}
            icon="megaphone-outline"
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Métodos de Entrega</Text>

          <NotificationItem
            title="Notificaciones Push"
            subtitle="Notificaciones en tu dispositivo"
            value={settings.push}
            onToggle={() => toggleSetting("push")}
            icon="notifications-outline"
          />

          <NotificationItem
            title="Email"
            subtitle="Notificaciones por correo electrónico"
            value={settings.email}
            onToggle={() => toggleSetting("email")}
            icon="mail-outline"
          />

          <NotificationItem
            title="SMS"
            subtitle="Mensajes de texto (pueden aplicar tarifas)"
            value={settings.sms}
            onToggle={() => toggleSetting("sms")}
            icon="chatbox-outline"
          />
        </Card>

        <Card style={styles.warningCard}>
          <Ionicons name="warning-outline" size={24} color={colors.warning} />
          <Text style={styles.warningText}>
            Las notificaciones de reservas y mensajes importantes no se pueden desactivar para garantizar el buen
            funcionamiento de la app.
          </Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Guardando..." : "Guardar Configuración"}
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
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notificationSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
})

export default NotificationSettingsScreen
