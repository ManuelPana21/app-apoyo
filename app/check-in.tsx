import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Asegúrate de que getAngryTip esté exportado desde tu archivo de prompts
import { generateCalmQuestion, getAngryTip, getAnxiousTip, getComfortTip, getFoodTip, getHabitTip } from '../src/constants/checkinPrompts';
import { getEmotionPhrase } from '../src/constants/emotionPhrases';
import { theme } from '../src/constants/theme';
import { getCurrentUser, User } from '../src/services/authService';
import { saveCheckIn } from '../src/services/checkinService';

// Lista de frases de validacion emocional
const PHRASE_BANK = {
  feliz: [
    '¡Qué increíble noticia! Me alegra mucho saber que te sientes así hoy.',
    '¡Eso es maravilloso! Disfruta mucho de esta buena energía.',
    'Me encanta leer esto. Ojalá este sentimiento te acompañe todo el día.'
  ],
  tranquilo: [
    'La tranquilidad es un gran regalo. Disfruta de esta paz.',
    'Qué bueno saber que tienes calma hoy. Es el mejor estado para fluir.',
    'Respirar en paz es un logro. Sigue disfrutando de este momento de serenidad.'
  ],
  triste: [
    'Tener un mal día es completamente normal. No siempre podemos tener todo bajo control y está bien. Todo lo que sientes es válido; recuerda que mientras sigas con vida, todo tiene solución.',
    'Siento mucho que estés pasando por esto hoy. Date permiso para sentirlo, no tienes que ser fuerte todo el tiempo.',
    'Esos días grises son difíciles, pero recuerda que son temporales. Sé amable contigo mismo hoy.'
  ],
  ansioso: [
    'La ansiedad puede ser abrumadora, pero recuerda que no estás solo y no tienes por qué estarlo.',
    'Entiendo que tu mente vaya a mil por hora ahora mismo. Estoy aquí para acompañarte.',
    'Es normal sentirse ansioso a veces. No estás solo en esto, vamos a superarlo paso a paso.'
  ],
  enojado: [
    'Es completamente válido sentir enojo. Tu frustración tiene una razón de ser y está bien darle su espacio.',
    'Siento mucho que estés pasando por un momento de tanta frustración. Respira, aquí tienes un lugar seguro.',
    'El enojo es una emoción con mucha energía, es normal sentir que te desborda. Vamos a procesarlo paso a paso.'
  ]
};

export default function CheckInScreen() {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    loadUser();
  }, []);
  
  const router = useRouter();
  
  const [history, setHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // Añadimos 'angry' a las opciones del path
  const [path, setPath] = useState<'positive' | 'negative' | 'calm' | 'anxious' | 'angry' | null>(null);
  const [tempFactor, setTempFactor] = useState('');
  const [dynamicMessage, setDynamicMessage] = useState('');
  const [calmQuestion, setCalmQuestion] = useState('');

  // Controladores del estado de la respiracion
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('');
  const [breathTimer, setBreathTimer] = useState(0);

  // Motor del temporizador visual para los ciclos
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    // El contador avanza solo si la pantalla esta en la ruta ansiosa
    if (isBreathing && breathPhase !== 'Terminado' && path === 'anxious') {
      if (breathTimer > 0) {
        timeout = setTimeout(() => {
          setBreathTimer(breathTimer - 1);
        }, 1000);
      } else {
        // Control de los cambios de fase del ejercicio
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
    
    // Limpieza del proceso de ejecucion anterior
    return () => clearTimeout(timeout);
  }, [isBreathing, breathTimer, breathPhase, path]);

  // Actualizamos para recibir 'enojado'
  const handleEmotionSelect = (emotionId: 'feliz' | 'tranquilo' | 'triste' | 'ansioso' | 'enojado') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Guardamos el texto "Me siento [Emoción]" para la gráfica
    const fullText = `Me siento ${emotionId.charAt(0).toUpperCase() + emotionId.slice(1)}`;
    const phrase = getEmotionPhrase(emotionId, user?.gender);
    
    setHistory([fullText]);
    
    // 2. Buscamos el mensaje de la aplicación en el PHRASE_BANK
    const phrases = PHRASE_BANK[emotionId];
    const randomText = phrases[Math.floor(Math.random() * phrases.length)];
    setDynamicMessage(randomText);

    // 3. Asignamos la ruta
    if (emotionId === 'feliz') {
      setPath('positive');
    } else if (emotionId === 'tranquilo') {
      setPath('calm');
      setCalmQuestion(generateCalmQuestion());
    } else if (emotionId === 'ansioso') {
      setPath('anxious');
    } else if (emotionId === 'enojado') {
      setPath('angry'); // Asignamos la nueva ruta
    } else {
      setPath('negative');
    }
    
    setCurrentStep(2);
  };

  const handleAnswer = async (answer: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const newHistory = [...history, answer];
    setHistory(newHistory);
    
    if (currentStep === 2) {
      setTempFactor(answer);
      setCurrentStep(3);
    }
    else if (currentStep === 3) {
      await saveCheckIn(history[0], tempFactor);
      
      if (answer.includes('escribir') || answer.includes('cuaderno')) {
        router.replace('/write-memory');
      } else {
        router.back();
      }
    }
  };

  // Activacion manual de los valores iniciales del ejercicio
  const startBreathingExercise = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsBreathing(true);
    setBreathPhase('Inhalar');
    setBreathTimer(4);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Reflexión Diaria</Text>

      {history.length > 0 && (
        <View style={styles.historyContainer}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyBubble}>
              <Text style={styles.historyText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pregunta inicial */}
      {currentStep === 1 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>¿Cómo te sientes en este momento?</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleEmotionSelect('feliz')}>
              <Text style={styles.optionText}>Feliz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleEmotionSelect('tranquilo')}>
              <Text style={styles.optionText}>Tranquilo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleEmotionSelect('triste')}>
              <Text style={styles.optionText}>Triste</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleEmotionSelect('ansioso')}>
              <Text style={styles.optionText}>Ansioso</Text>
            </TouchableOpacity>
            {/* Nuevo botón para Enojado */}
            <TouchableOpacity style={styles.optionButton} onPress={() => handleEmotionSelect('enojado')}>
              <Text style={styles.optionText}>Enojado</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Rutas divididas */}
      {currentStep === 2 && (
        <View style={styles.questionContainer}>
          
          <Text style={[
            styles.validationText, 
            path === 'positive' && styles.positiveText,
            path === 'calm' && styles.calmText,
            path === 'anxious' && styles.anxiousText,
            path === 'angry' && styles.angryText // Añadimos el estilo dinámico para el enojo
          ]}>
            {dynamicMessage}
          </Text>

          {path === 'positive' && (
            <>
              <Text style={styles.questionText}>Cambiando un poco de tema, ¿has comido tus tres tiempos de comida?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, he comido bien')}>
                  <Text style={styles.optionText}>Sí, todos mis tiempos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Solo dos tiempos')}>
                  <Text style={styles.optionText}>Me he saltado alguno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('No he comido bien')}>
                  <Text style={styles.optionText}>Aún no he comido bien</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'calm' && (
            <>
              <Text style={styles.questionText}>{calmQuestion}</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, ya lo hice')}>
                  <Text style={styles.optionText}>Sí, ya lo hice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Aún no, pero lo haré')}>
                  <Text style={styles.optionText}>Aún no, pero lo haré pronto</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'negative' && (
            <>
              <Text style={styles.questionText}>¿De qué forma te gustaría intentar desconectar esta noche?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Solo quiero descansar')}>
                  <Text style={styles.optionText}>Solo quiero descansar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Música suave')}>
                  <Text style={styles.optionText}>Algo de música suave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Mi música favorita')}>
                  <Text style={styles.optionText}>Mis canciones favoritas</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Nueva sección Step 2 para Enojado */}
          {path === 'angry' && (
            <>
              <Text style={styles.questionText}>¿Te gustaría intentar hacer algo para canalizar un poco de esa energía ahora mismo?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Necesito distraerme un poco')}>
                  <Text style={styles.optionText}>Necesito distraerme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Quiero tratar de relajarme')}>
                  <Text style={styles.optionText}>Intentar relajarme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Prefiero no hacer nada')}>
                  <Text style={styles.optionText}>Prefiero no hacer nada</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'anxious' && (
            <>
              {!isBreathing ? (
                <>
                  <Text style={styles.questionText}>Este es tu lugar seguro ahora, puedes respirar tranquilamente y si no, practica este ejercicio guiado.</Text>
                  <View style={styles.optionsColumn}>
                    <TouchableOpacity style={styles.optionButtonWide} onPress={startBreathingExercise}>
                      <Text style={styles.optionText}>Empezar ejercicio (4-7-8)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('No necesito el ejercicio')}>
                      <Text style={styles.optionText}>Ya me siento más tranquilo</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.breathingContainer}>
                  {breathPhase === 'Terminado' ? (
                    <>
                      <Text style={styles.questionText}>¿Cómo te sientes ahora?</Text>
                      <View style={styles.optionsColumn}>
                        <TouchableOpacity style={styles.optionButtonWide} onPress={startBreathingExercise}>
                          <Text style={styles.optionText}>Repetir ejercicio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.optionButtonWide} 
                          onPress={() => {
                            setIsBreathing(false);
                            handleAnswer('Ejercicio completado'); 
                          }}
                        >
                          <Text style={styles.optionText}>Continuar</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Cierre del flujo */}
      {currentStep === 3 && (
        <View style={styles.questionContainer}>
          {path === 'positive' && (
            <>
              <Text style={styles.tipText}>{getFoodTip(tempFactor)}</Text>
              <Text style={styles.questionText}>¿Te gustaría guardar este buen momento o escribir algo en tu cuaderno?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, escribir memoria')}>
                  <Text style={styles.optionText}>Sí, ir a mi cuaderno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('No por ahora')}>
                  <Text style={styles.optionText}>No, terminar por hoy</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'calm' && (
            <>
              <Text style={styles.tipText}>{getHabitTip(tempFactor)}</Text>
              <Text style={styles.questionText}>¿Te gustaría registrar esta tranquilidad en tu cuaderno?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, escribir memoria')}>
                  <Text style={styles.optionText}>Sí, abrir mi cuaderno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('Prefiero no hacerlo')}>
                  <Text style={styles.optionText}>No, terminar por hoy</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'negative' && (
            <>
              <Text style={styles.tipText}>{getComfortTip(tempFactor, user?.hobbies)}</Text>
              <Text style={styles.questionText}>A veces sacar las cosas de la cabeza ayuda. ¿Te gustaría desahogarte en tu cuaderno?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, necesito escribir')}>
                  <Text style={styles.optionText}>Sí, abrir mi cuaderno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('Prefiero no hacerlo')}>
                  <Text style={styles.optionText}>Prefiero solo descansar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Nueva sección Step 3 para Enojado */}
          {path === 'angry' && (
            <>
              <Text style={styles.tipText}>{getAngryTip(user?.hobbies)}</Text>
              <Text style={styles.questionText}>A veces desahogarse escribiendo ayuda a liberar la tensión. ¿Te gustaría usar tu cuaderno?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, ir a mi cuaderno')}>
                  <Text style={styles.optionText}>Sí, quiero desahogarme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('Prefiero no hacerlo')}>
                  <Text style={styles.optionText}>No por ahora</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {path === 'anxious' && (
            <>
              <Text style={styles.tipText}>{getAnxiousTip(user?.hobbies)}</Text>
              <Text style={styles.questionText}>¿Te gustaría agregar algo a tus memorias como parte de tu rutina?</Text>
              <View style={styles.optionsColumn}>
                <TouchableOpacity style={styles.optionButtonWide} onPress={() => handleAnswer('Sí, escribir memoria')}>
                  <Text style={styles.optionText}>Sí, abrir mi cuaderno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButtonWide, { backgroundColor: '#94A3B8' }]} onPress={() => handleAnswer('Prefiero no hacerlo')}>
                  <Text style={styles.optionText}>No, terminar por hoy</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.light.background,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  historyContainer: {
    width: '100%',
    marginBottom: 20,
  },
  historyBubble: {
    backgroundColor: '#E2E8F0',
    padding: 15,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
    maxWidth: '80%',
  },
  historyText: {
    color: '#334155',
    fontSize: 16,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
    width: '100%',
  },
  validationText: {
    fontSize: 15,
    color: '#64748B', 
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  positiveText: {
    color: '#10B981',
    fontWeight: '600',
  },
  calmText: {
    color: '#3B82F6', 
    fontWeight: '600',
  },
  anxiousText: {
    color: '#8B5CF6', 
    fontWeight: '600',
  },
  // Nuevo estilo para la validación del enojo
  angryText: {
    color: '#EF4444', 
    fontWeight: '600',
  },
  tipText: {
    fontSize: 15,
    color: '#6366F1',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 20,
  },
  optionsColumn: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  optionButtonWide: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  breathingContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  breathPhaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 20,
  },
  circleTimer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#C4B5FD',
    marginBottom: 20,
  },
  timerNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
});