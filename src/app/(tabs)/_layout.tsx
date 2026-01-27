import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Target, Flower2, User, Calendar } from "lucide-react-native";

function TabIcon({
  Icon,
  focused,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  focused: boolean;
}) {
  return (
    <View
      className={`items-center justify-center ${
        focused ? "opacity-100" : "opacity-60"
      }`}
    >
      <Icon
        size={24}
        color={focused ? "#5c6e4a" : "#94a67e"}
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fdfbf7",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          paddingTop: 8,
          paddingBottom: 30,
        },
        tabBarActiveTintColor: "#5c6e4a",
        tabBarInactiveTintColor: "#94a67e",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ focused }) => <TabIcon Icon={Target} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="retreats"
        options={{
          title: "Retreats",
          tabBarIcon: ({ focused }) => <TabIcon Icon={Calendar} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: "Garden",
          tabBarIcon: ({ focused }) => <TabIcon Icon={Flower2} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
