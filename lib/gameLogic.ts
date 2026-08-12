/**
 * Core Game Logic for I CALL ON
 * Handles game state, scoring, and game flow
 */

export interface Player {
  id: string
  name: string
  wallet: string
  score: number
  answers: GameAnswer[]
  connected: boolean
}

export interface GameAnswer {
  category: 'place' | 'animal' | 'object' | 'name' | 'color'
  answer: string
  timestamp: number
  isCorrect?: boolean
}

export interface GameRound {
  id: string
  letter: string
  players: Player[]
  currentPhase: 'selection' | 'answering' | 'verification' | 'completed'
  startTime: number
  endTime?: number
  answers: Map<string, GameAnswer[]> // playerId -> answers
  winners: Map<string, string> // category -> winnerId
  prizePool: number
}

export class GameEngine {
  private currentRound: GameRound | null = null
  private roundHistory: GameRound[] = []
  private readonly ANSWER_TIME_LIMIT = 60000 // 60 seconds
  private readonly CATEGORIES: Array<'place' | 'animal' | 'object' | 'name' | 'color'> = [
    'place',
    'animal',
    'object',
    'name',
    'color',
  ]

  /**
   * Initialize a new game round
   */
  initializeRound(letter: string, players: Player[], prizePool: number): GameRound {
    const round: GameRound = {
      id: `round_${Date.now()}`,
      letter: letter.toUpperCase(),
      players,
      currentPhase: 'answering',
      startTime: Date.now(),
      answers: new Map(),
      winners: new Map(),
      prizePool,
    }

    // Initialize empty answers array for each player
    players.forEach((player) => {
      round.answers.set(player.id, [])
    })

    this.currentRound = round
    return round
  }

  /**
   * Submit an answer for a category
   */
  submitAnswer(
    playerId: string,
    category: 'place' | 'animal' | 'object' | 'name' | 'color',
    answer: string
  ): boolean {
    if (!this.currentRound) return false
    if (this.currentRound.currentPhase !== 'answering') return false

    // Check if time limit exceeded
    const elapsedTime = Date.now() - this.currentRound.startTime
    if (elapsedTime > this.ANSWER_TIME_LIMIT) return false

    // Check if answer already exists for this player in this category
    const playerAnswers = this.currentRound.answers.get(playerId) || []
    if (playerAnswers.some((a) => a.category === category)) {
      return false // Already answered this category
    }

    // Add the answer
    const gameAnswer: GameAnswer = {
      category,
      answer: answer.trim(),
      timestamp: Date.now(),
    }

    playerAnswers.push(gameAnswer)
    this.currentRound.answers.set(playerId, playerAnswers)

    return true
  }

  /**
   * End the answering phase and move to verification
   */
  endAnsweringPhase(): void {
    if (!this.currentRound) return
    this.currentRound.currentPhase = 'verification'
    this.currentRound.endTime = Date.now()
  }

  /**
   * Verify answers and determine winners
   * This could be called by an oracle or verified on-chain
   */
  verifyAnswers(verifiedAnswers: Map<string, Map<string, boolean>>): void {
    if (!this.currentRound) return

    // verifiedAnswers structure: playerId -> (category -> isCorrect)
    for (const [playerId, categoryVerification] of verifiedAnswers.entries()) {
      const playerAnswers = this.currentRound.answers.get(playerId)
      if (!playerAnswers) continue

      playerAnswers.forEach((answer) => {
        const isCorrect = categoryVerification.get(answer.category) || false
        answer.isCorrect = isCorrect
      })
    }

    this.determineCategoryWinners()
  }

  /**
   * Determine the winner for each category (first correct answer)
   */
  private determineCategoryWinners(): void {
    if (!this.currentRound) return

    for (const category of this.CATEGORIES) {
      let earliestCorrectAnswer: { playerId: string; timestamp: number } | null = null

      for (const [playerId, answers] of this.currentRound.answers.entries()) {
        const categoryAnswer = answers.find((a) => a.category === category)
        if (categoryAnswer && categoryAnswer.isCorrect) {
          if (
            !earliestCorrectAnswer ||
            categoryAnswer.timestamp < earliestCorrectAnswer.timestamp
          ) {
            earliestCorrectAnswer = {
              playerId,
              timestamp: categoryAnswer.timestamp,
            }
          }
        }
      }

      if (earliestCorrectAnswer) {
        this.currentRound.winners.set(category, earliestCorrectAnswer.playerId)
      }
    }

    this.currentRound.currentPhase = 'completed'
  }

  /**
   * Calculate prizes for winners
   */
  calculatePrizes(): Map<string, number> {
    if (!this.currentRound) return new Map()

    const prizes = new Map<string, number>()
    const prizePerCategory = this.currentRound.prizePool / this.CATEGORIES.length

    for (const [category, winnerId] of this.currentRound.winners.entries()) {
      const currentPrize = prizes.get(winnerId) || 0
      prizes.set(winnerId, currentPrize + prizePerCategory)
    }

    return prizes
  }

  /**
   * Get current round state
   */
  getCurrentRound(): GameRound | null {
    return this.currentRound
  }

  /**
   * Get game history
   */
  getRoundHistory(): GameRound[] {
    return this.roundHistory
  }

  /**
   * Complete the round and add to history
   */
  completeRound(): GameRound | null {
    if (!this.currentRound) return null

    this.roundHistory.push(this.currentRound)
    const completed = this.currentRound
    this.currentRound = null

    return completed
  }

  /**
   * Validate an answer format
   */
  isValidAnswer(answer: string): boolean {
    // Answer should be non-empty and less than 100 characters
    return answer.trim().length > 0 && answer.trim().length < 100
  }

  /**
   * Check if letter is valid
   */
  isValidLetter(letter: string): boolean {
    return /^[A-Z]$/.test(letter.toUpperCase())
  }
}

export default GameEngine
