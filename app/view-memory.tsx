import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../src/components/CustomAlert';
import CustomButton from '../src/components/CustomButton';
import { getMemoryById, Memory, updateMemory } from '../src/services/memoryService';

export default function ViewMemoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Estado para la memoria original
  const [memory, setMemory] = useState<Memory | null>(null);

  // Estados para el modo de edicion
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  // Estados para alertas y modales
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [fullImageVisible, setFullImageVisible] = useState(false);

  const LINE_HEIGHT = 30;

  // Carga inicial de datos al entrar a la pantalla
  useEffect(() => {
    if (id) {
      loadMemoryData();
    }
  }, [id]);

  // Obtiene la memoria de la base local y prepara los estados de edicion
  const loadMemoryData = async () => {
    const data = await getMemoryById(id);
    if (data) {
      setMemory(data);
      setEditTitle(data.title || '');
      setEditContent(data.content);
      setEditImageUri(data.imageUri || null);
    }
  };

  // Abre la galeria para seleccionar o cambiar la foto
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditImageUri(result.assets[0].uri);
    }
  };

  // Valida y envia los cambios al servicio de almacenamiento
  const handleSaveEdit = async () => {
    if (editContent.trim() === '') {
      setAlertConfig({ title: 'Nota vacía', message: 'El contenido no puede estar vacío.' });
      setAlertVisible(true);
      return;
    }

    const result = await updateMemory(id, editTitle, editContent, editImageUri);

    if (result.success) {
      setMemory({ ...memory!, title: editTitle, content: editContent, imageUri: editImageUri });
      setIsEditing(false);
      setAlertConfig({ title: 'Actualizado', message: 'Tu memoria ha sido editada correctamente.' });
      setAlertVisible(true);
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
        {/* Cabecera del cuaderno */}
        <View style={styles.notebookHeader}>
          <Text style={styles.headerLabel}>Asunto:</Text>

          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título de la memoria"
            />
          ) : (
            <Text style={styles.titleText}>{memory?.title}</Text>
          )}
        </View>

        {/* Cuerpo del cuaderno simulando papel rayado */}
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
            value={isEditing ? editContent : memory?.content}
            onChangeText={setEditContent}
            editable={isEditing}
            scrollEnabled={false}
          />

          {/* Seccion de la imagen al final del texto */}
          <View style={styles.imageSection}>
            
            {!isEditing && memory?.imageUri && (
              <TouchableOpacity onPress={() => setFullImageVisible(true)} activeOpacity={0.8}>
                <Image source={{ uri: memory.imageUri }} style={styles.previewImage} />
              </TouchableOpacity>
            )}
            
            {isEditing && (
              <View>
                {editImageUri && <Image source={{ uri: editImageUri }} style={styles.previewImage} />}
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color="#A09A78" />
                  <Text style={styles.imageButtonText}>
                    {editImageUri ? 'Cambiar foto' : 'Agregar foto'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Controles inferiores que cambian segun el modo */}
        {isEditing ? (
          <View style={styles.buttonRow}>
            <View style={styles.flexButton}>
              <CustomButton
                title="Guardar"
                onPress={handleSaveEdit}
                color="#B9F6CA"
              />
            </View>
            <View style={styles.flexButton}>
              <CustomButton
                title="Cancelar"
                onPress={() => {
                  setEditTitle(memory?.title || '');
                  setEditContent(memory?.content || '');
                  setEditImageUri(memory?.imageUri || null);
                  setIsEditing(false);
                }}
                color="#FFD1DC"
              />
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <View style={styles.flexButton}>
              <CustomButton
                title="Editar"
                onPress={() => setIsEditing(true)}
                color="#FFE4B5" 
              />
            </View>
            <View style={styles.flexButton}>
              <CustomButton
                title="Regresar"
                onPress={() => router.back()}
                color="#B9F6CA"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Visor de imagen en pantalla completa */}
      <Modal
        visible={fullImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullImageVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalImageContainer}>
            <Image 
              source={{ uri: memory?.imageUri || undefined }} 
              style={styles.fullSizeImage} 
              resizeMode="contain" 
            />
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setFullImageVisible(false)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Alerta general del sistema */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
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
  titleText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    borderRadius: 5,
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
  flexButton: {
    flex: 1,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImageContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fullSizeImage: {
    width: '100%',
    height: 400, 
    borderRadius: 10,
  },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  closeModalText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});