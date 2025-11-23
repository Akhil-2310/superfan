// Self.xyz Data Parser
// Extracts and formats verified data from Self verification response

export interface SelfVerifiedData {
  name: string | null
  nationality: string
  nationalityCode: number
  age: number | null
  minimumAge: number
  gender: string | null
  issuingCountry: string | null
  verifiedAt: number
  nullifier: string
  userIdentifier: string
}

/**
 * Parse Self verification response from QRCode wrapper or API
 * The response format depends on the source:
 * - QRCode wrapper: direct proof output
 * - Backend API: wrapped in credentialSubject
 */
export function parseSelfVerification(response: any): SelfVerifiedData | null {
  try {
    console.log('Parsing Self verification response:', response)
    
    // Handle empty or undefined response
    if (!response) {
      console.error('Empty Self verification response')
      return null
    }

    // Extract the actual data - could be in different formats
    let data = response
    
    // If it's wrapped in credentialSubject (from backend API)
    if (response.credentialSubject) {
      data = response.credentialSubject
    }
    
    // If it's wrapped in discloseOutput (from QRCode wrapper)
    if (response.discloseOutput) {
      data = response.discloseOutput
    }

    // Extract fields from the proof output
    // These fields are always available
    const nullifier = data.nullifier || ''
    const userIdentifier = data.userIdentifier || ''
    const olderThan = data.olderThan || 0
    
    // These fields are only available if disclosed
    const nationality = data.nationality || 0
    const name = data.name || null
    const gender = data.gender || null
    const issuingState = data.issuingState || null

    console.log('Extracted data:', {
      nullifier,
      userIdentifier,
      olderThan,
      nationality,
      name,
      gender,
      issuingState,
    })

    return {
      name: name ? formatNameFromProof(name) : null,
      nationality: mapNationalityCodeToName(nationality) || 'Unknown',
      nationalityCode: nationality,
      age: null, // Exact age not disclosed
      minimumAge: olderThan,
      gender: gender,
      issuingCountry: issuingState ? mapNationalityCodeToName(issuingState) : null,
      verifiedAt: Date.now(),
      nullifier: nullifier,
      userIdentifier: userIdentifier,
    }
  } catch (error) {
    console.error('Error parsing Self verification:', error)
    return null
  }
}

/**
 * Format name from proof (might be in LASTNAME<<FIRSTNAME format)
 */
function formatNameFromProof(name: string): string {
  if (!name) return ''
  
  // Name might be in format: "LASTNAME<<FIRSTNAME" or encoded
  if (name.includes('<<')) {
    const parts = name.split('<<')
    if (parts.length === 2) {
      const [lastName, firstName] = parts
      return `${firstName} ${lastName}`.trim()
    }
  }
  
  return name.replace(/</g, ' ').trim()
}

/**
 * Map ISO 3166-1 numeric country codes to country names
 * Used for converting on-chain nationality codes to readable country names
 */
export function mapNationalityCodeToName(code: number): string {
  const countryMap: Record<number, string> = {
    // Americas
    32: 'Argentina',
    76: 'Brazil',
    124: 'Canada',
    152: 'Chile',
    170: 'Colombia',
    484: 'Mexico',
    604: 'Peru',
    840: 'United States',
    858: 'Uruguay',
    862: 'Venezuela',

    // Europe
    40: 'Austria',
    56: 'Belgium',
    100: 'Bulgaria',
    191: 'Croatia',
    203: 'Czech Republic',
    208: 'Denmark',
    233: 'Estonia',
    246: 'Finland',
    250: 'France',
    276: 'Germany',
    300: 'Greece',
    348: 'Hungary',
    372: 'Ireland',
    380: 'Italy',
    428: 'Latvia',
    440: 'Lithuania',
    528: 'Netherlands',
    578: 'Norway',
    616: 'Poland',
    620: 'Portugal',
    642: 'Romania',
    643: 'Russia',
    688: 'Serbia',
    703: 'Slovakia',
    705: 'Slovenia',
    724: 'Spain',
    752: 'Sweden',
    756: 'Switzerland',
    792: 'Turkey',
    804: 'Ukraine',
    826: 'United Kingdom',

    // Asia
    156: 'China',
    356: 'India',
    360: 'Indonesia',
    364: 'Iran',
    376: 'Israel',
    392: 'Japan',
    410: 'South Korea',
    458: 'Malaysia',
    586: 'Pakistan',
    608: 'Philippines',
    634: 'Qatar',
    682: 'Saudi Arabia',
    702: 'Singapore',
    764: 'Thailand',
    784: 'United Arab Emirates',
    704: 'Vietnam',

    // Africa
    12: 'Algeria',
    818: 'Egypt',
    231: 'Ethiopia',
    404: 'Kenya',
    504: 'Morocco',
    566: 'Nigeria',
    710: 'South Africa',

    // Oceania
    36: 'Australia',
    554: 'New Zealand',
  }

  return countryMap[code] || `Country ${code}`
}

/**
 * Convert ISO 3166-1 alpha-3 country code to full country name
 */
export function alpha3ToCountryName(alpha3Code: string): string {
  const alpha3Map: Record<string, string> = {
    'ARG': 'Argentina',
    'BRA': 'Brazil',
    'CHL': 'Chile',
    'COL': 'Colombia',
    'FRA': 'France',
    'DEU': 'Germany',
    'ITA': 'Italy',
    'MEX': 'Mexico',
    'PRT': 'Portugal',
    'ESP': 'Spain',
    'GBR': 'United Kingdom',
    'USA': 'United States',
    'CAN': 'Canada',
    'CHN': 'China',
    'IND': 'India',
    'JPN': 'Japan',
    'KOR': 'South Korea',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'ZAF': 'South Africa',
    'NGA': 'Nigeria',
    'EGY': 'Egypt',
    'KEN': 'Kenya',
  }
  
  return alpha3Map[alpha3Code.toUpperCase()] || alpha3Code
}

/**
 * Map country code to emoji flag
 * Also handles country names (case insensitive) and ISO 3166-1 alpha-3 codes
 */
export function getCountryFlag(codeOrName: number | string): string {
  // Handle country code (number)
  if (typeof codeOrName === 'number') {
    const flagMap: Record<number, string> = {
      32: '🇦🇷',   // Argentina
      76: '🇧🇷',   // Brazil
      152: '🇨🇱',  // Chile
      170: '🇨🇴',  // Colombia
      250: '🇫🇷',  // France
      276: '🇩🇪',  // Germany
      380: '🇮🇹',  // Italy
      484: '🇲🇽',  // Mexico
      620: '🇵🇹',  // Portugal
      724: '🇪🇸',  // Spain
      826: '🇬🇧',  // United Kingdom
      840: '🇺🇸',  // United States
    }
    return flagMap[codeOrName] || '🌍'
  }
  
  // Handle ISO 3166-1 alpha-3 code (e.g., "ARG", "BRA")
  const upper = codeOrName.toUpperCase()
  const alpha3ToFlag: Record<string, string> = {
    'ARG': '🇦🇷',
    'BRA': '🇧🇷',
    'CHL': '🇨🇱',
    'COL': '🇨🇴',
    'FRA': '🇫🇷',
    'DEU': '🇩🇪',
    'ITA': '🇮🇹',
    'MEX': '🇲🇽',
    'PRT': '🇵🇹',
    'ESP': '🇪🇸',
    'GBR': '🇬🇧',
    'USA': '🇺🇸',
    'CAN': '🇨🇦',
    'CHN': '🇨🇳',
    'IND': '🇮🇳',
    'JPN': '🇯🇵',
    'KOR': '🇰🇷',
    'AUS': '🇦🇺',
    'NZL': '🇳🇿',
    'ZAF': '🇿🇦',
    'NGA': '🇳🇬',
    'EGY': '🇪🇬',
    'KEN': '🇰🇪',
  }
  
  if (alpha3ToFlag[upper]) {
    return alpha3ToFlag[upper]
  }
  
  // Handle country name (string)
  const name = codeOrName.toLowerCase()
  const nameToFlag: Record<string, string> = {
    'argentina': '🇦🇷',
    'brazil': '🇧🇷',
    'chile': '🇨🇱',
    'colombia': '🇨🇴',
    'france': '🇫🇷',
    'germany': '🇩🇪',
    'italy': '🇮🇹',
    'mexico': '🇲🇽',
    'portugal': '🇵🇹',
    'spain': '🇪🇸',
    'united kingdom': '🇬🇧',
    'united states': '🇺🇸',
    'unknown': '🌍',
  }
  
  return nameToFlag[name] || '🌍'
}

/**
 * Format name for display
 */
export function formatName(name: string | null): string {
  if (!name) return 'User'
  
  // Name is typically in format: "LASTNAME<<FIRSTNAME"
  // or just "FULLNAME"
  const parts = name.split('<<')
  if (parts.length === 2) {
    const [lastName, firstName] = parts
    return `${firstName} ${lastName}`.trim()
  }
  
  return name.replace(/</g, ' ').trim()
}

/**
 * Get gender display text
 */
export function formatGender(gender: string | null): string {
  if (!gender) return 'Not disclosed'
  
  const genderMap: Record<string, string> = {
    'M': 'Male',
    'F': 'Female',
    'X': 'Other',
  }
  
  return genderMap[gender.toUpperCase()] || gender
}

