"use client"

import { Wallet, Shield, Zap } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function ConnectWalletPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      // Redirect to verification after wallet connection
      router.push('/verify-self')
    }
  }, [isConnected, address, router])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <section className="flex flex-col items-center text-center space-y-8 max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0033A0] to-[#CE1141] rounded-3xl flex items-center justify-center">
          <Wallet className="w-12 h-12 text-white" strokeWidth={2} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] text-balance">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-[#6E6E6E] font-normal text-balance">
            Start earning Fan Tokens on Chiliz Chain
          </p>
        </div>

        {/* Connect Button */}
        <div className="w-full">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
          <button
                          onClick={openConnectModal}
                          className="w-full bg-[#CE1141] hover:bg-[#B50E36] transition-colors text-white text-lg font-semibold py-4 rounded-2xl shadow-md"
                        >
                          Connect Wallet
          </button>
                      )
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={openChainModal}
                          className="w-full bg-[#F8F8F8] border border-[#E4E4E4] text-[#121212] text-sm font-semibold py-3 rounded-xl"
                        >
                          {chain.name}
                        </button>
          <button
                          onClick={openAccountModal}
                          className="w-full bg-[#CE1141] text-white text-sm font-semibold py-3 rounded-xl"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
              </div>
              )
            }}
          </ConnectButton.Custom>
              </div>

        {/* Features */}
        <div className="w-full space-y-4 mt-8">
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-[#CE1141] rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div className="text-left">
              <h3 className="text-[#121212] font-semibold mb-1">Secure & Private</h3>
              <p className="text-[#6E6E6E] text-sm">
                Your wallet, your keys. We never access your funds.
              </p>
            </div>
        </div>

          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-[#0033A0] rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div className="text-left">
              <h3 className="text-[#121212] font-semibold mb-1">Built on Chiliz</h3>
              <p className="text-[#6E6E6E] text-sm">
                The leading blockchain for sports & entertainment.
            </p>
          </div>
        </div>
      </div>

        <p className="text-sm text-[#A0A0A0] mt-4">
          By connecting, you agree to our Terms of Service
        </p>
      </section>
    </main>
  )
}
