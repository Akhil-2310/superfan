"use client"

import { Wallet, Shield, Check } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ConnectWalletPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const router = useRouter()

  const handleConnect = (walletType: string) => {
    setSelectedWallet(walletType)
    // Simulate wallet connection delay
    setTimeout(() => {
      router.push("/reward/claimed")
    }, 500)
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Wallet Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-[#CE1141] rounded-3xl flex items-center justify-center">
            <Wallet className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#121212] text-3xl md:text-4xl font-bold text-center mb-4">Connect Your Wallet</h1>

        {/* Subtitle */}
        <p className="text-[#6E6E6E] text-center text-lg mb-12">Connect your wallet to redeem your reward</p>

        <div className="space-y-4">
          {/* WalletConnect Option */}
          <button
            onClick={() => handleConnect("walletconnect")}
            className={`w-full bg-[#F8F8F8] hover:bg-[#F0F0F0] rounded-2xl p-6 transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.06)] ${
              selectedWallet === "walletconnect" ? "border-2 border-[#CE1141]" : "border border-[#E4E4E4]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#3B99FC] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-[#121212] text-xl font-bold mb-1">WalletConnect</h2>
                <p className="text-[#6E6E6E]">Connect with your mobile wallet</p>
              </div>
              {selectedWallet === "walletconnect" && (
                <Check className="w-6 h-6 text-[#CE1141] flex-shrink-0" strokeWidth={3} />
              )}
            </div>
          </button>

          {/* Social Login Wallet Option */}
          <button
            onClick={() => handleConnect("social")}
            className={`w-full bg-[#F8F8F8] hover:bg-[#F0F0F0] rounded-2xl p-6 transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.06)] ${
              selectedWallet === "social" ? "border-2 border-[#CE1141]" : "border border-[#E4E4E4]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F7D020] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-[#121212]" strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-[#121212] text-xl font-bold mb-1">Social Login Wallet</h2>
                <p className="text-[#6E6E6E]">Use email or social account</p>
              </div>
              {selectedWallet === "social" && (
                <Check className="w-6 h-6 text-[#CE1141] flex-shrink-0" strokeWidth={3} />
              )}
            </div>
          </button>

          {/* Chiliz Mainnet Option */}
          <button
            onClick={() => handleConnect("chiliz")}
            className={`w-full bg-[#F8F8F8] hover:bg-[#F0F0F0] rounded-2xl p-6 transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.06)] ${
              selectedWallet === "chiliz" ? "border-2 border-[#CE1141]" : "border border-[#E4E4E4]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#CE1141] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-[#121212] text-xl font-bold mb-1">Chiliz Mainnet</h2>
                <p className="text-[#6E6E6E]">Connected to Chiliz network</p>
              </div>
              {selectedWallet === "chiliz" && (
                <Check className="w-6 h-6 text-[#CE1141] flex-shrink-0" strokeWidth={3} />
              )}
            </div>
          </button>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-[#16A34A] flex-shrink-0 mt-1" strokeWidth={2} />
            <p className="text-[#121212] leading-relaxed">
              Transactions are verified with Self identity for maximum security
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
