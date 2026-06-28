// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract CollateralVault is ZamaEthereumConfig {
    error NotOwner();
    error PriceTooLarge();

    mapping(address => euint64) private collateral;
    mapping(address => euint64) private debt;

    address public owner;
    uint256 public mockPrice;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function setMockPrice(uint256 newPrice) external onlyOwner {
        if (newPrice > type(uint64).max) revert PriceTooLarge();
        mockPrice = newPrice;
    }

    function depositCollateral(externalEuint64 input, bytes calldata proof) external {
        euint64 encryptedInput = FHE.fromExternal(input, proof);
        euint64 currentCollateral = _loadCollateral(msg.sender);

        collateral[msg.sender] = FHE.allowThis(FHE.add(currentCollateral, encryptedInput));
        FHE.allow(collateral[msg.sender], msg.sender);
    }

    function borrowAgainst(externalEuint64 input, bytes calldata proof) external {
        euint64 encryptedInput = FHE.fromExternal(input, proof);
        euint64 currentDebt = _loadDebt(msg.sender);

        debt[msg.sender] = FHE.allowThis(FHE.add(currentDebt, encryptedInput));
        FHE.allow(debt[msg.sender], msg.sender);
    }

    // FOR DEMO PURPOSES ONLY: clears a user's encrypted position without encrypted repay logic.
    function emergencyWithdraw(address user) external onlyOwner {
        collateral[user] = FHE.allowThis(FHE.asEuint64(0));
        debt[user] = FHE.allowThis(FHE.asEuint64(0));
        FHE.allow(collateral[user], user);
        FHE.allow(debt[user], user);
    }
    function checkLiquidatable(address user) external returns (ebool) {
        euint64 userCollateral = _loadCollateral(user);
        euint64 userDebt = _loadDebt(user);
        ebool liquidatable = FHE.lt(FHE.mul(userCollateral, uint64(mockPrice)), userDebt);

        liquidatable = FHE.allowThis(liquidatable);
        return FHE.makePubliclyDecryptable(liquidatable);
    }

    function _loadCollateral(address user) internal returns (euint64) {
        euint64 value = collateral[user];
        if (!FHE.isInitialized(value)) {
            value = FHE.asEuint64(0);
        }
        return FHE.allowThis(value);
    }

    function _loadDebt(address user) internal returns (euint64) {
        euint64 value = debt[user];
        if (!FHE.isInitialized(value)) {
            value = FHE.asEuint64(0);
        }
        return FHE.allowThis(value);
    }
    function getCollateral(address user) external view returns (euint64) {
        return collateral[user];
    }

    function getDebt(address user) external view returns (euint64) {
        return debt[user];
    }
}
