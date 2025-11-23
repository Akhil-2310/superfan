// Fetch real upcoming matches from top European leagues
// Using TheSportsDB API

export interface UpcomingMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  date: string
  time: string
  competition: string
  isLive: boolean
}

const THESPORTSDB_API_KEY = '3' // Free tier key
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json'

// Top European leagues
const LEAGUES = {
  premierLeague: '4328',      // English Premier League
  laLiga: '4335',             // Spanish La Liga
  serieA: '4332',             // Italian Serie A
  bundesliga: '4331',         // German Bundesliga
  ligue1: '4334',             // French Ligue 1
}

// Country flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'spain': '🇪🇸',
  'italy': '🇮🇹',
  'germany': '🇩🇪',
  'france': '🇫🇷',
  'argentina': '🇦🇷',
  'brazil': '🇧🇷',
  'portugal': '🇵🇹',
  'netherlands': '🇳🇱',
  'belgium': '🇧🇪',
  'croatia': '🇭🇷',
  'uruguay': '🇺🇾',
  'colombia': '🇨🇴',
  'mexico': '🇲🇽',
  'usa': '🇺🇸',
  'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'turkey': '🇹🇷',
  'poland': '🇵🇱',
  'denmark': '🇩🇰',
  'sweden': '🇸🇪',
  'norway': '🇳🇴',
  'switzerland': '🇨🇭',
  'austria': '🇦🇹',
  'czech republic': '🇨🇿',
  'greece': '🇬🇷',
  'serbia': '🇷🇸',
  'ukraine': '🇺🇦',
  'russia': '🇷🇺',
  'japan': '🇯🇵',
  'south korea': '🇰🇷',
  'australia': '🇦🇺',
  'saudi arabia': '🇸🇦',
  'egypt': '🇪🇬',
  'morocco': '🇲🇦',
  'nigeria': '🇳🇬',
  'south africa': '🇿🇦',
  'ghana': '🇬🇭',
  'senegal': '🇸🇳',
  'cameroon': '🇨🇲',
  'ivory coast': '🇨🇮',
  'tunisia': '🇹🇳',
  'algeria': '🇩🇿',
  'chile': '🇨🇱',
  'peru': '🇵🇪',
  'ecuador': '🇪🇨',
  'paraguay': '🇵🇾',
  'bolivia': '🇧🇴',
  'venezuela': '🇻🇪',
  'costa rica': '🇨🇷',
  'panama': '🇵🇦',
  'honduras': '🇭🇳',
  'jamaica': '🇯🇲',
  'canada': '🇨🇦',
}

// Team to country mapping (simplified)
const TEAM_COUNTRIES: Record<string, string> = {
  // Premier League
  'Manchester United': 'england',
  'Manchester City': 'england',
  'Liverpool': 'england',
  'Chelsea': 'england',
  'Arsenal': 'england',
  'Tottenham': 'england',
  'Newcastle': 'england',
  'Leicester': 'england',
  'West Ham': 'england',
  'Everton': 'england',
  'Brighton': 'england',
  'Crystal Palace': 'england',
  'Wolves': 'england',
  'Southampton': 'england',
  'Fulham': 'england',
  'Aston Villa': 'england',
  'Brentford': 'england',
  'Nottingham Forest': 'england',
  'Bournemouth': 'england',
  'Luton': 'england',
  
  // La Liga
  'Real Madrid': 'spain',
  'Barcelona': 'spain',
  'Atletico Madrid': 'spain',
  'Sevilla': 'spain',
  'Valencia': 'spain',
  'Villarreal': 'spain',
  'Real Sociedad': 'spain',
  'Real Betis': 'spain',
  'Athletic Bilbao': 'spain',
  'Osasuna': 'spain',
  'Getafe': 'spain',
  'Mallorca': 'spain',
  'Girona': 'spain',
  'Rayo Vallecano': 'spain',
  'Las Palmas': 'spain',
  'Celta Vigo': 'spain',
  'Cadiz': 'spain',
  'Almeria': 'spain',
  'Granada': 'spain',
  'Alaves': 'spain',
  
  // Serie A
  'Juventus': 'italy',
  'Inter': 'italy',
  'AC Milan': 'italy',
  'Napoli': 'italy',
  'Roma': 'italy',
  'Lazio': 'italy',
  'Atalanta': 'italy',
  'Fiorentina': 'italy',
  'Torino': 'italy',
  'Bologna': 'italy',
  'Sassuolo': 'italy',
  'Udinese': 'italy',
  'Verona': 'italy',
  'Monza': 'italy',
  'Lecce': 'italy',
  'Empoli': 'italy',
  'Salernitana': 'italy',
  'Spezia': 'italy',
  'Cremonese': 'italy',
  'Sampdoria': 'italy',
  
  // Bundesliga
  'Bayern Munich': 'germany',
  'Borussia Dortmund': 'germany',
  'RB Leipzig': 'germany',
  'Bayer Leverkusen': 'germany',
  'Union Berlin': 'germany',
  'Freiburg': 'germany',
  'Eintracht Frankfurt': 'germany',
  'Wolfsburg': 'germany',
  'Mainz': 'germany',
  'Borussia Monchengladbach': 'germany',
  'FC Koln': 'germany',
  'Hoffenheim': 'germany',
  'Werder Bremen': 'germany',
  'Bochum': 'germany',
  'Augsburg': 'germany',
  'Stuttgart': 'germany',
  'Hertha Berlin': 'germany',
  'Schalke': 'germany',
  
  // Ligue 1
  'Paris Saint Germain': 'france',
  'Marseille': 'france',
  'Monaco': 'france',
  'Lyon': 'france',
  'Lille': 'france',
  'Nice': 'france',
  'Rennes': 'france',
  'Lens': 'france',
  'Nantes': 'france',
  'Montpellier': 'france',
  'Strasbourg': 'france',
  'Reims': 'france',
  'Toulouse': 'france',
  'Lorient': 'france',
  'Brest': 'france',
  'Le Havre': 'france',
  'Metz': 'france',
  'Clermont': 'france',
}

function getTeamFlag(teamName: string): string {
  // Try to find country from team name
  const country = TEAM_COUNTRIES[teamName]
  if (country && COUNTRY_FLAGS[country]) {
    return COUNTRY_FLAGS[country]
  }
  
  // Fallback: try to extract country from team name
  for (const [countryName, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (teamName.toLowerCase().includes(countryName)) {
      return flag
    }
  }
  
  // Default flag
  return '⚽'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  if (date.getTime() === today.getTime()) {
    return 'Today'
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    // Format as "Mon, Jan 15"
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
}

/**
 * Fetch upcoming matches from a specific league
 */
async function fetchLeagueMatches(leagueId: string, leagueName: string): Promise<UpcomingMatch[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=${leagueId}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )
    
    if (!response.ok) {
      console.error(`Failed to fetch matches for ${leagueName}`)
      return []
    }
    
    const data = await response.json()
    
    if (!data.events || data.events.length === 0) {
      return []
    }
    
    // Take only first 2 matches from this league
    return data.events.slice(0, 2).map((event: any) => ({
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeFlag: getTeamFlag(event.strHomeTeam),
      awayFlag: getTeamFlag(event.strAwayTeam),
      date: formatDate(event.dateEvent),
      time: event.strTime || 'TBD',
      competition: leagueName,
      isLive: false,
    }))
  } catch (error) {
    console.error(`Error fetching ${leagueName} matches:`, error)
    return []
  }
}

/**
 * Fetch upcoming matches from top leagues
 * Returns up to 6 matches total (2 from each of 3 leagues)
 */
export async function fetchUpcomingMatches(): Promise<UpcomingMatch[]> {
  try {
    // Fetch from top 3 leagues in parallel
    const [premierLeagueMatches, laLigaMatches, bundesligaMatches] = await Promise.all([
      fetchLeagueMatches(LEAGUES.premierLeague, 'English Premier League'),
      fetchLeagueMatches(LEAGUES.laLiga, 'Spanish La Liga'),
      fetchLeagueMatches(LEAGUES.bundesliga, 'German Bundesliga'),
    ])
    
    // Combine and take first 6 matches
    const allMatches = [
      ...premierLeagueMatches,
      ...laLigaMatches,
      ...bundesligaMatches,
    ].slice(0, 6)
    
    // If we got less than 3 matches, add fallback demo matches
    if (allMatches.length < 3) {
      const demoMatches: UpcomingMatch[] = [
        {
          id: 'demo-1',
          homeTeam: 'Manchester United',
          awayTeam: 'Liverpool',
          homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          date: 'Today',
          time: '20:00',
          competition: 'English Premier League',
          isLive: false,
        },
        {
          id: 'demo-2',
          homeTeam: 'Real Madrid',
          awayTeam: 'Barcelona',
          homeFlag: '🇪🇸',
          awayFlag: '🇪🇸',
          date: 'Tomorrow',
          time: '21:00',
          competition: 'Spanish La Liga',
          isLive: false,
        },
        {
          id: 'demo-3',
          homeTeam: 'Bayern Munich',
          awayTeam: 'Borussia Dortmund',
          homeFlag: '🇩🇪',
          awayFlag: '🇩🇪',
          date: 'Tomorrow',
          time: '18:30',
          competition: 'German Bundesliga',
          isLive: false,
        },
      ]
      return [...allMatches, ...demoMatches].slice(0, 6)
    }
    
    return allMatches
  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    
    // Return demo matches as fallback
    return [
      {
        id: 'demo-1',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        date: 'Today',
        time: '20:00',
        competition: 'English Premier League',
        isLive: false,
      },
      {
        id: 'demo-2',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        homeFlag: '🇪🇸',
        awayFlag: '🇪🇸',
        date: 'Tomorrow',
        time: '21:00',
        competition: 'Spanish La Liga',
        isLive: false,
      },
      {
        id: 'demo-3',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Borussia Dortmund',
        homeFlag: '🇩🇪',
        awayFlag: '🇩🇪',
        date: 'Tomorrow',
        time: '18:30',
        competition: 'German Bundesliga',
        isLive: false,
      },
    ]
  }
}

