"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Modal,
  TextInput,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"
import Badge from "../../components/common/Badge"
import Button from "../../components/common/Button"
import donationService from "../../services/donationService"

const DonationsScreen = ({ navigation, route }) => {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchText, setSearchText] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilters, setShowCategoryFilters] = useState(false)
  // </CHANGE>
  const [expandedDonations, setExpandedDonations] = useState(new Set())
  const [reservationModalVisible, setReservationModalVisible] = useState(false)
  const [selectedDonationId, setSelectedDonationId] = useState(null)
  const [pickupTime, setPickupTime] = useState("")
  const [pickupPersonName, setPickupPersonName] = useState("")
  const [pickupPersonId, setPickupPersonId] = useState("")
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmingDonationId, setConfirmingDonationId] = useState(null)
  const [businessConfirmModalVisible, setBusinessConfirmModalVisible] = useState(false)
  const [businessConfirmDonation, setBusinessConfirmDonation] = useState(null)
  const [reservationSuccessModalVisible, setReservationSuccessModalVisible] = useState(false)
  const [reservationSuccessData, setReservationSuccessData] = useState(null)
  const [orgReviewModalVisible, setOrgReviewModalVisible] = useState(false)
  const [orgReviewDonation, setOrgReviewDonation] = useState(null)
  const flatListRef = useRef(null)
  const highlightedDonationId = route?.params?.highlightDonationId
  const autoReserve = route?.params?.autoReserve

  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    loadDonations()
  }, [filter])

  useEffect(() => {
    if (highlightedDonationId && donations.length > 0) {
      const index = donations.findIndex((d) => d.id === highlightedDonationId)

      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          })

          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.05,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 },
          ).start()

          if (autoReserve) {
            setTimeout(() => {
              openReservationModal(highlightedDonationId)
            }, 1000)
          }
        }, 500)
      }
    }
  }, [highlightedDonationId, donations])

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
        donationsData = await donationService.getMyDonations()
      } else {
        const allDonations = await donationService.getDonations()

        if (filter === "received") {
          // For received filter, get ALL completed donations reserved by this organization
          donationsData = allDonations.filter(
            (donation) => donation.status === "completed" && donation.reserved_by === user?.id,
          )
        } else {
          // For other filters, show available or reserved by this organization
          donationsData = allDonations.filter(
            (donation) => donation.status === "available" || donation.reserved_by === user?.id,
          )
        }
      }

      console.log("📋 [DONATIONS_SCREEN] Donaciones cargadas:", {
        total: donationsData.length,
        userType: user?.userType,
        filter,
        sample: donationsData.slice(0, 2).map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          reserved_by: d.reserved_by,
          donor_confirmed: d.donor_confirmed,
          recipient_confirmed: d.recipient_confirmed,
        })),
      })

      let filteredDonations = donationsData
      if (filter !== "all" && filter !== "received") {
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
        return "Fecha inválida"
      }

      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: dateString.includes("T") ? "2-digit" : undefined,
        minute: dateString.includes("T") ? "2-digit" : undefined,
      })
    } catch (error) {
      return "Error en fecha"
    }
  }

  const toggleExpanded = (donationId) => {
    setExpandedDonations((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(donationId)) {
        newSet.delete(donationId)
      } else {
        newSet.add(donationId)
      }
      return newSet
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
      sugar: "Azúcares",
      fats: "Grasas",
      cereals: "Cereales",
      beverages: "Bebidas",
      other: "Otros",
      furniture: "Muebles",
      electronics: "Electrónicos",
      clothing: "Ropa",
      books: "Libros",
      toys: "Juguetes",
      appliances: "Electrodomésticos",
      tools: "Herramientas",
      sports: "Deportes",
      office: "Oficina",
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

    if (!donation.business_confirmed) return false

    if (user?.userType === "donor") {
      return donation.donor_id === user?.id && !donation.donor_confirmed
    }

    if (user?.userType === "organization") {
      return donation.reserved_by === user?.id && !donation.recipient_confirmed
    }

    return false
  }

  const canBusinessConfirm = (donation) => {
    return (
      user?.userType === "donor" &&
      donation.status === "reserved" &&
      donation.donor_id === user?.id &&
      !donation.business_confirmed
    )
  }

  const canOrgReview = (donation) => {
    return (
      user?.userType === "organization" &&
      donation.status === "reserved" &&
      donation.reserved_by === user?.id &&
      donation.pickup_time &&
      donation.verification_code
    )
  }

  const getConfirmationStatus = (donation) => {
    if (donation.status !== "reserved") return null

    const donorConfirmed = donation.donor_confirmed
    const recipientConfirmed = donation.recipient_confirmed
    const businessConfirmed = donation.business_confirmed

    if (!businessConfirmed) {
      return "Esperando confirmación del comercio"
    }

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

  const hasValidCoordinates = (donation) => {
    const lat = donation.pickup_latitude || donation.latitude
    const lng = donation.pickup_longitude || donation.longitude
    return lat && lng && !isNaN(Number.parseFloat(lat)) && !isNaN(Number.parseFloat(lng))
  }

  const isHighlighted = (donationId) => {
    return highlightedDonationId === donationId
  }

  const openReservationModal = (donationId) => {
    setSelectedDonationId(donationId)
    setPickupTime("")
    setPickupPersonName("")
    setPickupPersonId("")
    setReservationModalVisible(true)
  }

  const handlePickupTimeChange = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^\d]/g, "")

    let formatted = cleaned

    // Auto-format as YYYY-MM-DD HH:MM
    if (cleaned.length >= 4) {
      formatted = cleaned.substring(0, 4)
      if (cleaned.length >= 5) {
        formatted += "-" + cleaned.substring(4, 6)
      }
      if (cleaned.length >= 7) {
        formatted += "-" + cleaned.substring(6, 8)
      }
      if (cleaned.length >= 9) {
        formatted += " " + cleaned.substring(8, 10)
      }
      if (cleaned.length >= 11) {
        formatted += ":" + cleaned.substring(10, 12)
      }
    }

    setPickupTime(formatted)
  }

  const handleReserveSubmit = async () => {
    try {
      if (!pickupTime || !pickupPersonName || !pickupPersonId) {
        Alert.alert("Error", "Todos los campos son obligatorios")
        return
      }

      // Validate cedula length
      if (pickupPersonId.length < 6 || pickupPersonId.length > 20) {
        Alert.alert("Error", "La cédula debe tener entre 6 y 20 caracteres")
        return
      }

      // Validate pickup time format
      if (pickupTime.length < 16) {
        Alert.alert("Error", "Formato de fecha y hora incompleto. Use: YYYY-MM-DD HH:MM")
        return
      }

      console.log("🔄 [DONATIONS_SCREEN] Reservando donación con detalles:", {
        donationId: selectedDonationId,
        pickupTime,
        pickupPersonName,
        pickupPersonId,
      })

      const result = await donationService.reserveDonation(selectedDonationId, {
        pickup_time: pickupTime,
        pickup_person_name: pickupPersonName,
        pickup_person_id: pickupPersonId,
      })

      setReservationModalVisible(false)

      setReservationSuccessData({
        verificationCode: result.verification_code,
        pickupTime: pickupTime,
        pickupPersonName: pickupPersonName,
        pickupPersonId: pickupPersonId,
      })
      setReservationSuccessModalVisible(true)

      loadDonations()
      navigation.setParams({ highlightDonationId: null, autoReserve: false })
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error reservando:", error)
      Alert.alert("Error", error.message || "No se pudo reservar la donación")
    }
  }

  const openConfirmModal = (donationId) => {
    setConfirmingDonationId(donationId)
    setVerificationCode("")
    setConfirmModalVisible(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      if (!verificationCode) {
        Alert.alert("Error", "Debes ingresar el código de verificación")
        return
      }

      console.log("🔄 [DONATIONS_SCREEN] Confirmando donación con código:", {
        donationId: confirmingDonationId,
        verificationCode,
      })

      await donationService.confirmDonation(confirmingDonationId, verificationCode)

      setConfirmModalVisible(false)
      Alert.alert("Éxito", "Confirmación registrada exitosamente")
      loadDonations()
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error confirmando:", error)
      Alert.alert("Error", error.message || "No se pudo confirmar la donación")
    }
  }

  const openBusinessConfirmModal = (donation) => {
    setBusinessConfirmDonation(donation)
    setBusinessConfirmModalVisible(true)
  }

  const handleBusinessConfirm = async (accept) => {
    try {
      console.log("🔄 [DONATIONS_SCREEN] Confirmación de comercio:", {
        donationId: businessConfirmDonation.id,
        accept,
      })

      await donationService.businessConfirmPickup(businessConfirmDonation.id, accept)

      setBusinessConfirmModalVisible(false)

      if (accept) {
        Alert.alert("Éxito", "Hora de recogida aceptada. La organización puede proceder con la recogida.")
      } else {
        Alert.alert("Reserva Rechazada", "La reserva ha sido cancelada y la donación está disponible nuevamente.")
      }

      loadDonations()
    } catch (error) {
      console.error("❌ [DONATIONS_SCREEN] Error en confirmación de comercio:", error)
      Alert.alert("Error", error.message || "No se pudo procesar la confirmación")
    }
  }

  const openOrgReviewModal = (donation) => {
    setOrgReviewDonation(donation)
    setOrgReviewModalVisible(true)
  }

  const CATEGORIES = [
    { id: "bakery", label: "Panadería", icon: "🥖", type: "food" },
    { id: "dairy", label: "Lácteos", icon: "🥛", type: "food" },
    { id: "fruits", label: "Frutas y Verduras", icon: "🍎", type: "food" },
    { id: "meat", label: "Carnes", icon: "🥩", type: "food" },
    { id: "canned", label: "Enlatados", icon: "🥫", type: "food" },
    { id: "prepared", label: "Comida Preparada", icon: "🍱", type: "food" },
    { id: "sugar", label: "Azúcares", icon: "🍬", type: "food" },
    { id: "fats", label: "Grasas", icon: "🧈", type: "food" },
    { id: "cereals", label: "Cereales", icon: "🌾", type: "food" },
    { id: "beverages", label: "Bebidas", icon: "🥤", type: "food" },
    { id: "furniture", label: "Muebles", icon: "🪑", type: "general" },
    { id: "electronics", label: "Electrónicos", icon: "📱", type: "general" },
    { id: "clothing", label: "Ropa", icon: "👕", type: "general" },
    { id: "books", label: "Libros", icon: "📚", type: "general" },
    { id: "toys", label: "Juguetes", icon: "🧸", type: "general" },
    { id: "appliances", label: "Electrodomésticos", icon: "🔌", type: "general" },
    { id: "tools", label: "Herramientas", icon: "🔧", type: "general" },
    { id: "sports", label: "Deportes", icon: "⚽", type: "general" },
    { id: "office", label: "Oficina", icon: "📎", type: "general" },
    { id: "other", label: "Otros", icon: "📦", type: "general" },
  ]
  // </CHANGE>

  const getFilteredDonations = () => {
    let filtered = donations

    // Apply status filter
    if (filter !== "all" && filter !== "received") {
      filtered = filtered.filter((donation) => donation.status === filter)
    }

    // Apply search text filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter((donation) => {
        return (
          donation.title?.toLowerCase().includes(searchLower) ||
          donation.description?.toLowerCase().includes(searchLower) ||
          donation.category?.toLowerCase().includes(searchLower) ||
          getCategoryLabel(donation.category).toLowerCase().includes(searchLower) ||
          donation.donor_name?.toLowerCase().includes(searchLower) ||
          donation.pickup_address?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((donation) => selectedCategories.includes(donation.category))
    }

    return filtered
  }

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const clearAllFilters = () => {
    setSearchText("")
    setSelectedCategories([])
    setFilter("all")
  }

  const hasActiveFilters = searchText.trim() || selectedCategories.length > 0 || filter !== "all"
  // </CHANGE>

  const renderDonation = ({ item: donation }) => {
    const highlighted = isHighlighted(donation.id)
    const isExpanded = expandedDonations.has(donation.id)
    const isReceived = filter === "received" && donation.status === "completed" && donation.reserved_by === user?.id

    return (
      <Animated.View
        style={[
          styles.donationCardWrapper,
          highlighted && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Card style={[styles.donationCard, highlighted && styles.highlightedCard, isReceived && styles.receivedCard]}>
          {isReceived && (
            <View style={styles.receivedBadgeContainer}>
              <View style={styles.receivedBadge}>
                <Ionicons name="checkmark-done-circle" size={18} color={colors.white} />
                <Text style={styles.receivedBadgeText}>Recibida Exitosamente</Text>
              </View>
            </View>
          )}

          {highlighted && (
            <View style={styles.highlightBadge}>
              <Ionicons name="star" size={16} color={colors.white} />
              <Text style={styles.highlightBadgeText}>Desde el mapa</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => toggleExpanded(donation.id)} activeOpacity={0.7}>
            <View style={styles.donationHeader}>
              <Text style={styles.donationTitle}>{donation.title}</Text>
              <View style={styles.headerRight}>
                {isReceived ? (
                  <Badge variant="success" size="small">
                    ✓ Completada
                  </Badge>
                ) : (
                  <Badge variant={getStatusBadgeVariant(donation.status)} size="small">
                    {getStatusText(donation.status)}
                  </Badge>
                )}
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                  style={styles.expandIcon}
                />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.donationDescription} numberOfLines={isExpanded ? undefined : 2}>
            {donation.description}
          </Text>

          <View style={styles.donationInfo}>
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(donation.category) }]} />
              <Text style={styles.categoryText}>{getCategoryLabel(donation.category)}</Text>
            </View>

            <Text style={styles.quantityText}>Cantidad: {donation.quantity}</Text>
          </View>

          {isReceived && !isExpanded && (
            <View style={styles.receivedSummary}>
              <View style={styles.receivedSummaryHeader}>
                <Ionicons name="gift" size={20} color={colors.success} />
                <Text style={styles.receivedSummaryTitle}>Resumen de Recepción</Text>
              </View>

              <View style={styles.receivedSummaryGrid}>
                <View style={styles.receivedSummaryItem}>
                  <Ionicons name="business" size={18} color={colors.success} />
                  <View style={styles.receivedSummaryItemContent}>
                    <Text style={styles.receivedSummaryLabel}>Donante</Text>
                    <Text style={styles.receivedSummaryValue}>{donation.donor_name || "Comercio"}</Text>
                  </View>
                </View>

                <View style={styles.receivedSummaryItem}>
                  <Ionicons name="calendar" size={18} color={colors.success} />
                  <View style={styles.receivedSummaryItemContent}>
                    <Text style={styles.receivedSummaryLabel}>Fecha</Text>
                    <Text style={styles.receivedSummaryValue}>{formatDate(donation.completed_at)}</Text>
                  </View>
                </View>

                {donation.weight && (
                  <View style={styles.receivedSummaryItem}>
                    <Ionicons name="barbell" size={18} color={colors.success} />
                    <View style={styles.receivedSummaryItemContent}>
                      <Text style={styles.receivedSummaryLabel}>Peso</Text>
                      <Text style={styles.receivedSummaryValue}>{donation.weight}</Text>
                    </View>
                  </View>
                )}

                {donation.verification_code && (
                  <View style={styles.receivedSummaryItem}>
                    <Ionicons name="shield-checkmark" size={18} color={colors.success} />
                    <View style={styles.receivedSummaryItemContent}>
                      <Text style={styles.receivedSummaryLabel}>Código usado</Text>
                      <Text style={[styles.receivedSummaryValue, styles.codeText]}>{donation.verification_code}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {isExpanded && (
            <View style={styles.detailedInfo}>
              {isReceived && (
                <>
                  <View style={styles.receivedHeader}>
                    <View style={styles.receivedHeaderIconContainer}>
                      <Ionicons name="gift" size={28} color={colors.success} />
                    </View>
                    <View style={styles.receivedHeaderContent}>
                      <Text style={styles.receivedHeaderText}>Donación Recibida</Text>
                      <Text style={styles.receivedHeaderSubtext}>Esta donación fue completada exitosamente</Text>
                    </View>
                  </View>
                </>
              )}

              <Text style={styles.detailedInfoTitle}>Información Completa</Text>

              {donation.weight && (
                <View style={styles.infoRow}>
                  <Ionicons name="barbell-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Peso:</Text>
                  <Text style={styles.infoValue}>{donation.weight}</Text>
                </View>
              )}

              {donation.expiry_date && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.warning} />
                  <Text style={styles.infoLabel}>Fecha de caducidad:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.expiry_date)}</Text>
                </View>
              )}

              {donation.donation_reason && (
                <View style={styles.infoRow}>
                  <Ionicons name="help-circle-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Motivo:</Text>
                  <Text style={styles.infoValue}>{donation.donation_reason}</Text>
                </View>
              )}

              {donation.contact_info && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                  <Text style={styles.infoLabel}>Contacto:</Text>
                  <Text style={styles.infoValue}>{donation.contact_info}</Text>
                </View>
              )}

              {donation.donor_phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="phone-portrait-outline" size={16} color={colors.success} />
                  <Text style={styles.infoLabel}>Teléfono donante:</Text>
                  <Text style={styles.infoValue}>{donation.donor_phone}</Text>
                </View>
              )}

              {donation.donor_email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color={colors.success} />
                  <Text style={styles.infoLabel}>Email donante:</Text>
                  <Text style={styles.infoValue}>{donation.donor_email}</Text>
                </View>
              )}

              {donation.created_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Creada:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.created_at)}</Text>
                </View>
              )}

              {donation.reserved_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="bookmark-outline" size={16} color={colors.warning} />
                  <Text style={styles.infoLabel}>Reservada:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.reserved_at)}</Text>
                </View>
              )}

              {donation.completed_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={styles.infoLabel}>Completada:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.completed_at)}</Text>
                </View>
              )}

              {donation.donor_confirmed_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                  <Text style={styles.infoLabel}>Donante confirmó:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.donor_confirmed_at)}</Text>
                </View>
              )}

              {donation.recipient_confirmed_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.info} />
                  <Text style={styles.infoLabel}>Organización confirmó:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.recipient_confirmed_at)}</Text>
                </View>
              )}

              {donation.updated_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Última actualización:</Text>
                  <Text style={styles.infoValue}>{formatDate(donation.updated_at)}</Text>
                </View>
              )}

              {(donation.status === "reserved" || isReceived) && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionTitle}>Detalles de la Reserva</Text>

                  {donation.pickup_time && (
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={16} color={colors.primary} />
                      <Text style={styles.infoLabel}>Hora de recogida:</Text>
                      <Text style={styles.infoValue}>{donation.pickup_time}</Text>
                    </View>
                  )}

                  {donation.pickup_person_name && (
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color={colors.primary} />
                      <Text style={styles.infoLabel}>Persona encargada:</Text>
                      <Text style={styles.infoValue}>{donation.pickup_person_name}</Text>
                    </View>
                  )}

                  {donation.pickup_person_id && (
                    <View style={styles.infoRow}>
                      <Ionicons name="card-outline" size={16} color={colors.primary} />
                      <Text style={styles.infoLabel}>Cédula:</Text>
                      <Text style={styles.infoValue}>{donation.pickup_person_id}</Text>
                    </View>
                  )}

                  {donation.verification_code && (
                    <View style={styles.infoRow}>
                      <Ionicons name="key-outline" size={16} color={colors.success} />
                      <Text style={styles.infoLabel}>Código de verificación:</Text>
                      <Text style={[styles.infoValue, styles.verificationCodeInline]}>
                        {donation.verification_code}
                      </Text>
                    </View>
                  )}

                  {donation.business_confirmed !== null && (
                    <View style={styles.infoRow}>
                      <Ionicons
                        name={donation.business_confirmed ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={donation.business_confirmed ? colors.success : colors.error}
                      />
                      <Text style={styles.infoLabel}>Estado del comercio:</Text>
                      <Text style={styles.infoValue}>
                        {donation.business_confirmed ? "Hora aceptada" : "Hora rechazada"}
                      </Text>
                    </View>
                  )}

                  {donation.business_confirmed_at && (
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={16} color={colors.success} />
                      <Text style={styles.infoLabel}>Confirmado por comercio:</Text>
                      <Text style={styles.infoValue}>{formatDate(donation.business_confirmed_at)}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {donation.pickup_address && (
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.addressText} numberOfLines={isExpanded ? undefined : 1}>
                {donation.pickup_address}
              </Text>
            </View>
          )}

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

          {donation.status === "reserved" && (
            <View style={styles.confirmationStatus}>
              <Text style={styles.confirmationText}>{getConfirmationStatus(donation)}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {hasValidCoordinates(donation) && (
              <TouchableOpacity style={styles.mapButton} onPress={() => handleViewOnMap(donation)}>
                <Ionicons name="map-outline" size={16} color={colors.primary} />
                <Text style={styles.mapButtonText}>Ver en mapa</Text>
              </TouchableOpacity>
            )}

            {canReserve(donation) && (
              <Button
                title="Reservar"
                onPress={() => openReservationModal(donation.id)}
                size="small"
                style={styles.actionButton}
              />
            )}

            {canBusinessConfirm(donation) && (
              <Button
                title="Revisar reserva"
                onPress={() => openBusinessConfirmModal(donation)}
                size="small"
                variant="warning"
                style={styles.actionButton}
              />
            )}

            {canOrgReview(donation) && (
              <Button
                title="Revisar reserva"
                onPress={() => openOrgReviewModal(donation)}
                size="small"
                variant="info"
                style={styles.actionButton}
              />
            )}

            {canConfirm(donation) && (
              <Button
                title="Confirmar entrega"
                onPress={() => openConfirmModal(donation.id)}
                size="small"
                variant="outline"
                style={styles.actionButton}
              />
            )}
          </View>
        </Card>
      </Animated.View>
    )
  }

  const handleViewOnMap = (donation) => {
    console.log("🗺️ [DONATIONS_SCREEN] Navegando al mapa con donación:", donation.id)
    navigation.navigate("Map", {
      highlightDonation: {
        id: donation.id,
        title: donation.title,
        description: donation.description,
        category: donation.category,
        quantity: donation.quantity,
        weight: donation.weight,
        donation_reason: donation.donation_reason,
        donor_name: donation.donor_name,
        donor_phone: donation.donor_phone,
        pickup_address: donation.pickup_address,
        expiry_date: donation.expiry_date,
        status: donation.status,
        latitude: donation.pickup_latitude || donation.latitude,
        longitude: donation.pickup_longitude || donation.longitude,
        created_at: donation.created_at,
        updated_at: donation.updated_at,
      },
    })
  }

  const filterOptions = [
    { key: "all", label: "Todas" },
    { key: "available", label: "Disponibles" },
    { key: "reserved", label: "Reservadas" },
    ...(user?.userType === "organization" ? [{ key: "received", label: "Recibidas" }] : []),
    { key: "completed", label: "Completadas" },
  ]

  const displayedDonations = getFilteredDonations()
  // </CHANGE>

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

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título, categoría, donante..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={colors.textSecondary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.categoryFilterButton, showCategoryFilters && styles.categoryFilterButtonActive]}
          onPress={() => setShowCategoryFilters(!showCategoryFilters)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={selectedCategories.length > 0 ? colors.primary : colors.textSecondary}
          />
          {selectedCategories.length > 0 && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>
      {/* </CHANGE> */}

      {showCategoryFilters && (
        <View style={styles.categoryFiltersContainer}>
          <Text style={styles.categoryFiltersTitle}>Filtrar por categoría:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFiltersList}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryFilterChip,
                  selectedCategories.includes(category.id) && styles.categoryFilterChipActive,
                ]}
                onPress={() => toggleCategoryFilter(category.id)}
              >
                <Text style={styles.categoryFilterIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryFilterLabel,
                    selectedCategories.includes(category.id) && styles.categoryFilterLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {/* </CHANGE> */}

      {/* Filtros de estado */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterButton, filter === option.key && styles.filterButtonActive]}
              onPress={() => setFilter(option.key)}
            >
              <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {hasActiveFilters && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {displayedDonations.length} resultado{displayedDonations.length !== 1 ? "s" : ""}
            {searchText && ` para "${searchText}"`}
          </Text>
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersButton}>
            <Ionicons name="close-circle" size={16} color={colors.primary} />
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* </CHANGE> */}

      {/* Lista de donaciones */}
      <FlatList
        ref={flatListRef}
        data={displayedDonations}
        renderItem={renderDonation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDonations} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {hasActiveFilters ? "No se encontraron donaciones con los filtros aplicados" : "No hay donaciones"}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        // </CHANGE>
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500))
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true })
          })
        }}
      />

      {/* Reservation Modal */}
      <Modal
        visible={reservationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReservationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de Recogida</Text>
              <TouchableOpacity onPress={() => setReservationModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Por favor, proporciona los detalles de la persona que recogerá la donación
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Fecha y Hora de Recogida <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD HH:MM (ej: 2024-12-25 14:30)"
                  value={pickupTime}
                  onChangeText={handlePickupTimeChange}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <Text style={styles.inputHint}>Formato: YYYY-MM-DD HH:MM (se formatea automáticamente)</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Nombre Completo <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de quien recogerá"
                  value={pickupPersonName}
                  onChangeText={setPickupPersonName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Cédula <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Número de cédula"
                  value={pickupPersonId}
                  onChangeText={setPickupPersonId}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>Entre 6 y 20 dígitos</Text>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={styles.infoBoxText}>
                  Recibirás un código de verificación que deberás presentar al momento de la recogida
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setReservationModalVisible(false)}
                style={styles.modalButton}
              />
              <Button title="Reservar" onPress={handleReserveSubmit} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reservationSuccessModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReservationSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.successHeaderContent}>
                <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                <Text style={styles.modalTitle}>¡Reserva Exitosa!</Text>
              </View>
              <TouchableOpacity onPress={() => setReservationSuccessModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Tu reserva ha sido registrada exitosamente. Guarda esta información para la recogida:
              </Text>

              {reservationSuccessData && (
                <View style={styles.successDetails}>
                  <View style={styles.successCodeContainer}>
                    <Text style={styles.successCodeLabel}>Código de Verificación</Text>
                    <Text style={styles.successCodeValue}>{reservationSuccessData.verificationCode}</Text>
                    <Text style={styles.successCodeHint}>Presenta este código al momento de la recogida</Text>
                  </View>

                  <View style={styles.successInfoContainer}>
                    <View style={styles.successInfoRow}>
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Fecha y Hora de Recogida</Text>
                        <Text style={styles.successInfoValue}>{reservationSuccessData.pickupTime}</Text>
                      </View>
                    </View>

                    <View style={styles.successInfoRow}>
                      <Ionicons name="person-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Persona Encargada</Text>
                        <Text style={styles.successInfoValue}>{reservationSuccessData.pickupPersonName}</Text>
                      </View>
                    </View>

                    <View style={styles.successInfoRow}>
                      <Ionicons name="card-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Cédula</Text>
                        <Text style={styles.successInfoValue}>{reservationSuccessData.pickupPersonId}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={20} color={colors.warning} />
                    <Text style={styles.warningBoxText}>
                      El comercio debe aceptar la hora de recogida antes de que puedas confirmar la entrega. Te
                      notificaremos cuando esto suceda.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Entendido"
                onPress={() => setReservationSuccessModalVisible(false)}
                style={styles.modalButtonFull}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Entrega</Text>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Ingresa el código de verificación para confirmar la entrega de la donación
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Código de Verificación <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={styles.infoBoxText}>
                  Este código fue generado al momento de la reserva y debe ser proporcionado por la otra parte
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setConfirmModalVisible(false)}
                style={styles.modalButton}
              />
              <Button title="Confirmar" onPress={handleConfirmSubmit} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Business Confirm Modal */}
      <Modal
        visible={businessConfirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBusinessConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Revisar Reserva</Text>
              <TouchableOpacity onPress={() => setBusinessConfirmModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Una organización ha reservado tu donación con los siguientes detalles:
              </Text>

              {businessConfirmDonation && (
                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Hora de Recogida</Text>
                      <Text style={styles.detailValue}>{businessConfirmDonation.pickup_time || "No especificada"}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Persona que Recogerá</Text>
                      <Text style={styles.detailValue}>
                        {businessConfirmDonation.pickup_person_name || "No especificado"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={20} color={colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Cédula</Text>
                      <Text style={styles.detailValue}>
                        {businessConfirmDonation.pickup_person_id || "No especificada"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="key-outline" size={20} color={colors.success} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Código de Verificación</Text>
                      <Text style={[styles.detailValue, styles.verificationCodeText]}>
                        {businessConfirmDonation.verification_code || "No generado"}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                <Text style={styles.warningBoxText}>
                  ¿Aceptas esta hora de recogida? Si rechazas, la reserva será cancelada.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Rechazar"
                variant="error"
                onPress={() => handleBusinessConfirm(false)}
                style={styles.modalButton}
              />
              <Button title="Aceptar" onPress={() => handleBusinessConfirm(true)} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={orgReviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrgReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.successHeaderContent}>
                <Ionicons name="information-circle" size={32} color={colors.info} />
                <Text style={styles.modalTitle}>Detalles de Reserva</Text>
              </View>
              <TouchableOpacity onPress={() => setOrgReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Estos son los detalles de tu reserva. Guarda esta información para la recogida:
              </Text>

              {orgReviewDonation && (
                <View style={styles.successDetails}>
                  <View style={styles.successCodeContainer}>
                    <Text style={styles.successCodeLabel}>Código de Verificación</Text>
                    <Text style={styles.successCodeValue}>{orgReviewDonation.verification_code}</Text>
                    <Text style={styles.successCodeHint}>Presenta este código al momento de la recogida</Text>
                  </View>

                  <View style={styles.successInfoContainer}>
                    <View style={styles.successInfoRow}>
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Fecha y Hora de Recogida</Text>
                        <Text style={styles.successInfoValue}>{orgReviewDonation.pickup_time}</Text>
                      </View>
                    </View>

                    <View style={styles.successInfoRow}>
                      <Ionicons name="person-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Persona Encargada</Text>
                        <Text style={styles.successInfoValue}>{orgReviewDonation.pickup_person_name}</Text>
                      </View>
                    </View>

                    <View style={styles.successInfoRow}>
                      <Ionicons name="card-outline" size={20} color={colors.primary} />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Cédula</Text>
                        <Text style={styles.successInfoValue}>{orgReviewDonation.pickup_person_id}</Text>
                      </View>
                    </View>

                    <View style={styles.successInfoRow}>
                      <Ionicons
                        name={orgReviewDonation.business_confirmed ? "checkmark-circle" : "time-outline"}
                        size={20}
                        color={orgReviewDonation.business_confirmed ? colors.success : colors.warning}
                      />
                      <View style={styles.successInfoContent}>
                        <Text style={styles.successInfoLabel}>Estado del Comercio</Text>
                        <Text style={styles.successInfoValue}>
                          {orgReviewDonation.business_confirmed
                            ? "Hora aceptada ✓"
                            : "Esperando confirmación del comercio"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!orgReviewDonation.business_confirmed && (
                    <View style={styles.warningBox}>
                      <Ionicons name="alert-circle" size={20} color={colors.warning} />
                      <Text style={styles.warningBoxText}>
                        El comercio debe aceptar la hora de recogida antes de que puedas confirmar la entrega. Te
                        notificaremos cuando esto suceda.
                      </Text>
                    </View>
                  )}

                  {orgReviewDonation.business_confirmed && (
                    <View style={styles.infoBox}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      <Text style={styles.infoBoxText}>
                        El comercio ha aceptado la hora de recogida. Puedes proceder con la recogida en la fecha y hora
                        indicadas.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cerrar" onPress={() => setOrgReviewModalVisible(false)} style={styles.modalButtonFull} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearSearchButton: {
    padding: spacing.xs,
  },
  categoryFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  categoryFilterButtonActive: {
    backgroundColor: colors.primaryLight + "20",
    borderColor: colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  categoryFiltersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryFiltersTitle: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoryFiltersList: {
    flexDirection: "row",
  },
  categoryFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryFilterChipActive: {
    backgroundColor: colors.primaryLight + "20",
    borderColor: colors.primary,
  },
  categoryFilterIcon: {
    fontSize: 16,
  },
  categoryFilterLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  categoryFilterLabelActive: {
    color: colors.primary,
    fontWeight: typography.medium,
  },
  resultsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight + "10",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  clearFiltersText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  // </CHANGE>
  filtersWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.lg,
  },
  donationCardWrapper: {
    marginBottom: spacing.lg,
  },
  donationCard: {
    position: "relative",
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "08",
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  highlightBadge: {
    position: "absolute",
    top: -10,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    zIndex: 10,
    gap: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  highlightBadgeText: {
    fontSize: typography.xs,
    color: colors.white,
    fontWeight: typography.bold,
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  expandIcon: {
    marginLeft: spacing.xs,
  },
  donationTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
    lineHeight: typography.lineHeight.tight * typography.lg,
  },
  donationDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.base,
  },
  donationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  quantityText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  detailedInfo: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  detailedInfoTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    marginLeft: spacing.sm,
    minWidth: 150,
  },
  infoValue: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: typography.medium,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: 8,
  },
  addressText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  confirmationStatus: {
    backgroundColor: colors.info + "15",
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  confirmationText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: typography.medium,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    minWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.medium,
  },
  // </CHANGE>
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight + "20",
    borderRadius: 8,
    marginRight: "auto",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  mapButtonText: {
    fontSize: typography.sm,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: typography.semibold,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray50,
    borderRadius: 6,
  },
  userInfoText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: typography.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: "90%",
    maxHeight: "85%",
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.gray50,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.xl,
    maxHeight: 450,
  },
  modalDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.base,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    fontSize: typography.base,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  codeInput: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    textAlign: "center",
    letterSpacing: 6,
  },
  inputHint: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.info + "15",
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoBoxText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: colors.warning + "15",
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningBoxText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  modalFooter: {
    flexDirection: "row",
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    backgroundColor: colors.gray50,
  },
  modalButton: {
    flex: 1,
  },
  reservationDetails: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailContent: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.medium,
  },
  detailValue: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  verificationCodeText: {
    fontFamily: "monospace",
    color: colors.success,
    fontSize: typography["2xl"],
    letterSpacing: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verificationCodeInline: {
    fontFamily: "monospace",
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.success,
    letterSpacing: 2,
  },
  successHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  successDetails: {
    marginTop: spacing.lg,
  },
  successCodeContainer: {
    backgroundColor: colors.success + "10",
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successCodeLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: typography.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  successCodeValue: {
    fontSize: 36,
    fontWeight: typography.bold,
    color: colors.success,
    fontFamily: "monospace",
    letterSpacing: 8,
    marginVertical: spacing.md,
  },
  successCodeHint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  successInfoContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  successInfoContent: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  successInfoLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.medium,
  },
  successInfoValue: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  modalButtonFull: {
    flex: 1,
  },
  receivedCard: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.white,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  receivedBadgeContainer: {
    position: "absolute",
    top: -12,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  receivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    gap: spacing.sm,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  receivedBadgeText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  receivedSummary: {
    backgroundColor: colors.success + "08",
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  receivedSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.success + "30",
  },
  receivedSummaryTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.success,
    marginLeft: spacing.md,
  },
  receivedSummaryGrid: {
    gap: spacing.md,
  },
  receivedSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  receivedSummaryItemContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  receivedSummaryLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  receivedSummaryValue: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  codeText: {
    fontFamily: "monospace",
    color: colors.success,
    fontSize: typography.base,
    letterSpacing: 2,
  },
  receivedHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "12",
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  receivedHeaderIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  receivedHeaderContent: {
    flex: 1,
  },
  receivedHeaderText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  receivedHeaderSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
})

export default DonationsScreen
