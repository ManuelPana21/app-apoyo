import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomAlert from '../src/components/CustomAlert';
import CustomButton from '../src/components/CustomButton';
import CustomInput from '../src/components/CustomInput';
import { theme } from '../src/constants/theme';
import { login } from '../src/services/authService';

// Esta funcion es la pantalla inicial que lee Expo al abrir la app
export default function Index() {
  const router = useRouter();
  
  // Controla la pantalla de carga inicial
  const [isChecking, setIsChecking] = useState(true);

  // Estados de los inputs y alertas que faltaban
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Revisa la memoria al cargar la pantalla
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session === 'active') {
          router.replace('/(tabs)/dashboard');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    };
    
    checkSession();
  }, []);

  // Muestra el fondo blanco mientras lee la memoria
  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  // Funcion que se ejecuta al presionar Iniciar Sesion
  const handleLogin = async () => {
    // Llamamos al servicio de autenticacion
    const result = await login(username, password);

    if (result.success && result.user) {
      try {
        // Guardamos la sesión aquí
        await AsyncStorage.setItem('user_session', 'active');
      } catch (error) {
        console.log('Error guardando la sesión en memoria', error);
      }

      // Verificamos si es primera vez o faltan datos para mandarlo al onboarding
      if (result.user.isFirstLogin || !result.user.gender) {
        router.replace('/onboarding');
      } else {
        // Si ya tiene todo completo lo mandamos al dashboard
        router.replace('/(tabs)/dashboard');
      }
    } else {
      // Configuramos y mostramos la alerta en caso de fallar
      setAlertTitle('Error de acceso');
      setAlertMessage(result.error || 'Credenciales incorrectas');
      setAlertVisible(true);
    }
  };

  // Funcion para cerrar la alerta en pantalla
  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: theme.colors.light.background }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={require('../assets/imagen_login.png')} 
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bienvenido</Text>
        
        <CustomInput
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          isDark={false}
        />

        <CustomInput
          placeholder="Contraseña"
          value={password}
          isDark={false}
          isPassword={true}
          onChangeText={setPassword}
        />

        <CustomButton 
          title="Iniciar Sesión" 
          onPress={handleLogin} 
        />

        <CustomButton 
          title="Registrarse" 
          onPress={() => router.push('/register')} 
          style={{ marginTop: 15 }} 
        />

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.light.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 180,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  }
});