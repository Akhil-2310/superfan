// Simple Self Contract Reader
// Just reads lastUserName and lastUserAddress from the contract

import { createPublicClient, http, Address } from 'viem'
import { celoSepolia } from '../config/celo-chains'

const CONTRACT_ADDRESS = '0x047408f73705ea6b0edd8edfdca40dfcf63830a1' as Address

const client = createPublicClient({
  chain: celoSepolia,
  transport: http('https://forno.celo-sepolia.celo-testnet.org'),
})

// Simple ABI - just the functions we need
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
] as const

export interface LastUserData {
  name: string
  address: Address
}

/**
 * Read the last verified user's name and address from contract
 */
export async function getLastUserFromContract(): Promise<LastUserData | null> {
  try {
    console.log('📖 Reading lastUserName from contract...')
    
    const name = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserName',
    })

    const address = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'lastUserAddress',
    })

    console.log('✅ Got data from contract:', { name, address })

    return {
      name: name as string,
      address: address as Address,
    }
  } catch (error) {
    console.error('❌ Error reading from contract:', error)
    return null
  }
}

/**
 * Check if the current user is the last verified user
 */
export async function checkIfLastUser(userAddress: Address): Promise<{ isLastUser: boolean; name: string | null }> {
  try {
    const lastUser = await getLastUserFromContract()
    
    if (!lastUser) {
      return { isLastUser: false, name: null }
    }

    const isLastUser = lastUser.address.toLowerCase() === userAddress.toLowerCase()
    
    console.log('🔍 Checking if current user is last verified user:')
    console.log('   Current user:', userAddress)
    console.log('   Last user:   ', lastUser.address)
    console.log('   Match:', isLastUser ? '✅ YES' : '❌ NO')
    
    return {
      isLastUser,
      name: isLastUser ? lastUser.name : null,
    }
  } catch (error) {
    console.error('❌ Error checking last user:', error)
    return { isLastUser: false, name: null }
  }
}

