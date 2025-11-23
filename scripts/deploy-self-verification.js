const hre = require("hardhat");

async function main() {
  console.log("Deploying FanFi Self Verification Contract to Chiliz Chain...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Self Identity Verification Hub V2 addresses
  // Check https://docs.self.xyz/contract-integration/deployed-contracts for latest addresses
  const SELF_HUB_V2_ADDRESSES = {
    // Mainnet addresses
    ethereum: "0x...", // Ethereum mainnet
    polygon: "0x...",  // Polygon mainnet
    // Add Chiliz address when available
    chiliz: "0x0000000000000000000000000000000000000000", // Placeholder
    
    // Testnet addresses
    sepolia: "0x...", // Sepolia testnet
    amoy: "0x...",    // Polygon Amoy testnet
  };

  // Configuration
  const SCOPE_SEED = "fanfi-chiliz"; // Unique identifier for your app
  const HUB_ADDRESS = SELF_HUB_V2_ADDRESSES.chiliz; // Update with actual Chiliz hub address

  // Verification config
  const verificationConfig = {
    olderThan: 18,              // Minimum age
    forbiddenCountries: [],     // Empty = allow all countries
    ofacEnabled: false          // OFAC sanctions check
  };

  // Deploy contract
  const FanFiSelfVerification = await hre.ethers.getContractFactory("FanFiSelfVerification");
  const contract = await FanFiSelfVerification.deploy(
    HUB_ADDRESS,
    SCOPE_SEED,
    verificationConfig
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("FanFiSelfVerification deployed to:", contractAddress);

  // Get contract details
  const configId = await contract.verificationConfigId();
  const scope = await contract.scope();

  console.log("\nContract Details:");
  console.log("Verification Config ID:", configId);
  console.log("Scope:", scope.toString());
  console.log("Scope Seed:", SCOPE_SEED);
  console.log("Hub Address:", HUB_ADDRESS);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);

  // Verify contract on Chiliz Explorer
  console.log("\nVerifying contract on Chiliz Explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        HUB_ADDRESS,
        SCOPE_SEED,
        verificationConfig
      ],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error.message);
    console.log("You can verify manually at: https://chiliscan.com/address/" + contractAddress);
  }

  console.log("\n✅ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Add contract address to .env.local:");
  console.log(`   NEXT_PUBLIC_SELF_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Add verification config ID:");
  console.log(`   NEXT_PUBLIC_SELF_CONFIG_ID=${configId}`);
  console.log("3. Add scope:");
  console.log(`   NEXT_PUBLIC_SELF_SCOPE=${scope.toString()}`);
  console.log("4. Update frontend with matching config");
  console.log("5. Test verification flow");
  
  console.log("\n⚠️  Important:");
  console.log("- Frontend disclosure config must match contract config exactly");
  console.log("- minimumAge: 18 (matches olderThan: 18)");
  console.log("- Use same scope in frontend SelfAppBuilder");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

