"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Semua bidang wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setSuccess(true);
      
      // Auto login after successful registration!
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 bg-zinc-950 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background neon accents */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-fuchsia-900/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="mb-4 inline-block drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <img src="/logo.png" alt="Andisa Gym Logo" className="h-14 w-auto object-contain mx-auto" />
          </div>
          <h1 className="font-sans text-3xl font-black text-white uppercase tracking-tight">DAFTAR MEMBERSHIP</h1>
          <p className="font-sans text-zinc-400 text-sm mt-2 font-medium">Buat akun untuk menyimpan program latihan AI dan pantau progresmu.</p>
        </div>

        <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleRegister}>
            <CardHeader className="border-b border-zinc-800/60 pb-5">
              <h2 className="font-sans text-zinc-100 font-bold uppercase tracking-wider text-xs">Pendaftaran Rekan Tempur</h2>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription className="font-sans font-bold uppercase text-xs">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <AlertDescription className="font-sans font-bold uppercase text-xs">Registrasi Sukses! Mengarahkan...</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> NAMA LENGKAP
                </Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="masukkan nama Anda" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" /> EMAIL
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="masukkan email aktif" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" /> KATA SANDI
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="minimal 6 karakter" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-12"
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-zinc-800/60 pt-6">
              <Button 
                type="submit" 
                disabled={loading || success} 
                className="font-sans w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-6 text-sm uppercase tracking-widest h-auto border border-purple-400/40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    Gabung Sekarang <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <div className="text-center w-full">
                <span className="font-sans text-xs text-zinc-500">Sudah memiliki akun? </span>
                <Link href="/login" className="font-sans text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider transition-colors ml-1">
                  Login Disini
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
