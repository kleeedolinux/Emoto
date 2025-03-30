'use client';

import { useState, useEffect } from 'react';
import { ErrorPopup, ErrorType } from './ErrorPopup';
import { useNetworkStatus } from '../utils/networkManager';

interface ChannelInputProps {
  onChannelSubmit: (channel: string, challengeMode: string, timeLimit?: number) => void;
  isLoading: boolean;
  invalidChannel: boolean;
  errorType?: ErrorType;
}

export default function ChannelInput({ 
  onChannelSubmit, 
  isLoading, 
  invalidChannel,
  errorType: propErrorType = 'invalid_channel'
}: ChannelInputProps) {
  const [channel, setChannel] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [animateShake, setAnimateShake] = useState(false);
  const [challengeMode, setChallengeMode] = useState('normal');
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [timeLimit, setTimeLimit] = useState(20);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>('invalid_channel');
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    if (invalidChannel) {
      setAnimateShake(true);
      setErrorType(propErrorType);
      setShowErrorPopup(true);
      const timer = setTimeout(() => {
        setAnimateShake(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [invalidChannel, propErrorType]);

  useEffect(() => {
    if (networkStatus === 'offline') {
      setErrorType('offline');
      setShowErrorPopup(true);
    }
  }, [networkStatus]);

  const validateChannel = (value: string) => {
    const invalidCharsRegex = /[^a-zA-Z0-9_]/;
    if (value.trim() && invalidCharsRegex.test(value)) {
      setErrorType('invalid_chars');
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (networkStatus === 'offline') {
      setErrorType('offline');
      setShowErrorPopup(true);
      return;
    }
    
    if (channel.trim() && !isLoading) {
      if (!validateChannel(channel)) {
        return;
      }

      onChannelSubmit(
        channel.trim(), 
        challengeMode, 
        (challengeMode === 'tempo' || challengeMode === 'tempodesfocado') ? timeLimit : undefined
      );
      setShowChallengeSelector(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannel(e.target.value);
    if (e.target.value.trim()) {
      validateChannel(e.target.value);
    }
  };

  const toggleChallengeSelector = () => {
    setShowChallengeSelector(prev => !prev);
  };

  const handleCloseError = () => {
    setShowErrorPopup(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input 
            type="text" 
            className={`channelInput ${isLoading ? 'loading-state' : ''} ${animateShake ? 'shake' : ''}`}
            placeholder={isLoading ? "Carregando..." : "Insira um canal da Twitch"}
            value={channel}
            onChange={handleChannelChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            disabled={isLoading}
            style={{
              animation: isFocused 
                ? 'pulse-input 2s infinite' 
                : isLoading 
                  ? 'pulse 2s infinite' 
                  : 'float 6s ease-in-out infinite',
              transition: 'all 0.3s ease-in-out'
            }}
          />
          
          <button 
            type="submit" 
            className="play-button"
            disabled={isLoading || !channel.trim()}
            style={{
              animation: isFocused 
                ? 'pulse-input 2s infinite' 
                : isLoading 
                  ? 'pulse 2s infinite' 
                  : 'float 6s ease-in-out infinite'
            }}
          >
            <span>▶</span>
          </button>
        </div>
        
        <div className="challenge-toggle" onClick={toggleChallengeSelector}>
          <span>{showChallengeSelector ? "Esconder" : "Escolha um"} desafio</span>
          <span className="challenge-toggle-icon">{showChallengeSelector ? "▲" : "▼"}</span>
        </div>
        
        {showChallengeSelector && (
          <div className="challengeSelector">
            <div className="challengeOptions">
              <div className="challengeOption">
                <input 
                  type="radio" 
                  id="normal" 
                  name="challenge" 
                  value="normal" 
                  checked={challengeMode === 'normal'} 
                  onChange={(e) => setChallengeMode(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="normal">Normal</label>
              </div>
              
              <div className="challengeOption">
                <input 
                  type="radio" 
                  id="tempo" 
                  name="challenge" 
                  value="tempo" 
                  checked={challengeMode === 'tempo'} 
                  onChange={(e) => setChallengeMode(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="tempo">Contra o Tempo</label>
                
                {challengeMode === 'tempo' && (
                  <div className="time-selector">
                    <input 
                      type="range" 
                      min="10" 
                      max="320" 
                      step="5"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="time-range"
                      disabled={isLoading}
                    />
                    <div className="time-display">{timeLimit}s</div>
                  </div>
                )}
              </div>
              
              <div className="challengeOption">
                <input 
                  type="radio" 
                  id="desfocado" 
                  name="challenge" 
                  value="desfocado" 
                  checked={challengeMode === 'desfocado'} 
                  onChange={(e) => setChallengeMode(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="desfocado">Desfocado</label>
              </div>
              
              <div className="challengeOption">
                <input 
                  type="radio" 
                  id="tempodesfocado" 
                  name="challenge" 
                  value="tempodesfocado" 
                  checked={challengeMode === 'tempodesfocado'} 
                  onChange={(e) => setChallengeMode(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="tempodesfocado">Contra o Tempo + Desfocado</label>
                
                {challengeMode === 'tempodesfocado' && (
                  <div className="time-selector">
                    <input 
                      type="range" 
                      min="10" 
                      max="320" 
                      step="5"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="time-range"
                      disabled={isLoading}
                    />
                    <div className="time-display">{timeLimit}s</div>
                  </div>
                )}
              </div>
              
              <div className="challengeOption">
                <input 
                  type="radio" 
                  id="onelife" 
                  name="challenge" 
                  value="onelife" 
                  checked={challengeMode === 'onelife'} 
                  onChange={(e) => setChallengeMode(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="onelife">Uma Vida</label>
              </div>
            </div>
          </div>
        )}
      </form>
      <p className="subtitle2">sério, qualquer um.</p>
      
      {/* Error popup */}
      <ErrorPopup 
        isVisible={showErrorPopup}
        errorType={errorType}
        onClose={handleCloseError}
      />
      
      {isLoading && (
        <div className="loading">
          <p className="loadingText">Carregando emotes...</p>
          <img 
            src="/img/loading2.webp" 
            alt="Loading" 
            className="loadingImage"
          />
          <div className="loadingBar">
            <div className="loadingBarProgress"></div>
          </div>
        </div>
      )}
    </>
  );
} 