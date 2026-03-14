import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
// 1. Image added to this list
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from 'react-native'; 
// 2. Switched to the modern SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuContext, LEVELS } from '../constants';

export default function RootLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [levelsVisible, setLevelsVisible] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  const loadProgress = async () => {
    const saved = await AsyncStorage.getItem('unlockedLevel');
    if (saved) setUnlockedLevel(parseInt(saved));
  };

  useEffect(() => {
    if (menuVisible || levelsVisible) loadProgress();
  }, [menuVisible, levelsVisible]);

  return (
    <MenuContext.Provider value={{ menuVisible, levelsVisible }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F1C40F',
          // 3. The Image is now safely defined
          headerTitle: () => (
            <Image 
              source={require('../assets//images/gavel.png')} 
              style={{ width: 40, height: 40, resizeMode: 'contain' }} 
            />
          ),
          headerTitleAlign: 'center',
          headerLeft: () => null,
          // Inside app/_layout.tsx -> screenOptions
headerRight: () => (
  <TouchableOpacity 
    onPress={() => setMenuVisible(true)} 
    activeOpacity={1} 
    style={{ 
      marginRight: 15,
      backgroundColor: 'transparent',
    }}
  >
    <Ionicons 
      name="menu" 
      size={32} 
      color="#F1C40F" 
    />
  </TouchableOpacity>
),
        }}
      />

      {/* HAMBURGER MENU */}
      <Modal visible={menuVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <SafeAreaView>
              <Text style={styles.menuTitle}>MENU</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.replace('/'); }}>
                <Ionicons name="home" size={24} color="#F1C40F" />
                <Text style={styles.menuText}>HOME SCREEN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setLevelsVisible(true); }}>
                <Ionicons name="apps" size={24} color="#F1C40F" />
                <Text style={styles.menuText}>LEVEL SELECT</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LEVEL SELECT MODAL */}
      <Modal visible={levelsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CHOOSE LEVEL</Text>
              <TouchableOpacity onPress={() => setLevelsVisible(false)}><Text style={styles.closeX}>✕</Text></TouchableOpacity>
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
                        setLevelsVisible(false); 
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
    </MenuContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'flex-end' },
  menuContainer: { backgroundColor: '#222', width: '75%', height: '100%', padding: 25 },
  menuTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 40, marginTop: 40, letterSpacing: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: '#333', gap: 15 },
  menuText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '80%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  closeX: { color: '#888', fontSize: 30 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingBottom: 40 },
  levelCard: { width: 70, height: 70, backgroundColor: '#333', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  lockedCard: { backgroundColor: '#111' },
  levelNumber: { color: '#F1C40F', fontSize: 22, fontWeight: '900' },
});