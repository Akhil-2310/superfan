const hre = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🚀 Deploying PredictionMarket contract...\n");

  // Get the FANFI token address from env
  const FANFI_TOKEN_ADDRESS = process.env.FANFI_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_FANFI_TOKEN;
  
  if (!FANFI_TOKEN_ADDRESS) {
    throw new Error("FANFI_TOKEN_ADDRESS not set in environment");
  }

  console.log("📍 Using FANFI Token at:", FANFI_TOKEN_ADDRESS);

  // Deploy the contract
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(FANFI_TOKEN_ADDRESS);

  await predictionMarket.waitForDeployment();
  const address = await predictionMarket.getAddress();

  console.log("✅ PredictionMarket deployed to:", address);
  console.log("\n📝 Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="${address}"`);
  
  console.log("\n⚠️  IMPORTANT: Don't forget to:");
  console.log("1. Add the PredictionMarket contract as a minter for FANFI token");
  console.log("2. Transfer some FANFI tokens to the contract for rewards");
  console.log("\n💡 To add as minter, run:");
  console.log(`   await fanfiToken.addMinter("${address}")`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

