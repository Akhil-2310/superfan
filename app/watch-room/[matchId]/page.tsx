"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { 
  ArrowLeft, Send, Users, MessageSquare, TrendingUp, 
  Trophy, Video, Pause, Play, Volume2, Clock
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface Message {
  id: string
  username: string
  content: string
  created_at: string
}

interface Poll {
  id: string
  question: string
  options: string[]
  vote_counts: Record<string, number>
  status: 'active' | 'closed'
}

export default function WatchRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const matchId = params.matchId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState<'chat' | 'poll'>('chat')
  const [participants, setParticipants] = useState(0)
  const [tokensEarned, setTokensEarned] = useState(0)
  const [watchTime, setWatchTime] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [showPlayers, setShowPlayers] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const watchTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Sample players data (in real app, fetch from API)
  const homeTeamPlayers = [
    { number: 1, name: "Emiliano Martínez", position: "GK" },
    { number: 4, name: "Cristian Romero", position: "DEF" },
    { number: 13, name: "Nico Otamendi", position: "DEF" },
    { number: 3, name: "Nicolás Tagliafico", position: "DEF" },
    { number: 26, name: "Nahuel Molina", position: "DEF" },
    { number: 7, name: "Rodrigo De Paul", position: "MID" },
    { number: 24, name: "Enzo Fernández", position: "MID" },
    { number: 20, name: "Alexis Mac Allister", position: "MID" },
    { number: 11, name: "Ángel Di María", position: "FWD" },
    { number: 10, name: "Lionel Messi", position: "FWD" },
    { number: 22, name: "Lautaro Martínez", position: "FWD" },
  ]

  const awayTeamPlayers = [
    { number: 1, name: "Hugo Lloris", position: "GK" },
    { number: 4, name: "Raphaël Varane", position: "DEF" },
    { number: 5, name: "Jules Koundé", position: "DEF" },
    { number: 22, name: "Theo Hernández", position: "DEF" },
    { number: 14, name: "Ousmane Dembélé", position: "MID" },
    { number: 8, name: "Aurélien Tchouaméni", position: "MID" },
    { number: 13, name: "Antoine Griezmann", position: "MID" },
    { number: 7, name: "Kylian Mbappé", position: "FWD" },
    { number: 10, name: "Olivier Giroud", position: "FWD" },
  ]

  // Demo poll
  const [currentPoll, setCurrentPoll] = useState<Poll>({
    id: 'poll-1',
    question: 'Who will score the next goal?',
    options: ['Home Team', 'Away Team', 'No Goal'],
    vote_counts: { '0': 45, '1': 32, '2': 8 },
    status: 'active',
  })
  const [userVote, setUserVote] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected) {
      router.push('/connect-wallet')
      return
    }

    // Load initial messages
    loadMessages()
    
    // Subscribe to realtime messages
    const channel = supabase
      .channel(`room-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => [...prev, newMsg])
        }
      )
      .subscribe()

    // Award join room reward
    awardJoinReward()

    // Load real participant count from watch_sessions
    loadParticipants()

    // Start watch time tracker
    watchTimerRef.current = setInterval(() => {
      if (videoPlaying) {
        setWatchTime(prev => prev + 1)
        
        // Award watch time reward every 10 minutes (600 seconds)
        if ((watchTime + 1) % 600 === 0) {
          awardWatchTimeReward()
        }
      }
    }, 1000)

    return () => {
      channel.unsubscribe()
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current)
      }
    }
  }, [matchId, isConnected, videoPlaying, watchTime])

  const loadParticipants = async () => {
    try {
      // Count unique users in watch_sessions for this match (last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('watch_sessions')
        .select('user_wallet')
        .eq('match_id', matchId)
        .gte('joined_at', twoHoursAgo)
      
      if (!error && data) {
        const uniqueUsers = new Set(data.map(s => s.user_wallet))
        setParticipants(uniqueUsers.size)
      } else {
        // Fallback to a reasonable number
        setParticipants(Math.floor(Math.random() * 50) + 20)
      }
    } catch (error) {
      console.error('Error loading participants:', error)
      setParticipants(Math.floor(Math.random() * 50) + 20)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    // For demo, use mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        username: 'FanBoy123',
        content: 'Let\'s go! Ready for an amazing match!',
        created_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        username: 'SoccerQueen',
        content: 'Home team looking strong today 💪',
        created_at: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: '3',
        username: 'ChilizFan',
        content: 'Earning tokens while watching is genius!',
        created_at: new Date(Date.now() - 180000).toISOString(),
      },
    ]
    setMessages(mockMessages)
  }

  const awardJoinReward = async () => {
    if (!address) return
    
    try {
      // Track join in watch_sessions
      await fetch('/api/watch-room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          matchId: matchId,
        }),
      })

      // Award tokens for joining
      const response = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          walletAddress: address,
          action: 'join_room',
          metadata: { matchId },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTokensEarned(prev => prev + data.tokens)
      }
    } catch (error) {
      console.error('Error awarding join reward:', error)
    }
  }

  const awardWatchTimeReward = async () => {
    if (!address) return
    
    try {
      const response = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          walletAddress: address,
          action: 'watch_time',
          metadata: { matchId, minutes: Math.floor(watchTime / 60) },
          cooldownMinutes: 10,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTokensEarned(prev => prev + data.tokens)
      }
    } catch (error) {
      console.error('Error awarding watch time reward:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !address) return

    const message: Message = {
      id: Date.now().toString(),
      username: `Fan${address.slice(-4)}`,
      content: newMessage,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Award chat reward
    try {
      const response = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          walletAddress: address,
          action: 'chat_message',
          metadata: { matchId },
          cooldownMinutes: 1,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTokensEarned(prev => prev + data.tokens)
      }
    } catch (error) {
      console.error('Error awarding chat reward:', error)
    }
  }

  const votePoll = async (optionIndex: number) => {
    if (userVote !== null || !address) return

    setUserVote(optionIndex)
    
    // Update vote counts
    const newCounts = { ...currentPoll.vote_counts }
    newCounts[optionIndex] = (newCounts[optionIndex] || 0) + 1
    setCurrentPoll(prev => ({ ...prev, vote_counts: newCounts }))

    // Award poll reward
    try {
      const response = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          walletAddress: address,
          action: 'poll_vote',
          metadata: { matchId, pollId: currentPoll.id, option: optionIndex },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTokensEarned(prev => prev + data.tokens)
      }
    } catch (error) {
      console.error('Error awarding poll reward:', error)
    }
  }

  const getTotalVotes = () => {
    return Object.values(currentPoll.vote_counts).reduce((sum, count) => sum + count, 0)
  }

  const getVotePercentage = (optionIndex: number) => {
    const total = getTotalVotes()
    if (total === 0) return 0
    return Math.round(((currentPoll.vote_counts[optionIndex] || 0) / total) * 100)
  }

  const formatWatchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/matches"
            className="text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex-1">
            <h1 className="text-[#121212] text-lg font-bold">Match Watch Room</h1>
            <div className="flex items-center gap-3 text-sm text-[#6E6E6E]">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" strokeWidth={2} />
                <span>{participants} viewers</span>
              </div>
              <div className="flex items-center gap-1 text-[#CE1141]">
                <Trophy className="w-4 h-4" strokeWidth={2} />
                <span>+{tokensEarned} tokens</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Video Player */}
        <div className="lg:flex-1 bg-black relative">
          <div className="aspect-video relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Football Match Video */}
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Overlay with Stadium Graphics */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Bar - Match Info */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  {/* Competition Logo */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-400" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">World Cup Final</p>
                      <p className="text-white/70 text-xs">December 18, 2022</p>
                    </div>
                  </div>
                  
                  {/* Live Badge */}
                  <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-white text-sm font-bold">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-3xl mb-1">🇦🇷</span>
                      <p className="text-white font-bold text-sm">ARG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-4xl font-black">3 - 3</p>
                      <p className="text-yellow-400 text-xs font-bold mt-1">120' + Penalties</p>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl mb-1">🇫🇷</span>
                      <p className="text-white font-bold text-sm">FRA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar - Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <div className="flex items-center justify-between">
                  {/* Watch Time */}
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white text-sm">
                      <Clock className="w-4 h-4 inline mr-1" strokeWidth={2} />
                      {formatWatchTime(watchTime)}
                    </p>
                  </div>

                  {/* Viewers Count */}
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white text-sm">
                      <Users className="w-4 h-4 inline mr-1" strokeWidth={2} />
                      {participants} watching
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Buttons */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-auto">
              {/* Players List Button */}
              <button
                onClick={() => setShowPlayers(!showPlayers)}
                className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
              >
                <Users className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-semibold">Lineups</span>
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  const video = document.querySelector('video')
                  if (video) {
                    if (videoPlaying) {
                      video.pause()
                    } else {
                      video.play()
                    }
                  }
                }}
                className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white p-2 rounded-xl transition-colors shadow-lg"
              >
                {videoPlaying ? (
                  <Pause className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Play className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Players List Modal */}
          {showPlayers && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-20 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6" strokeWidth={2} />
                    Match Lineups
                  </h3>
                  <button
                    onClick={() => setShowPlayers(false)}
                    className="text-white hover:text-red-500 text-3xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Home Team */}
                  <div className="bg-blue-900/30 rounded-xl p-5 border border-blue-500/30">
                    <h4 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-2xl">🇦🇷</span>
                      Argentina
                    </h4>
                    <div className="space-y-2">
                      {homeTeamPlayers.map((player) => (
                        <div
                          key={player.number}
                          className="flex items-center gap-3 bg-black/30 rounded-lg p-3 hover:bg-black/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                            {player.number}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{player.name}</p>
                            <p className="text-blue-300 text-xs">{player.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="bg-red-900/30 rounded-xl p-5 border border-red-500/30">
                    <h4 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-2xl">🇫🇷</span>
                      France
                    </h4>
                    <div className="space-y-2">
                      {awayTeamPlayers.map((player) => (
                        <div
                          key={player.number}
                          className="flex items-center gap-3 bg-black/30 rounded-lg p-3 hover:bg-black/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                            {player.number}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{player.name}</p>
                            <p className="text-red-300 text-xs">{player.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat/Poll Sidebar */}
        <div className="lg:w-96 bg-[#F8F8F8] border-l border-[#E4E4E4] flex flex-col h-[600px] lg:h-auto">
          {/* Tabs */}
          <div className="bg-white border-b border-[#E4E4E4] flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'text-[#CE1141] border-b-2 border-[#CE1141]'
                  : 'text-[#6E6E6E] hover:text-[#121212]'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" strokeWidth={2} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('poll')}
              className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${
                activeTab === 'poll'
                  ? 'text-[#CE1141] border-b-2 border-[#CE1141]'
                  : 'text-[#6E6E6E] hover:text-[#121212]'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" strokeWidth={2} />
              Polls
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-[#CE1141] text-xs font-semibold mb-1">
                      {msg.username}
                    </p>
                    <p className="text-[#121212] text-sm">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-[#E4E4E4]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE1141]/30"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#CE1141] hover:bg-[#B01038] disabled:bg-[#E4E4E4] text-white rounded-xl px-4 py-2 transition-colors"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-[#6E6E6E] text-xs mt-2">+5 tokens per message</p>
              </div>
            </>
          )}

          {/* Poll Tab */}
          {activeTab === 'poll' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-[#121212] font-bold mb-4">{currentPoll.question}</h3>
                
                <div className="space-y-3">
                  {currentPoll.options.map((option, index) => {
                    const percentage = getVotePercentage(index)
                    const isVoted = userVote === index
                    
                    return (
                      <button
                        key={index}
                        onClick={() => votePoll(index)}
                        disabled={userVote !== null}
                        className={`w-full text-left relative rounded-lg p-3 border-2 transition-all ${
                          isVoted
                            ? 'border-[#CE1141] bg-[#CE1141]/10'
                            : userVote !== null
                            ? 'border-[#E4E4E4] bg-[#F8F8F8]'
                            : 'border-[#E4E4E4] hover:border-[#CE1141]/50 bg-white'
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-[#CE1141]/10 rounded-lg transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex items-center justify-between">
                          <span className="text-[#121212] font-medium">{option}</span>
                          {userVote !== null && (
                            <span className="text-[#6E6E6E] text-sm font-semibold">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {userVote === null ? (
                  <p className="text-[#6E6E6E] text-xs mt-4">
                    Vote to earn +20 tokens
                  </p>
                ) : (
                  <p className="text-[#CE1141] text-sm mt-4 font-semibold">
                    ✓ Vote recorded! +20 tokens earned
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

