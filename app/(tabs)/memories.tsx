import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../src/constants/theme';
import { getMemories, Memory } from '../../src/services/memoryService';

export default function MemoriesScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const router = useRouter();

  // Se ejecuta de forma automatica al entrar a la pestaña
  useFocusEffect(
    useCallback(() => {
      loadMemories();
    }, [])
  );

  const loadMemories = async () => {
    const data = await getMemories();
    setMemories(data);
  };

  // Esta funcion dibuja cada libretita individual en la cuadricula
  const renderNotebook = ({ item }: { item: any }) => {
    
    if (item.isAddButton) {
      return (
        <TouchableOpacity 
          style={[styles.miniNotebook, styles.addNotebook]} 
          onPress={() => router.push('/write-memory')}
        >
          <Ionicons name="add" size={40} color="#A09A78" />
          <Text style={styles.addText}>Nueva</Text>
        </TouchableOpacity>
      );
    }

    // Diseño de libreta interactiva conectado a la pantalla de lectura
    return (
      <TouchableOpacity 
        style={styles.miniNotebook} 
        // Cambiamos el console.log por el salto de pantalla con parametros
        onPress={() => router.push({ pathname: '/view-memory', params: { id: item.id } })}
      >
        <View style={styles.redLine} />
        
        <Text style={styles.memoryTitle} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.memoryDate}>{item.date}</Text>
      </TouchableOpacity>
    );
  };
  
  // Truco: Metemos un objeto falso al inicio de la lista para que actue como boton
  const listData = [{ id: 'add_btn', isAddButton: true }, ...memories];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tu Cuaderno</Text>
      
      {/* Componente nativo optimizado para crear cuadriculas */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderNotebook}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  gridContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  miniNotebook: {
    width: '48%', 
    height: 180,
    backgroundColor: '#FFF9C4', 
    borderRadius: 8,
    padding: 15,
    paddingLeft: 30, // Espacio para que el texto no toque la linea roja
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between', 
  },
  addNotebook: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0D8B4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 15, // Quitamos el margen izquierdo extra en este boton
    elevation: 0,
    shadowOpacity: 0,
  },
  redLine: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFB7B7',
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    lineHeight: 22,
  },
  memoryDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  addText: {
    marginTop: 10,
    color: '#A09A78',
    fontWeight: 'bold',
    fontSize: 16,
  }
});