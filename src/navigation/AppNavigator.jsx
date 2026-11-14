import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen.jsx';
import IdeasScreen from '../screens/IdeasScreen.jsx';
import IdeaDetailScreen from '../screens/IdeaDetailScreen.jsx';
import CameraSettingsScreen from '../screens/CameraSettingsScreen.jsx';
import JournalScreen from '../screens/JournalScreen.jsx';
import AddShootScreen from '../screens/AddShootScreen.jsx';
import ShootDetailScreen from '../screens/ShootDetailScreen.jsx';
import CategoriesScreen from '../screens/CategoriesScreen.jsx';
import FavoritesScreen from '../screens/FavoritesScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';

const COLORS = {
  background: '#101114',
  card: '#1C1E23',
  secondary: '#292C33',
  primary: '#F2A65A',
  white: '#FFFFFF',
  muted: '#92949B',
  border: '#30333A',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dark theme for the whole navigation container
const NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.white,
    border: COLORS.border,
    notification: COLORS.primary,
  },
};

// Icon names for each tab: [focused, unfocused]
const TAB_ICONS = {
  Dashboard: ['grid', 'grid-outline'],
  Ideas: ['bulb', 'bulb-outline'],
  Journal: ['book', 'book-outline'],
  Favorites: ['heart', 'heart-outline'],
  Settings: ['settings', 'settings-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons[0] : icons[1];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerTitle: 'LensLog' }} />
      <Tab.Screen name="Ideas" component={IdeasScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IdeaDetail"
          component={IdeaDetailScreen}
          options={{ title: 'Idea Details' }}
        />
        <Stack.Screen
          name="CameraSettings"
          component={CameraSettingsScreen}
          options={{ title: 'Camera Settings' }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Categories' }}
        />
        <Stack.Screen
          name="AddShoot"
          component={AddShootScreen}
          options={{ title: 'Photoshoot' }}
        />
        <Stack.Screen
          name="ShootDetail"
          component={ShootDetailScreen}
          options={{ title: 'Shoot Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}