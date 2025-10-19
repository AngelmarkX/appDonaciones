"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import authService from "../../services/authService"

const DonationDaysScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [availabilityData, setAvailabilityData] = useState({
    monday: { available: true, from: "09:00", to: "18:00" },
    tuesday: { available: true, from: "09:00", to: "18:00" },
    wednesday: { available: true, from: "09:00", to: "18:00" },
    thursday: { available: true, from: "09:00", to: "18:00" },
    friday: { available: true, from: "09:00", to: "18:00" },
    saturday: { available: false, from: "10:00", to: "14:00" },
    sunday: { available: false, from: "10:00", to: "14:00" },
  })

  const days = [
    { id: "monday", label: "Lunes" },
    { id: "tuesday", label: "Martes" },
    { id: "wednesday", label: "Miércoles" },
    { id: "thursday", label: "Jueves" },
    { id: "friday", label: "Viernes" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ]

  useEffect(() => {
    loadDonationDays()
  }, [])

  const loadDonationDays = async () => {
    try {
      const response = await fetch(`http://192.168.1.5:3006/api/users/profile`, {
        headers: authService.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUserProfile(data.user)
        if (data.user.donation_days) {
          setAvailabilityData(data.user.donation_days)
        }
      }
    } catch (error) {
      console.error("Error loading donation days:", error)
    }
  }

  const toggleDay = (dayId) => {
    setAvailabilityData((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        available: !prev[dayId].available,
      },
    }))
  }

  const handleSave = async () => {
    if (!userProfile) {
      Alert.alert("Error", "No se pudo cargar la información del usuario")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://192.168.1.5:3006/api/users/profile`, {
        method: "PUT",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          address: userProfile.address,
          donation_days: availabilityData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error guardando configuración")
      }

      Alert.alert("Éxito", "Días de donación configurados correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error saving donation days:", error)
      Alert.alert("Error", error.message || "No se pudo guardar la configuración")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Días de Donación</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Text style={styles.description}>
            Configura los días en los que tu comercio puede recibir solicitudes de donación
          </Text>

          <View style={styles.daysContainer}>
            {days.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayItem, availabilityData[day.id].available && styles.dayItemActive]}
                onPress={() => toggleDay(day.id)}
              >
                <View style={styles.dayContent}>
                  <View style={[styles.checkbox, availabilityData[day.id].available && styles.checkboxActive]}>
                    {availabilityData[day.id].available && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                  <Text style={[styles.dayLabel, availabilityData[day.id].available && styles.dayLabelActive]}>
                    {day.label}
                  </Text>
                </View>
                <Ionicons
                  name={availabilityData[day.id].available ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={availabilityData[day.id].available ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Los días marcados son aquellos en los que aceptarás solicitudes de donación
            </Text>
          </View>
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
  card: {
    margin: spacing.lg,
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  daysContainer: {
    gap: spacing.sm,
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayItemActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  dayLabelActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginTop: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.primary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
})

export default DonationDaysScreen
