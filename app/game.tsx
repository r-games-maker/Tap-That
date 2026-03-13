import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

export const LEVELS = Array.from({ length: 30 }, (_, i) => {
  const levelNum = i + 1;
  let grid = 3;
  if (levelNum > 10) grid = 4;
  if (levelNum > 20) grid = 5;
  return {
    level: levelNum, gridSize: grid,
    target: 5 + (levelNum * 2),
    time: Math.max(10, 22 - Math.floor(levelNum / 2)),
    speed: Math.max(250, 1000 - (levelNum * 25))
  };
});

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const startLevelIndex = parseInt(params.level as string) || 0;

  // --- State ---
  const [currentLevel, setCurrentLevel] = useState(startLevelIndex);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(LEVELS[startLevelIndex].time);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [gameState, setGameState] = useState<'COUNTDOWN' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'GAME_WON'>('COUNTDOWN');

  const config = LEVELS[currentLevel];
  const totalSquares = config.gridSize * config.gridSize;

  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(t);
      } else { setGameState('PLAYING'); }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (timeLeft <= 0) { handleEndGame(); return; }

    const moleTimer = setInterval(() => {
      setActiveSquare(Math.floor(Math.random() * totalSquares));
    }, config.speed);

    const clockTimer = setInterval(() => setTimeLeft(t => t - 1), 1000);

    return () => { clearInterval(moleTimer); clearInterval(clockTimer); };
  }, [gameState, timeLeft]);

  const handleEndGame = async () => {
    setActiveSquare(null);
    if (score >= config.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Update Progress
      const savedProgress = await AsyncStorage.getItem('unlockedLevel');
      const currentUnlocked = savedProgress ? parseInt(savedProgress) : 1;
      if (currentLevel + 2 > currentUnlocked) {
        await AsyncStorage.setItem('unlockedLevel', (currentLevel + 2).toString());
      }
      setGameState(currentLevel < 29 ? 'LEVEL_COMPLETE' : 'GAME_WON');
    } else {
      setLives(l => l - 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setGameState('GAME_OVER');
    }
  };

  const nextLevel = () => {
    const idx = currentLevel + 1;
    setCurrentLevel(idx);
    setScore(0); setTimeLeft(LEVELS[idx].time); setCountdown(3); setGameState('COUNTDOWN');
  };

  const retry = () => {
    setScore(0); setTimeLeft(config.time); setCountdown(3); setGameState('COUNTDOWN');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true }} />
      <View style={styles.header}>
        <Text style={styles.levelTitle}>LEVEL {config.level}</Text>
        <View style={styles.livesRow}>
          {[1,2,3].map(i => <Text key={i} style={[styles.heart, i > lives && {opacity: 0.2}]}>❤️</Text>)}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statBox}><Text style={styles.label}>SCORE</Text><Text style={styles.val}>{score}</Text></View>
        <View style={styles.statBox}><Text style={styles.label}>TIME</Text><Text style={styles.val}>{timeLeft}s</Text></View>
        <View style={styles.statBox}><Text style={styles.label}>TARGET</Text><Text style={[styles.val, {color: '#2ECC71'}]}>{config.target}</Text></View>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: totalSquares }).map((_, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.square, { width: `${100 / config.gridSize}%`, height: `${100 / config.gridSize}%` }]} 
            onPress={() => gameState === 'PLAYING' && i === activeSquare && (setScore(s => s + 1), setActiveSquare(null), Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))}
          >
            {activeSquare === i && <View style={styles.mole} />}
          </TouchableOpacity>
        ))}
      </View>

      {gameState !== 'PLAYING' && (
        <View style={styles.overlay}>
          {gameState === 'COUNTDOWN' ? (
            <Text style={styles.cdText}>{countdown === 0 ? "GO!" : countdown}</Text>
          ) : (
            <>
              <Text style={styles.statusText}>{gameState === 'LEVEL_COMPLETE' ? 'LEVEL CLEAR!' : gameState === 'GAME_WON' ? 'YOU WIN!' : 'FAILED!'}</Text>
              <TouchableOpacity style={styles.btn} onPress={gameState === 'LEVEL_COMPLETE' ? nextLevel : retry}>
                <Text style={styles.btnText}>{gameState === 'LEVEL_COMPLETE' ? 'NEXT LEVEL' : 'RETRY'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace('/')}><Text style={styles.homeBtn}>BACK TO LEVELS</Text></TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  levelTitle: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  livesRow: { flexDirection: 'row', gap: 5, marginTop: 5 },
  heart: { fontSize: 20 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { backgroundColor: '#333', padding: 10, borderRadius: 12, alignItems: 'center', minWidth: 80 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  val: { color: '#F1C40F', fontSize: 20, fontWeight: '900' },
  grid: { width: 350, height: 350, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#222', borderRadius: 20, padding: 5 },
  square: { padding: 5, justifyContent: 'center', alignItems: 'center' },
  mole: { width: '90%', height: '90%', backgroundColor: '#F1C40F', borderRadius: 10 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  cdText: { fontSize: 100, color: '#F1C40F', fontWeight: '900' },
  statusText: { fontSize: 40, color: '#FFF', fontWeight: '900', marginBottom: 20 },
  btn: { backgroundColor: '#2ECC71', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  btnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  homeBtn: { color: '#888', marginTop: 20, fontWeight: 'bold' }
});