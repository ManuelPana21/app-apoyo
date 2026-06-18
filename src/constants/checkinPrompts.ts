export const generateCalmQuestion = () => {
  const hour = new Date().getHours();
  let questions: string[] = [];

  if (hour >= 5 && hour < 12) {
    questions = [
      'Cambiando de tema, ¿ya tomaste tu primer vaso de agua hoy?',
      '¿Ya desayunaste algo rico para empezar bien el día?',
      '¿Has podido estirarte un poco esta mañana?'
    ];
  } else if (hour >= 12 && hour < 19) {
    questions = [
      'Cambiando de tema, ¿ya almorzaste para recargar energías?',
      '¿Te has tomado un pequeño descanso de tus deberes esta tarde?',
      '¿Has recordado mantenerte hidratado?'
    ];
  } else {
    questions = [
      'Cambiando de tema, ¿ya cenaste algo ligero para terminar el día?',
      '¿Ya empezaste a desconectar de las pantallas para descansar?',
      '¿Tienes todo listo para poder dormir bien esta noche?'
    ];
  }
  
  return questions[Math.floor(Math.random() * questions.length)];
};

export const getFoodTip = (tempFactor: string) => {
  if (tempFactor.includes('Sí')) return '¡Excelente! Mantener tu cuerpo con energy es clave para seguir así de bien.';
  if (tempFactor.includes('Solo dos')) return 'Recuerda que una alimentación completa ayuda mucho a mantener esa buena energía.';
  return 'Entiendo. Por favor, intenta comer algo pronto, tu cuerpo necesita combustible para seguir sintiéndose bien.';
};

export const getComfortTip = (tempFactor: string, hobbies?: string[]) => {
  // Verificamos si hay pasatiempos validos y elegimos uno al azar
  let hobbySuggestion = '';
  if (hobbies && hobbies.length > 0) {
    const randomHobby = hobbies[Math.floor(Math.random() * hobbies.length)];
    // Lo pasamos a minusculas para que encaje bien en medio de la frase
    hobbySuggestion = ` Quizá dedicar un rato a ${randomHobby.toLowerCase()} te ayude a despejar la mente.`;
  }

  if (tempFactor.includes('descansar')) return `Te aconsejo que esta noche te olvides de todo, dejes el celular en silencio y te acomodes para dormir. Ahora mismo solo existes tú y tu cama.${hobbySuggestion}`;
  if (tempFactor.includes('suave')) return `La música lo-fi suele relajar a la gente por sus ritmos tan profundos y suaves, podrías intentarlo.${hobbySuggestion}`;
  return `Escucha tu música favorita esta noche hasta dormir, no importa el género, el artista o el año. Te gusta y eso está bien.${hobbySuggestion}`;
};

export const getHabitTip = (tempFactor: string) => {
  if (tempFactor.includes('Sí')) return '¡Me alegra mucho escuchar eso! Cuidar de ti mismo es el mejor hábito que puedes tener.';
  return 'No hay prisa, pero por favor no olvides dedicarte un momento para hacerlo. Tu bienestar es importante.';
};

export const getAnxiousTip = (hobbies?: string[]) => {
  if (hobbies && hobbies.length > 0) {
    const randomHobby = hobbies[Math.floor(Math.random() * hobbies.length)];
    return `Para terminar de relajarte, te recomiendo enfocarte en algo que disfrutes mucho, como ${randomHobby.toLowerCase()}. Te ayudará a anclarte en el presente.`;
  }
  return 'Para terminar de relajarte, te recomiendo escuchar música tranquila o lo-fi, jugar algún videojuego que te guste o ver tu serie favorita.';
};