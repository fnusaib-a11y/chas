/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trees as Tree, Home, Cloud, Sun, Waves, Zap, Trophy, TrendingUp, ArrowLeft, Gem, Sparkles, Building2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState, UserVirtualAsset } from '../types';
import { dbService } from '../dbService';

export default function VirtualIslandScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const asset = state.virtualAssets?.find(a => a.userId === user.id) || {
    level: 1,
    exp: 0,
    type: 'island',
    lastGrowthAt: new Date().toISOString()
  } as UserVirtualAsset;

  const nextLevelExp = asset.level * 100;
  const progress = (asset.exp / nextLevelExp) * 100;

  return (
    <div className="min-h-screen bg-sky-400 relative overflow-hidden flex flex-col">
      {/* Background World */}
      <div className="absolute inset-0 z-0">
         <Waves className="absolute bottom-0 w-full h-60 text-sky-600 opacity-20 animate-pulse" />
         <div className="absolute top-20 right-20 text-yellow-300 animate-pulse">
            <Sun size={80} fill="currentColor" />
         </div>
         <motion.div 
           animate={{ x: [-200, window.innerWidth + 200] }}
           transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
           className="absolute top-40 text-white/50"
         >
            <Cloud size={100} fill="currentColor" />
         </motion.div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center text-white">
         <button onClick={() => navigate(-1)} className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <ArrowLeft size={24} />
         </button>
         <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-3">
            <Gem size={20} className="text-[#FFC107]" />
            <span className="text-sm font-black uppercase tracking-widest">{user.balance.toFixed(0)} Earning Points</span>
         </div>
      </div>

      {/* Island / Building View */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 space-y-12">
         <motion.div 
           initial={{ scale: 0.5, y: 100 }}
           animate={{ scale: 1, y: 0 }}
           className="relative w-80 h-40"
         >
            {/* The Island Base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500 rounded-[100%] shadow-[0_20px_0_0_#059669] border-t-8 border-emerald-400" />
            
            {/* Growth Visuals based on Level */}
            <AnimatePresence>
              {Array.from({ length: Math.min(10, asset.level) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute"
                  style={{ 
                    left: `${20 + (i * 12)}%`, 
                    bottom: `${20 + (Math.sin(i) * 10)}%`,
                    zIndex: 20
                  }}
                >
                   {asset.level > 5 && i % 3 === 0 ? (
                      <Building2 className="text-white drop-shadow-xl" size={24 + (i * 2)} />
                   ) : (
                      <Tree className="text-emerald-800 drop-shadow-lg" size={20 + (i * 4)} />
                   )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Main Center Asset */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, type: 'tween' }}
               className="absolute left-1/2 -translate-x-1/2 bottom-12 z-30"
            >
               <div className="relative">
                  <Home className="text-white drop-shadow-2xl" size={80 + (asset.level * 2)} />
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FFC107] rounded-full shadow-2xl flex items-center justify-center text-[#37474F] font-black border-4 border-white">
                     {asset.level}
                  </div>
               </div>
            </motion.div>

            {/* Floaties */}
            <Sparkles className="absolute top-0 right-0 text-white/50 animate-pulse" size={24} />
            <Sparkles className="absolute top-10 left-10 text-white/50 animate-pulse delay-500" size={16} />
         </motion.div>

         {/* Level Info Card */}
         <div className="w-full max-w-sm space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Current Status</p>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {asset.level < 5 ? 'Private Island' : asset.level < 15 ? 'Small Colony' : 'Mega City'}
                     </h3>
                  </div>
                  <div className="text-right">
                     <span className="text-xs font-black text-white uppercase">{asset.exp} / {nextLevelExp} EXP</span>
                  </div>
               </div>
               
               <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden border-2 border-white/20 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#FFC107] to-orange-500 rounded-full shadow-lg"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Card className="p-6 bg-white/10 backdrop-blur-3xl border-none space-y-2">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                     <TrendingUp size={20} />
                  </div>
                  <p className="text-[10px] font-black text-white/50 uppercase">Daily Growth</p>
                  <p className="text-sm font-black text-white">+12% Energy</p>
               </Card>
               <Card className="p-6 bg-white/10 backdrop-blur-3xl border-none space-y-2">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                     <Trophy size={20} />
                  </div>
                  <p className="text-[10px] font-black text-white/50 uppercase">Ranking</p>
                  <p className="text-sm font-black text-white">#142 World</p>
               </Card>
            </div>

            <Card className="p-8 bg-[#37474F] rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC107]/10 rounded-full blur-3xl -mr-12 -mt-12" />
               <div className="flex items-center gap-4 mb-4">
                  <Zap size={24} className="text-[#FFC107] animate-bounce" />
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">How to grow?</h4>
               </div>
               <p className="text-xs font-medium text-white/60 leading-relaxed uppercase">
                 Every ৳100 you earn automatically adds 10 EXP to your Island. At Level 10, unlock the "Mega Tower" and daily coin rewards!
               </p>
               <Button onClick={() => navigate('/tasks')} className="w-full h-14 bg-white text-[#37474F] rounded-2xl font-black uppercase tracking-[0.2em] mt-6">
                  Earn More EXP
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
