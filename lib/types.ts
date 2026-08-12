/**
 * Type definitions for I CALL ON
 */

export type GamePhase = 'selection' | 'answering' | 'verification' | 'completed'
export type GameCategory = 'place' | 'animal' | 'object' | 'name' | 'color'
export type NetworkType = 'testnet' | 'mainnet'

export interface Player {
  id: string
  name: string
  wallet: string
  score: number
  connected: boolean
  joinedAt: number
}

export interface GameAnswer {
  category: GameCategory
  answer: string
  timestamp: number
  isCorrect?: boolean
}

export interface GameRound {
  id: string
  letter: string
  players: Player[]
  currentPhase: GamePhase
  startTime: number
  endTime?: number
  answers: Map<string, GameAnswer[]>
  winners: Map<string, string> // category -> playerId
  prizePool: number
  totalPrizesDistributed?: number
}

export interface GameSession {
  sessionId: string
  players: Player[]
  rounds: GameRound[]
  startedAt: number
  endedAt?: number
  totalPrizePool: number
}

export interface VerificationResult {
  playerId: string
  category: GameCategory
  answer: string
  isCorrect: boolean
  confidence: number // 0-100
}

export interface LeaderboardEntry {
  rank: number
  player: Player
  totalWins: number
  totalEarnings: number // in XLM
  winRate: number // percentage
  favoriteCategory?: GameCategory
}

export interface TransactionResult {
  success: boolean
  txHash?: string
  error?: string
  timestamp: number
}

export interface WalletState {
  connected: boolean
  publicKey?: string
  network: NetworkType
  balance?: number // in XLM
}
