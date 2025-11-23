// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FanStakingPool
 * @dev Stake FANFI tokens to earn SuperFan rewards with reputation-based multipliers
 * 
 * Prize Track Features:
 * - Real-world yield tied to fan engagement
 * - Dynamic APY based on Chiliz reputation
 * - Match outcome bonuses
 * - Watch-to-earn integration
 */
contract FanStakingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Tokens
    IERC20 public immutable stakingToken;  // FANFI Token
    IERC20 public immutable rewardToken;   // SuperFan Token

    // Staking parameters
    uint256 public constant BASE_APY = 1000; // 10% base APY (in basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MULTIPLIER_DENOMINATOR = 10000;

    // Reputation-based multipliers
    mapping(address => uint256) public userReputationMultiplier; // in basis points (10000 = 1x)
    
    // Staking data
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalRewardsClaimed;
        uint256 reputationAtStake;
    }
    
    mapping(address => Stake) public stakes;
    
    // Pool statistics
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // Match outcome bonus pools
    mapping(bytes32 => uint256) public matchBonusPools;
    mapping(bytes32 => mapping(address => bool)) public userMatchParticipation;
    
    // Watch-to-earn tracking
    mapping(address => uint256) public watchTimeSeconds;
    uint256 public constant WATCH_TIME_BONUS_RATE = 10; // 0.1% per hour watched

    // Events
    event Staked(address indexed user, uint256 amount, uint256 reputationMultiplier);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 rewards);
    event ReputationUpdated(address indexed user, uint256 newMultiplier);
    event MatchBonusAdded(bytes32 indexed matchId, uint256 bonusAmount);
    event MatchBonusClaimed(address indexed user, bytes32 indexed matchId, uint256 bonus);
    event WatchTimeRecorded(address indexed user, uint256 secondsWatched, uint256 bonusEarned);

    constructor(
        address _stakingToken,
        address _rewardToken
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @dev Stake FANFI tokens to earn SuperFan rewards
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        Stake storage userStake = stakes[msg.sender];
        
        // If user already has a stake, claim pending rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake
        if (userStake.amount == 0) {
            userStake.startTime = block.timestamp;
        }
        userStake.amount += amount;
        userStake.lastClaimTime = block.timestamp;
        userStake.reputationAtStake = userReputationMultiplier[msg.sender];
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, userStake.reputationAtStake);
    }

    /**
     * @dev Unstake tokens and claim all rewards
     */
    function unstake(uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        require(amount > 0, "Cannot unstake 0");
        
        // Calculate and claim all pending rewards
        uint256 rewards = _calculateRewards(msg.sender);
        if (rewards > 0) {
            _claimRewards(msg.sender);
        }
        
        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // Transfer staked tokens back
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, rewards);
    }

    /**
     * @dev Claim pending rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user) internal {
        uint256 rewards = _calculateRewards(user);
        require(rewards > 0, "No rewards to claim");
        
        Stake storage userStake = stakes[user];
        userStake.lastClaimTime = block.timestamp;
        userStake.totalRewardsClaimed += rewards;
        totalRewardsDistributed += rewards;
        
        // Transfer reward tokens
        rewardToken.safeTransfer(user, rewards);
        
        emit RewardsClaimed(user, rewards);
    }

    /**
     * @dev Calculate pending rewards for a user
     * Formula: (stakeAmount * time * baseAPY * reputationMultiplier * watchTimeBonus) / denominators
     */
    function _calculateRewards(address user) internal view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 baseReward = (userStake.amount * timeStaked * BASE_APY) / (SECONDS_PER_YEAR * MULTIPLIER_DENOMINATOR);
        
        // Apply reputation multiplier (default 10000 = 1x if not set)
        uint256 repMultiplier = userStake.reputationAtStake > 0 ? userStake.reputationAtStake : MULTIPLIER_DENOMINATOR;
        uint256 rewardWithRep = (baseReward * repMultiplier) / MULTIPLIER_DENOMINATOR;
        
        // Apply watch time bonus (0.1% per hour watched)
        uint256 watchHours = watchTimeSeconds[user] / 1 hours;
        uint256 watchBonus = (rewardWithRep * watchHours * WATCH_TIME_BONUS_RATE) / MULTIPLIER_DENOMINATOR;
        
        return rewardWithRep + watchBonus;
    }

    /**
     * @dev Get pending rewards for a user (view function)
     */
    function getPendingRewards(address user) external view returns (uint256) {
        return _calculateRewards(user);
    }

    /**
     * @dev Update user's reputation multiplier (called by reputation oracle)
     * Higher reputation = higher yield
     */
    function updateReputationMultiplier(address user, uint256 multiplier) external onlyOwner {
        require(multiplier >= MULTIPLIER_DENOMINATOR && multiplier <= 30000, "Invalid multiplier"); // 1x to 3x
        userReputationMultiplier[user] = multiplier;
        
        // Update active stake if exists
        Stake storage userStake = stakes[user];
        if (userStake.amount > 0) {
            userStake.reputationAtStake = multiplier;
        }
        
        emit ReputationUpdated(user, multiplier);
    }

    /**
     * @dev Record watch time for a user (called by watch room contract)
     * Increases yield bonus
     */
    function recordWatchTime(address user, uint256 secondsWatched) external onlyOwner {
        watchTimeSeconds[user] += secondsWatched;
        
        // Calculate bonus earned
        uint256 bonusRate = (secondsWatched / 1 hours) * WATCH_TIME_BONUS_RATE;
        
        emit WatchTimeRecorded(user, secondsWatched, bonusRate);
    }

    /**
     * @dev Add bonus pool for a match outcome
     * Fans who predicted correctly can claim extra rewards
     */
    function addMatchBonus(bytes32 matchId, uint256 bonusAmount) external onlyOwner {
        require(bonusAmount > 0, "Bonus must be positive");
        rewardToken.safeTransferFrom(msg.sender, address(this), bonusAmount);
        matchBonusPools[matchId] += bonusAmount;
        
        emit MatchBonusAdded(matchId, bonusAmount);
    }

    /**
     * @dev Claim match outcome bonus (called by prediction contract)
     */
    function claimMatchBonus(address user, bytes32 matchId, uint256 bonusAmount) external onlyOwner {
        require(!userMatchParticipation[matchId][user], "Bonus already claimed");
        require(matchBonusPools[matchId] >= bonusAmount, "Insufficient bonus pool");
        
        userMatchParticipation[matchId][user] = true;
        matchBonusPools[matchId] -= bonusAmount;
        
        rewardToken.safeTransfer(user, bonusAmount);
        
        emit MatchBonusClaimed(user, matchId, bonusAmount);
    }

    /**
     * @dev Get user's stake info
     */
    function getUserStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 startTime,
        uint256 pendingRewards,
        uint256 totalClaimed,
        uint256 reputationMultiplier,
        uint256 watchTime,
        uint256 effectiveAPY
    ) {
        Stake memory userStake = stakes[user];
        uint256 repMult = userStake.reputationAtStake > 0 ? userStake.reputationAtStake : MULTIPLIER_DENOMINATOR;
        uint256 watchHours = watchTimeSeconds[user] / 1 hours;
        uint256 watchBonusAPY = watchHours * WATCH_TIME_BONUS_RATE;
        
        return (
            userStake.amount,
            userStake.startTime,
            _calculateRewards(user),
            userStake.totalRewardsClaimed,
            repMult,
            watchTimeSeconds[user],
            (BASE_APY * repMult / MULTIPLIER_DENOMINATOR) + watchBonusAPY
        );
    }

    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 totalStakedAmount,
        uint256 totalRewards,
        uint256 baseAPY
    ) {
        return (totalStaked, totalRewardsDistributed, BASE_APY);
    }

    /**
     * @dev Emergency withdraw (only owner, only in emergency)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

