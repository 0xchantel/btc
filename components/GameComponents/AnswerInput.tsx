'use client'

import React, { useState } from 'react'
import styles from './GameComponents.module.css'
import { useGame } from '@/contexts/GameContext'
import { GameCategory } from '@/lib/types'

const CATEGORIES: GameCategory[] = ['place', 'animal', 'object', 'name', 'color']
const CATEGORY_EMOJIS: Record<GameCategory, string> = {
  place: '📍',
  animal: '🦁',
  object: '🎁',
  name: '👤',
  color: '🎨',
}

export const AnswerInput: React.FC = () => {
  const { submitAnswer, currentRound, userPlayer, timeRemaining } = useGame()
  const [answers, setAnswers] = useState<Record<GameCategory, string>>({
    place: '',
    animal: '',
    object: '',
    name: '',
    color: '',
  })
  const [submitted, setSubmitted] = useState<Set<GameCategory>>(new Set())
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleInputChange = (category: GameCategory, value: string) => {
    if (submitted.has(category)) return // Don't allow editing submitted answers
    setAnswers((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleSubmitAnswer = (category: GameCategory) => {
    const answer = answers[category].trim()
    if (!answer) {
      setFeedback('Please enter an answer')
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    const success = submitAnswer(category, answer)
    if (success) {
      setSubmitted((prev) => new Set(prev).add(category))
      setFeedback(`✅ ${category} submitted!`)
      setTimeout(() => setFeedback(null), 2000)
    } else {
      setFeedback('Failed to submit answer')
      setTimeout(() => setFeedback(null), 2000)
    }
  }

  if (!currentRound || !userPlayer) {
    return <div className={styles.noRound}>No active round</div>
  }

  return (
    <div className={styles.answerInputContainer}>
      <div className={styles.headerInfo}>
        <h2>Letter: <span className={styles.letter}>{currentRound.letter}</span></h2>
        <div className={styles.timer}>
          <span className={timeRemaining <= 10 ? styles.timerWarning : ''}>
            ⏱ {timeRemaining}s
          </span>
        </div>
      </div>

      <div className={styles.answersGrid}>
        {CATEGORIES.map((category) => (
          <div
            key={category}
            className={`${styles.categoryInput} ${
              submitted.has(category) ? styles.categorySubmitted : ''
            }`}
          >
            <label className={styles.categoryLabel}>
              <span className={styles.categoryEmoji}>
                {CATEGORY_EMOJIS[category]}
              </span>
              <span className={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder={`e.g., ${getExampleForCategory(category, currentRound.letter)}`}
                value={answers[category]}
                onChange={(e) => handleInputChange(category, e.target.value)}
                disabled={submitted.has(category)}
                className={styles.input}
              />
              <button
                onClick={() => handleSubmitAnswer(category)}
                disabled={submitted.has(category) || !answers[category].trim()}
                className={`${styles.submitBtn} ${
                  submitted.has(category) ? styles.submitBtnDisabled : ''
                }`}
              >
                {submitted.has(category) ? '✓' : '→'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {feedback && <div className={styles.feedback}>{feedback}</div>}
    </div>
  )
}

function getExampleForCategory(category: GameCategory, letter: string): string {
  const examples: Record<GameCategory, Record<string, string>> = {
    place: { A: 'Australia', B: 'Brazil', C: 'Canada' },
    animal: { A: 'Ant', B: 'Bear', C: 'Cat' },
    object: { A: 'Apple', B: 'Ball', C: 'Car' },
    name: { A: 'Alice', B: 'Bob', C: 'Charlie' },
    color: { A: 'Azure', B: 'Blue', C: 'Cyan' },
  }
  return examples[category][letter] || letter
}
