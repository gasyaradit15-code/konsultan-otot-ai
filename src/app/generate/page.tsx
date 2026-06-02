"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Activity, Loader2, RefreshCw, ArrowLeft, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const EQUIPMENTS = [
  { id: "dumbbell", label: "DUMBBELL" },
  { id: "barbell", label: "BARBELL" },
  { id: "machine", label: "MESIN GYM" },
  { id: "bodyweight", label: "BODYWEIGHT" },
  { id: "resistance_band", label: "RESISTANCE BAND" },
];

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface WorkoutPlan {
  goal: string;
  exercises: Exercise[];
}

export default function GeneratePage() {
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState("");

  const handleToggle = (id: string) => {
    setEquipment((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!goal) {
      setError("MASUKKAN TARGETMU SEKARANG!");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/v1/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, equipment })
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server error. Coba beberapa saat lagi.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal menyusun program.");
      
      setPlan(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyusun program.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-4 bg-zinc-950 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-purple-900/10 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-3xl z-10">
        <Link href="/" className="font-sans inline-flex items-center text-zinc-500 hover:text-purple-400 transition-colors mb-6 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Base
        </Link>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center flex flex-col items-center">
          <div className="mb-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
            <img src="/logo.png" alt="Andisa Gym Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="font-sans text-4xl font-black text-white flex items-center justify-center gap-3 tracking-tighter uppercase">
            <Zap className="text-fuchsia-500 w-8 h-8" /> AI WORKOUT GENERATOR
          </h1>
          <p className="font-sans text-purple-500 mt-1 font-black tracking-widest uppercase text-sm">BY ANDISA GYM</p>
          <p className="font-sans text-zinc-400 mt-2 font-medium">Program brutal khusus untukmu, siap dalam hitungan detik.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!plan && !loading && (
            <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
                <div className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-5">
                  <h2 className="font-sans text-zinc-100 font-black uppercase tracking-wide text-base">Parameter Latihan</h2>
                  <p className="font-sans text-zinc-400 text-sm font-medium mt-1">Tentukan target dan senjata yang tersedia.</p>
                </div>
                <CardContent className="space-y-8 pt-8">
                  <div className="space-y-4">
                    <Label htmlFor="goal" className="font-sans text-zinc-200 font-bold uppercase tracking-wider text-xs">Target Utama</Label>
                    <Input 
                      id="goal" 
                      placeholder="CONTOH: DADA BIDANG, DEADLIFT 100KG" 
                      className="font-sans bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-14 font-bold uppercase placeholder:font-normal placeholder:text-zinc-600"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="font-sans text-zinc-200 font-bold uppercase tracking-wider text-xs">Arsenal (Alat Tersedia)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {EQUIPMENTS.map((eq) => (
                        <div key={eq.id} className={`flex items-center space-x-3 p-4 border transition-all cursor-pointer ${equipment.includes(eq.id) ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}`} onClick={() => handleToggle(eq.id)}>
                          <Checkbox id={eq.id} checked={equipment.includes(eq.id)} onCheckedChange={() => handleToggle(eq.id)} className="border-zinc-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                          <Label htmlFor={eq.id} className="font-sans text-zinc-300 cursor-pointer flex-1 font-bold tracking-wider text-sm">{eq.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                      <AlertDescription className="font-sans font-bold uppercase text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="bg-zinc-950/50 pt-6">
                  <Button onClick={handleGenerate} disabled={loading} className="font-sans w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-7 text-xl h-auto shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 uppercase tracking-widest border border-purple-400">
                    Bentuk Rencana Sekarang
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
              <h3 className="font-sans text-2xl font-black text-zinc-100 mb-2 uppercase tracking-tight">Menyusun Siksaan...</h3>
              <p className="font-sans text-zinc-400 font-medium">AI Coach sedang mengkalkulasi biomekanik optimum.</p>
              <div className="w-full max-w-lg mt-12 space-y-4">
                <Skeleton className="h-16 w-full bg-zinc-800/50" />
                <Skeleton className="h-16 w-full bg-zinc-800/50" />
                <Skeleton className="h-16 w-full bg-zinc-800/50" />
              </div>
            </motion.div>
          )}

          {plan && !loading && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
                <div className="bg-zinc-950 p-6 border-b-4 border-purple-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Dumbbell className="w-32 h-32 text-purple-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold tracking-wider text-xs">PROGRAM AKTIF</Badge>
                  </div>
                  <h2 className="font-sans text-3xl text-white font-black uppercase tracking-tighter relative z-10">{plan.goal}</h2>
                </div>
                <CardContent className="p-0">
                  <Accordion className="w-full">
                    {plan.exercises?.map((ex: Exercise, idx: number) => (
                      <AccordionItem value={`item-${idx}`} key={idx} className="border-b border-zinc-800/50 px-2 sm:px-6">
                        <AccordionTrigger className="hover:no-underline text-zinc-200 hover:text-purple-400 py-6 text-left group">
                          <div className="flex items-center gap-4">
                            <div className="font-sans shrink-0 flex items-center justify-center w-10 h-10 bg-zinc-950 border border-zinc-800 text-purple-500 text-lg font-black group-hover:border-purple-500 transition-colors shadow-[0_0_10px_rgba(147,51,234,0.1)]">
                              {idx + 1}
                            </div>
                            <span className="font-sans text-xl font-black uppercase tracking-tight">{ex.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-8 pt-2">
                          <div className="pl-14 grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-950 border border-zinc-800 p-5 flex flex-col items-center justify-center text-center">
                              <span className="font-sans block text-xs text-zinc-500 mb-1 uppercase tracking-widest font-bold">Sets</span>
                              <span className="font-sans text-4xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]">{ex.sets}</span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 p-5 flex flex-col items-center justify-center text-center">
                              <span className="font-sans block text-xs text-zinc-500 mb-1 uppercase tracking-widest font-bold">Reps</span>
                              <span className="font-sans text-4xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]">{ex.reps}</span>
                            </div>
                          </div>
                          {ex.notes && (
                            <div className="pl-14">
                              <Alert className="bg-zinc-950 border-l-4 border-l-fuchsia-500 border-t-0 border-r-0 border-b-0 text-zinc-300">
                                <Activity className="h-5 w-5 stroke-fuchsia-500" />
                                <AlertTitle className="font-sans mb-2 font-black uppercase tracking-wider text-fuchsia-400">Instruksi Coach</AlertTitle>
                                <AlertDescription className="font-sans text-zinc-400 font-medium leading-relaxed">
                                  {ex.notes}
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="p-6 bg-zinc-950 border-t border-zinc-800">
                  <Button variant="outline" className="font-sans w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white py-7 text-lg font-bold uppercase tracking-widest h-auto" onClick={() => setPlan(null)}>
                    <RefreshCw className="w-5 h-5 mr-3" /> Eksekusi Ulang
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
