export const PREDICTION_MARKET_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_fanfiToken",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "calculatePotentialReward",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelMatch",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRefund",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimReward",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMatch",
    "inputs": [
      {
        "name": "_externalMatchId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_lockTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_matchTime",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyWithdraw",
    "inputs": [
      {
        "name": "_token",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fanfiToken",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMatch",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "matchId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "lockTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "matchTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum PredictionMarket.MatchStatus"
      },
      {
        "name": "result",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "totalStaked",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "homePool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "awayPool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "drawPool",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMatchCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPrediction",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "predicted",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "claimed",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lockMatch",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "matchIds",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "matches",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "matchId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "lockTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "matchTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum PredictionMarket.MatchStatus"
      },
      {
        "name": "result",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "totalStaked",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "homePool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "awayPool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "drawPool",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "predict",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_outcome",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "predictions",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "predicted",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "claimed",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolveMatch",
    "inputs": [
      {
        "name": "_matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_result",
        "type": "uint8",
        "internalType": "enum PredictionMarket.Outcome"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "MatchCancelled",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchCreated",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "externalMatchId",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "lockTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "matchTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchLocked",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchResolved",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum PredictionMarket.Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PredictionPlaced",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum PredictionMarket.Outcome"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardClaimed",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  }
] as const;

