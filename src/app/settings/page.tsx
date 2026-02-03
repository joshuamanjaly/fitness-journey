"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, User, Activity } from "lucide-react";

export default function Settings() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    goal: "",
    bodyType: "",
  });

  // 1. Fetch current data when page loads
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData({
          age: data.age?.toString() || "", // Convert numbers to string for inputs
          weight: data.weight?.toString() || "",
          goal: data.goal || "General Fitness",
          bodyType: data.body_type || "Mesomorph",
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // 2. Save updates to Supabase
  const handleSave = async () => {
    if (!user) return; // <--- FIX: Safety check to stop TypeScript errors
    
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        age: parseInt(formData.age) || 0, // Safety check for empty numbers
        weight: parseInt(formData.weight) || 0,
        goal: formData.goal,
        body_type: formData.bodyType
      })
      .eq('id', user.id);

    if (!error) {
      setTimeout(() => router.push('/dashboard'), 800);
    } else {
      console.error(error);
      setSaving(false);
    }
  };

  // Wait for Clerk to load before showing anything
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold italic uppercase tracking-tighter">Profile Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Section 1: Stats */}
        <div className="bg-[#0F0F0F] border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> My Stats
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-black/50 border border-slate-800 p-4 rounded-xl focus:border-blue-500 outline-none text-xl font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-black/50 border border-slate-800 p-4 rounded-xl focus:border-blue-500 outline-none text-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Goal Selector */}
        <div className="bg-[#0F0F0F] border border-white/5 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Current Goal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Losing Weight', 'Building Muscle', 'Calisthenics', 'General Fitness'].map((g) => (
              <button
                key={g}
                onClick={() => setFormData({ ...formData, goal: g })}
                className={`p-4 rounded-xl border text-left font-semibold transition
                  ${formData.goal === g 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <>Saving Changes...</>
          ) : (
            <>Save & Update Profile <Save className="w-5 h-5" /></>
          )}
        </button>

      </div>
    </div>
  );
}