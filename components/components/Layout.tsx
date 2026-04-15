import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home as HomeIcon, TrendingUp } from "lucide-react-native";
import Growth from "../../app/Growth";
import Home from "../../app/Home";

const Tab = createBottomTabNavigator();

export default function Layout() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4CAF7A",
        tabBarInactiveTintColor: "#7A8A8A",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <HomeIcon color={color} size={size ?? 20} />;
          }
          if (route.name === "Growth") {
            return <TrendingUp color={color} size={size ?? 20} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: "Home" }} />
      <Tab.Screen name="Growth" component={Growth} options={{ title: "Growth" }} />
    </Tab.Navigator>
  );
}