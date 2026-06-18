// src/constants/emotionPhrases.ts

// Definimos la estructura de nuestras frases
type GenderOption = 'Hombre' | 'Mujer' | 'Otro';

const phrases = {
  feliz: {
    Hombre: 'Me siento muy contento y motivado',
    Mujer: 'Me siento muy contenta y motivada',
    Otro: 'Me siento con mucha alegría y motivación',
  },
  triste: {
    Hombre: 'Me siento algo decaído hoy',
    Mujer: 'Me siento algo decaída hoy',
    Otro: 'Me siento con bastante tristeza hoy',
  },
  ansioso: {
    Hombre: 'Me siento ansioso y algo abrumado',
    Mujer: 'Me siento ansiosa y algo abrumada',
    Otro: 'Me siento con mucha ansiedad e inquietud',
  },
  tranquilo: {
    Hombre: 'Me siento tranquilo y relajado',
    Mujer: 'Me siento tranquila y relajada',
    Otro: 'Me siento en total calma y paz',
  }
};

// Función que exportaremos para usar en el check-in
export const getEmotionPhrase = (emotionId: string, userGender?: string): string => {
  // Normalizamos el género, si no existe o no coincide, usamos 'Otro' como neutral
  const gender: GenderOption = (userGender === 'Hombre' || userGender === 'Mujer') 
    ? userGender 
    : 'Otro';
  
  // Si la emoción existe en nuestro diccionario, devolvemos la frase exacta
  if (emotionId in phrases) {
    return phrases[emotionId as keyof typeof phrases][gender];
  }
  
  // Mensaje por defecto por si agregamos una emoción nueva en el futuro y olvidamos ponerla aquí
  return 'He registrado cómo me siento hoy'; 
};