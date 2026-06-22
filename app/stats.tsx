import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRandomAdvice } from '../src/constants/emotionAdvice';
import { emotionColors } from '../src/constants/emotionPhrases';
import { theme } from '../src/constants/theme';
import { getCheckIns } from '../src/services/checkinService'; // Importamos tu servicio

const EMOTION_ADVICE = {
  feliz: 'Es genial ver estos momentos positivos. Sigue haciendo espacio para las cosas que te hacen sonreír y disfrutar tu día.',
  tranquilo: 'La paz mental es un gran logro. Estos días son la base perfecta para recargar tus energías y mantener el equilibrio.',
  ansioso: 'Es completamente normal tener picos de ansiedad en el mes. Recuerda que son temporales y tienes las herramientas para volver a tu centro.',
  triste: 'Tener días grises no borra tu progreso. Date permiso para sentir esa tristeza, pero recuerda que no define todo tu mes ni quién eres.',
  enojado: 'El enojo demuestra que tus límites importan. Es válido haberte sentido así, lo importante es dejarlo ir poco a poco para que no te quite la paz.'
};

export default function StatsScreen() {
  const months = ['Abril', 'Mayo', 'Junio'];
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [currentAdvice, setCurrentAdvice] = useState<string>('');

  // Estados para los datos reales
  const [chartData, setChartData] = useState<any[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [insight, setInsight] = useState({
    icon: '🌱',
    title: 'Comenzando tu camino',
    description: 'Aún estamos recolectando datos sobre tus hábitos. Sigue registrando tus días para descubrir tus patrones.'
  });

  // Cargamos los datos cada vez que el usuario entra a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadRealData();
    }, [])
  );

  const loadRealData = async () => {
    const history = await getCheckIns();
    
    // Contadores de emociones
    let feliz = 0, triste = 0, ansioso = 0, tranquilo = 0, enojado = 0;

    // Contadores para el descubirmiento (acciones del usuario)
    let descanso = 0, comida = 0, escritura = 0, musica = 0, respiracion = 0;

    history.forEach(item => {
      // 1. Contamos emociones para la grafica
      if (item.emotion) {
        if (item.emotion.includes('Feliz')) feliz++;
        else if (item.emotion.includes('Triste')) triste++;
        else if (item.emotion.includes('Ansioso')) ansioso++;
        else if (item.emotion.includes('Tranquilo')) tranquilo++;
        else if (item.emotion.includes('Enojado')) enojado++;
      }

      // 2. Analizamos el factor (la respuesta secundaria) para el descubrimiento
      const factor = item.factor ? item.factor.toLowerCase() : '';
      if (factor.includes('descansar')) descanso++;
      if (factor.includes('comido bien')) comida++;
      if (factor.includes('cuaderno') || factor.includes('escribir')) escritura++;
      if (factor.includes('música') || factor.includes('canciones')) musica++;
      if (factor.includes('ejercicio')) respiracion++;
    });

    const newChartData = [
      { id: 'feliz', label: 'Feliz', count: feliz, color: emotionColors.feliz },
      { id: 'tranquilo', label: 'Tranquilo', count: tranquilo, color: emotionColors.tranquilo },
      { id: 'ansioso', label: 'Ansioso', count: ansioso, color: emotionColors.ansioso },
      { id: 'triste', label: 'Triste', count: triste, color: emotionColors.triste },
      { id: 'enojado', label: 'Enojado', count: enojado, color: emotionColors.enojado },
    ];

    setChartData(newChartData);
    
    // Calculamos el maximo para la altura de las barras (evitamos que sea 0 para que no falle la division)
    const newMaxCount = Math.max(...newChartData.map(item => item.count));
    setMaxCount(newMaxCount > 0 ? newMaxCount : 1);

    // 3. Generamos el descubrimiento basado en la accion que más repitió
    generateInsight(descanso, comida, escritura, musica, respiracion);
  };

  // Funcion que decide que descubrimiento mostrar
  const generateInsight = (descanso: number, comida: number, escritura: number, musica: number, respiracion: number) => {
    // Si no ha hecho nada relevante aun, dejamos el mensaje por defecto
    if (descanso === 0 && comida === 0 && escritura === 0 && musica === 0 && respiracion === 0) return;

    // Buscamos cual es la accion mas alta
    const maxAction = Math.max(descanso, comida, escritura, musica, respiracion);

    if (maxAction === escritura) {
      setInsight({
        icon: '✍️',
        title: 'Poniendo en orden la mente',
        description: `Este mes acudiste a tu cuaderno ${escritura} veces para desahogarte. Escribir es un gran paso para procesar tus emociones y soltar la carga.`
      });
    } else if (maxAction === comida) {
      setInsight({
        icon: '🥗',
        title: 'Energía y Buen Ánimo',
        description: `Registraste ${comida} veces que lograste mantener tus tres tiempos de comida. Una buena alimentación es un pilar gigante para tener días más felices.`
      });
    } else if (maxAction === descanso) {
      setInsight({
        icon: '🛌',
        title: 'Escuchando a tu cuerpo',
        description: `En ${descanso} ocasiones elegiste priorizar tu descanso al final del día. Reconocer cuándo parar es la mejor forma de recargar energías.`
      });
    } else if (maxAction === musica) {
      setInsight({
        icon: '🎧',
        title: 'Refugio en el sonido',
        description: `Utilizaste la música ${musica} veces para desconectar y relajarte. El arte es una herramienta poderosa para regular el sistema nervioso.`
      });
    } else if (maxAction === respiracion) {
      setInsight({
        icon: '😮‍💨',
        title: 'Recuperando el control',
        description: `Completaste tu ejercicio de respiración ${respiracion} veces al sentir ansiedad. Estás construyendo un gran hábito para calmar tu mente en momentos críticos.`
      });
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
      setSelectedEmotion(null); 
      setCurrentAdvice('');
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
      setSelectedEmotion(null); 
      setCurrentAdvice('');
    }
  };

  const handleBarPress = (emotionId: string) => {
    if (selectedEmotion === emotionId) {
      setSelectedEmotion(null);
      setCurrentAdvice('');
    } else {
      setSelectedEmotion(emotionId);
      setCurrentAdvice(getRandomAdvice(emotionId));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Tus Estadísticas</Text>

      <View style={styles.graphCard}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePreviousMonth} disabled={currentMonthIndex === 0} style={styles.arrowButton}>
            <Text style={[styles.arrowText, currentMonthIndex === 0 && styles.disabledArrow]}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{months[currentMonthIndex]} 2026</Text>
          <TouchableOpacity onPress={handleNextMonth} disabled={currentMonthIndex === months.length - 1} style={styles.arrowButton}>
            <Text style={[styles.arrowText, currentMonthIndex === months.length - 1 && styles.disabledArrow]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          {chartData.map((data) => {
            const heightPercentage = (data.count / maxCount) * 100;
            const isSelected = selectedEmotion === data.id;

            return (
              <TouchableOpacity key={data.id} style={styles.barWrapper} onPress={() => handleBarPress(data.id)}>
                <View style={[
                  styles.bar, 
                  { 
                    height: `${heightPercentage}%`, 
                    backgroundColor: data.color,
                    opacity: selectedEmotion && !isSelected ? 0.3 : 1 
                  }
                ]} />
                <Text style={styles.barLabel}>{data.label.substring(0, 3)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.detailsContainer}>
          {selectedEmotion ? (
            <View style={styles.selectedInfoBox}>
              <Text style={styles.detailsText}>
                Registraste sentirte <Text style={{fontWeight: 'bold', color: chartData.find(d => d.id === selectedEmotion)?.color}}>{selectedEmotion}</Text> un total de <Text style={{fontWeight: 'bold'}}>{chartData.find(d => d.id === selectedEmotion)?.count}</Text> veces este mes.
              </Text>
              <Text style={styles.adviceText}>{currentAdvice}</Text>
            </View>
          ) : (
            <Text style={styles.detailsHint}>Toca una barra para ver los detalles</Text>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Descubrimientos del mes</Text>

      {/* Renderizamos el descubrimiento dinámico generado por la función */}
      <View style={styles.insightCard}>
        <Text style={{fontSize: 30, marginRight: 15}}>{insight.icon}</Text>
        <View style={styles.insightTextContainer}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.light.background, padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.light.text, marginBottom: 20, marginTop: 40 },
  graphCard: { backgroundColor: '#ffffff', borderRadius: 15, padding: 15, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  arrowButton: { padding: 10 },
  arrowText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.light.primary },
  disabledArrow: { color: '#cccccc' },
  monthText: { fontSize: 18, fontWeight: '600', color: theme.colors.light.text },
  chartContainer: { height: 150, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  barWrapper: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: 25, borderRadius: 5, minHeight: 5 },
  barLabel: { position: 'absolute', bottom: -20, fontSize: 12, color: '#666' },
  detailsContainer: { marginTop: 15, minHeight: 80, justifyContent: 'center', alignItems: 'center' },
  selectedInfoBox: { alignItems: 'center', width: '100%', paddingHorizontal: 10 },
  detailsText: { fontSize: 15, color: '#333', textAlign: 'center', marginBottom: 8 },
  adviceText: { fontSize: 14, color: '#64748B', textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },
  detailsHint: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.light.text, marginBottom: 15 },
  insightCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  insightTextContainer: { flex: 1 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.light.text, marginBottom: 4 },
  insightDescription: { fontSize: 14, color: '#666666', lineHeight: 20 }
});