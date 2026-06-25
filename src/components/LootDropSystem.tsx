/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Zap, Timer, Package, X } from 'lucide-react';
import { AppState, LootDrop } from '../types';
import { dbService } from '../dbService';

export default function LootDropSystem({ state }: { state: AppState }) {
  const activeDrop = state.lootDrops?.find(d => !d.claimedBy);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (activeDrop) {
      setShow(true);
      // Auto-hide after some time if not claimed
    }
  }, [activeDrop]);

  if (!activeDrop || !show) return null;

  const handleClaim = async () => {
    try {
      await dbService.claimLootDrop(activeDrop.id, state.currentUser!.id, activeDrop.value);
      alert(`CONGRATS! You claimed a ৳${activeDrop.value} ${activeDrop.type}!`);
      setShow(false);
    } catch (err: any) {
      alert('Too slow! Someone else claimed it.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="w-full max-w-sm bg-gradient-to-br from-[#37474F] to-black p-8 rounded-[48px] shadow-[0_0_100px_rgba(255,193,7,0.3)] pointer-events-auto relative overflow-hidden"
        >
           {/* Animated Background */}
           <div className="absolute top-0 left-0 w-full h-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    y: [-20, 400],
                    x: Math.random() * 300,
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                  className="absolute text-[#FFC107] opacity-20"
                >
                   <Sparkles size={12} />
                </motion.div>
              ))}
           </div>

           <button onClick={() => setShow(false)} className="absolute top-6 right-6 text-white/20 hover:text-white">
              <X size={20} />
           </button>

           <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                   transition={{ duration: 2, repeat: Infinity, type: 'tween' }}
                   className="w-24 h-24 bg-gradient-to-br from-[#FFC107] to-orange-500 rounded-[32px] flex items-center justify-center text-[#37474F] shadow-2xl shadow-orange-500/20"
                 >
                    <Gift size={48} />
                 </motion.div>
                 <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full animate-bounce">
                    Limited
                 </div>
              </div>

              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mystery Loot Drop!</h2>
                 <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                   Be the fastest to claim. Only 1 person can get it!
                 </p>
              </div>

              <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
                 <div className="text-left">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Potential Value</p>
                    <p className="text-xl font-black text-[#FFC107]">UP TO ৳{activeDrop.value}</p>
                 </div>
                 <div className="flex items-center gap-2 text-white/50">
                    <Timer size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase">Expiring</span>
                 </div>
              </div>

              <button 
                onClick={handleClaim}
                className="w-full h-16 bg-white text-[#37474F] rounded-[24px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl"
              >
                Claim Now
              </button>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
