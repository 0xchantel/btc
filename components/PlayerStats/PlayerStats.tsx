'use client'

import React, { useState, useEffect } from 'react'
import styles from './PlayerStats.module.css'
import { useWallet } from '@/contexts/WalletContext'

interface PlayerStatsData {
  totalRounds: number
  totalWins: number
  totalEarnings: number
  winRate: number
  categoryWins: Record<string, number>
  recentRounds: Array<{
    date: string
    letter: string
    wins: number
    earnings: number
  }>
}

const DEFAULT_STATS: PlayerStatsData = {
  totalRounds: 0,
  totalWins: 0,
  totalEarnings: 0,
  winRate: 0,
  categoryWins: {
    place: 0,
    animal: 0,
    object: 0,
    name: 0,
    color: 0,
  },
  recentRounds: [],
}

export const PlayerStats: React.FC = () => {
  const { publicKey, isConnected } = useWallet()
  const [stats, setStats] = useState<PlayerStatsData>(DEFAULT_STATS)

  const categoryEmojis: Record<string, string> = {
    place: '📍',
    animal: '🦁',
    object: '🎁',
    name: '👤',
    color: '🎨',
  }

  return (
    <div className={styles.playerStatsContainer}>
      {!isConnected ? (
        <div className={styles.notConnected}>
          <p>Connect your wallet to view your stats</p>
        </div>
      ) : (
        <>
          <h2>Your Statistics</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Rounds Played</div>
              <div className={styles.statValue}>{stats.totalRounds}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Wins</div>
              <div className={styles.statValue}>{stats.totalWins}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Win Rate</div>
              <div className={styles.statValue}>{stats.winRate}%</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Earnings</div>
              <div className={`${styles.statValue} ${styles.earnings}`}>
                {stats.totalEarnings.toFixed(2)} XLM
              </div>
            </div>
          </div>

          <div className={styles.categorySection}>
            <h3>Category Performance</h3>
            <div className={styles.categoryGrid}>
              {Object.entries(stats.categoryWins).map(([category, wins]) => (
                <div key={category} className={styles.categoryCard}>
                  <div className={styles.categoryEmoji}>
                    {categoryEmojis[category]}
                  </div>
                  <div className={styles.categoryName}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <div className={styles.categoryWins}>{wins} wins</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
