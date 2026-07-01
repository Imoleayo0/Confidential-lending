"use client";

import { useMemo, useState } from "react";
import { createInstance, SepoliaConfigV2 } from "@zama-fhe/relayer-sdk/web";
import { COLLATERAL_VAULT_ABI, COLLATERAL_VAULT_ADDRESS } from "../config/contracts";
import { wagmiConfig } from "../services/web3/wagmiConfig";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { simulateContract } from "wagmi/actions";

const inputClassName =
  "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[1rem] text-slate-950 outline-none transition focus:border-[#ffd208] focus:ring-4 focus:ring-[#ffd208]/20";

const buttonClassName =
  "inline-flex h-12 items-center justify-center rounded-2xl bg-[#ffd208] px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#f5c800] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const blackButtonClassName =
  "inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export function PositionDashboard() {
  const { address, isConnected } = useAccount();
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState("");
  const [liquidationStatus, setLiquidationStatus] = useState<"liquidatable" | "safe" | null>(null);
  const [isCheckingLiquidation, setIsCheckingLiquidation] = useState(false);

  const ownerQuery = useReadContract({
    abi: COLLATERAL_VAULT_ABI,
    address: COLLATERAL_VAULT_ADDRESS,
    functionName: "owner",
  });

  const mockPriceQuery = useReadContract({
    abi: COLLATERAL_VAULT_ABI,
    address: COLLATERAL_VAULT_ADDRESS,
    functionName: "mockPrice",
  });

  const isOwner = useMemo(() => {
    if (!address || !ownerQuery.data) return false;
    return address.toLowerCase() === String(ownerQuery.data).toLowerCase();
  }, [address, ownerQuery.data]);

  const { writeContract: writePrice, data: priceTxHash, isPending: isPricePending } = useWriteContract();
  const { isLoading: isPriceConfirming, isSuccess: isPriceSuccess } = useWaitForTransactionReceipt({
    hash: priceTxHash,
  });

  const { writeContract: writeWithdraw, data: withdrawTxHash, isPending: isWithdrawPending } = useWriteContract();
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  function handleSetPrice() {
    if (!isOwner || !newPrice) return;
    setError("");
    writePrice({
      abi: COLLATERAL_VAULT_ABI,
      address: COLLATERAL_VAULT_ADDRESS,
      functionName: "setMockPrice",
      args: [BigInt(newPrice)],
    });
  }

  async function handleCheckLiquidatable() {
    if (!address) return;
    setError("");
    setLiquidationStatus(null);
    setIsCheckingLiquidation(true);

    try {
      const { result: encryptedResult } = await simulateContract(wagmiConfig, {
        abi: COLLATERAL_VAULT_ABI,
        address: COLLATERAL_VAULT_ADDRESS,
        functionName: "checkLiquidatable",
        args: [address],
        account: address,
      });

      const ethereum = typeof window !== "undefined" ? (window as Window & { ethereum?: unknown }).ethereum : undefined;
      if (!ethereum) {
        throw new Error("Connect a wallet to decrypt the result");
      }

      const fhevm = await createInstance({
        ...SepoliaConfigV2,
        network: ethereum as Parameters<typeof createInstance>[0]["network"],
      });

      const result = await fhevm.publicDecrypt([encryptedResult as `0x${string}`]);
      const clearValues = result.clearValues as Record<string, boolean | bigint | string>;
      const decrypted = clearValues[String(encryptedResult)];
      setLiquidationStatus(Boolean(decrypted) ? "liquidatable" : "safe");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liquidation check failed");
    } finally {
      setIsCheckingLiquidation(false);
    }
  }

  function handleEmergencyWithdraw() {
    if (!address || !isOwner) return;
    setError("");
    writeWithdraw({
      abi: COLLATERAL_VAULT_ABI,
      address: COLLATERAL_VAULT_ADDRESS,
      functionName: "emergencyWithdraw",
      args: [address],
    });
  }

  if (!isConnected) {
    return (
      <article className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
        <div className="mb-3 inline-flex rounded-full bg-black/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Step 3
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">My positions</h2>
        <p className="m-0 text-sm leading-7 text-slate-500">
          Connect your wallet to inspect mock pricing, run liquidation checks, and use the admin tools.
        </p>
      </article>
    );
  }

  const mockPrice = mockPriceQuery.data?.toString() ?? "--";
  const owner = ownerQuery.data ? String(ownerQuery.data) : "--";

  return (
    <article className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-[#ffd208]/20 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-700">
            Step 3
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">My positions</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Use the owner-only tools to simulate price movements or clear a position for the demo flow.
          </p>
        </div>

        <div className="grid gap-3 rounded-[22px] border border-black/10 bg-[#faf8f3] p-4 text-sm text-slate-600 md:min-w-[260px]">
          <div className="flex items-center justify-between gap-4">
            <span>Mock price</span>
            <strong className="text-slate-950">{mockPrice}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Owner</span>
            <strong className="text-slate-950">
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Admin access</span>
            <strong className={isOwner ? "text-emerald-700" : "text-amber-600"}>
              {isOwner ? "Enabled" : "Read only"}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex h-full flex-col rounded-[22px] border border-black/10 bg-white p-5">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-500">
              Owner only
            </span>
            <h3 className="m-0 text-base font-semibold tracking-[-0.03em] text-slate-950">Set mock price</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Simulate a price shift before checking liquidation.</p>
          <div className="mt-4 grid gap-3">
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              placeholder="e.g. 1"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className={inputClassName}
            />
            <button
              onClick={handleSetPrice}
              disabled={!newPrice || !isOwner || isPricePending || isPriceConfirming}
              className={buttonClassName}
            >
              {isPricePending || isPriceConfirming ? "Confirming..." : "Set price"}
            </button>
            {isPriceSuccess ? (
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700">
                Price updated.
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[22px] border border-black/10 bg-white p-5">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-500">
              Public
            </span>
            <h3 className="m-0 text-base font-semibold tracking-[-0.03em] text-slate-950">Liquidation check</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Checks the encrypted position, decrypts the boolean, and shows the result on screen.
          </p>
          <div className="mt-4 grid gap-3">
            <button onClick={handleCheckLiquidatable} disabled={isCheckingLiquidation} className={buttonClassName}>
              {isCheckingLiquidation ? "Checking..." : "Check liquidatable"}
            </button>
            {liquidationStatus ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  liquidationStatus === "liquidatable"
                    ? "border border-amber-500/15 bg-amber-500/8 text-amber-800"
                    : "border border-emerald-500/15 bg-emerald-500/8 text-emerald-700"
                }`}
              >
                {liquidationStatus === "liquidatable" ? "Position is liquidatable." : "Position is safe."}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[22px] border border-black/10 bg-white p-5">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-500">
              Demo only
            </span>
            <h3 className="m-0 text-base font-semibold tracking-[-0.03em] text-slate-950">Emergency withdraw</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Clears the connected position. Uses the caller address.
          </p>
          <div className="mt-4 grid gap-3">
            <button
              onClick={handleEmergencyWithdraw}
              disabled={!isOwner || isWithdrawPending || isWithdrawConfirming}
              className={blackButtonClassName}
            >
              {isWithdrawPending || isWithdrawConfirming ? "Confirming..." : "Emergency withdraw"}
            </button>
            {!isOwner ? (
              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 px-4 py-3 text-sm text-amber-700">
                Connect the owner wallet to use this action.
              </div>
            ) : null}
            {isWithdrawSuccess ? (
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700">
                Position cleared.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}



