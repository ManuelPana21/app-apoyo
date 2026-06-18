import { Stack } from 'expo-router';
import { theme } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.light.background },
        animationDuration: 400,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="write-memory" />
      <Stack.Screen name="view-memory" />
    </Stack>
  );
}