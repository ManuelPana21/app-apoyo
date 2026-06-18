import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../src/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

// Definimos la interfaz estricta para el componente animado
interface AnimatedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  size: number;
}

const AnimatedIcon = ({ name, color, focused, size }: AnimatedIconProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      friction: 4,
      tension: 50,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: theme.colors.light.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          textTransform: 'none',
          marginBottom: insets.bottom > 0 ? 5 : 10,
        },
        tabBarIndicatorStyle: {
          backgroundColor: 'transparent',
        },
        tabBarContentContainerStyle: {
          height: 60,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          // Le decimos explicitamente a TS qué tipos de datos estamos recibiendo
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="home" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="memories"
        options={{
          title: 'Cuaderno',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="book" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="person" color={color} focused={focused} size={22} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}