// Configuración de OpenStreetMap
export const OPENSTREET_MAPS_CONFIG = {
  // Configuración por defecto del mapa
  DEFAULT_REGION: {
    latitude: 4.8133,
    longitude: -75.6961,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  // Configuración de marcadores
  MARKER_CONFIG: {
    anchor: { x: 0.5, y: 1 },
    centerOffset: { x: 0, y: -30 },
  },

  // Configuración de clustering (si lo implementas más adelante)
  CLUSTER_CONFIG: {
    radius: 50,
    maxZoom: 15,
    minZoom: 1,
  },

  // Configuración de tiles de OpenStreetMap
  TILE_CONFIG: {
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maximumZ: 19,
    flipY: false,
  },

  // Configuración de estilos de mapa
  MAP_STYLES: {
    standard: "standard",
    satellite: "satellite",
    hybrid: "hybrid",
    terrain: "terrain",
  },
}

// Función para obtener la configuración de región por defecto
export const getDefaultRegion = () => {
  return OPENSTREET_MAPS_CONFIG.DEFAULT_REGION
}

// Función para obtener configuración de tiles
export const getTileConfig = () => {
  return OPENSTREET_MAPS_CONFIG.TILE_CONFIG
}

// Función para obtener configuración de marcadores
export const getMarkerConfig = () => {
  return OPENSTREET_MAPS_CONFIG.MARKER_CONFIG
}
