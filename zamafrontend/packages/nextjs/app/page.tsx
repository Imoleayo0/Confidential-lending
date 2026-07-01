import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[2%] top-0 hidden h-[100%] w-[32%] rounded-[999px] border border-black/8 lg:block" />
      <div className="pointer-events-none absolute right-[2%] top-0 hidden h-[100%] w-[32%] rounded-[999px] border border-black/8 lg:block" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-[#ffd208]/10 blur-3xl" />

      <section className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-5xl flex-col items-center justify-center gap-9 text-center">
        <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          Confidential distribution
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-[clamp(3.1rem,8vw,6.2rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-slate-950">
            <span className="block">Distribute collateral.</span>
            <span className="block text-[#d97706]">Hide the amounts.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-[0.98rem] leading-8 text-slate-500 sm:text-[1.08rem]">
            EVA keeps deposits, borrows, and liquidation checks encrypted on-chain. Everyone can verify the protocol
            works, but only the right wallet can decrypt the values.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/deposit" className="button-primary">
            Launch app
          </Link>
          <Link href="/dashboard" className="button-secondary">
            See how it works
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-950">Encrypted</span>
          <span>Deposits and debt stay hidden.</span>
          <span className="font-semibold text-slate-950">Verified</span>
          <span>Liquidation checks remain on-chain.</span>
          <span className="font-semibold text-slate-950">Connected</span>
          <span>Frontend talks directly to EVA.</span>
        </div>
      </section>
    </main>
  );
}
