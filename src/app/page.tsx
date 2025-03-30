'use client';

import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import ChannelInput from './components/ChannelInput';
import EmoteInput, { EmoteInputHandles } from './components/EmoteInput';
import EmoteCard from './components/EmoteCard';
import ScoreBoard from './components/ScoreBoard';
import HelpDialog from './components/HelpDialog';
import GameOverDialog from './components/GameOverDialog';
import WinDialog from './components/WinDialog';
import Footer from './components/Footer';
import GameController from './components/GameController';
import { shareOnTwitter } from './utils/emoteService';
import { initSounds } from './utils/soundManager';
import Confetti from './components/Confetti';
import DamageEffect from './components/DamageEffect';
import { isFirstTimeUser, markUserAsReturning } from './utils/storageManager';
import AchievementsDialog from './components/AchievementsDialog';
import { AchievementNotificationContainer } from './components/AchievementNotification';
import { Achievement } from './types';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import OfflineAlert from './components/OfflineAlert';
import { useNetworkStatus } from './utils/networkManager';

export default function Home() {
  const emoteInputRef = useRef<EmoteInputHandles>(null);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const networkStatus = useNetworkStatus();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    initSounds();
  }, []);

  useEffect(() => {
    if (networkStatus === 'offline') {
      setShowOfflineAlert(true);
    }
  }, [networkStatus]);

  const handleOfflineAlertClose = () => {
    setShowOfflineAlert(false);
  };

  return (
    <AchievementNotificationContainer>
      {({ addAchievement }) => {
        const handleAchievementWithNotification = (achievement: Achievement) => {
          console.log('Achievement unlocked:', achievement.title);
          addAchievement(achievement);
        };

        return (
          <GameController onAchievementUnlocked={handleAchievementWithNotification}>
            {({ 
              channel, 
              emoteNames, 
              score, 
              gameActive, 
              recordScore,
              livesState, 
              modalState,
              isLoading,
              invalidChannel,
              errorType,
              handleChannelSubmit, 
              handleEmoteGuess, 
              handleRetry, 
              handleReset, 
              handleShare,
              openHelpDialog,
              closeHelpDialog,
              openAchievementsDialog,
              closeAchievementsDialog,
              currentEmote,
              showConfetti,
              showDamageEffect,
              challengeMode,
              timeRemaining,
              timePercentage,
              lastEmote
            }) => {
              useEffect(() => {
                if (!hasCheckedFirstTime) {
                  try {
                    const firstTimeUser = isFirstTimeUser();
                    setIsFirstVisit(firstTimeUser);
                    
                    if (firstTimeUser) {
                      setTimeout(() => {
                        openHelpDialog();
                        markUserAsReturning();
                      }, 500);
                    }
                  } catch (error) {
                    console.error('Error checking first time user:', error);
                    markUserAsReturning();
                  }
                  setHasCheckedFirstTime(true);
                }
              }, [openHelpDialog, hasCheckedFirstTime]);
              
              const handleHelpDialogClose = () => {
                if (isFirstVisit) {
                  markUserAsReturning();
                  setIsFirstVisit(false);
                }
                closeHelpDialog();
                document.body.style.pointerEvents = 'auto'; 
              };
              
              const applyFilterStyles = () => {
                if (challengeMode === 'desfocado' || challengeMode === 'tempodesfocado') {
                  return { filter: 'blur(16px)' };
                }
                return {};
              };
              
              return (
                <main className="main-container">
                  <div id="background-img"></div>
                  
                  <Header 
                    onHelpClick={openHelpDialog} 
                    onHomeClick={gameActive ? handleReset : undefined}
                    gameActive={gameActive} 
                    onAchievementsClick={openAchievementsDialog}
                  />
                  
                  <div className="content-wrapper">
                    {!gameActive ? (
                      <div className="home-container">
                        <ChannelInput 
                          onChannelSubmit={handleChannelSubmit}
                          isLoading={isLoading}
                          invalidChannel={invalidChannel}
                          errorType={errorType}
                        />
                        
                        {recordScore > 0 && (
                          <div className="record-score-container">
                            <div className="record-score-badge">
                              <span className="record-icon">🏆</span>
                              <span className="record-text">Recorde: <span className="record-value">{recordScore}</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="game-container">
                        {(challengeMode === 'tempo' || challengeMode === 'tempodesfocado') && timeRemaining !== null && (
                          <>
                            <div className={`timer-wrapper ${timeRemaining < 10 ? 'critical' : timeRemaining < 20 ? 'warning' : ''}`}>
                              <CountdownCircleTimer
                                isPlaying
                                key={`timer-${timeRemaining}-${timePercentage}`}
                                duration={timePercentage === 0 ? 60 : 
                                         timePercentage === 100 ? timeRemaining : 
                                         Math.round((timeRemaining * 100) / timePercentage)}
                                initialRemainingTime={timeRemaining}
                                colors={['#3da35a', '#F7B801', '#A30000']}
                                colorsTime={[30, 15, 0]}
                                size={windowWidth < 480 ? 80 : timeRemaining < 10 ? 100 : 90}
                                strokeWidth={windowWidth < 480 ? 7 : timeRemaining < 10 ? 10 : 8}
                                trailColor="rgba(32, 37, 43, 0.4)"
                                onComplete={() => ({ shouldRepeat: false })}
                              >
                                {() => (
                                  <div className={`countdown-value ${timeRemaining < 10 ? 'critical-text' : ''}`}>
                                    <span>{timeRemaining}s</span>
                                  </div>
                                )}
                              </CountdownCircleTimer>
                            </div>
                            {timeRemaining < 10 && <div className="time-critical-overlay"></div>}
                          </>
                        )}
                        
                        {gameActive && currentEmote && (
                          <div className="app">
                            <EmoteCard 
                              emote={currentEmote}
                              style={applyFilterStyles()}
                            />
                          </div>
                        )}
                        
                        <EmoteInput 
                          ref={emoteInputRef}
                          onEmoteGuess={handleEmoteGuess}
                          emotesList={emoteNames}
                          isVisible={gameActive && !modalState.gameOverDialogOpen && !modalState.winDialogOpen}
                        />
                        
                        <ScoreBoard 
                          score={score}
                          livesState={livesState}
                          gameActive={gameActive}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Effects */}
                  <Confetti active={showConfetti} />
                  <DamageEffect active={showDamageEffect} />
                  
                  {/* Dialogs */}
                  <HelpDialog 
                    isOpen={modalState.helpDialogOpen} 
                    onClose={handleHelpDialogClose} 
                  />
                  
                  <GameOverDialog
                    isOpen={modalState.gameOverDialogOpen}
                    score={score}
                    onTryAgain={handleRetry}
                    onHome={handleReset}
                    onShare={() => shareOnTwitter(score, channel, false)}
                    lastEmote={lastEmote}
                  />
                  
                  <WinDialog
                    isOpen={modalState.winDialogOpen}
                    score={score}
                    onHome={handleReset}
                    onShare={() => shareOnTwitter(score, channel, true)}
                  />
                  
                  <AchievementsDialog
                    isOpen={modalState.achievementsDialogOpen}
                    onClose={closeAchievementsDialog}
                  />
                  
                  {showOfflineAlert && <OfflineAlert onClose={handleOfflineAlertClose} />}
                  
                  <Footer />
                </main>
              );
            }}
          </GameController>
        );
      }}
    </AchievementNotificationContainer>
  );
}
