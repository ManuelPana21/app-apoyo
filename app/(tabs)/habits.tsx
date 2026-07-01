import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../src/constants/theme';
import { getRandomEncouragement } from '../../src/constants/habitEncouragement';
import { HabitData, processAndSortHabits } from '../../src/services/habitUtils';
import { useHabits } from '../../hooks/useHabits';
import { HabitCard, CreateHabitModal, FulfillmentModal, HabitsTutorialModal } from '../../src/components/habitsComponents';

export default function HabitsScreen() {
  const isFocused = useIsFocused();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<HabitData | null>(null);
  
  // Estados para el Modal de Cumplimiento
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [selectedHabitForProgress, setSelectedHabitForProgress] = useState<HabitData | null>(null);

  const {
    habitsList,
    currentTime,
    saveHabit,
    saveProgress,
    deleteHabit,
  } = useHabits();

  // Frase motivacional aleatoria para valorar esfuerzos pequeños/pocos hábitos (categoría micro ~15%)
  const motivationalQuote = useMemo(() => {
    return getRandomEncouragement(15);
  }, [habitsList]);

  // Helpers para estadísticas del mes actual
  const getMonthNameSpanish = () => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[currentTime.getMonth()];
  };

  const isSameMonthAndYear = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentTime.getMonth() && d.getFullYear() === currentTime.getFullYear();
  };

  // Reloj interno y visibilidad de tutorial/modales cuando cambia el foco de la pantalla
  useEffect(() => {
    if (isFocused) {
      const checkTutorialStatus = async () => {
        try {
          const hasSeenTutorial = await AsyncStorage.getItem('hasSeenHabitsTutorial');
          if (hasSeenTutorial !== 'true') {
            setShowTutorial(true);
            await AsyncStorage.setItem('hasSeenHabitsTutorial', 'true');
          }
        } catch (error) {
          console.log('Error checking habit tutorial status:', error);
        }
      };
      checkTutorialStatus();
    } else {
      setShowTutorial(false);
      setShowCreateModal(false);
      setShowFulfillmentModal(false);
      setHabitToEdit(null);
    }
  }, [isFocused]);

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const handleHabitCardPress = (habit: HabitData) => {
    if (habit.isActive) {
      setSelectedHabitForProgress(habit);
      setShowFulfillmentModal(true);
    }
  };

  const handleEditHabit = (habit: HabitData) => {
    setHabitToEdit(habit);
    setShowCreateModal(true);
  };

  const handleDeleteHabit = async (id: string) => {
    await deleteHabit(id);
  };

  const handleSaveHabit = async (params: {
    id?: string;
    name: string;
    selectedDays: string[];
    selectedDates: string[];
    selectedPlan: string | null;
    startTime: Date;
    duration: number;
    enableAlert: boolean;
  }) => {
    return await saveHabit(params);
  };

  const handleSaveProgress = async (habitId: string, progressMinutes: number) => {
    return await saveProgress(habitId, progressMinutes);
  };

  // Ordena y procesa los hábitos en tiempo real
  const processedHabits = processAndSortHabits(habitsList, currentTime);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Hábitos</Text>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setHabitToEdit(null);
          setShowCreateModal(true);
        }}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Agregar nuevo hábito</Text>
      </TouchableOpacity>

      {/* Botón de estadísticas de hábitos */}
      <TouchableOpacity 
        style={styles.statsButton}
        onPress={() => setShowStats(prev => !prev)}
        activeOpacity={0.7}
      >
        <Ionicons name={showStats ? "stats-chart" : "stats-chart-outline"} size={20} color={theme.colors.light.primary} />
        <Text style={styles.statsButtonText}>
          {showStats ? "Ocultar Estadísticas" : "Ver Estadísticas del Mes"}
        </Text>
      </TouchableOpacity>

      {/* Sección de Estadísticas Colapsable con Gráfico de Barras Horizontal */}
      {showStats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Progreso de {getMonthNameSpanish()}</Text>
          
          {habitsList.length === 0 ? (
            <Text style={styles.emptyStatsText}>No hay hábitos registrados para mostrar estadísticas.</Text>
          ) : (
            <View style={styles.chartContainer}>
              {habitsList.map(habit => {
                const completions = (habit.completedDates || []).filter(isSameMonthAndYear).length;
                const maxDays = 30; // Escalado estándar sobre 30 días
                const percent = Math.min(100, (completions / maxDays) * 100);

                return (
                  <View key={habit.id} style={styles.chartRow}>
                    <Text style={styles.chartLabel} numberOfLines={1}>{habit.name}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(6, percent)}%` }]} />
                    </View>
                    <Text style={styles.chartValue}>{completions}d</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Frase motivacional al pie de las estadísticas */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{motivationalQuote.quote}"</Text>
            <Text style={styles.quoteAuthor}>- {motivationalQuote.author}</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
        {processedHabits.length === 0 ? (
          <Text style={styles.emptyText}>Aún no tienes hábitos registrados.</Text>
        ) : (
          processedHabits.map((habit) => (
            <HabitCard 
              key={habit.id} 
              habit={habit}
              onPress={handleHabitCardPress}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
            />
          ))
        )}
      </ScrollView>

      {/* Modal de Tutorial */}
      <HabitsTutorialModal
        visible={showTutorial && isFocused}
        onClose={closeTutorial}
      />

      {/* Modal de Configuración y Creación */}
      <CreateHabitModal
        visible={showCreateModal}
        habitToEdit={habitToEdit}
        onClose={() => {
          setShowCreateModal(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
      />

      {/* Modal de Cumplimiento y Progreso */}
      <FulfillmentModal
        visible={showFulfillmentModal}
        habit={selectedHabitForProgress}
        onClose={() => {
          setShowFulfillmentModal(false);
          setSelectedHabitForProgress(null);
        }}
        onSaveProgress={handleSaveProgress}
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
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light.primary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 16,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.light.primary,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsButtonText: {
    color: theme.colors.light.primary,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  emptyStatsText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 10,
  },
  chartContainer: {
    width: '100%',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginRight: 10,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6,
  },
  chartValue: {
    width: 30,
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
    textAlign: 'right',
  },
  quoteCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 8,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
    textAlign: 'right',
  },
});