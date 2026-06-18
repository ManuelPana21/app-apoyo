import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// AQUI ESTA LA LINEA CLAVE
interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isDark?: boolean;
  isPassword?: boolean; 
}

export default function CustomInput({ placeholder, value, onChangeText, isDark = false, isPassword = false }: CustomInputProps) {
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        style={styles.input}
        placeholderTextColor="#A0AEC0"
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.iconButton}>
          <Ionicons name={secure ? 'eye-off' : 'eye'} size={20} color="#718096" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
    fontSize: 16,
  },
  iconButton: {
    padding: 5,
  },
});