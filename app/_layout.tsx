import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F1C40F',
          headerTitleStyle: { fontWeight: '900' },
          headerTitle: "TAP-THAT",
          // This adds the hamburger button to EVERY screen
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
              <Ionicons name="menu" size={32} color="#F1C40F" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* GLOBAL HAMBURGER MENU */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <SafeAreaView style={styles.menuContainer}>
            <Text style={styles.menuTitle}>MENU</Text>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                router.replace('/');
              }}
            >
              <Ionicons name="home" size={24} color="#F1C40F" />
              <Text style={styles.menuText}>HOME SCREEN</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setMenuVisible(false);
                router.replace('/');
                // Logic to open levels would go here
              }}
            >
              <Ionicons name="apps" size={24} color="#F1C40F" />
              <Text style={styles.menuText}>LEVEL SELECT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, { marginTop: 'auto', borderBottomWidth: 0 }]} 
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeText}>CLOSE</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#222',
    width: '70%',
    height: '100%',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  menuTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 40,
    letterSpacing: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: 15,
  },
  menuText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});