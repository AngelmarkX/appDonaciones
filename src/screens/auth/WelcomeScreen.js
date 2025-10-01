import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors, typography, spacing } from "../../styles"

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido a</Text>
          <Text style={styles.appName}>Food Share</Text>
          <Text style={styles.subtitle}>
            Conectamos donantes con organizaciones para reducir el desperdicio de alimentos
          </Text>
        </View>

        <View style={styles.illustration}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🍎</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.primaryButtonText}>Comenzar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: spacing["4xl"],
  },
  title: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: typography["3xl"],
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.base,
  },
  illustration: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderImage: {
    width: 200,
    height: 200,
    backgroundColor: colors.primaryLight,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 80,
  },
  buttons: {
    marginBottom: spacing["4xl"],
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
  secondaryButton: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
})

export default WelcomeScreen
