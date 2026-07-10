"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Scale, 
  Ruler, 
  Activity, 
  Sparkles, 
  Save, 
  Dumbbell, 
  Calendar, 
  Flame, 
  ArrowRight, 
  UserCheck, 
  Loader2, 
  Award,
  ShieldAlert,
  Mars,
  Venus
} from "lucide-react";
import Link from "next/link";

interface Profile {
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  gender: string | null;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  notes: string | null;
  category: string | null;
}

interface WorkoutPlan {
  id: string;
  goal: string;
  createdAt: Date;
  exercises: Exercise[];
}

interface DashboardClientProps {
  session: any;
  initialProfile: Profile | null;
  initialPlans: WorkoutPlan[];
}

export default function DashboardClient({ session, initialProfile, initialPlans }: DashboardClientProps) {
  const [age, setAge] = useState<string>(initialProfile?.age?.toString() || "");
  const [weight, setWeight] = useState<string>(initialProfile?.weight?.toString() || "");
  const [height, setHeight] = useState<string>(initialProfile?.height?.toString() || "");
  const [goal, setGoal] = useState<string>(initialProfile?.goal || "");
  const [gender, setGender] = useState<string>(initialProfile?.gender || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Live BMI Calculations
  const wNum = parseFloat(weight);
  const hNum = parseFloat(height);
  const hasValidMetrics = !isNaN(wNum) && !isNaN(hNum) && wNum > 0 && hNum > 0;
  
  const bmi = hasValidMetrics ? parseFloat((wNum / ((hNum / 100) * (hNum / 100))).toFixed(1)) : null;

  const getBMIStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return { 
      label: "HARDGAINER / ECTOMORPH", 
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]", 
      advice: "Rekomendasi AI: Surplus kalori agresif (+500 kkal) dan fokus pada latihan angkatan compound berat." 
    };
    if (bmiValue < 25) return { 
      label: "ATHLETIC / NORMAL", 
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]", 
      advice: "Rekomendasi AI: Lanjutkan hipertrofi progresif, pertahankan kalori pemeliharaan atau lean bulk." 
    };
    if (bmiValue < 30) return { 
      label: "BULKING SEASON / ENDOMORPH", 
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]", 
      advice: "Rekomendasi AI: Rekomposisi tubuh. Kurangi tipis kalori, tingkatkan volume set latihan untuk pembakaran optimum." 
    };
    return { 
      label: "HEAVYWEIGHT / POWERLIFTER", 
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]", 
      advice: "Rekomendasi AI: Fokus pada defisit kalori sedang, utamakan penguatan sendi dan kardio LISS intensitas rendah." 
    };
  };

  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const parsedAge = age ? parseInt(age) : null;
      const parsedWeight = weight ? parseFloat(weight) : null;
      const parsedHeight = height ? parseFloat(height) : null;

      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parsedAge,
          weight: parsedWeight,
          height: parsedHeight,
          goal: goal || null,
          gender: gender || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      setSuccess("Profil biomekanik berhasil disimpan! AI Coach akan menyesuaikan program latihan berikutnya.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* LEFT COLUMN: Biomechanics Profile Card */}
      <div className="space-y-6 lg:col-span-1">
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 via-fuchsia-500 to-purple-600" />
          
          <CardHeader className="bg-zinc-950/40 border-b border-zinc-800/80 px-6 py-5">
            <CardTitle className="font-sans text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> PROFIL BIOMEKANIK
            </CardTitle>
            <CardDescription className="font-sans text-zinc-400 text-xs font-medium">
              Data tubuh Anda akan langsung dianalisis oleh AI untuk merancang set, repetisi, dan pengamanan sendi.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-5 pt-6">
              
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                      <AlertDescription className="font-sans font-bold uppercase text-xs">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                      <AlertDescription className="font-sans font-bold uppercase text-xs">{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Age Input */}
              <div className="space-y-2">
                <Label htmlFor="age" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-[10px]">UMUR (TAHUN)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Contoh: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-11"
                  min="10"
                  max="120"
                />
              </div>

              {/* Gender Toggle */}
              <div className="space-y-2">
                <Label className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-[10px]">JENIS KELAMIN</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-sm font-sans font-black text-xs uppercase tracking-widest transition-all ${
                      gender === "male"
                        ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    <Mars className="w-4 h-4" />
                    PRIA
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-sm font-sans font-black text-xs uppercase tracking-widest transition-all ${
                      gender === "female"
                        ? "bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    <Venus className="w-4 h-4" />
                    WANITA
                  </button>
                </div>
              </div>

              {/* Grid Weight & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-fuchsia-400" /> BERAT (KG)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-11"
                    min="10"
                    max="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-fuchsia-400" /> TINGGI (CM)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Contoh: 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-11"
                    min="50"
                    max="300"
                  />
                </div>
              </div>

              {/* Custom Bio Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal" className="font-sans text-zinc-300 font-bold uppercase tracking-wider text-[10px]">DETAIL RINTANGAN FISIK / TARGET KHUSUS</Label>
                <Input
                  id="goal"
                  placeholder="Contoh: Cedera lutut kiri, skoliosis ringan"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="font-sans bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 h-11 uppercase font-bold text-xs placeholder:font-normal placeholder:text-zinc-600"
                />
              </div>

              {/* Live Metric / BMI Display Panel */}
              {bmi && bmiStatus && (
                <div className="mt-4 p-4 border border-zinc-800/80 bg-zinc-950 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-zinc-500 uppercase font-black tracking-wider">LIVE BMI ANALYTICS</span>
                    <span className="font-sans text-2xl font-black text-white">{bmi}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`border p-2.5 text-center font-sans text-xs font-black uppercase tracking-widest ${bmiStatus.color}`}>
                    {bmiStatus.label}
                  </div>
                  
                  <p className="font-sans text-[10px] text-zinc-400 leading-relaxed font-semibold italic">
                    {bmiStatus.advice}
                  </p>
                </div>
              )}

            </CardContent>
            <CardFooter className="bg-zinc-950/40 border-t border-zinc-800/80 pt-5 pb-5">
              <Button 
                type="submit" 
                disabled={saving} 
                className="font-sans w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 text-xs uppercase tracking-widest h-auto border border-purple-400/40 shadow-[0_0_15px_rgba(147,51,234,0.15)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunci Parameter...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Simpan Profil Biomekanik
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* RIGHT COLUMN: Saved Workout Plans History */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/80 px-6 py-5 bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-400" /> RIWAYAT PROGRAM SIKSAAN
              </h2>
              <Badge className="bg-purple-900/20 text-purple-400 border border-purple-500/30 uppercase font-black tracking-widest text-[9px] py-1 px-2.5">
                {initialPlans.length} Rencana
              </Badge>
            </div>
            <CardDescription className="font-sans text-zinc-400 text-xs font-medium mt-1">
              Program latihan hardcore Anda yang disimpan secara otomatis oleh AI Coach. Klik program untuk detail set dan biomekanik.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            {initialPlans.length === 0 ? (
              <div className="text-center py-20 px-6">
                <Dumbbell className="w-16 h-16 text-zinc-800 mx-auto mb-4 animate-bounce" />
                <h3 className="font-sans text-lg font-black text-zinc-300 uppercase tracking-wide">Belum Ada Program</h3>
                <p className="font-sans text-zinc-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                  Kamu belum menyusun rencana latihan tempur. Mulailah sekarang dan biarkan AI merancang biomekanik optimal untukmu.
                </p>
                <Link href="/generate" className="inline-block mt-8">
                  <Button variant="outline" className="font-sans border-zinc-700 text-zinc-300 hover:bg-zinc-850 hover:text-white uppercase tracking-wider text-xs font-bold px-6 py-4 h-auto">
                    Buat Program Pertamamu
                  </Button>
                </Link>
              </div>
            ) : (
              <Accordion className="w-full">
                {initialPlans.map((plan, index) => (
                  <AccordionItem value={`plan-${plan.id}`} key={plan.id} className="border-b border-zinc-800/60 px-6 py-1">
                    <AccordionTrigger className="hover:no-underline text-zinc-200 hover:text-purple-400 py-5 text-left group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="font-sans shrink-0 flex items-center justify-center w-8 h-8 bg-zinc-950 border border-zinc-800 text-purple-400 text-sm font-black shadow-[0_0_10px_rgba(147,51,234,0.05)] group-hover:border-purple-500 transition-colors">
                            {initialPlans.length - index}
                          </div>
                          <div className="w-10 h-10 rounded border border-zinc-800 overflow-hidden shrink-0 hidden sm:block">
                            <img src={getTargetImage(plan.goal)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-sans text-base sm:text-lg font-black uppercase tracking-tight leading-tight">{plan.goal}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate(plan.createdAt)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pb-6 pt-4 border-t border-zinc-900/60">
                      <div className="space-y-4">
                        {plan.exercises.map((ex, exIdx) => (
                          <div key={ex.id} className="bg-zinc-950/65 border border-zinc-800/60 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-colors">
                           <div className="flex items-start gap-4">
                             <span className="font-sans font-black text-zinc-600 text-sm mt-0.5">{exIdx + 1}.</span>
                             <div className="w-16 h-16 rounded border border-zinc-800 overflow-hidden shrink-0 hidden sm:block">
                               <img src={getTargetImage(ex.name, ex.category)} alt={ex.name} className="w-full h-full object-cover" />
                             </div>
                             <div className="space-y-2">
                               <div className="flex flex-wrap items-center gap-2">
                                 <h4 className="font-sans text-sm font-black text-white uppercase tracking-wide leading-none">{ex.name}</h4>
                                 <Badge variant="outline" className="text-[8px] py-0.5 px-1.5 border-purple-500/30 text-purple-400 bg-purple-500/10 font-black uppercase tracking-wider">
                                   {getMuscleLabel(ex.name, ex.category)}
                                 </Badge>
                               </div>
                               {ex.notes && (
                                 <div className="p-3 border-l-2 border-l-fuchsia-500 bg-zinc-900/40 text-xs text-zinc-400 font-medium max-w-lg leading-relaxed shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                                   <span className="font-sans block text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">Biomekanik & Tips Coach</span>
                                   {ex.notes}
                                 </div>
                               )}
                             </div>
                           </div>
                            
                            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                              <div className="bg-zinc-900/80 border border-zinc-850 px-3 py-1.5 text-center min-w-[65px]">
                                <span className="font-sans block text-[8px] text-zinc-500 uppercase tracking-widest font-black">Sets</span>
                                <span className="font-sans text-sm font-black text-purple-400">{ex.sets}</span>
                              </div>
                              <div className="bg-zinc-900/80 border border-zinc-850 px-3 py-1.5 text-center min-w-[65px]">
                                <span className="font-sans block text-[8px] text-zinc-500 uppercase tracking-widest font-black">Reps</span>
                                <span className="font-sans text-sm font-black text-purple-400">{ex.reps}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
