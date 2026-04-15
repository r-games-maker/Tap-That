import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics'; // 1. Import the Haptics library
import { MenuContext, LEVELS } from '../constants';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { menuVisible, levelsVisible } = useContext(MenuContext);
  const isPaused = menuVisible || levelsVisible;
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const isEndless = params.mode === 'endless';
  const levelIdx = parseInt(params.level as string) || 0;
  
  const config = isEndless 
    ? { level: '∞', gridSize: 4, target: 999, time: 999, speed: 700, moleDuration: 900 } 
    : LEVELS[levelIdx];

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(config.time);
  
  const [activeMoles, setActiveMoles] = useState<number[]>([]);
  const [activeTraps, setActiveTraps] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

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
    setActiveMoles([]);
    setActiveTraps([]);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused || isEndless) return;
    const clockTimer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, [gameState, isPaused, isEndless]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    let currentSpeed = config.speed;
    let currentDuration = config.moleDuration || Math.floor(config.speed * 1.4);

    if (isEndless && score > 35) {
        currentSpeed = Math.max(350, config.speed - (score - 35) * 5);
        currentDuration = Math.floor(currentSpeed * 1.4);
    }

    const gameLoop = setInterval(() => {
      const totalSquares = config.gridSize * config.gridSize;
      
      let newMoleIndex: number;
      do {
        newMoleIndex = Math.floor(Math.random() * totalSquares);
      } while (activeTraps.includes(newMoleIndex));
    
      setActiveMoles(prev => [...prev, newMoleIndex]);
      
      setTimeout(() => {
        setActiveMoles(prev => prev.filter(m => m !== newMoleIndex));
      }, currentDuration);
    
      if (isEndless) {
        const trapChance = score > 100 ? 0.55 : 0.40;
        if (Math.random() < trapChance) {
          let trapIndex: number;
          do {
            trapIndex = Math.floor(Math.random() * totalSquares);
          } while (
            trapIndex === newMoleIndex || 
            activeMoles.includes(trapIndex) || 
            activeTraps.includes(trapIndex)
          );
    
          setActiveTraps(prev => [...prev, trapIndex]);
          
          setTimeout(() => {
            setActiveTraps(prev => prev.filter(t => t !== trapIndex));
          }, currentDuration);
        }
      }
    }, currentSpeed);

    return () => clearInterval(gameLoop);
  }, [gameState, isPaused, score, config, activeMoles, activeTraps]);

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
    const next = levelIdx + 2; 
    if (!current || next > parseInt(current)) await AsyncStorage.setItem('unlockedLevel', next.toString());
  };

  const saveHighScore = async (s: number) => {
    setHighScore(s);
    await AsyncStorage.setItem('endlessHighScore', s.toString());
  };

  const handleTap = (index: number) => {
    if (gameState !== 'PLAYING' || isPaused) return;

    if (activeMoles.includes(index)) {
      setScore(prev => prev + 1);
      setActiveMoles(prev => prev.filter(m => m !== index));
      
      // Optional: Add a very light tap sensation for successful hits
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
    } else {
      setLives(prev => Math.max(0, prev - 1));
      
      // 2. Trigger a sharp error vibration when losing a life
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= 3; i++) {
      hearts.push(
        <Text key={i} style={[styles.heart, i > lives && styles.fadedHeart]}>❤️</Text>
      );
    }
    return hearts;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.levelLabel}>
          {isEndless ? 'ENDLESS MODE' : `LEVEL ${config.level}`}
          {!isEndless && <Text style={styles.targetLabel}>  •  TARGET: {config.target}</Text>}
        </Text>
        <View style={styles.livesRow}>{renderHearts()}</View>
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
          <Text style={styles.statLabel}>{isEndless ? 'SPEED' : 'TARGET'}</Text>
          <Text style={styles.statValue}>
            {isEndless ? `${Math.max(350, config.speed - (score > 35 ? (score - 35) * 5 : 0))}ms` : config.target}
          </Text>
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
            {activeMoles.includes(i) && <View style={styles.mole} />}
            {activeTraps.includes(i) && <View style={[styles.mole, { backgroundColor: '#E74C3C' }]} />}
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
  levelLabel: { color: '#F1C40F', fontSize: 20, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  targetLabel: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  livesRow: { flexDirection: 'row', gap: 10 },
  heart: { fontSize: 26 },
  fadedHeart: { opacity: 0.2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#222', width: '90%', borderRadius: 15, marginBottom: 40, overflow: 'hidden' },
  statCard: { flex: 1, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: '#888', fontSize: 10, fontWeight: '900', marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  square: { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  mole: { width: '85%', height: '85%', backgroundColor: '#F1C40F', borderRadius: 15 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  resultText: { color: '#FFF', fontSize: 32, fontWeight: '900', marginBottom: 40, letterSpacing: 2 },
  button: { backgroundColor: '#F1C40F', paddingHorizontal: 50, paddingVertical: 20, borderRadius: 50 },
  buttonText: { color: '#1A1A1A', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  quitText: { color: '#666', fontSize: 16, fontWeight: 'bold'},
});