'use client';

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useGameStateManager } from '../utils/gameStateManager';
import { useLivesManager } from '../utils/livesManager';
import { useModalManager } from '../utils/modalManager';
import { fetchEmotes, getRandomEmote, checkGuess, getEmoteNames, removeEmote, EmoteResponse } from '../utils/emoteService';
import { playSound, startAlarmSound, stopAlarmSound, testAlarm } from '../utils/soundManager';
import { Emote, Achievement } from '../types';
import { EmoteInputHandles } from './EmoteInput';
import { incrementCorrectGuesses, incrementChannelGuess, incrementTotalGames, updateBestScore } from '../utils/achievementManager';
import { ErrorType } from './ErrorPopup';

interface GameControllerProps {
  children: (props: GameControllerOutput) => React.ReactNode;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

interface GameControllerOutput {
  channel: string;
  emoteNames: string[];
  score: number;
  gameActive: boolean;
  recordScore: number;
  livesState: { currentLives: number; maxLives: number };
  modalState: { 
    helpDialogOpen: boolean; 
    gameOverDialogOpen: boolean; 
    winDialogOpen: boolean;
    achievementsDialogOpen: boolean;
  };
  isLoading: boolean;
  invalidChannel: boolean;
  errorType: ErrorType;
  handleChannelSubmit: (channel: string, challengeMode: string, timeLimit?: number) => Promise<void>;
  handleEmoteGuess: (guess: string) => void;
  handleRetry: () => Promise<void>;
  handleReset: () => void;
  handleShare: () => void;
  openHelpDialog: () => void;
  closeHelpDialog: () => void;
  openAchievementsDialog: () => void;
  closeAchievementsDialog: () => void;
  currentEmote: Emote | null;
  showConfetti: boolean;
  showDamageEffect: boolean;
  onAchievementUnlocked: (achievement: Achievement) => void;
  challengeMode: string;
  timeRemaining: number | null;
  timePercentage: number;
  lastEmote: Emote | null;
}

export default function GameController({ children, onAchievementUnlocked }: GameControllerProps) {
  const emoteInputRef = useRef<EmoteInputHandles>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [challengeMode, setChallengeMode] = useState('normal');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState(20);
  const [lastEmote, setLastEmote] = useState<Emote | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLifeBeingReduced, setIsLifeBeingReduced] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [invalidChannel, setInvalidChannel] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>('invalid_channel');

  const {
    gameState,
    incrementScore,
    resetConsecutiveCorrect,
    removeCurrentEmote,
    chooseNextEmote,
    resetGame,
    initializeGame,
    updateRecordIfNeeded,
    setLoading,
  } = useGameStateManager();

  const timePercentage = useMemo(() => {
    if (timeRemaining === null || initialTime === 0) return 0;
    return (timeRemaining / initialTime) * 100;
  }, [timeRemaining, initialTime]);

  const {
    livesState,
    decrementLives,
    incrementLives,
    resetLives,
    setMaxLives,
  } = useLivesManager();

  const {
    modalState,
    openHelpDialog,
    closeHelpDialog,
    openGameOverDialog,
    closeGameOverDialog,
    openWinDialog,
    closeWinDialog,
    openAchievementsDialog,
    closeAchievementsDialog,
  } = useModalManager();

  const handleOpenGameOverDialog = useCallback(() => {
    stopAlarmSound();
    openGameOverDialog();
  }, [openGameOverDialog]);
  
  const handleOpenWinDialog = useCallback(() => {
    stopAlarmSound(); 
    openWinDialog();
  }, [openWinDialog]);

  const handleReset = useCallback(() => {
    resetGame();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimeRemaining(null);
    }
    stopAlarmSound();
    setLastEmote(null);
  }, [resetGame]);

  useEffect(() => {
    if (gameState.gameActive && (challengeMode === 'tempo' || challengeMode === 'tempodesfocado') && timeRemaining !== null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            
            if (!isLifeBeingReduced && !timerExpired) {
              setTimerExpired(true);
              setIsLifeBeingReduced(true);
              setShowDamageEffect(true);
              
              if (livesState.currentLives <= 1) { 
                if (gameState.currentEmote) {
                  setLastEmote(gameState.currentEmote);
                }

                handleOpenGameOverDialog();
                setIsLifeBeingReduced(false);
                setTimerExpired(false);
                return 0;
              }
              
              decrementLives();
              
              setTimeout(() => {
                setShowDamageEffect(false);
                setTimeRemaining(initialTime);
                setIsLifeBeingReduced(false);
                setTimerExpired(false);
                
                if (gameState.emotes.length > 1) {
                  removeCurrentEmote();
                  chooseNextEmote();
                }
              }, 300);
            }
            
            return 0;
          }
          
          if (prev === 10) {
            console.log(`Timer reaching critical level (10s), playing alarm`);
            playSound('alarm');
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    if (gameState.gameActive && 
        (challengeMode === 'tempo' || challengeMode === 'tempodesfocado') && 
        initialTime <= 5 && 
        timeRemaining === initialTime) {
      console.log(`Short timer (${initialTime}s), playing alarm sound immediately`);
      playSound('alarm');
    }
    
    if (!gameState.gameActive && timerRef.current) {
      clearInterval(timerRef.current);
      setTimeRemaining(null);
      setTimerExpired(false);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.gameActive, challengeMode, timeRemaining, initialTime, updateRecordIfNeeded, 
      gameState.score, handleOpenGameOverDialog, decrementLives, livesState.currentLives, 
      removeCurrentEmote, chooseNextEmote, gameState.emotes.length, gameState.currentEmote, isLifeBeingReduced, timerExpired]);

  const handleAchievementUnlocked = useCallback((achievement: Achievement) => {
    if (onAchievementUnlocked) {
      onAchievementUnlocked(achievement);
    }
    setNewAchievements(prev => prev.filter(a => a.id !== achievement.id));
  }, [onAchievementUnlocked]);

  const handleChannelSubmit = useCallback(async (channel: string, challengeMode: string, timeLimit?: number) => {
    setLoading(true);
    setInvalidChannel(false);
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorType('offline');
      setInvalidChannel(true);
      setLoading(false);
      return;
    }
    
    try {
      const response: EmoteResponse = await fetchEmotes(channel);
      
      if (!response.emotes || response.emotes.length === 0) {
        setErrorType('not_found');
        setInvalidChannel(true);
        setLoading(false);
        return;
      }
      
      setChallengeMode(challengeMode);
      setIsLifeBeingReduced(false);
      setTimerExpired(false);
      
      resetLives();
      
      if (challengeMode === 'onelife') {
        setMaxLives(1);
      }
      
      if (challengeMode === 'tempo' || challengeMode === 'tempodesfocado') {
        const customTimeLimit = timeLimit || 60;
        setInitialTime(customTimeLimit);
        setTimeRemaining(customTimeLimit);
      } else {
        setTimeRemaining(null);
        setInitialTime(0);
      }
      
      closeGameOverDialog();
      closeWinDialog();
      initializeGame(channel, response.emotes);
    } catch (error) {
      console.error('Error fetching emotes:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('404')) {
          setErrorType('not_found');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setErrorType('offline');
        } else {
          setErrorType('api_error');
        }
      } else {
        setErrorType('invalid_channel');
      }
      setInvalidChannel(true);
      setLoading(false);
    }

    incrementTotalGames();
  }, [initializeGame, resetLives, closeGameOverDialog, closeWinDialog, setLoading, setMaxLives, setIsLifeBeingReduced]);

  const handleEmoteGuess = useCallback((guess: string) => {
    const { currentEmote, consecutiveCorrect, emotes, score } = gameState;
    
    if (!currentEmote) return;
    
    const isCorrect = checkGuess(guess, currentEmote);
    
    if (isCorrect) {
      if (emoteInputRef.current) {
        emoteInputRef.current.showCorrectGuess();
      }
      
      playSound('correct');
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      incrementScore();
      
      if (score + 1 > gameState.recordScore) {
        updateRecordIfNeeded();
        updateBestScore(score + 1);
      }
      
      const unlockedAchievements = incrementCorrectGuesses();
      const channelUnlockedAchievements = incrementChannelGuess(gameState.channel);
      const allUnlockedAchievements = [...unlockedAchievements, ...channelUnlockedAchievements];
      
      if (allUnlockedAchievements.length > 0) {
        allUnlockedAchievements.forEach(achievement => {
          handleAchievementUnlocked(achievement);
        });
      }
      
      if ((consecutiveCorrect + 1) % 3 === 0 && livesState.currentLives < livesState.maxLives) {
        incrementLives();
      }
      
      if (emotes.length <= 1) {
        removeCurrentEmote();
        handleOpenWinDialog();
        return;
      }
      
      removeCurrentEmote();
      chooseNextEmote();
      
      if ((challengeMode === 'tempo' || challengeMode === 'tempodesfocado') && initialTime > 0) {
        setTimeRemaining(initialTime);
      }
    } else {
      if (emoteInputRef.current) {
        emoteInputRef.current.showIncorrectGuess();
      }
      
      playSound('incorrect');
      
      setShowDamageEffect(false);
      
      setTimeout(() => {
        if (!isLifeBeingReduced && !timerExpired) {
          setIsLifeBeingReduced(true);
          setShowDamageEffect(true);
          
          resetConsecutiveCorrect();
          
          if (livesState.currentLives <= 1) { 
            if (gameState.currentEmote) {
              setLastEmote(gameState.currentEmote);
            }

            handleOpenGameOverDialog();
            setIsLifeBeingReduced(false);
            setTimerExpired(false);
            return;
          }
          
          decrementLives();
          
          setTimeout(() => {
            setShowDamageEffect(false);
            setIsLifeBeingReduced(false);
            
            if ((challengeMode === 'tempo' || challengeMode === 'tempodesfocado') && initialTime > 0) {
              setTimeRemaining(initialTime);
            }
          }, 300);
        }
      }, 10);
    }
  }, [
    gameState, 
    incrementScore, 
    livesState, 
    incrementLives, 
    removeCurrentEmote, 
    updateRecordIfNeeded, 
    handleOpenWinDialog, 
    chooseNextEmote, 
    resetConsecutiveCorrect, 
    decrementLives, 
    handleOpenGameOverDialog,
    handleAchievementUnlocked,
    challengeMode,
    initialTime,
    isLifeBeingReduced,
    timerExpired
  ]);

  useEffect(() => {
    if (!gameState.gameActive) {
      setLastEmote(null);
    }
  }, [gameState.gameActive]);

  return children({
    channel: gameState.channel,
    emoteNames: getEmoteNames(gameState.emotes),
    score: gameState.score,
    gameActive: gameState.gameActive,
    recordScore: gameState.recordScore,
    livesState,
    modalState,
    isLoading: gameState.isLoading,
    invalidChannel,
    errorType,
    handleChannelSubmit,
    handleEmoteGuess,
    handleRetry: async () => {
      stopAlarmSound(); 
      await handleChannelSubmit(gameState.channel, challengeMode, initialTime);
    },
    handleReset,
    handleShare: () => {},
    openHelpDialog,
    closeHelpDialog,
    openAchievementsDialog,
    closeAchievementsDialog,
    currentEmote: gameState.currentEmote,
    showConfetti,
    showDamageEffect,
    onAchievementUnlocked: handleAchievementUnlocked,
    challengeMode,
    timeRemaining,
    timePercentage,
    lastEmote
  });
} 