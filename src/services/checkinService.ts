import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CheckIn {
  id: string;
  date: string;
  emotion: string;
  factor: string;
}

const CHECKIN_KEY = '@app_checkins';

// Funcion para obtener todos los registros historicos
export const getCheckIns = async (): Promise<CheckIn[]> => {
  try {
    const data = await AsyncStorage.getItem(CHECKIN_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Funcion para guardar o actualizar el estado del dia
export const saveCheckIn = async (emotion: string, factor: string): Promise<{ success: boolean }> => {
  try {
    const checkins = await getCheckIns();
    const today = new Date().toLocaleDateString();
    
    // Buscamos si ya existe un registro con la fecha de hoy
    const existingIndex = checkins.findIndex(c => c.date === today);

    if (existingIndex >= 0) {
      // Si ya existe un registro hoy lo actualizamos
      checkins[existingIndex].emotion = emotion;
      checkins[existingIndex].factor = factor;
    } else {
      // Si no existe creamos uno nuevo
      const newCheckIn: CheckIn = {
        id: Date.now().toString(),
        date: today,
        emotion,
        factor
      };
      checkins.push(newCheckIn);
    }

    await AsyncStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// Nueva funcion para saber como se siente el usuario el dia de hoy
export const getTodayCheckIn = async (): Promise<CheckIn | null> => {
  try {
    const checkins = await getCheckIns();
    const today = new Date().toLocaleDateString();
    const found = checkins.find(c => c.date === today);
    return found || null;
  } catch (error) {
    return null;
  }
};