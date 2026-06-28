import Link from "next/link";
import { BorrowForm } from "../../components/BorrowForm";

export default function BorrowPage() {
  return (
    <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="text-center">
          <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
            Step 2 of 3
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-slate-950">
            Borrow against collateral.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500 lg:text-lg">
            Borrowing uses the same encrypted flow. The vault records debt without turning the position into public
            data.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <BorrowForm />

          <aside className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)]">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
                Why it stays private
              </span>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Encrypted debt flow</h2>
              <p className="text-sm leading-7 text-slate-500">
                The vault only sees the encrypted amount and the proof. The user can decrypt their own balance later.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                Debt stays hidden from other users.
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                The same wallet that encrypted the input can decrypt the handle later.
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-slate-600">
                No new backend endpoint is needed. The UI uses the deployed contract directly.
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-black/10 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
              Use the dashboard next to adjust the mock price or run liquidation checks on the same position.
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/deposit" className="button-ghost">
                Back to deposit
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
