import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-[28px] border border-black/10 bg-white/80 p-8 text-center shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)] backdrop-blur-xl">
        <div className="mb-4 inline-flex rounded-full bg-slate-950/5 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Not found
        </div>
        <h1 className="text-5xl font-semibold tracking-[-0.06em] text-slate-950">404</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          The page you are looking for does not exist. Head back to the landing page or open EVA screens.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="button-primary">
            Go home
          </Link>
          <Link href="/dashboard" className="button-ghost">
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
