import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐹</Text>
      <Text style={styles.title}>WHACK-A-MOLE</Text>
      <Text style={styles.subtitle}>Can you beat the high score?</Text>

      <TouchableOpacity 
        style={styles.playButton} 
        onPress={() => router.push('/game')} // This sends the user to the game
      >
        <Text style={styles.buttonText}>PLAY NOW</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>v1.0.0 - Built with Expo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80, marginBottom: 10 },
  title: { fontSize: 40, fontWeight: '900', color: '#FFF', letterSpacing: 4 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 50 },
  playButton: { 
    backgroundColor: '#F1C40F', 
    paddingHorizontal: 60, 
    paddingVertical: 20, 
    borderRadius: 50,
    elevation: 10,
    shadowColor: '#F1C40F',
    shadowOpacity: 0.5,
    shadowRadius: 15
  },
  buttonText: { color: '#1A1A1A', fontSize: 22, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 40, color: '#444', fontSize: 12, fontWeight: 'bold' }
});