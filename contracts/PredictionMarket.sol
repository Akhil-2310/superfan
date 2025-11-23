// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @notice On-chain prediction market for sports matches
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    IERC20 public immutable fanfiToken;

    enum Outcome { None, Home, Away, Draw }
    enum MatchStatus { Open, Locked, Resolved, Cancelled }

    struct Match {
        string matchId;          // External match identifier
        uint256 lockTime;        // When betting closes
        uint256 matchTime;       // Scheduled match time
        MatchStatus status;
        Outcome result;          // Final result
        uint256 totalStaked;     // Total tokens staked
        uint256 homePool;        // Tokens staked on home
        uint256 awayPool;        // Tokens staked on away
        uint256 drawPool;        // Tokens staked on draw
    }

    struct Prediction {
        Outcome predicted;
        uint256 amount;
        bool claimed;
    }

    // Match ID => Match data
    mapping(bytes32 => Match) public matches;
    
    // Match ID => User => Prediction
    mapping(bytes32 => mapping(address => Prediction)) public predictions;
    
    // Array of all match IDs for iteration
    bytes32[] public matchIds;

    event MatchCreated(bytes32 indexed matchId, string externalMatchId, uint256 lockTime, uint256 matchTime);
    event PredictionPlaced(bytes32 indexed matchId, address indexed user, Outcome outcome, uint256 amount);
    event MatchLocked(bytes32 indexed matchId);
    event MatchResolved(bytes32 indexed matchId, Outcome result);
    event RewardClaimed(bytes32 indexed matchId, address indexed user, uint256 amount);
    event MatchCancelled(bytes32 indexed matchId);

    constructor(address _fanfiToken) Ownable(msg.sender) {
        fanfiToken = IERC20(_fanfiToken);
    }

    /**
     * @notice Create a new match for predictions
     * @param _externalMatchId External identifier (e.g., from TheSportsDB)
     * @param _lockTime When betting closes (typically 1 hour before match)
     * @param _matchTime Scheduled match time
     */
    function createMatch(
        string calldata _externalMatchId,
        uint256 _lockTime,
        uint256 _matchTime
    ) external onlyOwner returns (bytes32) {
        require(_lockTime > block.timestamp, "Lock time must be in future");
        require(_matchTime > _lockTime, "Match time must be after lock time");

        bytes32 matchId = keccak256(abi.encodePacked(_externalMatchId, _matchTime));
        require(matches[matchId].lockTime == 0, "Match already exists");

        matches[matchId] = Match({
            matchId: _externalMatchId,
            lockTime: _lockTime,
            matchTime: _matchTime,
            status: MatchStatus.Open,
            result: Outcome.None,
            totalStaked: 0,
            homePool: 0,
            awayPool: 0,
            drawPool: 0
        });

        matchIds.push(matchId);
        emit MatchCreated(matchId, _externalMatchId, _lockTime, _matchTime);

        return matchId;
    }

    /**
     * @notice Place a prediction on a match
     * @param _matchId Match identifier
     * @param _outcome Predicted outcome (1=Home, 2=Away, 3=Draw)
     * @param _amount Amount of FANFI tokens to stake
     */
    function predict(
        bytes32 _matchId,
        Outcome _outcome,
        uint256 _amount
    ) external nonReentrant {
        Match storage matchData = matches[_matchId];
        require(matchData.lockTime > 0, "Match does not exist");
        require(matchData.status == MatchStatus.Open, "Betting is closed");
        require(block.timestamp < matchData.lockTime, "Betting period ended");
        require(_outcome != Outcome.None, "Invalid outcome");
        require(_amount >= 10 ether, "Minimum bet is 10 FANFI");
        require(_amount <= 1000 ether, "Maximum bet is 1000 FANFI");

        Prediction storage userPrediction = predictions[_matchId][msg.sender];
        require(userPrediction.amount == 0, "Already predicted for this match");

        // Transfer tokens from user
        require(
            fanfiToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        // Record prediction
        userPrediction.predicted = _outcome;
        userPrediction.amount = _amount;
        userPrediction.claimed = false;

        // Update pools
        matchData.totalStaked += _amount;
        if (_outcome == Outcome.Home) {
            matchData.homePool += _amount;
        } else if (_outcome == Outcome.Away) {
            matchData.awayPool += _amount;
        } else {
            matchData.drawPool += _amount;
        }

        emit PredictionPlaced(_matchId, msg.sender, _outcome, _amount);
    }

    /**
     * @notice Lock a match (close betting)
     * @param _matchId Match identifier
     */
    function lockMatch(bytes32 _matchId) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Open, "Match not open");
        require(block.timestamp >= matchData.lockTime, "Lock time not reached");

        matchData.status = MatchStatus.Locked;
        emit MatchLocked(_matchId);
    }

    /**
     * @notice Resolve a match with the actual result
     * @param _matchId Match identifier
     * @param _result Actual outcome (1=Home, 2=Away, 3=Draw)
     */
    function resolveMatch(bytes32 _matchId, Outcome _result) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Locked, "Match not locked");
        require(_result != Outcome.None, "Invalid result");

        matchData.status = MatchStatus.Resolved;
        matchData.result = _result;

        emit MatchResolved(_matchId, _result);
    }

    /**
     * @notice Claim rewards for a correct prediction
     * @param _matchId Match identifier
     */
    function claimReward(bytes32 _matchId) external nonReentrant {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Resolved, "Match not resolved");

        Prediction storage userPrediction = predictions[_matchId][msg.sender];
        require(userPrediction.amount > 0, "No prediction found");
        require(!userPrediction.claimed, "Already claimed");
        require(userPrediction.predicted == matchData.result, "Prediction incorrect");

        userPrediction.claimed = true;

        // Calculate reward
        uint256 winningPool;
        if (matchData.result == Outcome.Home) {
            winningPool = matchData.homePool;
        } else if (matchData.result == Outcome.Away) {
            winningPool = matchData.awayPool;
        } else {
            winningPool = matchData.drawPool;
        }

        require(winningPool > 0, "No winning pool");

        // User's share of the total pool
        // Reward = (user's stake / winning pool) * total pool
        uint256 reward = (userPrediction.amount * matchData.totalStaked) / winningPool;

        require(fanfiToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardClaimed(_matchId, msg.sender, reward);
    }

    /**
     * @notice Cancel a match and refund all bets
     * @param _matchId Match identifier
     */
    function cancelMatch(bytes32 _matchId) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(
            matchData.status == MatchStatus.Open || matchData.status == MatchStatus.Locked,
            "Cannot cancel resolved match"
        );

        matchData.status = MatchStatus.Cancelled;
        emit MatchCancelled(_matchId);
    }

    /**
     * @notice Claim refund for a cancelled match
     * @param _matchId Match identifier
     */
    function claimRefund(bytes32 _matchId) external nonReentrant {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Cancelled, "Match not cancelled");

        Prediction storage userPrediction = predictions[_matchId][msg.sender];
        require(userPrediction.amount > 0, "No prediction found");
        require(!userPrediction.claimed, "Already claimed");

        userPrediction.claimed = true;

        require(
            fanfiToken.transfer(msg.sender, userPrediction.amount),
            "Refund transfer failed"
        );
    }

    /**
     * @notice Get match details
     * @param _matchId Match identifier
     */
    function getMatch(bytes32 _matchId) external view returns (
        string memory matchId,
        uint256 lockTime,
        uint256 matchTime,
        MatchStatus status,
        Outcome result,
        uint256 totalStaked,
        uint256 homePool,
        uint256 awayPool,
        uint256 drawPool
    ) {
        Match storage m = matches[_matchId];
        return (
            m.matchId,
            m.lockTime,
            m.matchTime,
            m.status,
            m.result,
            m.totalStaked,
            m.homePool,
            m.awayPool,
            m.drawPool
        );
    }

    /**
     * @notice Get user's prediction for a match
     * @param _matchId Match identifier
     * @param _user User address
     */
    function getUserPrediction(bytes32 _matchId, address _user) external view returns (
        Outcome predicted,
        uint256 amount,
        bool claimed
    ) {
        Prediction storage p = predictions[_matchId][_user];
        return (p.predicted, p.amount, p.claimed);
    }

    /**
     * @notice Calculate potential reward for a user
     * @param _matchId Match identifier
     * @param _user User address
     */
    function calculatePotentialReward(bytes32 _matchId, address _user) external view returns (uint256) {
        Match storage matchData = matches[_matchId];
        Prediction storage userPrediction = predictions[_matchId][_user];

        if (userPrediction.amount == 0) return 0;
        if (matchData.status != MatchStatus.Resolved) return 0;
        if (userPrediction.predicted != matchData.result) return 0;

        uint256 winningPool;
        if (matchData.result == Outcome.Home) {
            winningPool = matchData.homePool;
        } else if (matchData.result == Outcome.Away) {
            winningPool = matchData.awayPool;
        } else {
            winningPool = matchData.drawPool;
        }

        if (winningPool == 0) return 0;

        return (userPrediction.amount * matchData.totalStaked) / winningPool;
    }

    /**
     * @notice Get total number of matches
     */
    function getMatchCount() external view returns (uint256) {
        return matchIds.length;
    }

    /**
     * @notice Emergency withdraw (only if something goes wrong)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}

