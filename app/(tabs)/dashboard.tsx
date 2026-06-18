import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import CustomButton from '../../src/components/CustomButton';
import { theme } from '../../src/constants/theme';
import { Quote, quotesDatabase } from '../../src/data/quotesDatabase';
// Importamos los servicios de la base de datos local
import { CheckIn, getCheckIns, getTodayCheckIn } from '../../src/services/checkinService';

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

  // Estados para manejar la informacion real de la base de datos
  const [todayMood, setTodayMood] = useState<CheckIn | null>(null);
  const [dailyQuote, setDailyQuote] = useState<Quote>(getRandomQuote([]));
  const [chartData, setChartData] = useState([
    { name: 'Feliz', count: 0, color: '#A8DADC', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Triste', count: 0, color: '#8FAADC', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Ansioso', count: 0, color: '#ffb3ba', legendFontColor: '#475569', legendFontSize: 14 },
    { name: 'Tranquilo', count: 0, color: '#baffc9', legendFontColor: '#475569', legendFontSize: 14 },
  ]);

  // Ejecuta la recoleccion de datos al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadRealData();
    }, [])
  );

  const loadRealData = async () => {
    const history = await getCheckIns();
    const today = await getTodayCheckIn();

    setTodayMood(today);

    let feliz = 0, triste = 0, ansioso = 0, tranquilo = 0;

    // Conteo seguro de las emociones evitando datos corruptos
    history.forEach(item => {
      if (item && item.emotion) {
        if (item.emotion.includes('Feliz')) feliz++;
        else if (item.emotion.includes('Triste')) triste++;
        else if (item.emotion.includes('Ansioso')) ansioso++;
        else if (item.emotion.includes('Tranquilo')) tranquilo++;
      }
    });

    const newChartData = [
      { name: 'Feliz', count: feliz, color: '#A8DADC', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Triste', count: triste, color: '#8FAADC', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Ansioso', count: ansioso, color: '#ffb3ba', legendFontColor: '#475569', legendFontSize: 14 },
      { name: 'Tranquilo', count: tranquilo, color: '#baffc9', legendFontColor: '#475569', legendFontSize: 14 },
    ];

    setChartData(newChartData);
    setDailyQuote(getRandomQuote(newChartData));
  };

  // Calculamos si hay registros para saber si mostrar el grafico
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
        
        {/* Renderizado condicional: evitamos colapsar si la grafica tiene puros 0 */}
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
          <Text style={styles.emptyChartText}>Registra tu primer estado para visualizar la gráfica.</Text>
        )}

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
        
        {/* Boton dinamico conectado a la base de datos */}
        <CustomButton 
          title={todayMood ? 'Actualizar mi día' : 'Registrar mi día'} 
          onPress={() => router.push('/check-in')} 
        />
      </View>

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
  spacer: {
    flex: 1,
  }
});