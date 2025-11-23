// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanFiAchievements
 * @dev NFT contract for FanFi achievement badges
 * 
 * Features:
 * - Soulbound tokens (non-transferable except by admin)
 * - Achievement categories (Quest Master, Predictor, Duel Champion, etc.)
 * - Rarity tiers (Common, Rare, Epic, Legendary)
 * - Metadata for each achievement
 * - Enumerable for easy querying
 */
contract FanFiAchievements is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;
    
    // Achievement types
    enum AchievementType {
        FIRST_PREDICTION,      // 0
        PERFECT_PREDICTOR,     // 1
        QUEST_MASTER,          // 2
        DUEL_CHAMPION,         // 3
        SOCIAL_STAR,           // 4
        LOYALTY_LEGEND,        // 5
        WATCH_PARTY_HOST,      // 6
        STREAK_KEEPER,         // 7
        TOKEN_HOLDER,          // 8
        REPUTATION_ELITE,      // 9
        EARLY_ADOPTER,         // 10
        COMMUNITY_BUILDER      // 11
    }
    
    // Rarity levels
    enum Rarity {
        COMMON,      // Easy to achieve
        RARE,        // Medium difficulty
        EPIC,        // Hard to achieve
        LEGENDARY    // Very rare
    }
    
    // Achievement metadata
    struct Achievement {
        AchievementType achievementType;
        Rarity rarity;
        uint256 mintedAt;
        string metadata; // JSON metadata or IPFS hash
    }
    
    // Mapping from token ID to achievement data
    mapping(uint256 => Achievement) public achievements;
    
    // Mapping from user to achievement type to token ID (prevent duplicates)
    mapping(address => mapping(AchievementType => uint256)) public userAchievements;
    
    // Minter role for backend services
    mapping(address => bool) public minters;
    
    // Events
    event AchievementMinted(
        address indexed to,
        uint256 indexed tokenId,
        AchievementType achievementType,
        Rarity rarity
    );
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC721("FanFi Achievements", "FANFI-ACH") Ownable(msg.sender) {}
    
    /**
     * @dev Add a minter (e.g., backend reward service)
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
     * @dev Mint an achievement NFT
     * Can only be called by owner or authorized minters
     */
    function mintAchievement(
        address to,
        AchievementType achievementType,
        Rarity rarity,
        string memory metadata
    ) external returns (uint256) {
        require(
            msg.sender == owner() || minters[msg.sender],
            "Not authorized to mint"
        );
        require(to != address(0), "Invalid recipient");
        
        // Check if user already has this achievement
        uint256 existingTokenId = userAchievements[to][achievementType];
        require(existingTokenId == 0, "Achievement already claimed");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadata);
        
        achievements[tokenId] = Achievement({
            achievementType: achievementType,
            rarity: rarity,
            mintedAt: block.timestamp,
            metadata: metadata
        });
        
        userAchievements[to][achievementType] = tokenId;
        
        emit AchievementMinted(to, tokenId, achievementType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint achievements (gas efficient)
     */
    function batchMintAchievements(
        address[] calldata recipients,
        AchievementType[] calldata achievementTypes,
        Rarity[] calldata rarities,
        string[] calldata metadatas
    ) external {
        require(
            msg.sender == owner() || minters[msg.sender],
            "Not authorized to mint"
        );
        require(
            recipients.length == achievementTypes.length &&
            recipients.length == rarities.length &&
            recipients.length == metadatas.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            // Skip if already has achievement
            if (userAchievements[recipients[i]][achievementTypes[i]] == 0) {
                uint256 tokenId = _tokenIdCounter;
                _tokenIdCounter++;
                
                _safeMint(recipients[i], tokenId);
                _setTokenURI(tokenId, metadatas[i]);
                
                achievements[tokenId] = Achievement({
                    achievementType: achievementTypes[i],
                    rarity: rarities[i],
                    mintedAt: block.timestamp,
                    metadata: metadatas[i]
                });
                
                userAchievements[recipients[i]][achievementTypes[i]] = tokenId;
                
                emit AchievementMinted(
                    recipients[i],
                    tokenId,
                    achievementTypes[i],
                    rarities[i]
                );
            }
        }
    }
    
    /**
     * @dev Get all achievements owned by an address
     */
    function getAchievementsByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address user, AchievementType achievementType)
        external
        view
        returns (bool)
    {
        return userAchievements[user][achievementType] != 0;
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 tokenId)
        external
        view
        returns (Achievement memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev Override transfer to make soulbound (non-transferable)
     * Only owner can transfer (for recovery purposes)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Allow burning (to == address(0))
        // Allow owner transfers (for recovery)
        require(
            from == address(0) ||
            to == address(0) ||
            msg.sender == owner(),
            "Achievements are soulbound"
        );
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Get total number of achievements minted
     */
    function totalAchievements() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override required functions
    function _increaseBalance(address account, uint128 value)
        internal
        virtual
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

