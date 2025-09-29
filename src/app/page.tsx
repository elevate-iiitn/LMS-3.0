import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 gap-8 p-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-center text-purple-100">
          Last Man Standing 3.0 🚀
        </h1>
        
        <p className="text-purple-200 opacity-60 text-base font-medium tracking-widest uppercase">
          Select Your Path
        </p>
      </div>

      <nav className="flex flex-col gap-5 w-full max-w-xs">
        <Link
          href="/teams"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all duration-300 text-center tracking-wide shadow-lg hover:shadow-violet-500/50"
        >
          Teams
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:scale-105 transition-all duration-300 text-center tracking-wide shadow-lg hover:shadow-purple-500/50"
        >
          Dashboard
        </Link>
        <Link
          href="/wheel"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all duration-300 text-center tracking-wide shadow-lg hover:shadow-violet-500/50"
        >
          Spin the Wheel
        </Link>
        <Link
          href="/winner"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:scale-105 transition-all duration-300 text-center tracking-wide shadow-lg hover:shadow-purple-500/50"
        >
          Winner
        </Link>
      </nav>
    </main>
  );
}
