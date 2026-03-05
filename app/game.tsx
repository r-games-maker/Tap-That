import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter, Stack } from 'expo-router';

const GRID_SIZE = 4;
const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

export default function GameScreen() {
  const router = useRouter();

  // --- Game State ---
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameState, setGameState] = useState<'COUNTDOWN' | 'PLAYING' | 'GAME_OVER'>('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);

  // 1. Load High Score on Mount
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const saved = await AsyncStorage.getItem('highScore');
        if (saved) setHighScore(parseInt(saved));
      } catch (e) {
        console.error("Failed to load high score", e);
      }
    };
    loadHighScore();
  }, []);

  // 2. Countdown Logic (3, 2, 1, GO!)
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('PLAYING');
      }
    }
  }, [gameState, countdown]);

  // 3. Main Game Loop (Mole movement and Clock)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (timeLeft <= 0) {
      handleEndGame();
      return;
    }

    // SPEED LOGIC: Mole jumps faster as score increases
    const speed = Math.max(350, 900 - (score * 40)); 

    const moleTimer = setInterval(() => {
      const randomSquare = Math.floor(Math.random() * TOTAL_SQUARES);
      setActiveSquare(randomSquare);
    }, speed);

    const clockTimer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(moleTimer);
      clearInterval(clockTimer);
    };
  }, [gameState, timeLeft, score]);

  // --- Game Actions ---
  const handleEndGame = async () => {
    setGameState('GAME_OVER');
    setActiveSquare(null);
    
    // Heavy vibration for game over
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('highScore', score.toString());
    }
  };

  const handlePress = (index: number) => {
    if (gameState === 'PLAYING' && index === activeSquare) {
      // Tactile "thud" for a successful hit
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScore(score + 1);
      setActiveSquare(null);
    }
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(20);
    setCountdown(3);
    setGameState('COUNTDOWN');
  };

  return (
    <View style={styles.container}>
      {/* Hide the navigation header for a full-screen feel */}
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.header}>WHACK-A-MOLE</Text>
      
      {/* HUD: Score and Time */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BEST</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>

      {/* The 4x4 Grid */}
      <View style={styles.grid}>
        {Array.from({ length: TOTAL_SQUARES }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={styles.square}
            onPress={() => handlePress(i)}
            activeOpacity={0.7}
          >
            {activeSquare === i && <View style={styles.mole} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Overlays --- */}

      {/* 1. Countdown Overlay */}
      {gameState === 'COUNTDOWN' && (
        <View style={styles.overlay}>
          <Text style={styles.countdownText}>{countdown === 0 ? 'GO!' : countdown}</Text>
        </View>
      )}

      {/* 2. Game Over Overlay */}
      {gameState === 'GAME_OVER' && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverTitle}>TIME'S UP!</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>YOUR SCORE</Text>
            <Text style={styles.resultValue}>{score}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.resultLabel}>BEST RECORD</Text>
            <Text style={[styles.resultValue, { color: '#F1C40F' }]}>{highScore}</Text>
          </View>

          {score >= highScore && score > 0 && (
            <Text style={styles.newRecordText}>🏆 NEW HIGH SCORE! 🏆</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.replace('/')}
          >
            <Text style={styles.homeButtonText}>RETURN TO HOME</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  header: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#FFF', 
    marginBottom: 20, 
    letterSpacing: 2 
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20 
  },
  statBox: { 
    backgroundColor: '#333', 
    padding: 8, 
    borderRadius: 10, 
    alignItems: 'center', 
    minWidth: 75 
  },
  statLabel: { 
    color: '#888', 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  statValue: { 
    color: '#F1C40F', 
    fontSize: 18, 
    fontWeight: '900' 
  },
  grid: { 
    width: 340, 
    height: 340, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: 5, 
    backgroundColor: '#222', 
    borderRadius: 15 
  },
  square: { 
    width: '25%', 
    height: '25%', 
    padding: 5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mole: { 
    width: '90%', 
    height: '90%', 
    backgroundColor: '#F1C40F', 
    borderRadius: 8, 
    elevation: 8,
    shadowColor: '#F1C40F',
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.95)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    zIndex: 10
  },
  countdownText: { 
    fontSize: 120, 
    color: '#F1C40F', 
    fontWeight: '900' 
  },
  gameOverTitle: { 
    fontSize: 42, 
    color: '#E74C3C', 
    fontWeight: '900', 
    marginBottom: 30 
  },
  resultCard: { 
    backgroundColor: '#222', 
    width: '80%', 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#444', 
    marginBottom: 20 
  },
  resultLabel: { 
    color: '#888', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  resultValue: { 
    color: '#FFF', 
    fontSize: 48, 
    fontWeight: '900', 
    marginVertical: 10 
  },
  divider: { 
    height: 1, 
    width: '100%', 
    backgroundColor: '#444', 
    marginVertical: 20 
  },
  newRecordText: {
    color: '#F1C40F',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textTransform: 'uppercase'
  },
  button: { 
    backgroundColor: '#2ECC71', 
    paddingHorizontal: 50, 
    paddingVertical: 18, 
    borderRadius: 40 
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  homeButton: { 
    marginTop: 20, 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#444' 
  },
  homeButtonText: { 
    color: '#888', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});