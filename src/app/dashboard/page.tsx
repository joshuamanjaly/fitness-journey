"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Activity, Flame, Trophy, Dumbbell, Calendar, ChevronRight, User, Settings as SettingsIcon 
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // 2. Fetch Logs for Streak & Chart
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (logs) {
        setStreak(calculateStreak(logs));
        setChartData(processChartData(logs));
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // --- 1. STREAK LOGIC ---
  const calculateStreak = (logs: any[]) => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = new Set(logs.map(log => new Date(log.completed_at).toDateString()));
    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (uniqueDates.has(d.toDateString())) currentStreak++;
      else if (i > 0) break;
    }
    return currentStreak;
  };

  // --- 2. CHART LOGIC (Last 7 Days) ---
  const processChartData = (logs: any[]) => {
    const last7Days = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      
      // Count workouts on this specific date
      const count = logs.filter(log => new Date(log.completed_at).toDateString() === dateString).length;
      
      last7Days.push({
        day: days[d.getDay()], // e.g., "Mon"
        workouts: count,
        fullDate: dateString
      });
    }
    return last7Days;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-mono">SYNCING HEADQUARTERS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      
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
            <button onClick={() => router.push('/settings')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300 hover:text-white">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <div className="p-1 bg-white/10 rounded-full">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Headquarters</h1>
            <p className="text-slate-400 mt-2 text-lg">Your <span className="text-blue-500 font-bold">{profile?.goal}</span> protocol is active.</p>
          </div>
          <p className="text-slate-600 font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6">
          
          {/* Main Hero Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-blue-900/20">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white mb-4 border border-white/20">
                  <Activity className="w-3 h-3" /> TODAY'S SESSION
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">Daily Protocol <br/> Ready to Start</h2>
                <p className="text-blue-100/80 text-sm max-w-sm">Log your session to keep your streak alive. Consistency is the only metric that matters.</p>
              </div>
              <button onClick={() => router.push('/workout')} className="mt-8 bg-white text-blue-700 w-full sm:w-auto px-6 py-4 rounded-xl font-bold hover:scale-[1.02] transition shadow-xl flex items-center justify-center gap-2">
                Start Workout <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Dumbbell className="absolute -bottom-6 -right-6 w-64 h-64 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
          </motion.div>

          <StatBox icon={<User className="text-purple-400" />} label="Current Weight" value={`${profile?.weight || '--'} kg`} subtext="On track" delay={0.1} />
          <StatBox icon={<Flame className="text-orange-400" />} label="Daily Target" value={`${profile?.weight ? profile.weight * 24 : '--'} kcal`} subtext="Maintenance" delay={0.2} />
          <StatBox icon={<Trophy className="text-yellow-400" />} label="Active Streak" value={`${streak} Day${streak !== 1 ? 's' : ''}`} subtext={streak > 0 ? "Keep it up!" : "Start today"} delay={0.3} />
          <StatBox icon={<Activity className="text-emerald-400" />} label="Body Type" value={profile?.body_type || 'N/A'} subtext="Genetic Profile" delay={0.4} />

          {/* --- NEW: ANALYTICS & SCHEDULE SECTION --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-1 md:col-span-4 bg-[#0F0F0F] border border-white/5 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: The Chart */}
            <div className="md:col-span-2 h-64">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-blue-500 w-5 h-5" />
                <h3 className="text-xl font-bold text-white">Activity Volume (Last 7 Days)</h3>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="workouts" radius={[4, 4, 4, 4]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.workouts > 0 ? '#3b82f6' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: The Schedule List */}
            <div className="border-l border-white/5 pl-0 md:pl-8 flex flex-col justify-center space-y-3">
               <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Upcoming Schedule</h4>
               {['Push (Chest/Tri)', 'Pull (Back/Bi)', 'Legs & Core', 'Active Recovery'].map((day, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 bg-black/40 px-2 py-1 rounded">D{i+1}</span>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{day}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                </div>
              ))}
            </div>

          </motion.div>

        </div>
      </main>
    </div>
  );
}

function StatBox({ icon, label, value, subtext, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group">
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