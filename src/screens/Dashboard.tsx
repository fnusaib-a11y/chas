/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, ShoppingCart, ClipboardList, Users, TrendingUp, Bell, ChevronRight, Zap, Play, Download, HelpCircle, ExternalLink, Award, Trophy, MessageSquare, RefreshCw, Bot, Sparkles, Film, Gem, Target, Eye, Briefcase, Brain, User, Clock, Truck, GraduationCap, Cpu, Wrench, Flame, Globe } from 'lucide-react';
import { Card, Button, BannerAdSlot } from '../components/UI';
import { AppState, UserLevel, AppSettings } from '../types';
import { dbService } from '../dbService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LootDropSystem from '../components/LootDropSystem';

const levelInfo = {
  [UserLevel.BEGINNER]: { name: 'Beginner', color: '#B0BEC5', tasksNeeded: 0, referralsNeeded: 0, rewards: '1x Earning' },
  [UserLevel.REGULAR]: { name: 'Regular', color: '#4CAF50', tasksNeeded: 50, referralsNeeded: 0, rewards: '2x Earning, 10 Daily Tasks' },
  [UserLevel.ACTIVE]: { name: 'Active', color: '#2196F3', tasksNeeded: 150, referralsNeeded: 5, rewards: '4x Earning, 20 Daily Tasks' },
  [UserLevel.EXPERT]: { name: 'Expert', color: '#9C27B0', tasksNeeded: 400, referralsNeeded: 15, rewards: '6x Earning, 50 Daily Tasks' },
  [UserLevel.MASTER]: { name: 'Master', color: '#F44336', tasksNeeded: 1000, referralsNeeded: 50, rewards: '10x Earning, 100 Daily Tasks' },
};

const getTaskTag = (task: any) => {
  if (task.type === 'survey' || task.category?.toLowerCase().includes('survey')) {
    if (task.reward >= 15) return 'EXCLUSIVE';
    if (task.reward >= 10) return 'QUALIFICATION';
    return 'SURVEY';
  }
  if (task.type === 'install') return 'EXCLUSIVE';
  return 'POPULAR';
};

const getDotColor = (tag: string) => {
  if (tag === 'EXCLUSIVE') return 'bg-[#00B074]'; // green
  if (tag === 'QUALIFICATION') return 'bg-[#FF9F43]'; // orange
  if (tag === 'SURVEY') return 'bg-[#9C27B0]'; // purple
  return 'bg-[#D4AF37]'; // gold
};

export default function Dashboard({ state }: { state: AppState }) {
  const user = state.currentUser;
  const navigate = useNavigate();

  const [showReferralPopup, setShowReferralPopup] = React.useState(false);
  const [referralInput, setReferralInput] = React.useState('');
  const [refMessage, setRefMessage] = React.useState('');
  const [refError, setRefError] = React.useState('');
  const [submittingRef, setSubmittingRef] = React.useState(false);

  const [selectedChannel, setSelectedChannel] = React.useState('featured');
  const [claimingCheckIn, setClaimingCheckIn] = React.useState(false);

  const enabledTabs = React.useMemo(() => {
    return (state.settings.coinTabs || []).filter(tab => tab.enabled !== false);
  }, [state.settings.coinTabs]);

  const [activeTab, setActiveTab] = React.useState<string>('');

  const enabledTabsIds = enabledTabs.map(t => t.id).join(',');

  React.useEffect(() => {
    if (enabledTabs.length > 0) {
      const isStillEnabled = enabledTabs.some(t => t.id === activeTab);
      if (!activeTab || !isStillEnabled) {
        setActiveTab(enabledTabs[0].id);
      }
    }
  }, [enabledTabsIds, activeTab]);

  const filteredTasks = React.useMemo(() => {
    const currentTab = enabledTabs.find(t => t.id === activeTab);
    if (!currentTab) return [];

    const fType = currentTab.filterType;
    if (fType === 'survey') {
      return state.tasks.filter(t => t.type === 'survey' || t.category?.toLowerCase() === 'survey');
    }
    if (fType === 'trending') {
      return [...state.tasks].sort((a, b) => (b.reward || 0) - (a.reward || 0));
    }
    if (fType === 'install') {
      return state.tasks.filter(t => t.type === 'install' || t.category?.toLowerCase() === 'install');
    }
    if (fType === 'link') {
      return state.tasks.filter(t => t.type === 'link' || t.category?.toLowerCase() === 'link');
    }
    if (fType === 'special') {
      return state.tasks.filter(t => t.category?.toLowerCase() === 'special');
    }
    if (fType === 'social') {
      return state.tasks.filter(t => t.category?.toLowerCase() === 'social');
    }
    if (fType === 'all') {
      return state.tasks;
    }
    return state.tasks.filter(t => t.type !== 'survey').concat(state.tasks.filter(t => t.type === 'survey')).slice(0, 6);
  }, [state.tasks, activeTab, enabledTabs]);

  const hasCheckedInToday = () => {
    if (!user || !user.lastCheckIn) return false;
    const lastCheckInDate = new Date(user.lastCheckIn);
    const today = new Date();
    return lastCheckInDate.getDate() === today.getDate() &&
           lastCheckInDate.getMonth() === today.getMonth() &&
           lastCheckInDate.getFullYear() === today.getFullYear();
  };

  const handleDailyCheckIn = async () => {
    if (!user || hasCheckedInToday()) return;
    setClaimingCheckIn(true);
    try {
      const success = await dbService.claimDailyCheckIn(user);
      if (success) {
        alert('সফলভাবে দৈনিক চেক-ইন বোনাস ৫০ কয়েন (৫ টাকা) আপনার ওয়ালেটে যোগ হয়েছে!');
      } else {
        alert('আপনি আজ ইতিমধ্যেই চেক-ইন করেছেন!');
      }
    } catch (err) {
      alert('চেক-ইন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setClaimingCheckIn(false);
    }
  };

  React.useEffect(() => {
    if (user && !user.referredBy && (!user.referralStatus || user.referralStatus === 'none') && !user.isAdmin) {
      const timer = setTimeout(() => {
        setShowReferralPopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleReferralSubmit = async () => {
    if (!referralInput.trim()) {
      setRefError('দয়া করে একটু রেফারেল কোড লিখুন।');
      return;
    }
    setSubmittingRef(true);
    setRefError('');
    setRefMessage('');
    try {
      const res = await dbService.enterReferralCode(referralInput);
      if (res.success) {
        setRefMessage(res.message);
        setTimeout(() => {
          setShowReferralPopup(false);
        }, 3000);
      } else {
        setRefError(res.message);
      }
    } catch (err: any) {
      setRefError('কোড সাবমিট করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট সংযোগ চেক করুন।');
    } finally {
      setSubmittingRef(false);
    }
  };

  if (!user) return (
     <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading profile data...</p>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LootDropSystem state={state} />
      {/* Sleek Premium Header Section */}
      <div className="bg-[#FFC107] p-6 pb-24 rounded-b-[40px] relative shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center font-bold text-[#37474F] text-lg shadow-md border-2 border-white overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name[0]
                )}
             </div>
             <div>
                <p className="text-[#37474F]/70 text-[9px] font-black uppercase tracking-wider">Welcome Back,</p>
                <div className="flex items-center gap-2">
                   <h2 className="font-black text-[#37474F] text-lg leading-tight">{user.name.split(' ')[0]}</h2>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* 3 Streak fire badge precisely like the image! */}
             <div className="bg-orange-50 border border-orange-100 text-[#FF5722] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm font-sans">
                <span>🔥</span>
                <span>{(user.streak || 3)} Streak</span>
             </div>
             
             <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-xl border border-white/40 flex items-center justify-center bg-white/20 text-[#37474F] shadow-sm active:scale-95 transition-transform">
                <User size={16} />
             </button>
          </div>
        </div>

        {/* Overlapping Gold & Black Coins Balance Card */}
        <div className="absolute left-6 right-6 -bottom-16 bg-[#121216] border border-[#D4AF37]/50 p-5 rounded-[32px] shadow-[0_10px_30px_rgba(212,175,55,0.12)] flex justify-between items-center overflow-hidden text-white z-20">
           {/* Overlapping gold background blur */}
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
           
           <div className="space-y-1 z-10">
             <p className="text-[9px] uppercase text-[#D4AF37] font-black tracking-widest leading-none">AVAILABLE COINS</p>
             <div className="flex items-center gap-2 mt-2">
               {/* Golden Coin Icon */}
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFE082] to-[#FFB300] flex items-center justify-center shadow-md border border-amber-300">
                 <span className="text-base leading-none">🪙</span>
               </div>
               <span className="text-2xl font-black text-white tracking-tight leading-none">
                 {((user.balance || 0) * 10).toFixed(0)}
               </span>
             </div>
             
             {/* Pending details */}
             <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-800/60 text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">
               <div>Pending: <span className="text-slate-200">{((user.pendingBalance || 0) * 10).toFixed(0)}</span></div>
               <div>Lifetime: <span className="text-[#D4AF37]">{(((user.balance || 0) + (user.pendingBalance || 0)) * 10).toFixed(0)}</span></div>
             </div>
           </div>

           <button 
             onClick={() => navigate('/wallet')}
             className="bg-gradient-to-r from-[#D4AF37] to-[#F3C044] text-black text-[10px] font-black px-5 py-2.5 rounded-2xl shadow-md hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider z-10"
           >
             Withdraw
           </button>
        </div>
      </div>

      <div className="p-6 pt-20 space-y-8">
        {/* Streak Check-In Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[32px] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2 max-w-[70%] z-10">
            <h4 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider font-sans">Streak Check-In</h4>
            <p className="text-[10px] text-slate-600 font-bold leading-normal font-sans">
              Check in daily without stopping to earn extra coin values.
            </p>
            <button 
              onClick={handleDailyCheckIn}
              disabled={claimingCheckIn || hasCheckedInToday()}
              className={`px-4 py-2.5 text-[10px] font-black uppercase rounded-xl shadow-sm transition-all duration-200 active:scale-95 font-sans ${
                hasCheckedInToday() 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00B074] to-[#05c485] text-white hover:brightness-105 shadow-emerald-500/10 shadow-lg'
              }`}
            >
              {claimingCheckIn ? 'Claiming...' : hasCheckedInToday() ? 'Claimed Today (+50 Coins)' : 'Claim Daily +50 Coins'}
            </button>
          </div>
          
          <div className="flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20 animate-pulse z-10">
            <Flame size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* Earning Channels (Extremely Responsive Grid) */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-widest font-sans px-1">Earning Channels</h3>
          <div className="grid grid-cols-4 gap-2">
            {((state.settings.earningChannels || []).filter(ch => ch.enabled !== false)).map((ch) => {
              return (
                <button 
                  key={ch.id} 
                  onClick={() => navigate(ch.path)} 
                  className="bg-white border border-slate-100 p-2 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all duration-150"
                >
                  <span className="text-lg">{ch.emoji}</span>
                  <span className="text-[8px] font-black uppercase text-slate-600 tracking-tighter truncate max-w-full text-center">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal scroll tabs and 2-column Survey tasks grid as requested! */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {enabledTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-[11px] font-black transition-all duration-150 whitespace-nowrap border ${
                    isActive
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-500/10'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* 2-Column task grid, matching uploaded picture exactly */}
          <div className="grid grid-cols-2 gap-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const tag = getTaskTag(task);
                const dotColor = getDotColor(tag);
                // deterministic random stats based on task ID
                const userCount = (task.id.charCodeAt(0) * 23 + 458) % 4500 + 350;
                const starRating = (task.id.charCodeAt(1) % 2 === 0) ? '5/5' : '4/5';
                
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="bg-white border border-slate-200/80 hover:border-[#D4AF37]/50 rounded-[28px] p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer active:scale-95 transition-all min-h-[165px] shadow-sm"
                  >
                    {/* Top row: Tag and Dot */}
                    <div className="flex justify-between items-center w-full mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        tag === 'EXCLUSIVE' ? 'bg-[#00B074]/15 text-[#00B074]' :
                        tag === 'QUALIFICATION' ? 'bg-[#FF9F43]/15 text-[#FF9F43]' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tag}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    </div>

                    {/* Center: Coin reward matching screenshot style */}
                    <div className="flex flex-col items-center justify-center my-auto py-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE082] to-[#FFB300] flex items-center justify-center shadow-sm mb-1.5 border border-amber-300/40">
                        <span className="text-base leading-none">🪙</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                        {((task.reward || 0) * 10).toFixed(0)}
                      </span>
                    </div>

                    {/* Footer: completions and rating */}
                    <div className="flex justify-between items-center w-full mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1">
                        <Users size={10} className="text-slate-400" />
                        <span>{userCount}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <span>★</span>
                        <span className="text-slate-500 text-[9px]">{starRating}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-10 text-center text-xs text-slate-500 italic bg-white border border-slate-100 rounded-[24px]">
                No active survey tasks at the moment.
              </div>
            )}
          </div>
        </div>

      <div className="py-8 text-center space-y-4 opacity-40">
        <BannerAdSlot state={state} />
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">© 2026 CASH Network</p>
        <div className="flex justify-center gap-4 text-[8px] font-bold uppercase tracking-widest">
           <button onClick={() => navigate('/support')}>ToS</button>
           <span>•</span>
           <button onClick={() => navigate('/support')}>Privacy</button>
           <span>•</span>
           <button onClick={() => navigate('/support')}>Support</button>
        </div>
      </div>
      </div>

      {/* Referral Entry Popup Modal */}
      {showReferralPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#FFC107]/10 rounded-full flex items-center justify-center text-[#FFC107] mx-auto">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-black text-[#37474F] font-sans">রেফারেল কোড ব্যবহার করুন</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-bold font-sans">
                আপনার বন্ধুর থেকে পাওয়া রেফারেল কোডটি এখানে লিখুন। এডমিন আপনার একাউন্ট চেক করে অনুমোদন দিলেই আপনি পাবেন ফ্রিতে ৫ টাকা ইনস্ট্যান্ট বোনাস!
              </p>
            </div>

            {refError && (
              <div className="bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-wider p-3 rounded-xl text-center font-sans">
                {refError}
              </div>
            )}

            {refMessage && (
              <div className="bg-green-50 text-green-500 border border-green-100 text-[10px] font-black uppercase tracking-wider p-3 rounded-xl text-center font-sans">
                {refMessage}
              </div>
            )}

            {!refMessage && (
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="রেফার কোড লিখুন (যেমন: A7B8C)"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  disabled={submittingRef}
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl px-4 py-3 text-center text-sm font-black text-[#37474F] tracking-widest uppercase outline-none focus:border-[#FFC107] font-sans"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowReferralPopup(false)}
                    className="flex-1 h-12 rounded-xl text-xs font-black uppercase text-gray-400 bg-gray-50 border border-gray-100 active:scale-95 transition-all font-sans"
                  >
                    পরে করব
                  </button>
                  <button 
                    onClick={handleReferralSubmit}
                    disabled={submittingRef}
                    className="flex-1 h-12 bg-[#FFC107] text-[#37474F] rounded-xl text-xs font-black uppercase shadow-md active:scale-95 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 font-sans"
                  >
                    {submittingRef ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
