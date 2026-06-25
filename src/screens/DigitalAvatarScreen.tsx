/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, Sparkles, CheckCircle2, ShoppingBag, Wand2 } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function DigitalAvatarScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser;
  
  const [config, setConfig] = useState(user?.avatarConfig || {
    skin: '#FFE0BD',
    hair: 'Short',
    clothing: 'Classic',
    accessory: 'None'
  });

  if (!user) return null;

  const options = {
    skin: ['#FFE0BD', '#E4B58E', '#4B2C20', '#FFCD94'],
    hair: ['Short', 'Long', 'Spiky', 'Bald', 'Curly'],
    clothing: ['Classic', 'Sporty', 'Tech', 'Gamer', 'Royal'],
    accessory: ['None', 'Glasses', 'Headphones', 'Hat', 'Mask']
  };

  const handleSave = async () => {
    await dbService.updateCurrentUser({ avatarConfig: config });
    alert('Avatar updated! Your digital twin is ready.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 pb-32 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex justify-between items-center relative z-10 mb-12">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Digital Avatar</h2>
          <button className="p-3 bg-[#FFC107] rounded-2xl text-[#37474F] shadow-lg"><Sparkles size={20} /></button>
        </div>

        <div className="flex flex-col items-center relative z-10">
           <motion.div 
             key={JSON.stringify(config)}
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full border-4 border-white/20 flex items-center justify-center p-8 shadow-2xl"
           >
              {/* Symbolic Avatar Representation */}
              <div className="relative w-full h-full flex flex-col items-center">
                 <div className="w-20 h-20 rounded-full mb-2" style={{ backgroundColor: config.skin }} />
                 <div className="w-24 h-16 bg-white/20 rounded-[20px] transition-colors" />
                 
                 {config.hair !== 'Bald' && (
                    <div className="absolute top-0 w-20 h-8 bg-[#37474F] rounded-t-full opacity-80" />
                 )}
                 {config.accessory === 'Glasses' && (
                    <div className="absolute top-8 w-16 h-2 border-2 border-white/50 rounded-full" />
                 )}
                 {config.accessory === 'Headphones' && (
                    <div className="absolute top-4 w-24 h-12 border-t-4 border-l-8 border-r-8 border-white/30 rounded-full" />
                 )}
              </div>
           </motion.div>
           <Badge className="mt-8 bg-[#FFC107] text-[#37474F] border-none font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-widest">Lv. {user.level} Virtual Soul</Badge>
        </div>
      </div>

      <div className="p-6 -mt-16 space-y-8 pb-32">
        <Card className="p-8 rounded-[40px] border-none shadow-xl bg-white space-y-8">
           <div className="space-y-6">
              <div>
                 <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Skin Tone</h4>
                 <div className="flex gap-4">
                    {options.skin.map(s => (
                       <button 
                         key={s} 
                         onClick={() => setConfig({...config, skin: s})}
                         className={`w-10 h-10 rounded-full border-2 transition-all ${config.skin === s ? 'border-[#FFC107] scale-110 shadow-lg' : 'border-transparent'}`}
                         style={{ backgroundColor: s }}
                       />
                    ))}
                 </div>
              </div>

              <div>
                 <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Hair Style</h4>
                 <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {options.hair.map(h => (
                       <button 
                         key={h} 
                         onClick={() => setConfig({...config, hair: h})}
                         className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${config.hair === h ? 'border-[#FFC107] bg-white text-[#37474F]' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                       >
                          {h}
                       </button>
                    ))}
                 </div>
              </div>

              <div>
                 <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Accents</h4>
                 <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {options.accessory.map(a => (
                       <button 
                         key={a} 
                         onClick={() => setConfig({...config, accessory: a})}
                         className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${config.accessory === a ? 'border-[#FFC107] bg-white text-[#37474F]' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                       >
                          {a}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           <Button onClick={handleSave} className="w-full h-16 rounded-[24px] text-sm font-black uppercase tracking-widest bg-indigo-600 shadow-xl shadow-indigo-100">
              Update Digital Soul
           </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
           <Card className="p-6 bg-pink-50 border-none rounded-[32px] flex flex-col items-center gap-3">
              <ShoppingBag className="text-pink-500" />
              <span className="text-[9px] font-black uppercase text-pink-600 tracking-widest">Soul Shop</span>
           </Card>
           <Card className="p-6 bg-orange-50 border-none rounded-[32px] flex flex-col items-center gap-3">
              <Wand2 className="text-orange-500" />
              <span className="text-[9px] font-black uppercase text-orange-600 tracking-widest">AI Refine</span>
           </Card>
        </div>
      </div>
    </div>
  );
}
