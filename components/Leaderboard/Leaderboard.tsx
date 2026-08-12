'use client'

import React, { useState, useEffect } from 'react'
import styles from './Leaderboard.module.css'

interface LeaderboardEntry {
  rank: number
  playerName: string
  wallet: string
  totalWins: number
  totalEarnings: number
  winRate: number
  favoriteCategory?: string
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      playerName: 'CryptoKing',
      wallet: 'G...xyz',
      totalWins: 45,
      totalEarnings: 125.5,
      winRate: 78,
      favoriteCategory: 'animal',
    },
    {
      rank: 2,
      playerName: 'WordMaster',
      wallet: 'G...abc',
      totalWins: 38,
      totalEarnings: 98.3,
      winRate: 72,
      favoriteCategory: 'place',
    },
    {
      rank: 3,
      playerName: 'QuickThink',
      wallet: 'G...def',
      totalWins: 32,
      totalEarnings: 87.2,
      winRate: 68,
      favoriteCategory: 'color',
    },
  ])
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')

  const categoryEmojis: Record<string, string> = {
    place: '📍',
    animal: '🦁',
    object: '🎁',
    name: '👤',
    color: '🎨',
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>
        <h2>🏆 Global Leaderboard</h2>
        <div className={styles.timeframeButtons}>
          <button
            className={`${styles.timeframeBtn} ${timeframe === 'weekly' ? styles.active : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button
            className={`${styles.timeframeBtn} ${timeframe === 'monthly' ? styles.active : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.timeframeBtn} ${timeframe === 'all-time' ? styles.active : ''}`}
            onClick={() => setTimeframe('all-time')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className={styles.leaderboardTable}>
        <div className={styles.tableHeader}>
          <div className={styles.rankCol}>Rank</div>
          <div className={styles.playerCol}>Player</div>
          <div className={styles.winsCol}>Wins</div>
          <div className={styles.earningsCol}>Earnings</div>
          <div className={styles.winRateCol}>Win Rate</div>
          <div className={styles.categoryCol}>Favorite</div>
        </div>

        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`${styles.tableRow} ${entry.rank === 1 ? styles.first : ''} ${entry.rank === 2 ? styles.second : ''} ${entry.rank === 3 ? styles.third : ''}`}
          >
            <div className={styles.rankCol}>
              <span className={styles.rankBadge}>{entry.rank}</span>
            </div>
            <div className={styles.playerCol}>
              <div className={styles.playerName}>{entry.playerName}</div>
              <div className={styles.playerWallet}>{entry.wallet}</div>
            </div>
            <div className={styles.winsCol}>
              <span className={styles.badge}>{entry.totalWins}</span>
            </div>
            <div className={styles.earningsCol}>
              <span className={styles.earning}>{entry.totalEarnings.toFixed(2)} XLM</span>
            </div>
            <div className={styles.winRateCol}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${entry.winRate}%` }}
                ></div>
              </div>
              <span className={styles.percentage}>{entry.winRate}%</span>
            </div>
            <div className={styles.categoryCol}>
              {entry.favoriteCategory && (
                <span className={styles.categoryBadge}>
                  {categoryEmojis[entry.favoriteCategory]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
