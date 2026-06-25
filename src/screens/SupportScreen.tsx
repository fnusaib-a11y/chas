/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { AppState } from '../types';

export default function SupportScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-white p-6 pb-10 flex items-center gap-4 rounded-b-[40px] shadow-sm z-10">
        <button onClick={() => navigate('/profile')} className="p-3 bg-gray-50 rounded-2xl shadow-sm transition-transform active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
           <h2 className="text-xl font-black text-[#37474F] uppercase tracking-tight">Help Center</h2>
           <p className="text-[9px] font-black text-[#FFC107] uppercase tracking-widest">We are here for you 24/7</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase px-1">Contact Channels</h4>
          <div className="grid grid-cols-1 gap-3">
             {[
               { label: 'Live Chat (WhatsApp)', icon: MessageSquare, value: '+880 1XXX-XXXXXX', color: 'text-green-500', path: 'https://chat.whatsapp.com/Bc78xU98gxr81mHNRiDc1P' },
               { label: 'Email Support', icon: Mail, value: 'support@kilagbe.app', color: 'text-blue-500' },
               { label: 'Official Website', icon: Globe, value: 'www.kilagbe.app', color: 'text-[#FFC107]' },
             ].map((channel, i) => (
                <Card key={i} className="p-4 flex items-center justify-between" onClick={() => channel.path && window.open(channel.path)}>
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${channel.color}`}>
                         <channel.icon size={24} />
                      </div>
                      <div>
                         <h5 className="text-[11px] font-black text-[#37474F] uppercase">{channel.label}</h5>
                         <p className="text-[10px] font-bold text-gray-400">{channel.value}</p>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-gray-200" />
                </Card>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase px-1">Common Questions</h4>
          <div className="space-y-2">
            {state.faqs.length > 0 ? state.faqs.sort((a,b) => a.order - b.order).map((faq, i) => (
              <Card key={faq.id} className="p-4 space-y-2 bg-white border border-gray-100 shadow-none">
                <div className="flex justify-between items-center bg-white">
                  <span className="text-xs font-black text-[#064E3B] uppercase tracking-tight">{faq.question}</span>
                  {state.currentUser?.isAdmin && (
                    <Button variant="ghost" className="h-6 text-[10px]" onClick={() => alert('Edit feature coming soon!')}>Edit</Button>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed">{faq.answer}</p>
              </Card>
            )) : (
              [
                'How to withdraw my earnings?',
                'Why is my task still pending?',
                'Referral bonus not received',
                'Account security issues',
              ].map((q, i) => (
                <Card key={i} className="p-4 flex justify-between items-center bg-white border border-gray-100 shadow-none">
                  <span className="text-xs font-bold text-[#37474F]">{q}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#37474F] p-8 rounded-[40px] text-center space-y-4 text-white">
          <p className="text-xs font-bold text-white/50 px-4">Our team typically responds to inquiries within 12-24 hours.</p>
          <Button className="w-full bg-[#FFC107] text-[#37474F]">Submit Ticket</Button>
        </div>
      </div>
    </div>
  );
}
