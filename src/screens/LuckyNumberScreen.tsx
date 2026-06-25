/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Zap, ArrowLeft, Target, Wallet, Clock, Info } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function LuckyNumberScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = async () => {
    if (!selectedNum) return alert('Select a number!');
    if (user.balance < Number(betAmount)) return alert('Insufficient balance!');
    
    setIsProcessing(true);
    try {
      await dbService.buyLuckyNumber(user.id, selectedNum, Number(betAmount));
      alert(`Entered draw with number ${selectedNum}! Results in 1 hour.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 pb-24 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        
        <div className="flex items-center gap-4 mb-10 text-white">
           <button onClick={() => navigate(-1)} className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
             <ArrowLeft size={24} />
           </button>
           <h1 className="text-xl font-black uppercase tracking-tight">Lucky Draw</h1>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <p className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.3em] opacity-80">Mega Prize Pool</p>
              <div className="flex items-center gap-4">
                 <h2 className="text-5xl font-black text-white">৳1,500</h2>
                 <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase border border-green-500/30">Live</div>
              </div>
           </div>
           
           <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Clock className="text-[#FFC107]" />
                 <div className="text-left">
                    <p className="text-[8px] font-black text-white/50 uppercase">Next Draw</p>
                    <p className="text-xs font-black text-white uppercase">45:12 Minutes Left</p>
                 </div>
              </div>
              <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                 <Info size={18} />
              </button>
           </div>
        </div>
      </div>

      <div className="p-8 -mt-16 space-y-10 pb-32">
        <Card className="p-8 border-none shadow-2xl space-y-8 bg-white/80 backdrop-blur-xl rounded-[40px]">
           <div className="space-y-4 text-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Pick your lucky number</h3>
              <div className="grid grid-cols-5 gap-3">
                 {[1,2,3,4,5,6,7,8,9,10].map(n => (
                   <button 
                     key={n}
                     onClick={() => setSelectedNum(n)}
                     className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                       selectedNum === n ? 'bg-[#FFC107] text-[#37474F] shadow-xl shadow-orange-100 scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                     }`}
                   >
                     {n}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-center text-gray-400">Select Ticket Price</h4>
              <div className="flex gap-3">
                 {['5', '10', '50'].map(amt => (
                   <button 
                     key={amt}
                     onClick={() => setBetAmount(amt)}
                     className={`flex-1 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${
                       betAmount === amt ? 'border-purple-600 bg-purple-50' : 'border-gray-50 bg-gray-50'
                     }`}
                   >
                      <span className={`text-sm font-black ${betAmount === amt ? 'text-purple-600' : 'text-gray-400'}`}>৳{amt}</span>
                      <span className="text-[8px] font-black text-gray-300 uppercase">Per Ticket</span>
                   </button>
                 ))}
              </div>
           </div>

           <Button 
             disabled={!selectedNum || isProcessing}
             onClick={handleBuy} 
             className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-100"
           >
             {isProcessing ? 'Processing...' : 'Buy Ticket Now'} <Zap className="ml-2 scale-75" />
           </Button>
        </Card>

        {/* Recent Winners */}
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Trophy size={16} className="text-orange-400" /> Recent Winners
           </h3>
           <div className="space-y-4">
              {[
                { name: 'Arifatul J.', win: '500', num: 7 },
                { name: 'Sabbir H.', win: '100', num: 2 },
              ].map((win, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] flex items-center justify-between shadow-sm border border-gray-50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center font-black">
                        {win.num}
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-[#37474F]">{win.name}</h4>
                         <p className="text-[8px] font-bold text-gray-400 uppercase">Lucky Number Win</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-green-500">+৳{win.win}</p>
                      <span className="text-[8px] font-black text-gray-300 uppercase">Payout</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
