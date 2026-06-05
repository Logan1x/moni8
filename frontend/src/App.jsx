import { ArrowRight, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:py-12">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <HeartPulse className="h-4 w-4 text-white/70" />
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
          <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.9] sm:text-7xl lg:text-8xl animate-slide-up">
            <span className="block">Downtime sucks.</span>
            <span className="block text-neutral-500">We're on it.</span>
          </h1>

          <p className="mt-6 max-w-md text-base text-neutral-500 sm:text-lg animate-slide-up-delay">
            Monitor your services. Get alerted before your users do.
          </p>

          <Link
            to="/monitor"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] animate-slide-up-delay-2"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    </div>
  );
}
