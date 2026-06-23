import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRandomAdvice } from '../src/constants/emotionAdvice';
import { emotionColors } from '../src/constants/emotionPhrases';
import { theme } from '../src/constants/theme';
import { getCheckIns } from '../src/services/checkinService';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function StatsScreen() {
  const [monthsList, setMonthsList] = useState<string[]>(['Mes Actual']);
  const [monthlyRecords, setMonthlyRecords] = useState<Record<string, any[]>>({});
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [currentAdvice, setCurrentAdvice] = useState<string>('');

  const [chartData, setChartData] = useState<any[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  
  // 1. ESTADO CORREGIDO A PLURAL Y COMO ARREGLO
  const [insights, setInsights] = useState<any[]>([{
    id: 'inicio',
    icon: '🌱',
    title: 'Comenzando tu camino',
    description: 'Aún estamos recolectando datos sobre tus hábitos. Sigue registrando tus días para descubrir tus patrones.'
  }]);

  useFocusEffect(
    useCallback(() => {
      loadAndGroupData();
    }, [])
  );

  useEffect(() => {
    if (monthsList.length > 0 && monthlyRecords[monthsList[currentMonthIndex]]) {
      const recordsForSelectedMonth = monthlyRecords[monthsList[currentMonthIndex]];
      calculateStatsAndInsights(recordsForSelectedMonth);
      setSelectedEmotion(null);
      setCurrentAdvice('');
    }
  }, [currentMonthIndex, monthsList, monthlyRecords]);

  const loadAndGroupData = async () => {
    const history = await getCheckIns();
    
    if (!history || history.length === 0) return;

    const parseDate = (dateValue: string | number) => {
      if (!dateValue) return new Date();
      if (typeof dateValue === 'string' && (dateValue.includes('/') || dateValue.includes('-'))) {
        const separator = dateValue.includes('/') ? '/' : '-';
        const parts = dateValue.split(separator);
        if (parts[0].length <= 2 && parts[2].length === 4) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
      return new Date(dateValue);
    };

    const sortedHistory = [...history].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    const uniqueMonths: string[] = [];
    const groupedData: Record<string, any[]> = {};

    sortedHistory.forEach(item => {
      const validDate = parseDate(item.date);
      if (!isNaN(validDate.getTime())) {
        const monthYear = `${MONTH_NAMES[validDate.getMonth()]} ${validDate.getFullYear()}`;
        if (!groupedData[monthYear]) {
          groupedData[monthYear] = [];
          uniqueMonths.push(monthYear);
        }
        groupedData[monthYear].push(item);
      }
    });

    if (uniqueMonths.length === 0) {
      setMonthsList(['Sin registros']);
      setCurrentMonthIndex(0);
      return;
    }

    setMonthsList(uniqueMonths);
    setMonthlyRecords(groupedData);
    setCurrentMonthIndex(uniqueMonths.length - 1);
  };

  const calculateStatsAndInsights = (monthData: any[]) => {
    let feliz = 0, triste = 0, ansioso = 0, tranquilo = 0, enojado = 0;
    let descanso = 0, comida = 0, escritura = 0, musica = 0, respiracion = 0;

    monthData.forEach(item => {
      if (item.emotion) {
        if (item.emotion.includes('Feliz')) feliz++;
        else if (item.emotion.includes('Triste')) triste++;
        else if (item.emotion.includes('Ansioso')) ansioso++;
        else if (item.emotion.includes('Tranquilo')) tranquilo++;
        else if (item.emotion.includes('Enojado')) enojado++;
      }

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
    const newMaxCount = Math.max(...newChartData.map(item => item.count));
    setMaxCount(newMaxCount > 0 ? newMaxCount : 1);

    generateInsight(descanso, comida, escritura, musica, respiracion);
  };

  // 2. FUNCIÓN DE DESCUBRIMIENTOS CON ÍCONOS CORRECTOS
  const generateInsight = (descanso: number, comida: number, escritura: number, musica: number, respiracion: number) => {
    const achievedInsights: any[] = []; // Tipado para evitar errores TS

    if (escritura > 0) {
      achievedInsights.push({
        id: 'escritura',
        icon: '✍️',
        title: 'Poniendo en orden la mente',
        description: `Acudiste a tu cuaderno ${escritura} veces para desahogarte. Escribir es un gran paso para procesar tus emociones.`
      });
    }
    if (comida > 0) {
      achievedInsights.push({
        id: 'comida',
        icon: '🥗',
        title: 'Energía y Buen Ánimo',
        description: `Lograste mantener tus tres tiempos de comida ${comida} veces. Una buena alimentación es un pilar gigante.`
      });
    }
    if (descanso > 0) {
      achievedInsights.push({
        id: 'descanso',
        icon: '🛌',
        title: 'Escuchando a tu cuerpo',
        description: `Elegiste priorizar tu descanso al final del día ${descanso} veces. Reconocer cuándo parar recarga tus energías.`
      });
    }
    if (musica > 0) {
      achievedInsights.push({
        id: 'musica',
        icon: '🎧',
        title: 'Refugio en el sonido',
        description: `Utilizaste la música ${musica} veces para desconectar. El arte es una herramienta poderosa para regularte.`
      });
    }
    if (respiracion > 0) {
      achievedInsights.push({
        id: 'respiracion',
        icon: '😮‍💨',
        title: 'Recuperando el control',
        description: `Completaste tu ejercicio de respiración ${respiracion} veces al sentir ansiedad. Estás construyendo un gran hábito.`
      });
    }

    if (achievedInsights.length === 0) {
      achievedInsights.push({
        id: 'vacio',
        icon: '🌱',
        title: 'Recopilando datos',
        description: 'Aún no hay suficientes hábitos registrados en este mes para generar un descubrimiento.'
      });
    }

    setInsights(achievedInsights);
  };

  const handlePreviousMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < monthsList.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Funcion interactiva de las barras
  const handleBarPress = (emotionId: string) => {
    if (selectedEmotion === emotionId) {
      setSelectedEmotion(null);
      setCurrentAdvice('');
    } else {
      setSelectedEmotion(emotionId);
      // Obtenemos la frase aleatoria desde tu archivo de constantes
      setCurrentAdvice(getRandomAdvice(emotionId) || '');
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
          
          <Text style={styles.monthText}>{monthsList[currentMonthIndex]}</Text>
          
          <TouchableOpacity onPress={handleNextMonth} disabled={currentMonthIndex === monthsList.length - 1} style={styles.arrowButton}>
            <Text style={[styles.arrowText, currentMonthIndex === monthsList.length - 1 && styles.disabledArrow]}>{'>'}</Text>
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

      {/* 3. TIPADO CORREGIDO EN EL MAP PARA EVITAR EL ERROR 'ANY' */}
      {insights.map((item: any) => (
        <View key={item.id} style={styles.insightCard}>
          <Text style={{fontSize: 30, marginRight: 15}}>{item.icon}</Text>
          <View style={styles.insightTextContainer}>
            <Text style={styles.insightTitle}>{item.title}</Text>
            <Text style={styles.insightDescription}>{item.description}</Text>
          </View>
        </View>
      ))}

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
  monthText: { fontSize: 18, fontWeight: '600', color: theme.colors.light.text, textTransform: 'capitalize' },
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