import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import CustomAlert from '../src/components/CustomAlert';
import CustomButton from '../src/components/CustomButton';
import CustomInput from '../src/components/CustomInput';
import { theme } from '../src/constants/theme';
import { register } from '../src/services/authService';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const router = useRouter();

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const showMismatch = password !== confirmPassword && confirmPassword.length > 0;

  // Controlador asincrono para procesar los datos y guardarlos localmente
  const handleRegister = async () => {
    if (!displayName || !loginUsername || !password || !confirmPassword) {
      setAlertTitle('Atención');
      setAlertMessage('Por favor, completa todos los campos.');
      setAlertVisible(true);
      return;
    }

    if (!passwordsMatch) {
      setAlertTitle('Atención');
      setAlertMessage('Las contraseñas no coinciden. Revisa los datos.');
      setAlertVisible(true);
      return;
    }
    
    // Llamamos al servicio para escribir los datos en el almacenamiento interno
    const result = await register(displayName, loginUsername, password);
    
    if (result.success) {
      // Como es un usuario nuevo, lo mandamos directo al onboarding
      router.replace('/onboarding');
    } else {
      // Manejo de errores (ej. "El usuario ya existe")
      alert(result.error);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertTitle === 'Completado') {
      router.back();
    }
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
        <Text style={styles.title}>Crea tu perfil</Text>
        
        <CustomInput
          placeholder="Nombre completo"
          value={displayName}
          onChangeText={setDisplayName}
          isDark={false}
        />

        <CustomInput
          placeholder="Nombre de usuario"
          value={loginUsername}
          onChangeText={setLoginUsername}
          isDark={false}
        />

        <CustomInput
          placeholder="Contraseña"
          value={password}
          isDark={false}
          isPassword={true}
          onChangeText={setPassword}
        />

        <CustomInput
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          isDark={false}
          isPassword={true}
          onChangeText={setConfirmPassword}
        />

        {showMismatch && <Text style={styles.mismatchIndicator}>Las contraseñas no coinciden</Text>}
        {passwordsMatch && <Text style={styles.matchIndicator}>Las contraseñas coinciden</Text>}

        <CustomButton 
          title="Registrarme" 
          onPress={handleRegister} 
        />

        <CustomButton 
          title="Volver al Login" 
          onPress={() => router.back()} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
    padding: 20,
    justifyContent: 'center',
    paddingBottom: 180,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordContainer: {
    justifyContent: 'center',
    position: 'relative',
  },
  matchIndicator: {
    fontSize: 14, 
    fontWeight: 'bold',
    color: '#4CAF50', 
    marginTop: 5,    
    marginBottom: 10, 
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  mismatchIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  }
});