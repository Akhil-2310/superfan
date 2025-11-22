import Link from "next/link"
import { CheckCircle, Trophy, Shield } from "lucide-react"

export default function CheckInSuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Checkmark Icon */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={2.5} />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#121212]">Attendance Verified!</h1>
          <p className="text-[#6E6E6E] text-lg">
            <span className="inline-block mr-1">🏟️</span>
            You've been checked in at the stadium
          </p>
        </div>

        {/* Points and Tokens Earned */}
        <div className="bg-[#F8F8F8] border-2 border-[#CE1141] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-[#121212] font-semibold text-lg">Points Earned</p>
                <p className="text-[#6E6E6E] text-sm">Stadium attendance bonus</p>
              </div>
            </div>
            <p className="text-yellow-600 text-2xl font-bold">+1,000</p>
          </div>

          <div className="h-px bg-[#E4E4E4]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[#121212] font-semibold text-lg">Fan Token Bonus</p>
                <p className="text-[#6E6E6E] text-sm">Added to your balance</p>
              </div>
            </div>
            <p className="text-[#121212] text-2xl font-bold">+250</p>
          </div>
        </div>

        {/* Self Verified Badge */}
        <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-[#121212] font-semibold text-lg">Self Verified</p>
                <p className="text-[#6E6E6E] text-sm">Human presence confirmed at stadium</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-green-100 border border-green-600 rounded-full">
              <p className="text-green-700 text-sm font-medium">Verified</p>
            </div>
          </div>
        </div>

        {/* Rank Update Notification */}
        <div className="bg-[#F8F8F8] border-2 border-[#CE1141] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#CE1141]" />
            <div>
              <p className="text-[#121212] font-semibold text-lg">Your rank updated!</p>
              <p className="text-[#6E6E6E] text-base">
                You moved up to #5 <span className="inline-block">🎉</span>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <Link
          href="/dashboard"
          className="block w-full bg-[#CE1141] hover:bg-[#B00F38] text-white font-semibold text-lg py-4 px-6 rounded-2xl transition-colors text-center shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
