import * as FileSystem from 'expo-file-system/legacy';

const USER_IMAGES_DIR = FileSystem.documentDirectory + 'user_images/';

/**
 * Asegura que el directorio 'user_images' existe y contiene un archivo '.nomedia'.
 */
async function ensureDirectoryExists(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(USER_IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(USER_IMAGES_DIR, { intermediates: true });
    }

    const nomediaFile = USER_IMAGES_DIR + '.nomedia';
    const nomediaInfo = await FileSystem.getInfoAsync(nomediaFile);
    if (!nomediaInfo.exists) {
      await FileSystem.writeAsStringAsync(nomediaFile, '');
    }
  } catch (error) {
    console.error('Error al asegurar la existencia del directorio:', error);
    throw error;
  }
}

/**
 * Copia una imagen temporal seleccionada por el picker al directorio persistente 'user_images'.
 * @param tempUri URI temporal de la imagen seleccionada.
 * @returns La nueva URI persistente de la imagen o la URI original si no requiere copia o hay error.
 */
export async function saveImageToPersistentStorage(tempUri: string | null | undefined): Promise<string | null> {
  if (!tempUri) return null;

  // Si la URI ya se encuentra en nuestro directorio persistente, no hacemos nada
  if (tempUri.startsWith(USER_IMAGES_DIR)) {
    return tempUri;
  }

  // Si no es un archivo local (ej. http, https, etc.), la devolvemos tal cual
  if (!tempUri.startsWith('file://') && !tempUri.startsWith('content://') && !tempUri.startsWith('/')) {
    return tempUri;
  }

  try {
    // Aseguramos que la carpeta y el archivo .nomedia existan
    await ensureDirectoryExists();

    // Extraemos el nombre original del archivo libre de parámetros de consulta
    const cleanUri = tempUri.split('?')[0];
    const originalFilename = cleanUri.substring(cleanUri.lastIndexOf('/') + 1);

    // Generamos un nombre único usando la marca de tiempo actual para evitar colisiones
    const ext = originalFilename.includes('.') ? originalFilename.substring(originalFilename.lastIndexOf('.')) : '.jpg';
    const uniqueFilename = `${Date.now()}-${originalFilename || `image${ext}`}`;

    const persistentUri = USER_IMAGES_DIR + uniqueFilename;

    // Copiamos la imagen desde la ubicación temporal al almacenamiento persistente de la app
    await FileSystem.copyAsync({
      from: tempUri,
      to: persistentUri,
    });

    return persistentUri;
  } catch (error) {
    console.error('Error al persistir la imagen en almacenamiento local:', error);
    // En caso de fallo, retornamos la URI original para evitar crashes en tiempo de ejecución
    return tempUri;
  }
}
