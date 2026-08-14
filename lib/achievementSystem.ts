/**
 * Rewards and Achievements System
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: 'wins' | 'earnings' | 'rounds' | 'category'
  category?: string
  rewardXLM?: number
  rewardNFT?: string
}

export interface PlayerRewards {
  playerId: string
  totalEarnings: number
  achievements: string[] // achievement IDs
  nfts: string[] // NFT IDs
  streaks: {
    currentWinStreak: number
    longestWinStreak: number
    currentPlayingStreak: number // days
  }
  bonuses: {
    dailyLoginBonus: number
    referralBonus: number
    tournamentBonus: number
  }
}

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map()
  private playerRewards: Map<string, PlayerRewards> = new Map()

  constructor() {
    this.initializeAchievements()
  }

  /**
   * Initialize default achievements
   */
  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        requirement: 1,
        type: 'wins',
        rewardXLM: 1,
      },
      {
        id: 'ten_wins',
        name: 'On a Roll',
        description: 'Achieve 10 wins',
        icon: '🔥',
        requirement: 10,
        type: 'wins',
        rewardXLM: 5,
      },
      {
        id: 'hundred_wins',
        name: 'Champion',
        description: 'Achieve 100 wins',
        icon: '👑',
        requirement: 100,
        type: 'wins',
        rewardXLM: 50,
        rewardNFT: 'champion_nft',
      },
      {
        id: 'hundred_xlm_earned',
        name: 'Crypto Millionaire',
        description: 'Earn 100 XLM',
        icon: '💰',
        requirement: 100,
        type: 'earnings',
        rewardXLM: 10,
      },
      {
        id: 'place_specialist',
        name: 'World Traveler',
        description: 'Win 10 rounds in Place category',
        icon: '🗺️',
        requirement: 10,
        type: 'category',
        category: 'place',
        rewardXLM: 5,
      },
      {
        id: 'animal_specialist',
        name: 'Zoo Master',
        description: 'Win 10 rounds in Animal category',
        icon: '🦁',
        requirement: 10,
        type: 'category',
        category: 'animal',
        rewardXLM: 5,
      },
      {
        id: 'object_specialist',
        name: 'Collector',
        description: 'Win 10 rounds in Object category',
        icon: '🎁',
        requirement: 10,
        type: 'category',
        category: 'object',
        rewardXLM: 5,
      },
      {
        id: 'name_specialist',
        name: 'Name Expert',
        description: 'Win 10 rounds in Name category',
        icon: '📛',
        requirement: 10,
        type: 'category',
        category: 'name',
        rewardXLM: 5,
      },
      {
        id: 'color_specialist',
        name: 'Artist',
        description: 'Win 10 rounds in Color category',
        icon: '🎨',
        requirement: 10,
        type: 'category',
        category: 'color',
        rewardXLM: 5,
      },
      {
        id: 'win_streak_5',
        name: 'Unstoppable',
        description: 'Achieve a 5-game win streak',
        icon: '⚡',
        requirement: 5,
        type: 'wins',
        rewardXLM: 10,
      },
      {
        id: 'win_streak_10',
        name: 'Legendary',
        description: 'Achieve a 10-game win streak',
        icon: '✨',
        requirement: 10,
        type: 'wins',
        rewardXLM: 25,
        rewardNFT: 'legendary_nft',
      },
    ]

    defaultAchievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  /**
   * Get or create player rewards
   */
  getPlayerRewards(playerId: string): PlayerRewards {
    if (!this.playerRewards.has(playerId)) {
      this.playerRewards.set(playerId, {
        playerId,
        totalEarnings: 0,
        achievements: [],
        nfts: [],
        streaks: {
          currentWinStreak: 0,
          longestWinStreak: 0,
          currentPlayingStreak: 0,
        },
        bonuses: {
          dailyLoginBonus: 0,
          referralBonus: 0,
          tournamentBonus: 0,
        },
      })
    }
    return this.playerRewards.get(playerId)!
  }

  /**
   * Award XLM to player
   */
  awardXLM(playerId: string, amount: number): void {
    const rewards = this.getPlayerRewards(playerId)
    rewards.totalEarnings += amount
  }

  /**
   * Update win streak
   */
  updateWinStreak(playerId: string, won: boolean): void {
    const rewards = this.getPlayerRewards(playerId)

    if (won) {
      rewards.streaks.currentWinStreak += 1
      if (rewards.streaks.currentWinStreak > rewards.streaks.longestWinStreak) {
        rewards.streaks.longestWinStreak = rewards.streaks.currentWinStreak
      }
    } else {
      rewards.streaks.currentWinStreak = 0
    }
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements(playerId: string, stats: any): string[] {
    const rewards = this.getPlayerRewards(playerId)
    const newAchievements: string[] = []

    for (const [achievementId, achievement] of this.achievements.entries()) {
      // Skip if already unlocked
      if (rewards.achievements.includes(achievementId)) {
        continue
      }

      let unlocked = false

      switch (achievement.type) {
        case 'wins':
          if (stats.totalWins >= achievement.requirement) {
            unlocked = true
          }
          break
        case 'earnings':
          if (rewards.totalEarnings >= achievement.requirement) {
            unlocked = true
          }
          break
        case 'category':
          if (stats.categoryWins?.[achievement.category] >= achievement.requirement) {
            unlocked = true
          }
          break
      }

      if (unlocked) {
        rewards.achievements.push(achievementId)
        newAchievements.push(achievementId)

        // Award bonus XLM if applicable
        if (achievement.rewardXLM) {
          this.awardXLM(playerId, achievement.rewardXLM)
        }

        // Award NFT if applicable
        if (achievement.rewardNFT) {
          rewards.nfts.push(achievement.rewardNFT)
        }
      }
    }

    return newAchievements
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values())
  }

  /**
   * Get player achievements
   */
  getPlayerAchievements(playerId: string): Achievement[] {
    const rewards = this.getPlayerRewards(playerId)
    return rewards.achievements
      .map((id) => this.achievements.get(id))
      .filter((a): a is Achievement => !!a)
  }

  /**
   * Apply daily login bonus
   */
  applyDailyLoginBonus(playerId: string): number {
    const rewards = this.getPlayerRewards(playerId)
    const bonus = 0.5 // 0.5 XLM per day
    rewards.bonuses.dailyLoginBonus += bonus
    this.awardXLM(playerId, bonus)
    rewards.streaks.currentPlayingStreak += 1
    return bonus
  }

  /**
   * Apply referral bonus
   */
  applyReferralBonus(playerId: string, referrerCount: number): number {
    const rewards = this.getPlayerRewards(playerId)
    const bonus = referrerCount * 1 // 1 XLM per referral
    rewards.bonuses.referralBonus += bonus
    this.awardXLM(playerId, bonus)
    return bonus
  }

  /**
   * Apply tournament bonus
   */
  applyTournamentBonus(playerId: string, placement: number): number {
    const rewards = this.getPlayerRewards(playerId)
    const bonusMap: Record<number, number> = {
      1: 10, // 1st place: 10 XLM
      2: 5, // 2nd place: 5 XLM
      3: 2.5, // 3rd place: 2.5 XLM
    }
    const bonus = bonusMap[placement] || 0
    rewards.bonuses.tournamentBonus += bonus
    this.awardXLM(playerId, bonus)
    return bonus
  }
}

export default AchievementSystem
