import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, typography, spacing } from "../../styles"

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [styles.base, styles[variant], styles[size], (disabled || loading) && styles.disabled, style]

  const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={variant === "primary" ? colors.white : colors.primary} />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={size === "small" ? 16 : 20}
                color={variant === "primary" ? colors.white : colors.primary}
                style={styles.icon}
              />
            )}
            <Text style={textStyles}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontWeight: typography.medium,
    textAlign: "center",
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },

  // Size text styles
  smallText: {
    fontSize: typography.sm,
  },
  mediumText: {
    fontSize: typography.base,
  },
  largeText: {
    fontSize: typography.lg,
  },
})

export default Button
