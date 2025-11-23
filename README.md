# FanFi - Chiliz Fan Engagement Platform

A comprehensive Web3 fan engagement application that combines sports fandom, social interaction, identity verification, and DeFi features. Built for the Chiliz hackathon.

## 🌟 Features

### Core Features
- **Self.xyz Identity Verification** - Privacy-preserving nationality verification using zero-knowledge proofs
- **Country-Specific Match Discovery** - Fetch football matches based on verified nationality
- **Chiliz Fan Tokens (ERC-20)** - Earn and stake team-specific fan tokens
- **Loyalty Scoring Engine** - Chiliz-native on-chain + off-chain scoring system
- **Watch Rooms** - Real-time chat and polls during live matches
- **Gamification & Rewards** - Earn tokens through engagement (watch, chat, vote, check-in)
- **Staking & Yield** - Stake fan tokens with loyalty-based APY multipliers (up to 3x)

### Social Experience
- Real-time chat in watch rooms
- Live polls and voting
- Leaderboards and fan rankings
- Streak tracking and bonuses

### DeFi Layer
- ERC-20 fan token staking
- Loyalty-based reward multipliers
- Automated reward distribution
- Yield vaults with boosted APY

## 🏗️ Architecture

### Frontend
- **Next.js** - React framework with App Router
- **Wagmi & RainbowKit** - Wallet connection and Chiliz chain integration
- **Tailwind CSS** - Styling with custom design system
- **shadcn/ui** - UI component library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time subscriptions
- **TheSportsDB API** - Sports match data
- **Chiliz RPC** - On-chain data for loyalty scoring

### Smart Contracts
- **FanTokenStaking.sol** - Staking contract with loyalty multipliers
- Built with Solidity ^0.8.20
- OpenZeppelin contracts for security

### External Integrations
- **Self.xyz** - Identity verification (demo mode for hackathon)
- **Chiliz Chain** - Mainnet (88888) and Spicy Testnet (88882)
- **TheSportsDB** - Free sports API for match data



## 📱 User Journey

1. **Connect Wallet** - Connect via RainbowKit (supports MetaMask, WalletConnect, etc.)
2. **Verify Identity** - Use Self.xyz to verify nationality (demo mode available)
3. **Choose Team** - Select your favorite team
4. **Explore Matches** - Browse country-specific matches at `/matches`
5. **Join Watch Room** - Click on any match to join the watch room at `/watch-room/[matchId]`
6. **Engage & Earn**:
   - Chat with other fans (+5 tokens per message)
   - Vote in polls (+20 tokens)
   - Watch for 10+ minutes (+10 tokens)
   - Check in at stadium (+1000 tokens)
7. **Stake Tokens** - Visit `/staking` to stake tokens and earn boosted rewards
8. **Track Progress** - View dashboard, leaderboard, and profile

## 🎯 Demo Features


- **Self.xyz Verification**: Simplified flow (production would use actual Self SDK)
- **Match Data**: Uses demo data + TheSportsDB API
- **Staking Contracts**: UI ready, contracts need deployment
- **Tokens**: Demo balances (production would read from actual CAP-20 contracts)



## 🏆 Reward System

Actions and their rewards:
- Join watch room: **+50 tokens, +25 points**
- Chat message: **+5 tokens, +2 points**
- Poll vote: **+20 tokens, +10 points**
- Watch 10 minutes: **+10 tokens, +5 points**
- Stadium check-in: **+1000 tokens, +500 points**
- Daily login: **+25 tokens, +10 points**
- 7-day streak: **+100 tokens, +50 points**

## 📊 Loyalty Scoring

The loyalty engine calculates scores from:

### On-Chain Data (via Chiliz RPC)
- Token holdings (logarithmic scale)
- Time-weighted holdings
- Transaction frequency
- Staking participation

### Off-Chain Data (app activity)
- Watch rooms joined
- Messages posted
- Polls voted
- Check-ins completed
- Watch time

**Multiplier Impact**: Higher loyalty = higher staking APY (1.0x to 3.0x)

## 🔐 Security

- **Self.xyz**: Zero-knowledge proofs for nationality verification
- **RLS Policies**: Row-level security on all Supabase tables
- **Wallet-based Auth**: No passwords, wallet signatures only
- **Rate Limiting**: Cooldowns on reward actions


## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Web3**: Wagmi, Viem, RainbowKit
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Blockchain**: Chiliz Chain (Mainnet & Spicy Testnet)
- **APIs**: TheSportsDB, Self.xyz, Chiliz RPC
- **Smart Contracts**: Solidity, OpenZeppelin


## 📄 License

MIT License - feel free to use for hackathons and learning

## 🙏 Acknowledgments

- **Chiliz** - For the amazing blockchain for sports
- **Self.xyz** - For privacy-preserving identity
- **TheSportsDB** - For free sports data API
- **Supabase** - For the excellent backend platform
- **RainbowKit** - For beautiful wallet connection UX

## 💬 Support

For questions or issues, please create an issue in this repository.

---

