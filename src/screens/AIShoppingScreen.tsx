/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Brain, Bot, ShoppingCart, Search, RefreshCcw, Tag } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function AIShoppingScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>(user?.shoppingList || []);

  if (!user) return null;

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis based on user data
    setTimeout(() => {
      const approvedProducts = state.products.filter(p => p.status === 'approved');
      const suggested = approvedProducts.slice(0, 3).map(p => ({
        productId: p.id,
        productName: p.name,
        reason: `Based on your interest in ${p.category} and your budget of ৳${user.budget || 500}.`,
        image: p.image,
        price: p.price
      }));
      setRecommendations(suggested);
      dbService.updateCurrentUser({ shoppingList: suggested });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#37474F] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">AI Life Assistant</h2>
        </div>
        
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
           <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                 <Bot size={32} className="text-white" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-white leading-tight uppercase">Smart Shopping List</h3>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                   I analyze your age, budget, and search history to build your perfect cart.
                 </p>
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isAnalyzing}
                className="mt-2 h-12 px-8 bg-[#FFC107] text-[#37474F] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
              >
                {isAnalyzing ? <RefreshCcw className="animate-spin" /> : 'GENERATE MY LIST'}
              </Button>
           </div>
        </Card>
      </div>

      <div className="p-6 -mt-8 space-y-8 pb-32">
         <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h4 className="font-extrabold text-[#37474F] text-sm uppercase tracking-widest italic border-b-4 border-indigo-500 pb-1">Current Preferences</h4>
               <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] font-black px-3">AUTO-SYNC</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center gap-2">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center leading-none">Target Budget</span>
                  <span className="text-lg font-black text-[#37474F]">৳{user.budget || 500}</span>
               </div>
               <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center gap-2">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center leading-none">Style Insight</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase">Technical • Minimal</span>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h4 className="font-extrabold text-[#37474F] text-sm uppercase tracking-widest italic border-b-4 border-purple-500 pb-1 w-fit">AI Suggested Items</h4>
            
            <div className="space-y-4">
               {isAnalyzing ? (
                 <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Analyzing lifestyle data...</p>
                 </div>
               ) : recommendations.length === 0 ? (
                 <div className="py-12 bg-white rounded-[40px] shadow-sm text-center border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                    <Brain size={48} className="text-gray-100" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed px-12">
                      Tap the magic button above to let AI craft your shopping experience.
                    </p>
                 </div>
               ) : (
                 recommendations.map((rec, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                   >
                     <Card 
                       className="p-5 flex gap-4 border-none shadow-sm rounded-[32px] group cursor-pointer"
                       onClick={() => navigate(`/shop/product/${rec.productId}`)}
                     >
                        <div className="w-24 h-24 bg-gray-50 rounded-[24px] overflow-hidden">
                           <img src={rec.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                           <div className="flex justify-between items-center">
                              <h5 className="font-black text-[#37474F] text-xs uppercase tracking-tight">{rec.productName}</h5>
                              <span className="text-indigo-600 font-black text-xs">৳{rec.price}</span>
                           </div>
                           <p className="text-[9px] font-bold text-gray-400 italic mt-1 leading-relaxed border-l-2 border-indigo-200 pl-2">"{rec.reason}"</p>
                           <button className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#FFC107] mt-2">
                             <ShoppingCart size={10} /> Add to list
                           </button>
                        </div>
                     </Card>
                   </motion.div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
