"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, Dumbbell, Zap, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px]" />

      {/* Header / Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between z-20 border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Andisa Gym" className="h-12 w-auto object-contain" />
          </div>
          <span className="font-sans font-black text-xl tracking-wider text-white uppercase hidden sm:inline-block">
            ANDISA GYM
          </span>
        </Link>
        <Link href="/generate">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 border border-purple-400/40">
            Mulai Latihan
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center max-w-5xl mx-auto py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Logo Sampul (Hero Cover Logo) */}
          <div className="mb-10 relative">
            <div className="max-w-[320px] sm:max-w-[440px] drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <img 
                src="/logo.png" 
                alt="Andisa Gym Cover Logo" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <Badge variant="outline" className="mb-6 bg-zinc-900 border-zinc-800 text-purple-400 py-1.5 px-4 shadow-sm text-sm font-bold uppercase tracking-widest">
            <Flame className="w-4 h-4 mr-2 text-fuchsia-500" />
            Didukung oleh AI Gemini
          </Badge>
          
          <h1 className="font-sans text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.9]">
            BANGUN OTOT BAJA. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-br from-purple-400 via-fuchsia-500 to-purple-600">
              TANPA ALASAN.
            </span>
          </h1>
          
          <h2 className="font-sans text-3xl md:text-5xl font-black text-purple-500 mt-4 mb-8 uppercase tracking-widest">
            BY ANDISA GYM
          </h2>
          
          <p className="font-sans text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Tinggalkan rutinitas generik. Dapatkan program latihan hardcore dan hiper-personal yang disesuaikan dengan biomekanikmu oleh Pelatih AI dalam 3 detik.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" className="font-sans w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all border border-purple-400/50 px-10 py-7 text-xl font-black uppercase tracking-widest h-auto">
                Hancurkan Batasmu
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24"
        >
          {[
            { icon: Dumbbell, title: "PROGRAM BRUTAL", desc: "Beritahu alat apa yang tersedia, AI merancang siksaan otot yang optimal." },
            { icon: Activity, title: "SAINS HIPERTROFI", desc: "Parameter volume dan intensitas yang dihitung akurat untuk pertumbuhan." },
            { icon: Zap, title: "INSTAN & BRUTAL", desc: "Hasil detik ini juga. Tidak ada waktu terbuang, langsung eksekusi." }
          ].map((feature, i) => (
            <Card key={i} className="bg-zinc-900/40 border-zinc-800/80 backdrop-blur-sm pt-8 border-t-2 border-t-purple-500">
              <CardContent className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.15)]">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-sans text-lg font-black text-zinc-100 tracking-tight uppercase">{feature.title}</h3>
                <p className="font-sans text-zinc-400 text-sm font-medium">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
