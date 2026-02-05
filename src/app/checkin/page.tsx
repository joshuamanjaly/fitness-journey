"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Scale, Flame, FileText, CheckCircle, XCircle } from "lucide-react";

export default function DailyCheckIn() {
  const { user } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: "",
    calories: "",
    workoutDone: true,
    mood: "Great",
    notes: ""
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('daily_logs').upsert({
      user_id: user.id,
      log_date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
      weight: parseFloat(formData.weight) || 0,
      calories: parseInt(formData.calories) || 0,
      workout_done: formData.workoutDone,
      mood: formData.mood,
      notes: formData.notes
    }, { onConflict: 'user_id, log_date' });

    if (error) {
      alert("Error saving log!");
      setSaving(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
            <h1 className="text-3xl font-bold italic uppercase tracking-tighter">Daily Check-in</h1>
            <p className="text-slate-400 text-sm">Close your day with accountability.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* 1. Workout Toggle */}
        <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
            <div>
                <h3 className="font-bold text-lg text-white">Did you workout today?</h3>
                <p className="text-slate-500 text-xs">Be honest with yourself.</p>
            </div>
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                <button 
                    onClick={() => setFormData({...formData, workoutDone: true})}
                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${formData.workoutDone ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                    <CheckCircle className="w-4 h-4" /> YES
                </button>
                <button 
                    onClick={() => setFormData({...formData, workoutDone: false})}
                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${!formData.workoutDone ? 'bg-red-600 text-white' : 'text-slate-500'}`}
                >
                    <XCircle className="w-4 h-4" /> NO
                </button>
            </div>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" /> End of Day Weight
                </label>
                <div className="flex items-end gap-2">
                    <input 
                        type="number" 
                        placeholder="0"
                        className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-700"
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                    <span className="text-slate-500 font-bold mb-1">kg</span>
                </div>
            </div>

            <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" /> Total Calories
                </label>
                <div className="flex items-end gap-2">
                    <input 
                        type="number" 
                        placeholder="0"
                        className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-700"
                        onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    />
                    <span className="text-slate-500 font-bold mb-1">kcal</span>
                </div>
            </div>
        </div>

        {/* 3. Note to Self */}
        <div className="bg-[#0F0F0F] border border-white/5 p-6 rounded-3xl">
            <label className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Note to Future Self
            </label>
            <textarea 
                placeholder="How do you feel? What did you learn today?"
                className="w-full bg-black/30 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-blue-500 outline-none h-32 resize-none"
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? "Saving Entry..." : <>Complete Check-in <Save className="w-5 h-5" /></>}
        </button>

      </div>
    </div>
  );
}