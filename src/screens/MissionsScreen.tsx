/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, TrendingUp, CheckCircle2, Trophy, ArrowLeft, Calendar } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState, Mission } from '../types';

export default function MissionsScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;

  const getMissionProgress = (missionId: string) => {
    return state.userMissions.find(m => m.missionId === missionId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#37474F] p-6 pb-20 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate(-1)} className="p-3 bg-white/10 text-white rounded-2xl backdrop-blur-md">
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-xl font-black text-white uppercase tracking-tight">Mission Control</h1>
        </div>

        <div className="flex justify-between items-end">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.2em]">Current Streak</span>
              <div className="flex items-center gap-2">
                 <h2 className="text-4xl font-black text-white">{user.streak || 0}</h2>
                 <span className="text-sm font-black text-white/50 uppercase">Days</span>
              </div>
           </div>
           <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2">
              <Calendar size={20} className="text-[#FFC107]" />
              <div className="text-right">
                <p className="text-[8px] font-black text-white/50 uppercase">Next Reward</p>
                <p className="text-[10px] font-black text-white uppercase">{7 - ((user.streak || 0) % 7)} Days left</p>
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 -mt-10 space-y-8 pb-32">
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Target size={16} /> Daily Missions
              </h3>
              <span className="text-[10px] font-black text-[#FFC107] uppercase">Refresh in 12h</span>
           </div>

           <div className="space-y-3">
              {state.missions && state.missions.length > 0 ? (
                state.missions.map((mission) => {
                  const progress = getMissionProgress(mission.id);
                  const current = progress?.current || 0;
                  const isCompleted = progress?.completed || false;
                  const percent = Math.min(100, (current / mission.goal) * 100);

                  return (
                    <Card key={mission.id} className={`p-4 border-none shadow-md space-y-4 transition-all ${isCompleted ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-500'}`}>
                             {isCompleted ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#37474F]">{mission.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{mission.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-black text-green-500">৳{mission.reward}</span>
                           <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Bonus</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                           <span className="text-[9px] font-black text-gray-400 uppercase">Progress</span>
                           <span className="text-[9px] font-black text-[#37474F]">{current} / {mission.goal}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-[#FFC107]'}`}
                             style={{ width: `${percent}%` }}
                           />
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="py-10 text-center opacity-30 italic text-xs">No active missions today. Check back later!</div>
              )}
           </div>
        </div>

        <Card className="p-6 bg-[#37474F] text-white space-y-4 rounded-[40px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC107]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
           <div className="flex items-center gap-3">
              <Trophy size={24} className="text-[#FFC107]" />
              <h4 className="text-sm font-black uppercase tracking-tight">Earning Streak</h4>
           </div>
           <p className="text-xs font-medium text-white/70 leading-relaxed uppercase">
             Complete at least 5 tasks daily to maintain your streak. Reach 7 days to unlock a ৳10 Bonus!
           </p>
           <div className="grid grid-cols-7 gap-1 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="flex flex-col items-center gap-1">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                     (user.streak || 0) >= day ? 'bg-[#FFC107] text-[#37474F] shadow-lg shadow-[#FFC107]/20 scale-110' : 'bg-white/10 text-white/30'
                   }`}>
                      {day}
                   </div>
                   {(user.streak || 0) >= day && <div className="w-1 h-1 bg-[#FFC107] rounded-full animate-pulse" />}
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
}
