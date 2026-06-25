import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Send, Image as ImageIcon, Smile, Mic, Plus, 
  Phone, Info, MoreVertical, Zap, Check, CheckCheck, Users
} from 'lucide-react';
import { Card, Input, Button } from '../components/UI';
import { AppState, User, GroupMessage } from '../types';
import { dbService } from '../dbService';

export default function GroupChatDetailScreen({ state }: { state: AppState }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = state.currentUser!;
  
  const leader = state.users.find(u => u.id === groupId);
  const groupName = leader?.groupName || "Team Alpha";
  
  const isAuthorized = currentUser.isAdmin || groupId === currentUser.id || currentUser.referredBy === groupId;

  // Both messages from user's own group and joined group are relevant
  const messages = groupId === currentUser.id 
    ? state.myGroupMessages 
    : state.joinedGroupMessages;

  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    msgs.forEach(m => {
      const date = new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const today = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      
      let label = date;
      if (date === today) label = 'Today';
      else if (date === yesterday) label = 'Yesterday';
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Mark unread messages as read (logically per user)
    const unread = messages.filter(m => !m.readBy?.includes(currentUser.id));
    unread.forEach(m => {
      dbService.markGroupMessageRead(m.id, currentUser.id);
    });
  }, [messages.length, groupId]);

  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center space-y-6 text-white">
         <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <Users size={32} className="text-red-500" />
         </div>
         <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Unauthorized Access</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-tighter leading-relaxed">
              You are not a member of this squad. Team channels are restricted to verified operatives only.
            </p>
         </div>
         <Button onClick={() => navigate('/chat')} className="bg-indigo-500">Secure Withdrawal</Button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!text.trim() || !groupId) return;
    
    await dbService.sendGroupMessage(text, currentUser, groupId);
    setText('');
  };

  const isTyping = state.typingIndicators.filter(ti => ti.targetId === groupId && ti.userId !== currentUser.id);

  return (
    <div className="h-screen bg-[#0F172A] flex flex-col overflow-hidden text-white">
      {/* Dynamic Header */}
      <div className="p-6 bg-[#0F172A]/80 backdrop-blur-3xl border-b border-white/5 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
              <ArrowLeft size={20} />
           </button>
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 to-blue-500">
                 <div className="w-full h-full rounded-[14px] bg-[#0F172A] overflow-hidden flex items-center justify-center font-black">
                    <Users size={20} className="text-indigo-400" />
                 </div>
              </div>
              <div>
                 <h3 className="text-sm font-black text-white">{groupName}</h3>
                 <div className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Team Encrypted
                 </div>
              </div>
        </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><Info size={20} className="text-white/40" /></button>
        </div>
      </div>

      {/* Message Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scrolling-touch relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_70%)]" />
        </div>

        <div className="text-center py-10 space-y-2 opacity-20">
           <Users size={32} className="mx-auto text-indigo-400" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Group Transmission Protocol Alpha-6</p>
        </div>

        {Object.entries(messageGroups).map(([date, groupMsgs]) => (
          <div key={date} className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">{date}</span>
              </div>
            </div>
            
            {groupMsgs.map((m, i) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                     {!isMe && (
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-2">
                         {m.senderName}
                       </span>
                     )}
                     <div className={`px-5 py-4 rounded-[28px] text-sm shadow-2xl relative group ${
                        isMe 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border border-white/10' 
                        : 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white/90 rounded-tl-none border border-white/5'
                     }`}>
                        {m.text}
                     </div>
                     <div className={`flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                           {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        {isTyping.length > 0 && (
          <div className="flex items-center gap-2 animate-pulse pl-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              {isTyping.length > 1 ? `${isTyping.length} agents are typing...` : `${isTyping[0].userName} is typing...`}
            </span>
          </div>
        )}
      </div>

      {/* Futuristic Input Console */}
      <div className="p-6 bg-[#0F172A] border-t border-white/5 pb-10">
         <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-[32px] shadow-2xl focus-within:border-indigo-500/30 transition-all">
            <button className="p-3 bg-white/5 rounded-2xl text-indigo-400 hover:bg-white/10 transition-all">
               <Plus size={20} />
            </button>
            <input 
               value={text}
               onChange={(e) => setText(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Broadcasting to team..."
               className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/20 h-10"
            />
            <div className="flex gap-1 pr-1">
               <button 
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="p-3.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/40 text-white active:scale-95 disabled:opacity-50 transition-all"
               >
                  <Send size={20} className="fill-white" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
