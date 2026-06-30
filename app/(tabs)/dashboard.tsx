import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Modal } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CustomButton from '../../src/components/CustomButton';
import { theme } from '../../src/constants/theme';
import { Quote, quotesDatabase } from '../../src/data/quotesDatabase';
import { CheckIn, getCheckIns, getTodayCheckIn } from '../../src/services/checkinService';
import { requestNotificationPermissions, scheduleDailyReflectionReminder } from '../../src/services/notificationsService';

const getGreetingData = () => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return {
      text: 'Buenos días',
      image: require('../../assets/good_morning.png')
    };
  } else if (currentHour >= 12 && currentHour < 19) {
    return {
      text: 'Buenas tardes',
      image: require('../../assets/good_afternoon.png')
    };
  } else {
    return {
      text: 'Buenas noches',
      image: require('../../assets/good_night.png')
    };
  }
};

// Genera una frase dependiendo de la emocion predominante
const getRandomQuote = (emotions: any[]): Quote => {
  const totalCount = emotions.reduce((sum, current) => sum + current.count, 0);
  let targetCategory = 'positive';

  // Si hay datos calculamos la mayor emocion, sino dejamos la categoria por defecto
  if (totalCount > 0) {
    const predominant = emotions.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    targetCategory = (predominant.name === 'Feliz' || predominant.name === 'Tranquilo') ? 'positive' : 'negative';
  }

  const filteredQuotes = quotesDatabase.filter(q => q.category === targetCategory);
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  
  return filteredQuotes[randomIndex];
};

export default function DashboardScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const greetingData = getGreetingData();

  const [todayMood, setTodayMood] = useState<CheckIn | null>(null);
  const [dailyQuote, setDailyQuote] = useState<Quote>(getRandomQuote([]));
  const [chartData, setChartData] = useState([
    { name: 'Feliz', count: 0, color: '#A8DADC', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Triste', count: 0, color: '#8FAADC', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Ansioso', count: 0, color: '#ffb3ba', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Tranquilo', count: 0, color: '#baffc9', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Enojado', count: 0, color: '#f87171', legendFontColor: '#475569', legendFontSize: 14 },
  ]);

  // Estados para el modal de respiración ansiosa
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('');
  const [breathTimer, setBreathTimer] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadRealData();
      initReflectionReminder();
    }, [])
  );

  const initReflectionReminder = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleDailyReflectionReminder();
      }
    } catch (error) {
      console.log('Error initializing reflection reminder in dashboard:', error);
    }
  };

  const loadRealData = async () => {
    const history = await getCheckIns();
    const today = await getTodayCheckIn();

    setTodayMood(today);

    let feliz = 0, triste = 0, ansioso = 0, tranquilo = 0, enojado = 0;

    history.forEach(item => {
      if (item && item.emotion) {
        if (item.emotion.includes('Feliz')) feliz++;
        else if (item.emotion.includes('Triste')) triste++;
        else if (item.emotion.includes('Ansioso')) ansioso++;
        else if (item.emotion.includes('Tranquilo')) tranquilo++;
        else if (item.emotion.includes('Enojado')) enojado++;
      }
    });

    const newChartData = [
      { name: 'Feliz', count: feliz, color: '#A8DADC', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Triste', count: triste, color: '#8FAADC', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Ansioso', count: ansioso, color: '#ffb3ba', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Tranquilo', count: tranquilo, color: '#baffc9', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Enojado', count: enojado, color: '#f87171', legendFontColor: '#475569', legendFontSize: 14 },
    ];

    setChartData(newChartData);
    setDailyQuote(getRandomQuote(newChartData));
  };

  // Inicia la respiración automáticamente al abrir el modal
  useEffect(() => {
    if (showBreathingModal) {
      setIsBreathing(true);
      setBreathPhase('Inhalar');
      setBreathTimer(4);
    } else {
      setIsBreathing(false);
      setBreathPhase('');
      setBreathTimer(0);
    }
  }, [showBreathingModal]);

  // Motor del temporizador visual para los ciclos de respiración
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isBreathing && breathPhase !== 'Terminado' && showBreathingModal) {
      if (breathTimer > 0) {
        timeout = setTimeout(() => {
          setBreathTimer(breathTimer - 1);
        }, 1000);
      } else {
        if (breathPhase === 'Inhalar') {
          setBreathPhase('Sostener');
          setBreathTimer(7);
        } else if (breathPhase === 'Sostener') {
          setBreathPhase('Exhalar');
          setBreathTimer(8);
        } else if (breathPhase === 'Exhalar') {
          setBreathPhase('Terminado');
        }
      }
    }
    return () => clearTimeout(timeout);
  }, [isBreathing, breathTimer, breathPhase, showBreathingModal]);

  // Guía háptica del ejercicio de respiración (4-7-8)
  useEffect(() => {
    if (Platform.OS === 'web' || !isBreathing || !showBreathingModal || breathPhase === 'Terminado') {
      return;
    }

    let interval: ReturnType<typeof setInterval>;

    if (breathPhase === 'Inhalar') {
      interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }, 200);
    } else if (breathPhase === 'Sostener') {
      Haptics.selectionAsync().catch(() => {});
      interval = setInterval(() => {
        Haptics.selectionAsync().catch(() => {});
      }, 1000);
    } else if (breathPhase === 'Exhalar') {
      interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }, 200);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isBreathing, breathPhase, showBreathingModal]);

  const totalRegisters = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.greetingCard}>
        <Image 
          source={greetingData.image} 
          style={styles.greetingImage} 
          resizeMode="contain" 
        />
        <Text style={styles.greetingText}>{greetingData.text}</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Resumen de tu mes</Text>
        
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => router.push('/stats')}
          style={styles.chartTouchable}
        >
          {totalRegisters > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"count"}
              backgroundColor={"transparent"}
              paddingLeft={"10"}
              absolute
            />
          ) : (
            <Text style={styles.emptyChartText}>Registra tu primer estado para visualizar la gráfica. Toca aquí para ver tus estadísticas completas.</Text>
          )}
        </TouchableOpacity>

        <View style={styles.quoteContainer}>
          <Text style={styles.motivationalText}>"{dailyQuote.text}"</Text>
          {dailyQuote.source && (
            <Text style={styles.sourceText}>- {dailyQuote.source}</Text>
          )}
        </View>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>
          {todayMood ? 'Ya registraste tu día' : '¿Cómo te sientes hoy?'}
        </Text>
        <Text style={styles.actionSubtitle}>
          {todayMood ? 'Pero si tus emociones cambiaron, puedes actualizarlo.' : 'Tómate un momento para escuchar tus emociones.'}
        </Text>
        
        <CustomButton 
          title={todayMood ? 'Actualizar mi día' : 'Registrar mi día'} 
          onPress={() => router.push('/check-in')} 
        />
      </View>

      {/* Botón interactivo para usuarios ansiosos */}
      <TouchableOpacity 
        style={styles.anxietyCard}
        onPress={() => setShowBreathingModal(true)}
        activeOpacity={0.7}
      >
        <Image 
          source={require('../../assets/images/anxiety.png')} 
          style={styles.anxietyImage} 
          resizeMode="contain" 
        />
        <View style={styles.anxietyTextContainer}>
          <Text style={styles.anxietyTitle}>¿Te sientes ansioso?</Text>
          <Text style={styles.anxietySubtitle}>Haz una pausa y respira con el método 4-7-8</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>

      {/* Modal del Ejercicio de Respiración */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBreathingModal}
        onRequestClose={() => setShowBreathingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Respiración 4-7-8 🐢</Text>
              <TouchableOpacity onPress={() => setShowBreathingModal(false)}>
                <Ionicons name="close" size={28} color={theme.colors.light.text} />
              </TouchableOpacity>
            </View>

            {breathPhase === 'Terminado' ? (
              <View style={styles.exerciseFinishedContainer}>
                <View style={styles.finishedIconContainer}>
                  <Ionicons name="heart" size={40} color={theme.colors.light.primary} />
                </View>
                <Text style={styles.finishedTitle}>¡Excelente trabajo!</Text>
                <Text style={styles.finishedSubtitle}>
                  Has completado un ciclo de respiración. Cada segundo invertido en tu calma es valioso.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => {
                      setBreathPhase('Inhalar');
                      setBreathTimer(4);
                    }}
                  >
                    <Text style={styles.retryButtonText}>Repetir ejercicio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.closeModalButton} 
                    onPress={() => setShowBreathingModal(false)}
                  >
                    <Text style={styles.closeModalButtonText}>Terminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.breathingContainer}>
                <Text style={styles.breathPhaseText}>{breathPhase}</Text>
                <View style={styles.circleTimer}>
                  <Text style={styles.timerNumber}>{breathTimer}</Text>
                </View>
                <Text style={styles.validationText}>
                  {breathPhase === 'Sostener' 
                    ? 'Mantén el aire con calma...' 
                    : breathPhase === 'Exhalar' 
                      ? 'Exhala con calma...' 
                      : 'Respira profundo...'}
                </Text>
              </View>
            )}

          </View>
        </View>
      </Modal>

      <View style={styles.spacer} />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.light.background,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  greetingImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  chartTouchable: {
    width: '100%',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 40,
    fontStyle: 'italic',
  },
  quoteContainer: {
    marginTop: 15,
    width: '100%',
  },
  motivationalText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  sourceText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 5,
    fontWeight: 'bold',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
    textAlign: 'center',
  },
  anxietyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  anxietyImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  anxietyTextContainer: {
    flex: 1,
  },
  anxietyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  anxietySubtitle: {
    fontSize: 13,
    color: '#64748b',
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
    borderRadius: 20,
    padding: 24,
    minHeight: 350,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  breathingContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  breathPhaseText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
    marginBottom: 20,
  },
  circleTimer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#BAE6FD',
    marginBottom: 20,
  },
  timerNumber: {
    fontSize: 44,
    fontWeight: 'bold',
    color: theme.colors.light.primary,
  },
  validationText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  exerciseFinishedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  finishedIconContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  finishedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalActions: {
    width: '100%',
    gap: 10,
  },
  retryButton: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  }
});