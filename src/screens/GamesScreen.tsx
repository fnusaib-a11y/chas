/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Zap, TrendingUp, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function GamesScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const handleReveal = async (cardId: string, rewardValue: number) => {
    setRevealingId(cardId);
    try {
      await dbService.revealScratchCard(cardId, user.id, rewardValue);
    } catch (err) {
      console.error(err);
    } finally {
      setRevealingId(null);
    }
  };

  const handleGenerateNew = async () => {
    if (user.balance < 5) {
      alert('You need at least ৳5 to buy a scratch card!');
      return;
    }
    await dbService.generateScratchCard(user.id);
    await dbService.updateCurrentUser({ balance: user.balance - 5 }); // Cost 5 BDT
    alert('Purchased a new Scratch Card for ৳5!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <div className="bg-gradient-to-br from-[#FF9800] to-[#FF5722] p-6 pb-20 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => navigate(-1)} className="p-3 bg-white/10 text-white rounded-2xl backdrop-blur-md">
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-xl font-black text-white uppercase tracking-tight">Mystery Games</h1>
        </div>

        <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/20">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-60">Your Tickets</span>
              <div className="text-4xl font-black text-white">
                {state.scratchCards?.filter(c => !c.isRevealed).length || 0}
              </div>
           </div>
           <Button onClick={handleGenerateNew} className="bg-white text-[#FF5722] hover:bg-white/90 h-14 px-8 rounded-2xl shadow-xl">
             <Gift className="mr-2" /> Buy New (৳5)
           </Button>
        </div>
      </div>

      <div className="p-6 -mt-10 space-y-8 pb-32">
        <div className="space-y-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400 underline decoration-orange-200" /> Available Scratch Cards
           </h3>

           <div className="grid grid-cols-2 gap-4">
              {state.scratchCards && state.scratchCards.filter(c => !c.isRevealed).length > 0 ? (
                state.scratchCards.filter(c => !c.isRevealed).map((card) => (
                  <button 
                    key={card.id}
                    onClick={() => !revealingId && handleReveal(card.id, card.reward)}
                    className="relative group aspect-square"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-[32px] shadow-md border-4 border-white flex flex-col items-center justify-center p-4 transition-transform active:scale-95 group-hover:shadow-lg">
                       <Zap size={32} className="text-gray-400 mb-2 opacity-50" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scratch Here!</span>
                       {revealingId === card.id && (
                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[32px] flex items-center justify-center">
                           <Loader2 size={24} className="animate-spin text-orange-500" />
                         </div>
                       )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                   <Gift size={48} className="text-gray-100" />
                   <p className="text-xs font-black text-gray-300 uppercase tracking-widest max-w-[150px]">You don't have any mystery cards left</p>
                </div>
              )}
           </div>
        </div>

        {/* Recently Won */}
        <div className="space-y-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recently Revealed</h3>
           <div className="space-y-2">
              {state.scratchCards?.filter(c => c.isRevealed).slice(0, 3).map((card) => (
                <Card key={card.id} className="p-4 flex items-center justify-between border-none shadow-sm opacity-60">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} />
                      </div>
                      <span className="text-[10px] font-black text-[#37474F] uppercase tracking-widest">Won from Scratch Card</span>
                   </div>
                   <span className="text-xs font-black text-green-500">+ ৳{card.reward}</span>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
