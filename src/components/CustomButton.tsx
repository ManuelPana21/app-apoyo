import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

// Anadimos la propiedad opcional style para no romper margenes externos
interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  width?: any;
  style?: StyleProp<ViewStyle>;
}

export default function CustomButton({ title, onPress, color, width, style }: Props) {
  return (
    <TouchableOpacity
      // Combinamos los estilos base, los parametros directos y los estilos externos
      style={[styles.button, { backgroundColor: color || theme.colors.light.primary, width: width || '100%' }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});