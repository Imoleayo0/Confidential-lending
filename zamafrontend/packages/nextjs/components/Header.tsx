"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

const navItems = [
  { href: "/deposit", label: "Deposit" },
  { href: "/borrow", label: "Borrow" },
  { href: "/dashboard", label: "My positions" },
];

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3 rounded-[24px] border border-black/10 bg-[#efe5d8] px-4 py-3 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3 text-black no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
            Z
          </span>
          <span className="flex flex-col leading-none">
            <strong className="text-[0.98rem] font-semibold tracking-[-0.03em]">Zama Vault</strong>
            <span className="text-xs text-slate-600">Confidential lending</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5 hover:text-black ${
              pathname === "/" ? "bg-black/10 text-black" : "text-slate-600"
            }`}
          >
            Home
          </Link>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5 hover:text-black ${
                  active ? "bg-black/10 text-black" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex justify-center md:justify-end">
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
