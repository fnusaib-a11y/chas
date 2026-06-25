/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Briefcase, Plus, Search, Palette, Type, CheckCircle2, Clock, Globe } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { AppState, SkillTask } from '../types';
import { dbService } from '../dbService';

export default function SkillMarketplaceScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'logo' | 'typing' | 'task'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const user = state.currentUser!;

  const tasks = state.skillTasks.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return <Palette size={20} />;
      case 'typing': return <Type size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  const handleClaim = async (task: SkillTask) => {
    if (task.userId === user.id) return alert("You can't claim your own task!");
    await dbService.claimSkillTask(task.id, user.id);
    alert('Task Claimed! Contact the owner to start working.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#37474F] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white"><ArrowLeft size={20} /></button>
          <div className="text-center">
             <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Marketplace</h2>
             <p className="text-[#FFC107] text-[10px] font-black uppercase tracking-widest mt-1">Skill & Earn</p>
          </div>
          <button 
            onClick={() => navigate('/skills/post')} 
            className="px-4 h-12 bg-[#FFC107] rounded-2xl text-[#37474F] flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
             <Plus size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Post</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['all', 'logo', 'typing', 'task'].map((f) => (
              <Badge 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`py-2 px-6 rounded-full border-none cursor-pointer uppercase font-black text-[10px] tracking-widest ${filter === f ? 'bg-[#FFC107] text-[#37474F]' : 'bg-white/10 text-white/50'}`}
              >
                {f}
              </Badge>
            ))}
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-6 pb-32">
        <div className="relative transform hover:scale-[1.01] transition-transform">
          <Input 
            placeholder="Search skills or jobs..." 
            icon={Search} 
            className="border-none shadow-xl bg-white rounded-[24px] h-14" 
            value={searchQuery}
            onChange={(val: string) => setSearchQuery(val)}
          />
        </div>

        <div className="space-y-4">
           {tasks.length === 0 ? (
              <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
                 <Briefcase size={48} className="opacity-10" />
                 No tasks available
              </div>
           ) : (
             tasks.map((task) => (
               <Card key={task.id} className="p-6 rounded-[32px] border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                     <span className="text-lg font-black text-[#FFC107]">৳{task.reward}</span>
                  </div>
                  
                  <div className="flex gap-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${task.type === 'logo' ? 'bg-pink-500' : task.type === 'typing' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                        {getTypeIcon(task.type)}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="text-sm font-black text-[#37474F] uppercase tracking-tight">{task.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">Posted by: {task.userName || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-400 font-bold line-clamp-2 mt-1 italic">{task.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-300">
                              <Clock size={10} /> 2h ago
                           </div>
                           <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-300">
                              <Globe size={10} /> Remote
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                     <Button 
                       onClick={() => handleClaim(task)}
                       disabled={task.status !== 'open'}
                       className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                     >
                       {task.status === 'open' ? 'Apply Now' : 'In Progress'}
                     </Button>
                     <Button variant="secondary" className="h-12 w-12 rounded-2xl flex items-center justify-center p-0">
                        <CheckCircle2 size={20} />
                     </Button>
                  </div>
               </Card>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
