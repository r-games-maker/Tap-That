import React, { useState, useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router'; 
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Pressable, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Image,
  Dimensions
} from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuContext, LEVELS } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();
  const currentPath = usePathname(); 
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [levelsVisible, setLevelsVisible] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('unlockedLevel');
      if (saved) setUnlockedLevel(parseInt(saved));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (menuVisible || levelsVisible) loadProgress();
  }, [menuVisible, levelsVisible]);

  return (
    <MenuContext.Provider value={{ menuVisible, levelsVisible }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerShadowVisible: false,
          headerLeft: () => null, 
          headerRight: () => null, // 1. COMPLETELY EMPTY the native slot (no more bubble)
          headerBackVisible: false,
          headerTitleAlign: 'center',
          // 2. We use the Title slot for the ENTIRE header layout
          headerTitle: () => (
            <View style={styles.fullWidthHeader}>
                {/* Spacer to keep Gavel centered */}
                <View style={{ width: 40 }} /> 

                <Text style={styles.headerTitleText}>Hole-y Mole-y!</Text>

                <Pressable 
                    onPress={() => setMenuVisible(true)}
                    hitSlop={15}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                        width: 40, 
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    })}
                >
                    <Ionicons name="menu" size={32} color="#F1C40F" />
                </Pressable>
            </View>
          ),
          headerTitleStyle: { width: screenWidth }, // Forces the container to be wide
        }}
      />

      {/* --- HAMBURGER MENU MODAL --- */}
      <Modal visible={menuVisible} animationType="fade" transparent={true}>
        <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>MENU</Text>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { 
                  setMenuVisible(false); 
                  if (currentPath !== '/') {
                    router.replace('/'); 
                  }
                }}
              >
                <Ionicons name="home" size={24} color="#F1C40F" />
                <Text style={styles.menuText}>HOME SCREEN</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { 
                  setMenuVisible(false); 
                  setLevelsVisible(true); 
                }}
              >
                <Ionicons name="apps" size={24} color="#F1C40F" />
                <Text style={styles.menuText}>LEVEL SELECT</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- LEVEL SELECT MODAL --- */}
      <Modal visible={levelsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CHOOSE LEVEL</Text>
              <TouchableOpacity onPress={() => setLevelsVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
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
  fullWidthHeader: {
    width: screenWidth - 32, // Accommodates standard iOS margins
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', 
    alignItems: 'flex-end' 
  },
  headerTitleText: {
    color: '#F1C40F',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase', // Optional: makes it feel more like a "Game Logo"
  },
  menuContainer: { 
    backgroundColor: '#222', 
    width: '75%', 
    height: '100%', 
    padding: 25 
  },
  menuTitle: { 
    color: '#888', 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    marginTop: 20, 
    letterSpacing: 2 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 22, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333', 
    gap: 15 
  },
  menuText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#1A1A1A', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    height: '80%', 
    padding: 25 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  modalTitle: { 
    color: '#FFF', 
    fontSize: 24, 
    fontWeight: '900' 
  },
  closeX: { 
    color: '#888', 
    fontSize: 30 
  },
  levelGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 15, 
    paddingBottom: 40 
  },
  levelCard: { 
    width: 70,  height: 70,  backgroundColor: '#333',  borderRadius: 18,  justifyContent: 'center',  alignItems: 'center'  },
  lockedCard: {  backgroundColor: '#111'  },
  levelNumber: {  color: '#F1C40F',  fontSize: 22,  fontWeight: '900'  },
});