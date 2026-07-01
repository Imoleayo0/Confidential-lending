"use client";

import { useState } from "react";
import { COLLATERAL_VAULT_ABI, COLLATERAL_VAULT_ADDRESS } from "../config/contracts";
import { useEncrypt } from "@zama-fhe/react-sdk";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const inputClassName =
  "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[1rem] text-slate-950 outline-none transition focus:border-[#ffd208] focus:ring-4 focus:ring-[#ffd208]/20";

const buttonClassName =
  "inline-flex h-12 items-center justify-center rounded-2xl bg-[#ffd208] px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#f5c800] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

function parsePositiveWholeNumber(value: string) {
  if (!value.trim()) {
    throw new Error("Enter an amount first");
  }
  const parsed = BigInt(value);
  if (parsed <= 0n) {
    throw new Error("Amount must be greater than zero");
  }
  return parsed;
}

export function DepositForm() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState("");

  const encrypt = useEncrypt();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  async function handleDeposit() {
    if (!address) return;

    setError("");
    setIsEncrypting(true);

    try {
      const value = parsePositiveWholeNumber(amount);
      const enc = await encrypt.mutateAsync({
        values: [{ value, type: "euint64" }],
        contractAddress: COLLATERAL_VAULT_ADDRESS,
        userAddress: address,
      });

      writeContract({
        abi: COLLATERAL_VAULT_ABI,
        address: COLLATERAL_VAULT_ADDRESS,
        functionName: "depositCollateral",
        args: [enc.encryptedValues[0]!, enc.inputProof],
        gas: 15_000_000n,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Encryption failed");
    } finally {
      setIsEncrypting(false);
    }
  }

  if (!isConnected) {
    return (
      <article className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
        <div className="mb-3 inline-flex rounded-full bg-black/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Step 1
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Deposit collateral</h2>
        <p className="m-0 text-sm leading-7 text-slate-500">
          Connect your wallet to encrypt a collateral amount in the browser and send it to the vault.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="rounded-full bg-[#ffd208]/20 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-700">
          Step 1
        </span>
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-slate-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Deposit collateral</h2>
      <p className="m-0 text-sm leading-7 text-slate-500">
        The amount is encrypted before it leaves your browser, then written to the vault as an encrypted handle.
      </p>

      <div className="mt-6 grid gap-4">
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          placeholder="Amount (e.g. 1000)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className={inputClassName}
        />

        <button
          onClick={handleDeposit}
          disabled={!amount || isEncrypting || isPending || isConfirming || encrypt.isPending}
          className={buttonClassName}
        >
          {isEncrypting || encrypt.isPending
            ? "Encrypting..."
            : isPending
              ? "Confirm in wallet"
              : isConfirming
                ? "Confirming..."
                : "Deposit collateral"}
        </button>

        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700">
            Deposit confirmed.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </article>
  );
}
