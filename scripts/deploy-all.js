const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("=".repeat(50));
  console.log("🚀 FanFi Complete Deployment");
  console.log("=".repeat(50));
  console.log("\nDeployer:", deployer.address);
  console.log("Balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("Network:", hre.network.name);
  console.log("\n" + "=".repeat(50) + "\n");

  const deployedContracts = {};

  // 1. Deploy FanFiToken
  console.log("📝 Step 1/3: Deploying FanFiToken...");
  const FanFiToken = await hre.ethers.getContractFactory("FanFiToken");
  const token = await FanFiToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  deployedContracts.token = tokenAddress;
  console.log("✅ FanFiToken deployed:", tokenAddress);
  console.log("");

  // 2. Deploy FanFiAchievements
  console.log("📝 Step 2/3: Deploying FanFiAchievements...");
  const FanFiAchievements = await hre.ethers.getContractFactory("FanFiAchievements");
  const achievements = await FanFiAchievements.deploy();
  await achievements.waitForDeployment();
  const achievementsAddress = await achievements.getAddress();
  deployedContracts.achievements = achievementsAddress;
  console.log("✅ FanFiAchievements deployed:", achievementsAddress);
  console.log("");

  // 3. Deploy FanFiReputation
  console.log("📝 Step 3/3: Deploying FanFiReputation...");
  const FanFiReputation = await hre.ethers.getContractFactory("FanFiReputation");
  const reputation = await FanFiReputation.deploy(tokenAddress);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  deployedContracts.reputation = reputationAddress;
  console.log("✅ FanFiReputation deployed:", reputationAddress);
  console.log("");

  // 4. Configure contracts
  console.log("⚙️  Configuring contracts...");
  
  // Add deployer as minter/updater (for testing)
  console.log("   - Adding deployer as token minter...");
  await token.addMinter(deployer.address);
  
  console.log("   - Adding deployer as achievements minter...");
  await achievements.addMinter(deployer.address);
  
  console.log("   - Adding deployer as reputation updater...");
  await reputation.addUpdater(deployer.address);
  
  console.log("✅ Configuration complete");
  console.log("");

  // 5. Summary
  console.log("=".repeat(50));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Deployed Contracts:");
  console.log("   FanFiToken:        ", tokenAddress);
  console.log("   FanFiAchievements: ", achievementsAddress);
  console.log("   FanFiReputation:   ", reputationAddress);
  
  console.log("\n📝 Add to .env.local:");
  console.log(`   NEXT_PUBLIC_FANFI_TOKEN="${tokenAddress}"`);
  console.log(`   NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT="${achievementsAddress}"`);
  console.log(`   NEXT_PUBLIC_REPUTATION_CONTRACT="${reputationAddress}"`);
  console.log(`   FANFI_TOKEN_ADDRESS="${tokenAddress}"`);
  console.log(`   REPUTATION_UPDATER_PRIVATE_KEY="your_backend_private_key"`);

  console.log("\n🔍 Verify contracts:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${tokenAddress}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${achievementsAddress}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${reputationAddress} ${tokenAddress}`);

  console.log("\n" + "=".repeat(50) + "\n");

  // Save addresses to file
  const fs = require('fs');
  const deploymentData = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
  };

  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("💾 Deployment details saved to deployments-" + hre.network.name + ".json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

