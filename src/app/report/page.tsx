"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Download, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportPage() {
  const { user } = useUser();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      // Fetch all daily logs ordered by date
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: true }); // Ascending for the graph
      
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Generating Report...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold italic uppercase tracking-tighter">Progress Report</h1>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. Weight Progress Graph */}
        <div className="bg-[#0F0F0F] border border-white/5 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-green-400 w-5 h-5" />
                <h3 className="text-xl font-bold text-white">Weight Trend</h3>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={logs}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="log_date" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. Detailed History Table */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold">Log History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-white/5 text-slate-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Weight</th>
                            <th className="p-4">Calories</th>
                            <th className="p-4">Workout?</th>
                            <th className="p-4">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center italic">No logs found yet.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition">
                                    <td className="p-4 font-mono text-white">{new Date(log.log_date).toLocaleDateString()}</td>
                                    <td className="p-4">{log.weight} kg</td>
                                    <td className="p-4">{log.calories} kcal</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.workout_done ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {log.workout_done ? 'Yes' : 'Rest'}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-xs truncate italic">"{log.notes}"</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}