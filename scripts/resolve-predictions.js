const hre = require("hardhat");
const fetch = require("node-fetch");

/**
 * Script to automatically resolve prediction markets based on match results
 * This would typically run as a cron job or automated task
 */

async function getMatchResult(matchId) {
  try {
    // Fetch match result from TheSportsDB API
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${matchId}`
    );
    const data = await response.json();
    
    if (!data.events || data.events.length === 0) {
      return null;
    }
    
    const match = data.events[0];
    
    // Check if match is finished
    if (match.strStatus !== "Match Finished") {
      console.log(`⏳ Match ${matchId} not finished yet`);
      return null;
    }
    
    const homeScore = parseInt(match.intHomeScore);
    const awayScore = parseInt(match.intAwayScore);
    
    if (isNaN(homeScore) || isNaN(awayScore)) {
      console.log(`❌ Invalid scores for match ${matchId}`);
      return null;
    }
    
    // Determine outcome: 1 = Home, 2 = Away, 3 = Draw
    let outcome;
    if (homeScore > awayScore) {
      outcome = 1; // Home win
    } else if (awayScore > homeScore) {
      outcome = 2; // Away win
    } else {
      outcome = 3; // Draw
    }
    
    return {
      homeTeam: match.strHomeTeam,
      awayTeam: match.strAwayTeam,
      homeScore,
      awayScore,
      outcome,
      outcomeName: outcome === 1 ? "Home" : outcome === 2 ? "Away" : "Draw"
    };
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🔍 Resolving prediction markets...\n");

  const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS;
  
  if (!PREDICTION_MARKET_ADDRESS) {
    throw new Error("PREDICTION_MARKET_ADDRESS not set in environment");
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Resolver address:", signer.address);

  // Get contract instance
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = PredictionMarket.attach(PREDICTION_MARKET_ADDRESS);

  // Get all matches
  const matchCount = await predictionMarket.getMatchCount();
  console.log(`📊 Total matches: ${matchCount}\n`);

  for (let i = 0; i < matchCount; i++) {
    const matchIdHash = await predictionMarket.matchIds(i);
    const matchData = await predictionMarket.getMatch(matchIdHash);
    
    const [
      externalMatchId,
      lockTime,
      matchTime,
      status,
      result,
      totalStaked,
      homePool,
      awayPool,
      drawPool
    ] = matchData;

    console.log(`\n🏟️  Match: ${externalMatchId}`);
    console.log(`   Status: ${["Open", "Locked", "Resolved", "Cancelled"][status]}`);
    console.log(`   Total Staked: ${hre.ethers.formatEther(totalStaked)} FANFI`);

    // Skip if already resolved or cancelled
    if (status === 2 || status === 3) {
      console.log(`   ⏭️  Skipping (already ${["Open", "Locked", "Resolved", "Cancelled"][status].toLowerCase()})`);
      continue;
    }

    // Lock match if it's past lock time and still open
    if (status === 0 && Date.now() / 1000 > Number(lockTime)) {
      console.log(`   🔒 Locking match...`);
      try {
        const tx = await predictionMarket.lockMatch(matchIdHash);
        await tx.wait();
        console.log(`   ✅ Match locked`);
      } catch (error) {
        console.log(`   ❌ Failed to lock: ${error.message}`);
        continue;
      }
    }

    // Resolve match if it's locked and match time has passed
    if (status === 1 && Date.now() / 1000 > Number(matchTime)) {
      console.log(`   🔍 Fetching match result...`);
      
      const matchResult = await getMatchResult(externalMatchId);
      
      if (!matchResult) {
        console.log(`   ⏳ Result not available yet, skipping...`);
        continue;
      }

      console.log(`   📊 Result: ${matchResult.homeTeam} ${matchResult.homeScore} - ${matchResult.awayScore} ${matchResult.awayTeam}`);
      console.log(`   🏆 Winner: ${matchResult.outcomeName}`);

      try {
        const tx = await predictionMarket.resolveMatch(matchIdHash, matchResult.outcome);
        await tx.wait();
        console.log(`   ✅ Match resolved!`);
        
        // Log pool distribution
        const winningPool = matchResult.outcome === 1 ? homePool : matchResult.outcome === 2 ? awayPool : drawPool;
        console.log(`   💰 Winning pool: ${hre.ethers.formatEther(winningPool)} FANFI`);
        console.log(`   📈 Winners will share: ${hre.ethers.formatEther(totalStaked)} FANFI`);
      } catch (error) {
        console.log(`   ❌ Failed to resolve: ${error.message}`);
      }
    }
  }

  console.log("\n✨ Resolution complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

