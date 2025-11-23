// Self.xyz Contract Reader
// Reads verified user data from the Self verification contract on-chain

import { createPublicClient, http, Address } from 'viem'
import { celoSepolia } from '../config/celo-chains'

// Self verification contract address (Celo Sepolia - new developer testnet)
const SELF_CONTRACT_ADDRESS = '0x047408f73705ea6b0edd8edfdca40dfcf63830a1' as Address

// ABI for reading user verification data
const SELF_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'lastUserName',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUserAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastNationality',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastMinimumAge',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastNullifier',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'verifiedUsers',
    outputs: [
      { internalType: 'bool', name: 'isVerified', type: 'bool' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'uint256', name: 'nationality', type: 'uint256' },
      { internalType: 'uint256', name: 'minimumAge', type: 'uint256' },
      { internalType: 'uint256', name: 'verifiedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Create public client for Celo Sepolia (new testnet)
const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http('https://forno.celo-sepolia.celo-testnet.org', {
    timeout: 30000, // 30 second timeout
    retryCount: 3,
    retryDelay: 1000,
  }),
})

export interface SelfContractData {
  name: string
  nationality: number
  minimumAge: number
  isVerified: boolean
  verifiedAt: number
  address: Address
}

/**
 * Read the last verified user's data from the contract
 * This is useful for testing and debugging
 */
export async function readLastVerifiedUser(): Promise<SelfContractData | null> {
  try {
    console.log('Reading last verified user from contract...')
    
    const [name, address, nationality, minimumAge] = await Promise.all([
      publicClient.readContract({
        address: SELF_CONTRACT_ADDRESS,
        abi: SELF_CONTRACT_ABI,
        functionName: 'lastUserName',
      }),
      publicClient.readContract({
        address: SELF_CONTRACT_ADDRESS,
        abi: SELF_CONTRACT_ABI,
        functionName: 'lastUserAddress',
      }),
      publicClient.readContract({
        address: SELF_CONTRACT_ADDRESS,
        abi: SELF_CONTRACT_ABI,
        functionName: 'lastNationality',
      }),
      publicClient.readContract({
        address: SELF_CONTRACT_ADDRESS,
        abi: SELF_CONTRACT_ABI,
        functionName: 'lastMinimumAge',
      }),
    ])

    console.log('Last verified user data:', { name, address, nationality, minimumAge })

    return {
      name: name as string,
      nationality: Number(nationality),
      minimumAge: Number(minimumAge),
      isVerified: true,
      verifiedAt: Date.now(),
      address: address as Address,
    }
  } catch (error) {
    console.error('Error reading last verified user:', error)
    return null
  }
}

/**
 * Read a specific user's verification data from the contract
 */
export async function readUserVerification(userAddress: Address): Promise<SelfContractData | null> {
  try {
    console.log('📖 Reading verification data for:', userAddress)
    
    const result = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SELF_CONTRACT_ABI,
      functionName: 'verifiedUsers',
      args: [userAddress],
    })

    console.log('📄 Contract read result:', result)

    const [isVerified, name, nationality, minimumAge, verifiedAt] = result

    console.log('📊 Parsed values:', {
      isVerified,
      name,
      nationality: Number(nationality),
      minimumAge: Number(minimumAge),
      verifiedAt: Number(verifiedAt),
    })

    if (!isVerified) {
      console.log('❌ User is not verified in verifiedUsers mapping')
      return null
    }

    console.log('✅ User is verified on-chain!')

    return {
      name: name,
      nationality: Number(nationality),
      minimumAge: Number(minimumAge),
      isVerified: isVerified,
      verifiedAt: Number(verifiedAt),
      address: userAddress,
    }
  } catch (error) {
    console.error('❌ Error reading user verification:', error)
    return null
  }
}

/**
 * Check if a user is verified on-chain
 */
export async function isUserVerifiedOnChain(userAddress: Address): Promise<boolean> {
  try {
    const data = await readUserVerification(userAddress)
    return data?.isVerified || false
  } catch (error) {
    console.error('Error checking verification status:', error)
    return false
  }
}

/**
 * Get user verification data with fallback to last verified user
 * This is useful when the user just completed verification
 */
export async function getUserVerificationWithFallback(
  userAddress: Address
): Promise<SelfContractData | null> {
  try {
    console.log('🔍 Getting verification data with fallback for:', userAddress)
    
    // Try to read user-specific data first
    console.log('1️⃣ Trying verifiedUsers mapping...')
    let data = await readUserVerification(userAddress)
    
    if (data) {
      console.log('✅ Found user-specific verification data in mapping!')
      return data
    }

    // Fallback: Check if user is the last verified user
    console.log('2️⃣ Not in mapping, checking lastUser data...')
    const lastUser = await readLastVerifiedUser()
    
    if (!lastUser) {
      console.log('❌ No lastUser data available')
      return null
    }
    
    console.log('📋 Last verified user:', {
      address: lastUser.address,
      name: lastUser.name,
      nationality: lastUser.nationality,
    })
    
    if (lastUser.address.toLowerCase() === userAddress.toLowerCase()) {
      console.log('✅ Current user matches lastUser! Using that data.')
      return lastUser
    }

    console.log('❌ Addresses do not match:')
    console.log('  - Looking for:', userAddress.toLowerCase())
    console.log('  - Last user:  ', lastUser.address.toLowerCase())
    console.log('⚠️  No verification data found for this address')
    return null
  } catch (error) {
    console.error('❌ Error getting user verification with fallback:', error)
    return null
  }
}

