import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomButton from '../../src/components/CustomButton';
import { theme } from '../../src/constants/theme';
import { getCurrentUser, updateUserProfile, User } from '../../src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editHobbies, setEditHobbies] = useState<string[]>([]);
  const [editFullName, setEditFullName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
  const userData = await getCurrentUser();
  if (userData) {
    setUser(userData);
    setEditImage(userData.profilePicture || null);
    setEditHobbies(userData.hobbies || ['', '', '']);
    setEditFullName(userData.fullName); // Nueva línea
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  const updateHobby = (text: string, index: number) => {
    const newHobbies = [...editHobbies];
    newHobbies[index] = text;
    setEditHobbies(newHobbies);
  };

  const handleSave = async () => {
  const cleanHobbies = editHobbies.filter(h => h.trim() !== '');
  const success = await updateUserProfile({
    fullName: editFullName, // Se incluye el nombre editado
    profilePicture: editImage || undefined,
    hobbies: cleanHobbies
  });

  if (success) {
    await loadUserData();
    setIsEditing(false);
  }
};

  const handleLogout = () => {
    router.replace('/');
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView 
      // Le devolvemos el comportamiento 'undefined' a Android para que use su sistema nativo
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: theme.colors.light.background }} 
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      > 
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editText}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            {isEditing ? (
              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {editImage ? (
                  <Image source={{ uri: editImage }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.placeholderAvatar]}>
                    <Ionicons name="person" size={60} color="#94a3b8" />
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>✏️</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageContainer}>
                {user.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.placeholderAvatar]}>
                    <Ionicons name="person" size={60} color="#94a3b8" />
                  </View>
                )}
              </View>
            )}

            {isEditing ? (
              <TextInput
                style={[styles.input, { textAlign: 'center', fontWeight: 'bold', fontSize: 22, width: '100%' }]}
                placeholder="Nombre completo"
                value={editFullName}
                onChangeText={setEditFullName}
              />
            ) : (
              <Text style={styles.name}>{user.fullName}</Text>
            )}
            
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.gender}>{user.gender || 'Sin especificar'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Mis pasatiempos</Text>
            
            {isEditing ? (
              <View>
                {[0, 1, 2].map((i) => (
                  <TextInput
                    key={i}
                    style={styles.input}
                    placeholder={`Hobby ${i + 1}`}
                    value={editHobbies[i] || ''}
                    onChangeText={(text) => updateHobby(text, i)}
                  />
                ))}
                <CustomButton title="Guardar Cambios" onPress={handleSave} />
              </View>
            ) : (
              <View style={styles.hobbiesContainer}>
                {user.hobbies && user.hobbies.length > 0 ? (
                  user.hobbies.map((hobby, index) => (
                    <View key={index} style={styles.hobbyBadge}>
                      <Text style={styles.hobbyText}>{hobby}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Aún no has agregado pasatiempos.</Text>
                )}
              </View>
            )}
          </View>

          {!isEditing && (
            <View style={styles.logoutContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  editText: {
    color: theme.colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    elevation: 2,
  },
  editBadgeText: {
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  username: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 5,
  },
  gender: {
    fontSize: 14,
    color: theme.colors.light.primary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 15,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hobbyBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  hobbyText: {
    color: '#334155',
    fontWeight: '500',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});