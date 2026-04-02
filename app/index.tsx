import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS } from '../constants';

export default function HomeScreen() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isLevelModalOpen, setLevelModalOpen] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem('unlockedLevel');
      if (saved) setUnlockedLevel(parseInt(saved));
    };
    loadProgress();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/gavel.png')} style={styles.headerImage} />
        <Text style={styles.title}>Hole-y Mole-y!</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.playButton} onPress={() => setLevelModalOpen(true)}>
          <Text style={styles.playButtonText}>CLASSIC MODE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.playButton, { backgroundColor: '#E74C3C', marginTop: 20 }]} onPress={() => router.push({ pathname: '/game', params: { mode: 'endless' } })}>
          <Text style={[styles.playButtonText, { color: '#FFF' }]}>ENDLESS MODE</Text>
        </TouchableOpacity>

      </View>

      

      <Modal visible={isLevelModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>LEVEL SELECT</Text>
              <TouchableOpacity onPress={() => setLevelModalOpen(false)}><Text style={styles.closeX}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.levelGrid}>
              {LEVELS.map((lvl, i) => {
                const isLocked = lvl.level > unlockedLevel;
                return (
                  <TouchableOpacity key={i} style={[styles.levelCard, isLocked && styles.lockedCard]} onPress={() => { if (!isLocked) { setLevelModalOpen(false); router.push({ pathname: '/game', params: { level: i } }); }}}>
                    <Text style={[styles.levelNumber, isLocked && {color: '#444'}]}>{isLocked ? '🔒' : lvl.level}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 30 },
  headerImage: { width: 140, height: 140, marginBottom: 10, resizeMode: 'contain' },
  title: { color: '#FFF', fontSize: 42, fontWeight: '900', letterSpacing: 2 },
  menuContainer: { flex: 1, justifyContent: 'center', width: '100%', paddingBottom: 100 },
  playButton: { backgroundColor: '#F1C40F', paddingVertical: 22, borderRadius: 50, alignItems: 'center' },
  playButtonText: { color: '#1A1A1A', fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '80%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  closeX: { color: '#888', fontSize: 30 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  levelCard: { width: 70, height: 70, backgroundColor: '#333', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  lockedCard: { backgroundColor: '#111' },
  levelNumber: { color: '#F1C40F', fontSize: 22, fontWeight: '900' },
});