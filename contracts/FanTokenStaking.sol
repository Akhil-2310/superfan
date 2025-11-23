// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FanTokenStaking
 * @dev Staking contract for Chiliz fan tokens with loyalty-based multipliers
 * 
 * Features:
 * - Stake fan tokens to earn rewards
 * - Loyalty multipliers based on off-chain scoring
 * - Time-based reward calculation
 * - Emergency withdrawal
 */
contract FanTokenStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 loyaltyMultiplier; // Basis points (e.g., 100 = 1.0x, 150 = 1.5x)
    }

    // Staking token (fan token)
    IERC20 public immutable stakingToken;
    
    // Reward token (can be same as staking or different)
    IERC20 public immutable rewardToken;
    
    // Base APY in basis points (e.g., 1000 = 10%)
    uint256 public baseAPY = 1000;
    
    // User stakes
    mapping(address => StakeInfo) public stakes;
    
    // Total staked amount
    uint256 public totalStaked;
    
    // Reward pool balance
    uint256 public rewardPool;
    
    // Minimum stake amount
    uint256 public minStakeAmount = 1e18; // 1 token
    
    // Loyalty oracle address (authorized to set multipliers)
    address public loyaltyOracle;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event LoyaltyMultiplierUpdated(address indexed user, uint256 multiplier);
    event APYUpdated(uint256 newAPY);
    event RewardPoolFunded(uint256 amount);

    constructor(
        address _stakingToken,
        address _rewardToken,
        address _loyaltyOracle
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_loyaltyOracle != address(0), "Invalid oracle");
        
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        loyaltyOracle = _loyaltyOracle;
    }

    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount >= minStakeAmount, "Amount below minimum");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // If user already has a stake, claim pending rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens from user
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake info
        if (userStake.amount == 0) {
            // New stake
            userStake.startTime = block.timestamp;
            userStake.loyaltyMultiplier = 100; // Default 1.0x
        }
        
        userStake.amount += amount;
        userStake.lastClaimTime = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        
        // Claim pending rewards
        _claimRewards(msg.sender);
        
        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // If fully unstaked, reset
        if (userStake.amount == 0) {
            delete stakes[msg.sender];
        }
        
        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal claim function
     */
    function _claimRewards(address user) internal {
        uint256 rewards = calculateRewards(user);
        
        if (rewards > 0) {
            require(rewardPool >= rewards, "Insufficient reward pool");
            
            StakeInfo storage userStake = stakes[user];
            userStake.lastClaimTime = block.timestamp;
            rewardPool -= rewards;
            
            rewardToken.safeTransfer(user, rewards);
            
            emit RewardsClaimed(user, rewards);
        }
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 baseReward = (userStake.amount * baseAPY * timeStaked) / (365 days * 10000);
        
        // Apply loyalty multiplier
        uint256 multipliedReward = (baseReward * userStake.loyaltyMultiplier) / 100;
        
        return multipliedReward;
    }

    /**
     * @dev Update loyalty multiplier (only oracle)
     */
    function updateLoyaltyMultiplier(address user, uint256 multiplier) external {
        require(msg.sender == loyaltyOracle, "Only oracle");
        require(multiplier >= 100 && multiplier <= 300, "Invalid multiplier"); // 1.0x to 3.0x
        
        StakeInfo storage userStake = stakes[user];
        require(userStake.amount > 0, "No active stake");
        
        // Claim existing rewards before updating multiplier
        _claimRewards(user);
        
        userStake.loyaltyMultiplier = multiplier;
        
        emit LoyaltyMultiplierUpdated(user, multiplier);
    }

    /**
     * @dev Fund the reward pool (only owner)
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        
        emit RewardPoolFunded(amount);
    }

    /**
     * @dev Update base APY (only owner)
     */
    function updateAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 10000, "APY too high"); // Max 100%
        baseAPY = newAPY;
        
        emit APYUpdated(newAPY);
    }

    /**
     * @dev Update loyalty oracle (only owner)
     */
    function updateLoyaltyOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle");
        loyaltyOracle = newOracle;
    }

    /**
     * @dev Update minimum stake amount (only owner)
     */
    function updateMinStakeAmount(uint256 newMin) external onlyOwner {
        minStakeAmount = newMin;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Get user stake info
     */
    function getUserStake(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 loyaltyMultiplier,
        uint256 pendingRewards
    ) {
        StakeInfo memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.startTime,
            userStake.lastClaimTime,
            userStake.loyaltyMultiplier,
            calculateRewards(user)
        );
    }
}

