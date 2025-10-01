import { View, Text, StyleSheet } from "react-native"
import { colors, typography, spacing } from "../../styles"

const Badge = ({ children, variant = "default", size = "medium", style, textStyle }) => {
  const badgeStyles = [styles.base, styles[variant], styles[size], style]
  const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  // Variants
  default: {
    backgroundColor: colors.gray100,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.info,
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Text styles
  text: {
    fontWeight: typography.medium,
    textAlign: "center",
  },
  defaultText: {
    color: colors.textPrimary,
  },
  primaryText: {
    color: colors.white,
  },
  successText: {
    color: colors.white,
  },
  warningText: {
    color: colors.white,
  },
  errorText: {
    color: colors.white,
  },
  infoText: {
    color: colors.white,
  },

  // Size text styles
  smallText: {
    fontSize: typography.xs,
  },
  mediumText: {
    fontSize: typography.sm,
  },
  largeText: {
    fontSize: typography.base,
  },
})

export default Badge
