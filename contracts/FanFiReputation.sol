// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FanFiReputation
 * @dev Reputation scoring system for FanFi platform
 * 
 * Score Components:
 * - Quest completions (50-500 points each)
 * - Prediction accuracy (100-1000 points)
 * - Duel victories (200-800 points)
 * - Social engagement (10-100 points)
 * - Watch time (1 point per minute)
 * - Token holdings (1 point per 100 FANFI)
 * - Streak bonuses (10-500 points)
 * - Achievement unlocks (500-5000 points)
 * 
 * Reputation Tiers:
 * 0-999: Rookie
 * 1000-2999: Fan
 * 3000-5999: Pro
 * 6000-9999: Champion
 * 10000+: Legend
 */
contract FanFiReputation is Ownable {
    
    // User reputation data
    struct ReputationData {
        uint256 totalScore;
        uint256 questsCompleted;
        uint256 predictionsCorrect;
        uint256 predictionsTotal;
        uint256 duelsWon;
        uint256 duelsTotal;
        uint256 watchTimeMinutes;
        uint256 socialActions;
        uint256 currentStreak;
        uint256 lastActivityTimestamp;
        uint256 achievementsUnlocked;
    }
    
    // Reputation tiers
    enum Tier {
        ROOKIE,      // 0-999
        FAN,         // 1000-2999
        PRO,         // 3000-5999
        CHAMPION,    // 6000-9999
        LEGEND       // 10000+
    }
    
    // Mapping from user address to reputation data
    mapping(address => ReputationData) public reputations;
    
    // Mapping for authorized score updaters (backend services)
    mapping(address => bool) public updaters;
    
    // FanFi token contract for balance-based scoring
    IERC20 public fanFiToken;
    
    // Point values (can be adjusted by owner)
    uint256 public questPoints = 100;
    uint256 public predictionCorrectPoints = 500;
    uint256 public duelWinPoints = 300;
    uint256 public socialActionPoints = 20;
    uint256 public watchMinutePoints = 1;
    uint256 public achievementPoints = 1000;
    uint256 public streakBonusMultiplier = 10; // Additional points per day
    
    // Events
    event ReputationUpdated(
        address indexed user,
        uint256 newScore,
        string reason
    );
    event QuestCompleted(address indexed user, uint256 points);
    event PredictionScored(address indexed user, bool correct, uint256 points);
    event DuelResult(address indexed user, bool won, uint256 points);
    event SocialEngagement(address indexed user, uint256 points);
    event WatchTimeAdded(address indexed user, uint256 watchMinutes, uint256 points);
    event AchievementEarned(address indexed user, uint256 points);
    event StreakUpdated(address indexed user, uint256 streakDays, uint256 bonusPoints);
    event UpdaterAdded(address indexed updater);
    event UpdaterRemoved(address indexed updater);
    
    constructor(address _fanFiToken) Ownable(msg.sender) {
        require(_fanFiToken != address(0), "Invalid token address");
        fanFiToken = IERC20(_fanFiToken);
    }
    
    /**
     * @dev Add an authorized updater
     */
    function addUpdater(address updater) external onlyOwner {
        require(updater != address(0), "Invalid address");
        updaters[updater] = true;
        emit UpdaterAdded(updater);
    }
    
    /**
     * @dev Remove an authorized updater
     */
    function removeUpdater(address updater) external onlyOwner {
        updaters[updater] = false;
        emit UpdaterRemoved(updater);
    }
    
    /**
     * @dev Modifier to check if caller is authorized
     */
    modifier onlyUpdater() {
        require(
            msg.sender == owner() || updaters[msg.sender],
            "Not authorized to update"
        );
        _;
    }
    
    /**
     * @dev Record quest completion
     */
    function recordQuestCompletion(address user, uint256 difficulty)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        
        uint256 points = questPoints * difficulty; // Multiply by difficulty (1-5)
        
        reputations[user].questsCompleted++;
        reputations[user].totalScore += points;
        reputations[user].lastActivityTimestamp = block.timestamp;
        
        emit QuestCompleted(user, points);
        emit ReputationUpdated(user, reputations[user].totalScore, "Quest completed");
    }
    
    /**
     * @dev Record prediction result
     */
    function recordPrediction(address user, bool correct)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        
        reputations[user].predictionsTotal++;
        
        if (correct) {
            reputations[user].predictionsCorrect++;
            reputations[user].totalScore += predictionCorrectPoints;
            emit PredictionScored(user, true, predictionCorrectPoints);
        } else {
            emit PredictionScored(user, false, 0);
        }
        
        reputations[user].lastActivityTimestamp = block.timestamp;
        emit ReputationUpdated(user, reputations[user].totalScore, "Prediction recorded");
    }
    
    /**
     * @dev Record duel result
     */
    function recordDuel(address user, bool won)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        
        reputations[user].duelsTotal++;
        
        if (won) {
            reputations[user].duelsWon++;
            reputations[user].totalScore += duelWinPoints;
            emit DuelResult(user, true, duelWinPoints);
        } else {
            emit DuelResult(user, false, 0);
        }
        
        reputations[user].lastActivityTimestamp = block.timestamp;
        emit ReputationUpdated(user, reputations[user].totalScore, "Duel completed");
    }
    
    /**
     * @dev Record social engagement action
     */
    function recordSocialAction(address user)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        
        reputations[user].socialActions++;
        reputations[user].totalScore += socialActionPoints;
        reputations[user].lastActivityTimestamp = block.timestamp;
        
        emit SocialEngagement(user, socialActionPoints);
        emit ReputationUpdated(user, reputations[user].totalScore, "Social action");
    }
    
    /**
     * @dev Record watch time
     */
    function recordWatchTime(address user, uint256 watchMinutes)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        require(watchMinutes > 0, "Invalid watch time");
        
        uint256 points = watchMinutes * watchMinutePoints;
        
        reputations[user].watchTimeMinutes += watchMinutes;
        reputations[user].totalScore += points;
        reputations[user].lastActivityTimestamp = block.timestamp;
        
        emit WatchTimeAdded(user, watchMinutes, points);
        emit ReputationUpdated(user, reputations[user].totalScore, "Watch time");
    }
    
    /**
     * @dev Record achievement unlock
     */
    function recordAchievement(address user, uint256 rarityMultiplier)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        require(rarityMultiplier > 0 && rarityMultiplier <= 5, "Invalid rarity");
        
        uint256 points = achievementPoints * rarityMultiplier;
        
        reputations[user].achievementsUnlocked++;
        reputations[user].totalScore += points;
        reputations[user].lastActivityTimestamp = block.timestamp;
        
        emit AchievementEarned(user, points);
        emit ReputationUpdated(user, reputations[user].totalScore, "Achievement unlocked");
    }
    
    /**
     * @dev Update user streak
     */
    function updateStreak(address user)
        external
        onlyUpdater
    {
        require(user != address(0), "Invalid user");
        
        ReputationData storage data = reputations[user];
        
        // Check if last activity was within 48 hours (grace period)
        if (block.timestamp - data.lastActivityTimestamp <= 48 hours) {
            data.currentStreak++;
        } else {
            data.currentStreak = 1; // Reset streak
        }
        
        // Award streak bonus
        uint256 bonusPoints = data.currentStreak * streakBonusMultiplier;
        data.totalScore += bonusPoints;
        data.lastActivityTimestamp = block.timestamp;
        
        emit StreakUpdated(user, data.currentStreak, bonusPoints);
        emit ReputationUpdated(user, data.totalScore, "Streak bonus");
    }
    
    /**
     * @dev Batch update multiple reputation actions (gas efficient)
     */
    function batchUpdateReputation(
        address[] calldata users,
        string[] calldata actionTypes,
        uint256[] calldata values
    ) external onlyUpdater {
        require(
            users.length == actionTypes.length &&
            users.length == values.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            // Process based on action type
            bytes32 actionHash = keccak256(abi.encodePacked(actionTypes[i]));
            
            if (actionHash == keccak256(abi.encodePacked("quest"))) {
                reputations[users[i]].questsCompleted++;
                reputations[users[i]].totalScore += values[i];
            } else if (actionHash == keccak256(abi.encodePacked("prediction"))) {
                reputations[users[i]].predictionsTotal++;
                if (values[i] == 1) {
                    reputations[users[i]].predictionsCorrect++;
                    reputations[users[i]].totalScore += predictionCorrectPoints;
                }
            } else if (actionHash == keccak256(abi.encodePacked("duel"))) {
                reputations[users[i]].duelsTotal++;
                if (values[i] == 1) {
                    reputations[users[i]].duelsWon++;
                    reputations[users[i]].totalScore += duelWinPoints;
                }
            }
            
            reputations[users[i]].lastActivityTimestamp = block.timestamp;
        }
    }
    
    /**
     * @dev Get user's reputation tier
     */
    function getTier(address user) external view returns (Tier) {
        uint256 score = reputations[user].totalScore;
        
        if (score >= 10000) return Tier.LEGEND;
        if (score >= 6000) return Tier.CHAMPION;
        if (score >= 3000) return Tier.PRO;
        if (score >= 1000) return Tier.FAN;
        return Tier.ROOKIE;
    }
    
    /**
     * @dev Get complete reputation data for user
     */
    function getReputation(address user)
        external
        view
        returns (ReputationData memory)
    {
        return reputations[user];
    }
    
    /**
     * @dev Get user's prediction accuracy percentage
     */
    function getPredictionAccuracy(address user)
        external
        view
        returns (uint256)
    {
        if (reputations[user].predictionsTotal == 0) return 0;
        return (reputations[user].predictionsCorrect * 100) / reputations[user].predictionsTotal;
    }
    
    /**
     * @dev Get user's duel win rate percentage
     */
    function getDuelWinRate(address user)
        external
        view
        returns (uint256)
    {
        if (reputations[user].duelsTotal == 0) return 0;
        return (reputations[user].duelsWon * 100) / reputations[user].duelsTotal;
    }
    
    /**
     * @dev Calculate bonus score from token holdings
     */
    function getTokenHoldingBonus(address user)
        external
        view
        returns (uint256)
    {
        uint256 balance = fanFiToken.balanceOf(user);
        // 1 point per 100 FANFI tokens (adjusted for decimals)
        return balance / (100 * 10**18);
    }
    
    /**
     * @dev Update point values (owner only)
     */
    function setPointValues(
        uint256 _questPoints,
        uint256 _predictionCorrectPoints,
        uint256 _duelWinPoints,
        uint256 _socialActionPoints,
        uint256 _watchMinutePoints,
        uint256 _achievementPoints,
        uint256 _streakBonusMultiplier
    ) external onlyOwner {
        questPoints = _questPoints;
        predictionCorrectPoints = _predictionCorrectPoints;
        duelWinPoints = _duelWinPoints;
        socialActionPoints = _socialActionPoints;
        watchMinutePoints = _watchMinutePoints;
        achievementPoints = _achievementPoints;
        streakBonusMultiplier = _streakBonusMultiplier;
    }
}

