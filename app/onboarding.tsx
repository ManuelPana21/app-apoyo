import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomButton from '../src/components/CustomButton';
import { theme } from '../src/constants/theme';
import { updateUserProfile } from '../src/services/authService';

export default function OnboardingScreen() {
  const router = useRouter();
  
  // Estados para capturar la informacion del nuevo usuario
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [gender, setGender] = useState('');
  const [hobby1, setHobby1] = useState('');
  const [hobby2, setHobby2] = useState('');
  const [hobby3, setHobby3] = useState('');

  // Funcion para abrir la galeria del celular
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Funcion para guardar los datos y finalizar el recorrido
  const handleSaveAndContinue = async () => {
    const hobbiesArray = [hobby1, hobby2, hobby3].filter(h => h.trim() !== '');
    
    await updateUserProfile({
      profilePicture: imageUri || undefined,
      gender: gender,
      hobbies: hobbiesArray,
      isFirstLogin: false 
    });

    // Redirigimos al panel principal tras guardar
    router.replace('/(tabs)/dashboard');
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
        <Text style={styles.title}>Háblame de ti</Text>
        <Text style={styles.subtitle}>Queremos conocerte un poco mejor para personalizar tu experiencia.</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <Text style={styles.imagePickerText}>Añadir foto de perfil</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>¿Cómo te identificas?</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'Hombre' && styles.genderActive]} 
            onPress={() => setGender('Hombre')}
          >
            <Text style={[styles.genderText, gender === 'Hombre' && styles.genderTextActive]}>Hombre</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'Mujer' && styles.genderActive]} 
            onPress={() => setGender('Mujer')}
          >
            <Text style={[styles.genderText, gender === 'Mujer' && styles.genderTextActive]}>Mujer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'Otro' && styles.genderActive]} 
            onPress={() => setGender('Otro')}
          >
            <Text style={[styles.genderText, gender === 'Otro' && styles.genderTextActive]}>Otro</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Menciona 3 cosas que disfrutes hacer:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Jugar videojuegos, Escuchar música..."
          value={hobby1}
          onChangeText={setHobby1}
        />
        <TextInput
          style={styles.input}
          placeholder="Hobby 2"
          value={hobby2}
          onChangeText={setHobby2}
        />
        <TextInput
          style={styles.input}
          placeholder="Hobby 3"
          value={hobby3}
          onChangeText={setHobby3}
        />

        <View style={styles.buttonContainer}>
          <CustomButton title="Comenzar" onPress={handleSaveAndContinue} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.light.background,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePicker: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  imagePickerText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: theme.colors.light.primary,
    borderColor: theme.colors.light.primary,
  },
  genderText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  genderTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  }
});