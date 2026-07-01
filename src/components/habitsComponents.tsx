import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { theme } from '../constants/theme';
import { getRandomEncouragement, HabitQuote } from '../constants/habitEncouragement';
import { HabitData, plansList, daysOfWeek, generateMarkedDates, getCalendarButtonText, safeParseDate } from '../services/habitUtils';

// Configuración de Localización en Español para el Calendario
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

// ----------------------------------------------------
// Componente HabitCard
// ----------------------------------------------------
interface HabitCardProps {
  habit: HabitData & { isActive?: boolean };
  onPress: (habit: HabitData) => void;
  onEdit: (habit: HabitData) => void;
  onDelete: (id: string) => void;
}

export function HabitCard({ habit, onPress, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const timeObj = safeParseDate(habit.startTime);
  const displayTime = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handlePress = () => {
    if (habit.isActive) {
      onPress(habit);
    }
  };

  const handleOptionsPress = () => {
    setShowMenu(prev => !prev);
  };

  const handleEditPress = () => {
    setShowMenu(false);
    onEdit(habit);
  };

  const handleDeletePress = () => {
    setShowMenu(false);
    Alert.alert(
      'Eliminar Hábito',
      `¿Estás seguro de que deseas eliminar el hábito "${habit.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(habit.id) },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.habitCard, 
        habit.isActive && styles.habitCardActive,
        showMenu && { zIndex: 999, elevation: 10 }
      ]}
      onPress={handlePress}
      activeOpacity={habit.isActive ? 0.7 : 1}
    >
      <View style={styles.habitCardHeader}>
        <View style={styles.titleContainer}>
          {habit.isActive && (
            <View style={styles.activeDot} />
          )}
          <Text style={[styles.habitCardTitle, habit.isActive && styles.habitCardTitleActive]}>
            {habit.name}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <View style={[styles.habitDurationBadge, habit.isActive && styles.habitDurationBadgeActive]}>
            <Ionicons 
              name="timer-outline" 
              size={14} 
              color={habit.isActive ? '#FFFFFF' : theme.colors.light.primary} 
            />
            <Text style={[styles.habitDurationText, habit.isActive && styles.habitDurationTextActive]}>
              {habit.duration} min
            </Text>
          </View>
          
          <TouchableOpacity style={styles.optionsButton} onPress={handleOptionsPress}>
            <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.habitCardDetails}>
        <View style={styles.habitDetailRow}>
          <Ionicons name="time-outline" size={16} color={habit.isActive ? theme.colors.light.primary : "#64748B"} />
          <Text style={[styles.habitDetailText, habit.isActive && styles.habitDetailTextActive]}>
            {displayTime}
          </Text>
        </View>
        
        {habit.enableAlert && (
          <View style={styles.habitDetailRow}>
            <Ionicons name="notifications-outline" size={16} color={habit.isActive ? theme.colors.light.primary : "#64748B"} />
            <Text style={[styles.habitDetailText, habit.isActive && styles.habitDetailTextActive]}>
              Alerta activa
            </Text>
          </View>
        )}
      </View>

      {/* Menú flotante de opciones (lista pequeña) */}
      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditPress}>
            <Ionicons name="pencil-outline" size={16} color="#475569" />
            <Text style={styles.menuItemText}>Editar</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleDeletePress}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ----------------------------------------------------
// Componente CreateHabitModal
// ----------------------------------------------------
interface CreateHabitModalProps {
  visible: boolean;
  habitToEdit?: HabitData | null;
  onClose: () => void;
  onSave: (params: {
    id?: string;
    name: string;
    selectedDays: string[];
    selectedDates: string[];
    selectedPlan: string | null;
    startTime: Date;
    duration: number;
    enableAlert: boolean;
  }) => Promise<boolean>;
}

export function CreateHabitModal({ visible, habitToEdit, onClose, onSave }: CreateHabitModalProps) {
  const [habitName, setHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showCalendarArea, setShowCalendarArea] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState(30);
  const [enableAlert, setEnableAlert] = useState(false);

  useEffect(() => {
    if (visible) {
      if (habitToEdit) {
        setHabitName(habitToEdit.name);
        setSelectedDays(habitToEdit.selectedDays);
        setSelectedDates(habitToEdit.selectedDates);
        setSelectedPlan(habitToEdit.selectedPlan);
        setStartTime(safeParseDate(habitToEdit.startTime));
        setDuration(habitToEdit.duration);
        setEnableAlert(habitToEdit.enableAlert);
        if (habitToEdit.selectedDates.length > 0 || habitToEdit.selectedPlan) {
          setShowCalendarArea(true);
        } else {
          setShowCalendarArea(false);
        }
      } else {
        resetForm();
      }
    }
  }, [visible, habitToEdit]);

  const resetForm = () => {
    setHabitName('');
    setSelectedDays([]);
    setSelectedDates([]);
    setSelectedPlan(null);
    setStartTime(new Date());
    setDuration(30);
    setEnableAlert(false);
    setShowCalendarArea(false);
    setShowPlanDropdown(false);
    setShowTimePicker(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    setSelectedDates([]);
    setSelectedPlan(null);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    if (selectedPlan) {
      setSelectedPlan(null);
      setSelectedDates([dateStr]);
      return;
    }
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      if (selectedDates.length < 7) {
        setSelectedDates([...selectedDates, dateStr]);
      }
    }
    setSelectedDays([]);
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    setSelectedDates([]);
    setSelectedDays([]);
    setShowPlanDropdown(false);
  };

  const handleSave = async () => {
    const success = await onSave({
      id: habitToEdit?.id,
      name: habitName,
      selectedDays,
      selectedDates,
      selectedPlan,
      startTime,
      duration,
      enableAlert,
    });
    if (success) {
      resetForm();
      onClose();
    }
  };

  const formattedTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <View style={styles.creationModalOverlay}>
        <View style={styles.creationModalContent}>
          <View style={styles.creationHeader}>
            <Text style={styles.creationTitle}>
              {habitToEdit ? 'Editar Hábito' : 'Configurar Hábito'}
            </Text>
            <TouchableOpacity onPress={() => {
              resetForm();
              onClose();
            }}>
              <Ionicons name="close" size={28} color={theme.colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>¿Qué hábito deseas registrar?</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ej. Leer, Hacer ejercicio..."
              placeholderTextColor="#94A3B8"
              value={habitName}
              onChangeText={setHabitName}
            />

            <Text style={styles.sectionLabel}>Días de la semana</Text>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((day, index) => {
                const isActive = selectedDays.includes(day);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.dayCircle, isActive && styles.dayCircleActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => setShowCalendarArea(!showCalendarArea)}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.colors.light.primary} />
              <Text style={styles.calendarButtonText}>{getCalendarButtonText(selectedPlan, selectedDates)}</Text>
            </TouchableOpacity>

            {showCalendarArea && (
              <View style={styles.calendarAreaContainer}>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={generateMarkedDates(selectedPlan, selectedDates)}
                  theme={{
                    todayTextColor: theme.colors.light.primary,
                    arrowColor: theme.colors.light.primary,
                  }}
                />
                
                <TouchableOpacity 
                  style={styles.planDropdownButton}
                  onPress={() => setShowPlanDropdown(!showPlanDropdown)}
                >
                  <Text style={styles.planDropdownText}>O elige un plan automático</Text>
                  <Ionicons name={showPlanDropdown ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                </TouchableOpacity>

                {showPlanDropdown && (
                  <View style={styles.plansListContainer}>
                    {plansList.map((plan) => (
                      <TouchableOpacity 
                        key={plan.id}
                        style={styles.planOption}
                        onPress={() => handlePlanSelection(plan.id)}
                      >
                        <Text style={[
                          styles.planOptionText, 
                          selectedPlan === plan.id && { color: theme.colors.light.primary, fontWeight: 'bold' }
                        ]}>
                          {plan.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.sectionLabel}>Hora de inicio</Text>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>{formattedTime}</Text>
              <Ionicons name="time-outline" size={20} color="#64748B" />
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Duración de la meta: {duration} min</Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={360}
              step={5}
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={theme.colors.light.primary}
              maximumTrackTintColor="#E2E8F0"
              thumbTintColor={theme.colors.light.primary}
            />

            <View style={styles.alertSection}>
              <Text style={styles.sectionLabel}>Activar alerta</Text>
              <Switch
                trackColor={{ false: "#E2E8F0", true: theme.colors.light.primary }}
                thumbColor={"#FFFFFF"}
                onValueChange={setEnableAlert}
                value={enableAlert}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {habitToEdit ? 'Guardar Cambios' : 'Guardar Hábito'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </Modal>
  );
}

// ----------------------------------------------------
// Componente FulfillmentModal
// ----------------------------------------------------
interface FulfillmentModalProps {
  visible: boolean;
  habit: HabitData | null;
  onClose: () => void;
  onSaveProgress: (habitId: string, progressMinutes: number) => Promise<boolean>;
}

export function FulfillmentModal({ visible, habit, onClose, onSaveProgress }: FulfillmentModalProps) {
  const [progressMinutes, setProgressMinutes] = useState(5);
  const [earnedQuote, setEarnedQuote] = useState<HabitQuote | null>(null);
  const [showQuoteScreen, setShowQuoteScreen] = useState(false);

  useEffect(() => {
    if (visible && habit) {
      setProgressMinutes(habit.duration > 5 ? 5 : habit.duration);
      setEarnedQuote(null);
      setShowQuoteScreen(false);
    }
  }, [visible, habit]);

  const handleSaveProgress = async () => {
    if (!habit) return;

    const percentage = Math.round((progressMinutes / habit.duration) * 100);
    const quote = getRandomEncouragement(percentage);
    setEarnedQuote(quote);

    const success = await onSaveProgress(habit.id, progressMinutes);
    if (success) {
      setShowQuoteScreen(true);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.creationModalOverlay}>
        <View style={styles.creationModalContent}>
          <View style={styles.creationHeader}>
            <Text style={styles.creationTitle}>Registrar Progreso 🐢</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.light.text} />
            </TouchableOpacity>
          </View>

          {!showQuoteScreen ? (
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View>
                <Text style={[styles.sectionLabel, { textAlign: 'center', marginTop: 10 }]}>
                  ¡Es hora de tu hábito: "{habit?.name}"!
                </Text>
                <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', paddingHorizontal: 10, marginBottom: 20 }}>
                  Fijaste una meta de {habit?.duration} minutos. Cuéntanos cuánto tiempo pudiste dedicarle hoy. ¡Cualquier esfuerzo suma!
                </Text>

                <Text style={[styles.sliderValueText, { fontSize: 24, marginVertical: 15 }]}>
                  {progressMinutes} minutos dedicados
                </Text>

                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={habit?.duration || 60}
                  step={5}
                  value={progressMinutes}
                  onValueChange={setProgressMinutes}
                  minimumTrackTintColor={theme.colors.light.primary}
                  maximumTrackTintColor="#E2E8F0"
                  thumbTintColor={theme.colors.light.primary}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProgress}>
                <Text style={styles.saveButtonText}>Finalizar Tarea</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 }}>
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <View style={{ backgroundColor: '#F0F9FF', padding: 16, borderRadius: 50, marginBottom: 20 }}>
                  <Ionicons name="heart" size={40} color={theme.colors.light.primary} />
                </View>
                
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.light.text, marginBottom: 16, textAlign: 'center' }}>
                  ¡Progreso guardado con éxito!
                </Text>
                
                <View style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 20, marginHorizontal: 10 }}>
                  <Text style={{ fontSize: 16, fontStyle: 'italic', color: theme.colors.light.text, textAlign: 'center', lineHeight: 24, marginBottom: 12 }}>
                    "{earnedQuote?.quote}"
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.light.primary, textAlign: 'right' }}>
                    - {earnedQuote?.author}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, { width: '100%' }]} 
                onPress={onClose}
              >
                <Text style={styles.saveButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ----------------------------------------------------
// Componente HabitsTutorialModal
// ----------------------------------------------------
interface HabitsTutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HabitsTutorialModal({ visible, onClose }: HabitsTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "¡Te damos la bienvenida a Hábitos! 🌟",
      description: "Una forma de monitorear tus metas diarias. Aquí aprenderás que en el desarrollo personal, ¡cada minuto cuenta!",
      icon: "ribbon-outline" as const,
      color: theme.colors.light.primary,
    },
    {
      title: "1. Crear un Hábito ➕",
      description: "Toca el botón 'Agregar nuevo hábito' para configurar un nuevo objetivo. Asígnale un nombre claro, como 'Leer' o 'Hacer ejercicio'.",
      icon: "add-circle-outline" as const,
      color: "#3B82F6",
    },
    {
      title: "2. Seleccionar Días y Planes 📅",
      description: "Elige los días de la semana específicos que quieres cumplir, o selecciona un 'Plan Automático' para crear una rutina de 60 días.",
      icon: "calendar-outline" as const,
      color: "#10B981",
    },
    {
      title: "3. Hora de Inicio y Alertas ⏰",
      description: "Fija la hora de inicio y activa alertas si lo prefieres. La tarjeta del hábito se activará y brillará en tu pantalla durante 60 minutos desde esa hora.",
      icon: "time-outline" as const,
      color: "#F59E0B",
    },
    {
      title: "4. ¡Cada Minuto Cuenta! 🐢",
      description: "Cuando la tarjeta esté activa, tócala e indica cuánto tiempo le dedicaste. ¡Aunque la meta sea de 30 minutos y solo hagas 5, esos 5 minutos cuentan y se guardan!",
      icon: "checkmark-done-circle-outline" as const,
      color: "#EC4899",
    }
  ];

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeStep = steps[currentStep];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { minHeight: 320, paddingBottom: 16 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.tutorialContainer}>
            <View style={[styles.tutorialIconContainer, { backgroundColor: activeStep.color + '15' }]}>
              <Ionicons name={activeStep.icon} size={48} color={activeStep.color} />
            </View>

            <Text style={styles.modalTitle}>{activeStep.title}</Text>
            <Text style={styles.modalBody}>{activeStep.description}</Text>

            <View style={styles.dotsIndicator}>
              {steps.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    currentStep === index && [styles.dotActive, { backgroundColor: activeStep.color }]
                  ]} 
                />
              ))}
            </View>
          </View>

          <View style={styles.tutorialFooter}>
            <TouchableOpacity 
              style={[styles.tutorialNavButton, currentStep === 0 && { opacity: 0 }]} 
              onPress={handlePrev}
              disabled={currentStep === 0}
            >
              <Text style={styles.tutorialNavButtonText}>Atrás</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tutorialActionButton, { backgroundColor: activeStep.color }]} 
              onPress={handleNext}
            >
              <Text style={styles.tutorialActionButtonText}>
                {currentStep === steps.length - 1 ? "Entendido" : "Siguiente"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ----------------------------------------------------
// Estilos
// ----------------------------------------------------
const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative', // Asegura el posicionamiento del menú flotante
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    width: 120,
    zIndex: 1000,
    // Sombra para iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  habitCardActive: {
    borderColor: theme.colors.light.primary,
    backgroundColor: '#F0F9FF', 
    borderWidth: 2,
    shadowColor: theme.colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  habitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.light.primary,
    marginRight: 8,
  },
  habitCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  habitCardTitleActive: {
    color: theme.colors.light.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  habitDurationBadgeActive: {
    backgroundColor: theme.colors.light.primary,
  },
  habitDurationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
    marginLeft: 4,
  },
  habitDurationTextActive: {
    color: '#FFFFFF',
  },
  optionsButton: {
    marginLeft: 12,
    padding: 4,
  },
  habitCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  habitDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  habitDetailTextActive: {
    color: theme.colors.light.primary,
    fontWeight: '500',
  },
  creationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  creationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%',
  },
  creationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  creationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.light.text,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: theme.colors.light.primary,
  },
  dayText: {
    color: '#64748B',
    fontWeight: 'bold',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  calendarButtonText: {
    color: theme.colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  calendarAreaContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  planDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  planDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  plansListContainer: {
    backgroundColor: '#FFFFFF',
  },
  planOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  planOptionText: {
    fontSize: 14,
    color: '#64748B',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    color: theme.colors.light.text,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
  alertSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderValueText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    minHeight: 220,
    justifyContent: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  tutorialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  tutorialIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dotsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
  },
  tutorialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  tutorialNavButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tutorialNavButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tutorialActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  tutorialActionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
