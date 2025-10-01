export const formatDate = (date) => {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (date) => {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatTime = (date) => {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const isExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

export const getDaysUntilExpiry = (date) => {
  if (!date) return null

  const today = new Date()
  const expiryDate = new Date(date)
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export const getRelativeTime = (date) => {
  if (!date) return ""

  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora mismo"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return formatDate(date)
}
