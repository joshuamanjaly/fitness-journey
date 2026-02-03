"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Activity, 
  Flame, 
  Trophy, 
  Dumbbell, 
  Calendar, 
  ChevronRight, 
  User, 
  Settings as SettingsIcon // Imported correctly at the top
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error:", error);
        router.push('/onboarding');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-mono">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      
      {/* 1. Top Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">FJ</div>
            <span className="font-bold tracking-tight text-lg hidden sm:block">FITNESS JOURNEY</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium">LOGGED IN AS</p>
              <p className="text-sm font-bold text-white leading-none">{user?.fullName}</p>
            </div>
            
            {/* NEW SETTINGS BUTTON */}
            <button 
              onClick={() => router.push('/settings')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300 hover:text-white"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <div className="p-1 bg-white/10 rounded-full">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* 2. Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Headquarters
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Your <span className="text-blue-500 font-bold">{profile?.goal}</span> protocol is active.
            </p>
          </div>
          <p className="text-slate-600 font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        {/* 3. The Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6">
          
          {/* Main Hero Card (Spans 2 columns) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-blue-900/20"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white mb-4 border border-white/20">
                  <Activity className="w-3 h-3" /> TODAY'S SESSION
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                  Upper Body <br/> Power & Control
                </h2>
                <p className="text-blue-100/80 text-sm max-w-sm">
                  Focus on explosive movements and controlled negatives. Keep rest times under 90 seconds.
                </p>
              </div>
              
              <button 
                onClick={() => router.push('/workout')}
                className="mt-8 bg-white text-blue-700 w-full sm:w-auto px-6 py-4 rounded-xl font-bold hover:scale-[1.02] transition shadow-xl flex items-center justify-center gap-2"
              >
                Start Workout <ChevronRight className="w-5 h-5" />
              </button>

            </div>
            {/* Background Icon Decoration */}
            <Dumbbell className="absolute -bottom-6 -right-6 w-64 h-64 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
          </motion.div>

          {/* Stat Card 1: Weight */}
          <StatBox 
            icon={<User className="text-purple-400" />}
            label="Current Weight"
            value={`${profile?.weight || '--'} kg`}
            subtext="On track"
            delay={0.1}
          />

          {/* Stat Card 2: Calories */}
          <StatBox 
            icon={<Flame className="text-orange-400" />}
            label="Daily Target"
            value={`${profile?.weight ? profile.weight * 24 : '--'} kcal`}
            subtext="Maintenance"
            delay={0.2}
          />

          {/* Stat Card 3: Streak */}
          <StatBox 
            icon={<Trophy className="text-yellow-400" />}
            label="Current Streak"
            value="3 Days"
            subtext="Personal Best!"
            delay={0.3}
          />

           {/* Stat Card 4: Body Type */}
           <StatBox 
            icon={<Activity className="text-emerald-400" />}
            label="Body Type"
            value={profile?.body_type || 'N/A'}
            subtext="Genetic Profile"
            delay={0.4}
          />

          {/* Weekly Schedule (Spans full width on mobile, 4 cols on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-1 md:col-span-4 bg-[#0F0F0F] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-slate-400 w-5 h-5" />
              <h3 className="text-xl font-bold text-white">Your Weekly Protocol</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['Push (Chest/Tri)', 'Pull (Back/Bi)', 'Legs & Core', 'Active Recovery'].map((day, i) => (
                <div key={i} className="group p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition">
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1 tracking-wider">Day 0{i+1}</p>
                  <p className="font-semibold text-white group-hover:text-blue-400 transition">{day}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

// Reusable Component for the small stat cards
function StatBox({ icon, label, value, subtext, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition">{icon}</div>
        {subtext && <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-full uppercase">{subtext}</span>}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}