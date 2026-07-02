/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Share2, Award, Trophy, Bell, Copy, CheckCircle2, TrendingUp, Users, User as UserIcon, Zap, MessageSquare, ChevronRight, Crown } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState, UserLevel, User } from '../types';
import { dbService } from '../dbService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const levelInfo = {
  [UserLevel.BEGINNER]: { name: 'Beginner', color: '#B0BEC5' },
  [UserLevel.REGULAR]: { name: 'Regular', color: '#4CAF50' },
  [UserLevel.ACTIVE]: { name: 'Active', color: '#2196F3' },
  [UserLevel.EXPERT]: { name: 'Expert', color: '#9C27B0' },
  [UserLevel.MASTER]: { name: 'Master', color: '#F44336' },
};

const Referral = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'team'>('team'); // Default to team list so they see the list is there!
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list'); // Default to list mode which is cleaner and shows stats directly
  const [newGroupName, setNewGroupName] = useState(user.groupName || '');
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [subMembers, setSubMembers] = useState<User[]>([]);
  const [memberLevel, setMemberLevel] = useState<1 | 2>(1);

  const copyRef = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateGroup = async () => {
    if (newGroupName.trim().length < 3) return;
    await dbService.updateCurrentUser({ groupName: newGroupName });
    setIsEditingGroup(false);
  };

  const team = state.users.filter(u => u.referredBy === user.id); // Direct referrals (Tier 1)

  // Referral Milestones calculation
  const teamSize = team.length;
  const milestones = [
    { name: 'Bronze Team', target: 5, reward: 25 },
    { name: 'Silver Team', target: 15, reward: 100 },
    { name: 'Gold Team', target: 30, reward: 250 },
    { name: 'Diamond Team', target: 50, reward: 500 },
  ];
  const nextMilestone = milestones.find(m => teamSize < m.target) || { name: 'Ultimate Recruiter', target: 100, reward: 1000 };
  const currentMilestoneIndex = milestones.findIndex(m => teamSize < m.target);
  const prevTarget = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex - 1].target : 0;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((teamSize - prevTarget) / (nextMilestone.target - prevTarget)) * 100)
  );
  const invitesNeeded = Math.max(0, nextMilestone.target - teamSize);

  // Level 2 Sub-referrals real-time subscription
  useEffect(() => {
    if (team.length === 0) return;

    const unsubs: (() => void)[] = [];
    const directUserIds = team.map(member => member.id);

    directUserIds.forEach((memberId) => {
      const q = query(collection(db, 'users'), where('referredBy', '==', memberId));
      const unsub = onSnapshot(q, (snap) => {
        const level2Users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
        setSubMembers(prev => {
          const filtered = prev.filter(u => u.referredBy !== memberId);
          return [...filtered, ...level2Users];
        });
      }, (err) => {
        console.warn('Level 2 referrals subscribe failed for', memberId, err);
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [team.map(t => t.id).join(',')]);

  const teamTasks = team.reduce((acc, m) => acc + m.totalTasksCompleted, 0);
  const subTasks = subMembers.reduce((acc, m) => acc + (m.totalTasksCompleted || 0), 0);
  
  // Commission model: 20% on tier 1, 10% on tier 2
  const teamEarnings = (teamTasks * 0.2 + subTasks * 0.1).toFixed(2);


  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#FFC107] p-8 pb-16 rounded-b-[40px] shadow-lg text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-xl" />
         
         <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-[#FFC107] mx-auto mb-6 shadow-2xl relative border-4 border-white transform hover:rotate-6 transition-transform">
            <Share2 size={48} />
         </div>
         <div className="space-y-1">
            {isEditingGroup ? (
              <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                <input 
                  type="text" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-white/20 border-none rounded-lg px-3 py-1 text-sm font-black text-[#37474F] placeholder-[#37474F]/50 focus:ring-2 ring-white w-full uppercase"
                />
                <button onClick={handleUpdateGroup} className="bg-[#37474F] text-white p-1 rounded-md"><CheckCircle2 size={16} /></button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingGroup(true)}
                className="text-3xl font-black text-[#37474F] tracking-tight flex items-center justify-center gap-2 w-full font-sans"
              >
                {user.groupName || 'My Team'}
                <TrendingUp size={16} className="text-[#37474F]/40" />
              </button>
            )}
            <p className="text-[#37474F]/70 text-[10px] font-black uppercase tracking-[0.2em] font-sans">Refer & Earn ৳5 bonus</p>
         </div>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100">
           <button 
             onClick={() => setActiveTab('invite')}
             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all font-sans ${activeTab === 'invite' ? 'bg-[#FFC107] text-[#37474F] shadow-md' : 'text-gray-400'}`}
           >
             আমন্ত্রণ (Invite)
           </button>
           <button 
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all font-sans ${activeTab === 'team' ? 'bg-[#FFC107] text-[#37474F] shadow-md' : 'text-gray-400'}`}
           >
             রেফার তালিকা (Refer List) ({team.length})
           </button>
        </div>

        {activeTab === 'invite' ? (
          <div className="space-y-8 pb-20">
            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 bg-white border-none shadow-sm space-y-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase font-sans">Team Size</span>
                  <div className="text-xl font-black text-[#37474F] font-sans">{team.length}</div>
               </Card>
               <Card className="p-4 bg-white border-none shadow-sm space-y-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase font-sans">Est. Bonus</span>
                  <div className="text-xl font-black text-green-500 font-sans">৳{teamEarnings}</div>
               </Card>
            </div>
            <Card className="p-10 border-4 border-dashed border-[#FFC107]/30 bg-white space-y-6 text-center rounded-[40px] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-sans">Your Referral Code</span>
                  <div className="text-4xl font-black text-[#37474F] tracking-widest group-hover:scale-105 transition-transform font-sans">{user.referralCode}</div>
               </div>
               <Button onClick={copyRef} className={`w-full h-16 rounded-[24px] font-sans ${copied ? 'bg-green-500 text-white' : ''}`} variant={copied ? 'primary' : 'secondary'}>
                  {copied ? <CheckCircle2 className="inline mr-2" /> : <Copy className="inline mr-2" />}
                  {copied ? 'Copied to Clipboard' : 'Copy referral link'}
               </Button>
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC107]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#FFC107]/10 transition-colors" />
            </Card>

            <Card className="p-6 bg-white border border-gray-50 shadow-sm space-y-4 rounded-[32px] text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-[#37474F] uppercase tracking-wider font-sans">Next Milestone Progress</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-sans mt-0.5">{nextMilestone.name}</p>
                </div>
                <div className="bg-[#FFC107]/15 text-[#37474F] font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-sans border border-[#FFC107]/30">
                  {teamSize} / {nextMilestone.target} Invites
                </div>
              </div>

              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-[#FFC107] h-full rounded-full shadow-inner relative"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 font-sans">
                <span>{prevTarget} Invites</span>
                <span>{nextMilestone.target} Invites</span>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed font-sans border-t border-gray-100/60 pt-2.5">
                {invitesNeeded > 0 ? (
                  <>You need <span className="text-[#37474F] font-black">{invitesNeeded} more invite{invitesNeeded > 1 ? 's' : ''}</span> to achieve <span className="text-[#37474F] font-black">{nextMilestone.name}</span> status and unlock a <span className="text-green-500 font-black">৳{nextMilestone.reward}</span> cash reward!</>
                ) : (
                  <>Congratulations! You have achieved all referral levels. You are an elite member of our community!</>
                )}
              </p>
            </Card>

            <div className="space-y-4">
               <h4 className="font-black text-[#37474F] text-sm uppercase tracking-tight font-sans">Team Commission</h4>
               <div className="space-y-3">
                  {[
                     { icon: UserIcon, label: 'Direct Signup', reward: '৳5.00', desc: 'Added instantly to balance' },
                     { icon: TrendingUp, label: 'Team Activity', reward: '20% extra', desc: 'Bonus from team tasks' },
                     { icon: Users, label: 'Group Bonus', reward: '৳100', desc: 'Reach 50 active members' },
                  ].map((r, i) => (
                     <Card key={i} className="flex items-center justify-between p-4 bg-white border-none shadow-sm hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-[#FFC107]/10 rounded-xl flex items-center justify-center text-[#FFC107]"><r.icon size={20} /></div>
                           <div>
                              <h5 className="text-[10px] font-black text-[#37474F] uppercase font-sans">{r.label}</h5>
                              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider font-sans">{r.desc}</p>
                           </div>
                        </div>
                        <span className="text-sm font-black text-green-500 uppercase shrink-0 font-sans">{r.reward}</span>
                     </Card>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-32">
             {/* View Toggle Menu */}
             <div className="flex p-1 bg-gray-100 rounded-xl mb-4 overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-1.5 px-3 text-[9px] font-black uppercase rounded-lg transition-all whitespace-nowrap font-sans ${viewMode === 'list' ? 'bg-white text-[#37474F] shadow-sm' : 'text-gray-400'}`}
                >
                  সরাসরি তালিকা (List View)
                </button>
                <button 
                  onClick={() => setViewMode('tree')}
                  className={`flex-1 py-1.5 px-3 text-[9px] font-black uppercase rounded-lg transition-all whitespace-nowrap font-sans ${viewMode === 'tree' ? 'bg-white text-[#37474F] shadow-sm' : 'text-gray-400'}`}
                >
                  নেটওয়ার্ক ট্রি (Tree View)
                </button>
             </div>

             {team.length === 0 ? (
                <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center">
                       <Users size={48} className="opacity-10" />
                    </div>
                    আপনার রেফার কোড ব্যবহার করে কেউ জয়েন করেনি
                </div>
             ) : (
                <div>
                   {viewMode === 'tree' ? (
                      <div className="space-y-4">
                         {/* LEVEL 1: Current User */}
                         <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-sm text-center relative overflow-hidden flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-[#FFC107] text-[#37474F] rounded-2xl flex items-center justify-center font-extrabold relative shadow-md">
                               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
                               <div className="absolute -top-1.5 -right-1.5 bg-[#37474F] text-[#FFC107] text-[7px] font-black px-1 py-0.5 rounded-full border border-white font-sans">YOU</div>
                            </div>
                            <span className="text-[10px] font-black text-slate-800 uppercase mt-2 font-sans">{user.name}</span>
                            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 font-sans">Self</span>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFC107]/5 rounded-full blur-2xl" />
                         </div>

                         {/* Connecting Line Downward */}
                         <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

                         {/* LEVEL 2: Direct Referrals */}
                         <div className="space-y-3">
                            {team.map((member) => {
                               // Tier 2: Referrals by current members
                               const childrenRef = subMembers.filter(u => u.referredBy === member.id);
                               
                               return (
                                  <div key={member.id} className="bg-slate-50 p-3 rounded-[28px] border border-gray-200 shadow-inner flex flex-col gap-3">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                           <div className="w-8 h-8 bg-[#FFC107]/20 text-[#FFC107] rounded-xl flex items-center justify-center text-[10px] font-black border border-white shrink-0">
                                              {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name[0]}
                                           </div>
                                           <div className="text-left">
                                              <span className="text-[10px] font-black text-[#37474F] uppercase block font-sans leading-tight">{member.name}</span>
                                              <span className="text-[7px] text-gray-400 font-extrabold uppercase font-sans tracking-wide">{member.phone || 'No Phone'}</span>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                           <span className="text-[9px] font-black text-green-500 font-sans tracking-tight">৳{(member.totalTasksCompleted * 0.2).toFixed(1)}</span>
                                           <button 
                                             onClick={() => navigate(`/chat/${member.id}`)}
                                             className="w-7 h-7 bg-white rounded-lg text-gray-400 flex items-center justify-center hover:bg-[#FFC107]/10 hover:text-[#FFC107] border border-gray-100 transition-all shrink-0"
                                           >
                                              <MessageSquare size={12} />
                                           </button>
                                        </div>
                                     </div>

                                     {/* Details summary */}
                                     <div className="bg-white/60 p-2 rounded-xl text-[8px] font-bold text-gray-500 uppercase flex justify-between">
                                        <span>কাজ সম্পন্ন: {member.totalTasksCompleted} টি</span>
                                        <span>ব্যালেন্স: ৳{(member.balance || 0).toFixed(0)}</span>
                                     </div>

                                     {/* Connected Sub-Tree (Tier 2/3) */}
                                     {childrenRef.length > 0 && (
                                        <div className="pl-4 border-l-2 border-dashed border-slate-300 space-y-2 mt-1">
                                           <div className="text-[7px] text-gray-400 font-black uppercase tracking-widest text-left mb-1.5 flex items-center gap-1 font-sans">
                                              <Users size={8} /> Sub-referrals ({childrenRef.length})
                                           </div>
                                           <div className="grid grid-cols-2 gap-1.5">
                                              {childrenRef.map(child => (
                                                 <div key={child.id} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col text-left gap-1 transition-all">
                                                    <div className="flex items-center gap-1.5 min-w-0 justify-between">
                                                       <div className="flex items-center gap-1 min-w-0">
                                                          <div className="w-4 h-4 bg-[#FFC107]/10 text-[#FFC107] rounded flex items-center justify-center text-[6px] font-black shrink-0">
                                                             {child.name[0]}
                                                          </div>
                                                          <span className="text-[8px] font-black text-slate-700 uppercase truncate max-w-[55px] font-sans">{child.name}</span>
                                                       </div>
                                                       <span className="text-[7px] text-[#FFC107] font-extrabold shrink-0 font-sans">+10%</span>
                                                    </div>
                                                    <div className="text-[6px] text-gray-400 flex justify-between border-t border-gray-50 pt-1 mt-0.5">
                                                       <span>ব্যালেন্স: ৳{(child.balance || 0).toFixed(0)}</span>
                                                       <span>কাজ: {child.totalTasksCompleted}</span>
                                                    </div>
                                                 </div>
                                              ))}
                                           </div>
                                        </div>
                                     )}
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-3">
                          {/* Level segmented controller */}
                          <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl mb-4">
                             <button
                               onClick={() => setMemberLevel(1)}
                               className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${memberLevel === 1 ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400'}`}
                             >
                               লেভেল ১ মেম্বার্স ({team.length})
                             </button>
                             <button
                               onClick={() => setMemberLevel(2)}
                               className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${memberLevel === 2 ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400'}`}
                             >
                               লেভেল ২ মেম্বার্স ({subMembers.length})
                             </button>
                          </div>

                          {(memberLevel === 1 ? team : subMembers).length === 0 ? (
                             <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
                                <Users size={48} className="opacity-10" />
                                এই লেভেলে কোনো মেম্বার জয়েন করেনি
                             </div>
                          ) : (
                             (memberLevel === 1 ? team : subMembers).map((member) => (
                            <Card key={member.id} className="p-4 bg-white hover:shadow-md transition-all group border border-gray-50 rounded-3xl flex flex-col gap-3">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="relative">
                                       <div className="w-12 h-12 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden">
                                          {member.avatar ? (
                                             <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                          ) : (
                                             <span className="text-lg font-black text-[#FFC107]">{member.name[0]}</span>
                                          )}
                                       </div>
                                       <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FFC107] rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                          <Crown size={10} className="text-white" />
                                       </div>
                                     </div>
                                     <div>
                                        <h5 className="text-[12px] font-black text-[#37474F] uppercase flex items-center gap-1 font-sans">
                                          {member.name}
                                        </h5>
                                        <p className="text-[9px] text-[#FFC107] font-extrabold tracking-wider mt-0.5 font-sans leading-none">
                                           {member.phone || 'No Phone Number'}
                                        </p>
                                     </div>
                                  </div>
                                  
                                  {/* Chat with direct referral button */}
                                  <button 
                                    onClick={() => navigate(`/chat/${member.id}`)}
                                    className="w-10 h-10 bg-[#FFC107]/10 hover:bg-[#FFC107] text-[#FFC107] hover:text-[#37474F] rounded-2xl flex items-center justify-center transition-all"
                                    title="মেসেজ পাঠান"
                                  >
                                     <MessageSquare size={16} />
                                  </button>
                               </div>

                               {/* Referred user detailed statistics - answering prompt perfectly */}
                               <div className="bg-gray-50/75 p-3.5 rounded-2xl grid grid-cols-3 gap-2 border border-gray-100 text-center">
                                  <div>
                                     <p className="text-[7.5px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">মোট কাজ (Tasks)</p>
                                     <p className="text-xs font-black text-blue-500 font-sans">{member.totalTasksCompleted || 0} টি</p>
                                  </div>
                                  <div className="border-x border-gray-100 px-1">
                                     <p className="text-[7.5px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">তাদের ইনকাম</p>
                                     <p className="text-xs font-black text-slate-700 font-sans">৳{(member.balance || 0).toLocaleString([], { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                  </div>
                                  <div>
                                     <p className="text-[7.5px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">আপনার কমিশন ({memberLevel === 1 ? '২০%' : '১০%'})</p>
                                     <p className="text-xs font-black text-green-500 font-sans">৳{(member.totalTasksCompleted * (memberLevel === 1 ? 0.2 : 0.1)).toLocaleString([], { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                  </div>
                               </div>

                               <div className="flex justify-between items-center px-1 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                                  <span>লেভেল {member.level || 1} মেম্বার ({memberLevel === 1 ? 'Tier 1' : 'Tier 2'})</span>
                                  <span>যোগদানের তারিখ: {member.createdAt ? new Date(member.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : 'অজানা'}</span>
                               </div>
                            </Card>
                         ))
                        )}
                      </div>
                   )}
                   
                   <Card className="p-6 bg-gradient-to-br from-[#FFC107] to-[#FFA000] text-[#37474F] space-y-4 rounded-[32px] shadow-xl border-none mt-6">
                      <div className="flex items-center gap-3">
                         <Trophy size={20} />
                         <h4 className="text-[10px] font-black uppercase tracking-widest font-sans">Group Leader Dashboard</h4>
                      </div>
                      <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider opacity-80 font-sans">
                         Rank your group in the "World Ranking" by encouraging members to finish at least 10 tasks daily.
                      </p>
                      <Button 
                        onClick={() => {
                          const targetGroupId = user.referredBy || (team.length > 0 ? user.id : user.id);
                          navigate(`/chat/group/${targetGroupId}`);
                        }}
                        className="w-full h-11 text-[9px] bg-[#37474F] text-white font-black uppercase rounded-2xl shadow-lg border-none font-sans"
                      >
                        Open Team Chat
                      </Button>
                   </Card>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const Leaderboard = ({ state }: { state: AppState }) => {
   const user = state.currentUser!;
   const topUsers = state.topUsers.length > 0 ? state.topUsers : [
      { name: 'Sajid Ahmed', totalTasksCompleted: 450, level: 5, balance: 4500 },
      { name: 'Tanvir Rahman', totalTasksCompleted: 380, level: 4, balance: 3800 },
      { name: 'Afreen Jahan', totalTasksCompleted: 290, level: 3, balance: 2900 }
   ];

   const getLevelBadge = (level: UserLevel) => levelInfo[level];

   return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
         <div className="bg-[#37474F] p-8 pb-16 rounded-b-[40px] shadow-2xl relative text-center">
            <div className="flex justify-between items-center mb-10">
               <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><ChevronRight className="rotate-180" /></button>
               <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] font-sans">World Ranking</h2>
               <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><Trophy size={20} /></button>
            </div>

            <div className="flex justify-center items-end gap-2 pb-6">
               {/* 2nd Place */}
               <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white/10 rounded-[24px] border-2 border-gray-400/30 flex items-center justify-center text-gray-300 text-xl font-black relative overflow-hidden font-sans">
                     {topUsers[1]?.name[0] || '2'}
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase font-sans">{topUsers[1]?.name.split(' ')[0] || 'TBD'}</span>
                  <div className="w-12 h-16 bg-gradient-to-t from-gray-400/20 to-transparent rounded-t-xl flex flex-col items-center p-2">
                     <span className="text-[10px] font-black text-gray-400 font-sans">2ND</span>
                  </div>
               </div>

               {/* 1st Place */}
               <div className="flex flex-col items-center gap-3 scale-110 -translate-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-[32px] border-4 border-[#FFC107] flex items-center justify-center text-[#37474F] text-3xl font-black shadow-2xl overflow-hidden font-sans">
                       {topUsers[0]?.name[0] || '1'}
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                       <Crown size={18} className="text-[#37474F]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider font-sans">{topUsers[0]?.name.split(' ')[0] || 'TBD'}</span>
                  <div className="w-16 h-20 bg-[#FFC107] rounded-t-2xl flex flex-col items-center p-2 shadow-xl">
                     <span className="text-xs font-black text-[#37474F] font-sans">1ST</span>
                  </div>
               </div>

               {/* 3rd Place */}
               <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-white/10 rounded-[20px] border-2 border-orange-400/30 flex items-center justify-center text-orange-400 text-xl font-black relative overflow-hidden font-sans">
                     {topUsers[2]?.name[0] || '3'}
                  </div>
                  <span className="text-[8px] font-black text-orange-400 uppercase font-sans">{topUsers[2]?.name.split(' ')[0] || 'TBD'}</span>
                  <div className="w-10 h-12 bg-gradient-to-t from-orange-400/20 to-transparent rounded-t-lg flex flex-col items-center p-2">
                     <span className="text-[10px] font-black text-orange-400 font-sans">3RD</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="px-6 -mt-10 space-y-4 pb-24 relative z-10">
            <Card className="p-6 bg-white rounded-[32px] shadow-xl space-y-4 border border-gray-50">
               <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Rank</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Efficiency</span>
               </div>
               
               <div className="space-y-2">
                  {topUsers.map((u: any, i) => {
                      const isSelf = u.id === user.id;
                      const badge = getLevelBadge(u.level as UserLevel);
                      
                      const displayName = isSelf || user.isAdmin 
                        ? (u.name || 'Operative') 
                        : (u.name || 'Operative').split(' ').map((n, i) => i === 0 ? n[0] + '***' : n).join(' ');

                      return (
                         <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isSelf ? 'bg-orange-50 border border-[#FFC107]/20' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-sans ${
                               i < 3 ? 'bg-transparent text-[#37474F]' : 'bg-gray-50 text-gray-400'
                            } text-xs`}>
                               {i + 1}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 font-sans">
                                     {(u.avatar && (isSelf || user.isAdmin)) ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">{(u.name || 'U')[0]}</div>}
                                  </div>
                                  <div>
                                     <h5 className="text-[11px] font-black text-[#37474F] uppercase font-sans">{displayName}</h5>
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge?.color }} />
                                        <p className="text-[8px] text-gray-400 font-bold uppercase font-sans">{badge?.name}</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className="text-sm font-black text-[#37474F] font-sans">{u.totalTasksCompleted}</span>
                                  <p className="text-[7px] text-gray-400 font-bold uppercase font-sans">Tasks</p>
                                </div>
                            </div>
                         </div>
                      );
                  })}
               </div>
            </Card>

            {/* Current user sticky rank info */}
            <div className="fixed bottom-24 inset-x-6">
                <div className="bg-[#37474F] text-white p-4 rounded-[24px] shadow-2xl border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FFC107] text-[#37474F] rounded-xl flex items-center justify-center font-black font-sans">
                         # {topUsers.findIndex(u => u.id === user.id) + 1 || '?'}
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] font-sans">Your Performance</h4>
                         <p className="text-xs font-bold font-sans">{user.totalTasksCompleted} TASKS TOTAL</p>
                      </div>
                   </div>
                   <Button variant="outline" className="h-10 text-[8px] border-white/20 text-white hover:bg-white/10 font-sans" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      Up Next
                   </Button>
                </div>
            </div>
         </div>
      </div>
   );
};

const RankProgress = ({ state }: { state: AppState }) => {
   const user = state.currentUser!;
   const levels = [
      { id: 1, name: 'Beginner', reward: '৳0.50/Task', req: 'Starting' },
      { id: 2, name: 'Regular', reward: '৳1.00/Task', req: '50 Tasks' },
      { id: 3, name: 'Active', reward: '৳2.00/Task', req: '150 Tasks + 5 Refs' },
      { id: 4, name: 'Expert', reward: '৳3.00/Task', req: '400 Tasks + 15 Refs' },
      { id: 5, name: 'Master', reward: '৳5.00/Task', req: '1000 Tasks + 50 Refs' },
   ];

   return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <div className="bg-[#37474F] p-10 pb-20 rounded-b-[40px] shadow-2xl relative text-center">
          <div className="w-32 h-32 bg-[#FFC107] rounded-[40px] flex items-center justify-center shadow-2xl mx-auto mb-6 transform -rotate-12 outline outline-offset-8 outline-white/10 transition-transform hover:rotate-0">
             <Trophy size={64} className="text-[#37474F] rotate-12" />
          </div>
          <h2 className="text-3xl font-black text-white font-sans">Rank Path</h2>
          <p className="text-[#FFC107] text-[10px] font-black uppercase tracking-[0.3em] mt-2 font-sans">Level {user.level} • {user.level === 5 ? 'Elite Master' : 'Path to Mastery'}</p>
        </div>

        <div className="p-6 -mt-10 space-y-4 pb-24 relative z-10">
           {levels.map((l) => (
              <Card key={l.id} className={`p-6 rounded-[32px] border-2 transition-all relative overflow-hidden ${user.level >= l.id ? 'border-[#FFC107] bg-white opacity-100 shadow-xl' : 'border-gray-50 bg-white opacity-40 shadow-none grayscale'}`}>
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Stage {l.id}</span>
                          {user.level >= l.id && <Zap size={10} className="text-[#FFC107] fill-[#FFC107]" />}
                       </div>
                       <h4 className="font-black text-[#37474F] text-lg leading-tight font-sans">{l.name}</h4>
                       <p className="text-[11px] font-black text-[#FFC107] uppercase tracking-wider mt-1 font-sans">{l.reward}</p>
                    </div>
                    <div className={`p-3 rounded-2xl ${user.level >= l.id ? 'bg-[#FFC107] text-[#37474F]' : 'bg-gray-100 text-gray-400'}`}>
                       {user.level >= l.id ? <CheckCircle2 size={24} /> : <Award size={24} />}
                    </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 relative z-10">
                    <TrendingUp size={14} className="text-gray-300" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-sans">{l.req}</span>
                 </div>
                 {user.level >= l.id && <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/5 rounded-full -mr-16 -mt-16 blur-3xl" />}
              </Card>
           ))}
        </div>
      </div>
   );
};

const Notifications = ({ state }: { state: AppState }) => {
   const navigate = useNavigate();
   const notifications = state.globalNotifications;

   React.useEffect(() => {
     if (notifications.length > 0) {
       const latestTime = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt;
       localStorage.setItem('last_read_notif_time', latestTime);
     }
   }, [notifications]);

   return (
      <div className="p-6 space-y-6 pb-24 bg-[#F8FAFC] min-h-screen">
         <div className="flex items-center gap-4">
           <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-xl shadow-sm"><Bell size={20} className="text-[#37474F]" /></button>
           <h2 className="text-3xl font-black text-[#37474F] tracking-tight font-sans">Updates</h2>
         </div>
         
         <div className="space-y-4">
            {notifications.length === 0 ? (
                <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center">
                       <Bell size={48} className="opacity-10" />
                    </div>
                    No updates yet
                </div>
            ) : (
                notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n) => (
                    <Card key={n.id} className="p-5 flex gap-5 bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                       <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 ${
                           n.type === 'alert' ? 'text-red-500' : n.type === 'update' ? 'text-blue-500' : 'text-[#FFC107]'
                       }`}>
                          {n.type === 'alert' ? <Zap size={24} /> : n.type === 'update' ? <Award size={24} /> : <Bell size={24} />}
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-baseline gap-2">
                             <h4 className="font-extrabold text-[#37474F] text-sm uppercase tracking-tight font-sans">{n.title}</h4>
                             <span className="text-[9px] font-bold text-gray-300 shrink-0 font-sans">
                                {new Date(n.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                                    ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : new Date(n.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed font-sans">{n.message}</p>
                       </div>
                    </Card>
                ))
            )}
         </div>
      </div>
   );
};

export default { Referral, Rank: RankProgress, Leaderboard, Notifications };
