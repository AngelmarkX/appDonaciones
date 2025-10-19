"use client"

import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="heart-circle" size={56} color={colors.white} />
              </View>
            </View>
            <Text style={styles.appName}>Donation Share</Text>
            <Text style={styles.subtitle}>
              Conectamos donantes con organizaciones para reducir el desperdicio y ayudar a quienes más lo necesitan
            </Text>
          </Animated.View>

          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#E3F2FD" }]}>
                <Text style={styles.featureEmoji}>🤝</Text>
              </View>
              <Text style={styles.featureTitle}>Conecta</Text>
              <Text style={styles.featureText}>Comercios y organizaciones</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#FFF3E0" }]}>
                <Text style={styles.featureEmoji}>♻️</Text>
              </View>
              <Text style={styles.featureTitle}>Reduce</Text>
              <Text style={styles.featureText}>Desperdicio de recursos</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#F3E5F5" }]}>
                <Text style={styles.featureEmoji}>❤️</Text>
              </View>
              <Text style={styles.featureTitle}>Ayuda</Text>
              <Text style={styles.featureText}>A quienes lo necesitan</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.primaryButtonWrapper}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.8}
            >
              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Comenzar Ahora</Text>
                <Ionicons name="arrow-forward-circle" size={24} color={colors.white} style={styles.buttonIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>✨ Únete a nuestra comunidad de donantes ✨</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    bottom: 100,
    left: -50,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginTop: spacing["2xl"],
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  appName: {
    fontSize: 34,
    fontWeight: typography.bold,
    color: "#2E7D32",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    marginVertical: spacing.xl,
  },
  featureCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  buttons: {
    marginBottom: spacing.lg,
  },
  primaryButtonWrapper: {
    marginBottom: spacing.md,
    borderRadius: 16,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
  secondaryButton: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  footerText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.sm,
    marginTop: spacing.lg,
  },
})

export default WelcomeScreen
