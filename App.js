import "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "@expo-google-fonts/inter";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from "@expo-google-fonts/rajdhani";

import ControlScreen from "./app/screens/ControlScreen";
import TrendsScreen from "./app/screens/TrendsScreen";

import icons from "./app/constants/icons";

const Tab = createBottomTabNavigator();
const ICON_SIZE = 30;

// todo: fonts, background colour, and typography (slider and buttons in dt2)

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  // display a loading screen if fonts have not loaded
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Control"
          component={ControlScreen}
          options={{
            tabBarIcon: ({ color }) => icons.control(color, ICON_SIZE),
          }}
        />
        <Tab.Screen
          name="Trends"
          component={TrendsScreen}
          options={{
            tabBarIcon: ({ color }) => icons.trends(color, ICON_SIZE),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
