import { Pool, QueryResult } from 'pg'
import { players, gameRounds, playerAnswers, achievements } from '@/database/types'

/**
 * Database client for I CALL ON
 */
export class DatabaseClient {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  /**
   * Create a new player
   */
  async createPlayer(
    walletAddress: string,
    username: string,
    email?: string
  ): Promise<any> {
    const query = `
      INSERT INTO players (wallet_address, username, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await this.pool.query(query, [walletAddress, username, email])
    return result.rows[0]
  }

  /**
   * Get player by wallet address
   */
  async getPlayerByWallet(walletAddress: string): Promise<any | null> {
    const query = 'SELECT * FROM players WHERE wallet_address = $1'
    const result = await this.pool.query(query, [walletAddress])
    return result.rows[0] || null
  }

  /**
   * Get player by ID
   */
  async getPlayerById(playerId: string): Promise<any | null> {
    const query = 'SELECT * FROM players WHERE id = $1'
    const result = await this.pool.query(query, [playerId])
    return result.rows[0] || null
  }

  /**
   * Update player stats
   */
  async updatePlayerStats(
    playerId: string,
    stats: Partial<any>
  ): Promise<void> {
    const fields = Object.keys(stats)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')
    const values = [playerId, ...Object.values(stats)]
    const query = `UPDATE players SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`
    await this.pool.query(query, values)
  }

  /**
   * Create a game round
   */
  async createGameRound(
    roundId: string,
    letter: string,
    prizePool: number,
    playerCount: number
  ): Promise<any> {
    const query = `
      INSERT INTO game_rounds (round_id, letter, prize_pool, player_count)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const result = await this.pool.query(query, [roundId, letter, prizePool, playerCount])
    return result.rows[0]
  }

  /**
   * Record player answer
   */
  async recordPlayerAnswer(
    roundId: string,
    playerId: string,
    category: string,
    answer: string,
    isCorrect: boolean,
    confidence: number
  ): Promise<void> {
    const query = `
      INSERT INTO player_answers (round_id, player_id, category, answer, is_correct, verification_confidence)
      VALUES ($1, $2, $3, $4, $5, $6)
    `
    await this.pool.query(query, [roundId, playerId, category, answer, isCorrect, confidence])
  }

  /**
   * Record round winner
   */
  async recordRoundWinner(
    roundId: string,
    category: string,
    winnerId: string,
    prizeAmount: number,
    sorobanTxId?: string
  ): Promise<void> {
    const query = `
      INSERT INTO round_winners (round_id, category, winner_id, prize_amount, soroban_tx_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (round_id, category) DO UPDATE SET
        winner_id = $3, prize_amount = $4, soroban_tx_id = $5
    `
    await this.pool.query(query, [roundId, category, winnerId, prizeAmount, sorobanTxId])
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 100, timeframe: string = 'all-time'): Promise<any[]> {
    let query = `
      SELECT id, username, wallet_address, total_wins, total_earnings, win_rate
      FROM players
      WHERE is_active = true
      ORDER BY total_earnings DESC
      LIMIT $1
    `
    const result = await this.pool.query(query, [limit])
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
  }

  /**
   * Get player achievements
   */
  async getPlayerAchievements(playerId: string): Promise<any[]> {
    const query = `
      SELECT a.* FROM achievements a
      INNER JOIN player_achievements pa ON a.id = pa.achievement_id
      WHERE pa.player_id = $1
      ORDER BY pa.unlocked_at DESC
    `
    const result = await this.pool.query(query, [playerId])
    return result.rows
  }

  /**
   * Unlock achievement for player
   */
  async unlockAchievement(playerId: string, achievementId: string): Promise<void> {
    const query = `
      INSERT INTO player_achievements (player_id, achievement_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `
    await this.pool.query(query, [playerId, achievementId])
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(playerId: string): Promise<any[]> {
    const query = `
      SELECT category, wins, losses, accuracy
      FROM category_stats
      WHERE player_id = $1
      ORDER BY wins DESC
    `
    const result = await this.pool.query(query, [playerId])
    return result.rows
  }

  /**
   * Record transaction
   */
  async recordTransaction(
    playerId: string,
    type: string,
    amount: number,
    description: string,
    roundId?: string,
    sorobanTxId?: string
  ): Promise<void> {
    const query = `
      INSERT INTO transaction_history (player_id, type, amount, description, round_id, soroban_tx_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'completed')
    `
    await this.pool.query(query, [playerId, type, amount, description, roundId, sorobanTxId])
  }

  /**
   * Get player's recent rounds
   */
  async getPlayerRecentRounds(playerId: string, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT r.*, COUNT(CASE WHEN rw.winner_id = $1 THEN 1 END) as wins
      FROM game_rounds r
      LEFT JOIN round_winners rw ON r.round_id = rw.round_id
      WHERE EXISTS (
        SELECT 1 FROM player_answers pa WHERE pa.round_id = r.round_id AND pa.player_id = $1
      )
      ORDER BY r.created_at DESC
      LIMIT $2
    `
    const result = await this.pool.query(query, [playerId, limit])
    return result.rows
  }

  /**
   * Create tournament
   */
  async createTournament(
    tournamentId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    totalPrizePool: number,
    maxPlayers: number
  ): Promise<void> {
    const query = `
      INSERT INTO tournaments (tournament_id, name, start_date, end_date, total_prize_pool, max_players)
      VALUES ($1, $2, $3, $4, $5, $6)
    `
    await this.pool.query(query, [
      tournamentId,
      name,
      startDate,
      endDate,
      totalPrizePool,
      maxPlayers,
    ])
  }

  /**
   * Get active tournaments
   */
  async getActiveTournaments(): Promise<any[]> {
    const query = `
      SELECT * FROM tournaments
      WHERE status = 'active' AND end_date > CURRENT_TIMESTAMP
      ORDER BY start_date ASC
    `
    const result = await this.pool.query(query)
    return result.rows
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end()
  }
}

export default DatabaseClient
