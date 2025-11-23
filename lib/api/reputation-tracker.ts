import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chilizSpicy } from '../config/chains';

// Contract ABIs (minimal for the functions we need)
const REPUTATION_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'difficulty', type: 'uint256' }],
    name: 'recordQuestCompletion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'bool', name: 'correct', type: 'bool' }],
    name: 'recordPrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'bool', name: 'won', type: 'bool' }],
    name: 'recordDuel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'recordSocialAction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'minutes', type: 'uint256' }],
    name: 'recordWatchTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }, { internalType: 'uint256', name: 'rarityMultiplier', type: 'uint256' }],
    name: 'recordAchievement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'updateStreak',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getReputation',
    outputs: [{
      components: [
        { internalType: 'uint256', name: 'totalScore', type: 'uint256' },
        { internalType: 'uint256', name: 'questsCompleted', type: 'uint256' },
        { internalType: 'uint256', name: 'predictionsCorrect', type: 'uint256' },
        { internalType: 'uint256', name: 'predictionsTotal', type: 'uint256' },
        { internalType: 'uint256', name: 'duelsWon', type: 'uint256' },
        { internalType: 'uint256', name: 'duelsTotal', type: 'uint256' },
        { internalType: 'uint256', name: 'watchTimeMinutes', type: 'uint256' },
        { internalType: 'uint256', name: 'socialActions', type: 'uint256' },
        { internalType: 'uint256', name: 'currentStreak', type: 'uint256' },
        { internalType: 'uint256', name: 'lastActivityTimestamp', type: 'uint256' },
        { internalType: 'uint256', name: 'achievementsUnlocked', type: 'uint256' },
      ],
      internalType: 'struct FanFiReputation.ReputationData',
      name: '',
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getTier',
    outputs: [{ internalType: 'enum FanFiReputation.Tier', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const REPUTATION_CONTRACT = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT as Address;
const BACKEND_PRIVATE_KEY = process.env.REPUTATION_UPDATER_PRIVATE_KEY;

// Create clients
const publicClient = createPublicClient({
  chain: chilizSpicy,
  transport: http('https://spicy-rpc.chiliz.com'),
});

// Only create wallet client if we have a private key (server-side only)
let walletClient: ReturnType<typeof createWalletClient> | null = null;
if (BACKEND_PRIVATE_KEY && typeof window === 'undefined') {
  const account = privateKeyToAccount(BACKEND_PRIVATE_KEY as `0x${string}`);
  walletClient = createWalletClient({
    account,
    chain: chilizSpicy,
    transport: http('https://spicy-rpc.chiliz.com'),
  });
}

export interface ReputationData {
  totalScore: bigint;
  questsCompleted: bigint;
  predictionsCorrect: bigint;
  predictionsTotal: bigint;
  duelsWon: bigint;
  duelsTotal: bigint;
  watchTimeMinutes: bigint;
  socialActions: bigint;
  currentStreak: bigint;
  lastActivityTimestamp: bigint;
  achievementsUnlocked: bigint;
}

export enum ReputationTier {
  ROOKIE = 0,
  FAN = 1,
  PRO = 2,
  CHAMPION = 3,
  LEGEND = 4,
}

/**
 * Get reputation data for a user (READ - frontend safe)
 */
export async function getReputationData(userAddress: Address): Promise<ReputationData | null> {
  if (!REPUTATION_CONTRACT) {
    console.error('Reputation contract address not set');
    return null;
  }

  try {
    const data = await publicClient.readContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'getReputation',
      args: [userAddress],
    });

    return data as ReputationData;
  } catch (error) {
    console.error('Error fetching reputation:', error);
    return null;
  }
}

/**
 * Get reputation tier for a user (READ - frontend safe)
 */
export async function getReputationTier(userAddress: Address): Promise<ReputationTier | null> {
  if (!REPUTATION_CONTRACT) {
    console.error('Reputation contract address not set');
    return null;
  }

  try {
    const tier = await publicClient.readContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'getTier',
      args: [userAddress],
    });

    return tier as ReputationTier;
  } catch (error) {
    console.error('Error fetching tier:', error);
    return null;
  }
}

/**
 * Record quest completion (WRITE - server-side only)
 */
export async function recordQuestCompletion(
  userAddress: Address,
  difficulty: number
): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordQuestCompletion',
      args: [userAddress, BigInt(difficulty)],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Quest completion recorded for ${userAddress} (difficulty: ${difficulty})`);
    return true;
  } catch (error) {
    console.error('Error recording quest completion:', error);
    return false;
  }
}

/**
 * Record prediction result (WRITE - server-side only)
 */
export async function recordPrediction(
  userAddress: Address,
  correct: boolean
): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordPrediction',
      args: [userAddress, correct],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Prediction recorded for ${userAddress} (correct: ${correct})`);
    return true;
  } catch (error) {
    console.error('Error recording prediction:', error);
    return false;
  }
}

/**
 * Record duel result (WRITE - server-side only)
 */
export async function recordDuel(
  userAddress: Address,
  won: boolean
): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordDuel',
      args: [userAddress, won],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Duel recorded for ${userAddress} (won: ${won})`);
    return true;
  } catch (error) {
    console.error('Error recording duel:', error);
    return false;
  }
}

/**
 * Record social action (WRITE - server-side only)
 */
export async function recordSocialAction(userAddress: Address): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordSocialAction',
      args: [userAddress],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Social action recorded for ${userAddress}`);
    return true;
  } catch (error) {
    console.error('Error recording social action:', error);
    return false;
  }
}

/**
 * Record watch time (WRITE - server-side only)
 */
export async function recordWatchTime(
  userAddress: Address,
  minutes: number
): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordWatchTime',
      args: [userAddress, BigInt(minutes)],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Watch time recorded for ${userAddress} (${minutes} minutes)`);
    return true;
  } catch (error) {
    console.error('Error recording watch time:', error);
    return false;
  }
}

/**
 * Record achievement unlock (WRITE - server-side only)
 */
export async function recordAchievement(
  userAddress: Address,
  rarityMultiplier: number
): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'recordAchievement',
      args: [userAddress, BigInt(rarityMultiplier)],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Achievement recorded for ${userAddress} (rarity: ${rarityMultiplier})`);
    return true;
  } catch (error) {
    console.error('Error recording achievement:', error);
    return false;
  }
}

/**
 * Update user streak (WRITE - server-side only)
 */
export async function updateStreak(userAddress: Address): Promise<boolean> {
  if (!walletClient) {
    console.error('Wallet client not initialized - server-side only');
    return false;
  }

  try {
    const { request } = await publicClient.simulateContract({
      address: REPUTATION_CONTRACT,
      abi: REPUTATION_ABI,
      functionName: 'updateStreak',
      args: [userAddress],
      account: walletClient.account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Streak updated for ${userAddress}`);
    return true;
  } catch (error) {
    console.error('Error updating streak:', error);
    return false;
  }
}

/**
 * Helper function to get tier name
 */
export function getTierName(tier: ReputationTier): string {
  const names = ['Rookie', 'Fan', 'Pro', 'Champion', 'Legend'];
  return names[tier] || 'Unknown';
}

/**
 * Helper function to get tier color
 */
export function getTierColor(tier: ReputationTier): string {
  const colors = {
    [ReputationTier.ROOKIE]: '#808080',
    [ReputationTier.FAN]: '#32CD32',
    [ReputationTier.PRO]: '#00BFFF',
    [ReputationTier.CHAMPION]: '#FF4500',
    [ReputationTier.LEGEND]: '#F7D020',
  };
  return colors[tier] || '#808080';
}

