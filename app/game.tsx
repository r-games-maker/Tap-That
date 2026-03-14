import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { MenuContext, LEVELS } from '../constants';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { menuVisible, levelsVisible } = useContext(MenuContext);
  const isPaused = menuVisible || levelsVisible;
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const isEndless = params.mode === 'endless';
  const levelIdx = parseInt(params.level as string) || 0;
  const config = isEndless ? { level: '∞', gridSize: 4, target: 999, time: 999, speed: 700 } : LEVELS[levelIdx];

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // Track best Endless score
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(config.time);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [redSquare, setRedSquare] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  // Load High Score on Start
  useEffect(() => {
    if (isEndless) {
      AsyncStorage.getItem('endlessHighScore').then(val => {
        if (val) setHighScore(parseInt(val));
      });
    }
    resetLevelState();
  }, [levelIdx, params.mode]);

  const resetLevelState = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(config.time);
    setGameState('PLAYING');
    setActiveSquare(null);
    setRedSquare(null);
  };

  // Clock Hook
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused || isEndless) return;
    const clockTimer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, [gameState, isPaused, isEndless]);

  // Mole & Trap Hook
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const moleTimer = setInterval(() => {
      const newMole = Math.floor(Math.random() * (config.gridSize * config.gridSize));
      setActiveSquare(newMole);
      if (isEndless && Math.random() > 0.6) {
        let newTrap = Math.floor(Math.random() * (config.gridSize * config.gridSize));
        while (newTrap === newMole) newTrap = Math.floor(Math.random() * (config.gridSize * config.gridSize));
        setRedSquare(newTrap);
      } else {
        setRedSquare(null);
      }
    }, config.speed);
    return () => clearInterval(moleTimer);
  }, [gameState, isPaused, config.speed]);

  // Win/Loss Checker
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (lives <= 0) {
      setGameState('LOST');
      if (isEndless && score > highScore) saveHighScore(score);
    } else if (!isEndless && timeLeft === 0) {
      if (score >= config.target) {
        setGameState('WON');
        saveProgress();
      } else {
        setGameState('LOST');
      }
    }
  }, [lives, timeLeft, score]);

  const saveProgress = async () => {
    const current = await AsyncStorage.getItem('unlockedLevel');
    const next = config.level + 1;
    if (!current || next > parseInt(current)) await AsyncStorage.setItem('unlockedLevel', next.toString());
  };

  const saveHighScore = async (s: number) => {
    setHighScore(s);
    await AsyncStorage.setItem('endlessHighScore', s.toString());
  };

  const handleTap = (index: number) => {
    if (gameState !== 'PLAYING' || isPaused) return;
    if (index === activeSquare) {
      setScore(prev => prev + 1);
      setActiveSquare(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (index === redSquare || !isEndless) { // Only penalize "wrong square" hits if not hit mole
        setLives(prev => Math.max(0, prev - 1));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerLeft: () => null, 
          headerBackVisible: false,
          headerTitle: () => (
            <Image 
              source={require('../assets/images/gavel.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain' }} 
            />
          )
        }} 
      />
      
      <View style={styles.headerInfo}>
        <Text style={styles.levelLabel}>{isEndless ? 'ENDLESS MODE' : `LEVEL ${config.level}`}</Text>
        <Text style={styles.livesText}>{lives > 0 ? '❤️ '.repeat(lives) : '💀 DEAD'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#333' }]}>
          <Text style={styles.statLabel}>{isEndless ? 'BEST' : 'TIME'}</Text>
          <Text style={styles.statValue}>{isEndless ? highScore : `${timeLeft}s`}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{isEndless ? 'MODE' : 'TARGET'}</Text>
          <Text style={styles.statValue}>{isEndless ? '∞' : config.target}</Text>
        </View>
      </View>

      <View style={[styles.grid, { width: width - 40, height: width - 40 }]}>
        {Array.from({ length: config.gridSize * config.gridSize }).map((_, i) => (
          <TouchableOpacity 
            key={i} 
            activeOpacity={1}
            style={[styles.square, { width: (width - 40) / config.gridSize, height: (width - 40) / config.gridSize }]}
            onPress={() => handleTap(i)}
          >
            {activeSquare === i && <View style={styles.mole} />}
            {redSquare === i && <View style={[styles.mole, { backgroundColor: '#E74C3C' }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {gameState !== 'PLAYING' && (
        <View style={styles.overlay}>
          <Text style={styles.resultText}>{gameState === 'WON' ? 'LEVEL COMPLETE!' : 'GAME OVER'}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={gameState === 'WON' ? () => router.setParams({ level: (levelIdx + 1).toString() }) : resetLevelState}
          >
            <Text style={styles.buttonText}>{gameState === 'WON' ? 'NEXT LEVEL' : 'TRY AGAIN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 25 }}>
            <Text style={styles.quitText}>QUIT TO MENU</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', alignItems: 'center' },
  headerInfo: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  levelLabel: { color: '#F1C40F', fontSize: 22, fontWeight: '900', letterSpacing: 4, marginBottom: 10 },
  livesText: { fontSize: 26, letterSpacing: 5 },
  statsRow: { flexDirection: 'row', backgroundColor: '#222', width: '90%', borderRadius: 15, marginBottom: 40, overflow: 'hidden' },
  statCard: { flex: 1, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: '#888', fontSize: 10, fontWeight: '900', marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  square: { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  mole: { width: '85%', height: '85%', backgroundColor: '#F1C40F', borderRadius: 15 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  resultText: { color: '#FFF', fontSize: 32, fontWeight: '900', marginBottom: 40, letterSpacing: 2 },
  button: { backgroundColor: '#F1C40F', paddingHorizontal: 50, paddingVertical: 20, borderRadius: 50 },
  buttonText: { color: '#1A1A1A', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  quitText: { color: '#666', fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
});