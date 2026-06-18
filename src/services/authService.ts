import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  profilePicture?: string;
  gender?: string;
  hobbies?: string[];
  isFirstLogin?: boolean;
}

const USERS_KEY = '@app_users';
const CURRENT_USER_KEY = '@app_current_user';

// Obtener todos los usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Obtener usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Iniciar sesión
export const login = async (username: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, error: 'Usuario o contraseña incorrectos' };
};

// Registrarse
export const register = async (fullName: string, username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
  const users = await getUsers();
  if (users.some(u => u.username === username)) {
    return { success: false, error: 'El usuario ya existe' };
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    fullName,
    username,
    password,
    isFirstLogin: true // Marcamos que es nuevo
  };
  
  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { success: true };
};

// Cerrar sesión
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

// Actualizar perfil (Hobbies, foto, etc)
export const updateUserProfile = async (updatedData: Partial<User>): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    const updatedUser = { ...currentUser, ...updatedData };
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
      users[userIndex] = updatedUser;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return true;
  } catch (error) {
    return false;
  }
};