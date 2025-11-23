import { NextRequest, NextResponse } from 'next/server'
import { getMatchesByCountry, generateDemoMatches } from '@/lib/api/sports'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const country = searchParams.get('country') || 'argentina'
  const demo = searchParams.get('demo') === 'true'

  try {
    let matches

    if (demo) {
      // Use demo data for hackathon/testing
      matches = generateDemoMatches(country)
    } else {
      // Fetch real data from TheSportsDB
      matches = await getMatchesByCountry(country)
    }

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

