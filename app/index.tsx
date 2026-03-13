import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS } from './game'; // Ensure this is exported in game.tsx

export default function HomeScreen() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load progress when screen opens
  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem('unlockedLevel');
      if (saved) setUnlockedLevel(parseInt(saved));
    };
    loadProgress();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Custom Gavel Image */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/gavel.png')} 
          style={styles.headerImage} 
        />
        <Text style={styles.title}>TAP-THAT</Text>
      </View>

      {/* Main Play Button */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.playButtonText}>START GAME</Text>
        </TouchableOpacity>
      </View>

      {/* Level Select Pop-up Menu */}
      <Modal
        visible={isMenuOpen}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CHOOSE LEVEL</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.levelGrid}>
              {LEVELS.map((lvl, i) => {
                const isLocked = lvl.level > unlockedLevel;
                return (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.levelCard, isLocked && styles.lockedCard]}
                    onPress={() => {
                      if (!isLocked) {
                        setIsMenuOpen(false);
                        router.push({ pathname: '/game', params: { level: i } });
                      }
                    }}
                  >
                    <Text style={[styles.levelNumber, isLocked && {color: '#444'}]}>
                      {isLocked ? '🔒' : lvl.level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    paddingHorizontal: 20, 
    paddingTop: 80 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  headerImage: {
    width: 140,
    height: 140,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: { 
    color: '#FFF', 
    fontSize: 42, 
    fontWeight: '900', 
    letterSpacing: 2
  },
  menuContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    width: '100%',
    paddingBottom: 100
  },
  playButton: { 
    backgroundColor: '#F1C40F', 
    paddingVertical: 22, 
    borderRadius: 50, 
    alignItems: 'center',
    shadowColor: '#F1C40F',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10
  },
  playButtonText: { 
    color: '#1A1A1A', 
    fontSize: 26, 
    fontWeight: '900', 
    letterSpacing: 3 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#222', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    height: '75%', 
    padding: 25,
    borderWidth: 1,
    borderColor: '#333'
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  modalTitle: { 
    color: '#FFF', 
    fontSize: 24, 
    fontWeight: '900' 
  },
  closeButton: { 
    color: '#888', 
    fontSize: 32, 
    padding: 5 
  },
  levelGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 15,
    paddingBottom: 40
  },
  levelCard: { 
    width: 70, 
    height: 70, 
    backgroundColor: '#333', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444'
  },
  lockedCard: { 
    backgroundColor: '#151515',
    borderColor: '#222'
  },
  levelNumber: { 
    color: '#F1C40F', 
    fontSize: 22, 
    fontWeight: '900' 
  },
});