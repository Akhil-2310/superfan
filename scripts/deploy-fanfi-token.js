const hre = require("hardhat");

async function main() {
  console.log("Deploying FanFi Token to Chiliz Chain...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy FanFiToken
  const FanFiToken = await hre.ethers.getContractFactory("FanFiToken");
  const token = await FanFiToken.deploy();

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("FanFiToken deployed to:", tokenAddress);

  // Get token details
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_SUPPLY();

  console.log("\nToken Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("Max Supply:", hre.ethers.formatEther(maxSupply), symbol);
  console.log("Owner:", deployer.address);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await token.deploymentTransaction().wait(5);

  // Verify contract on Chiliz Explorer
  console.log("\nVerifying contract on Chiliz Explorer...");
  try {
    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error.message);
    console.log("You can verify manually at: https://chiliscan.com/address/" + tokenAddress);
  }

  console.log("\n✅ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Add token address to .env.local:");
  console.log(`   NEXT_PUBLIC_FANFI_TOKEN_ADDRESS=${tokenAddress}`);
  console.log("2. Update lib/config/chains.ts with the token address");
  console.log("3. Add minters for reward distribution:");
  console.log(`   await token.addMinter("0xYourRewardContractAddress")`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

