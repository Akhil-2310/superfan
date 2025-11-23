import { ethers } from 'ethers'

// Contract addresses
const FANFI_TOKEN_ADDRESS = process.env.FANFI_TOKEN_ADDRESS || "0xCee0c15B42EEb44491F588104bbC46812115dBB0"
const CHILIZ_RPC_URL = process.env.NEXT_PUBLIC_CHILIZ_RPC_URL || "https://spicy-rpc.chiliz.com"
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY // Set this in your .env.local

// FANFI Token ABI (just the mint function)
const FANFI_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "mintReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]

/**
 * Mint FANFI tokens to a user's wallet as a reward
 */
export async function mintFanfiReward(
  recipientAddress: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validate inputs
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      throw new Error('Invalid recipient address')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    // Check if minter private key is configured
    if (!MINTER_PRIVATE_KEY) {
      console.error('❌ MINTER_PRIVATE_KEY not set in environment')
      // Return success anyway for development (update database but skip blockchain)
      return {
        success: true,
        txHash: '0x' + '0'.repeat(64), // Mock tx hash
        error: 'MINTER_PRIVATE_KEY not configured - running in off-chain mode'
      }
    }

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(CHILIZ_RPC_URL)
    const signer = new ethers.Wallet(MINTER_PRIVATE_KEY, provider)

    // Connect to FANFI token contract
    const fanfiToken = new ethers.Contract(FANFI_TOKEN_ADDRESS, FANFI_ABI, signer)

    // Convert amount to wei (18 decimals)
    const amountInWei = ethers.parseEther(amount.toString())

    console.log(`🪙 Minting ${amount} FANFI to ${recipientAddress}...`)

    // Call mintReward function
    const tx = await fanfiToken.mintReward(recipientAddress, amountInWei, reason)
    console.log(`⏳ Transaction sent: ${tx.hash}`)

    // Wait for confirmation
    const receipt = await tx.wait()
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error: any) {
    console.error('❌ Error minting FANFI:', error)
    return {
      success: false,
      error: error.message || 'Failed to mint tokens',
    }
  }
}

/**
 * Get FANFI balance for an address
 */
export async function getFanfiBalance(address: string): Promise<string> {
  try {
    if (!ethers.isAddress(address)) {
      return '0'
    }

    const provider = new ethers.JsonRpcProvider(CHILIZ_RPC_URL)
    const fanfiToken = new ethers.Contract(FANFI_TOKEN_ADDRESS, FANFI_ABI, provider)

    const balance = await fanfiToken.balanceOf(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error fetching FANFI balance:', error)
    return '0'
  }
}

/**
 * Batch mint rewards to multiple users
 */
export async function batchMintRewards(
  recipients: { address: string; amount: number; reason: string }[]
): Promise<{ success: boolean; results: any[] }> {
  const results = []

  for (const recipient of recipients) {
    const result = await mintFanfiReward(recipient.address, recipient.amount, recipient.reason)
    results.push({
      address: recipient.address,
      amount: recipient.amount,
      ...result,
    })

    // Add small delay between transactions to avoid nonce issues
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return {
    success: results.every(r => r.success),
    results,
  }
}

