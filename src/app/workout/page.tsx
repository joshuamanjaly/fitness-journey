"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, Timer, Trophy, Loader2, Calendar, TrendingUp, Sparkles } from "lucide-react";

// --- 1. MOTIVATIONAL QUOTES DATABASE ---
const MOTIVATIONAL_QUOTES = [
  "Pain is weakness leaving the body.",
  "Your only limit is you.",
  "Don't stop when you're tired. Stop when you're done.",
  "Sweat is just fat crying.",
  "Focus on the goal, not the obstacle.",
  "You don't find willpower, you create it.",
  "Every rep counts.",
  "Make yourself proud today.",
  "Discipline equals freedom.",
  "The body achieves what the mind believes."
];

// --- 2. WORKOUT DATABASE (Same as before) ---
const WORKOUT_DATABASE: any = {
  "Building Muscle": {
    "Monday": { type: "Push (Chest/Tri)", exercises: [{ name: "Bench Press", sets: "4", reps: "8-12", rest: "90s" }, { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "90s" }, { name: "Tricep Pushdowns", sets: "3", reps: "15", rest: "60s" }] },
    "Tuesday": { type: "Pull (Back/Bi)", exercises: [{ name: "Deadlifts", sets: "3", reps: "5", rest: "120s" }, { name: "Pull-Ups", sets: "3", reps: "AMRAP", rest: "90s" }, { name: "Bicep Curls", sets: "3", reps: "12", rest: "60s" }] },
    "Wednesday": { type: "Legs & Core", exercises: [{ name: "Squats", sets: "4", reps: "6-8", rest: "120s" }, { name: "Leg Press", sets: "3", reps: "12", rest: "90s" }, { name: "Plank", sets: "3", reps: "60s", rest: "60s" }] },
    "Thursday": { type: "Push (Chest/Tri)", exercises: [{ name: "Overhead Press", sets: "4", reps: "10", rest: "90s" }, { name: "Dips", sets: "3", reps: "10", rest: "60s" }] },
    "Friday": { type: "Pull (Back/Bi)", exercises: [{ name: "Lat Pulldowns", sets: "4", reps: "12", rest: "60s" }, { name: "Cable Rows", sets: "3", reps: "12", rest: "60s" }] },
    "Saturday": { type: "Legs & Core", exercises: [{ name: "Lunges", sets: "3", reps: "12 each", rest: "60s" }, { name: "Calf Raises", sets: "4", reps: "15", rest: "60s" }] },
    "Sunday": { type: "Active Recovery", exercises: [{ name: "Light Yoga", sets: "1", reps: "20 min", rest: "-" }] }
  },
  "General Fitness": {
    "Monday": { type: "Full Body A", exercises: [{ name: "Squats", sets: "3", reps: "12", rest: "60s" }, { name: "Push-ups", sets: "3", reps: "12", rest: "60s" }, { name: "Rows", sets: "3", reps: "12", rest: "60s" }] },
    "Tuesday": { type: "Cardio", exercises: [{ name: "Run / Jog", sets: "1", reps: "30 min", rest: "-" }] },
    "Wednesday": { type: "Full Body B", exercises: [{ name: "Lunges", sets: "3", reps: "12", rest: "60s" }, { name: "Overhead Press", sets: "3", reps: "12", rest: "60s" }, { name: "Plank", sets: "3", reps: "45s", rest: "60s" }] },
    "Thursday": { type: "Cardio", exercises: [{ name: "HIIT Session", sets: "1", reps: "20 min", rest: "-" }] },
    "Friday": { type: "Full Body C", exercises: [{ name: "Deadlift", sets: "3", reps: "10", rest: "90s" }, { name: "Dips", sets: "3", reps: "10", rest: "60s" }] },
    "Saturday": { type: "Active Fun", exercises: [{ name: "Sports / Hike", sets: "1", reps: "60 min", rest: "-" }] },
    "Sunday": { type: "Rest", exercises: [{ name: "Walk", sets: "1", reps: "30 min", rest: "-" }] }
  },
  "Calisthenics": {
    "Monday": { type: "Upper Body Skills", exercises: [{ name: "Muscle-up Progression", sets: "3", reps: "5", rest: "120s" }, { name: "Explosive Pull-ups", sets: "3", reps: "8", rest: "90s" }] },
    "Tuesday": { type: "Lower Body", exercises: [{ name: "Pistol Squats", sets: "3", reps: "8 each", rest: "90s" }, { name: "Nordic Curls", sets: "3", reps: "5", rest: "120s" }] },
    "Wednesday": { type: "Core & Statics", exercises: [{ name: "L-Sit Hold", sets: "4", reps: "15s", rest: "60s" }, { name: "Dragon Flags", sets: "3", reps: "5", rest: "90s" }] },
    "Thursday": { type: "Push Strength", exercises: [{ name: "Handstand Push-ups", sets: "3", reps: "5-8", rest: "120s" }, { name: "Dips", sets: "4", reps: "15", rest: "60s" }] },
    "Friday": { type: "Pull Strength", exercises: [{ name: "Weighted Pull-ups", sets: "4", reps: "5", rest: "120s" }, { name: "Front Lever Tucks", sets: "3", reps: "10s", rest: "90s" }] },
    "Saturday": { type: "Endurance", exercises: [{ name: "Burpees", sets: "3", reps: "20", rest: "60s" }, { name: "Jump Squats", sets: "3", reps: "20", rest: "60s" }] },
    "Sunday": { type: "Rest & Mobility", exercises: [{ name: "Full Body Stretch", sets: "1", reps: "30 min", rest: "-" }] }
  }
};

export default function WorkoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data State
  const [goal, setGoal] = useState("General Fitness");
  const [completed, setCompleted] = useState<number[]>([]); 
  const [todayName, setTodayName] = useState("Monday");
  const [level, setLevel] = useState(0);

  // Motivational Popups State
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setTodayName(day);

    const fetchData = async () => {
      const { data: profile } = await supabase.from('profiles').select('goal').eq('id', user.id).single();
      if (profile?.goal) setGoal(profile.goal);

      const { count } = await supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (count) setLevel(Math.floor(count / 3)); 

      setLoading(false);
    };
    fetchData();

    // --- MOTIVATIONAL TIMER LOGIC ---
    const timer = setInterval(() => {
      // 1. Pick a random quote
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);

      // 2. Hide it after 6 seconds
      setTimeout(() => setQuote(null), 6000);

    }, 45000); // Run every 45,000ms (45 seconds)

    return () => clearInterval(timer); // Cleanup on exit
  }, [user]);

  const getProgressiveReps = (baseReps: string) => {
    if (baseReps.includes('s') || baseReps.includes('min') || baseReps === "AMRAP") return baseReps;
    return baseReps.replace(/(\d+)/g, (match) => (parseInt(match) + level).toString());
  };

  const currentPlan = WORKOUT_DATABASE[goal] || WORKOUT_DATABASE["General Fitness"];
  const todaysWorkout = currentPlan[todayName] || currentPlan["Monday"]; 
  const exercises = todaysWorkout.exercises || [];

  const toggleExercise = (index: number) => {
    if (completed.includes(index)) setCompleted(completed.filter(i => i !== index));
    else setCompleted([...completed, index]);
  };

  const finishWorkout = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('workout_logs').insert({
      user_id: user.id,
      workout_name: `${goal} - ${todaysWorkout.type}`,
      completed_at: new Date().toISOString()
    });
    if (!error) router.push('/dashboard');
  };

  const progress = exercises.length > 0 ? (completed.length / exercises.length) * 100 : 0;

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading Protocol...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32 relative">
      
      {/* --- MOTIVATIONAL POPUP COMPONENT --- */}
      <AnimatePresence>
        {quote && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 left-6 right-6 z-40"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Coach Says:</p>
                <p className="text-white font-bold text-sm italic">"{quote}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ------------------------------------ */}

      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="text-slate-400" />
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
             <Calendar className="w-3 h-3" /> {todayName.toUpperCase()}
          </p>
          <h1 className="text-xl md:text-2xl font-black italic">{todaysWorkout.type?.toUpperCase()}</h1>
        </div>
        <div className="flex flex-col items-center">
             <div className="bg-blue-900/30 px-2 py-1 rounded text-[10px] font-bold text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> LVL {level + 1}
             </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-10 bg-slate-900 rounded-full h-2 overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {exercises.map((ex: any, i: number) => {
          const isDone = completed.includes(i);
          const smartReps = getProgressiveReps(ex.reps);
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleExercise(i)}
              className={`p-6 rounded-2xl border transition cursor-pointer flex items-center gap-6 group relative overflow-hidden
                ${isDone 
                  ? 'bg-blue-900/20 border-blue-500/50' 
                  : 'bg-[#0F0F0F] border-white/5 hover:border-white/20'
                }`}
            >
              <div className={`p-3 rounded-full transition z-10 ${isDone ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                {isDone ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>
              <div className="flex-1 z-10">
                <h3 className={`text-xl font-bold mb-1 ${isDone ? 'text-blue-400 line-through' : 'text-white'}`}>
                  {ex.name}
                </h3>
                <div className="flex gap-4 text-sm text-slate-400 font-mono">
                  <span className="bg-white/5 px-2 py-1 rounded">Sets: <b className="text-white">{ex.sets}</b></span>
                  <span className={`px-2 py-1 rounded border transition-colors ${level > 0 ? 'bg-blue-900/30 border-blue-500/50 text-blue-200' : 'bg-white/5 border-transparent'}`}>
                    Reps: <b className="text-white">{smartReps}</b>
                    {level > 0 && <span className="text-[9px] ml-1 text-blue-400 font-bold">↑</span>}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Timer className="w-3 h-3" /> {ex.rest}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
        <button 
          onClick={finishWorkout}
          disabled={progress < 100 || submitting}
          className={`max-w-3xl mx-auto w-full py-4 rounded-xl font-bold text-lg shadow-xl transition flex items-center justify-center gap-2
            ${progress === 100 
              ? 'bg-blue-600 text-white hover:scale-105 shadow-blue-500/50' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> SAVING...</>
          ) : progress === 100 ? (
            <><Trophy className="w-5 h-5" /> COMPLETE WORKOUT</>
          ) : (
            "COMPLETE ALL EXERCISES"
          )}
        </button>
      </div>

    </div>
  );
}