/**
 * Database Schemas for I CALL ON
 * PostgreSQL schemas for persistent data storage
 */

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(56) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_earnings DECIMAL(20, 7) DEFAULT 0,
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  current_playing_streak INTEGER DEFAULT 0,
  total_rounds_played INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  favorite_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_played_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_total_earnings ON players(total_earnings DESC);

-- Game Rounds Table
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id VARCHAR(255) UNIQUE NOT NULL,
  letter CHAR(1) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  prize_pool DECIMAL(20, 7) NOT NULL,
  total_distributed DECIMAL(20, 7) DEFAULT 0,
  player_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  soroban_tx_id VARCHAR(255),
  metadata JSONB
);

CREATE INDEX idx_rounds_letter ON game_rounds(letter);
CREATE INDEX idx_rounds_status ON game_rounds(status);
CREATE INDEX idx_rounds_created_at ON game_rounds(created_at DESC);

-- Player Answers Table
CREATE TABLE IF NOT EXISTS player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id VARCHAR(255) NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id),
  category VARCHAR(50) NOT NULL,
  answer VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  verification_confidence DECIMAL(5, 2),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  FOREIGN KEY (round_id) REFERENCES game_rounds(round_id)
);

CREATE INDEX idx_answers_round ON player_answers(round_id);
CREATE INDEX idx_answers_player ON player_answers(player_id);
CREATE INDEX idx_answers_category ON player_answers(category);

-- Round Winners Table
CREATE TABLE IF NOT EXISTS round_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  winner_id UUID NOT NULL REFERENCES players(id),
  prize_amount DECIMAL(20, 7) NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  soroban_tx_id VARCHAR(255),
  FOREIGN KEY (round_id) REFERENCES game_rounds(round_id),
  UNIQUE(round_id, category)
);

CREATE INDEX idx_winners_round ON round_winners(round_id);
CREATE INDEX idx_winners_player ON round_winners(winner_id);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_prize_pool DECIMAL(20, 7) NOT NULL,
  max_players INTEGER NOT NULL,
  player_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);

-- Tournament Players Table
CREATE TABLE IF NOT EXISTS tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  player_id UUID NOT NULL REFERENCES players(id),
  rank INTEGER,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  earnings DECIMAL(20, 7) DEFAULT 0,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, player_id)
);

CREATE INDEX idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_player ON tournament_players(player_id);

-- Tournament Rounds Table
CREATE TABLE IF NOT EXISTS tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id),
  round_number INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(tournament_id, round_number)
);

CREATE INDEX idx_tournament_rounds_tournament ON tournament_rounds(tournament_id);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  requirement INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  reward_xlm DECIMAL(10, 2),
  reward_nft VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_type ON achievements(type);

-- Player Achievements Table
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_achievement ON player_achievements(achievement_id);

-- Leaderboard Cache Table
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  rank INTEGER NOT NULL,
  timeframe VARCHAR(50) NOT NULL,
  total_earnings DECIMAL(20, 7),
  total_wins INTEGER,
  win_rate DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, timeframe)
);

CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(timeframe, rank);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_player ON chat_messages(player_id);

-- NFT Ownership Table
CREATE TABLE IF NOT EXISTS nft_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  nft_id VARCHAR(255) NOT NULL,
  nft_name VARCHAR(255) NOT NULL,
  contract_address VARCHAR(56),
  token_id VARCHAR(255),
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, nft_id)
);

CREATE INDEX idx_nft_player ON nft_ownership(player_id);

-- Referral System Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES players(id),
  referred_id UUID NOT NULL REFERENCES players(id),
  bonus_earned DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- Transaction History Table
CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 7) NOT NULL,
  description TEXT,
  round_id VARCHAR(255),
  tournament_id VARCHAR(255),
  soroban_tx_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_transaction_player ON transaction_history(player_id);
CREATE INDEX idx_transaction_type ON transaction_history(type);
CREATE INDEX idx_transaction_status ON transaction_history(status);

-- Category Statistics Table
CREATE TABLE IF NOT EXISTS category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  category VARCHAR(50) NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, category)
);

CREATE INDEX idx_category_stats_player ON category_stats(player_id);
CREATE INDEX idx_category_stats_category ON category_stats(category);
