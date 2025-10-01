# Food Donation App

Una aplicación móvil desarrollada con React Native y Expo que conecta donantes de alimentos con organizaciones benéficas para reducir el desperdicio de alimentos.

## 🚀 Características

- **Autenticación completa** con JWT
- **Dashboard personalizado** según tipo de usuario (donante/organización)
- **Gestión de donaciones** con categorías y estados
- **Base de datos MySQL** con estructura completa
- **API REST** con Node.js y Express
- **Interfaz intuitiva** con componentes reutilizables
- **Notificaciones** en tiempo real
- **Navegación fluida** con React Navigation

## 📱 Funcionalidades

### Para Donantes
- Crear nuevas donaciones
- Ver historial de donaciones
- Gestionar estado de donaciones
- Estadísticas personales

### Para Organizaciones
- Explorar donaciones disponibles
- Ver donaciones en mapa
- Reservar donaciones
- Contactar donantes

## 🛠️ Tecnologías

### Frontend (React Native)
- **React Native** con Expo
- **React Navigation** para navegación
- **Context API** para gestión de estado
- **Axios** para llamadas HTTP
- **Expo Vector Icons** para iconografía

### Backend (Node.js)
- **Express.js** como framework web
- **MySQL** como base de datos
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas
- **CORS** para manejo de peticiones cross-origin

## 📦 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL Server
- Expo CLI
- Dispositivo móvil con Expo Go o emulador

### 1. Configurar Base de Datos
\`\`\`bash
# Instalar MySQL y ejecutar el script
mysql -u root -p < database/food_donation_db.sql
\`\`\`

### 2. Configurar Backend
\`\`\`bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Iniciar servidor
npm start
\`\`\`

### 3. Configurar Frontend
\`\`\`bash
# Instalar dependencias
npm install

# Actualizar IP del servidor en los servicios
# Editar src/services/authService.js y src/services/donationService.js
# Cambiar 'http://192.168.1.100:3000' por tu IP local

# Iniciar aplicación
npm start
\`\`\`

## 🔧 Configuración

### Variables de Entorno (Backend)
\`\`\`env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=food_donation_db
JWT_SECRET=tu_jwt_secret
\`\`\`

### Configuración de IP
Actualiza la IP en los archivos de servicios:
- `src/services/authService.js`
- `src/services/donationService.js`

Cambia `192.168.1.100` por tu IP local.

## 📊 Estructura de Base de Datos

### Tablas Principales
- **users**: Información de usuarios (donantes y organizaciones)
- **donations**: Donaciones con detalles y estado
- **notifications**: Sistema de notificaciones
- **donation_history**: Historial de cambios en donaciones

## 🎯 Uso

### Registro y Login
1. Abre la aplicación
2. Selecciona "Comenzar" para registrarte
3. Elige tu tipo de usuario (Donante u Organización)
4. Completa el formulario de registro
5. Inicia sesión con tus credenciales

### Crear Donación (Donantes)
1. Ve al Dashboard
2. Toca "Nueva Donación"
3. Completa la información de la donación
4. Selecciona categoría y cantidad
5. Añade dirección de recogida
6. Confirma la creación

### Explorar Donaciones (Organizaciones)
1. Ve a la pestaña "Mapa"
2. Explora donaciones disponibles
3. Ve detalles de cada donación
4. Contacta al donante si es necesario

## 🔄 Estados de Donación

- **available**: Disponible para reservar
- **reserved**: Reservada por una organización
- **completed**: Donación completada
- **expired**: Donación expirada

## 🎨 Componentes Reutilizables

- **Button**: Botón personalizable con variantes
- **Input**: Campo de entrada con validación
- **Card**: Contenedor con sombra y padding
- **Badge**: Etiqueta de estado con colores

## 📱 Navegación

### Stack de Autenticación
- Welcome Screen
- Login Screen
- Register Screen
- Forgot Password Screen

### Stack Principal (Tabs)
- Dashboard
- Map
- Donations
- Profile

## 🚀 Próximas Características

- [ ] Mapas interactivos con geolocalización
- [ ] Notificaciones push con Firebase
- [ ] Chat entre donantes y organizaciones
- [ ] Sistema de calificaciones
- [ ] Filtros avanzados de búsqueda
- [ ] Modo oscuro
- [ ] Compartir donaciones en redes sociales

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Verifica la configuración de IP y base de datos
3. Asegúrate de que el backend esté ejecutándose
4. Verifica que Expo Go esté actualizado

## 🙏 Agradecimientos

- Expo team por la excelente plataforma
- React Navigation por la navegación fluida
- MySQL por la base de datos robusta
- Toda la comunidad de React Native
