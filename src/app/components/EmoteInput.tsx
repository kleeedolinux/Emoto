'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAutocomplete } from '../utils/useAutocomplete';
import KeyboardNavigation from './KeyboardNavigation';
import AutocompleteList from './AutocompleteList';
import { useTranslation } from '../i18n/useTranslation';

interface EmoteInputProps {
  onEmoteGuess: (emote: string) => void;
  emotesList: string[];
  isVisible: boolean;
}

export interface EmoteInputHandles {
  showCorrectGuess: () => void;
  showIncorrectGuess: () => void;
}

const EmoteInput = forwardRef<EmoteInputHandles, EmoteInputProps>(
  ({ onEmoteGuess, emotesList, isVisible }, ref) => {
    const { t } = useTranslation('emoteInput');
    const [inputValue, setInputValue] = useState('');
    const [inputStatus, setInputStatus] = useState<'default' | 'correct' | 'incorrect'>('default');
    
    const {
      state: autocompleteState,
      inputRef,
      listRef,
      filterItems,
      navigate,
      selectItem,
      showList,
      hideList
    } = useAutocomplete(emotesList);

    useImperativeHandle(ref, () => ({
      showCorrectGuess: () => {
        setInputStatus('correct');
        
        if (inputRef.current) {
          inputRef.current.placeholder = t('correct');
          inputRef.current.blur();
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.placeholder = t('placeholder');
              inputRef.current.focus();
              setInputStatus('default');
            }
          }, 800);
        }
      },
      showIncorrectGuess: () => {
        setInputStatus('incorrect');
        
        if (inputRef.current) {
          inputRef.current.className = 'emoteTry';
          
          void inputRef.current.offsetWidth;
          
          inputRef.current.className = 'emoteTry shake';
          inputRef.current.placeholder = t('tryAgain');
          inputRef.current.blur();
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.className = 'emoteTry';
              inputRef.current.placeholder = t('placeholder');
              inputRef.current.focus();
              setInputStatus('default');
            }
          }, 500);
        }
      }
    }));

    useEffect(() => {
      if (isVisible && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isVisible, inputRef]);

    useEffect(() => {
      setInputStatus('default');
    }, [inputValue]);

    useEffect(() => {
      filterItems(inputValue);
    }, [inputValue, filterItems]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleItemClick = (item: string) => {
      console.log("Autocomplete item selected:", item);
      setInputValue(item);
      hideList();
      setTimeout(() => submitGuess(item), 0);
    };

    const handleSubmit = () => {
      if (!inputValue.trim()) return;
      submitGuess(inputValue);
    };

    const submitGuess = (guess: string) => {
      if (!guess.trim()) return;
      
      console.log('Submitting final guess:', guess);
      
      onEmoteGuess(guess);
      setInputValue('');
    };

    const handleKeyboardSelect = () => {
      const selectedValue = selectItem();
      if (selectedValue) {
        console.log("Keyboard selected:", selectedValue);
        submitGuess(selectedValue);
        return true;
      }
      return false;
    };

    if (!isVisible) return null;

    return (
      <div className="emoteTryContainer">
        <input
          ref={inputRef}
          type="text"
          className="emoteTry"
          placeholder={t('placeholder')}
          value={inputValue}
          onChange={handleChange}
          autoComplete="off"
          style={{
            boxShadow: inputStatus === 'correct' 
              ? '0 0 0 3px green, 0 0 15px rgba(0, 255, 0, 0.5)' 
              : inputStatus === 'incorrect' 
                ? '0 0 0 3px rgba(191, 2, 2), 0 0 15px rgba(255, 0, 0, 0.5)' 
                : undefined,
            transition: 'all 0.3s ease-in-out'
          }}
        />
        
        <KeyboardNavigation
          inputRef={inputRef}
          autocompleteState={autocompleteState}
          onNavigate={navigate}
          onSelect={selectItem}
          onHide={hideList}
          onShow={showList}
          onSubmit={handleSubmit}
          onKeyboardSelect={handleKeyboardSelect}
          disabled={!isVisible}
        />
        
        <AutocompleteList
          state={autocompleteState}
          listRef={listRef}
          onItemClick={handleItemClick}
        />
      </div>
    );
  }
);

EmoteInput.displayName = 'EmoteInput';

export default EmoteInput; 