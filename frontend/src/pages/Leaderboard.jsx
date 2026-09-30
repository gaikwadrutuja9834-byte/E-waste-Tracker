import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Trophy, Medal, Sparkles, User, ShieldCheck } from 'lucide-react';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.points.getLeaderboard();
        setLeaders(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-200">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black">
            🥉
          </div>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-xs">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Campus Sustainability Championship</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Green Points Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Recognizing the top campus students, departments, and community members driving circular recycling.
        </p>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <span>Top Contributors</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Updated live</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading leaderboard rankings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                  <th className="py-3.5 px-6 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-6">Eco-Champion</th>
                  <th className="py-3.5 px-6 text-center">Passports Tracked</th>
                  <th className="py-3.5 px-6 text-right">Green Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaders.map((u) => {
                  const isCurrent = u.is_current_user || u.email === user?.email;

                  return (
                    <tr
                      key={u.email}
                      className={`transition-colors ${
                        isCurrent ? 'bg-eco-50/70 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">{getRankBadge(u.rank)}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] uppercase font-bold bg-eco-200 text-eco-800 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center font-mono font-bold text-slate-700">
                        {u.passports_count}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="font-mono font-black text-sm text-eco-700 bg-eco-100/60 px-3 py-1 rounded-lg border border-eco-200">
                          {u.green_points} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
