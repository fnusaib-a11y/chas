/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Share2, Settings, Palette, Music, Zap, TrendingUp, Users, Heart, ArrowLeft, Plus, Save, Sparkles, Layout } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { AppState, SellerShop } from '../types';
import { dbService } from '../dbService';

export default function VirtualShopScreen({ state }: { state: AppState }) {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const currentUser = state.currentUser!;
  const isOwner = !sellerId || sellerId === currentUser.id;

  const shop = state.sellerShops?.find(s => (sellerId ? s.id === sellerId : s.userId === currentUser.id));
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SellerShop>>(shop || {
    name: `${currentUser.name}'s Boutique`,
    theme: 'modern',
    isMusicEnabled: false,
    isAnimated: true,
    description: 'Welcome to my virtual luxury boutique!'
  });

  const handleSave = async () => {
    await dbService.updateSellerShop(currentUser.id, {
      ...formData,
      userId: currentUser.id,
      followersCount: shop?.followersCount || 0,
      totalSales: shop?.totalSales || 0,
      products: shop?.products || []
    } as any);
    setEditing(false);
  };

  if (!shop && !isOwner) return <div className="p-12 text-center font-black uppercase text-gray-300">Shop not found</div>;

  const themes = {
    modern: 'bg-white text-gray-900 border-gray-100',
    retro: 'bg-amber-50 text-amber-900 border-amber-200 font-serif',
    neon: 'bg-black text-pink-500 border-pink-500/50',
    glass: 'bg-white/30 backdrop-blur-3xl text-white border-white/40'
  };

  const getThemeClass = (theme: SellerShop['theme']) => themes[theme] || themes.modern;

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getThemeClass(formData.theme as any).split(' ')[0]}`}>
      {/* 3D-ish Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
         <motion.div 
           animate={{ 
             rotate: 360,
             scale: [1, 1.2, 1],
           }}
           transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
           className={`absolute -top-1/4 -right-1/4 w-full aspect-square rounded-full blur-[120px] ${formData.theme === 'neon' ? 'bg-pink-500' : 'bg-[#FFC107]'}`}
         />
         <motion.div 
           animate={{ 
             y: [0, 100, 0],
             x: [0, -50, 0]
           }}
           transition={{ duration: 15, repeat: Infinity }}
           className={`absolute -bottom-1/4 -left-1/4 w-full aspect-square rounded-full blur-[120px] ${formData.theme === 'neon' ? 'bg-cyan-500' : 'bg-indigo-500'}`}
         />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center bg-black/5 backdrop-blur-md sticky top-0 border-b border-black/5">
         <button onClick={() => navigate(-1)} className="p-3 bg-white/20 rounded-2xl text-current hover:scale-110 transition-transform">
           <ArrowLeft size={20} />
         </button>
         <h1 className="text-sm font-black uppercase tracking-[0.2em]">{editing ? 'Decorate Your Shop' : shop?.name}</h1>
         {isOwner ? (
            <button onClick={() => setEditing(!editing)} className="p-3 bg-[#FFC107] text-[#37474F] rounded-2xl shadow-xl shadow-orange-200 animate-bounce">
              {editing ? <Save size={20} onClick={handleSave} /> : <Palette size={20} />}
            </button>
         ) : (
            <button onClick={() => dbService.toggleFollow(currentUser.id, sellerId!)} className="px-6 h-12 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200">
               {state.followers?.find(f => f.followingId === sellerId) ? 'Following' : 'Follow Store'}
            </button>
         )}
      </div>

      <div className="relative z-10 p-6 space-y-8 pb-32 max-w-lg mx-auto">
         {/* Shop Banner / Visual Area */}
         <motion.div layout className="relative h-60 w-full rounded-[48px] overflow-hidden shadow-2xl group">
            <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${
              formData.theme === 'neon' ? 'from-pink-500 to-purple-900' : 
              formData.theme === 'retro' ? 'from-amber-200 to-orange-400' : 
              'from-gray-100 to-gray-300'
            }`} />
            
            {/* Animated Particles or Emojis specific to theme */}
            <AnimatePresence>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2], 
                    scale: [1, 1.5, 1],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200
                  }}
                  transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2"
                >
                   {formData.theme === 'neon' ? <Zap className="text-cyan-300 opacity-30" size={12} /> : 
                    formData.theme === 'retro' ? <Star className="text-[#FFC107] opacity-30" size={12} /> : 
                    <Sparkles className="text-white opacity-40" size={12} />}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
               <motion.div 
                 animate={{ scale: [1, 1.05, 1] }} 
                 transition={{ duration: 3, repeat: Infinity, type: 'tween' }}
                 className="w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-[32px] p-1 shadow-2xl border-2 border-white/50"
               >
                  <img 
                    src={shop?.banner || `https://api.dicebear.com/7.x/shapes/svg?seed=${sellerId || currentUser.id}`} 
                    className="w-full h-full object-cover rounded-[28px]" 
                  />
               </motion.div>
               <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-widest text-current">{formData.name}</h2>
                  <p className="text-[10px] font-bold opacity-60 uppercase">{formData.description}</p>
               </div>
            </div>

            {/* Social Stats */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
               <div className="flex gap-4">
                  <div className="text-center">
                     <p className="text-[10px] font-black text-white">{shop?.followersCount || 0}</p>
                     <p className="text-[6px] font-black text-white/50 uppercase tracking-widest">Followers</p>
                  </div>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <div className="text-center">
                     <p className="text-[10px] font-black text-white">{shop?.totalSales || 0}</p>
                     <p className="text-[6px] font-black text-white/50 uppercase tracking-widest">Sales</p>
                  </div>
               </div>
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border border-white bg-gray-200" />
                  ))}
               </div>
            </div>
         </motion.div>

         {/* Decorator Panel */}
         {editing && (
           <Card className="p-8 border-none shadow-2xl space-y-6 bg-white/80 backdrop-blur-xl">
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Palette size={16} /> Appearance Settings
                 </h3>
                 <div className="grid grid-cols-4 gap-2">
                    {Object.keys(themes).map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({ ...formData, theme: t as any })}
                        className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all capitalize text-[10px] font-black ${
                          formData.theme === t ? 'border-[#FFC107] bg-[#FFC107]/10' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                         {t}
                      </button>
                    ))}
                 </div>
              </div>

              <Input label="Shop Title" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
              <Input label="Mini Bio" value={formData.description} onChange={(v: string) => setFormData({ ...formData, description: v })} />

              <div className="flex justify-between items-center py-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                      <Music size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Shop Music</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Enable Background Music</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setFormData({ ...formData, isMusicEnabled: !formData.isMusicEnabled })}
                   className={`w-12 h-6 rounded-full transition-colors relative ${formData.isMusicEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isMusicEnabled ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="flex justify-between items-center py-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                      <Zap size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Animations</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Virtual Effects</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setFormData({ ...formData, isAnimated: !formData.isAnimated })}
                   className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAnimated ? 'bg-green-500' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isAnimated ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
           </Card>
         )}

         {/* Product Grid */}
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <ShoppingBag size={18} /> Best Sellers
               </h3>
               {isOwner && (
                 <button onClick={() => navigate('/products')} className="text-[10px] font-black text-[#FFC107] uppercase">View All</button>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {state.products
                 .filter(p => {
                    const isProductOwner = p.sellerId === (sellerId || currentUser.id);
                    if (isOwner) return p.sellerId === currentUser.id;
                    return (p.status === 'approved') && (!shop?.products || shop.products.includes(p.id));
                 })
                 .slice(0, 4)
                 .map((product, i) => (
                 <motion.div 
                   key={product.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   onClick={() => navigate(`/shop/product/${product.id}`)}
                   className={`relative bg-white/5 backdrop-blur-xl border border-white/20 p-3 rounded-[32px] space-y-3 cursor-pointer group hover:scale-[1.05] transition-all ${
                     isOwner && product.status === 'pending' ? 'opacity-70 grayscale-[0.5]' : 
                     isOwner && product.status === 'rejected' ? 'bg-red-500/10' : ''
                   }`}
                 >
                    <div className="aspect-square rounded-[24px] overflow-hidden bg-gray-100 relative">
                       <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       {isOwner && product.status !== 'approved' && (
                         <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[7px] font-black uppercase text-white shadow-lg ${
                            product.status === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-red-600'
                         }`}>
                           {product.status}
                         </div>
                       )}
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-[10px] font-black uppercase truncate text-current">{product.name}</h4>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-green-500">৳{product.price}</span>
                          <div className="w-6 h-6 bg-current opacity-10 rounded-lg flex items-center justify-center group-hover:opacity-100 transition-opacity">
                             <Plus size={12} className="text-white" />
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
               
               {isOwner && (
                 <button 
                   onClick={() => navigate('/my-shop/add-product')}
                   className="aspect-square rounded-[32px] border-4 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-[#FFC107] hover:border-[#FFC107]/50 transition-all"
                 >
                    <Plus size={32} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Add Product</span>
                 </button>
               )}
            </div>
         </div>

         {/* Featured Deal Card */}
         <Card className="p-8 bg-gradient-to-br from-[#37474F] to-black rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#FFC107]/20 transition-all" />
            <div className="space-y-6">
               <div className="inline-flex h-8 px-4 items-center bg-[#FFC107] text-[#37474F] text-[8px] font-black uppercase tracking-widest rounded-full">
                  Elite Shop Drop
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white leading-tight uppercase">Special 70% Discount Event</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Limited to first 50 customers from this shop.</p>
               </div>
               <Button className="w-full h-14 bg-white text-[#37474F] rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl group-hover:scale-95 transition-transform">
                  Claim Seat Now
               </Button>
            </div>
         </Card>
      </div>
      
      {/* Footer Navigation */}
      {!editing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-around px-8 z-50">
           <button className="text-[#FFC107] flex flex-col items-center gap-1">
              <Layout size={20} />
              <span className="text-[6px] font-black uppercase tracking-widest">Shop</span>
           </button>
           <button className="text-white/40 flex flex-col items-center gap-1">
              <Users size={20} />
              <span className="text-[6px] font-black uppercase tracking-widest">Reviews</span>
           </button>
           <button className="text-white/40 flex flex-col items-center gap-1">
              <Share2 size={20} />
              <span className="text-[6px] font-black uppercase tracking-widest">Share</span>
           </button>
        </div>
      )}
    </div>
  );
}
