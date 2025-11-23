// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanFiToken
 * @dev Custom ERC20 token for FanFi platform rewards
 * 
 * Features:
 * - Mintable by owner (for reward distribution)
 * - Burnable by holders
 * - Fixed supply cap
 * - Transfer hooks for reputation tracking
 */
contract FanFiToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Minter role for reward distribution
    mapping(address => bool) public minters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed to, uint256 amount, string reason);

    constructor() ERC20("FanFi Token", "FANFI") Ownable(msg.sender) {
        // Mint initial supply to owner for distribution
        _mint(msg.sender, 100_000_000 * 10**18); // 100M initial
    }

    /**
     * @dev Add a minter (e.g., reward contract)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens for rewards
     * Can only be called by owner or authorized minters
     */
    function mintReward(
        address to,
        uint256 amount,
        string memory reason
    ) external {
        require(
            msg.sender == owner() || minters[msg.sender],
            "Not authorized to mint"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(to, amount);
        emit RewardMinted(to, amount, reason);
    }

    /**
     * @dev Batch mint rewards (gas efficient)
     */
    function batchMintRewards(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string memory reason
    ) external {
        require(
            msg.sender == owner() || minters[msg.sender],
            "Not authorized to mint"
        );
        require(recipients.length == amounts.length, "Array length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Max supply exceeded");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit RewardMinted(recipients[i], amounts[i], reason);
        }
    }

    /**
     * @dev Override transfer to track activity
     * This can be used by reputation contracts to track engagement
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        super._update(from, to, value);
        
        // Emit event for reputation tracking
        // Reputation contract can listen to these events
    }
}

