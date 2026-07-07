import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveImageToPersistentStorage } from './imageService';

export interface Memory {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUri?: string | null;
}

const MEMORIES_KEY = '@app_memories';

// Obtenemos el arreglo completo de memorias desde el almacenamiento local
export const getMemories = async (): Promise<Memory[]> => {
  try {
    const data = await AsyncStorage.getItem(MEMORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Buscamos una memoria especifica filtrando por su identificador unico
export const getMemoryById = async (id: string): Promise<Memory | null> => {
  try {
    const memories = await getMemories();
    return memories.find(m => m.id === id) || null;
  } catch (error) {
    return null;
  }
};

// Creamos un nuevo objeto de memoria y lo agregamos al inicio de la lista
export const saveMemory = async (title: string, content: string, imageUri?: string | null): Promise<{ success: boolean; persistentUri?: string | null }> => {
  try {
    const memories = await getMemories();
    const persistentUri = imageUri ? await saveImageToPersistentStorage(imageUri) : null;
    const newMemory: Memory = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toLocaleDateString(),
      imageUri: persistentUri,
    };
    
    memories.unshift(newMemory);
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
    return { success: true, persistentUri };
  } catch (error) {
    return { success: false };
  }
};

// Sobrescribimos los datos de una memoria existente buscando su posicion en la lista
export const updateMemory = async (id: string, title: string, content: string, imageUri?: string | null): Promise<{ success: boolean; persistentUri?: string | null }> => {
  try {
    const memories = await getMemories();
    const index = memories.findIndex(m => m.id === id);
    
    if (index > -1) {
      const persistentUri = imageUri ? await saveImageToPersistentStorage(imageUri) : null;
      memories[index] = { ...memories[index], title, content, imageUri: persistentUri };
      await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
      return { success: true, persistentUri };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
};