"use client"

import Link from "next/link"
import Image from "next/image"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Page() {
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8 max-w-md">
        <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/images/chiliz-logo.png"
            alt="Chiliz"
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] text-balance">Welcome Superfan!</h1>
          <p className="text-xl md:text-2xl text-[#6E6E6E] font-normal text-balance">Earn and stake Fan Tokens™</p>
        </div>

        <div className="flex flex-col items-center space-y-4 w-full mt-8">
          {isConnected ? (
            <Link
              href="/onboarding"
              className="w-full bg-[#CE1141] hover:bg-[#B50E36] transition-colors text-white text-lg md:text-xl font-semibold py-4 rounded-2xl shadow-md"
            >
              Continue to Verification
            </Link>
          ) : (
            <div className="w-full">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="w-full bg-[#CE1141] hover:bg-[#B50E36] transition-colors text-white text-lg md:text-xl font-semibold py-4 rounded-2xl shadow-md"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}
          <p className="text-sm text-[#A0A0A0]">Verified by Self.xyz · Powered by Chiliz</p>
        </div>
      </section>
    </main>
  )
}
