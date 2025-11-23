// Celo Chain Configurations
// Celo Sepolia is the new developer testnet (replacing Alfajores)

import { defineChain } from 'viem'

export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
    public: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Explorer',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

// OP-Node RPC endpoint (alternative)
export const CELO_SEPOLIA_OP_RPC = 'https://op.celo-sepolia.celo-testnet.org'

// Multiple RPC endpoints for fallback
export const CELO_SEPOLIA_RPC_ENDPOINTS = [
  'https://forno.celo-sepolia.celo-testnet.org',
  'https://op.celo-sepolia.celo-testnet.org',
]

