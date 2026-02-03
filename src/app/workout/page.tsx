"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, Timer, Trophy } from "lucide-react";

// 1. The "Smart" Workout Database
// This matches the goals you set in the onboarding page exactly.
const WORKOUT_PLANS: any = {
  "Calisthenics": [
    { name: "Push-ups", sets: "3", reps: "15-20", rest: "60s" },
    { name: "Pull-ups", sets: "3", reps: "8-12", rest: "90s" },
    { name: "Dips", sets: "3", reps: "10-15", rest: "60s" },
    { name: "Bodyweight Squats", sets: "4", reps: "20", rest: "60s" },
    { name: "Plank", sets: "3", reps: "45s", rest: "60s" },
  ],
  "Building Muscle": [
    { name: "Bench Press", sets: "4", reps: "8-12", rest: "90s" },
    { name: "Back Squats", sets: "4", reps: "8-10", rest: "120s" },
    { name: "Deadlifts", sets: "3", reps: "5-8", rest: "120s" },
    { name: "Overhead Press", sets: "3", reps: "10-12", rest: "90s" },
    { name: "Dumbbell Rows", sets: "3", reps: "12", rest: "60s" },
  ],
  "Losing Weight": [
    { name: "Jump Rope", sets: "5", reps: "1 min", rest: "30s" },
    { name: "Burpees", sets: "4", reps: "15", rest: "45s" },
    { name: "Mountain Climbers", sets: "4", reps: "30s", rest: "30s" },
    { name: "High Knees", sets: "4", reps: "45s", rest: "45s" },
    { name: "Jumping Jacks", sets: "3", reps: "50", rest: "30s" },
  ],
  "General Fitness": [
    { name: "Jogging / Brisk Walk", sets: "1", reps: "20 min", rest: "-" },
    { name: "Push-ups", sets: "3", reps: "10", rest: "60s" },
    { name: "Lunges", sets: "3", reps: "12 each", rest: "60s" },
    { name: "Plank", sets: "3", reps: "30s", rest: "60s" },
  ]
};

export default function WorkoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState("General Fitness");
  
  // State to track which exercises are "Checked Off"
  const [completed, setCompleted] = useState<number[]>([]); 

  useEffect(() => {
    if (!user) return;
    // Fetch the user's goal from Supabase
    const fetchGoal = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('goal')
        .eq('id', user.id)
        .single();
      
      if (data?.goal) setGoal(data.goal);
      setLoading(false);
    };
    fetchGoal();
  }, [user]);

  const toggleExercise = (index: number) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter(i => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  const finishWorkout = () => {
    alert("Great work! Session recorded."); // Later we can save this to DB
    router.push('/dashboard');
  };

  // Select the correct plan based on the user's goal
  const exercises = WORKOUT_PLANS[goal] || WORKOUT_PLANS["General Fitness"];
  const progress = (completed.length / exercises.length) * 100;

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading Plan...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="text-slate-400" />
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">CURRENT SESSION</p>
          <h1 className="text-2xl font-black italic">{goal.toUpperCase()}</h1>
        </div>
        <div className="w-10" /> 
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-10 bg-slate-900 rounded-full h-2 overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Exercise Cards */}
      <div className="max-w-3xl mx-auto space-y-4">
        {exercises.map((ex: any, i: number) => {
          const isDone = completed.includes(i);
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
              {/* Checkbox */}
              <div className={`p-3 rounded-full transition z-10 ${isDone ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                {isDone ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>

              {/* Text Info */}
              <div className="flex-1 z-10">
                <h3 className={`text-xl font-bold mb-1 ${isDone ? 'text-blue-400 line-through' : 'text-white'}`}>
                  {ex.name}
                </h3>
                <div className="flex gap-4 text-sm text-slate-400 font-mono">
                  <span className="bg-white/5 px-2 py-1 rounded">Sets: <b className="text-white">{ex.sets}</b></span>
                  <span className="bg-white/5 px-2 py-1 rounded">Reps: <b className="text-white">{ex.reps}</b></span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Timer className="w-3 h-3" /> {ex.rest}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Finish Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent">
        <button 
          onClick={finishWorkout}
          disabled={progress < 100}
          className={`max-w-3xl mx-auto w-full py-4 rounded-xl font-bold text-lg shadow-xl transition flex items-center justify-center gap-2
            ${progress === 100 
              ? 'bg-blue-600 text-white hover:scale-105 shadow-blue-500/50' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
          {progress === 100 ? <><Trophy className="w-5 h-5" /> COMPLETE WORKOUT</> : "COMPLETE ALL EXERCISES"}
        </button>
      </div>

    </div>
  );
}