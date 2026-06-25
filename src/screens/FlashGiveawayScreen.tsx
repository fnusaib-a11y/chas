
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Gift, Trophy, Users, Clock, Flame, Sparkles } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function FlashGiveawayScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour countdown example

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleJoin = () => {
    alert('You have successfully joined the Flash Giveaway! Winners will be announced soon.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 pb-32 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
        </div>
        
        <div className="relative z-10 flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Flame size={12} className="text-yellow-300" /> Flash Event Live
            </p>
          </div>
          <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
            <Users size={20} />
          </button>
        </div>

        <div className="relative z-10 text-center space-y-4">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, type: 'tween' }}
            className="w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-[40px] flex items-center justify-center mx-auto border-2 border-white/50"
          >
            <Gift size={48} className="text-white drop-shadow-lg" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Flash Giveaway</h1>
            <p className="text-white/70 text-xs font-black uppercase tracking-[0.3em]">Win Massive Rewards Instantly</p>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-20 space-y-6 pb-32">
        <Card className="p-8 border-none shadow-2xl rounded-[40px] bg-white text-center space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ending In</p>
            <div className="text-5xl font-black text-[#37474F] tracking-tighter flex items-center justify-center gap-2">
               <span className="text-red-500 animate-pulse"><Clock size={40} /></span>
               {formatTime(timeLeft)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
               <p className="text-2xl font-black text-orange-600">৳5,000</p>
               <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mt-1">Total Prize Pool</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
               <p className="text-2xl font-black text-blue-600">500+</p>
               <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Participants</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex flex-col items-center gap-2">
               <Badge className="bg-green-100 text-green-600 border-none px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-widest">
                 Open for All Levels
               </Badge>
             </div>
             <Button 
               onClick={handleJoin}
               className="w-full h-20 rounded-[32px] bg-gradient-to-r from-red-600 to-orange-500 text-white font-black uppercase tracking-[0.3em] shadow-2xl shadow-red-200 group relative overflow-hidden"
             >
               <span className="relative z-10 flex items-center justify-center gap-3">
                 <Zap size={24} fill="white" /> Join Giveaway
               </span>
               <motion.div 
                 animate={{ x: ['100%', '-100%'] }}
                 transition={{ duration: 2, repeat: Infinity, ease: 'linear', type: 'tween' }}
                 className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full"
               />
             </Button>
             <p className="text-[10px] font-bold text-gray-400 uppercase">Joining is free for active members</p>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-[#37474F] uppercase tracking-widest flex items-center gap-2">
            <Trophy size={18} className="text-[#FFC107]" /> Recent Flash Winners
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Rahat', reward: '৳500', time: '10m ago' },
              { name: 'Sumi', reward: '৳250', time: '25m ago' },
              { name: 'Keya', reward: '৳100', time: '1h ago' },
            ].map((winner, i) => (
              <Card key={i} className="p-4 flex items-center justify-between border-none shadow-sm rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-xs text-gray-400 uppercase">
                    {winner.name[0]}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-[#37474F]">{winner.name}</h5>
                    <p className="text-[10px] text-gray-300 font-bold uppercase">{winner.time}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-green-500">{winner.reward}</p>
                   <div className="flex text-yellow-400"><Sparkles size={12} /></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
