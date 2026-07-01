# EVA — Confidential Lending on Zama fhEVM

> Borrow against hidden collateral. Bots can't hunt what they can't see.

## The Problem

On every DeFi lending platform today — Aave, Compound, Sky — your entire financial position is public. Collateral
amount, debt, and health factor are all readable on Etherscan in real time.

Liquidation bots scrape this data 24/7. The moment your health factor approaches 1.0, bots front-run your position,
short the collateral asset, and trigger liquidation before you can react.

**$4.65 billion has been extracted this way since Aave launched.** **$44 billion in Aave TVL sits exposed right now.**

## The Solution

EVA encrypts collateral, debt, and health factor using Zama's Fully Homomorphic Encryption (FHE). Your position is
computed on-chain without ever being revealed.

- Deposit encrypted collateral — nobody sees the amount
- Borrow against it — debt stays private
- Health factor computed on encrypted data — bots get only a boolean
- Liquidation happens when needed — without position hunting

## How It Works

User inputs amount

↓

fhEVM SDK encrypts in browser (WASM via RelayerWeb)

↓

Encrypted ciphertext submitted on-chain

↓

Contract stores euint64 collateral + euint64 debt

↓

checkLiquidatable() computes FHE.lt(FHE.mul(collateral, price), debt)

↓

Returns ebool — publicly decryptable boolean only

↓

Bot gets true/false — never the position size

## What's Encrypted vs Public

| Data                | Visibility            |
| ------------------- | --------------------- |
| Collateral amount   | 🔒 Encrypted          |
| Debt amount         | 🔒 Encrypted          |
| Health factor       | 🔒 Encrypted          |
| Liquidation boolean | ✅ Public (by design) |
| Transaction sender  | ✅ Public             |
| Contract address    | ✅ Public             |

## Technical Architecture

**Smart Contract** — `contracts/CollateralVault.sol`

- `euint64 collateral` and `euint64 debt` per address
- `FHE.allowThis()` — contract computes on its own encrypted state
- `FHE.allow(value, user)` — ACL gating, only owner decrypts their values
- Health factor: `FHE.lt(FHE.mul(collateral, mockPrice), debt)` — no division required
- `makePubliclyDecryptable(ebool)` — liquidation boolean readable by anyone

**Frontend** — `zamafrontend/packages/nextjs`

- Next.js 15 + `@zama-fhe/react-sdk` + `RelayerWeb`
- `useEncrypt()` hook — browser-side encryption via Zama CDN WASM
- wagmi + RainbowKit for wallet connection
- Three pages: Deposit, Borrow, My Position

## Deployment

**Network:** Sepolia Testnet

**Contract:** `0xb49a0720A017a058CEc6D7fd9147E2A1E51B8EEc`

[View on Etherscan](https://sepolia.etherscan.io/address/0xb49a0720A017a058CEc6D7fd9147E2A1E51B8EEc)

## Run Locally

```bash
# Clone
git clone https://github.com/Imoleayo0/Confidential-lending.git
cd Confidential-lending

# Install contract dependencies
npm install

# Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat deploy --network sepolia --tags CollateralVault

# Frontend
cd zamafrontend/packages/nextjs
cp .env.example .env.local
# Add NEXT_PUBLIC_ALCHEMY_API_KEY and NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
pnpm install
pnpm dev
```

## Test Coverage

CollateralVault

✔ owner can set mock price

✔ user can deposit encrypted collateral

✔ user can borrow against collateral

✔ checkLiquidatable works when debt exceeds collateral value

✔ checkLiquidatable returns true when debt exceeds collateral value

✔ checkLiquidatable returns false when collateral covers debt

✔ owner can emergency withdraw for demo 10 passing

## Honest Limitations

**Mock oracle** — collateral price is set manually by the owner for demo purposes. A production version requires an
encrypted oracle feed — an open research problem on fhEVM. This contract solves the collateral/debt/health-factor
exposure layer; the oracle layer is explicitly out of scope and documented as future work.

**Emergency withdraw** — plaintext exit function for demo purposes only, labeled clearly in code. Encrypted repay
follows the same `FHE.fromExternal` pattern as deposit and is the natural next step.

## Why This Hasn't Been Built Before

FHE division is expensive. A naive health factor implementation requires `(collateral × price) / debt` — dividing two
encrypted values is complex and gas-intensive in fhEVM today.

EVA avoids this entirely by reformulating: instead of computing `HF < 1.0`, we check `collateral × price < debt` using
`FHE.lt(FHE.mul(collateral, price), debt)`. Same result, no division, works within current fhEVM constraints.

## Future Work

- Encrypted oracle price feed
- Encrypted interest accrual
- Multi-asset collateral
- Encrypted repay function
- Production liquidation engine

## Built For

Zama Developer Program — Builder Track Season 3

## License

MIT
