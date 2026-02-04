"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; 
import { supabase } from "@/lib/supabase"; 
import { ChevronRight, Activity, Dumbbell, Zap, User, UserCheck } from "lucide-react";

export default function Onboarding() {
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    goal: "",
    bodyType: "", // We will fill this in Step 2
  });

  const nextStep = () => setStep((s) => s + 1);

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        goal: formData.goal,
        body_type: formData.bodyType
    });

    if (error) {
      console.error("Error:", error.message);
      setIsSaving(false);
    } else {
      router.push('/dashboard');
    }
  };

  if (!userLoaded) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar (Now divided by 4 steps) */}
        <div className="mb-8 h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">The Basics</h2>
                  <p className="text-slate-400 text-sm mt-2">Let's calibrate your profile.</p>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Age</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 24" 
                      className="w-full bg-black/50 border border-slate-700 p-4 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-lg"
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 75" 
                      className="w-full bg-black/50 border border-slate-700 p-4 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-lg"
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  onClick={nextStep} 
                  disabled={!formData.age || !formData.weight}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: BODY TYPE (NEW) */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Current Physique</h2>
                  <p className="text-slate-400 text-sm mt-2">Be honest. This helps us calculate macros.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'Ectomorph', label: 'Skinny / Lean', desc: 'Hard to gain weight.' },
                    { id: 'Skinny Fat', label: 'Skinny Fat', desc: 'Low muscle, higher body fat.' },
                    { id: 'Mesomorph', label: 'Athletic / Muscular', desc: 'Gains muscle easily.' },
                    { id: 'Endomorph', label: 'Heavyset / Stocky', desc: 'Gains weight easily.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setFormData({ ...formData, bodyType: item.id }); nextStep(); }}
                      className="w-full p-4 flex items-center gap-4 bg-black/40 border border-slate-800 rounded-xl hover:border-blue-500 hover:bg-slate-800/50 transition group text-left"
                    >
                      <div className="p-3 bg-slate-900 rounded-lg group-hover:bg-slate-800 transition">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <span className="block font-bold text-lg text-slate-200 group-hover:text-white">{item.label}</span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: GOALS */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Your Focus</h2>
                  <p className="text-slate-400 text-sm mt-2">What are we destroying today?</p>
                </div>

                <div className="grid gap-3">
                  {[
                    { id: 'Losing Weight', icon: <Zap className="text-yellow-400" />, desc: "Burn fat, get lean." },
                    { id: 'Building Muscle', icon: <Dumbbell className="text-blue-400" />, desc: "Hypertrophy & Strength." },
                    { id: 'Calisthenics', icon: <Activity className="text-emerald-400" />, desc: "Bodyweight mastery." },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setFormData({ ...formData, goal: item.id }); nextStep(); }}
                      className="w-full p-4 flex items-center gap-4 bg-black/40 border border-slate-800 rounded-xl hover:border-blue-500 hover:bg-slate-800/50 transition group text-left"
                    >
                      <div className="p-3 bg-slate-900 rounded-lg group-hover:bg-slate-800 transition">{item.icon}</div>
                      <div>
                        <span className="block font-bold text-lg text-slate-200 group-hover:text-white">{item.id}</span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRM */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-4"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <UserCheck className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">You're Set!</h2>
                  <p className="text-slate-400">
                    Target: <span className="text-blue-400 font-bold">{formData.goal}</span>
                    <br />
                    Physique: <span className="text-purple-400 font-bold">{formData.bodyType}</span>
                  </p>
                </div>

                <button 
                  onClick={saveProfile} 
                  disabled={isSaving}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition shadow-xl disabled:opacity-50"
                >
                  {isSaving ? "Syncing..." : "Enter Dashboard"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}