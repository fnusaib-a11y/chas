/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Lock, Gift, Star, Target, LogIn, ShoppingBag, ListChecks } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { AppState, DailyChallengeStatus } from '../types';
import { dbService } from '../dbService';

export default function DailyChallengesScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser;
  const today = new Date().toISOString().split('T')[0];
  const challenge = state.dailyChallenges.find(c => c.date === today);

  if (!user) return null;

  const tasks = [
    { 
      id: 'login', 
      title: 'Daily Login', 
      desc: 'Just open the app every day', 
      icon: LogIn, 
      done: challenge?.hasLoggedIn,
      color: 'bg-blue-500'
    },
    { 
      id: 'task', 
      title: 'Complete 3 Tasks', 
      desc: 'Finish your daily money tasks', 
      icon: ListChecks, 
      done: (challenge?.tasksCompleted || 0) >= 3,
      progress: `${challenge?.tasksCompleted || 0}/3`,
      color: 'bg-purple-500'
    },
    { 
      id: 'shopping', 
      title: 'Shop Something', 
      desc: 'Buy any item from the shop', 
      icon: ShoppingBag, 
      done: challenge?.shoppingDone,
      color: 'bg-green-500'
    }
  ];

  const allDone = tasks.every(t => t.done);

  const handleClaim = async () => {
    if (!challenge) return;
    await dbService.claimDailyChallenge(challenge.id, user.id);
    alert('Giant Reward Claimed! ৳50 Added to your balance.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#FFC107] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-[#37474F]"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-black text-[#37474F]">Daily Challenges</h2>
        </div>
        
        <Card className="bg-white/20 backdrop-blur-md border-white/30 p-6 rounded-[32px] flex items-center gap-4">
           <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center shadow-inner">
              <Gift size={32} className="text-[#FFC107] animate-bounce" />
           </div>
           <div>
              <p className="text-[#37474F]/70 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Today's Reward</p>
              <h3 className="text-xl font-black text-[#37474F]">৳50 GIANT REWARD</h3>
           </div>
        </Card>
      </div>

      <div className="p-6 -mt-8 space-y-4">
         {tasks.map((task, i) => (
           <Card key={task.id} className={`p-4 flex items-center gap-4 border-none shadow-sm rounded-[24px] ${task.done ? 'bg-white opacity-100' : 'bg-gray-100 opacity-70'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${task.color}`}>
                 <task.icon size={24} />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-black text-[#37474F] uppercase tracking-tight">{task.title}</h4>
                 <p className="text-[10px] font-bold text-gray-500">{task.desc}</p>
                 {task.progress && <p className="text-[9px] font-black text-[#FFC107] mt-1">PROGRESS: {task.progress}</p>}
              </div>
              {task.done ? (
                <div className="p-2 bg-green-500 rounded-full text-white">
                   <CheckCircle2 size={16} />
                </div>
              ) : (
                <div className="p-2 bg-gray-200 rounded-full text-gray-400">
                   <Lock size={16} />
                </div>
              )}
           </Card>
         ))}

         <div className="pt-8">
            <Button 
               disabled={!allDone || challenge?.isClaimed}
               onClick={handleClaim}
               className={`w-full h-16 rounded-[24px] text-sm font-black uppercase tracking-widest shadow-xl ${allDone && !challenge?.isClaimed ? 'bg-[#FFC107] animate-pulse' : 'bg-gray-300'}`}
            >
               {challenge?.isClaimed ? 'Already Claimed' : 'Claim Giant Reward'}
            </Button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
               Resets in {24 - new Date().getHours()} hours
            </p>
         </div>
      </div>

      {/* Time Currency Tracker Card */}
      <div className="p-6">
         <Card className="bg-[#37474F] p-8 rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Time Currency</h4>
                      <p className="text-white/40 text-[9px] font-bold uppercase transition-colors group-hover:text-[#FFC107]">You earn while you wait</p>
                   </div>
                   <Badge className="bg-[#FFC107] text-[#37474F] border-none font-black text-xs px-3">LIVE</Badge>
                </div>

                <div className="flex items-end gap-2">
                   <span className="text-4xl font-black text-white leading-none">{(user.timeCoins || 0).toLocaleString()}</span>
                   <span className="text-[#FFC107] font-black uppercase text-[10px] mb-1">Time Coins</span>
                </div>

                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(user.activeTimeToday % 60) / 60 * 100}%` }}
                     className="h-full bg-[#FFC107]"
                   />
                </div>
                <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em]">{60 - (user.activeTimeToday % 60)}s until next coin</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
