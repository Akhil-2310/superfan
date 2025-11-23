const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying FanFi Achievements NFT with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy FanFiAchievements
  const FanFiAchievements = await hre.ethers.getContractFactory("FanFiAchievements");
  const achievements = await FanFiAchievements.deploy();

  await achievements.waitForDeployment();

  const achievementsAddress = await achievements.getAddress();
  console.log("✅ FanFiAchievements deployed to:", achievementsAddress);

  // Add deployer as minter
  console.log("\nAdding deployer as minter...");
  const tx = await achievements.addMinter(deployer.address);
  await tx.wait();
  console.log("✅ Deployer added as minter");

  // Save deployment info
  console.log("\n--- DEPLOYMENT SUMMARY ---");
  console.log("Contract: FanFiAchievements");
  console.log("Address:", achievementsAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\n--- NEXT STEPS ---");
  console.log("1. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT=${achievementsAddress}`);
  console.log("\n2. Verify contract on explorer:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${achievementsAddress}`);
  console.log("\n3. Add backend minter address:");
  console.log(`   await achievements.addMinter("0xBACKEND_ADDRESS")`);
  console.log("--------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

