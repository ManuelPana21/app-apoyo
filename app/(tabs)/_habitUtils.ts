import { theme } from '../../src/constants/theme';

export interface HabitData {
  id: string;
  name: string;
  selectedDays: string[];
  selectedDates: string[];
  selectedPlan: string | null;
  startTime: string;
  duration: number;
  enableAlert: boolean;
  createdAt: number;
  lastCompletedDate?: string;
  completedDates?: string[];
  isActive?: boolean;
}

export const plansList = [
  { id: '1_1', label: 'Un día sí, un día no' },
  { id: 'sem_sem', label: 'Una semana sí, una semana no' },
  { id: 'cada_2', label: 'Cada dos días' },
  { id: 'cada_3', label: 'Cada tres días' },
  { id: 'cada_4', label: 'Cada cuatro días' },
  { id: 'cada_5', label: 'Cada cinco días' },
  { id: 'cada_6', label: 'Cada seis días' },
];

export const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const generateMarkedDates = (
  selectedPlan: string | null,
  selectedDates: string[],
  themeColor: string = theme.colors.light.primary
) => {
  let marks: any = {};

  if (!selectedPlan) {
    selectedDates.forEach(date => {
      marks[date] = { selected: true, selectedColor: themeColor };
    });
    return marks;
  }

  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + i);
    const dateString = targetDate.toISOString().split('T')[0];

    let shouldMark = false;
    if (selectedPlan === '1_1' && i % 2 === 0) shouldMark = true;
    if (selectedPlan === 'sem_sem') {
      const weekCycle = Math.floor(i / 7);
      if (weekCycle % 2 === 0) shouldMark = true;
    }
    if (selectedPlan === 'cada_2' && i % 2 === 0) shouldMark = true;
    if (selectedPlan === 'cada_3' && i % 3 === 0) shouldMark = true;
    if (selectedPlan === 'cada_4' && i % 4 === 0) shouldMark = true;
    if (selectedPlan === 'cada_5' && i % 5 === 0) shouldMark = true;
    if (selectedPlan === 'cada_6' && i % 6 === 0) shouldMark = true;

    if (shouldMark) {
      marks[dateString] = { selected: true, selectedColor: themeColor };
    }
  }
  return marks;
};

export const getCalendarButtonText = (
  selectedPlan: string | null,
  selectedDates: string[]
) => {
  if (selectedPlan) {
    const planName = plansList.find(p => p.id === selectedPlan)?.label;
    return planName || 'Plan seleccionado';
  }
  if (selectedDates.length > 0) {
    return `${selectedDates.length} fechas seleccionadas`;
  }
  return 'Elegir fechas específicas o planes';
};

export const safeParseDate = (dateStr: any): Date => {
  if (!dateStr) return new Date();
  
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = String(dateStr).trim().match(timeRegex);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }
  
  return new Date();
};

export const processAndSortHabits = (habitsList: HabitData[], currentTime: Date): (HabitData & { isActive: boolean })[] => {
  return habitsList.map(habit => {
    const habitTime = safeParseDate(habit.startTime);
    
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    const habitHour = habitTime.getHours();
    const habitMinute = habitTime.getMinutes();
    const habitTotalMinutes = habitHour * 60 + habitMinute;
    
    // Verificamos si estamos en la ventana activa (hasta 60 minutos despues de la hora de inicio)
    const isTimeMatch = currentTotalMinutes >= habitTotalMinutes && currentTotalMinutes < (habitTotalMinutes + 60);
    
    // Verificamos si ya completamos este habito el dia de hoy para no volver a resaltarlo
    const todayStr = currentTime.toDateString();
    const isCompletedToday = habit.lastCompletedDate === todayStr;
    
    const isActive = isTimeMatch && !isCompletedToday;
    
    return { ...habit, isActive };
  }).sort((a, b) => {
    // Si a es activo y b no, a sube. Si b es activo y a no, b sube.
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return 0;
  });
};
