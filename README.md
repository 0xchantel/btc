# I CALL ON - Crypto Word Game 🎮

> **The Ultimate Blockchain-Powered Word Game** | Call a Letter → Name a Word → Win XLM

[![GitHub Stars](https://img.shields.io/github/stars/0xchantel/btc?style=social)](https://github.com/0xchantel/btc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black)](https://nextjs.org)
[![Stellar Soroban](https://img.shields.io/badge/Powered%20by-Stellar%20Soroban-blue)](https://soroban.stellar.org)

---

## 🎯 Overview

**I CALL ON** is a revolutionary multiplayer word game that combines classic gameplay with cryptocurrency rewards. Players compete in real-time, and winners earn **XLM** (Stellar Lumens) directly to their wallets.

### Game Mechanics
1. **One player calls a letter** (A-Z)
2. **All players race to name:**
   - 📍 Place (country, city)
   - 🦁 Animal
   - 🎁 Object
   - 👤 Name
   - 🎨 Color
3. **First correct answers win XLM**
4. **Compete globally on leaderboards**

---

## ✨ Features

### 🎮 Core Gameplay
- ⚡ Real-time multiplayer (2-10 players)
- ⏱️ 60-second rounds with countdown timer
- 🔐 Blockchain-verified answers
- 💰 Instant XLM rewards to winners
- 🌍 Global matchmaking & tournaments

### 🏆 Competitive Features
- 🏅 Global leaderboards (All-Time, Monthly, Weekly)
- 🎖️ Tournament system with brackets
- 🎯 Achievement badges & NFT rewards
- 🔥 Win streak tracking
- 📊 Player statistics & analytics

### 💎 Rewards System
- 💵 Direct XLM payouts to Stellar wallets
- 🎁 Daily login bonuses (0.5 XLM)
- 👥 Referral rewards (1 XLM per referral)
- 🏆 Tournament bonuses (10+ XLM)
- 🎖️ Achievement rewards
- 🖼️ Exclusive NFT collectibles

### 🔧 Technical Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Node.js, Express, PostgreSQL
- **Blockchain:** Stellar Soroban (Smart Contracts)
- **Wallet:** Freighter (Stellar Wallet)
- **Multiplayer:** WebSocket real-time sync
- **Verification:** AI-powered answer validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)
- Freighter Wallet (browser extension)

### Installation

```bash
# Clone repository
git clone https://github.com/0xchantel/btc.git
cd btc

# Setup development environment
bash scripts/setup.sh

# Start development server
npm run dev
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 📡 Multiplayer: ws://localhost:8080
- 🗄️ Database: localhost:5432

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

---

## 📦 Project Structure

```
btc/
├── 📁 app/
│   ├── game/page.tsx          # Main game interface
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
│
├── 📁 components/
│   ├── GameComponents/        # Game UI (Letter, Answer, Results)
│   ├── Wallet/                # Wallet connection
│   ├── Leaderboard/           # Rankings display
│   └── PlayerStats/           # User statistics
│
├── 📁 contexts/
│   ├── GameContext.tsx        # Game state management
│   └── WalletContext.tsx      # Wallet state management
│
├── 📁 lib/
│   ├── gameLogic.ts           # Game engine
│   ├── sorobanIntegration.ts  # Blockchain interaction
│   ├── walletManager.ts       # Wallet management
│   ├── answerVerification.ts  # Answer validation
│   ├── multiplayerService.ts  # WebSocket client
│   ├── tournamentManager.ts   # Tournament logic
│   ├── achievementSystem.ts   # Achievements & rewards
│   └── types.ts               # TypeScript definitions
│
├── 📁 server/
│   ├── multiplayer-server.ts  # WebSocket server
│   └── Dockerfile             # Server container
│
├── 📁 contracts/
│   ├── ICallOn.rs             # Soroban smart contract
│   └── Cargo.toml             # Contract dependencies
│
├── 📁 database/
│   ├── schema.sql             # Database structure
│   ├── client.ts              # Database client
│   └── migrations/            # Database migrations
│
├── 📁 scripts/
│   ├── setup.sh               # Development setup
│   ├── deploy.sh              # Production deployment
│   ├── migrate.sh             # Database migration
│   ├── deploy-contract.sh     # Smart contract deployment
│   ├── docker-build.sh        # Docker image build
│   ├── dev.sh                 # Local dev startup
│   └── test.sh                # Run all tests
│
├── Dockerfile                 # Application container
├── docker-compose.yml         # Multi-container setup
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
└── README.md                  # This file
```

---

## 🎮 Game Flow

```
┌─────────────────────────────────────────┐
│  Player Connects Wallet (Freighter)     │
│  ✅ Ready to play                        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Select Letter (A-Z)                    │
│  ⏱️ 60-second countdown starts            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Players Submit Answers                 │
│  🎯 Place, Animal, Object, Name, Color  │
│  📡 Real-time multiplayer sync          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Answer Verification (AI + Blockchain)  │
│  ✓ Levenshtein distance matching        │
│  ✓ Database validation                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Determine Category Winners             │
│  🏆 First correct answer per category   │
│  💰 Soroban contract distributes XLM    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Display Results                        │
│  📊 Statistics & rewards                │
│  🎖️ Check achievements unlocked         │
└─────────────────────────────────────────┘
```

---

## 🌐 API Endpoints

### Game API
- `POST /api/game/start` - Start new round
- `POST /api/game/answer` - Submit answer
- `GET /api/game/results/{roundId}` - Get round results
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/player/stats` - Get player statistics

### Wallet API
- `POST /api/wallet/connect` - Connect wallet
- `GET /api/wallet/balance` - Get XLM balance
- `POST /api/wallet/verify` - Verify wallet signature

### Tournament API
- `POST /api/tournaments/create` - Create tournament
- `POST /api/tournaments/{id}/join` - Join tournament
- `GET /api/tournaments/active` - Get active tournaments
- `GET /api/tournaments/{id}/standings` - Tournament standings

---

## 🔐 Blockchain Integration

### Stellar Soroban Smart Contract

The contract handles:
- ✅ Game round initialization
- ✅ Prize distribution (XLM transfers)
- ✅ Leaderboard updates
- ✅ Achievement tracking
- ✅ Transaction verification

**Key Functions:**
```rust
pub fn create_round(env, round_id, letter, players, prize_pool)
pub fn verify_answers(env, round_id, answers)
pub fn distribute_prizes(env, round_id, recipients)
pub fn get_leaderboard(env, limit)
pub fn get_player_stats(env, player)
```

**Deploy Contract:**
```bash
bash scripts/deploy-contract.sh testnet
```

---

## 📊 Database Schema

### Key Tables
- **players** - User profiles & stats
- **game_rounds** - Round history
- **player_answers** - Submitted answers
- **round_winners** - Winners per category
- **tournaments** - Tournament details
- **achievements** - Achievement definitions
- **leaderboard_cache** - Cached rankings

**Initialize Database:**
```bash
bash scripts/migrate.sh
```

---

## 🏆 Tournaments

### Tournament Structure
1. **Registration Phase** - Players join (upcoming)
2. **Active Phase** - Rounds are played
3. **Completion Phase** - Winners determined

### Prize Distribution
- 🥇 1st Place: 50% of pool
- 🥈 2nd Place: 30% of pool
- 🥉 3rd Place: 20% of pool

### Leaderboard Calculations
- **Points:** 3 per win, 0 per loss
- **Earnings:** Total XLM won
- **Win Rate:** (Wins / Total Rounds) × 100

---

## 🎖️ Achievement System

### Tier 1 (Easy)
- 🏅 First Victory (1 XLM)
- 📍 World Traveler - 10 Place wins
- 🦁 Zoo Master - 10 Animal wins

### Tier 2 (Medium)
- 🔥 On a Roll - 10 total wins (5 XLM)
- ⚡ Unstoppable - 5-game win streak (10 XLM)
- 💰 Crypto Millionaire - 100 XLM earned

### Tier 3 (Hard)
- 👑 Champion - 100 wins (50 XLM + NFT)
- ✨ Legendary - 10-game win streak (25 XLM + NFT)

---

## 🚀 Deployment

### Production Deployment

```bash
# Set environment variables
export DATABASE_URL="postgresql://user:pass@host/icall_on"
export SOROBAN_CONTRACT_ID="CAAAA..."
export SOROBAN_ACCOUNT="GAAAA..."

# Deploy everything
bash scripts/deploy.sh
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/icall_on

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_SERVER_URL=https://horizon-testnet.stellar.org

# Smart Contract
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=CAAAA...
SOROBAN_ACCOUNT=GAAAA...

# Multiplayer
NEXT_PUBLIC_MULTIPLAYER_URL=ws://localhost:8080

# API Keys (optional)
NEXT_PUBLIC_API_KEY=...
API_SECRET=...
```

---

## 🧪 Testing

```bash
# Run all tests
bash scripts/test.sh

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🌍 Multiplayer

### WebSocket Connection

```typescript
const multiplayer = new MultiplayerService('ws://localhost:8080')
await multiplayer.connect(playerId)

// Join session
multiplayer.joinSession(sessionId, player)

// Submit answer
multiplayer.submitAnswer(playerId, 'place', 'Brazil', roundId)

// Listen for events
multiplayer.on('player_joined_session', (data) => {
  console.log(`${data.playerName} joined! Total: ${data.totalPlayers}`)
})
```

### Message Types
- `player_joined` - New player connected
- `answer_submitted` - Player submitted answer
- `round_ended` - Round completed
- `chat` - Chat message
- `game_state_update` - Game state changed

---

## 🔍 Answer Verification

### Algorithm
1. **Format Check** - Trim, lowercase, validate letter
2. **Exact Match** - Check against database
3. **Fuzzy Match** - Levenshtein distance (>80%)
4. **Variations** - Plural forms, common misspellings
5. **Confidence Score** - 0-100 accuracy rating

### Supported Categories
- **Place:** 50+ countries & cities per letter
- **Animal:** 100+ animals per letter
- **Object:** 100+ objects per letter
- **Name:** 100+ names per letter
- **Color:** 100+ colors per letter

---

## 📱 Mobile Support

✅ Fully responsive design
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

✅ Touch-optimized buttons
✅ Mobile-first CSS
✅ Progressive Web App ready

---

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Commit History

```
✨ [1] Initial project setup with Next.js frontend
🎨 [2] Create home page with hero section and features
🎮 [3] Add game components (letter selector, answer input)
💰 [4] Implement wallet connection (Freighter integration)
🏆 [5] Create leaderboard component
📊 [6] Add player statistics dashboard
🎯 [7] Implement game logic engine
⛓️  [8] Add Stellar Soroban smart contract
👛 [9] Create wallet manager
📝 [10] Add TypeScript type definitions
🎮 [11] Create game context (state management)
💼 [12] Add wallet context provider
🔐 [13] Implement answer verification service
📡 [14] Create multiplayer WebSocket service
🏅 [15] Add tournament management system
🎖️  [16] Implement achievement & rewards system
🗄️  [17] Create PostgreSQL database schemas
📚 [18] Implement database client
🚀 [19] Add deployment scripts & Docker setup
📖 [20] Rewrite README with comprehensive documentation
```

---

## 📄 License

MIT License © 2024 I CALL ON

---

## 🙏 Acknowledgments

- **Stellar** - Blockchain infrastructure
- **Soroban** - Smart contract platform
- **Freighter** - Wallet integration
- **Next.js** - React framework
- **PostgreSQL** - Database

---

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/0xchantel/btc/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/0xchantel/btc/discussions)
- 📧 Email: support@icall-on.dev
- 🐦 Twitter: [@ICallOnGame](https://twitter.com/ICallOnGame)

---

## 🎯 Roadmap

- [x] Core game mechanics
- [x] Multiplayer support
- [x] Blockchain integration
- [x] Leaderboards & tournaments
- [ ] Mobile app (React Native)
- [ ] Voice chat integration
- [ ] Mainnet deployment
- [ ] Game NFT marketplace
- [ ] Governance token ($CALL)
- [ ] DAO treasury system

---

**Made with ❤️ by the I CALL ON Team**

⭐ Star this repository if you enjoy the project!
