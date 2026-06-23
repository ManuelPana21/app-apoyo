// src/constants/emotionAdvice.ts

// Diccionario con listas de frases para cada emocion
const adviceBank = {
  feliz: [
    '"La vida se mueve muy rápido. Si no te detienes y miras a tu alrededor de vez en cuando, podrías perdértela." - Ferris Bueller',
    '"La felicidad se puede encontrar, incluso en los tiempos más oscuros, si uno solo recuerda encender la luz." - Albus Dumbledore',
    '"El ayer es historia, el mañana es un misterio, pero el hoy es un regalo. Por eso lo llaman presente." - Maestro Oogway',
    '"Los milagros no ocurren por sí solos, nosotros los hacemos." - Misato Katsuragi',
    '"A veces nuestra luz se apaga, pero es vuelta a encender por una chispa de otra persona." - Albert Schweitzer',

    '"La felicidad solo es real cuando es compartida." - Christopher McCandless',
    '"No importa lo difícil que sea, siempre hay algo que puedes hacer y en lo que puedes triunfar." - Stephen Hawking',
    '"Si sabes sonreír incluso cuando duele, eres más fuerte de lo que crees." - Kenshin Himura',
    '"La vida es una aventura que merece ser vivida." - Amelia Earhart',
    '"Hoy es un buen día para estar orgulloso de lo lejos que has llegado." - Tío Iroh'
  ],

  tranquilo: [
    '"Cualquier lugar puede ser el paraíso mientras tengas la voluntad de vivir." - Yui Ikari',
    '"No hay nada malo con dejar que las personas que te aman te ayuden." - Tío Iroh',
    '"La paz viene de adentro. No la busques afuera." - Buda',
    '"A veces las cosas más pequeñas ocupan más espacio en tu corazón." - Winnie the Pooh',
    '"No te dejes llevar por los miedos en tu mente. Déjate llevar por los sueños en tu corazón." - Roy T. Bennett',

    '"La paz no es ausencia de conflicto, es la capacidad de manejarlo." - Mahatma Gandhi',
    '"Las flores florecen cuando llega su momento." - Maestro Oogway',
    '"La naturaleza no se apresura, sin embargo todo se logra." - Lao Tsé',
    '"No necesitas correr. El camino seguirá ahí mañana." - Frieren',
    '"La calma es el resultado de aceptar las cosas que no puedes cambiar." - Marco Aurelio'
  ],

  ansioso: [
    '"Debes creer en ti mismo, incluso cuando nadie más lo haga." - Maestro Oogway',
    '"El valor no es la ausencia de miedo, sino el triunfo sobre él." - Nelson Mandela',
    '"Incluso la persona más pequeña puede cambiar el curso del futuro." - Galadriel',
    '"Solo podemos ver poco del futuro, pero lo suficiente para darnos cuenta de que hay mucho que hacer." - Alan Turing',
    '"No puedes cambiar el viento, pero puedes ajustar las velas para llegar a tu destino." - Confucio',

    '"No tienes que hacerlo todo hoy." - Tío Iroh',
    '"Un viaje de mil millas comienza con un solo paso." - Lao Tsé',
    '"Da el primer paso. No es necesario que veas toda la escalera." - Martin Luther King Jr.',
    '"Avanza, aunque sea lentamente. Sigues avanzando." - Edward Elric',
    '"Lo importante no es la velocidad, sino no detenerse." - Confucio'
  ],

  triste: [
    '"Llorar ayuda a frenar y no obsesionarte con el peso de los problemas." - Tristeza (Intensamente)',
    '"Todo lo que tenemos que decidir es qué hacer con el tiempo que se nos ha dado." - Gandalf',
    '"Las estrellas no pueden brillar sin oscuridad." - D.H. Sidebottom',
    '"El dolor es inevitable, pero el sufrimiento es opcional." - Haruki Murakami',
    '"El ave fénix debe arder para poder emerger." - Janet Fitch',

    '"Incluso después de la noche más oscura sale el sol." - Victor Hugo',
    '"Las cicatrices son prueba de que el pasado fue real." - Kenshin Himura',
    '"Lo que hacemos ahora resuena en la eternidad." - Máximo Décimo Meridio',
    '"La esperanza es algo bueno, quizá lo mejor de todo." - Andy Dufresne',
    '"No puedes evitar que las aves de la tristeza vuelen sobre tu cabeza, pero sí que hagan un nido en ella." - Proverbio chino'
  ],

  enojado: [
    '"El enojo nubla la mente. Si miras hacia adentro, encontrarás que la luz siempre ha estado ahí." - Maestro Yoda',
    '"Aferrarse a la ira es como beber veneno y esperar que la otra persona muera." - Buda',
    '"La venganza ha consumido a muchos, no dejaré que me consuma a mí." - TChalla (Black Panther)',
    '"Cualquiera puede enfadarse, eso es fácil. Pero enfadarse con la persona adecuada, en el grado exacto... eso no es fácil." - Aristóteles',
    '"Habla cuando estés enojado y harás el mejor discurso del que te arrepentirás siempre." - Ambrose Bierce',

    '"La mejor batalla es la que se evita." - Sun Tzu',
    '"La ira es una herramienta. Como el fuego, puede cocinar tu comida o quemar tu casa." - Tío Iroh',
    '"Cuando estés furioso, cuenta hasta diez antes de hablar." - Thomas Jefferson',
    '"La verdadera fuerza consiste en dominarse a uno mismo." - Jiraiya',
    '"No dejes que tus emociones controlen tus decisiones." - Capitán Picard'
  ]
};

// Funcion que selecciona una frase al azar segun la emocion
export const getRandomAdvice = (emotionId: string): string => {
  if (emotionId in adviceBank) {
    const list = adviceBank[emotionId as keyof typeof adviceBank];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  return 'Recuerda que cada día es una nueva oportunidad para empezar de nuevo.';
};