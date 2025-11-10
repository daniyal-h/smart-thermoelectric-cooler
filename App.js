import "react-native-gesture-handler";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import ControlScreen from "./app/screens/ControlScreen";
import TrendsScreen from "./app/screens/TrendsScreen";

import icons from "./app/constants/icons";

const Tab = createBottomTabNavigator();
const ICON_SIZE = 30;

export default function App() {
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
