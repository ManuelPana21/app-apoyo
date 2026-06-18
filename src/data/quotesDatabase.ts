// Definimos el molde exacto que debe tener cada frase
export interface Quote {
  id: string;
  text: string;
  source?: string; // El signo de interrogacion significa que es opcional
  category: 'positive' | 'negative';
}

// Este es tu banco de datos. Aqui agregaras todas tus frases.
export const quotesDatabase: Quote[] = [
  {
    id: '1',
    text: 'Cualquier lugar puede ser un paraíso siempre que tengas la voluntad de vivir.',
    source: 'Yui Ikari',
    category: 'negative'
  },
  {
    id: '2',
    text: 'Recuerda que está bien no estar bien siempre. Tómate tu tiempo, respira y no te desanimes.',
    category: 'negative'
  },
  {
    id: '3',
    text: '¡Qué buen mes! Sigue manteniendo esa energía, vas por un excelente camino.',
    category: 'positive'
  },
  {
    id: '4',
    text: 'La constancia es la clave. Sigue cultivando esa tranquilidad todos los días.',
    source: 'Anónimo',
    category: 'positive'
  }
];