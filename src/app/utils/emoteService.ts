'use client';

import { Emote } from '../types';
import { normalizeString } from './normalizeString';

const API_ENDPOINT = 'https://emotes.crippled.dev/v1/channel';
const CACHE_EXPIRY = 1000 * 60 * 60; 
const REQUEST_TIMEOUT = 10000;
const PRELOAD_BATCH_SIZE = 5;
const MAX_CONSECUTIVE_GUESSES = 900;
const GUESS_COOLDOWN_MS = 1500;

export const DEBUG_MODE = false;

let emoteCache: Map<string, {
  timestamp: number;
  emotes: Emote[];
  channelId?: string;
}> = new Map();

let imageCache: Map<string, HTMLImageElement> = new Map();
let loadingImages: Set<string> = new Set();
let normalizedNameCache: Map<string, string> = new Map();
let lastGuessTime: number = 0;
let consecutiveGuesses: number = 0;
let failedEmotes: Set<string> = new Set();

export interface EmoteWithSecurity extends Emote {
  securityToken?: string;
}

export interface EmoteResponse {
  emotes: Emote[];
  channelId: string;
  channelName: string;
}

export async function fetchEmotes(channel: string): Promise<EmoteResponse> {
  if (!channel.trim()) {
    return { emotes: [], channelId: '', channelName: '' };
  }

  const cached = emoteCache.get(channel);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return { 
      emotes: cached.emotes, 
      channelId: cached.channelId || '', 
      channelName: channel 
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const twitchResponse = await fetch(`https://decapi.me/twitch/id/${channel}`, {
      signal: controller.signal
    });
    const channelId = await twitchResponse.text();
    
    if (!channelId || channelId.includes('User not found')) {
      clearTimeout(timeoutId);
      return { emotes: [], channelId: '', channelName: channel };
    }
    
    const response = await fetch(`${API_ENDPOINT}/${channel}/all`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'force-cache',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error fetching emotes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }
    
    const processedEmotes = processEmotes(data);
    
    emoteCache.set(channel, {
      timestamp: Date.now(),
      emotes: processedEmotes,
      channelId
    });
    
    return { 
      emotes: processedEmotes, 
      channelId, 
      channelName: channel 
    };
  } catch (error) {
    console.error('Error fetching emotes:', error);
    return { emotes: [], channelId: '', channelName: channel };
  }
}

export function getRandomEmote(emotes: Emote[]): Emote | null {
  if (emotes.length === 0) return null;
  
  if (typeof window !== 'undefined') {
    const storedFailedEmotes = window.localStorage.getItem('failedEmotes') || '';
    const storedFailedSet = new Set(storedFailedEmotes.split(',').filter(Boolean));
    
    storedFailedSet.forEach(url => failedEmotes.add(url));
  }
  
  const validEmotes = emotes.filter(emote => !failedEmotes.has(emote.url));
  
 if (validEmotes.length === 0) {
    if (DEBUG_MODE) {
      console.log('All emotes previously failed, resetting failed list');
    }
    failedEmotes.clear();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('failedEmotes');
    }
    
    const limitedEmotes = emotes.slice(0, Math.min(emotes.length, 20));
    const randomIndex = Math.floor(Math.random() * limitedEmotes.length);
    return limitedEmotes[randomIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * validEmotes.length);
  const selectedEmote = validEmotes[randomIndex];
  if (DEBUG_MODE) {
    console.log('DEBUG - Current Emote Name:', selectedEmote.name);
  }
  return selectedEmote;
}

export function checkGuess(guess: string, currentEmote: EmoteWithSecurity | null, strictMode = true): boolean {
  if (!currentEmote) return false;
  
  if (!verifyEmoteIntegrity(currentEmote)) {
    console.warn('Potential cheating attempt: Emote integrity check failed');
    return false;
  }
  
  const now = Date.now();
  
  if (now - lastGuessTime < GUESS_COOLDOWN_MS) {
    return false;
  }
  
  if (consecutiveGuesses >= MAX_CONSECUTIVE_GUESSES) {
    consecutiveGuesses = 0;
    return false;
  }
  
  lastGuessTime = now;
  
  const normalizedGuess = getNormalizedString(guess);
  const normalizedEmoteName = getNormalizedString(currentEmote.name);

  const isCorrect = strictMode 
    ? normalizedGuess === normalizedEmoteName
    : checkPartialMatch(normalizedGuess, normalizedEmoteName);
  
  if (isCorrect) {
    consecutiveGuesses = 0;
    return true;
  } else {
    consecutiveGuesses++;
    return false;
  }
}

function checkPartialMatch(guess: string, emoteName: string): boolean {
  if (guess.length < emoteName.length * 0.9) {
    return false;
  }
  
  let emoteIndex = 0;
  let matchedChars = 0;
  
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== emoteName[emoteIndex]) {
      continue;
    }
    
    matchedChars++;
    emoteIndex++;
  }
  
  return matchedChars >= emoteName.length * 0.8;
}

function getNormalizedString(str: string): string {
  if (normalizedNameCache.has(str)) {
    return normalizedNameCache.get(str)!;
  }
  
  const normalized = normalizeString(str);
  normalizedNameCache.set(str, normalized);
  return normalized;
}

export function removeEmote(emotes: Emote[], emoteToRemove: Emote): Emote[] {
  return emotes.filter(emote => emote.name !== emoteToRemove.name);
}

export function shareOnTwitter(score: number, channel: string, isWin: boolean): void {
  const text = isWin 
    ? `Eu adivinhei TODOS os ${score} emotes do canal ${channel} no Emoto! 🎮 #EmotoGame`
    : `Eu adivinhei ${score} emotes do canal ${channel} no Emoto! 🎮 #EmotoGame`;
    
  const url = 'https://emoto.juliaklee.wtf/';
  
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank'
  );
}

export function getEmoteNames(emotes: Emote[]): string[] {

  return [...new Set(emotes.map(emote => emote.name))];
}

export function processEmotes(rawEmotes: any[]): Emote[] {
  let localFailedEmotes = new Set<string>();
  if (typeof window !== 'undefined') {
    const storedFailedEmotes = window.localStorage.getItem('failedEmotes') || '';
    localFailedEmotes = new Set(storedFailedEmotes.split(',').filter(Boolean));
  }

  return rawEmotes
    .filter(emote => {
      return emote && 
             typeof emote.code === 'string' && 
             Array.isArray(emote.urls) && 
             emote.urls.length > 0;
    })
    .map(emote => {
      const urlIndex = Math.min(2, emote.urls.length - 1);
      let imageUrl = '';
      
      if (typeof emote.urls[urlIndex]?.url === 'string') {
        imageUrl = emote.urls[urlIndex].url;
      } else if (typeof emote.urls[0]?.url === 'string') {
        imageUrl = emote.urls[0].url;
      }
      
      const securityToken = generateSecurityToken(emote.code);
      
      return {
        name: emote.code,
        url: imageUrl,
        securityToken
      };
    })
    .filter(emote => emote.url !== '' && !localFailedEmotes.has(emote.url));
}

function generateSecurityToken(emoteName: string): string {
  const timestamp = Date.now();
  return btoa(`${emoteName}-${timestamp}-${Math.random().toString(36).substring(2, 10)}`);
}

export function verifyEmoteIntegrity(emote: EmoteWithSecurity | null): boolean {
  if (!emote || !emote.securityToken) {
    return false;
  }
  
  try {
    const decoded = atob(emote.securityToken);
    return decoded.startsWith(`${emote.name}-`);
  } catch (e) {
    return false;
  }
}

function preloadImage(url: string): void {
  if (imageCache.has(url) || loadingImages.has(url)) return;
  if (failedEmotes.has(url)) return;
  
  loadingImages.add(url);
  
  const img = new Image();
  const timeoutId = setTimeout(() => {
    if (loadingImages.has(url)) {
      loadingImages.delete(url);
      img.src = ''; 
      failedEmotes.add(url);
      console.log(`Skipped emote loading after timeout: ${url}`);
    }
  }, REQUEST_TIMEOUT);
  
  img.onload = () => {
    clearTimeout(timeoutId);
    imageCache.set(url, img);
    loadingImages.delete(url);
  };
  
  img.onerror = () => {
    clearTimeout(timeoutId);
    loadingImages.delete(url);
    failedEmotes.add(url);
    console.log(`Skipped emote loading due to error: ${url}`);
  };
  
  img.src = url;
}

export function clearCache(): void {
  emoteCache.clear();
  imageCache.clear();
  loadingImages.clear();
  normalizedNameCache.clear();
  failedEmotes.clear();
  lastGuessTime = 0;
  consecutiveGuesses = 0;
  
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('failedEmotes');
  }
} 