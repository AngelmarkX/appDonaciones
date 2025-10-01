import { View, StyleSheet, TouchableOpacity } from "react-native"
import { colors, spacing } from "../../styles"

const Card = ({ children, style, onPress, padding = "medium", shadow = true, ...props }) => {
  const cardStyles = [styles.base, styles[padding], shadow && styles.shadow, style]

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8} {...props}>
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: spacing.md,
  },
  medium: {
    padding: spacing.lg,
  },
  large: {
    padding: spacing.xl,
  },

  // Shadow
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
})

export default Card
