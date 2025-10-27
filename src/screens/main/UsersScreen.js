"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing } from "../../styles"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = "https://backend-production-b28f.up.railway.app/api"

const UsersScreen = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await axios.get(`${API_URL}/users/directory`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("[v0] Users loaded:", response.data.length)
      console.log("[v0] First user donation_days:", response.data[0]?.donation_days)
      console.log("[v0] First user donation_days type:", typeof response.data[0]?.donation_days)
      setUsers(response.data)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`)
    }
  }

  const getDaysText = (donationDays) => {
    console.log("[v0] getDaysText called with:", donationDays)
    console.log("[v0] getDaysText type:", typeof donationDays)

    if (!donationDays) return "No configurado"

    // Si es un string, intentar parsearlo
    let parsedDays = donationDays
    if (typeof donationDays === "string") {
      try {
        parsedDays = JSON.parse(donationDays)
      } catch (e) {
        return "No configurado"
      }
    }

    // Verificar que sea un objeto válido
    if (typeof parsedDays !== "object" || parsedDays === null) {
      return "No configurado"
    }

    const dayNames = {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom",
    }

    const activeDays = Object.keys(dayNames)
      .filter((day) => parsedDays[day]?.available === true)
      .map((day) => dayNames[day])

    console.log("[v0] Active days found:", activeDays)
    return activeDays.length > 0 ? activeDays.join(", ") : "No configurado"
  }

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.user_type === "donor" ? "business" : "people"} size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.user_type === "donor" ? "Donante" : "Organización"}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <Ionicons name="call" size={16} color={colors.gray600} />
          <Text style={styles.detailText}>{item.phone || "Sin teléfono"}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar" size={16} color={colors.gray600} />
          <Text style={styles.detailText}>{getDaysText(item.donation_days)}</Text>
        </View>
      </View>

      {item.phone && (
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phone)}>
          <Ionicons name="call" size={18} color={colors.white} />
          <Text style={styles.callButtonText}>Llamar</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Directorio</Text>
        <Text style={styles.subtitle}>{users.length} usuarios</Text>
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  type: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  details: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray700,
    marginLeft: spacing.sm,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
})

export default UsersScreen
