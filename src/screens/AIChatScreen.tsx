/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User as UserIcon, ArrowLeft, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState } from '../types';

import { getGeminiChatResponse } from '../services/geminiService';

export default function AIChatScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser;
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        { role: 'ai', text: `Hi ${user.name}! I'm your AI Shopping Assistant. I can help you find products, calculate rewards, and give you better shopping deals. How can I help you today?` }
      ]);
    }
  }, [user, messages.length]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!user) return (
     <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const productsContext = state.products.map(p => `${p.name} (৳${p.price})`).join(', ');
      
      const systemInstruction = `You are "CASH Assistant", a highly intelligent and friendly shopping guide for the "CASH" app.
      App Description: An earn-and-shop platform where users complete tasks to earn BDT (৳) and buy daily essentials.
      Context:
      - Current User: ${user.name}
      - Level: ${user.level} (Higher level means better rewards)
      - Balance: ৳${user.balance}
      - Available Market Products: ${productsContext}
      
      Your Goal:
      1. Help users find products from the list.
      2. Suggest how to earn more (completing tasks, missions, referrals).
      3. Be concise (2-3 sentences max) but very helpful.
      4. Use a friendly, professional tone. If the user speaks Bengali, respond in a mix of English and Bengali (Hinglish/Benglish style) for a natural feel.
      5. Don't repeat yourself. If you don't know something about product availability beyond provided list, say "I'll ask the team to add more items soon!"
      6. Use the conversational history to provide context-aware answers.`;

      // Convert message history to Gemini format (excluding system prompt which is handled by service)
      const history = messages.slice(1).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const text = await getGeminiChatResponse(userText, systemInstruction, history);

      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFCFB]">
      <div className="p-4 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
             <ArrowLeft size={24} className="text-[#37474F]" />
           </button>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="text-sm font-black text-[#37474F] uppercase tracking-tight">AI Assistant</h1>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Support</span>
                </div>
              </div>
           </div>
        </div>
        <button className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-100">
           Pro Features
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                 m.role === 'ai' ? 'bg-indigo-500 text-white' : 'bg-[#FFC107] text-[#37474F]'
               }`}>
                 {m.role === 'ai' ? <Bot size={16} /> : <UserIcon size={16} />}
               </div>
               <div className={`p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-sm ${
                 m.role === 'ai' 
                  ? 'bg-white text-[#37474F] rounded-tl-none border border-gray-100' 
                  : 'bg-[#37474F] text-white rounded-tr-none'
               }`}>
                 {m.text}
               </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-indigo-50 text-indigo-400 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Assistant is thinking...</span>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
        <div className="flex bg-gray-50 rounded-2xl p-2 gap-2 shadow-inner border border-gray-100">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about products or rewards..."
            className="flex-1 bg-transparent border-none p-3 text-xs font-bold outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[7px] font-black text-gray-300 uppercase tracking-[0.2em] mt-3 flex items-center justify-center gap-1">
           <Sparkles size={8} /> Powered by AI Assistant Pro
        </p>
      </div>
    </div>
  );
}
