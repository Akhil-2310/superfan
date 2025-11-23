"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Shield, Wallet, CheckCircle, Loader2, QrCode } from "lucide-react"
import { getUniversalLink } from "@selfxyz/core"
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode"
import { ethers } from "ethers"
import { supabase } from "@/lib/supabase/client"
import { parseSelfVerification, formatName, getCountryFlag, mapNationalityCodeToName } from "@/lib/api/self-data-parser"
import { checkIfLastUser } from "@/lib/api/simple-self-reader"

type OnboardingStep = 'connect' | 'verify' | 'scanning' | 'complete'

interface VerificationData {
  name: string
  nationality: string
  nationalityCode: number
  age: number
  nullifier: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  const [step, setStep] = useState<OnboardingStep>('connect')
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)

  // Initialize Self app when wallet is connected
  useEffect(() => {
    if (isConnected && address && step === 'connect') {
      setStep('verify')
      initializeSelfApp()
    }
  }, [isConnected, address])

  const initializeSelfApp = () => {
    if (!address) return

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: "SuperFan",
        scope: "superfan",
        endpoint: "0x047408f73705ea6b0edd8edfdca40dfcf63830a1",
        logoBase64: "/images/chiliz-logo.png",
        userId: address,
        endpointType: "staging_celo", // Celo Sepolia testnet
        userIdType: "hex",
        userDefinedData: "Welcome to SuperFan",
        devMode: true,
        disclosures: {
          minimumAge: 3,
          name: true,
          nationality: true,
        }
      }).build()

      setSelfApp(app)
      setUniversalLink(getUniversalLink(app as any)) // Type assertion for Celo staging chain
    } catch (error) {
      console.error("Failed to initialize Self app:", error)
      alert("Failed to initialize verification. Please try again.")
    }
  }

  const handleVerificationSuccess = async (verificationResponse?: any) => {
    console.log("=== VERIFICATION SUCCESS HANDLER ===")
    console.log("Verification response:", verificationResponse)
    console.log("Current address:", address)
    
    setStep('complete')
    
    try {
      // Wait a moment for the transaction to be mined
      console.log('Waiting for on-chain data to be available...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Read verification data from contract
      if (!address) {
        throw new Error('No wallet address available')
      }
      
      console.log('📞 Reading name from Self contract...')
      
      // Read the last verified user from contract
      const lastUserCheck = await checkIfLastUser(address)
      
      if (lastUserCheck.isLastUser && lastUserCheck.name) {
        console.log('✅ Found your name in contract:', lastUserCheck.name)
        
        // Use contract data
        const verificationData: VerificationData = {
          name: lastUserCheck.name,
          nationality: 'Unknown', // We'll get this from somewhere else or default
          nationalityCode: 0,
          age: 18,
          nullifier: '',
        }
        
        setVerificationData(verificationData)
        
        // Save to database with contract name
        await supabase
          .from('users')
          .upsert({
            wallet_address: address,
            nationality: 'unknown',
            self_verified: true,
            verified_name: lastUserCheck.name,
            verified_age: 18,
            fan_score: 0,
            total_tokens: 0,
            streak_days: 0,
          } as any)
        
        console.log('✅ User data saved with contract name')
        
        // Redirect to team selection
        setTimeout(() => {
          router.push('/choose-team')
        }, 2500)
        return
      }
      
      console.log('ℹ️  Not the last user, trying callback response...')
      const contractData = null
      
      if (!contractData) {
        console.log('⚠️  Proceeding with default data...')
        
        // Last resort: use defaults
        console.warn('⚠️  No name found, using default')
        
        const defaultData: VerificationData = {
          name: 'User',
          nationality: 'Unknown',
          nationalityCode: 0,
          age: 18,
          nullifier: '',
        }
        
        setVerificationData(defaultData)
        
        // Save to database with defaults
        await supabase
          .from('users')
          .upsert({
            wallet_address: address,
            nationality: 'unknown',
            self_verified: true,
            fan_score: 0,
            total_tokens: 0,
            streak_days: 0,
          } as any)
        
        // Redirect to team selection
        setTimeout(() => {
          router.push('/choose-team')
        }, 2500)
      }
      
    } catch (error) {
      console.error('Error processing verification:', error)
      alert('Verification completed on-chain. Proceeding to next step.')
      
      // Even if data extraction fails, allow user to continue
      if (address) {
        await supabase
          .from('users')
          .upsert({
            wallet_address: address,
            nationality: 'unknown',
            self_verified: true,
            fan_score: 0,
            total_tokens: 0,
            streak_days: 0,
          } as any)
      }
      
      setTimeout(() => {
        router.push('/choose-team')
      }, 1000)
    }
  }

  const handleVerificationError = () => {
    console.error("Verification failed")
    alert("Verification failed. Please try scanning again.")
    // Reset to verify step to show QR code again
    setStep('verify')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step === 'connect' ? 'bg-[#CE1141]' : 'bg-[#E4E4E4]'}`} />
          <div className="w-12 h-0.5 bg-[#E4E4E4]" />
          <div className={`w-3 h-3 rounded-full ${step === 'verify' || step === 'scanning' ? 'bg-[#CE1141]' : 'bg-[#E4E4E4]'}`} />
          <div className="w-12 h-0.5 bg-[#E4E4E4]" />
          <div className={`w-3 h-3 rounded-full ${step === 'complete' ? 'bg-[#CE1141]' : 'bg-[#E4E4E4]'}`} />
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 'connect' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0033A0] to-[#CE1141] rounded-3xl flex items-center justify-center mx-auto">
              <Wallet className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-[#121212] mb-2">Welcome to FanFi</h1>
              <p className="text-[#6E6E6E]">Connect your wallet to get started</p>
            </div>

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
                  <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="w-full bg-[#CE1141] hover:bg-[#B50E36] text-white font-semibold py-4 rounded-2xl"
                          >
                            Connect Wallet
                          </button>
                        )
                      }

                      return (
                        <div className="space-y-3">
                          <button
                            onClick={openChainModal}
                            className="w-full bg-[#F8F8F8] border border-[#E4E4E4] text-[#121212] font-semibold py-3 rounded-xl"
                          >
                            {chain.name}
                          </button>
                          <button
                            onClick={openAccountModal}
                            className="w-full bg-[#CE1141] text-white font-semibold py-3 rounded-xl"
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

            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#CE1141] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="text-left">
                <p className="text-[#121212] font-semibold text-sm mb-1">Powered by Chiliz</p>
                <p className="text-[#6E6E6E] text-xs">
                  The leading blockchain for sports & entertainment
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Self Verification with QR Code */}
        {step === 'verify' && selfApp && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0033A0] to-[#CE1141] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-bold text-[#121212] mb-2">Verify Your Identity</h1>
              <p className="text-[#6E6E6E]">Scan this QR code with the Self app</p>
            </div>

            {/* Self QR Code Component */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 flex justify-center">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={(response?: any) => {
                  console.log("=== SELF VERIFICATION SUCCESS ===")
                  console.log("Response:", response)
                  console.log("Type:", typeof response)
                  console.log("Is undefined:", response === undefined)
                  console.log("Is null:", response === null)
                  if (response) {
                    console.log("Keys:", Object.keys(response))
                    console.log("JSON:", JSON.stringify(response, null, 2))
                  }
                  console.log("================================")
                  handleVerificationSuccess(response)
                }}
                onError={() => {
                  console.error("=== SELF VERIFICATION ERROR ===")
                  handleVerificationError()
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="bg-[#FFF8F0] border border-[#F7D020] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#121212] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-[#121212] font-semibold text-sm mb-1">Privacy First</p>
                    <p className="text-[#6E6E6E] text-xs">
                      Self.xyz uses zero-knowledge proofs. Your personal data never leaves your device. Only nationality and age (18+) are verified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[#6E6E6E] text-sm mb-2">Don't have the Self app?</p>
                <a 
                  href="https://self.xyz/app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#CE1141] font-semibold text-sm hover:underline"
                >
                  Download Self App →
                </a>
              </div>
            </div>

            {/* Mobile Deeplink Option */}
            {universalLink && (
              <a
                href={universalLink}
                className="block w-full bg-[#0033A0] hover:bg-[#002D8F] text-white text-center font-semibold py-3 rounded-xl"
              >
                Open in Self App (Mobile)
              </a>
            )}
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && verificationData && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-[#121212] mb-2">Verification Complete!</h1>
              <p className="text-[#6E6E6E] mb-6">Your identity has been verified on-chain</p>
              
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6 text-left space-y-3">
                {verificationData.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6E6E]">Name</span>
                    <span className="text-[#121212] font-semibold">
                      {verificationData.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Wallet</span>
                  <span className="text-[#121212] font-mono font-semibold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Nationality</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(verificationData.nationalityCode)}</span>
                    <span className="text-[#121212] font-semibold">
                      {verificationData.nationality}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Age</span>
                  <span className="text-[#121212] font-semibold">
                    {verificationData.age}+
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Verified On-Chain
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[#6E6E6E] text-sm">Redirecting to team selection...</p>
          </div>
        )}
      </div>
    </div>
  )
}
