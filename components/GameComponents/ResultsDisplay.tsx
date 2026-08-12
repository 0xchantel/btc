'use client'

import React from 'react'
import styles from './GameComponents.module.css'
import { useGame } from '@/contexts/GameContext'
import { useWallet } from '@/contexts/WalletContext'

export const ResultsDisplay: React.FC = () => {
  const { currentRound, getWinners, getPrizes, players } = useGame()
  const { publicKey } = useWallet()
  const winners = getWinners()
  const prizes = getPrizes()

  if (!currentRound || !winners) {
    return <div>Loading results...</div>
  }

  const userWins = new Set<string>()
  let userPrize = 0

  for (const [category, winnerId] of winners.entries()) {
    if (winnerId === publicKey) {
      userWins.add(category)
      userPrize += prizes.get(winnerId) || 0
    }
  }

  const categoryLabels: Record<string, string> = {
    place: '📍 Place',
    animal: '🦁 Animal',
    object: '🎁 Object',
    name: '👤 Name',
    color: '🎨 Color',
  }

  return (
    <div className={styles.resultsContainer}>
      <h2>Round Results</h2>
      <div className={styles.resultsGrid}>
        {Array.from(winners.entries()).map(([category, winnerId]) => {
          const winner = players.find((p) => p.id === winnerId)
          const isUserWinner = winnerId === publicKey

          return (
            <div
              key={category}
              className={`${styles.resultCard} ${
                isUserWinner ? styles.resultCardWon : ''
              }`}
            >
              <div className={styles.resultCategory}>
                {categoryLabels[category]}
              </div>
              <div className={styles.resultWinner}>
                {winner?.name || 'Anonymous'}
              </div>
              {isUserWinner && (
                <div className={styles.resultPrize}>
                  🏆 +{prizes.get(winnerId)?.toFixed(2)} XLM
                </div>
              )}
            </div>
          )
        })}
      </div>

      {userWins.size > 0 && (
        <div className={styles.userSummary}>
          <h3>Your Performance</h3>
          <p>Categories Won: {userWins.size} / 5</p>
          <p className={styles.totalPrize}>
            Total Prize: <strong>+{userPrize.toFixed(2)} XLM</strong>
          </p>
        </div>
      )}
    </div>
  )
}
