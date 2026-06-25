import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Send, Image as ImageIcon, Smile, Mic, Plus, 
  Phone, Info, MoreVertical, Zap, Check, CheckCheck 
} from 'lucide-react';
import { Card, Input, Button } from '../components/UI';
import { AppState, User } from '../types';
import { dbService } from '../dbService';

export default function ChatDetailScreen({ state }: { state: AppState }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = state.currentUser!;
  
  // Deriving recipient directly from state for reactive updates
  const recipientFromState = state.users.find(u => u.id === userId);
  const [recipient, setRecipient] = useState<User | null>(recipientFromState || null);
  const [loadingRecipient, setLoadingRecipient] = useState(!recipientFromState);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (recipientFromState) {
      setRecipient(recipientFromState);
      setLoadingRecipient(false);
      setIsAuthorized(true);
    } else if (userId) {
      // If not in state, fetch once and check authorization
      dbService.getUser(userId).then(u => {
        if (u) {
          const isReferral = u.referredBy === currentUser.id;
          const isLeader = u.id === currentUser.referredBy;
          const isAdmin = u.isAdmin;
          
          if (currentUser.isAdmin || isReferral || isLeader || isAdmin) {
            setRecipient(u);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        }
        setLoadingRecipient(false);
      }).catch(() => {
        setLoadingRecipient(false);
        setIsAuthorized(false);
      });
    }
  }, [userId, recipientFromState, currentUser.id, currentUser.isAdmin, currentUser.referredBy]);

  const activeRecipient = recipient || { id: userId || 'unknown', name: 'User', avatar: '' } as User;
  
  const messages = (state.directMessages || []).filter(m => 
    m && (
      (m.senderId === currentUser.id && m.recipientId === userId) || 
      (m.senderId === userId && m.recipientId === currentUser.id)
    )
  );

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

    // Mark unread messages from recipient as read
    const unreadFromRecipient = messages.filter(m => m.senderId === userId && !m.isRead);
    unreadFromRecipient.forEach(m => {
      dbService.markDirectMessageRead(m.id);
    });
  }, [messages.length, userId]);

  const handleSend = async () => {
    if (!text.trim() || !activeRecipient.id || activeRecipient.id === 'unknown') return;
    
    // Stop typing immediately when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await dbService.setTypingStatus(currentUser.id, currentUser.name, activeRecipient.id, false);
    setIsTyping(false);

    await dbService.sendDirectMessage(text, currentUser, activeRecipient);
    setText('');
  };

  const handleTextChange = (val: string) => {
    setText(val);
    
    if (!activeRecipient.id || activeRecipient.id === 'unknown') return;

    if (!isTyping) {
      setIsTyping(true);
      dbService.setTypingStatus(currentUser.id, currentUser.name, activeRecipient.id, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      dbService.setTypingStatus(currentUser.id, currentUser.name, activeRecipient.id, false);
    }, 3000);
  };

  if (loadingRecipient) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
         <Zap className="animate-pulse text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center space-y-6 text-white">
         <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <Zap className="text-red-500 w-10 h-10" />
         </div>
         <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Unauthorized Frequency</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-tighter leading-relaxed">
              You are not authorized to establish a link with this operative. Team encryption protocol active.
            </p>
         </div>
         <Button onClick={() => navigate('/chat')} className="bg-indigo-500">Secure Withdrawal</Button>
      </div>
    );
  }

  const isRecipientTyping = state.typingIndicators.some(ti => ti.userId === userId && ti.targetId === currentUser.id);

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
                    {activeRecipient.avatar ? <img src={activeRecipient.avatar} className="w-full h-full object-cover" /> : activeRecipient.name[0]}
                 </div>
              </div>
              <div>
                 <h3 className="text-sm font-black text-white">{activeRecipient.name}</h3>
                 {isRecipientTyping ? (
                   <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5 animate-pulse">
                     Typing transmission...
                   </div>
                 ) : (
                   <div className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5 animate-pulse">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                   </div>
                 )}
              </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors hidden sm:flex"><Phone size={20} className="text-white/40" /></button>
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
           <Zap size={32} className="mx-auto text-indigo-400" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Circle End-to-End Encrypted</p>
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
                        {isMe && (
                          <div className="flex items-center gap-1">
                             {m.isRead ? (
                               <CheckCheck size={10} className="text-blue-400" />
                             ) : (
                               <Check size={10} className="text-white/20" />
                             )}
                          </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Futuristic Input Console */}
      <div className="p-6 bg-[#0F172A] border-t border-white/5 pb-10">
         <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-[32px] shadow-2xl focus-within:border-indigo-500/30 transition-all">
            <button className="p-3 bg-white/5 rounded-2xl text-indigo-400 hover:bg-white/10 transition-all">
               <Plus size={20} />
            </button>
            <input 
               value={text}
               onChange={(e) => handleTextChange(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Forge transmission..."
               className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/20 h-10"
            />
            <div className="flex gap-1 pr-1">
               <button className="p-3 text-white/20 hover:text-white transition-colors">
                  <Smile size={20} />
               </button>
               <button className="p-3 text-white/20 hover:text-white transition-colors">
                  <Mic size={20} />
               </button>
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
