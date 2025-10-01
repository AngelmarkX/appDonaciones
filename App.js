import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider } from "./src/contexts/AuthContext"
import { NotificationProvider } from "./src/contexts/NotificationContext"
import AppNavigator from "./src/navigation/AppNavigator"
import { registerRootComponent } from "expo"

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  )
}

registerRootComponent(App)
export default App
