/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronRight, Share2, Award, Shield, User, Bell, Info, ArrowLeft, ShoppingBag, ClipboardList, Camera, Loader2, TrendingUp, Trophy } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState, UserLevel } from '../types';
import { dbService } from '../dbService';

const levelInfo = {
  [UserLevel.BEGINNER]: { name: 'Beginner', color: '#B0BEC5', tasksNeeded: 0, referralsNeeded: 0, rewards: '1x Earning' },
  [UserLevel.REGULAR]: { name: 'Regular', color: '#4CAF50', tasksNeeded: 50, referralsNeeded: 0, rewards: '2x Earning, 10 Daily Tasks' },
  [UserLevel.ACTIVE]: { name: 'Active', color: '#2196F3', tasksNeeded: 150, referralsNeeded: 5, rewards: '4x Earning, 20 Daily Tasks' },
  [UserLevel.EXPERT]: { name: 'Expert', color: '#9C27B0', tasksNeeded: 400, referralsNeeded: 15, rewards: '6x Earning, 50 Daily Tasks' },
  [UserLevel.MASTER]: { name: 'Master', color: '#F44336', tasksNeeded: 1000, referralsNeeded: 50, rewards: '10x Earning, 100 Daily Tasks' },
};

const getLevelMultiplier = (level: UserLevel) => {
  return 1.0;
};

const MainProfile = ({ state, onLogout }: { state: AppState; onLogout: () => void }) => {
  const navigate = useNavigate();
  const user = state.currentUser;
  
  if (!user) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
       <div className="w-8 h-8 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currentLevel = levelInfo[user.level];
  const multiplier = getLevelMultiplier(user.level);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await dbService.uploadProfileImage(file);
      alert('Profile image updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please check your storage permissions.');
    } finally {
      setUploading(false);
    }
  };

  const stats = [
    { label: 'Earning', value: `৳${user.balance.toFixed(2)}`, color: 'text-[#FFC107]', icon: TrendingUp },
    { label: 'Tasks', value: user.totalTasksCompleted, color: 'text-blue-500', icon: ClipboardList },
    { label: 'Referrals', value: user.totalReferrals, color: 'text-green-500', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`${user.darkMode ? 'bg-slate-800' : 'bg-[#FFC107]'} p-8 pb-20 rounded-b-[40px] shadow-lg relative transition-colors`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className={`w-32 h-32 bg-white ${user.darkMode ? 'bg-slate-900 border-slate-700' : ''} rounded-[40px] shadow-2xl flex items-center justify-center text-5xl font-black text-[#FFC107] border-4 border-white/30 overflow-hidden relative group`}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name[0]
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-[#37474F]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <div className={`absolute -bottom-2 -right-2 ${user.darkMode ? 'bg-slate-700' : 'bg-[#37474F]'} p-3 rounded-2xl shadow-xl border-2 border-white dark:border-slate-800`}>
               <Award size={20} className="text-[#FFC107]" />
            </div>
          </div>
            <div className="text-center">
             <div className="flex flex-col items-center gap-1 mb-2">
                <h2 className={`text-3xl font-black ${user.darkMode ? 'text-white' : 'text-[#37474F]'} tracking-tight`}>{user.name}</h2>
                <div 
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-lg"
                  style={{ backgroundColor: currentLevel.color }}
                >
                  {currentLevel.name} • {multiplier}x Reward
                </div>
             </div>
             
             {/* Level Progress */}
             {user.level < 5 && (
               <div className="w-48 mx-auto mt-4 space-y-1">
                 <div className="flex justify-between items-end">
                   <span className="text-[8px] font-black uppercase text-white/50">Next Level</span>
                   <span className="text-[8px] font-black uppercase text-white">
                     {user.totalTasksCompleted} / {levelInfo[(user.level + 1) as UserLevel].tasksNeeded}
                   </span>
                 </div>
                 <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-white rounded-full transition-all duration-1000"
                     style={{ width: `${Math.min(100, (user.totalTasksCompleted / levelInfo[(user.level + 1) as UserLevel].tasksNeeded) * 100)}%` }}
                   />
                 </div>
               </div>
             )}

             <p className={`${user.darkMode ? 'text-gray-400' : 'text-[#37474F]/50'} font-black text-[10px] uppercase tracking-[0.2em] mt-4`}>{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-12 space-y-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
             <Card key={i} className="p-5 flex flex-col items-center gap-2 rounded-[32px] shadow-xl border border-gray-50 bg-white group hover:scale-[1.02] transition-transform">
                <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center ${s.color} mb-1 shadow-inner`}>
                   <s.icon size={16} />
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{s.label}</span>
                  <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                </div>
             </Card>
          ))}
        </div>

        {/* Total Earnings and Level Benefits Section */}
        <div className="grid grid-cols-2 gap-4">
           {/* Task & Referral Earnings */}
           <Card className="p-5 flex flex-col gap-3 rounded-[32px] border border-gray-50 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <TrendingUp size={16} />
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase">Growth</span>
              </div>
              <div className="space-y-1">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Tasks</span>
                    <span className="text-xs font-black text-[#F44336]">৳{state.transactions
                      .filter(t => t.type === 'earn' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Referrals</span>
                    <span className="text-xs font-black text-[#4CAF50]">৳{state.transactions
                      .filter(t => (t.type === 'commission' || (t.type === 'bonus' && t.description.toLowerCase().includes('referral'))) && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </span>
                 </div>
              </div>
           </Card>

           {/* Current Level Benefits */}
           <Card className="p-5 flex flex-col gap-3 rounded-[32px] border border-gray-50 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Award size={16} />
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
              </div>
              <div className="space-y-1">
                 <h6 className="text-[10px] font-black uppercase text-[#37474F]">{currentLevel.name} Perks</h6>
                 <p className="text-[8px] font-medium text-gray-500 leading-tight">
                    {currentLevel.rewards}
                 </p>
              </div>
           </Card>
        </div>

      <div className="space-y-4">
        {[
          ...(user.isAdmin ? [{ label: 'Admin Dashboard', icon: Shield, path: '/admin', sub: 'Manage settings, users & tasks' }] : []),
          { label: 'Refer & Team', icon: Share2, path: '/referral', sub: 'Manage your earning group' },
          { label: 'World Ranking', icon: Trophy, path: '/leaderboard', sub: 'Global earner leaderboard' },
          { label: 'Task History', icon: ClipboardList, path: '/tasks/history', sub: 'View your task progress' },
          { label: 'My Orders', icon: ShoppingBag, path: '/orders', sub: 'Track your purchases' },
          { label: 'Level Rewards', icon: Award, path: '/rank', sub: 'Unlock higher earnings' },
          { label: 'Notifications', icon: Bell, path: '/notifications', sub: 'Recent alerts' },
          { label: 'Settings', icon: Settings, path: '/settings', sub: 'Profile & preferences' },
        ].map((item, i) => (
          <Card key={i} className="flex items-center justify-between p-4" onClick={() => navigate(item.path)}>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                   <item.icon size={20} />
                </div>
                <div>
                   <h5 className="text-[11px] font-black text-[#37474F] uppercase">{item.label}</h5>
                   <p className="text-[9px] text-gray-400 font-bold">{item.sub}</p>
                </div>
             </div>
             <ChevronRight size={18} className="text-gray-200" />
          </Card>
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={() => {
          dbService.logout();
          onLogout();
          navigate('/login');
        }}
        className="w-full text-red-500 font-black h-12 flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> Logout Account
      </Button>

      <div className="text-center py-6">
        <a 
          href="https://www.facebook.com/profile.php?id=61591274904648" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center gap-0.5 group hover:opacity-80 transition-opacity"
        >
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">DEVELOPER</span>
          <span className="text-[11px] font-black text-[#FFC107] uppercase tracking-wider group-hover:underline">Pipilika Lab's</span>
        </a>
      </div>
    </div>
    </div>
  );
};

const SettingsScreen = ({ state, onUpdate }: { state: AppState, onUpdate: () => void }) => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
     setTapCount(c => c + 1);
     if (tapCount + 1 >= 5) {
        navigate('/admin');
        setTapCount(0);
     }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
       <div className="p-6 flex items-center gap-4 bg-white shadow-sm rounded-b-[32px]">
        <button onClick={() => navigate('/profile')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95">
           <ArrowLeft size={20} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Settings Center</span>
      </div>

      <div className="p-8 flex flex-col items-center gap-12">
         <div onClick={handleLogoTap} className="w-24 h-24 bg-[#FFC107] rounded-[36px] shadow-2xl shadow-[#FFC107]/30 flex items-center justify-center cursor-pointer transition-transform active:scale-90 border-4 border-white">
            <Shield size={48} className="text-[#37474F]" />
         </div>

         <div className="w-full space-y-6">
            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-400 uppercase px-1">Team Group Profile</h4>
               <div className="space-y-3 bg-gray-50 p-6 rounded-[32px]">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">My Group Name</label>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           defaultValue={state.currentUser?.groupName || ''}
                           placeholder="Enter group name..."
                           className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 text-xs font-black text-[#37474F] outline-none focus:ring-2 ring-[#FFC107] focus:border-transparent transition-all"
                           onBlur={async (e) => {
                              const newName = e.target.value;
                              if (newName !== state.currentUser?.groupName) {
                                 await dbService.updateCurrentUser({ groupName: newName });
                                 onUpdate();
                              }
                           }}
                        />
                     </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/referral')}
                    className="w-full bg-[#37474F] hover:bg-[#2c393f] text-white rounded-2xl h-14 flex items-center justify-center gap-3 group"
                  >
                    <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Invite Members</span>
                  </Button>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-400 uppercase px-1">App Preferences</h4>
               <div className="space-y-2">
                   {[
                     { label: 'Push Notifications', active: true, key: 'notifs' },
                     { label: 'Earning Sound Effects', active: state.currentUser?.soundEnabled !== false, key: 'soundEnabled' },
                     { label: 'Dark Mode', active: !!state.currentUser?.darkMode, key: 'darkMode' },
                   ].map((item, i) => (
                      <div 
                         key={i} 
                         className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl cursor-pointer"
                         onClick={async () => {
                           if (item.key === 'soundEnabled') {
                             await dbService.updateCurrentUser({ soundEnabled: !item.active });
                           } else if (item.key === 'darkMode') {
                             await dbService.updateCurrentUser({ darkMode: !item.active });
                           }
                           onUpdate();
                         }}
                      >
                         <span className="text-xs font-bold text-[#37474F]">{item.label}</span>
                         <div className={`w-10 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-[#FFC107]' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.active ? 'translate-x-4' : 'translate-x-0'}`} />
                         </div>
                      </div>
                   ))}
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-400 uppercase px-1">Security</h4>
               <Card className="flex items-center justify-between p-4 border border-gray-100 shadow-none mb-2">
                  <span className="text-xs font-bold text-gray-400">ID: {state.currentUser?.id}</span>
               </Card>
               <div className="space-y-2">
                 <input 
                   type="password" 
                   placeholder="Enter Admin Secret Key" 
                   className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold"
                   onKeyDown={async (e) => {
                     if (e.key === 'Enter') {
                       const val = (e.target as HTMLInputElement).value;
                       const success = await dbService.activateAdminSecret(state.currentUser!.id, val);
                       if (success) {
                         alert('Admin access granted!');
                         onUpdate();
                         navigate('/admin');
                       } else {
                         alert('Invalid key');
                       }
                       (e.target as HTMLInputElement).value = '';
                     }
                   }}
                 />
                 <p className="text-[8px] text-gray-400 font-bold px-2 uppercase tracking-widest">Only for network administrators</p>
               </div>
            </div>
         </div>

         <div className="text-center mt-auto flex flex-col items-center pb-4 z-10">
            <p className="text-[10px] font-black uppercase mb-1">CASH v1.0.4-PRO</p>
            <a 
              href="https://www.facebook.com/profile.php?id=61591274904648" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex flex-col items-center gap-0.5 group hover:opacity-80 transition-opacity"
            >
              <span className="text-[8px] font-black tracking-widest text-gray-400/50 uppercase">DEVELOPER</span>
              <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-wider group-hover:underline">Pipilika Lab's</span>
            </a>
         </div>
      </div>
    </div>
  );
};

export default { Main: MainProfile, Settings: SettingsScreen };
