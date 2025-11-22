"use client"

import { X, Trophy, Ticket, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RewardPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-8 md:p-12 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
        {/* Close Button */}
        <Link href="/dashboard" className="absolute top-6 right-6">
          <button className="text-[#6E6E6E] hover:text-[#121212] transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </Link>

        {/* Trophy Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-[#CE1141] rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-white" strokeWidth={2.5} fill="white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#121212] text-3xl md:text-4xl font-bold text-center mb-4">NFT Reward Earned!</h1>

        {/* Description */}
        <p className="text-[#6E6E6E] text-center text-lg md:text-xl mb-8 max-w-xl mx-auto">
          You're the #1 fan this week! Redeem your NFT reward.
        </p>

        {/* NFT Card */}
        <div className="bg-white border border-[#E4E4E4] rounded-2xl p-6 mb-8 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-6">
            {/* NFT Icon */}
            <div className="w-24 h-24 bg-[#F7D020] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Ticket className="w-12 h-12 text-[#121212]" strokeWidth={2.5} />
            </div>

            {/* NFT Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                <span className="text-[#CE1141] font-semibold">Exclusive NFT</span>
              </div>
              <h2 className="text-[#121212] text-2xl font-bold mb-2">Free Ticket NFT</h2>
              <p className="text-[#6E6E6E] text-lg mb-1">Matchday Pass</p>
              <p className="text-[#6E6E6E]">Argentina vs. TBD</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/connect-wallet" className="block">
          <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white text-lg font-bold py-5 rounded-2xl transition-colors">
            Connect Wallet to Claim
          </button>
        </Link>
      </div>
    </div>
  )
}
