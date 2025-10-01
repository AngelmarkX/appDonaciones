import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNotifications } from "../../contexts/NotificationContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import { getRelativeTime } from "../../utils/dateUtils"

const NotificationsScreen = () => {
  const { notifications, markAsRead, clearAll } = useNotifications()

  const renderNotification = ({ item }) => (
    <TouchableOpacity onPress={() => markAsRead(item.id)}>
      <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Ionicons name={getNotificationIcon(item.type)} size={20} color={colors.primary} />
          </View>

          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>

            <Text style={styles.notificationMessage}>{item.message}</Text>

            <Text style={styles.notificationTime}>{getRelativeTime(item.timestamp)}</Text>
          </View>

          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  )

  const getNotificationIcon = (type) => {
    switch (type) {
      case "donation_created":
        return "gift-outline"
      case "donation_reserved":
        return "bookmark-outline"
      case "donation_completed":
        return "checkmark-circle-outline"
      default:
        return "notifications-outline"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAllText}>Limpiar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
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
  clearAllText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  listContainer: {
    padding: spacing.xl,
  },
  notificationCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
  },
  unreadCard: {
    borderLeftColor: colors.primary,
    backgroundColor: colors.primaryLight + "10",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: typography.semibold,
  },
  notificationMessage: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.sm,
    marginBottom: spacing.sm,
  },
  notificationTime: {
    fontSize: typography.xs,
    color: colors.textLight,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
})

export default NotificationsScreen
