import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MessageSquare, Plus, ArrowLeft, MoreHorizontal, User as UserIcon, Camera, Settings, Shield, Bot, Users, ChevronRight } from 'lucide-react';
import { Card, Input, Badge } from '../components/UI';
import { AppState, User } from '../types';

export default function ChatListScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const currentUser = state.currentUser;
  
  // Safety redirect if accessed without user
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  if (!currentUser) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
       <div className="w-8 h-8 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Group chats by recipient for clarity
  const messages = state.directMessages || [];
  const users = state.users || [];
  const chatGroups = [...new Set(messages.map(m => m.participants.find(p => p !== currentUser.id)))].filter(Boolean);
  const myReferrals = users.filter(u => u.referredBy === currentUser.id);
  const hasTeam = myReferrals.length > 0 || currentUser.referredBy;

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!currentUser.isAdmin && val.length > 0) {
      // Regular users can only search their own team members or leader
      const teamMatch = state.users.filter(u => 
        (u.referredBy === currentUser.id || u.id === currentUser.referredBy) && 
        (u.phone.includes(val) || u.name.toLowerCase().includes(val.toLowerCase()))
      );
      setSearchResults(teamMatch);
      return;
    }
    if (val.length > 3) {
       setIsSearching(true);
       const localMatch = state.users.filter(u => u.phone.includes(val) || u.name.toLowerCase().includes(val.toLowerCase()) || u.id.includes(val));
       setSearchResults(localMatch);
       setIsSearching(false);
    } else {
       setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-3xl border-b border-white/5 p-6">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <ArrowLeft size={20} />
           </button>
           <h1 className="text-lg font-black uppercase tracking-widest">Command Center</h1>
           <button className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <Settings size={20} />
           </button>
        </div>

        <div className="relative group">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
           <input 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={currentUser.isAdmin ? "Search all operatives..." : "Search team members..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500/50 transition-all text-xs font-bold uppercase tracking-widest"
           />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Search Results */}
        {searchQuery.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 px-1">Found Entities</h3>
            <div className="space-y-3">
              {searchResults.length > 0 ? searchResults.map(u => (
                 <Card 
                   key={u.id}
                   onClick={() => navigate(`/chat/${u.id}`)}
                   className="p-4 bg-white/5 border border-white/10 flex items-center justify-between"
                 >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-xs">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-xl" /> : u.name[0]}
                      </div>
                      <div>
                         <h4 className="text-xs font-black uppercase tracking-widest">{u.name}</h4>
                         <p className="text-[8px] font-bold text-white/20 uppercase">{u.isAdmin ? 'Supreme Admin' : u.phone}</p>
                      </div>
                   </div>
                   <MessageSquare size={16} className="text-indigo-400" />
                 </Card>
              )) : (
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center py-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  {isSearching ? 'Scanning frequencies...' : 'No entity detected with this signature'}
                </div>
              )}
            </div>
            <div className="h-px bg-white/5 my-6" />
          </div>
        )}

        {/* Referral Headquarters */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFC107] px-1">Refer & Earn Hub</h3>
           <div className="grid grid-cols-1 gap-4">
              <motion.div 
                whileHover={{ x: 8 }}
                onClick={() => navigate(`/chat/group/${currentUser.id}`)}
                className="flex items-center gap-4 bg-gradient-to-br from-[#FFC107]/20 to-transparent p-5 rounded-[2.5rem] border border-[#FFC107]/30 cursor-pointer shadow-xl group"
              >
                 <div className="w-14 h-14 bg-[#FFC107] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FFC107]/20">
                    <Users size={24} className="text-[#37474F]" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">My Team Group</h4>
                    <p className="text-[9px] font-bold text-[#FFC107] uppercase">Discussion for your network</p>
                 </div>
                 <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-none text-[8px] px-2 py-0.5">{myReferrals.length} Members</Badge>
              </motion.div>

              {currentUser.referredBy && (
                 <motion.div 
                   whileHover={{ x: 8 }}
                   onClick={() => navigate(`/chat/group/${currentUser.referredBy}`)}
                   className="flex items-center gap-4 bg-gradient-to-br from-indigo-500/20 to-transparent p-5 rounded-[2.5rem] border border-indigo-500/30 cursor-pointer shadow-xl group"
                 >
                    <div className="w-14 h-14 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                       <Shield size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-black text-white uppercase tracking-wider">Leader's Group</h4>
                       <p className="text-[9px] font-bold text-indigo-400 uppercase">Updates from your inviter</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                       <ChevronRight size={16} className="text-white/20" />
                    </div>
                 </motion.div>
              )}
           </div>
        </div>

        {/* Your Operatives (Referrals) */}
        {myReferrals.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Your Team Operatives</h3>
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {myReferrals.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => navigate(`/chat/${u.id}`)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
                  >
                     <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-yellow-500 to-orange-500 shadow-md">
                        <div className="w-full h-full rounded-[14px] bg-[#0F172A] border-2 border-[#0F172A] overflow-hidden relative">
                           {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{u.name[0]}</div>}
                           <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
                        </div>
                     </div>
                     <span className="text-[8px] font-black uppercase text-white/40 tracking-tighter truncate w-14 text-center">{u.name}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Active Entities - ONLY FOR ADMIN */}
        {currentUser.isAdmin && (
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Operatives Active</h3>
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                   <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                      <Plus size={20} className="text-indigo-400" />
                   </div>
                   <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Broadcast</span>
                </div>
                {state.users.filter(u => u.id !== currentUser.id).slice(0, 15).map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => navigate(`/chat/${u.id}`)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
                  >
                     <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-md">
                        <div className="w-full h-full rounded-[14px] bg-[#0F172A] border-2 border-[#0F172A] overflow-hidden relative">
                           {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{u.name[0]}</div>}
                           <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F172A] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                     </div>
                     <span className="text-[8px] font-black uppercase text-white/40 tracking-tighter truncate w-14 text-center">{u.name}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Conversations - ADMIN OR DIRECT CHATS */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Direct Communications</h3>
           <div className="space-y-3">
              {(chatGroups || []).length > 0 ? chatGroups.map((uid: any) => {
                const user = (state.users || []).find(u => u && u.id === uid);
                // Regular users can only see chats with admin or their team leader/members
                if (!currentUser.isAdmin && user?.id !== currentUser.referredBy && !(myReferrals || []).find(mu => mu.id === uid) && !user?.isAdmin) {
                  return null;
                }
                const lastMsg = (state.directMessages || []).filter(m => m && m.participants && m.participants.includes(uid)).pop();
                const isTyping = (state.typingIndicators || []).some(ti => ti.userId === uid && ti.targetId === currentUser.id);
                return (
                  <motion.div 
                    key={uid}
                    whileHover={{ x: 8 }}
                    onClick={() => navigate(`/chat/${uid}`)}
                    className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5 active:bg-white/10 transition-all shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center text-lg font-black border border-white/10 shrink-0">
                          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0] || '?'}
                       </div>
                       <div className="space-y-1 min-w-0">
                          <h4 className="text-[11px] font-black text-white truncate">{user?.name || 'Loading profile...'}</h4>
                          {isTyping ? (
                            <p className="text-[10px] font-black uppercase text-indigo-400 animate-pulse tracking-widest">
                              Typing...
                            </p>
                          ) : (
                            <p className={`text-[9px] font-bold tracking-tight uppercase truncate ${lastMsg?.isRead ? 'text-white/30' : 'text-blue-400'}`}>
                               {lastMsg?.text || 'Transmission pending...'}
                            </p>
                          )}
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                       </span>
                       {!lastMsg?.isRead && lastMsg?.senderId !== currentUser.id && (
                         <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
                       )}
                    </div>
                  </motion.div>
                );
              }) : (
                 <div className="py-12 text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 text-center w-full">Frequency Silence</p>
                 </div>
              )}
           </div>
        </div>

        {/* Global Support and Network */}
        <div className="space-y-6 pb-32">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-1">Global Support</h3>
              <div className="grid grid-cols-1 gap-3">
                 {state.users.filter(u => u.isAdmin).map(a => (
                    <Card 
                       key={a.id}
                       onClick={() => navigate(`/chat/${a.id}`)}
                       className="p-4 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                             <Bot className="text-emerald-400" size={18} />
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Support Agent</h4>
                             <p className="text-[9px] font-bold text-white uppercase">{a.name} (Admin)</p>
                          </div>
                       </div>
                       <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] px-2 py-0.5">Online</Badge>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>

        {currentUser.isAdmin && (
          <button 
            onClick={() => {
               const someUser = state.users.find(u => u.id !== currentUser.id);
               if (someUser) navigate(`/chat/${someUser.id}`);
               else alert("No other users found to chat with.");
            }}
            className="fixed bottom-32 right-8 w-16 h-16 bg-indigo-500 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white scale-110 active:scale-95 transition-all"
          >
             <Plus size={32} />
          </button>
        )}
    </div>
  );
}
