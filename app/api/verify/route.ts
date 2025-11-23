import { NextResponse } from "next/server"
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core"

// Initialize Self backend verifier (reuse single instance)
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || "fanfi-chiliz",
  process.env.NEXT_PUBLIC_SELF_ENDPOINT || `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify`,
  false, // mockPassport: false = mainnet, true = staging/testnet
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // Can add country codes like ["IRN", "PRK", "RUS", "SYR"]
    ofac: false,
  }),
  "hex" // userIdentifierType - matches wallet address format
)

export async function POST(req: Request) {
  try {
    // Extract verification data from request
    const { attestationId, proof, publicSignals, userContextData } = await req.json()

    // Validate required fields
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          status: "error",
          result: false,
          error_code: "MISSING_FIELDS"
        },
        { status: 400 }
      )
    }

    console.log("Verifying proof for attestationId:", attestationId)

    // Verify the proof using Self backend verifier
    const result = await selfBackendVerifier.verify(
      attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
      proof,            // The zero-knowledge proof
      publicSignals,    // Public signals array
      userContextData   // User context data (hex string)
    )

    // Check if verification was successful
    if (result.isValidDetails.isValid) {
      console.log("Verification successful!")
      console.log("Disclosed data:", result.discloseOutput)

      // Verification successful - return disclosed data
      return NextResponse.json({
        status: "success",
        result: true,
        credentialSubject: result.discloseOutput,
        message: "Identity verified successfully"
      })
    } else {
      // Verification failed
      console.error("Verification failed:", result.isValidDetails)
      
      return NextResponse.json(
        {
          status: "error",
          result: false,
          reason: "Verification failed",
          error_code: "VERIFICATION_FAILED",
          details: result.isValidDetails,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in verification endpoint:", error)
    
    return NextResponse.json(
      {
        status: "error",
        result: false,
        reason: error instanceof Error ? error.message : "Unknown error",
        error_code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(req: Request) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  )
}

