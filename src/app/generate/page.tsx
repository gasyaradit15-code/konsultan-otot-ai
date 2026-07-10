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
import { useSession } from "next-auth/react";
import Link from "next/link";

const EQUIPMENTS = [
  { id: "dumbbell", label: "DUMBBELL" },
  { id: "barbell", label: "BARBELL" },
  { id: "machine", label: "MESIN GYM" },
  { id: "bodyweight", label: "BODYWEIGHT" },
  { id: "resistance_band", label: "RESISTANCE BAND" },
];

const TARGET_PRESETS = [
  {
    id: "chest",
    name: "DADA / CHEST",
    presetGoal: "DADA BIDANG DAN TEBAL",
    image: "/exercises/chest.png",
    description: "Bench Press & Flyes"
  },
  {
    id: "back",
    name: "PUNGGUNG / BACK",
    presetGoal: "PUNGGUNG LEBAR & DEADLIFT KUAT",
    image: "/exercises/back.png",
    description: "Deadlift & Rows"
  },
  {
    id: "legs",
    name: "KAKI / LEGS",
    presetGoal: "SQUAT BRUTAL & PAHA KEKAR",
    image: "/exercises/legs.png",
    description: "Squats & Lunges"
  },
  {
    id: "shoulders",
    name: "BAHU / SHOULDERS",
    presetGoal: "BAHU BULAT & OVERHEAD PRESS",
    image: "/exercises/shoulders.png",
    description: "Shoulder Press & Raises"
  },
  {
    id: "arms",
    name: "LENGAN / ARMS",
    presetGoal: "LENGAN KEKAR & BICEPS TEBAL",
    image: "/exercises/arms.png",
    description: "Bicep Curls & Triceps"
  },
  {
    id: "core",
    name: "CORE / PERUT",
    presetGoal: "OTOT CORE BAJA & CALISTHENICS",
    image: "/exercises/core.png",
    description: "Ab Workouts & Bodyweight"
  }
];

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  category?: string | null;
}

interface WorkoutPlan {
  goal: string;
  exercises: Exercise[];
}

export default function GeneratePage() {
  const { data: session } = useSession();
  const [goal, setGoal] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const getTargetImage = (name: string, category?: string | null) => {
    if (category) {
      const lowerCat = category.toLowerCase();
      if (lowerCat === "chest") return "/exercises/chest.png";
      if (lowerCat === "back") return "/exercises/back.png";
      if (lowerCat === "legs") return "/exercises/legs.png";
      if (lowerCat === "shoulders") return "/exercises/shoulders.png";
      if (lowerCat === "arms") return "/exercises/arms.png";
      if (lowerCat === "core") return "/exercises/core.png";
    }
    const upper = name.toUpperCase();
    if (upper.includes("DADA") || upper.includes("CHEST") || upper.includes("BENCH")) return "/exercises/chest.png";
    if (upper.includes("PUNGGUNG") || upper.includes("BACK") || upper.includes("DEADLIFT") || upper.includes("SAYAP") || upper.includes("ROW") || upper.includes("LAT")) return "/exercises/back.png";
    if (upper.includes("KAKI") || upper.includes("LEG") || upper.includes("SQUAT") || upper.includes("PAHA") || upper.includes("HAMSTRING") || upper.includes("CALF")) return "/exercises/legs.png";
    if (upper.includes("BAHU") || upper.includes("SHOULDER") || upper.includes("OVERHEAD") || upper.includes("PRESS") || upper.includes("RAISE") || upper.includes("SHRUG")) return "/exercises/shoulders.png";
    if (upper.includes("LENGAN") || upper.includes("ARM") || upper.includes("BICEP") || upper.includes("TRICEP") || upper.includes("CURL") || upper.includes("FOREARM")) return "/exercises/arms.png";
    return "/exercises/core.png";
  };

  const getMuscleLabel = (name: string, category?: string | null) => {
    let cat = category;
    if (!cat) {
      const upper = name.toUpperCase();
      if (upper.includes("DADA") || upper.includes("CHEST") || upper.includes("BENCH")) cat = "chest";
      else if (upper.includes("PUNGGUNG") || upper.includes("BACK") || upper.includes("DEADLIFT") || upper.includes("SAYAP") || upper.includes("ROW") || upper.includes("LAT")) cat = "back";
      else if (upper.includes("KAKI") || upper.includes("LEG") || upper.includes("SQUAT") || upper.includes("PAHA") || upper.includes("HAMSTRING") || upper.includes("CALF")) cat = "legs";
      else if (upper.includes("BAHU") || upper.includes("SHOULDER") || upper.includes("OVERHEAD") || upper.includes("PRESS") || upper.includes("RAISE") || upper.includes("SHRUG")) cat = "shoulders";
      else if (upper.includes("LENGAN") || upper.includes("ARM") || upper.includes("BICEP") || upper.includes("TRICEP") || upper.includes("CURL") || upper.includes("FOREARM")) cat = "arms";
      else cat = "core";
    }

    const lower = cat.toLowerCase();
    if (lower === "chest") return "OTOT DADA / CHEST";
    if (lower === "back") return "OTOT PUNGGUNG / BACK";
    if (lower === "legs") return "OTOT KAKI / LEGS";
    if (lower === "shoulders") return "OTOT BAHU / SHOULDERS";
    if (lower === "arms") return "OTOT LENGAN / ARMS";
    return "OTOT CORE / PERUT";
  };

  const handleToggle = (id: string) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectPreset = (presetId: string, goalText: string) => {
    setSelectedPreset(presetId);
    setGoal(goalText);
  };

  const handleGenerate = async () => {
    if (!goal) {
      setError("MASUKKAN TARGETMU SEKARANG!");
      return;
    }
    setError("");
    setWarning("");
    setLoading(true);
    setSaved(false);
    console.log("Client-side sending equipment:", equipment);

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
      setSaved(!!data.saved);
      setWarning(data.warning || "");
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
            <Zap className="text-fuchsia-500 w-8 h-8" /> ANDISA WORKOUT GENERATOR

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
                    <Label className="font-sans text-zinc-200 font-bold uppercase tracking-wider text-xs">Pilih Target Latihan</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {TARGET_PRESETS.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id, preset.presetGoal)}
                          className={`group relative overflow-hidden rounded-md border aspect-square cursor-pointer flex flex-col justify-end p-3 transition-all ${
                            selectedPreset === preset.id
                              ? "border-purple-500 ring-2 ring-purple-500/30"
                              : "border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                          <img
                            src={preset.image}
                            alt={preset.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                          />
                          <div className="relative z-20">
                            <span className="font-sans block text-[10px] font-black text-white uppercase tracking-tight leading-tight">
                              {preset.name}
                            </span>
                            <span className="font-sans block text-[8px] text-purple-400 font-medium tracking-wide mt-0.5">
                              {preset.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="goal" className="font-sans text-zinc-200 font-bold uppercase tracking-wider text-xs">Target Utama / Kostumisasi</Label>
                    <Input
                      id="goal"
                      placeholder="CONTOH: DADA BIDANG, DEADLIFT 100KG"
                      className="font-sans bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-14 font-bold uppercase placeholder:font-normal placeholder:text-zinc-600"
                      value={goal}
                      onChange={(e) => {
                        setGoal(e.target.value.toUpperCase());
                        setSelectedPreset(null);
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="font-sans text-zinc-200 font-bold uppercase tracking-wider text-xs">Arsenal (Alat Tersedia)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {EQUIPMENTS.map((eq) => (
                        <div key={eq.id} className={`flex items-center space-x-3 p-4 border transition-all cursor-pointer ${equipment.includes(eq.id) ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}`} onClick={() => handleToggle(eq.id)}>
                          <Checkbox id={eq.id} checked={equipment.includes(eq.id)} className="border-zinc-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 pointer-events-none" />
                          <Label className="font-sans text-zinc-300 flex-1 font-bold tracking-wider text-sm pointer-events-none">{eq.label}</Label>
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
                <div className="bg-zinc-950 p-6 border-b-4 border-purple-600 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                  {/* Background target exercise illustration */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none hidden sm:block">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                    <img 
                      src={getTargetImage(plan.goal)} 
                      alt={plan.goal} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-3 relative z-20">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase font-bold tracking-wider text-xs">PROGRAM AKTIF</Badge>
                    {saved ? (
                      <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase font-bold tracking-wider text-xs">TERSIMPAN DI PROFIL</Badge>
                    ) : (
                      <Badge className="bg-amber-950/80 text-amber-400 border border-amber-500/30 uppercase font-bold tracking-wider text-xs">GUEST MODE (TIDAK DISIMPAN)</Badge>
                    )}
                  </div>
                  <h2 className="font-sans text-3xl text-white font-black uppercase tracking-tighter relative z-20 max-w-[70%]">{plan.goal}</h2>
                </div>
                <CardContent className="p-0">
                  {!saved && (
                    <div className="bg-amber-950/20 border-b border-amber-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="font-sans text-xs text-amber-300 font-bold uppercase tracking-wider">
                        ⚠️ Anda masuk sebagai Guest. Daftar / Masuk untuk menyimpan rencana latihan secara otomatis ke riwayat Anda!
                      </p>
                      <Link href="/register">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-3 py-1.5 h-auto">
                          Daftar Akun
                        </Button>
                      </Link>
                    </div>
                  )}
                  {saved && (
                    <div className="bg-emerald-950/20 border-b border-emerald-900/40 p-4">
                      <p className="font-sans text-xs text-emerald-400 font-black uppercase tracking-widest text-center">
                        ✓ Sukses! Program latihan ini telah disimpan ke database riwayat akun Anda.
                      </p>
                    </div>
                  )}
                  {warning && (
                    <div className="bg-purple-950/30 border-b border-purple-900/40 p-4">
                      <p className="font-sans text-xs text-purple-300 font-bold uppercase tracking-wider text-center">
                        ⚡ {warning}
                      </p>
                    </div>
                  )}
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
                        <AccordionContent className="pb-8 pt-2 pl-2 sm:pl-14">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
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
                                <Alert className="bg-zinc-950 border-l-4 border-l-fuchsia-500 border-t-0 border-r-0 border-b-0 text-zinc-300">
                                  <Activity className="h-5 w-5 stroke-fuchsia-500" />
                                  <AlertTitle className="font-sans mb-2 font-black uppercase tracking-wider text-fuchsia-400">Instruksi Coach</AlertTitle>
                                  <AlertDescription className="font-sans text-zinc-400 font-medium leading-relaxed">
                                    {ex.notes}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                            <div className="md:col-span-1">
                              <div className="border border-zinc-800 rounded bg-zinc-950 overflow-hidden relative group aspect-video md:aspect-square flex flex-col justify-end p-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                                <img 
                                  src={getTargetImage(ex.name, ex.category)} 
                                  alt={ex.name} 
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                                />
                                <span className="font-sans relative z-20 text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">
                                  TARGET OTOT
                                </span>
                                <span className="font-sans relative z-20 text-[11px] font-bold text-white uppercase tracking-tight leading-none block">
                                  {getMuscleLabel(ex.name, ex.category)}
                                </span>
                              </div>
                            </div>
                          </div>
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
