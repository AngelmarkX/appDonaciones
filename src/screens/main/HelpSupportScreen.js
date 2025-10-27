import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"

const HelpSupportScreen = ({ navigation }) => {
  const handleContact = (method, value) => {
    switch (method) {
      case "email":
        Linking.openURL(`mailto:${value}`)
        break
      case "phone":
        Linking.openURL(`tel:${value}`)
        break
      case "whatsapp":
        Linking.openURL(`whatsapp://send?phone=${value}`)
        break
      default:
        Alert.alert("Próximamente", "Esta función estará disponible pronto")
    }
  }

  const faqItems = [
    {
      question: "¿Cómo puedo donar alimentos?",
      answer: "Ve a la sección 'Nueva Donación', completa la información de los alimentos y publica tu donación.",
    },
    {
      question: "¿Cómo reservo una donación?",
      answer: "Busca donaciones disponibles, selecciona la que te interese y presiona 'Reservar'.",
    },
    {
      question: "¿Puedo cancelar una reserva?",
      answer: "Sí, puedes cancelar desde la sección 'Mis Donaciones' hasta 2 horas antes de la recogida.",
    },
    {
      question: "¿Qué tipos de alimentos puedo donar?",
      answer: "Puedes donar alimentos frescos, enlatados, panadería, lácteos y comida preparada en buen estado.",
    },
    {
      question: "¿Es seguro usar la aplicación?",
      answer:
        "Sí, verificamos a todos los usuarios y organizaciones. Siempre revisa los perfiles antes de hacer transacciones.",
    },
  ]

  const contactOptions = [
    {
      icon: "mail-outline",
      title: "Email",
      subtitle: "miguel.zuluaga@ucp.edu.co",
      action: () => handleContact("email", "miguel.zuluaga@ucp.edu.co"),
    },
    {
      icon: "call-outline",
      title: "Teléfono",
      subtitle: "+57 3206775293",
      action: () => handleContact("phone", "+57 3206775293"),
    },
    {
      icon: "logo-whatsapp",
      title: "WhatsApp",
      subtitle: "+57 3206775293",
      action: () => handleContact("whatsapp", "++57 3206775293"),
    },
 
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Preguntas Frecuentes</Text>

          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contactar Soporte</Text>

          {contactOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.contactItem} onPress={option.action}>
              <View style={styles.contactLeft}>
                <Ionicons name={option.icon} size={24} color={colors.primary} />
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </Card>

        

        <Card style={styles.emergencyCard}>
          <Ionicons name="warning-outline" size={24} color={colors.error} />
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>¿Problema Urgente?</Text>
            <Text style={styles.emergencySubtitle}>
              Si tienes un problema urgente relacionado con seguridad alimentaria o una emergencia, contacta
              inmediatamente a nuestro equipo de soporte.
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={() => handleContact("phone", "+57 3206775293")}>
              <Text style={styles.emergencyButtonText}>Llamar Ahora</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  contactTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contactSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resourceText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  resourceTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  resourceSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  emergencyCard: {
    flexDirection: "row",
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  emergencyText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  emergencySubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  emergencyButtonText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.medium,
  },
})

export default HelpSupportScreen
