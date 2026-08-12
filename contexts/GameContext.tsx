'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import GameEngine, { GameRound, Player } from '@/lib/gameLogic'
import { GameCategory } from '@/lib/types'

export interface GameContextType {
  gameEngine: GameEngine
  currentRound: GameRound | null
  selectedLetter: string | null
  players: Player[]
  userPlayer: Player | null
  gamePhase: 'lobby' | 'letter-selection' | 'answering' | 'verification' | 'results'
  timeRemaining: number
  
  // Actions
  initializeGame: (players: Player[], prizePool: number) => void
  selectLetter: (letter: string) => void
  submitAnswer: (category: GameCategory, answer: string) => boolean
  endRound: () => void
  resetGame: () => void
  setUserPlayer: (player: Player) => void
  getWinners: () => Map<string, string> | null
  getPrizes: () => Map<string, number>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const gameEngine = new GameEngine()
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [userPlayer, setUserPlayerState] = useState<Player | null>(null)
  const [gamePhase, setGamePhase] = useState<'lobby' | 'letter-selection' | 'answering' | 'verification' | 'results'>('lobby')
  const [timeRemaining, setTimeRemaining] = useState(60)

  // Timer effect
  React.useEffect(() => {
    if (gamePhase !== 'answering' || !currentRound) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - currentRound.startTime
      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0) {
        gameEngine.endAnsweringPhase()
        setGamePhase('verification')
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gamePhase, currentRound, gameEngine])

  const initializeGame = useCallback(
    (newPlayers: Player[], prizePool: number) => {
      setPlayers(newPlayers)
      setGamePhase('letter-selection')
      setSelectedLetter(null)
    },
    []
  )

  const selectLetter = useCallback(
    (letter: string) => {
      if (!gameEngine.isValidLetter(letter)) return

      setSelectedLetter(letter)
      const round = gameEngine.initializeRound(letter, players, 10) // 10 XLM prize pool
      setCurrentRound(round)
      setGamePhase('answering')
      setTimeRemaining(60)
    },
    [gameEngine, players]
  )

  const submitAnswer = useCallback(
    (category: GameCategory, answer: string) => {
      if (!userPlayer || !currentRound) return false
      if (!gameEngine.isValidAnswer(answer)) return false

      const success = gameEngine.submitAnswer(userPlayer.id, category, answer)
      if (success) {
        setCurrentRound(gameEngine.getCurrentRound())
      }
      return success
    },
    [gameEngine, userPlayer, currentRound]
  )

  const endRound = useCallback(() => {
    gameEngine.endAnsweringPhase()
    setGamePhase('verification')
  }, [gameEngine])

  const resetGame = useCallback(() => {
    gameEngine.completeRound()
    setCurrentRound(null)
    setSelectedLetter(null)
    setGamePhase('lobby')
    setTimeRemaining(60)
  }, [gameEngine])

  const setUserPlayer = useCallback((player: Player) => {
    setUserPlayerState(player)
  }, [])

  const getWinners = useCallback(() => {
    return currentRound?.winners || null
  }, [currentRound])

  const getPrizes = useCallback(() => {
    return gameEngine.calculatePrizes()
  }, [gameEngine])

  const value: GameContextType = {
    gameEngine,
    currentRound,
    selectedLetter,
    players,
    userPlayer,
    gamePhase,
    timeRemaining,
    initializeGame,
    selectLetter,
    submitAnswer,
    endRound,
    resetGame,
    setUserPlayer,
    getWinners,
    getPrizes,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}
