import Link from "next/link";
import { DepositForm } from "../../components/DepositForm";

export default function DepositPage() {
  return (
    <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="text-center">
          <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
            Step 1 of 3
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-slate-950">
            Deposit collateral.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500 lg:text-lg">
            Enter an amount, encrypt it in the browser, and send it to EVA without exposing the number to the
            chain, bots, or explorers.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <DepositForm />

          <aside className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
                Why it stays private
              </span>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Browser-side encryption</h2>
              <p className="text-sm leading-7 text-slate-500">
                The amount is encrypted before the transaction is created, so EVA only receives ciphertext.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                Plaintext never leaves the client.
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                The contract stores an encrypted handle, not the raw amount.
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                The same flow works on local cleartext and Sepolia relayers.
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-black/10 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
              Zama RelayerWeb handles the encrypted payload in the browser, while the contract keeps the position hidden
              on-chain.
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/borrow" className="button-ghost">
                Go to borrow
              </Link>
              <Link href="/dashboard" className="button-ghost">
                Open dashboard
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

