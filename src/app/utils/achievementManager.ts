'use client';

import { Achievement, AchievementData } from '../types';

const STORAGE_KEY = 'emoto_achievement_data';

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
    bestScore: 0,
    totalGames: 0,
    channelGuesses: {}
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
      console.warn('localStorage is not available.');
      return DEFAULT_ACHIEVEMENT_DATA;
    }
    
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
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
    
    const needsUpdate = achievementsToAdd.length > 0 || filteredAchievements.length !== parsedData.achievements.length;
    
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
    return DEFAULT_ACHIEVEMENT_DATA;
  }
}

export function saveAchievementData(data: Partial<AchievementData>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available, cannot save achievement data.');
      return;
    }
    
    const currentData = getAchievementData();
    const updatedData = { 
      ...currentData, 
      ...data,
      stats: {
        ...currentData.stats,
        ...(data.stats || {})
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving achievement data to localStorage:', error);
  }
}

export function incrementCorrectGuesses(): Achievement[] {
  const data = getAchievementData();
  const totalCorrectGuesses = data.stats.totalCorrectGuesses + 1;
  
  const updatedAchievements = data.achievements.map(achievement => {
    if (!achievement.unlocked && 
        !achievement.channels && 
        totalCorrectGuesses >= achievement.requirement) {
      return { ...achievement, unlocked: true };
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
      totalCorrectGuesses
    }
  });
  
  return newlyUnlocked;
}

export function incrementChannelGuess(channel: string): Achievement[] {
  const data = getAchievementData();
  const lowerCaseChannel = channel.toLowerCase();
  
  if (!data.stats.channelGuesses) {
    data.stats.channelGuesses = {};
  }
  
  let shouldIncrementChannel = false;
  for (const achievement of data.achievements) {
    if (achievement.channels && achievement.channels.includes(lowerCaseChannel)) {
      shouldIncrementChannel = true;
      break;
    }
  }
  
  if (!shouldIncrementChannel) {
    return [];
  }
  
  const channelGuesses = {
    ...data.stats.channelGuesses,
    [lowerCaseChannel]: (data.stats.channelGuesses?.[lowerCaseChannel] || 0) + 1
  };
  
  const updatedAchievements = data.achievements.map(achievement => {
    if (!achievement.unlocked && achievement.channels) {
      if (achievement.channels.includes(lowerCaseChannel)) {
        const totalRelevantGuesses = achievement.channels.reduce((total, ch) => {
          return total + (channelGuesses[ch.toLowerCase()] || 0);
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
      channelGuesses
    }
  });
  
  return newlyUnlocked;
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
    return getAchievementData().stats;
  };
  
  return {
    incrementCorrectGuesses,
    incrementChannelGuess,
    updateBestScore,
    incrementTotalGames,
    getUnlockedAchievements,
    getAllAchievements,
    getStats
  };
} 