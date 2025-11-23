"use client"

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
      setLoading(false)
    }
  }, [error])

  const handleConnect = async () => {
    setLoading(true)
    try {
      // Find the injected connector (MetaMask, etc)
      const injectedConnector = connectors.find((c) => c.id === 'injected' || c.type === 'injected')
      
      if (injectedConnector) {
        await connect({ connector: injectedConnector })
      } else {
        // Fallback to first available connector
        await connect({ connector: connectors[0] })
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setLoading(false)
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-[#F8F8F8] border border-[#E4E4E4] rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-[#121212]">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-[#F8F8F8] hover:bg-[#F0F0F0] border border-[#E4E4E4] rounded-lg p-2 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
      ) : (
        <Wallet className="w-5 h-5" strokeWidth={2} />
      )}
      <span className="hidden md:inline">{loading ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  )
}

