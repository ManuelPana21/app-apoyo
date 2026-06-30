import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../src/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

// Interfaz para controlar las propiedades del icono animado
interface AnimatedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  size: number;
}

// Componente para gestionar la animacion de escala al presionar una pestaña
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
  
  // Estado para controlar si mostramos la etiqueta
  const [isHabitsNew, setIsHabitsNew] = useState(true);

  // Verificamos la memoria al cargar la barra
  useEffect(() => {
    const checkHabitsStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenHabitsTab');
        if (hasSeen === 'true') {
          setIsHabitsNew(false);
        }
      } catch (error) {
        console.log('Error leyendo estado de la pestaña');
      }
    };
    checkHabitsStatus();
  }, []);

  // Funcion que se dispara al tocar la pestaña
  const handleHabitsPress = async () => {
    if (isHabitsNew) {
      setIsHabitsNew(false);
      try {
        await AsyncStorage.setItem('hasSeenHabitsTab', 'true');
      } catch (error) {
        console.log('Error guardando estado de la pestaña');
      }
    }
  };

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
          // Declaramos explicitamente que color es un texto y focused es un booleano
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="home" color={color} focused={focused} size={22} />
          ),
        }}
      />
      
      {/* Nueva pestaña de habitos con el indicador visual de novedad */}
      <MaterialTopTabs.Screen
        name="habits"
        // Agregamos el listener para detectar el toque
        listeners={{
          tabPress: handleHabitsPress,
        }}
        options={{
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="checkmark-circle-outline" color={color} focused={focused} size={22} />
          ),
          tabBarLabel: ({ color }: { color: string }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: insets.bottom > 0 ? 5 : 10 }}>
              <Text style={{ color, fontSize: 12, textTransform: 'none' }}>Hábitos</Text>
              
              {/* Condicionamos el renderizado de la viñeta */}
              {isHabitsNew && (
                <View style={{ backgroundColor: '#EF4444', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, marginLeft: 4 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' }}>New</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <MaterialTopTabs.Screen
        name="memories"
        options={{
          title: 'Cuaderno',
          // Tipado estricto aplicado al cuaderno
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="book" color={color} focused={focused} size={22} />
          ),
        }}
      />
      
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          // Tipado estricto aplicado al perfil
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <AnimatedIcon name="person" color={color} focused={focused} size={22} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}