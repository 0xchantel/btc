'use client'

import React, { useState, useEffect } from 'react'
import { GameProvider } from '@/contexts/GameContext'
import { WalletProvider } from '@/contexts/WalletContext'
import styles from './game.module.css'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { LetterSelector } from '@/components/GameComponents/LetterSelector'
import { AnswerInput } from '@/components/GameComponents/AnswerInput'
import { ResultsDisplay } from '@/components/GameComponents/ResultsDisplay'
import { Leaderboard } from '@/components/Leaderboard/Leaderboard'
import { PlayerStats } from '@/components/PlayerStats/PlayerStats'
import { useGame } from '@/contexts/GameContext'
import { useWallet } from '@/contexts/WalletContext'

const GamePageContent: React.FC = () => {
  const { gamePhase, selectedLetter, currentRound } = useGame()
  const { isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard' | 'stats'>('game')

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>I CALL ON</h1>
          <p className={styles.subtitle}>Crypto Word Game</p>
        </div>
        <div className={styles.headerRight}>
          <WalletConnect />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'game' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 Game
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {activeTab === 'game' && (
          <div className={styles.gameSection}>
            {!isConnected ? (
              <div className={styles.connectPrompt}>
                <h2>Welcome to I CALL ON</h2>
                <p>Connect your Stellar wallet to start playing and earn crypto rewards!</p>
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <span>🎯</span>
                    <p>Call a letter and race against opponents</p>
                  </div>
                  <div className={styles.feature}>
                    <span>💰</span>
                    <p>Win XLM for each correct answer</p>
                  </div>
                  <div className={styles.feature}>
                    <span>🌍</span>
                    <p>Compete with players worldwide</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.gameContent}>
                {gamePhase === 'lobby' && (
                  <div className={styles.lobbyContent}>
                    <h2>Ready to Play?</h2>
                    <p>Select a letter to start a new round!</p>
                    <LetterSelector />
                  </div>
                )}

                {gamePhase === 'letter-selection' && (
                  <div className={styles.selectionContent}>
                    <LetterSelector />
                  </div>
                )}

                {gamePhase === 'answering' && currentRound && (
                  <div className={styles.answeringContent}>
                    <AnswerInput />
                  </div>
                )}

                {gamePhase === 'verification' && currentRound && (
                  <div className={styles.verificationContent}>
                    <h2>Verifying Answers...</h2>
                    <div className={styles.loader}>
                      <div className={styles.spinner}></div>
                    </div>
                    <p>Our oracle is verifying all answers. Please wait...</p>
                  </div>
                )}

                {gamePhase === 'results' && currentRound && (
                  <div className={styles.resultsContent}>
                    <ResultsDisplay />
                    <button
                      className={styles.playAgainBtn}
                      onClick={() => {
                        // Reset game
                      }}
                    >
                      🔄 Play Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className={styles.leaderboardSection}>
            <Leaderboard />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className={styles.statsSection}>
            <PlayerStats />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 I CALL ON. Powered by Stellar Soroban & Blockchain Technology.</p>
      </footer>
    </div>
  )
}

export default function GamePage() {
  return (
    <WalletProvider>
      <GameProvider>
        <GamePageContent />
      </GameProvider>
    </WalletProvider>
  )
}
