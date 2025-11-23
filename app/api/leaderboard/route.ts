import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/api/rewards'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    const leaderboard = await getLeaderboard(limit)

    return NextResponse.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

