'use client';

import { Achievement, AchievementData } from '../types';

const STORAGE_KEY = 'emoto_achievement_data';
const EMOTES_STORAGE_KEY = 'emoto_guessed_emotes';

const O_INCIDENTE_CHANNELS = ['cereaw', 'grifoexe', 'eo_chara', 'tinymigs', 'akkaiverso'];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
    id: 'tutorial',
    title: 'Metacritic',
    description: 'Passe pelo tutorial',
    requirement: 1,
    icon: '☕',
    unlocked: false
  },
  {
    id: 'beginner',
    title: 'Iniciante',
    description: 'Adivinhe 5 emotes corretamente',
    requirement: 5,
    icon: '🎭',
    unlocked: false
  },
  {
    id: 'intermediate',
    title: 'Emoteiro',
    description: 'Adivinhe 25 emotes corretamente. Você já está pegando o jeito!',
    requirement: 25,
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'advanced',
    title: 'Entusiasta',
    description: 'Adivinhe 50 emotes. Os emotes não têm segredos para você!',
    requirement: 50,
    icon: '🌟',
    unlocked: false
  },
  {
    id: 'expert',
    title: 'Especialista',
    description: 'Adivinhe 100 emotes. Sua habilidade é impressionante!',
    requirement: 100,
    icon: '👑',
    unlocked: false
  },
  {
    id: 'master',
    title: 'Mestre dos Emotes',
    description: 'Adivinhe 250 emotes. Você é uma lenda do mundo dos emotes!',
    requirement: 250,
    icon: '💎',
    unlocked: false
  },
  {
    id: 'legend',
    title: 'Lenda Viva',
    description: 'Adivinhe 500 emotes. Você transcendeu o mundo dos emotes!',
    requirement: 500,
    icon: '🌌',
    unlocked: false
  },
  {
    id: 'immortal',
    title: 'Imortal dos Emotes',
    description: 'Adivinhe 1000 emotes. Você é uma divindade dos emotes!',
    requirement: 1000,
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'o_incidente',
    title: 'O Incidente',
    description: 'Adivinhe 15 emotes dos canais do grupo O Incidente (cereaw, grifoexe, eo_chara, tinymigs, akkaiverso)',
    requirement: 15,
    icon: '💀',
    unlocked: false,
    channels: O_INCIDENTE_CHANNELS
  },
  {
    id: 'to_chapando',
    title: 'Ou eu tô chapando e você quer meu fim?	',
    description: 'Adivinhe 100 emotes dos canais do grupo O Incidente (cereaw, grifoexe, eo_chara, tinymigs, akkaiverso)',
    requirement: 100,
    icon: '💀',
    unlocked: false,
    channels: O_INCIDENTE_CHANNELS
  }
];

const DEFAULT_ACHIEVEMENT_DATA: AchievementData = {
  achievements: DEFAULT_ACHIEVEMENTS,
  stats: {
    totalCorrectGuesses: 0,
    uniqueCorrectGuesses: 0,
    bestScore: 0,
    totalGames: 0,
    channelGuesses: {},
    guessedEmotes: {}
  }
};

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === testKey;
  } catch (e) {
    return false;
  }
}

export function getAchievementData(): AchievementData {
  if (typeof window === 'undefined') {
    return DEFAULT_ACHIEVEMENT_DATA;
  }

  try {
    if (!isLocalStorageAvailable()) {
      return DEFAULT_ACHIEVEMENT_DATA;
    }
    
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACHIEVEMENT_DATA));
      return DEFAULT_ACHIEVEMENT_DATA;
    }
    
    const parsedData = JSON.parse(storedData) as AchievementData;
    
    const defaultAchievementIds = DEFAULT_ACHIEVEMENTS.map(a => a.id);
    
    const existingAchievementIds = parsedData.achievements.map(a => a.id);
    const achievementsToAdd = DEFAULT_ACHIEVEMENTS
      .filter(a => !existingAchievementIds.includes(a.id))
      .map(a => ({ ...a, unlocked: false }));
    
    const filteredAchievements = parsedData.achievements
      .filter(a => defaultAchievementIds.includes(a.id));
    
    const needsUpdate = achievementsToAdd.length > 0 || 
                        filteredAchievements.length !== parsedData.achievements.length;
    
    if (needsUpdate) {
      const updatedAchievements = [...filteredAchievements, ...achievementsToAdd];
      
      const updatedData = {
        ...parsedData,
        achievements: updatedAchievements,
        stats: {
          ...DEFAULT_ACHIEVEMENT_DATA.stats,
          ...parsedData.stats
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return updatedData;
    }
    
    return {
      ...parsedData,
      stats: {
        ...DEFAULT_ACHIEVEMENT_DATA.stats,
        ...parsedData.stats
      }
    };
  } catch (error) {
    console.error('Error retrieving achievement data from localStorage:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACHIEVEMENT_DATA));
    return DEFAULT_ACHIEVEMENT_DATA;
  }
}

export function saveAchievementData(data: Partial<AchievementData>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!isLocalStorageAvailable()) {
      return;
    }
    
    const currentData = getAchievementData();
    
    const finalData: AchievementData = JSON.parse(JSON.stringify(currentData));
    
    if (data.achievements) {
      finalData.achievements = data.achievements;
    }
    
    if (data.stats) {
      if (data.stats.totalCorrectGuesses !== undefined) 
        finalData.stats.totalCorrectGuesses = data.stats.totalCorrectGuesses;
      
      if (data.stats.bestScore !== undefined) 
        finalData.stats.bestScore = data.stats.bestScore;
      
      if (data.stats.totalGames !== undefined) 
        finalData.stats.totalGames = data.stats.totalGames;
      
      if (data.stats.channelGuesses) {
        finalData.stats.channelGuesses = {
          ...finalData.stats.channelGuesses,
          ...data.stats.channelGuesses
        };
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
  } catch (error) {
    console.error('Error saving achievement data:', error);
  }
}

export function incrementCorrectGuesses(channel?: string, emoteName?: string): Achievement[] {
  const data = getAchievementData();
  let newlyUnlocked: Achievement[] = [];
  
  const totalCorrectGuesses = data.stats.totalCorrectGuesses + 1;
  
  let uniqueCorrectGuesses = data.stats.uniqueCorrectGuesses || 0;
  let countedAsUnique = false;
  
  if (channel && emoteName && !hasGuessedEmote(channel, emoteName)) {
    uniqueCorrectGuesses++;
    countedAsUnique = true;
    
    const updatedAchievements = data.achievements.map(achievement => {
      if (!achievement.unlocked && 
          !achievement.channels && 
          uniqueCorrectGuesses >= achievement.requirement) {
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });
    
    newlyUnlocked = updatedAchievements.filter((achievement, index) => 
      achievement.unlocked && !data.achievements[index].unlocked
    );
    
    saveAchievementData({
      achievements: updatedAchievements,
      stats: {
        ...data.stats,
        totalCorrectGuesses,
        uniqueCorrectGuesses
      }
    });
    
    saveGuessedEmote(channel, emoteName);
  } else {
    saveAchievementData({
      stats: {
        ...data.stats,
        totalCorrectGuesses
      }
    });
  }
  
  return newlyUnlocked;
}

export function hasGuessedEmote(channel: string, emoteName: string): boolean {
  if (typeof window === 'undefined' || !isLocalStorageAvailable() || !channel || !emoteName) {
    return false;
  }

  try {
    const storedData = localStorage.getItem(EMOTES_STORAGE_KEY);
    if (!storedData) return false;

    const guessedEmotes = JSON.parse(storedData);
    const lowerChannel = channel.toLowerCase();
    return guessedEmotes[lowerChannel]?.includes(emoteName) || false;
  } catch (error) {
    console.error('Error checking guessed emote:', error);
    return false;
  }
}

export function saveGuessedEmote(channel: string, emoteName: string): void {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return;
  }

  try {
    const lowerChannel = channel.toLowerCase();
    let guessedEmotes: Record<string, string[]> = {};
    
    const storedData = localStorage.getItem(EMOTES_STORAGE_KEY);
    if (storedData) {
      guessedEmotes = JSON.parse(storedData);
    }
    
    if (!guessedEmotes[lowerChannel]) {
      guessedEmotes[lowerChannel] = [];
    }
    
    if (!guessedEmotes[lowerChannel].includes(emoteName)) {
      guessedEmotes[lowerChannel].push(emoteName);
      localStorage.setItem(EMOTES_STORAGE_KEY, JSON.stringify(guessedEmotes));
      console.log(`Saved emote ${emoteName} for channel ${lowerChannel}`, guessedEmotes);
    }
  } catch (error) {
    console.error('Error saving guessed emote:', error);
  }
}

export function incrementChannelGuess(channel: string, emoteName: string): Achievement[] {
  if (!channel || !emoteName || typeof window === 'undefined') {
    return [];
  }

  const lowerCaseChannel = channel.toLowerCase();
  
  if (hasGuessedEmote(lowerCaseChannel, emoteName)) {
    return [];
  }

  try {
    saveGuessedEmote(lowerCaseChannel, emoteName);
    
    const data = getAchievementData();
    
    if (!data.stats.channelGuesses) {
      data.stats.channelGuesses = {};
    }
    
    let channelIsRelevant = false;
    for (const achievement of data.achievements) {
      if (achievement.channels && achievement.channels.includes(lowerCaseChannel)) {
        channelIsRelevant = true;
        break;
      }
    }
    
    if (!channelIsRelevant) {
      return [];
    }
    
    const updatedCount = (data.stats.channelGuesses[lowerCaseChannel] || 0) + 1;
    
    const updatedChannelGuesses = {
      ...data.stats.channelGuesses,
      [lowerCaseChannel]: updatedCount
    };
    
    const updatedAchievements = data.achievements.map(achievement => {
      if (!achievement.unlocked && achievement.channels) {
        if (achievement.channels.includes(lowerCaseChannel)) {
          const totalRelevantGuesses = achievement.channels.reduce((total, ch) => {
            return total + (updatedChannelGuesses[ch.toLowerCase()] || 0);
          }, 0);
          
          if (totalRelevantGuesses >= achievement.requirement) {
            return { ...achievement, unlocked: true };
          }
        }
      }
      return achievement;
    });
    
    const newlyUnlocked = updatedAchievements.filter((achievement, index) => 
      achievement.unlocked && !data.achievements[index].unlocked
    );
    
    saveAchievementData({
      achievements: updatedAchievements,
      stats: {
        ...data.stats,
        channelGuesses: updatedChannelGuesses
      }
    });
    
    return newlyUnlocked;
  } catch (error) {
    console.error('Error in incrementChannelGuess:', error);
    return [];
  }
}

export function updateBestScore(score: number): void {
  const data = getAchievementData();
  
  if (score > data.stats.bestScore) {
    saveAchievementData({
      stats: {
        ...data.stats,
        bestScore: score
      }
    });
    
    if (typeof window !== 'undefined') {
      try {
        import('./storageManager').then(({ updateRecordScore }) => {
          updateRecordScore(score, true);
        });
      } catch (error) {
        console.error('Error syncing bestScore with storageManager:', error);
      }
    }
  }
}

export function incrementTotalGames(): void {
  const data = getAchievementData();
  
  saveAchievementData({
    stats: {
      ...data.stats,
      totalGames: data.stats.totalGames + 1
    }
  });
}

export function useAchievementManager() {
  const getUnlockedAchievements = (): Achievement[] => {
    return getAchievementData().achievements.filter(achievement => achievement.unlocked);
  };
  
  const getAllAchievements = (): Achievement[] => {
    return getAchievementData().achievements;
  };
  
  const getStats = () => {
    const stats = getAchievementData().stats;
    
    let uniqueCount = 0;
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      try {
        const stored = localStorage.getItem(EMOTES_STORAGE_KEY);
        if (stored) {
          const guessedEmotes = JSON.parse(stored);
          Object.values(guessedEmotes).forEach((emotes: any) => {
            uniqueCount += (emotes as any[]).length;
          });
        }
      } catch (e) {
        console.error('Error calculating unique emotes:', e);
      }
    }
    
    return {
      ...stats,
      uniqueCorrectGuesses: stats.uniqueCorrectGuesses || uniqueCount
    };
  };
  
  const getGuessedEmotes = (): Record<string, string[]> => {
    if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
      return {};
    }
    
    try {
      const stored = localStorage.getItem(EMOTES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error retrieving guessed emotes:', e);
    }
    
    return {};
  };
  
  return {
    incrementCorrectGuesses,
    incrementChannelGuess,
    updateBestScore,
    incrementTotalGames,
    getUnlockedAchievements,
    getAllAchievements,
    getStats,
    getGuessedEmotes
  };
} 