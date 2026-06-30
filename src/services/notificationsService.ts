import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Configuracion corregida segun los requisitos actuales de NotificationBehavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true, // Requerido por la version actual
      shouldShowList: true,   // Requerido por la version actual
    }),
  });
} catch (error) {
  console.log('Error al configurar setNotificationHandler:', error);
}

// Objeto seguro para los tipos de disparadores, previniendo fallos si no están definidos
const TriggerTypes = Notifications.SchedulableTriggerInputTypes || {
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  YEARLY: 'yearly',
};

export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error solicitando permisos de notificación:', error);
    return false;
  }
}

export async function scheduleHabitNotification(title: string, body: string, date: Date) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: {
        type: TriggerTypes.DATE,
        date: date,
      },
    });
  } catch (error) {
    console.log('Error programando notificación de hábito:', error);
  }
}

export async function scheduleDailyReflectionReminder() {
  try {
    const alreadyScheduled = await AsyncStorage.getItem('@daily_reflection_reminder_scheduled');
    if (alreadyScheduled === 'true') {
      return; // Ya se agendó una vez
    }

    // Generar hora aleatoria entre las 17:00 y las 20:00 (5:00 PM - 8:00 PM)
    // Elegimos horas entre 17 y 19 y minutos entre 0 y 59 para estar dentro del rango.
    const randomHour = Math.floor(Math.random() * 3) + 17; // 17, 18 o 19
    const randomMinute = Math.floor(Math.random() * 60);

    // Cancelamos cualquier recordatorio previo de reflexión diario si existiese
    try {
      await Notifications.cancelScheduledNotificationAsync('daily_reflection_reminder');
    } catch (_) {}

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily_reflection_reminder',
      content: {
        title: '¿Cómo estuvo tu día? 🌟',
        body: 'Aún no has registrado tus emociones de hoy. Tómate un momento para reflexionar.',
      },
      trigger: {
        type: TriggerTypes.DAILY,
        hour: randomHour,
        minute: randomMinute,
      } as any,
    });

    await AsyncStorage.setItem('@daily_reflection_reminder_scheduled', 'true');
    console.log(`Recordatorio diario de reflexión agendado a las ${randomHour}:${randomMinute}`);
  } catch (error) {
    console.log('Error agendando la notificación de reflexión diaria:', error);
  }
}