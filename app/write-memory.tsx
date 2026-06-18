import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../src/components/CustomAlert';
import CustomButton from '../src/components/CustomButton';
import { saveMemory } from '../src/services/memoryService';

export default function WriteMemoryScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const LINE_HEIGHT = 30;

  // Maneja la apertura de la galeria y la seleccion de la imagen
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (content.trim() === '') {
      setAlertConfig({ title: 'Nota vacía', message: 'Escribe algo antes de guardar tu memoria.' });
      setAlertVisible(true);
      return;
    }
    // Enviamos el titulo el contenido y la ruta de la imagen al servicio
    const result = await saveMemory(title, content, imageUri);
    if (result.success) {
      setAlertConfig({ title: 'Guardado', message: 'Tu memoria ha sido almacenada.' });
      setAlertVisible(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertConfig.title === 'Guardado') {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          { paddingBottom: insets.bottom + 20 } 
        ]}
      >
        <View style={styles.notebookHeader}>
          <Text style={styles.headerLabel}>Asunto:</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Opcional (título)"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#A09A78"
          />
        </View>

        <View style={styles.paper}>
          <View style={styles.linesBackground}>
            {Array.from({ length: 50 }).map((_, i) => (
              <View key={i} style={[styles.line, { height: LINE_HEIGHT }]} />
            ))}
          </View>
          <View style={styles.verticalMargin} />
          
          <TextInput
            style={[styles.contentInput, { lineHeight: LINE_HEIGHT }]}
            multiline
            placeholder="Querido diario..."
            value={content}
            onChangeText={setContent}
            placeholderTextColor="#A09A78"
            scrollEnabled={false}
          />

          {/* Renderizado opcional de la imagen seleccionada y boton de camara */}
          <View style={styles.imageSection}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#A09A78" />
              <Text style={styles.imageButtonText}>{imageUri ? 'Cambiar foto' : 'Agregar foto'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={{ flex: 1 }}>
            <CustomButton 
              title="Guardar" 
              onPress={handleSave} 
              color="#B9F6CA" 
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomButton 
              title="Cancelar" 
              onPress={() => router.back()} 
              color="#FFD1DC" 
            />
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleCloseAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 50,
  },
  notebookHeader: {
    backgroundColor: '#E2E3E5',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#B0B1B3',
  },
  headerLabel: {
    fontWeight: 'bold',
    color: '#4B5563',
    marginRight: 10,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  paper: {
    backgroundColor: '#FFF9C4',
    minHeight: 450,
    paddingLeft: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  linesBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  verticalMargin: {
    position: 'absolute',
    left: 40,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFB7B7',
    zIndex: 1,
  },
  contentInput: {
    fontSize: 18,
    color: '#374151',
    textAlignVertical: 'top',
    paddingTop: 0, 
    minHeight: 350,
    zIndex: 2,
  },
  line: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8B4',
  },
  buttonRow: {
    flexDirection: 'row', 
    marginTop: 25,
    gap: 15, 
  },
  imageSection: {
    paddingRight: 15,
    paddingBottom: 20,
    paddingTop: 10,
    zIndex: 2,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: '#A09A78',
    marginLeft: 8,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  }
});