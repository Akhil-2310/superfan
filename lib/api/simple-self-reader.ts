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
  {
    inputs: [],
    name: 'lastOutput',
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'attestationId', type: 'bytes32' },
          { name: 'userIdentifier', type: 'uint256' },
          { name: 'nullifier', type: 'uint256' },
          { name: 'issuingState', type: 'string' },
          { name: 'idNumber', type: 'string' },
          { name: 'nationality', type: 'string' },
          { name: 'dateOfBirth', type: 'string' },
          { name: 'name', type: 'string[]' },
          { name: 'gender', type: 'string' },
          { name: 'expiryDate', type: 'string' },
          { name: 'olderThan', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export interface LastUserData {
  name: string
  address: Address
  nationality: string
  minimumAge: number
}

/**
 * Read the last verified user's name, address, nationality, and age from contract
 * Reads from lastOutput struct which contains all verification data
 */
export async function getLastUserFromContract(): Promise<LastUserData | null> {
  try {
    console.log('📖 Reading last user data from contract...')
    
    // Read the basic fields
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

    // Read lastOutput struct which contains nationality and olderThan
    let nationality = 'ARG' // Default
    let minimumAge = 18 // Default
    
    try {
      const lastOutput = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_ABI,
        functionName: 'lastOutput',
      }) as any
      
      console.log('✅ Got lastOutput from contract:', lastOutput)
      
      if (lastOutput) {
        if (lastOutput.nationality && lastOutput.nationality.length > 0) {
          nationality = lastOutput.nationality as string
          console.log('✅ Got nationality from lastOutput:', nationality)
        }
        if (lastOutput.olderThan !== undefined) {
          minimumAge = Number(lastOutput.olderThan)
          console.log('✅ Got olderThan from lastOutput:', minimumAge)
        }
      }
    } catch (error) {
      console.log('⚠️  Could not read lastOutput, using defaults:', error)
    }

    console.log('✅ Final data from contract:', { name, address, nationality, minimumAge })

    return {
      name: name as string,
      address: address as Address,
      nationality: nationality,
      minimumAge: minimumAge,
    }
  } catch (error) {
    console.error('❌ Error reading from contract:', error)
    return null
  }
}

/**
 * Check if the current user is the last verified user
 */
export async function checkIfLastUser(userAddress: Address): Promise<{ 
  isLastUser: boolean; 
  name: string | null;
  nationality: string | null;
  minimumAge: number | null;
}> {
  try {
    const lastUser = await getLastUserFromContract()
    
    if (!lastUser) {
      return { isLastUser: false, name: null, nationality: null, minimumAge: null }
    }

    const isLastUser = lastUser.address.toLowerCase() === userAddress.toLowerCase()
    
    console.log('🔍 Checking if current user is last verified user:')
    console.log('   Current user:', userAddress)
    console.log('   Last user:   ', lastUser.address)
    console.log('   Name:        ', lastUser.name)
    console.log('   Nationality: ', lastUser.nationality)
    console.log('   Min Age:     ', lastUser.minimumAge)
    console.log('   Match:', isLastUser ? '✅ YES' : '❌ NO')
    
    return {
      isLastUser,
      name: isLastUser ? lastUser.name : null,
      nationality: isLastUser ? lastUser.nationality : null,
      minimumAge: isLastUser ? lastUser.minimumAge : null,
    }
  } catch (error) {
    console.error('❌ Error checking last user:', error)
    return { isLastUser: false, name: null, nationality: null, minimumAge: null }
  }
}

