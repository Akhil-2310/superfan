import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { chilizSpicy } from '@/lib/config/chains'
import { PREDICTION_MARKET_ABI } from '@/lib/contracts/prediction-market-abi'

const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet } = body

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    if (!PREDICTION_MARKET_ADDRESS) {
      return NextResponse.json(
        { error: 'Prediction market not configured' },
        { status: 500 }
      )
    }

    // Create public client to read from blockchain
    const publicClient = createPublicClient({
      chain: chilizSpicy,
      transport: http()
    })

    // Get total number of matches
    const matchCount = await publicClient.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getMatchCount'
    }) as bigint

    const predictions = []

    // Check each match to see if user has a prediction
    for (let i = 0; i < Number(matchCount); i++) {
      try {
        // Get match ID hash
        const matchIdHash = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'matchIds',
          args: [BigInt(i)]
        }) as `0x${string}`

        // Get match details
        const matchData = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'getMatch',
          args: [matchIdHash]
        }) as [string, bigint, bigint, number, number, bigint, bigint, bigint, bigint]

        const [
          externalMatchId,
          lockTime,
          matchTime,
          status,
          result,
          totalStaked,
          homePool,
          awayPool,
          drawPool
        ] = matchData

        // Get user's prediction for this match
        const userPrediction = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'getUserPrediction',
          args: [matchIdHash, wallet as `0x${string}`]
        }) as [number, bigint, boolean]

        const [predicted, amount, claimed] = userPrediction

        // If user has a prediction (amount > 0)
        if (Number(amount) > 0) {
          // Map outcome number to text
          const outcomeMap = ['None', 'Home', 'Away', 'Draw']
          const statusMap = ['Open', 'Locked', 'Resolved', 'Cancelled']

          // Try to get real match details from TheSportsDB if available
          let homeTeam = 'Home Team'
          let awayTeam = 'Away Team'
          let league = 'On-Chain Match'

          try {
            const matchDetailsRes = await fetch(
              `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${externalMatchId}`
            )
            const matchDetails = await matchDetailsRes.json()
            if (matchDetails.events && matchDetails.events[0]) {
              const event = matchDetails.events[0]
              homeTeam = event.strHomeTeam || homeTeam
              awayTeam = event.strAwayTeam || awayTeam
              league = event.strLeague || league
            }
          } catch (err) {
            // Use fallback team names
          }

          predictions.push({
            id: matchIdHash,
            match_id: externalMatchId,
            user_wallet: wallet,
            predicted_winner: outcomeMap[predicted] || 'Unknown',
            confidence: 70,
            stake_amount: Number(formatEther(amount)),
            created_at: new Date(Number(matchTime) * 1000).toISOString(),
            claimed,
            status: statusMap[status],
            result: result > 0 ? outcomeMap[result] : 'Pending',
            match: {
              id: externalMatchId,
              home_team: homeTeam,
              away_team: awayTeam,
              match_date: new Date(Number(matchTime) * 1000).toISOString(),
              league,
              status: status === 2 ? 'finished' : status === 1 ? 'live' : 'upcoming'
            }
          })
        }
      } catch (err) {
        console.error(`Error fetching match ${i}:`, err)
        // Continue to next match
      }
    }

    return NextResponse.json({
      success: true,
      predictions: predictions.reverse() // Most recent first
    })

  } catch (error: any) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictions', details: error.message },
      { status: 500 }
    )
  }
}

