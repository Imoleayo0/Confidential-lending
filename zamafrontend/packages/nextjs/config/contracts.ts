export const COLLATERAL_VAULT_ADDRESS = "0xb49a0720A017a058CEc6D7fd9147E2A1E51B8EEc" as const;

export const COLLATERAL_VAULT_ABI = [
  {
    name: "depositCollateral",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "input", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "borrowAgainst",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "input", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "checkLiquidatable",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "getCollateral",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "getDebt",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "mockPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "setMockPrice",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "newPrice", type: "uint256" }],
    outputs: [],
  },
  {
    name: "emergencyWithdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const SEPOLIA_CHAIN_ID = 11155111;
