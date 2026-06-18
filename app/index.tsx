import { useRouter } from 'expo-router';
import { useState } from 'react';
// Agregamos Image a las importaciones
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import CustomAlert from '../src/components/CustomAlert';
import CustomButton from '../src/components/CustomButton';
import CustomInput from '../src/components/CustomInput';
import { theme } from '../src/constants/theme';
import { login } from '../src/services/authService';

export default function HomeScreen() {
  // Variables para guardar lo que el usuario escribe
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Variables para controlar la ventana de alerta en pantalla
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const router = useRouter();

  // Funcion que se ejecuta al presionar Iniciar Sesion
  const handleLogin = async () => {
    // Llamamos al servicio con el nuevo nombre
    const result = await login(username, password);
    
    if (result.success && result.user) {
      // Verificamos desde result.user si faltan datos
      if (result.user.isFirstLogin || !result.user.gender) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      // Configuramos y mostramos tu alerta personalizada en caso de fallar
      setAlertTitle('Error de acceso');
      setAlertMessage(result.error || 'Credenciales incorrectas');
      setAlertVisible(true);
    }
  };

  // La funcion de la alerta se limpia
  const handleCloseAlert = () => {
    // Solo apagamos la alerta, sin intentar navegar ni leer usuarios
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