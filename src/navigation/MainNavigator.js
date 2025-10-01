import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../styles"

// Screens
import DashboardScreen from "../screens/main/DashboardScreen"
import MapScreenWebView from "../screens/main/MapScreenWebView"
import DonationsScreen from "../screens/main/DonationsScreen"
import ProfileScreen from "../screens/main/ProfileScreen"
import CreateDonationScreen from "../screens/main/CreateDonationScreen"
import NotificationsScreen from "../screens/main/NotificationsScreen"

// Profile Stack Screens
import EditProfileScreen from "../screens/main/EditProfileScreen"
import NotificationSettingsScreen from "../screens/main/NotificationSettingsScreen"
import LocationSettingsScreen from "../screens/main/LocationSettingsScreen"
import HelpSupportScreen from "../screens/main/HelpSupportScreen"
import AboutScreen from "../screens/main/AboutScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="CreateDonation"
      component={CreateDonationScreen}
      options={{
        title: "Nueva Donación",
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        title: "Notificaciones",
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
      }}
    />
  </Stack.Navigator>
)

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
)

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline"
          } else if (route.name === "Donations") {
            iconName = focused ? "gift" : "gift-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: "Inicio" }} />
      <Tab.Screen name="Map" component={MapScreenWebView} options={{ title: "Mapa" }} />
      <Tab.Screen name="Donations" component={DonationsScreen} options={{ title: "Donaciones" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  )
}

export default MainNavigator
