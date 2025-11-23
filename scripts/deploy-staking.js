const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying FanStakingPool with account:", deployer.address);

  // Token addresses (already deployed)
  const FANFI_TOKEN = "0xCee0c15B42EEb44491F588104bbC46812115dBB0"; // Staking token
  const SUPERFAN_TOKEN = "0xB6B9918C5880f7a1A4C65c4C4B6297956B4c39AD"; // Reward token

  // Deploy FanStakingPool
  const FanStakingPool = await hre.ethers.getContractFactory("FanStakingPool");
  const stakingPool = await FanStakingPool.deploy(FANFI_TOKEN, SUPERFAN_TOKEN);

  await stakingPool.waitForDeployment();

  const stakingAddress = await stakingPool.getAddress();
  console.log("FanStakingPool deployed to:", stakingAddress);

  // Get pool stats
  const [totalStaked, totalRewards, baseAPY] = await stakingPool.getPoolStats();
  console.log("\n📊 Pool Statistics:");
  console.log("  Total Staked:", totalStaked.toString());
  console.log("  Total Rewards:", totalRewards.toString());
  console.log("  Base APY:", baseAPY.toString(), "basis points (10% = 1000)");

  console.log("\n✅ Deployment Complete!");
  console.log("\n🔧 Next Steps:");
  console.log("1. Update STAKING_POOL_ADDRESS in app/defi/page.tsx");
  console.log("2. Transfer SuperFan tokens to staking pool for rewards");
  console.log("3. Set up reputation oracle (updateReputationMultiplier)");
  console.log("4. Test staking flow");

  console.log("\n💰 Commands to fund the pool:");
  console.log(`SuperFanToken.transfer("${stakingAddress}", ethers.parseEther("1000000"))`);

  console.log("\n📝 Update your .env.local:");
  console.log(`NEXT_PUBLIC_STAKING_POOL_ADDRESS=${stakingAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

