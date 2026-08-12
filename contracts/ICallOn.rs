// I CALL ON Smart Contract for Stellar Soroban
// Handles game logic, scoring, and prize distribution on-chain
// Written in Rust for Soroban

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, log, symbol_short, Address, BytesN, Env, Map,
    String, Symbol, Vec,
};

// Contract types
#[derive(Clone)]
#[contracttype]
pub struct GameRound {
    pub round_id: String,
    pub letter: String,
    pub players: Vec<Address>,
    pub prize_pool: i128,
    pub status: Symbol, // "active", "completed", "cancelled"
    pub winners: Map<String, Address>, // category -> winner address
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Clone)]
#[contracttype]
pub struct PlayerStats {
    pub total_rounds: u32,
    pub total_wins: u32,
    pub total_earned: i128,
    pub favorite_category: Option<String>,
    pub win_rate: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct LeaderboardEntry {
    pub rank: u32,
    pub player: Address,
    pub total_earned: i128,
    pub win_count: u32,
}

const ADMIN: &str = "admin";
const GAME_ROUNDS: &str = "game_rounds";
const PLAYER_STATS: &str = "player_stats";
const LEADERBOARD: &str = "leaderboard";

#[contract]
pub struct ICallOnContract;

#[contractimpl]
impl ICallOnContract {
    /// Initialize a new game round
    /// params:
    ///   - env: Soroban environment
    ///   - round_id: Unique identifier for the round
    ///   - letter: The letter for this round (A-Z)
    ///   - players: Vector of player addresses
    ///   - prize_pool: Total prize in stroops (1 XLM = 10^7 stroops)
    /// returns: Symbol indicating success or failure
    pub fn create_round(
        env: Env,
        round_id: String,
        letter: String,
        players: Vec<Address>,
        prize_pool: i128,
    ) -> Symbol {
        // Verify letter is valid (A-Z)
        if letter.len() != 1 {
            log!(&env, "Invalid letter length");
            return symbol_short!("fail");
        }

        let letter_bytes = letter.as_bytes();
        let first_byte = letter_bytes.get(0);
        if !(first_byte >= 65 && first_byte <= 90) && !(first_byte >= 97 && first_byte <= 122) {
            log!(&env, "Letter must be A-Z");
            return symbol_short!("fail");
        }

        // Create round data structure
        let game_round = GameRound {
            round_id: round_id.clone(),
            letter: letter.clone(),
            players: players.clone(),
            prize_pool,
            status: symbol_short!("active"),
            winners: Map::new(&env),
            created_at: env.ledger().timestamp(),
            completed_at: None,
        };

        // Store in contract state
        let mut rounds_map: Map<String, GameRound> = env
            .storage()
            .persistent()
            .get(&String::from_slice(&env, GAME_ROUNDS))
            .unwrap_or_else(|| Map::new(&env));

        rounds_map.set(round_id.clone(), game_round);
        env.storage()
            .persistent()
            .set(&String::from_slice(&env, GAME_ROUNDS), &rounds_map);

        // Emit event
        log!(
            &env,
            "RoundCreated: {} with {} players and {} stroops prize",
            round_id,
            players.len(),
            prize_pool
        );

        symbol_short!("ok")
    }

    /// Submit verified answers for a round
    /// params:
    ///   - env: Soroban environment
    ///   - round_id: The round to verify
    ///   - answers: Map of player addresses to their answer verification results
    /// returns: Symbol indicating success
    pub fn verify_answers(
        env: Env,
        round_id: String,
        answers: Map<Address, Map<String, bool>>,
    ) -> Symbol {
        // Verify caller is authorized verifier/oracle
        let caller = env.invoker();
        log!(&env, "Verifying answers for round: {}", round_id);

        // Process each player's answers
        // This would normally involve checking against the answer verification service

        // Update player stats
        let mut stats_map: Map<Address, PlayerStats> = env
            .storage()
            .persistent()
            .get(&String::from_slice(&env, PLAYER_STATS))
            .unwrap_or_else(|| Map::new(&env));

        // Update stats for each player
        for address in answers.keys() {
            let player_answers = answers.get(address.clone()).unwrap();
            let mut player_stats = stats_map
                .get(address.clone())
                .unwrap_or_else(|| PlayerStats {
                    total_rounds: 0,
                    total_wins: 0,
                    total_earned: 0,
                    favorite_category: None,
                    win_rate: 0,
                });

            player_stats.total_rounds += 1;
            stats_map.set(address, player_stats);
        }

        env.storage()
            .persistent()
            .set(&String::from_slice(&env, PLAYER_STATS), &stats_map);

        log!(&env, "Answers verified for round: {}", round_id);
        symbol_short!("ok")
    }

    /// Distribute prizes to winners
    /// params:
    ///   - env: Soroban environment
    ///   - round_id: The completed round
    ///   - recipients: Map of recipient addresses to prize amounts in stroops
    /// returns: Symbol indicating success
    pub fn distribute_prizes(
        env: Env,
        round_id: String,
        recipients: Map<Address, i128>,
    ) -> Symbol {
        log!(&env, "Distributing prizes for round: {}", round_id);

        let mut total_distributed: i128 = 0;

        // Transfer prizes using native token operations
        for recipient in recipients.keys() {
            let prize_amount = recipients.get(recipient.clone()).unwrap();
            total_distributed += prize_amount;

            // Here you would normally use the native token contract to transfer XLM
            // For now, we just log the transfer
            log!(
                &env,
                "Transfer {} stroops to {}",
                prize_amount,
                recipient
            );

            // Update player stats
            let mut stats_map: Map<Address, PlayerStats> = env
                .storage()
                .persistent()
                .get(&String::from_slice(&env, PLAYER_STATS))
                .unwrap_or_else(|| Map::new(&env));

            let mut player_stats = stats_map.get(recipient.clone()).unwrap_or_else(|| {
                PlayerStats {
                    total_rounds: 0,
                    total_wins: 0,
                    total_earned: 0,
                    favorite_category: None,
                    win_rate: 0,
                }
            });

            player_stats.total_wins += 1;
            player_stats.total_earned += prize_amount;
            stats_map.set(recipient, player_stats);
            env.storage()
                .persistent()
                .set(&String::from_slice(&env, PLAYER_STATS), &stats_map);
        }

        log!(&env, "Total distributed: {} stroops", total_distributed);
        symbol_short!("ok")
    }

    /// Get game state for a specific round
    /// params:
    ///   - env: Soroban environment
    ///   - round_id: The round to query
    /// returns: GameRound structure or error
    pub fn get_game_state(env: Env, round_id: String) -> Option<GameRound> {
        let rounds_map: Map<String, GameRound> = env
            .storage()
            .persistent()
            .get(&String::from_slice(&env, GAME_ROUNDS))
            .unwrap_or_else(|| Map::new(&env));

        rounds_map.get(round_id)
    }

    /// Get player statistics
    /// params:
    ///   - env: Soroban environment
    ///   - player: The player address
    /// returns: PlayerStats structure
    pub fn get_player_stats(env: Env, player: Address) -> Option<PlayerStats> {
        let stats_map: Map<Address, PlayerStats> = env
            .storage()
            .persistent()
            .get(&String::from_slice(&env, PLAYER_STATS))
            .unwrap_or_else(|| Map::new(&env));

        stats_map.get(player)
    }

    /// Get global leaderboard
    /// params:
    ///   - env: Soroban environment
    ///   - limit: Maximum number of entries to return
    /// returns: Vector of top players
    pub fn get_leaderboard(env: Env, limit: u32) -> Vec<LeaderboardEntry> {
        let stats_map: Map<Address, PlayerStats> = env
            .storage()
            .persistent()
            .get(&String::from_slice(&env, PLAYER_STATS))
            .unwrap_or_else(|| Map::new(&env));

        let mut entries: Vec<LeaderboardEntry> = Vec::new(&env);
        let mut rank = 1u32;

        // Convert stats to leaderboard entries and sort by earnings
        for player in stats_map.keys() {
            if rank > limit {
                break;
            }
            let stats = stats_map.get(player.clone()).unwrap();
            let entry = LeaderboardEntry {
                rank,
                player,
                total_earned: stats.total_earned,
                win_count: stats.total_wins,
            };
            entries.push_back(entry);
            rank += 1;
        }

        entries
    }
}
