# App Móvil - Sistema de Donación de Alimentos

Aplicación móvil para iOS y Android que conecta donantes de alimentos con organizaciones benéficas, construida con React Native y Expo.

## Descripción

Aplicación móvil que permite a usuarios donar alimentos excedentes y a organizaciones benéficas encontrar y reservar donaciones disponibles. Incluye mapa interactivo, gestión de perfil, notificaciones y sistema de reservas en tiempo real.

## Características

- Registro e inicio de sesión con autenticación JWT
- Dos tipos de usuarios: Donantes y Organizaciones
- Publicación de donaciones con ubicación en mapa
- Búsqueda y filtrado de donaciones disponibles
- Reserva y gestión de donaciones
- Mapa interactivo con Leaflet
- Perfil de usuario editable
- Notificaciones push
- Recuperación de contraseña por email
- Dashboard con estadísticas

## Tecnologías

- **React Native** - Framework móvil
- **Expo** v51 - Plataforma de desarrollo
- **React Navigation** v6 - Navegación
- **Leaflet** - Mapas interactivos
- **Expo Location** - Geolocalización
- **AsyncStorage** - Almacenamiento local
- **Axios** - Cliente HTTP

## Requisitos Previos

- Node.js v14 o superior
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app en tu dispositivo móvil (para testing)
- Android Studio (para emulador Android) o Xcode (para simulador iOS)

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <url-del-repositorio>
cd appDonaciones
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura la URL del backend en `src/config/api.js`:
\`\`\`javascript
export const API_CONFIG = {
  // Desarrollo local
  DEV_URL: 'http://192.168.1.5:3000',
  
  // Producción
  PROD_URL: 'https://tu-backend.railway.app',
}
\`\`\`

## Ejecutar la Aplicación

### Modo Desarrollo

\`\`\`bash
# Iniciar Expo
npm start

# O específicamente para cada plataforma
npm run android  # Android
npm run ios      # iOS
npm run web      # Web (experimental)
\`\`\`

Escanea el código QR con:
- **iOS**: Cámara del iPhone
- **Android**: App Expo Go

### Emuladores

**Android:**
\`\`\`bash
npm run android
\`\`\`
Requiere Android Studio instalado

**iOS (solo macOS):**
\`\`\`bash
npm run ios
\`\`\`
Requiere Xcode instalado

## Estructura del Proyecto

\`\`\`
appDonaciones/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── DonationCard.js
│   │   └── LoadingSpinner.js
│   ├── contexts/          # Context API
│   │   └── AuthContext.js
│   ├── navigation/        # Configuración de navegación
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/           # Pantallas de la app
│   │   ├── auth/          # Pantallas de autenticación
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── ForgotPasswordScreen.js
│   │   │   └── ChangePasswordScreen.js
│   │   └── main/          # Pantallas principales
│   │       ├── DashboardScreen.js
│   │       ├── MapScreenWebView.js
│   │       ├── CreateDonationScreen.js
│   │       ├── ProfileScreen.js
│   │       ├── EditProfileScreen.js
│   │       ├── NotificationsScreen.js
│   │       └── HelpSupportScreen.js
│   ├── services/          # Servicios y API
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── donationService.js
│   ├── config/            # Configuración
│   │   └── api.js
│   └── utils/             # Utilidades
│       └── colors.js
├── assets/                # Recursos estáticos
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── app.json              # Configuración de Expo
├── package.json          # Dependencias
└── README.md            # Esta documentación
\`\`\`

## Configuración

### API Backend

Edita `src/config/api.js`:

\`\`\`javascript
export const API_CONFIG = {
  DEV_URL: 'http://TU_IP_LOCAL:3000',
  PROD_URL: 'https://tu-backend-produccion.com',
}

// Forzar modo producción para testing
export const FORCE_PRODUCTION = false
\`\`\`

### Colores y Tema

Edita `src/utils/colors.js`:

\`\`\`javascript
export const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  // ... más colores
}
\`\`\`

## Tipos de Usuario

### Donante (donor)
- Publicar donaciones
- Ver donaciones publicadas
- Gestionar donaciones activas
- Ver estadísticas de impacto

### Organización (organization)
- Buscar donaciones disponibles
- Reservar donaciones
- Ver donaciones recibidas
- Configurar días de recolección
- Ver estadísticas de donaciones recibidas

## Flujo de la Aplicación

1. **Registro/Login** → Usuario crea cuenta o inicia sesión
2. **Dashboard** → Vista principal con estadísticas
3. **Mapa** → Visualización de donaciones disponibles
4. **Crear Donación** (Donantes) → Publicar nueva donación
5. **Reservar** (Organizaciones) → Reservar donación disponible
6. **Perfil** → Gestionar información personal

## Navegación

La app usa React Navigation con tres navegadores:

1. **AppNavigator** - Navegador raíz
2. **AuthNavigator** - Pantallas de autenticación (Stack)
3. **MainNavigator** - Pantallas principales (Bottom Tabs)

### Tabs Principales

- **Dashboard** - Vista general y estadísticas
- **Mapa** - Mapa interactivo con donaciones
- **Nueva Donación** - Crear donación (solo donantes)
- **Perfil** - Perfil de usuario

## Servicios

### authService.js
Maneja autenticación y gestión de tokens:
- `login(email, password)`
- `register(userData)`
- `logout()`
- `getToken()`
- `getUser()`

### donationService.js
Maneja operaciones de donaciones:
- `createDonation(donationData)`
- `getDonations(filters)`
- `reserveDonation(id)`
- `completeDonation(id)`
- `cancelReservation(id)`

### api.js
Cliente HTTP configurado con interceptores para:
- Agregar token JWT automáticamente
- Manejar errores de red
- Timeout de 30 segundos

## Permisos

La app requiere los siguientes permisos:

- **Ubicación** - Para mostrar ubicación en el mapa
- **Notificaciones** - Para recibir alertas (opcional)

## Build para Producción

### Android (APK)

\`\`\`bash
# Build APK
expo build:android

# O con EAS (recomendado)
eas build --platform android
\`\`\`

### iOS (IPA)

\`\`\`bash
# Build IPA
expo build:ios

# O con EAS (recomendado)
eas build --platform ios
\`\`\`

### Configuración EAS

1. Instala EAS CLI:
\`\`\`bash
npm install -g eas-cli
\`\`\`

2. Configura el proyecto:
\`\`\`bash
eas build:configure
\`\`\`

3. Build:
\`\`\`bash
eas build --platform all
\`\`\`

## Publicación

### Google Play Store

1. Genera APK/AAB firmado
2. Crea cuenta de desarrollador ($25 único pago)
3. Sube el APK/AAB
4. Completa la información de la app
5. Publica

### Apple App Store

1. Genera IPA firmado
2. Crea cuenta de desarrollador ($99/año)
3. Sube el IPA con Transporter
4. Completa la información en App Store Connect
5. Envía para revisión

## Testing

### Testing Manual

1. Inicia la app en Expo Go
2. Prueba cada flujo:
   - Registro de usuario
   - Login
   - Crear donación
   - Reservar donación
   - Editar perfil
   - Recuperar contraseña

### Testing en Dispositivos

**Android:**
- Instala Expo Go desde Play Store
- Escanea el QR code

**iOS:**
- Instala Expo Go desde App Store
- Escanea el QR code con la cámara

## Troubleshooting

### Error: "Network request failed"
- Verifica que el backend esté corriendo
- Verifica la URL en `src/config/api.js`
- Asegúrate de estar en la misma red (desarrollo local)

### Error: "Unable to resolve module"
- Limpia caché: `expo start -c`
- Reinstala dependencias: `rm -rf node_modules && npm install`

### Mapa no carga
- Verifica conexión a internet
- Revisa permisos de ubicación
- Verifica que Leaflet esté cargando correctamente

### App muy lenta
- Habilita Hermes en `app.json`
- Optimiza imágenes
- Reduce dependencias no usadas

## Optimización

### Reducir Tamaño

1. Habilita Hermes:
\`\`\`json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
\`\`\`

2. Optimiza imágenes:
\`\`\`bash
# Instala imagemin
npm install -g imagemin-cli

# Optimiza imágenes
imagemin assets/*.png --out-dir=assets/optimized
\`\`\`

3. Analiza bundle:
\`\`\`bash
npx react-native-bundle-visualizer
\`\`\`

### Mejorar Performance

- Usa `React.memo()` para componentes
- Implementa `useMemo()` y `useCallback()`
- Lazy loading de pantallas
- Optimiza re-renders

## Variables de Entorno

Para producción, configura:

\`\`\`javascript
// src/config/api.js
export const API_CONFIG = {
  PROD_URL: process.env.EXPO_PUBLIC_API_URL || 'https://default-url.com',
}
\`\`\`

## Logs y Debugging

La app incluye logs detallados:
- `[AUTH]` - Autenticación
- `[API]` - Llamadas API
- `[DONATION]` - Operaciones de donaciones
- `[MAP]` - Operaciones del mapa
- `[LOCATION]` - Geolocalización


## Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto no tiene licencia definida actualmente. Todos los derechos reservados.

## Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

## Contacto

Para más información sobre el proyecto, consulta la documentación técnica o contacta al equipo de desarrollo.
