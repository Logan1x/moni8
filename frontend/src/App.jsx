import { ArrowRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Globe className="h-4 w-4 text-white/70" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Moni8</span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
              Beta
            </span>
          </div>

          <Link
            to="/monitor"
            className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Open Dashboard
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center pb-32 text-center">
          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block">Downtime sucks.</span>
            <span className="block text-neutral-500">We're on it.</span>
          </h1>

          <p className="mt-6 max-w-md text-base text-neutral-500 sm:text-lg">
            Monitor your services. Get alerted before your users do.
          </p>

          <Link
            to="/monitor"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-neutral-200"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    </div>
  );
}
