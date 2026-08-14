/**
 * Tournament Management System
 */

export interface Tournament {
  id: string
  name: string
  status: 'upcoming' | 'active' | 'completed'
  startDate: number
  endDate: number
  totalPrizePool: number // in XLM
  maxPlayers: number
  players: Set<string>
  rounds: TournamentRound[]
  createdAt: number
}

export interface TournamentRound {
  roundNumber: number
  startTime: number
  endTime?: number
  participants: string[]
  winners: string[]
  status: 'pending' | 'in_progress' | 'completed'
}

export interface TournamentStandings {
  rank: number
  playerId: string
  playerName: string
  wallet: string
  wins: number
  losses: number
  points: number
  earnings: number
}

export class TournamentManager {
  private tournaments: Map<string, Tournament> = new Map()
  private standings: Map<string, TournamentStandings[]> = new Map()

  /**
   * Create a new tournament
   */
  createTournament(
    name: string,
    startDate: number,
    endDate: number,
    totalPrizePool: number,
    maxPlayers: number
  ): Tournament {
    const tournament: Tournament = {
      id: `tournament_${Date.now()}`,
      name,
      status: 'upcoming',
      startDate,
      endDate,
      totalPrizePool,
      maxPlayers,
      players: new Set(),
      rounds: [],
      createdAt: Date.now(),
    }

    this.tournaments.set(tournament.id, tournament)
    this.standings.set(tournament.id, [])
    return tournament
  }

  /**
   * Register player for tournament
   */
  registerPlayer(tournamentId: string, playerId: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return false
    if (tournament.players.size >= tournament.maxPlayers) return false
    if (tournament.status !== 'upcoming') return false

    tournament.players.add(playerId)
    return true
  }

  /**
   * Start tournament
   */
  startTournament(tournamentId: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return false
    if (tournament.status !== 'upcoming') return false

    tournament.status = 'active'
    this.createInitialRounds(tournament)
    return true
  }

  /**
   * Create initial tournament rounds (brackets)
   */
  private createInitialRounds(tournament: Tournament): void {
    const players = Array.from(tournament.players)
    const roundNumber = 1

    const round: TournamentRound = {
      roundNumber,
      startTime: Date.now(),
      participants: players,
      winners: [],
      status: 'in_progress',
    }

    tournament.rounds.push(round)
  }

  /**
   * Record round result
   */
  recordRoundResult(
    tournamentId: string,
    roundNumber: number,
    winners: string[]
  ): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return false

    const round = tournament.rounds.find((r) => r.roundNumber === roundNumber)
    if (!round) return false

    round.winners = winners
    round.status = 'completed'
    round.endTime = Date.now()

    // Create next round if needed
    if (winners.length > 1) {
      const nextRound: TournamentRound = {
        roundNumber: roundNumber + 1,
        startTime: Date.now(),
        participants: winners,
        winners: [],
        status: 'pending',
      }
      tournament.rounds.push(nextRound)
    } else {
      // Tournament completed
      tournament.status = 'completed'
    }

    return true
  }

  /**
   * Update player standings
   */
  updateStandings(
    tournamentId: string,
    playerId: string,
    won: boolean,
    prizeEarned: number = 0
  ): void {
    let standings = this.standings.get(tournamentId) || []
    let standing = standings.find((s) => s.playerId === playerId)

    if (!standing) {
      standing = {
        rank: standings.length + 1,
        playerId,
        playerName: '',
        wallet: '',
        wins: 0,
        losses: 0,
        points: 0,
        earnings: 0,
      }
      standings.push(standing)
    }

    if (won) {
      standing.wins += 1
      standing.points += 3
    } else {
      standing.losses += 1
      standing.points += 0
    }

    standing.earnings += prizeEarned

    // Sort by points
    standings.sort((a, b) => b.points - a.points)
    standings = standings.map((s, index) => ({ ...s, rank: index + 1 }))

    this.standings.set(tournamentId, standings)
  }

  /**
   * Get tournament standings
   */
  getStandings(tournamentId: string): TournamentStandings[] {
    return this.standings.get(tournamentId) || []
  }

  /**
   * Get tournament details
   */
  getTournament(tournamentId: string): Tournament | undefined {
    return this.tournaments.get(tournamentId)
  }

  /**
   * Get all tournaments
   */
  getAllTournaments(): Tournament[] {
    return Array.from(this.tournaments.values())
  }

  /**
   * Get active tournaments
   */
  getActiveTournaments(): Tournament[] {
    return Array.from(this.tournaments.values()).filter((t) => t.status === 'active')
  }
}

export default TournamentManager
