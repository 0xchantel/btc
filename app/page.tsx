'use client'

import { useState } from 'react'
import styles from './page.module.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function Home() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const handlePlayGame = () => {
    setGameStarted(true)
  }

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter)
  }

  return (
    <div className={styles.container}>
      {!gameStarted ? (
        <>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎮</span>
              <h1>I CALL ON</h1>
              <span className={styles.logoIcon}>💰</span>
            </div>
            <p className={styles.tagline}>The Ultimate Crypto Word Game</p>
          </header>

          {/* Hero Section */}
          <section className={styles.hero}>
            <h2>Call a Letter, Name a Word, Win Crypto!</h2>
            <p className={styles.description}>
              Challenge your friends in the fastest word game. Name places, animals, objects, people, and colors. 
              Quick thinking = Big rewards!
            </p>
          </section>

          {/* How to Play */}
          <section className={styles.howToPlay}>
            <h3>How to Play</h3>
            <div className={styles.stepsContainer}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h4>Call a Letter</h4>
                <p>One player picks a random letter</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h4>Race Against Time</h4>
                <p>All players name items that start with that letter</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h4>Win Rewards</h4>
                <p>First correct answer in each category wins crypto!</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <h4>Climb the Leaderboard</h4>
                <p>Compete globally and earn exclusive NFTs</p>
              </div>
            </div>
          </section>

          {/* Game Categories */}
          <section className={styles.categories}>
            <h3>Categories</h3>
            <div className={styles.categoryGrid}>
              <div className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>📍</span>
                <h4>Place</h4>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>🦁</span>
                <h4>Animal</h4>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>🎁</span>
                <h4>Object</h4>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>👤</span>
                <h4>Name</h4>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>🎨</span>
                <h4>Color</h4>
              </div>
            </div>
          </section>

          {/* CTA Button */}
          <section className={styles.ctaSection}>
            <button className={styles.playButton} onClick={handlePlayGame}>
              🚀 START PLAYING NOW
            </button>
            <p className={styles.ctaSubtext}>Connect your wallet to begin earning crypto rewards</p>
          </section>

          {/* Features */}
          <section className={styles.features}>
            <h3>Why Play I CALL ON?</h3>
            <div className={styles.featuresList}>
              <div className={styles.feature}>
                <span>⚡</span>
                <p><strong>Real Crypto Rewards</strong> - Earn tokens with every win</p>
              </div>
              <div className={styles.feature}>
                <span>🌍</span>
                <p><strong>Global Tournaments</strong> - Compete with players worldwide</p>
              </div>
              <div className={styles.feature}>
                <span>🏆</span>
                <p><strong>NFT Achievements</strong> - Unlock exclusive digital collectibles</p>
              </div>
              <div className={styles.feature}>
                <span>⚙️</span>
                <p><strong>Fair & Transparent</strong> - Blockchain-verified gameplay</p>
              </div>
              <div className={styles.feature}>
                <span>👥</span>
                <p><strong>Multiplayer Fun</strong> - Play with 2-10 friends or strangers</p>
              </div>
              <div className={styles.feature}>
                <span>📱</span>
                <p><strong>Cross-Platform</strong> - Play on web or mobile</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className={styles.footer}>
            <p>&copy; 2024 I CALL ON. All rights reserved. Powered by Blockchain.</p>
          </footer>
        </>
      ) : (
        <div className={styles.gameContainer}>
          <button 
            className={styles.backButton} 
            onClick={() => setGameStarted(false)}
          >
            ← Back to Home
          </button>
          
          <h2>Select a Letter</h2>
          <div className={styles.letterGrid}>
            {LETTERS.map((letter) => (
              <button
                key={letter}
                className={`${styles.letterButton} ${selectedLetter === letter ? styles.selected : ''}`}
                onClick={() => handleLetterSelect(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          
          {selectedLetter && (
            <div className={styles.selectedLetter}>
              <h3>Selected Letter: <span>{selectedLetter}</span></h3>
              <button className={styles.startRoundButton}>Start Round</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
