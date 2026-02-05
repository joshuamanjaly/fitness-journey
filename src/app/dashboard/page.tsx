"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Activity, Flame, Trophy, Dumbbell, Calendar, ChevronRight, User, Settings as SettingsIcon, Map, History, FileText, TrendingUp 
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]); // Store history
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Fetch Profile
      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // SAFETY CHECK: If no profile, send to onboarding
      if (error || !profileData) {
        router.push('/onboarding');
        return;
      }
      setProfile(profileData);

      // 2. Fetch Logs (Sorted by newest)
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('*') // Get everything including workout_name
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (logs) {
        setStreak(calculateStreak(logs));
        setChartData(processChartData(logs));
        setRecentLogs(logs.slice(0, 5)); // Keep only the last 5 for the history list
      }
      setLoading(false);
    };

    fetchData();
  }, [user, router]);

  // Streak & Chart Logic
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

  const processChartData = (logs: any[]) => {
    const last7Days = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      const count = logs.filter(log => new Date(log.completed_at).toDateString() === dateString).length;
      last7Days.push({ day: days[d.getDay()], workouts: count });
    }
    return last7Days;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-mono">LOADING HEADQUARTERS...</p>
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
        
        {/* --- HEADER SECTION WITH NEW BUTTONS --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Headquarters</h1>
            <p className="text-slate-400 mt-2 text-lg">Your <span className="text-blue-500 font-bold">{profile?.goal}</span> protocol is active.</p>
            
            {/* NEW BUTTONS HERE */}
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => router.push('/checkin')}
                className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition border border-white/5 hover:border-white/20"
              >
                <FileText className="w-4 h-4 text-blue-400" /> Daily Check-in
              </button>
              <button 
                onClick={() => router.push('/report')}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/20"
              >
                <TrendingUp className="w-4 h-4" /> Generate Report
              </button>
            </div>

          </div>
          <p className="text-slate-600 font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        {/* --- THE JOURNEY MAP --- */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 relative z-10">
                <Map className="text-blue-500 w-5 h-5" />
                <h3 className="text-xl font-bold text-white">Your 100-Day Roadmap</h3>
            </div>
            
            {/* The Timeline */}
            <div className="relative z-10">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full"></div>
                {/* Progress Fill */}
                <motion.div 
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((streak / 100) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />

                <div className="relative flex justify-between">
                    {[1, 7, 30, 60, 100].map((day) => {
                        const isUnlocked = streak >= day;
                        const isNext = streak < day && streak >= (day === 1 ? 0 : day === 7 ? 1 : day === 30 ? 7 : day === 60 ? 30 : 60);
                        
                        return (
                            <div key={day} className="flex flex-col items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-[#0a0a0a] transition-all duration-500
                                    ${isUnlocked ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 
                                      isNext ? 'border-white animate-pulse' : 'border-slate-700'}`}>
                                    {isUnlocked ? <Trophy className="w-3 h-3 text-blue-500" /> : <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-white' : 'bg-slate-700'}`} />}
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>Day {day}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:block">
                                        {day === 1 ? "Start" : day === 7 ? "Habit" : day === 30 ? "Results" : day === 60 ? "Lifestyle" : "Mastery"}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6">
          
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

          {/* Analytics & History Section */}
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
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="workouts" radius={[4, 4, 4, 4]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.workouts > 0 ? '#3b82f6' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Recent History */}
            <div className="border-l border-white/5 pl-0 md:pl-8 flex flex-col space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <History className="text-slate-500 w-4 h-4" />
                 <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Recent Activity</h4>
               </div>
               
               {recentLogs.length === 0 ? (
                 <p className="text-slate-600 text-sm italic">No workouts logged yet.</p>
               ) : (
                 recentLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">{log.workout_name || "Workout"}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{new Date(log.completed_at).toLocaleDateString()}</p>
                      </div>
                      <CheckCircleIcon />
                    </div>
                 ))
               )}
            </div>

          </motion.div>

        </div>
      </main>
    </div>
  );
}

// Helper Components
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

function CheckCircleIcon() {
  return (
    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
    </div>
  )
}