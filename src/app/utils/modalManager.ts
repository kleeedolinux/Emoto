'use client';

import { useCallback, useState } from 'react';
import { ModalState } from '../types/index';

export function useModalManager() {
  const [modalState, setModalState] = useState<ModalState>({
    helpDialogOpen: false,
    gameOverDialogOpen: false,
    winDialogOpen: false,
    achievementsDialogOpen: false
  });

  const openHelpDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, helpDialogOpen: true }));
  }, []);

  const closeHelpDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, helpDialogOpen: false }));
  }, []);

  const openGameOverDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, gameOverDialogOpen: true }));
  }, []);

  const closeGameOverDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, gameOverDialogOpen: false }));
  }, []);

  const openWinDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, winDialogOpen: true }));
  }, []);

  const closeWinDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, winDialogOpen: false }));
  }, []);

  const openAchievementsDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, achievementsDialogOpen: true }));
  }, []);

  const closeAchievementsDialog = useCallback(() => {
    setModalState(prev => ({ ...prev, achievementsDialogOpen: false }));
  }, []);

  return {
    modalState,
    openHelpDialog,
    closeHelpDialog,
    openGameOverDialog,
    closeGameOverDialog,
    openWinDialog,
    closeWinDialog,
    openAchievementsDialog,
    closeAchievementsDialog
  };
} 