import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { CollateralVault, CollateralVault__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CollateralVault")) as CollateralVault__factory;
  const vault = (await factory.deploy()) as CollateralVault;
  const vaultAddress = await vault.getAddress();
  return { vault, vaultAddress };
}

describe("CollateralVault", function () {
  let signers: Signers;
  let vault: CollateralVault;
  let vaultAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
    ({ vault, vaultAddress } = await deployFixture());
  });

  it("owner can set mock price", async function () {
    await vault.connect(signers.deployer).setMockPrice(1000);
    expect(await vault.mockPrice()).to.equal(1000n);
  });

  it("user can deposit encrypted collateral", async function () {
    const encryptedInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(500n).encrypt();

    const tx = await vault
      .connect(signers.alice)
      .depositCollateral(encryptedInput.handles[0], encryptedInput.inputProof);
    await tx.wait();

    const encryptedCollateral = await vault.connect(signers.alice).getCollateral.staticCall(signers.alice.address);
    const clearCollateral = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      ethers.hexlify(encryptedCollateral) as `0x${string}`,
      vaultAddress,
      signers.alice,
    );
    expect(clearCollateral).to.equal(500n);
  });

  it("user can borrow against collateral", async function () {
    const encryptedInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(100n).encrypt();

    const tx = await vault.connect(signers.alice).borrowAgainst(encryptedInput.handles[0], encryptedInput.inputProof);
    await tx.wait();

    const encryptedDebt = await vault.connect(signers.alice).getDebt.staticCall(signers.alice.address);
    const clearDebt = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      ethers.hexlify(encryptedDebt) as `0x${string}`,
      vaultAddress,
      signers.alice,
    );
    expect(clearDebt).to.equal(100n);
  });

  it("checkLiquidatable works when debt exceeds collateral value", async function () {
    await vault.connect(signers.deployer).setMockPrice(1n);

    const collateralInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(100n).encrypt();
    await (
      await vault.connect(signers.alice).depositCollateral(collateralInput.handles[0], collateralInput.inputProof)
    ).wait();

    const debtInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(200n).encrypt();
    await (await vault.connect(signers.alice).borrowAgainst(debtInput.handles[0], debtInput.inputProof)).wait();

    const tx = await vault.connect(signers.deployer).checkLiquidatable(signers.alice.address);
    await tx.wait();

    const encryptedResult = await vault.connect(signers.deployer).checkLiquidatable.staticCall(signers.alice.address);
    const isLiquidatable = await fhevm.publicDecryptEbool(ethers.hexlify(encryptedResult) as `0x${string}`);
    expect(isLiquidatable).to.equal(true);
  });

  it("checkLiquidatable returns true when debt exceeds collateral value", async function () {
    await vault.connect(signers.deployer).setMockPrice(1n);

    const collateralInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(100n).encrypt();
    await (
      await vault.connect(signers.alice).depositCollateral(collateralInput.handles[0], collateralInput.inputProof)
    ).wait();

    const debtInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(200n).encrypt();
    await (await vault.connect(signers.alice).borrowAgainst(debtInput.handles[0], debtInput.inputProof)).wait();

    const tx = await vault.connect(signers.deployer).checkLiquidatable(signers.alice.address);
    await tx.wait();

    const encryptedResult = await vault.connect(signers.deployer).checkLiquidatable.staticCall(signers.alice.address);
    const isLiquidatable = await fhevm.publicDecryptEbool(ethers.hexlify(encryptedResult) as `0x${string}`);
    expect(isLiquidatable).to.equal(true);
  });

  it("checkLiquidatable returns false when collateral covers debt", async function () {
    await vault.connect(signers.deployer).setMockPrice(1n);

    const collateralInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(500n).encrypt();
    await (
      await vault.connect(signers.alice).depositCollateral(collateralInput.handles[0], collateralInput.inputProof)
    ).wait();

    const debtInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(100n).encrypt();
    await (await vault.connect(signers.alice).borrowAgainst(debtInput.handles[0], debtInput.inputProof)).wait();

    const tx = await vault.connect(signers.deployer).checkLiquidatable(signers.alice.address);
    await tx.wait();

    const encryptedResult = await vault.connect(signers.deployer).checkLiquidatable.staticCall(signers.alice.address);
    const isLiquidatable = await fhevm.publicDecryptEbool(ethers.hexlify(encryptedResult) as `0x${string}`);
    expect(isLiquidatable).to.equal(false);
  });

  it("owner can emergency withdraw for demo", async function () {
    const encryptedInput = await fhevm.createEncryptedInput(vaultAddress, signers.alice.address).add64(250n).encrypt();

    await (
      await vault.connect(signers.alice).depositCollateral(encryptedInput.handles[0], encryptedInput.inputProof)
    ).wait();
    await vault.connect(signers.deployer).emergencyWithdraw(signers.alice.address);

    const encryptedCollateral = await vault.connect(signers.alice).getCollateral.staticCall(signers.alice.address);
    const clearCollateral = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      ethers.hexlify(encryptedCollateral) as `0x${string}`,
      vaultAddress,
      signers.alice,
    );
    expect(clearCollateral).to.equal(0n);
  });
});
