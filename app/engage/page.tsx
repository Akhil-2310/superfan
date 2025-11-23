'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';
import {
  Home,
  Zap,
  Trophy,
  User,
  Swords,
  CheckCircle,
  Clock,
  Gift,
  TrendingUp,
  Target,
  Calendar,
  Flame,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// Contract addresses and ABIs
const FANFI_TOKEN_ADDRESS = "0xCee0c15B42EEb44491F588104bbC46812115dBB0" as `0x${string}`

const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: 'daily' | 'weekly' | 'special' | 'seasonal';
  category: 'social' | 'prediction' | 'watch' | 'engage' | 'community';
  reward_amount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: any;
  userProgress?: any;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  end_date?: string;
}

interface UserReward {
  id: string;
  reward_type: string;
  amount: number;
  description: string;
  claimed: boolean;
  created_at: string;
}

const categoryIcons = {
  social: TrendingUp,
  prediction: Target,
  watch: Trophy,
  engage: Zap,
  community: User,
};

const categoryColors = {
  social: 'from-blue-500 to-blue-600',
  prediction: 'from-purple-500 to-purple-600',
  watch: 'from-green-500 to-green-600',
  engage: 'from-red-500 to-red-600',
  community: 'from-yellow-500 to-yellow-600',
};

const difficultyBadges = {
  easy: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Easy' },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium' },
  hard: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Hard' },
  expert: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Expert' },
};

export default function EngagePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [unclaimedRewards, setUnclaimedRewards] = useState(0);

  // ===== READ REAL FANFI BALANCE FROM BLOCKCHAIN =====
  const { data: fanfiBalance, refetch: refetchBalance } = useReadContract({
    address: FANFI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Parse balance to readable format
  const totalTokens = fanfiBalance ? parseFloat(formatEther(fanfiBalance)) : 0;

  useEffect(() => {
    if (!isConnected || !address) {
      router.push('/onboarding');
      return;
    }
    
    loadQuests();
    loadRewards();
    loadUserStats();
  }, [address, isConnected, router]);

  const loadQuests = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/quests?wallet=${address}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setQuests(data.quests || []);
      }
    } catch (err) {
      console.error('Error loading quests:', err);
      setError('Failed to load quests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRewards = async () => {
    if (!address) return;
    
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_wallet', address)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setRewards(data);
        const unclaimed = data.filter((r: UserReward) => !r.claimed).reduce((sum: number, r: UserReward) => sum + r.amount, 0);
        setUnclaimedRewards(unclaimed);
      }
    } catch (err) {
      console.error('Error loading rewards:', err);
    }
  };

  const loadUserStats = async () => {
    if (!address) return;
    
    try {
      // Refresh blockchain balance
      refetchBalance();
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  const claimReward = async (questId: string) => {
    if (!address || claiming) return;
    
    setClaiming(questId);
    
    try {
      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, questId }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        // Update UI
        setQuests(prev => prev.map(q => 
          q.id === questId ? { ...q, rewardClaimed: true } : q
        ));
        
        // Show success message with tx hash
        const message = data.onChain && data.txHash
          ? `🎉 Claimed ${data.reward} FANFI tokens on-chain!\nTx: ${data.txHash.slice(0, 10)}...`
          : `🎉 Claimed ${data.reward} FANFI tokens!`;
        alert(message);
        
        // Reload rewards and refresh blockchain balance
        loadRewards();
        setTimeout(() => {
          refetchBalance(); // Refresh real balance after claim
        }, 2000);
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const filteredQuests = quests.filter(q => {
    if (selectedTab === 'all') return true;
    return q.quest_type === selectedTab;
  });

  const dailyQuests = quests.filter(q => q.quest_type === 'daily');
  const weeklyQuests = quests.filter(q => q.quest_type === 'weekly');
  const specialQuests = quests.filter(q => q.quest_type === 'special' || q.quest_type === 'seasonal');

  const completedToday = dailyQuests.filter(q => q.completed).length;
  const dailyProgress = dailyQuests.length > 0 ? (completedToday / dailyQuests.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CE1141] mx-auto mb-4" />
          <p className="text-[#6E6E6E]">Loading quests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#CE1141] to-[#B01038] text-white px-4 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Engage & Earn</h1>
              <p className="text-white/90 text-sm">Complete quests to earn FANFI tokens</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs opacity-90">Balance (On-Chain)</span>
              </div>
              <p className="text-lg font-bold">{totalTokens.toFixed(2)} FANFI</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4" />
                <span className="text-xs opacity-90">Unclaimed</span>
              </div>
              <p className="text-lg font-bold">{unclaimedRewards}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs opacity-90">Daily</span>
              </div>
              <p className="text-lg font-bold">{completedToday}/{dailyQuests.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs opacity-90">Progress</span>
              </div>
              <p className="text-lg font-bold">{Math.round(dailyProgress)}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                selectedTab === 'all'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              All Quests ({quests.length})
            </button>
            <button
              onClick={() => setSelectedTab('daily')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                selectedTab === 'daily'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Daily ({dailyQuests.length})
            </button>
            <button
              onClick={() => setSelectedTab('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                selectedTab === 'weekly'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Weekly ({weeklyQuests.length})
            </button>
            <button
              onClick={() => setSelectedTab('special')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                selectedTab === 'special'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              Special ({specialQuests.length})
            </button>
          </div>

          {/* Quests Grid */}
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-[#E4E4E4] mx-auto mb-4" />
              <h3 className="text-[#121212] text-xl font-bold mb-2">No Quests Available</h3>
              <p className="text-[#6E6E6E]">Check back later for new challenges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredQuests.map((quest) => {
                const CategoryIcon = categoryIcons[quest.category];
                const difficultyBadge = difficultyBadges[quest.difficulty];
                
                return (
                  <article
                    key={quest.id}
                    className={`bg-[#F8F8F8] border-2 rounded-2xl p-6 transition-all ${
                      quest.completed
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-[#E4E4E4] hover:border-[#CE1141] hover:shadow-md'
                    }`}
                  >
                    {/* Quest Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[quest.category]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <CategoryIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-[#121212] font-bold text-lg leading-tight">{quest.title}</h3>
                          {quest.completed && (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-[#6E6E6E] text-sm mb-3">{quest.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${difficultyBadge.color}`}>
                            {difficultyBadge.label}
                          </span>
                          <span className="px-2 py-1 bg-[#CE1141]/10 text-[#CE1141] rounded-lg text-xs font-semibold capitalize">
                            {quest.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reward & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#E4E4E4]">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#F7D020]" fill="currentColor" />
                        <span className="text-[#CE1141] font-bold text-lg">
                          +{quest.reward_amount} FANFI
                        </span>
                      </div>
                      
                      {quest.completed && !quest.rewardClaimed ? (
                        <button
                          onClick={() => claimReward(quest.id)}
                          disabled={claiming === quest.id}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {claiming === quest.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4" />
                              Claim Reward
                            </>
                          )}
                        </button>
                      ) : quest.rewardClaimed ? (
                        <div className="bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Claimed
                        </div>
                      ) : (
                        <button
                          disabled
                          className="bg-[#E4E4E4] text-[#6E6E6E] font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          In Progress
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Recent Rewards */}
          {rewards.length > 0 && (
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <h2 className="text-[#121212] text-xl font-bold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#CE1141]" />
                Recent Rewards
              </h2>
              <div className="space-y-3">
                {rewards.slice(0, 5).map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between py-3 border-b border-[#E4E4E4] last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-[#121212] font-medium">{reward.description}</p>
                      <p className="text-[#6E6E6E] text-xs mt-1">
                        {new Date(reward.created_at).toLocaleDateString()} • {reward.reward_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#CE1141] font-bold">+{reward.amount}</p>
                      <p className={`text-xs ${reward.claimed ? 'text-green-600' : 'text-yellow-600'}`}>
                        {reward.claimed ? '✓ Claimed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-[#CE1141]" aria-current="page">
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </button>
          <Link href="/duels" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Swords className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Duels</span>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Trophy className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <User className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
