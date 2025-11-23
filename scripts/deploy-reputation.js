const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying FanFi Reputation with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Get FanFi Token address from env or deploy new one
  let fanFiTokenAddress = process.env.FANFI_TOKEN_ADDRESS;
  
  if (!fanFiTokenAddress) {
    console.log("\n⚠️  No FANFI_TOKEN_ADDRESS found in .env");
    console.log("Deploying FanFiToken first...");
    
    const FanFiToken = await hre.ethers.getContractFactory("FanFiToken");
    const token = await FanFiToken.deploy();
    await token.waitForDeployment();
    fanFiTokenAddress = await token.getAddress();
    
    console.log("✅ FanFiToken deployed to:", fanFiTokenAddress);
  } else {
    console.log("Using existing FanFiToken at:", fanFiTokenAddress);
  }

  // Deploy FanFiReputation
  console.log("\nDeploying FanFiReputation...");
  const FanFiReputation = await hre.ethers.getContractFactory("FanFiReputation");
  const reputation = await FanFiReputation.deploy(fanFiTokenAddress);

  await reputation.waitForDeployment();

  const reputationAddress = await reputation.getAddress();
  console.log("✅ FanFiReputation deployed to:", reputationAddress);

  // Add deployer as updater
  console.log("\nAdding deployer as updater...");
  const tx = await reputation.addUpdater(deployer.address);
  await tx.wait();
  console.log("✅ Deployer added as updater");

  // Save deployment info
  console.log("\n--- DEPLOYMENT SUMMARY ---");
  console.log("FanFiToken:", fanFiTokenAddress);
  console.log("FanFiReputation:", reputationAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\n--- NEXT STEPS ---");
  console.log("1. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_FANFI_TOKEN=${fanFiTokenAddress}`);
  console.log(`   NEXT_PUBLIC_REPUTATION_CONTRACT=${reputationAddress}`);
  console.log("\n2. Verify contracts on explorer:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${fanFiTokenAddress}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${reputationAddress} ${fanFiTokenAddress}`);
  console.log("\n3. Add backend updater address:");
  console.log(`   await reputation.addUpdater("0xBACKEND_ADDRESS")`);
  console.log("\n4. Add token minter for reputation rewards:");
  console.log(`   await token.addMinter("${reputationAddress}")`);
  console.log("--------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

