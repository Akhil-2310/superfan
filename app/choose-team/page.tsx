"use client"

import { Search, Check } from "lucide-react"
import { useState } from "react"

const teams = [
  {
    id: 1,
    name: "Argentina",
    nickname: "La Albiceleste",
    country: "Argentina",
    flag: "🇦🇷",
    colors: "from-[#75AADB] to-[#FFFFFF]",
  },
  {
    id: 2,
    name: "France",
    nickname: "Les Bleus",
    country: "France",
    flag: "🇫🇷",
    colors: "from-[#002395] to-[#ED2939]",
  },
  {
    id: 3,
    name: "Germany",
    nickname: "Die Mannschaft",
    country: "Germany",
    flag: "🇩🇪",
    colors: "from-[#000000] to-[#DD0000]",
  },
  {
    id: 4,
    name: "Italy",
    nickname: "Gli Azzurri",
    country: "Italy",
    flag: "🇮🇹",
    colors: "from-[#009246] via-[#FFFFFF] to-[#CE2B37]",
  },
]

export default function ChooseTeamPage() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.country.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleContinue = () => {
    if (selectedTeam !== null) {
      window.location.href = "/dashboard"
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col px-4 py-8 md:py-12">
      {/* Header Section */}
      <header className="text-center space-y-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#121212] text-balance">Choose Your Team</h1>
        <p className="text-lg md:text-xl text-[#6E6E6E] font-normal">Select the team you support</p>
      </header>

      {/* Search Bar */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
          <input
            type="search"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl pl-12 pr-4 py-4 text-[#121212] placeholder:text-[#6E6E6E] focus:outline-none focus:ring-2 focus:ring-[#CE1141]/30 focus:border-[#CE1141] shadow-sm"
            aria-label="Search for teams"
          />
        </div>
      </div>

      {/* Team Grid */}
      <section className="w-full max-w-4xl mx-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`relative bg-[#F8F8F8] border rounded-2xl p-6 md:p-8 text-left transition-all shadow-sm hover:shadow-md ${
                selectedTeam === team.id
                  ? "border-[#CE1141] ring-2 ring-[#CE1141]/20"
                  : "border-[#E4E4E4] hover:border-[#CE1141]/40"
              }`}
              aria-pressed={selectedTeam === team.id}
            >
              {/* Selected Checkmark */}
              {selectedTeam === team.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-[#CE1141] rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Team Logo Circle with Flag */}
              <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${team.colors} rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white`}>
                <span className="text-4xl md:text-5xl">{team.flag}</span>
              </div>

              {/* Team Info */}
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold text-[#121212]">{team.name}</h3>
                <p className="text-base md:text-lg text-[#6E6E6E] font-medium">{team.nickname}</p>
                <p className="text-sm md:text-base text-[#6E6E6E]">{team.country}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Continue Button */}
      <div className="w-full max-w-4xl mx-auto mt-8 md:mt-12 mb-4">
        <button
          disabled={selectedTeam === null}
          onClick={handleContinue}
          className={`w-full text-lg md:text-xl font-semibold py-4 md:py-5 rounded-2xl transition-all shadow-sm ${
            selectedTeam !== null
              ? "bg-[#CE1141] text-white hover:bg-[#B50E36] shadow-md"
              : "bg-[#E4E4E4] text-[#6E6E6E] cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </main>
  )
}
