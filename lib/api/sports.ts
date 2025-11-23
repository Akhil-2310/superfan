// Sports API Integration using TheSportsDB (free)
// For production, can switch to API-Football

export interface League {
  id: string
  name: string
  sport: string
  country: string
  logo?: string
}

export interface Match {
  id: string
  matchId: string
  league: string
  leagueLogo?: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  date: string
  time?: string
  status: 'upcoming' | 'live' | 'completed'
  homeScore?: number
  awayScore?: number
  venue?: string
  country: string
}

export interface Team {
  id: string
  name: string
  country: string
  logo?: string
  badge?: string
  fanToken?: string
}

const THESPORTSDB_API_KEY = process.env.SPORTS_API_KEY || '3' // Free tier key
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json'

// Mapping of countries to TheSportsDB country codes
const COUNTRY_MAPPING: Record<string, string> = {
  argentina: 'Argentina',
  france: 'France',
  spain: 'Spain',
  italy: 'Italy',
  england: 'England',
  germany: 'Germany',
  brazil: 'Brazil',
  portugal: 'Portugal',
  netherlands: 'Netherlands',
  belgium: 'Belgium',
  usa: 'USA',
  mexico: 'Mexico',
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Get leagues for a specific country
 */
export async function getLeaguesByCountry(country: string): Promise<League[]> {
  const cacheKey = `leagues_${country}`
  const cached = getCached<League[]>(cacheKey)
  if (cached) return cached

  const countryName = COUNTRY_MAPPING[country.toLowerCase()] || country

  try {
    const response = await fetch(
      `${BASE_URL}/${THESPORTSDB_API_KEY}/search_all_leagues.php?c=${encodeURIComponent(countryName)}&s=Soccer`
    )
    const data = await response.json()

    const leagues: League[] = (data.countries || [])
      .filter((league: any) => league.strSport === 'Soccer')
      .map((league: any) => ({
        id: league.idLeague,
        name: league.strLeague,
        sport: league.strSport,
        country: league.strCountry,
        logo: league.strBadge,
      }))

    setCache(cacheKey, leagues)
    return leagues
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return []
  }
}

/**
 * Get upcoming matches for a specific league
 */
export async function getUpcomingMatchesByLeague(leagueId: string): Promise<Match[]> {
  const cacheKey = `matches_${leagueId}`
  const cached = getCached<Match[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=${leagueId}`
    )
    const data = await response.json()

    const matches: Match[] = (data.events || []).slice(0, 10).map((event: any) => ({
      id: event.idEvent,
      matchId: event.idEvent,
      league: event.strLeague,
      leagueLogo: event.strLeagueBadge,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeTeamLogo: event.strHomeTeamBadge,
      awayTeamLogo: event.strAwayTeamBadge,
      date: event.dateEvent,
      time: event.strTime,
      status: 'upcoming' as const,
      venue: event.strVenue,
      country: event.strCountry,
    }))

    setCache(cacheKey, matches)
    return matches
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}

/**
 * Get live/recent matches for a specific league
 */
export async function getLiveMatchesByLeague(leagueId: string): Promise<Match[]> {
  const cacheKey = `live_matches_${leagueId}`
  const cached = getCached<Match[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}/${THESPORTSDB_API_KEY}/eventsround.php?id=${leagueId}&r=38&s=2024-2025`
    )
    const data = await response.json()

    const matches: Match[] = (data.events || []).slice(0, 5).map((event: any) => ({
      id: event.idEvent,
      matchId: event.idEvent,
      league: event.strLeague,
      leagueLogo: event.strLeagueBadge,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeTeamLogo: event.strHomeTeamBadge,
      awayTeamLogo: event.strAwayTeamBadge,
      date: event.dateEvent,
      time: event.strTime,
      status: event.strStatus === 'Match Finished' ? 'completed' : 'live',
      homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
      awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
      venue: event.strVenue,
      country: event.strCountry,
    }))

    setCache(cacheKey, matches)
    return matches
  } catch (error) {
    console.error('Error fetching live matches:', error)
    return []
  }
}

/**
 * Get all matches for a country (aggregates from top leagues)
 */
export async function getMatchesByCountry(country: string): Promise<Match[]> {
  const leagues = await getLeaguesByCountry(country)
  
  // Get matches from top 2 leagues only (to avoid rate limits)
  const topLeagues = leagues.slice(0, 2)
  
  const allMatches: Match[] = []
  
  for (const league of topLeagues) {
    const upcoming = await getUpcomingMatchesByLeague(league.id)
    const live = await getLiveMatchesByLeague(league.id)
    allMatches.push(...upcoming, ...live)
  }

  // Sort by date
  allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return allMatches
}

/**
 * Search teams by name
 */
export async function searchTeams(query: string): Promise<Team[]> {
  const cacheKey = `teams_${query}`
  const cached = getCached<Team[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${BASE_URL}/${THESPORTSDB_API_KEY}/searchteams.php?t=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    const teams: Team[] = (data.teams || [])
      .filter((team: any) => team.strSport === 'Soccer')
      .map((team: any) => ({
        id: team.idTeam,
        name: team.strTeam,
        country: team.strCountry,
        logo: team.strTeamBadge,
        badge: team.strTeamBadge,
        fanToken: undefined, // To be mapped later
      }))

    setCache(cacheKey, teams)
    return teams
  } catch (error) {
    console.error('Error searching teams:', error)
    return []
  }
}

/**
 * Demo data generator for hackathon/testing
 */
export function generateDemoMatches(country: string): Match[] {
  const demoMatches: Match[] = [
    {
      id: 'demo-1',
      matchId: 'demo-1',
      league: 'World Cup Qualifiers',
      homeTeam: 'Argentina',
      awayTeam: 'Brazil',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '20:00',
      status: 'upcoming',
      venue: 'Estadio Monumental',
      country: country,
    },
    {
      id: 'demo-2',
      matchId: 'demo-2',
      league: 'Friendly Match',
      homeTeam: country === 'argentina' ? 'Argentina' : 'France',
      awayTeam: 'Spain',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '18:30',
      status: 'upcoming',
      venue: 'National Stadium',
      country: country,
    },
    {
      id: 'demo-3',
      matchId: 'demo-3',
      league: 'Copa America',
      homeTeam: country === 'argentina' ? 'Argentina' : 'Italy',
      awayTeam: 'Germany',
      date: new Date().toISOString().split('T')[0],
      time: '21:00',
      status: 'live',
      homeScore: 2,
      awayScore: 1,
      venue: 'Arena Stadium',
      country: country,
    },
  ]

  return demoMatches
}

