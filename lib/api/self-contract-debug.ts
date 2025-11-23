// Debug utility to check Self contract data
// Use this to see what's actually stored in the contract

import { createPublicClient, http, Address } from 'viem'
import { celoSepolia } from '../config/celo-chains'

const SELF_CONTRACT_ADDRESS = '0x047408f73705ea6b0edd8edfdca40dfcf63830a1' as Address

const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http('https://forno.celo-sepolia.celo-testnet.org', {
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  }),
})

// Minimal ABI for reading
const SIMPLE_ABI = [
  {
    inputs: [],
    name: 'lastUserName',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUserAddress',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastNationality',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastMinimumAge',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Debug function to check what's in the contract
 * Call this from browser console to see all contract data
 */
export async function debugContractData(yourAddress: Address) {
  console.log('🔍 DEBUG: Reading all contract data...')
  console.log('📍 Contract:', SELF_CONTRACT_ADDRESS)
  console.log('👤 Your address:', yourAddress)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // Read lastUser data
    console.log('\n1️⃣ Reading lastUser data...')
    
    const name = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserName',
    })
    console.log('   Name:', name)

    const address = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserAddress',
    })
    console.log('   Address:', address)

    const nationality = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastNationality',
    })
    console.log('   Nationality:', Number(nationality))

    const age = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastMinimumAge',
    })
    console.log('   MinimumAge:', Number(age))

    console.log('\n2️⃣ Checking if you are the last user...')
    const addressMatch = address.toLowerCase() === yourAddress.toLowerCase()
    console.log('   Match:', addressMatch ? '✅ YES' : '❌ NO')
    
    if (!addressMatch) {
      console.log('   ⚠️  The last verified user is someone else')
      console.log('   Last user:', address)
      console.log('   Your address:', yourAddress)
      console.log('\n   💡 This means either:')
      console.log('      - Someone verified after you')
      console.log('      - Your verification is still pending')
      console.log('      - Your data should be in verifiedUsers mapping')
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Debug complete!')
    
    return {
      lastUser: {
        name,
        address,
        nationality: Number(nationality),
        minimumAge: Number(age),
      },
      isYouTheLastUser: addressMatch,
    }
  } catch (error) {
    console.error('❌ Error reading contract:', error)
    return null
  }
}

/**
 * Quick check function
 */
export async function quickCheck() {
  try {
    const address = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserAddress',
    })
    
    const name = await publicClient.readContract({
      address: SELF_CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserName',
    })

    console.log('Last verified:', name, '@', address)
    return { name, address }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

// Export for window access in browser
if (typeof window !== 'undefined') {
  (window as any).debugSelfContract = debugContractData
  (window as any).quickCheckContract = quickCheck
}

