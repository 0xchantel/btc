'use client'

import React from 'react'
import styles from './GameComponents.module.css'
import { useGame } from '@/contexts/GameContext'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const LetterSelector: React.FC = () => {
  const { selectLetter, selectedLetter } = useGame()

  const handleSelectLetter = (letter: string) => {
    selectLetter(letter)
  }

  return (
    <div className={styles.letterSelectorContainer}>
      <h2>Select a Letter</h2>
      <div className={styles.letterGrid}>
        {LETTERS.map((letter) => (
          <button
            key={letter}
            className={`${styles.letterButton} ${
              selectedLetter === letter ? styles.selected : ''
            }`}
            onClick={() => handleSelectLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  )
}
