// Archivo para guardar nuestros colores y medidas centrales
export const theme = {
  colors: {
    light: {
      background: '#F9F5F0', // Tono pastel muy suave para el fondo
      surface: '#FFFFFF', // Fondo de tarjetas o cajas de texto
      text: '#000000', // Texto oscuro para contrastar
      border: '#E0DCD3', // Borde sutil y poco contrastado
      primary: '#A8DADC', // Azul pastel como color principal
    },
    dark: {
      background: '#121212', // Fondo oscuro estandar
      surface: '#1E1E1E', // Cajas un poco mas claras para diferenciarse
      text: '#FFFFFF', // Texto claro
      border: '#333333', // Borde oscuro
      primary: '#457B9D', // Azul principal mas apagado para no lastimar la vista
    }
  },
  borderRadius: {
    soft: 12, // Bordes redondeados y suaves
    round: 24, // Para botones muy circulares
  }
};