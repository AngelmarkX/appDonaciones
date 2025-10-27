import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"
import Card from "../../components/common/Card"

const AboutScreen = ({ navigation }) => {
  const handleLinkPress = (url) => {
    Linking.openURL(url)
  }

  const teamMembers = [
    { name: "Miguel Zuluaga", role: "Desarollador", icon: "person" },
    { name: "Santiago Guevara", role: "Desarrollador", icon: "person" },

  ]

  const stats = [
    { number: "10,000+", label: "Donaciones realizadas", icon: "gift" },
    { number: "5,000+", label: "Usuarios activos", icon: "people" },
    { number: "500+", label: "Organizaciones", icon: "business" },
    { number: "50+", label: "Ciudades", icon: "location" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.section}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Ionicons name="heart" size={48} color={colors.primary} />
            </View>
            <Text style={styles.appName}>Food Share</Text>
            <Text style={styles.version}>Versión 1.0.0</Text>
            <Text style={styles.tagline}>Conectando donantes con organizaciones</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Nuestra Misión</Text>
          <Text style={styles.missionText}>
            Reducir el desperdicio de alimentos conectando a donantes con organizaciones benéficas y personas que
            necesitan alimentos. Creemos que ningún alimento bueno debería desperdiciarse mientras hay personas que lo
            necesitan.
          </Text>
        </Card>



        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Nuestro Equipo</Text>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Ionicons name={member.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Enlaces</Text>

          <TouchableOpacity style={styles.linkItem} onPress={() => handleLinkPress("https://foodshare.com/privacy")}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Política de Privacidad</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={() => handleLinkPress("https://foodshare.com/terms")}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Términos de Servicio</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={() => handleLinkPress("https://foodshare.com")}>
            <Ionicons name="globe-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Sitio Web</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem} onPress={() => handleLinkPress("mailto:contacto@foodshare.com")}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
            <Text style={styles.linkText}>Contacto</Text>
            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💚 Síguenos</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleLinkPress("https://facebook.com/foodshare")}
            >
              <Ionicons name="logo-facebook" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleLinkPress("https://twitter.com/foodshare")}
            >
              <Ionicons name="logo-twitter" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleLinkPress("https://instagram.com/foodshare")}
            >
              <Ionicons name="logo-instagram" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleLinkPress("https://linkedin.com/company/foodshare")}
            >
              <Ionicons name="logo-linkedin" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Food Share. Todos los derechos reservados.</Text>
          <Text style={styles.footerSubtext}>Hecho con ❤️ para reducir el desperdicio de alimentos</Text>
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
  logoSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  missionText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  statNumber: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  memberRole: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    flex: 1,
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  footerSubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
})

export default AboutScreen
