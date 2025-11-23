"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAccount } from "wagmi"
import { Shield, Check, Loader2, Globe } from "lucide-react"
import { getSupportedCountries, createDemoVerification } from "@/lib/api/self-verification"
import { supabase } from "@/lib/supabase/client"

export default function VerifySelfPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  
  const [step, setStep] = useState<'select' | 'verifying' | 'success'>('select')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [verifying, setVerifying] = useState(false)
  
  const countries = getSupportedCountries()

  useEffect(() => {
    if (!isConnected) {
      router.push('/connect-wallet')
    }
  }, [isConnected, router])

  const handleVerify = async () => {
    if (!selectedCountry || !address) return
    
    setVerifying(true)
    setStep('verifying')
    
    try {
      // Demo verification (in production, use actual Self.xyz SDK)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const verification = createDemoVerification(address, selectedCountry)
      
      // Save to database
      const { error } = await supabase
        .from('users')
        .upsert({
          wallet_address: address,
          nationality: selectedCountry,
          self_verified: true,
        })
      
      if (error) throw error
      
      setStep('success')
      
      // Redirect after success
      setTimeout(() => {
        router.push('/choose-team')
      }, 2000)
    } catch (error) {
      console.error('Verification error:', error)
      alert('Verification failed. Please try again.')
      setStep('select')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0033A0] to-[#CE1141] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-[#121212] mb-2">Verify Your Identity</h1>
          <p className="text-[#6E6E6E]">Powered by Self.xyz - Your data stays private</p>
        </div>

        {/* Select Country Step */}
        {step === 'select' && (
          <div className="space-y-6">
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                <h2 className="text-[#121212] font-bold">Select Your Nationality</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCountry === country.code
                        ? 'border-[#CE1141] bg-[#CE1141]/10'
                        : 'border-[#E4E4E4] bg-white hover:border-[#CE1141]/50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{country.flag}</span>
                    <p className="text-[#121212] font-semibold text-sm">{country.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF8F0] border border-[#F7D020] rounded-xl p-4">
              <h3 className="text-[#121212] font-semibold text-sm mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={2} />
                Privacy First
              </h3>
              <p className="text-[#6E6E6E] text-sm">
                Self.xyz uses zero-knowledge proofs. Your personal data never leaves your device. 
                Only your nationality is verified.
              </p>
            </div>

            <button
              onClick={handleVerify}
              disabled={!selectedCountry || verifying}
              className="w-full bg-[#CE1141] hover:bg-[#B01038] disabled:bg-[#E4E4E4] disabled:text-[#6E6E6E] text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              {verifying ? 'Verifying...' : 'Verify with Self'}
            </button>
          </div>
        )}

        {/* Verifying Step */}
        {step === 'verifying' && (
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
            <Loader2 className="w-16 h-16 text-[#CE1141] mx-auto mb-4 animate-spin" strokeWidth={2} />
            <h2 className="text-[#121212] font-bold text-xl mb-2">Verifying Your Identity</h2>
            <p className="text-[#6E6E6E]">Processing your nationality proof...</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-[#121212] font-bold text-xl mb-2">Verification Complete!</h2>
            <p className="text-[#6E6E6E] mb-4">
              Your nationality has been verified. Redirecting...
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-[#121212] font-semibold text-sm">Select Your Country</p>
              <p className="text-[#6E6E6E] text-xs">Choose the nationality you want to verify</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-[#121212] font-semibold text-sm">Zero-Knowledge Proof</p>
              <p className="text-[#6E6E6E] text-xs">Your data is verified locally, never shared</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-[#121212] font-semibold text-sm">Access Country Content</p>
              <p className="text-[#6E6E6E] text-xs">See matches and earn tokens for your team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

