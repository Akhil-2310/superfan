import { Check, ExternalLink, Ticket, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RewardClaimedPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 bg-[#4ADE80] rounded-full flex items-center justify-center relative">
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#CE1141] rounded-full" />
            <Check className="w-20 h-20 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#121212] text-3xl md:text-4xl font-bold text-center mb-4">Reward Claimed!</h1>

        {/* Subtitle */}
        <p className="text-[#6E6E6E] text-center text-lg mb-12">Your NFT ticket has been added to your wallet</p>

        {/* NFT Card */}
        <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-3xl p-6 mb-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
          {/* NFT Visual */}
          <div className="bg-gradient-to-br from-[#4A6FA5] via-[#6B7F9F] to-[#D4B86A] rounded-2xl p-8 mb-6 relative overflow-hidden">
            {/* NFT Badge */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
              <span className="text-white text-sm font-medium">NFT</span>
            </div>

            {/* Ticket Icon */}
            <div className="flex justify-center">
              <Ticket className="w-32 h-32 text-white" strokeWidth={2} />
            </div>

            {/* Decorative circles on sides */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F8F8F8] rounded-full -translate-x-1/2" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F8F8F8] rounded-full translate-x-1/2" />
          </div>

          {/* NFT Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-[#121212] text-2xl font-bold mb-2">Free Matchday Pass</h2>
              <p className="text-[#6E6E6E] text-lg">Argentina vs. TBD</p>
            </div>

            <div className="border-t border-[#E4E4E4] pt-4 flex items-center justify-between">
              <span className="text-[#6E6E6E]">Token ID</span>
              <span className="text-[#121212] font-bold text-lg">#12847</span>
            </div>

            {/* Decorative dots */}
            <div className="flex justify-between items-center">
              <div className="w-3 h-3 bg-[#CE1141] rounded-full" />
              <div className="w-3 h-3 bg-[#0033A0] rounded-full" />
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-4 mb-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[#6E6E6E] text-sm mb-1">Transaction Hash</p>
              <p className="text-[#121212] font-mono text-sm truncate">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8</p>
            </div>
            <Link
              href="#"
              className="flex-shrink-0 w-10 h-10 bg-[#CE1141] hover:bg-[#B01038] rounded-lg flex items-center justify-center transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-white" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Confetti decoration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <span className="text-4xl">🎟️</span>
          </div>
        </div>

        {/* Success Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-full px-6 py-3 flex items-center gap-3">
            <Check className="w-5 h-5 text-[#16A34A]" strokeWidth={2.5} />
            <span className="text-[#16A34A] font-medium">Added to your Wallet</span>
          </div>
        </div>

        {/* View Ticket Button */}
        <Link
          href="/dashboard"
          className="block w-full bg-[#CE1141] hover:bg-[#B01038] text-white text-center text-lg font-bold py-4 rounded-2xl transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  )
}
