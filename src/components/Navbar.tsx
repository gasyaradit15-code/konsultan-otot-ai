"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dumbbell, LogOut, User, LayoutDashboard, Flame } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-900/60">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Andisa Gym" className="h-12 w-auto object-contain" />
          </div>
          <span className="font-sans font-black text-xl tracking-wider text-white uppercase hidden sm:inline-block">
            ANDISA GYM
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/generate" className="font-sans text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" /> Buat Program
          </Link>
          
          {status === "authenticated" && (
            <Link href="/dashboard" className="font-sans text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}

          <div className="h-4 w-px bg-zinc-800" />

          {status === "loading" ? (
            <div className="w-20 h-8 rounded bg-zinc-900 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="font-sans text-xs font-black uppercase text-zinc-400 hidden md:inline-block border border-zinc-800 bg-zinc-950 px-3 py-1.5 tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" /> {session.user?.name}
              </span>
              <Button 
                onClick={() => signOut({ callbackUrl: "/" })}
                size="sm" 
                variant="outline"
                className="font-sans border-zinc-800 hover:bg-zinc-900 hover:text-red-400 text-zinc-400 font-bold text-xs uppercase tracking-widest px-3 py-2 flex items-center gap-2 h-auto"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="font-sans hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest px-3 py-2 h-auto">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-sans bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 border border-purple-400/40 h-auto">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
