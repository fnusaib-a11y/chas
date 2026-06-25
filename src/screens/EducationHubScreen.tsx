/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Search, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  Download,
  Filter,
  Layers,
  Sparkles,
  Trophy,
  History,
  ChevronRight
} from 'lucide-react';
import { AppState, StudentResource, MCQSet } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/UI';
import { dbService } from '../dbService';

export default function EducationHubScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'market' | 'mcq' | 'my-stuff'>('market');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('All');

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    price: '0',
    type: 'Note' as 'Note' | 'PDF' | 'Book' | 'Question',
    category: 'Science'
  });

  const categories = ['Science', 'Commerce', 'Arts', 'IT', 'General'];

  const filteredResources = state.studentResources.filter(r => 
    selectedTopic === 'All' || r.category === selectedTopic
  );

  const handleUpload = async () => {
    if (!state.currentUser) return;
    setIsSubmitting(true);
    await dbService.uploadResource({
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      title: uploadData.title,
      description: uploadData.description,
      type: uploadData.type,
      category: uploadData.category,
      price: parseFloat(uploadData.price),
      url: 'https://example.com/demo.pdf', // Mock URL
      previewUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4bbecbb?w=400',
      createdAt: new Date().toISOString()
    });
    setIsSubmitting(false);
    setIsUploadModalOpen(false);
    setActiveTab('my-stuff');
  };

  const handleBuy = async (resource: StudentResource) => {
    if (!state.currentUser) return;
    if (state.currentUser.balance < resource.price) {
      alert('Insufficient balance!');
      return;
    }
    if (confirm(`Buy "${resource.title}" for ৳${resource.price}?`)) {
      await dbService.buyResource(resource.id, state.currentUser.id, resource.price);
      alert('Purchased successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-[#4F46E5] p-8 pt-16 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                <ArrowLeft size={20} />
              </button>
              <div>
                 <h1 className="text-3xl font-black text-white italic tracking-tight">Student Helper</h1>
                 <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-[0.2em]">Knowledge Hub for All</p>
              </div>
           </div>
           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
              <GraduationCap size={24} />
           </div>
        </div>
      </div>

      <div className="p-6 -mt-8">
         {/* Tabs Navigation */}
         <div className="flex p-1.5 bg-white rounded-3xl shadow-lg mb-8">
            {[
              { id: 'market', label: 'Market', icon: BookOpen },
              { id: 'mcq', label: 'Practice', icon: CheckCircle2 },
              { id: 'my-stuff', label: 'Library', icon: History }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${activeTab === t.id ? 'bg-[#4F46E5] text-white shadow-lg' : 'text-slate-400 font-bold text-xs'}`}
              >
                <t.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.id === activeTab ? t.label : ''}</span>
              </button>
            ))}
         </div>

         {activeTab === 'market' && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Resource Market</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy or Sell study materials</p>
                 </div>
                 <Button onClick={() => setIsUploadModalOpen(true)} className="h-12 w-12 p-0 rounded-2xl bg-indigo-500 shadow-indigo-200">
                    <Upload size={20} />
                 </Button>
              </div>

              {/* Topics Scroll */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                 {['All', ...categories].map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedTopic(cat)}
                     className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedTopic === cat ? 'bg-indigo-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>

              {/* Resources List */}
              <div className="grid grid-cols-2 gap-4">
                 {filteredResources.map(r => (
                   <Card key={r.id} className="p-0 rounded-[32px] overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-white group">
                      <div className="relative h-32 overflow-hidden">
                         <img src={r.previewUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 backdrop-blur-md text-indigo-600 border-none px-3 py-1 text-[8px] font-black">{r.type}</Badge>
                         </div>
                      </div>
                      <div className="p-4 space-y-3">
                         <h4 className="font-black text-slate-800 text-xs line-clamp-1">{r.title}</h4>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                               <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[7px] font-black text-slate-400">{r.userName[0]}</div>
                               <span className="text-[8px] font-bold text-slate-400 truncate max-w-[50px]">{r.userName}</span>
                            </div>
                            <span className="text-xs font-black text-indigo-600">৳{r.price}</span>
                         </div>
                         <Button 
                           variant="outline" 
                           className="w-full h-9 rounded-xl border-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[8px] font-black uppercase"
                           onClick={() => handleBuy(r)}
                         >
                            Buy & Access
                         </Button>
                      </div>
                   </Card>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'mcq' && (
           <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-6">
                    <Trophy className="w-24 h-24 text-yellow-500/20 -mr-4 -mt-4 animate-bounce" />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <Badge className="bg-yellow-500 text-slate-900 border-none font-black px-4">PREMIUM</Badge>
                    <h3 className="text-2xl font-black italic">Daily Quiz Arena</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Win up to ৳500 every day by topping the BCS & Admission leaderboard.</p>
                    <Button className="bg-white text-slate-900 rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-white/10">Start Challenge</Button>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-indigo-500" />
                    Practice Categories
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                    {state.mcqSets.map(set => {
                      const Icon = GraduationCap;
                      return (
                        <Card key={set.id} className="p-4 rounded-[28px] border-none shadow-sm flex items-center gap-4 bg-white hover:translate-x-2 transition-transform">
                           <div className="text-indigo-500 bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                              <Icon size={24} />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-black text-slate-800">{set.title}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{set.subject} • {set.questions.length} Qs</p>
                           </div>
                           <ChevronRight size={18} className="text-slate-300" />
                        </Card>
                      )
                    })}
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'my-stuff' && (
           <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">My Library</h3>
              {state.resourcesOwned.length === 0 ? (
                <div className="py-20 text-center space-y-6 opacity-20">
                   <div className="p-10 bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                     <BookOpen size={48} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Your collection is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                   {state.resourcesOwned.map(rId => {
                     const r = state.studentResources.find(x => x.id === rId);
                     if (!r) return null;
                     return (
                        <Card key={r.id} className="p-4 rounded-3xl border-none shadow-sm flex items-center gap-4 bg-indigo-50/50">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                              <FileText size={20} />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-black text-slate-800">{r.title}</h4>
                              <p className="text-[10px] font-bold text-indigo-300 uppercase">{r.category} • Purchased</p>
                           </div>
                           <Button variant="ghost" className="text-indigo-600"><Download size={20} /></Button>
                        </Card>
                     );
                   })}
                </div>
              )}
           </div>
         )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Share Study Material">
         <div className="space-y-4 py-4">
            <Input 
              label="Resource Title" 
              placeholder="e.g. Physics 1st Paper Notes"
              value={uploadData.title}
              onChange={(v) => setUploadData({...uploadData, title: v})}
            />
            <Input 
              label="Short Description" 
              placeholder="What is inside this file?"
              value={uploadData.description}
              onChange={(v) => setUploadData({...uploadData, description: v})}
            />
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Type</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                    value={uploadData.type}
                    onChange={(e) => setUploadData({...uploadData, type: e.target.value as any})}
                  >
                     <option>Note</option>
                     <option>PDF</option>
                     <option>Book</option>
                     <option>Question</option>
                  </select>
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Topic</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  >
                     {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
            </div>
            <Input 
              label="Selling Price (৳)" 
              type="number"
              placeholder="0 for free"
              value={uploadData.price}
              onChange={(v) => setUploadData({...uploadData, price: v})}
            />
            <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center gap-3 text-center">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                  <Upload size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-800">Choose File</p>
                  <p className="text-[8px] font-bold text-slate-400 px-4">PDF, JPG, or PNG (Max 10MB)</p>
               </div>
            </div>
            <Button 
               className="w-full h-16 bg-indigo-600 text-white rounded-[24px]"
               onClick={handleUpload}
               isLoading={isSubmitting}
            >
               Upload & Publish
            </Button>
         </div>
      </Modal>
    </div>
  );
}

// Simple placeholder for missing icon
const trophyIcon = Trophy;
