import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Award, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Query both profile and plans in parallel
  const [profile, plans] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId }
    }),
    prisma.workoutPlan.findMany({
      where: { userId },
      include: { exercises: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="flex-1 bg-zinc-950 py-12 px-4 sm:px-6 relative min-h-[calc(100vh-80px)] overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-purple-900/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-900 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-900/20 text-purple-400 border border-purple-500/30 uppercase font-bold tracking-widest text-xs py-1 px-3">
                <UserCheck className="w-3.5 h-3.5 mr-1 inline" /> AKTIF MEMBERSHIP
              </Badge>
            </div>
            <h1 className="font-sans text-4xl font-black text-white uppercase tracking-tight">BASE CAMP: {session.user.name}</h1>
            <p className="font-sans text-zinc-400 text-sm mt-1 font-medium">Halaman kontrol dan riwayat program brutal Andisa Gym Anda.</p>
          </div>
          <Link href="/generate">
            <Button className="font-sans bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-5 text-sm uppercase tracking-widest h-auto border border-purple-400/40 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Sparkles className="w-4 h-4 mr-2" /> Program Baru
            </Button>
          </Link>
        </div>

        {/* Dashboard Statistics / Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="font-sans text-xs font-black uppercase text-zinc-400 tracking-wider">Total Latihan</CardTitle>
              <Dumbbell className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="font-sans text-3xl font-black text-white">{plans.length}</div>
              <p className="font-sans text-xs text-zinc-500 mt-1 uppercase font-bold tracking-wider">PROGRAM TELAH DISUSUN OLEH AI</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="font-sans text-xs font-black uppercase text-zinc-400 tracking-wider">Status Profil</CardTitle>
              <Award className="w-4 h-4 text-fuchsia-400" />
            </CardHeader>
            <CardContent>
              <div className="font-sans text-lg font-black text-fuchsia-400 uppercase tracking-tight">Elite Athlete</div>
              <p className="font-sans text-xs text-zinc-500 mt-1 uppercase font-bold tracking-wider">SIAP UNTUK PERTUMBUHAN MAKSIMAL</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <DashboardClient 
          session={session} 
          initialProfile={profile} 
          initialPlans={plans as any} 
        />
      </div>
    </div>
  );
}
