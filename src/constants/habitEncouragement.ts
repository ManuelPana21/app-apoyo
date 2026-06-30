// Estructura de los datos para mantener el tipado estricto
export interface HabitQuote {
  quote: string;
  author: string;
}

const quotes = {
  micro: [
    { quote: "Si no te gusta la mano que te repartió el destino, lucha por conseguir una nueva.", author: "Naruto Uzumaki (Naruto)" },
    { quote: "Si no asumes riesgos, no puedes crear un futuro.", author: "Monkey D. Luffy (One Piece)" },
    { quote: "No importa si eres débil. Eso significa que todavía tienes espacio para crecer.", author: "Ittetsu Takeda (Haikyuu!!)" },
    { quote: "Un hombre que mueve una montaña comienza llevando pequeñas piedras.", author: "Confucio" },
    { quote: "No tienes que ser grande para empezar, pero tienes que empezar para ser grande.", author: "Zig Ziglar" },
    { quote: "Un viaje de mil kilómetros comienza con un solo paso.", author: "Lao Tsé" },
    { quote: "Haz o no hagas. No existe el intento.", author: "Maestro Yoda (Star Wars)" },
    { quote: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.", author: "Henry Ford" },
    { quote: "Nunca sabes lo fuerte que eres hasta que ser fuerte es tu única opción.", author: "Bob Marley" }
  ],
  half: [
    { quote: "Si hay un muro en nuestro camino, ¡lo derribaremos! Si no existe un camino, ¡lo construiremos nosotros mismos!", author: "Simon (Tengen Toppa Gurren Lagann)" },
    { quote: "No creas en ti. Cree en mí. Cree en el yo que cree en ti.", author: "Kamina (Tengen Toppa Gurren Lagann)" },
    { quote: "Ya sea que ganes o pierdas, mirar atrás y aprender de la experiencia es parte de la vida.", author: "All Might (My Hero Academia)" },
    { quote: "Una persona crece cuando es capaz de superar las dificultades.", author: "Jiraiya (Naruto)" },
    { quote: "Si sigues pensando y nunca actúas, terminarás quedándote atrás.", author: "Killua Zoldyck (Hunter × Hunter)" },
    { quote: "Si estás pasando por el infierno, sigue adelante.", author: "Winston Churchill" },
    { quote: "Mientras sigas respirando, siempre puedes volver a levantarte.", author: "Tanjiro Kamado (Demon Slayer)" },
    { quote: "El trabajo duro vence al talento cuando el talento no trabaja duro.", author: "Tim Notke" },
    { quote: "No todo el que trabaja duro es recompensado. Pero todos los que triunfan han trabajado duro.", author: "Genji Kamogawa (Hajime no Ippo)" }
  ],
  almost: [
    { quote: "No te distraigas con los '¿y si...?'. Lo único que eliges por ti mismo es la verdad de tu universo.", author: "Kamina (Tengen Toppa Gurren Lagann)" },
    { quote: "No hay vergüenza en caer. La verdadera vergüenza es no levantarse otra vez.", author: "Shintaro Midorima (Kuroko no Basket)" },
    { quote: "Levántate y sigue adelante. Tienes dos buenas piernas. Úsalas. Tú puedes crear tu propio camino.", author: "Edward Elric (Fullmetal Alchemist)" },
    { quote: "El momento en que piensas en rendirte, piensa en la razón por la que has resistido tanto tiempo.", author: "Natsu Dragneel (Fairy Tail)" },
    { quote: "No importa cuán pesada parezca la meta. No debes renunciar a ella.", author: "Monkey D. Luffy (One Piece)" },
    { quote: "Cuando te rindes, ahí se acaba el juego.", author: "Mitsuyoshi Anzai (Slam Dunk)" },
    { quote: "No importa cuántas veces caigas. Lo importante es cuántas veces te levantas.", author: "Vince Lombardi" },
    { quote: "La esperanza es lo único más fuerte que el miedo.", author: "President Snow (The Hunger Games)" },
    { quote: "Todo lo que alguna vez quisiste está al otro lado del miedo.", author: "George Addair" }
  ],
  complete: [
    { quote: "Las lecciones sin dolor no tienen sentido. Pero quien supera ese dolor obtiene un corazón inigualable.", author: "Edward Elric (Fullmetal Alchemist: Brotherhood)" },
    { quote: "Dios nos dio ojos al frente para mirar hacia el futuro.", author: "Kamina (Tengen Toppa Gurren Lagann)" },
    { quote: "La verdadera fuerza de la humanidad es que tenemos el poder de cambiarnos a nosotros mismos.", author: "Saitama (One-Punch Man)" },
    { quote: "El miedo no es malo. Te muestra tus debilidades, y cuando las conoces puedes hacerte más fuerte.", author: "Gildarts Clive (Fairy Tail)" },
    { quote: "El mundo no es perfecto. Pero está ahí para nosotros, haciendo lo mejor que puede. Eso es lo que lo hace tan hermoso.", author: "Roy Mustang (Fullmetal Alchemist: Brotherhood)" },
    { quote: "El futuro pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt" },
    { quote: "La fuerza no proviene de la capacidad física. Proviene de una voluntad indomable.", author: "Mahatma Gandhi" },
    { quote: "La mejor manera de predecir el futuro es crearlo.", author: "Peter Drucker" },
    { quote: "No puedes volver atrás y cambiar el principio, pero puedes empezar donde estás y cambiar el final.", author: "C. S. Lewis" }
  ]
};

// Función utilitaria que evalúa el porcentaje y retorna una frase aleatoria del bloque correcto
export const getRandomEncouragement = (percentage: number): HabitQuote => {
  let categoryQuotes: HabitQuote[] = [];

  if (percentage > 0 && percentage <= 25) {
    categoryQuotes = quotes.micro;
  } else if (percentage > 25 && percentage <= 75) {
    categoryQuotes = quotes.half;
  } else if (percentage > 75 && percentage < 100) {
    categoryQuotes = quotes.almost;
  } else {
    // Si es 100% o más
    categoryQuotes = quotes.complete;
  }

  // Selección aleatoria dentro del arreglo elegido
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
};