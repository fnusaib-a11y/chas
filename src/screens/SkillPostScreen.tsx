/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Type, Palette, Save, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function SkillPostScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [type, setType] = useState<'logo' | 'typing' | 'task'>('task');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title || !description || !reward) return alert('Please fill all fields');
    setLoading(true);
    try {
      if (user.balance < 5) {
        alert('Posting a job costs 5 BDT. Your balance is too low.');
        return;
      }

      await dbService.submitSkillTask({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '',
        title,
        description,
        reward: Number(reward),
        status: 'open',
        type,
        createdAt: new Date().toISOString()
      });

      // Deduct 5 BDT for posting
      await dbService.updateUserBalance(user.id, -5);

      alert('Skill task posted successfully!');
      navigate('/skills');
    } catch (err) {
      console.error(err);
      alert('Failed to post. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#37474F] p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Post Skill Job</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        <Card className="p-6 space-y-6 border-none shadow-xl rounded-[32px]">
           <div className="flex items-center gap-2 text-[#FFC107]">
              <AlertCircle size={16} />
              <p className="text-[10px] font-black uppercase tracking-wider">Job posting costs 5 BDT</p>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Job Type</label>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { id: 'logo', icon: Palette, label: 'Logo' },
                   { id: 'typing', icon: Type, label: 'Typing' },
                   { id: 'task', icon: Briefcase, label: 'Other' },
                 ].map((t) => (
                   <button
                     key={t.id}
                     onClick={() => setType(t.id as any)}
                     className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                       type === t.id ? 'border-[#FFC107] bg-[#FFC107]/5 text-[#37474F]' : 'border-gray-50 bg-gray-50 text-gray-400'
                     }`}
                   >
                      <t.icon size={20} />
                      <span className="text-[10px] font-black uppercase">{t.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <Input 
             label="Job Title" 
             placeholder="e.g. Need a minimal logo for e-commerce" 
             value={title}
             onChange={setTitle}
           />

           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
             <textarea
               placeholder="Describe exactly what you need..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:border-[#FFC107] outline-none h-32 transition-all resize-none"
             />
           </div>

           <Input 
             label="Reward Price (BDT)" 
             placeholder="e.g. 50" 
             value={reward}
             onChange={setReward}
             type="number"
             icon={Save}
           />

           <Button 
             onClick={handlePost} 
             isLoading={loading}
             className="w-full h-16 rounded-[24px] shadow-xl shadow-[#FFC107]/20"
           >
             Publish Job Request
           </Button>
        </Card>
      </div>
    </div>
  );
}
