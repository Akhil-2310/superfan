import { defineChain } from 'viem'

// Chiliz Spicy Testnet
export const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com'],
    },
    public: {
      http: ['https://spicy-rpc.chiliz.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
})

// Chiliz Mainnet
export const chilizMainnet = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/chiliz'],
    },
    public: {
      http: ['https://rpc.ankr.com/chiliz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://chiliscan.com',
    },
  },
  testnet: false,
})

// FanFi Token (our custom reward token)
export const FANFI_TOKEN = {
  name: 'FanFi Token',
  symbol: 'FANFI',
  address: (process.env.NEXT_PUBLIC_FANFI_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  decimals: 18,
  chainId: 88888,
}

// Team-to-Fan Token mapping (CAP-20 tokens on Chiliz)
export const TEAM_FAN_TOKENS = {
  // Argentina National Team
  argentina: {
    name: 'Argentina Fan Token',
    symbol: 'ARG',
    address: '0x...' as `0x${string}`, // Replace with actual contract address
    decimals: 18,
    chainId: 88888,
  },
  // FC Barcelona
  barcelona: {
    name: 'FC Barcelona Fan Token',
    symbol: 'BAR',
    address: '0xFD3C73b3B09D418841731c4A9960db5bEF57e6F1' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Juventus
  juventus: {
    name: 'Juventus Fan Token',
    symbol: 'JUV',
    address: '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Paris Saint-Germain
  psg: {
    name: 'Paris Saint-Germain Fan Token',
    symbol: 'PSG',
    address: '0x8C5b8C3E9dFb5c88d45CEd2e9d34A8D7C5d8C5b8' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Manchester City
  manchesterCity: {
    name: 'Manchester City Fan Token',
    symbol: 'CITY',
    address: '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Atletico Madrid
  atletico: {
    name: 'Atletico Madrid Fan Token',
    symbol: 'ATM',
    address: '0xBf0FF8ac03f3e6a0c78578ca972E171Ef0C895f3' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // AC Milan
  acMilan: {
    name: 'AC Milan Fan Token',
    symbol: 'ACM',
    address: '0x8C5b8C3E9dFb5c88d45CEd2e9d34A8D7C5d8C5b8' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Arsenal
  arsenal: {
    name: 'Arsenal Fan Token',
    symbol: 'AFC',
    address: '0x8C5b8C3E9dFb5c88d45CEd2e9d34A8D7C5d8C5b8' as `0x${string}`,
    decimals: 2,
    chainId: 88888,
  },
  // Generic demo token for hackathon
  demo: {
    name: 'Demo Fan Token',
    symbol: 'DEMO',
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    decimals: 18,
    chainId: 88882, // testnet
  },
} as const

export type TeamKey = keyof typeof TEAM_FAN_TOKENS

