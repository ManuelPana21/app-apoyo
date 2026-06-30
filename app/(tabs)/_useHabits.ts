import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { HabitData } from './_habitUtils';
import { requestNotificationPermissions, scheduleHabitNotification } from '../../src/services/notificationsService';

export function useHabits() {
  const isFocused = useIsFocused();
  const [habitsList, setHabitsList] = useState<HabitData[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('@user_habits');
      if (storedHabits) {
        setHabitsList(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.log('Error cargando los hábitos:', error);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isFocused) {
      loadHabits();
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isFocused]);

  const saveHabit = async (params: {
    id?: string;
    name: string;
    selectedDays: string[];
    selectedDates: string[];
    selectedPlan: string | null;
    startTime: Date;
    duration: number;
    enableAlert: boolean;
  }) => {
    if (!params.name.trim()) {
      Alert.alert('Faltan datos', 'Por favor ingresa un nombre para tu hábito.');
      return false;
    }
    if (params.selectedDays.length === 0 && params.selectedDates.length === 0 && !params.selectedPlan) {
      Alert.alert('Faltan datos', 'Por favor selecciona al menos un día, fecha o plan para tu hábito.');
      return false;
    }

    if (params.id) {
      // Modo Edición
      const updatedList = habitsList.map(h => {
        if (h.id === params.id) {
          return {
            ...h,
            name: params.name.trim(),
            selectedDays: params.selectedDays,
            selectedDates: params.selectedDates,
            selectedPlan: params.selectedPlan,
            startTime: params.startTime.toISOString(),
            duration: params.duration,
            enableAlert: params.enableAlert,
          };
        }
        return h;
      });

      try {
        await AsyncStorage.setItem('@user_habits', JSON.stringify(updatedList));
        setHabitsList(updatedList);
        return true;
      } catch (error) {
        console.log('Error editando el hábito:', error);
        Alert.alert('Error', 'Hubo un problema al editar el hábito.');
        return false;
      }
    } else {
      // Modo Creación
      const newHabit: HabitData = {
        id: Date.now().toString(),
        name: params.name.trim(),
        selectedDays: params.selectedDays,
        selectedDates: params.selectedDates,
        selectedPlan: params.selectedPlan,
        startTime: params.startTime.toISOString(),
        duration: params.duration,
        enableAlert: params.enableAlert,
        createdAt: Date.now(),
      };

      try {
        const updatedHabits = [...habitsList, newHabit];
        await AsyncStorage.setItem('@user_habits', JSON.stringify(updatedHabits));
        
        if (params.enableAlert) {
          const hasPermission = await requestNotificationPermissions();
          if (hasPermission) {
            await scheduleHabitNotification(
              "¡Es hora de tu hábito!",
              `No olvides dedicarle tiempo a: ${newHabit.name}`,
              params.startTime
            );
          } else {
            Alert.alert("Permiso denegado", "No podremos enviarte alertas porque no diste permiso.");
          }
        }
        
        setHabitsList(updatedHabits);
        return true;
      } catch (error) {
        console.log('Error guardando el hábito o programando la alerta:', error);
        Alert.alert('Error', 'Hubo un problema al guardar el hábito.');
        return false;
      }
    }
  };

  const saveProgress = async (habitId: string, progressMinutes: number) => {
    try {
      const todayStr = currentTime.toDateString();
      const updatedList = habitsList.map(h => {
        if (h.id === habitId) {
          const completedDates = h.completedDates || [];
          const updatedDates = completedDates.includes(todayStr) 
            ? completedDates 
            : [...completedDates, todayStr];
          return { 
            ...h, 
            lastCompletedDate: todayStr,
            completedDates: updatedDates
          };
        }
        return h;
      });

      await AsyncStorage.setItem('@user_habits', JSON.stringify(updatedList));
      setHabitsList(updatedList);
      return true;
    } catch (error) {
      console.log('Error actualizando el progreso diario:', error);
      return false;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const updatedList = habitsList.filter(h => h.id !== id);
      await AsyncStorage.setItem('@user_habits', JSON.stringify(updatedList));
      setHabitsList(updatedList);
      return true;
    } catch (error) {
      console.log('Error eliminando el hábito:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar el hábito.');
      return false;
    }
  };

  return {
    habitsList,
    currentTime,
    saveHabit,
    saveProgress,
    deleteHabit,
    loadHabits,
  };
}
