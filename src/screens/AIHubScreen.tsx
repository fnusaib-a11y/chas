/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Zap, 
  MoreHorizontal, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Plus,
  Cpu,
  History as HistoryIcon
} from 'lucide-react';
import { AppState, AIAsset } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/UI';
import { dbService } from '../dbService';
import { GoogleGenAI } from "@google/genai";

export default function AIHubScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'market' | 'requests'>('create');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('Caption');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [assetForm, setAssetForm] = useState({
    title: '',
    price: '10',
    type: 'Model' as any
  });

  const aiTypes = [
    { id: 'Caption', label: 'Caption', icon: FileText, desc: 'Hooky social media captions', color: 'bg-blue-50 text-blue-500' },
    { id: 'Logo', label: 'Logo Idea', icon: ImageIcon, desc: 'Creative logo concepts', color: 'bg-purple-50 text-purple-500' },
    { id: 'Idea', label: 'Business AI', icon: Zap, desc: 'Niche business ideas', color: 'bg-yellow-50 text-yellow-500' },
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const apiKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `As an AI creator for CASH Ecosystem, generate a ${selectedType} for the following request: "${prompt}". Keep it professional and creative.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptText
      });

      const text = response.text || "No response generated.";
      setGeneratedResult(text);
      
      // Save request to DB
      if (state.currentUser) {
        await dbService.requestAIContent({
          userId: state.currentUser.id,
          prompt,
          type: selectedType as any,
          result: text,
          status: 'completed',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
      setGeneratedResult("AI is sleeping right now. Please try again later!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSellAsset = async () => {
    if (!state.currentUser) return;
    await dbService.sellAIAsset({
      ownerId: state.currentUser.id,
      ownerName: state.currentUser.name,
      title: assetForm.title,
      type: assetForm.type,
      price: parseFloat(assetForm.price),
      previewUrl: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?w=400',
      description: 'Handcrafted AI model/asset for creators.',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(false);
    setActiveTab('market');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 pb-24">
      {/* Dynamic Header */}
      <div className="relative h-72 overflow-hidden flex flex-col justify-end p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#1E293B]/50 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800')] bg-cover bg-center brightness-50" />
        
        <div className="relative z-20 space-y-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-black italic text-white">AI Studio</h1>
                <Badge className="bg-blue-500/20 text-blue-400 border-none px-2 py-0.5 text-[8px] font-black uppercase">v2.0 Beta</Badge>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Harness the power of Gemini</p>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'create', label: 'Generator', icon: Sparkles },
              { id: 'market', label: 'AI Assets', icon: ShoppingBag },
              { id: 'requests', label: 'History', icon: HistoryIcon }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#FFC107] text-[#0F172A] scale-105 shadow-xl shadow-yellow-500/20' : 'bg-white/5 border border-white/10 text-slate-400'}`}
              >
                <t.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'create' && (
          <div className="space-y-8">
            {/* Tool Selection */}
            <div className="grid grid-cols-3 gap-3">
               {aiTypes.map(type => (
                 <button 
                   key={type.id}
                   onClick={() => setSelectedType(type.id)}
                   className={`p-4 rounded-[32px] flex flex-col items-center gap-2 transition-all border-2 ${selectedType === type.id ? 'bg-white/10 border-[#FFC107] scale-95' : 'bg-white/5 border-transparent opacity-60'}`}
                 >
                   <div className={`${type.color} p-3 rounded-2xl`}>
                      <type.icon size={20} />
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-center">{type.label}</span>
                 </button>
               ))}
            </div>

            {/* Prompt Card */}
            <Card className="bg-white/5 border-white/10 p-8 rounded-[40px] space-y-6">
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-yellow-500">
                    <Sparkles size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider">Describe your vision</h3>
                 </div>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder={`What kind of ${selectedType} do you need?`}
                   className="w-full h-32 bg-white/10 border-none rounded-3xl p-6 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#FFC107] placeholder:text-slate-600 resize-none transition-all"
                 />
               </div>

               <Button 
                 onClick={handleGenerate} 
                 disabled={!prompt || isGenerating}
                 className="w-full h-16 bg-[#FFC107] text-[#0F172A] rounded-3xl shadow-2xl shadow-yellow-500/10 flex items-center justify-center gap-3 active:scale-95 transition-all"
               >
                 {isGenerating ? (
                   <>
                     <Loader2 size={24} className="animate-spin" />
                     <span className="font-black uppercase tracking-widest">Generating...</span>
                   </>
                 ) : (
                   <>
                     <Send size={20} />
                     <span className="font-black uppercase tracking-widest">Generate with Gemini</span>
                   </>
                 )}
               </Button>
            </Card>

            {/* Result area */}
            {generatedResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 border border-white/5 p-8 rounded-[40px] space-y-4"
              >
                  <div className="flex items-center justify-between">
                     <Badge className="bg-green-500/20 text-green-400 border-none">Success</Badge>
                     <button onClick={() => setGeneratedResult(null)} className="text-[10px] font-black text-slate-500 uppercase">Clear</button>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">{generatedResult}</p>
                  <div className="flex gap-2 pt-4">
                     <Button variant="ghost" className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 h-12">Copy Text</Button>
                     <Button variant="ghost" className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 h-12">Share</Button>
                  </div>
              </motion.div>
            )}

            {!generatedResult && !isGenerating && (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-[40px] text-center space-y-3">
                 <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-slate-700 mx-auto">
                    <Cpu size={32} />
                 </div>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Results will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white italic">Asset Laboratory</h2>
                <Button onClick={() => setIsModalOpen(true)} className="h-10 px-4 rounded-xl bg-blue-500 text-white text-[10px] font-black tracking-widest">
                   + NEW ASSET
                </Button>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {state.aiAssets.map(asset => (
                  <Card key={asset.id} className="p-0 rounded-[32px] overflow-hidden bg-white/5 border-white/10 group">
                      <div className="h-40 overflow-hidden relative">
                         <img src={asset.previewUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent opacity-60" />
                         <div className="absolute bottom-3 left-3">
                            <Badge className="bg-white/10 backdrop-blur-md text-white border-none text-[8px] font-black">{asset.type}</Badge>
                         </div>
                      </div>
                      <div className="p-4 space-y-2">
                         <h4 className="text-sm font-black text-white line-clamp-1">{asset.title}</h4>
                         <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">৳{asset.price}</span>
                            <Button className="h-8 rounded-lg bg-white/10 text-white border-none text-[8px] font-black">BUY</Button>
                         </div>
                      </div>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'requests' && (
           <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Past Generations</h3>
              {state.aiRequests.length === 0 ? (
                <div className="py-20 text-center opacity-10">
                   <FileText size={64} className="mx-auto" />
                   <p className="text-xs font-black uppercase tracking-widest mt-4">History empty</p>
                </div>
              ) : (
                state.aiRequests.map(req => (
                  <Card key={req.id} className="p-5 bg-white/5 border-white/10 rounded-3xl space-y-3">
                     <div className="flex justify-between items-start">
                        <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px]">{req.type}</Badge>
                        <span className="text-[8px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-xs font-bold text-slate-400 line-clamp-2 italic">"{req.prompt}"</p>
                     <div className="p-4 bg-black/30 rounded-2xl text-[10px] font-medium text-slate-300 line-clamp-3">
                        {req.result}
                     </div>
                  </Card>
                ))
              )}
           </div>
        )}
      </div>

      {/* Sell Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sell AI Asset">
         <div className="space-y-4 py-4">
            <Input 
              label="Asset Title" 
              placeholder="e.g. Master Prompt for Logo"
              value={assetForm.title}
              onChange={(v) => setAssetForm({...assetForm, title: v})}
            />
            <div className="grid grid-cols-2 gap-4">
               <Input 
                 label="Price (৳)" 
                 type="number"
                 value={assetForm.price}
                 onChange={(v) => setAssetForm({...assetForm, price: v})}
               />
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Type</label>
                  <select 
                    className="w-full bg-[#1E293B] border-none rounded-2xl p-4 text-xs font-bold text-white h-[52px]"
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({...assetForm, type: e.target.value as any})}
                  >
                     <option>Model</option>
                     <option>Prompt</option>
                     <option>Art</option>
                  </select>
               </div>
            </div>
            <div className="p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center gap-2">
               <ImageIcon className="text-slate-600" />
               <p className="text-[8px] font-black text-slate-500 uppercase">Upload Preview Image</p>
            </div>
            <Button 
               className="w-full h-16 bg-blue-500 text-white rounded-[24px]"
               onClick={handleSellAsset}
            >
               List in Lab
            </Button>
         </div>
      </Modal>
    </div>
  );
}

