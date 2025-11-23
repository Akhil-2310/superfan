// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title TestSelfVerificationRoot
 * @notice Test implementation of SelfVerificationRoot for testing purposes
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;
    string public lastUserName; // <-- store decoded/joined name

    // Events for testing
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData);
    event VerificationCompletedWithName(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData, string fullName);

    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scope The verification scope string
     * @param _verificationConfig Unformatted verification config
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scope,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scope)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
    }

    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        // Extract/Join name parts if present. According to docs name is string[] => [first, middle, last]
        if (output.name.length > 0) {
            lastUserName = _joinName(output.name);
        } else {
            lastUserName = "";
        }

        emit VerificationCompleted(output, userData);
        emit VerificationCompletedWithName(output, userData, lastUserName);
    }

    /**
     * @dev Join string array parts into a full name, skipping empty parts and ensuring single spaces.
     * @param parts Array of name parts (e.g. [first, middle, last])
     * @return joined Full name as a single string
     */
    function _joinName(string[] memory parts) internal pure returns (string memory) {
        bytes memory buffer;
        bool added = false;
        for (uint256 i = 0; i < parts.length; i++) {
            // skip empty parts
            if (bytes(parts[i]).length == 0) {
                continue;
            }

            if (added) {
                // add a space before the next non-empty part
                buffer = abi.encodePacked(buffer, " ", parts[i]);
            } else {
                // first non-empty part
                buffer = abi.encodePacked(buffer, parts[i]);
                added = true;
            }
        }
        return string(buffer);
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }
}
