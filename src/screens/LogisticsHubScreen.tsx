/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  Search, 
  History, 
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AppState, CourierOrder } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/UI';
import { dbService } from '../dbService';

export default function LogisticsHubScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    senderAddress: '',
    receiverAddress: '',
    weight: '1',
    itemType: 'Document'
  });

  const handleCreateOrder = async () => {
    if (!state.currentUser) return;
    setIsSubmitting(true);
    
    const price = parseInt(formData.weight) * 50 + 50; // Simple calculation

    await dbService.createCourierOrder({
      userId: state.currentUser.id,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      pickupAddress: formData.senderAddress,
      deliveryAddress: formData.receiverAddress,
      weight: parseFloat(formData.weight),
      price,
      status: 'pending',
      trackingId: 'TRK' + Math.random().toString(36).substring(7).toUpperCase(),
      createdAt: new Date().toISOString()
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      {/* Header */}
      <div className="bg-[#3B82F6] p-8 pt-16 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
              <ArrowLeft size={20} />
            </button>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-white">
              <History size={20} onClick={() => setActiveTab('history')} />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white italic tracking-tight">Logistics Hub</h1>
          <p className="text-blue-100 font-bold text-xs mt-1 uppercase tracking-widest">Connect Bangladesh, Faster.</p>
        </div>
      </div>

      <div className="p-6 -mt-10 overflow-hidden">
         {/* Live Stats Row */}
         <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2">
            {[
              { label: 'Active Riders', val: '2,490', icon: Navigation, col: 'bg-green-500' },
              { label: 'Delivered Today', val: '15.2k', icon: Package, col: 'bg-orange-500' },
              { label: 'Avg Speed', val: '45m', icon: TrendingUp, col: 'bg-blue-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-[28px] shadow-sm min-w-[140px] border border-slate-100">
                 <div className={`${s.col} w-8 h-8 rounded-xl flex items-center justify-center mb-3`}>
                    <s.icon size={14} className="text-white" />
                 </div>
                 <h4 className="text-lg font-black text-slate-800">{s.val}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
              </div>
            ))}
         </div>

         {activeTab === 'create' ? (
           <div className="space-y-6">
              <Card className="p-8 rounded-[40px] border-none shadow-xl bg-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6">
                    <Truck className="text-blue-50 opacity-20 w-32 h-32 -mr-10 -mt-10" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black text-slate-900">Send a Parcel</h2>
                       <p className="text-xs font-bold text-slate-400">Get your items delivered across the city instantly.</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}>
                          <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center">
                             <Plus size={24} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Post New Order</h4>
                             <p className="text-[10px] font-bold text-slate-400">Doorstep pickup & live tracking</p>
                          </div>
                          <ArrowRight className="ml-auto text-slate-300" size={18} />
                       </div>

                       <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border-2 border-transparent">
                          <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center">
                             <Search size={22} />
                          </div>
                          <div className="flex-1">
                             <input 
                               placeholder="ENTER TRACKING ID"
                               className="w-full bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest outline-none placeholder:text-slate-300"
                             />
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Promo Section */}
              <div className="bg-slate-900 rounded-[40px] p-8 text-white flex items-center justify-between">
                 <div className="space-y-2">
                    <Badge className="bg-blue-500 text-white border-none font-black px-3">20% OFF</Badge>
                    <h3 className="text-xl font-black italic">Business Panel</h3>
                    <p className="text-[10px] font-bold text-slate-400">Scale your delivery with CASH Logistics</p>
                 </div>
                 <Button className="bg-white text-slate-900 rounded-2xl font-black h-12 px-6">Apply</Button>
              </div>
           </div>
         ) : (
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Order History</h2>
                 <button onClick={() => setActiveTab('create')} className="text-xs font-black text-blue-500 uppercase">New Order</button>
              </div>
              {state.courierOrders.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-20">
                   <Truck size={64} className="mx-auto" />
                   <p className="text-xs font-black uppercase tracking-widest">No orders found</p>
                </div>
              ) : (
                state.courierOrders.map(order => (
                  <Card key={order.id} className="p-6 rounded-[32px] border-none shadow-sm bg-white">
                     <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                           <Badge className={`${
                             order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                             order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                             'bg-blue-100 text-blue-600'
                           } border-none`}>{order.status}</Badge>
                           <h4 className="font-black text-slate-900 text-sm">{order.recipientName}</h4>
                           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{order.trackingId}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-lg font-black text-slate-900">৳{order.price}</span>
                           <p className="text-[8px] font-bold text-slate-400 uppercase">{order.weight}kg Parcel</p>
                        </div>
                     </div>
                     <div className="space-y-4 border-t border-slate-50 pt-6">
                        <div className="flex items-start gap-4">
                           <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <div className="w-0.5 h-8 bg-slate-100" />
                              <div className="w-2 h-2 rounded-full bg-slate-300" />
                           </div>
                           <div className="space-y-4 -mt-1">
                              <div className="space-y-0.5">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Pickup</p>
                                 <p className="text-[10px] font-bold text-slate-600">{order.pickupAddress}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Delivery</p>
                                 <p className="text-[10px] font-bold text-slate-600">{order.deliveryAddress}</p>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 text-[10px] font-black text-slate-400 uppercase">
                           <Clock size={12} /> Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                     </div>
                  </Card>
                ))
              )}
           </div>
         )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Delivery Order">
         <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
               <Input 
                 label="Recipient Name" 
                 placeholder="John Doe"
                 value={formData.recipientName}
                 onChange={(v) => setFormData({...formData, recipientName: v})}
               />
               <Input 
                 label="Recipient Phone" 
                 placeholder="017..."
                 value={formData.recipientPhone}
                 onChange={(v) => setFormData({...formData, recipientPhone: v})}
               />
            </div>
            
            <Input 
              label="Pickup Address" 
              placeholder="Your full address"
              value={formData.senderAddress}
              onChange={(v) => setFormData({...formData, senderAddress: v})}
            />
            
            <Input 
              label="Delivery Address" 
              placeholder="Destination address"
              value={formData.receiverAddress}
              onChange={(v) => setFormData({...formData, receiverAddress: v})}
            />

            <div className="grid grid-cols-2 gap-4">
               <Input 
                 label="Weight (kg)" 
                 type="number"
                 value={formData.weight}
                 onChange={(v) => setFormData({...formData, weight: v})}
               />
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Parcel Type</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                    value={formData.itemType}
                    onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                  >
                     <option>Document</option>
                     <option>Electronics</option>
                     <option>Clothing</option>
                     <option>Fragile</option>
                  </select>
               </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[32px] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-blue-900 uppercase">Estimated Fare</p>
                     <p className="text-xl font-black text-blue-900">৳{parseInt(formData.weight) * 50 + 50}</p>
                  </div>
               </div>
               <span className="text-[10px] font-bold text-blue-400">Paid from balance</span>
            </div>

            <Button 
               className="w-full h-16 bg-blue-600 text-white rounded-[24px] shadow-lg shadow-blue-200"
               onClick={handleCreateOrder}
               isLoading={isSubmitting}
            >
               Confirm & Book Rider
            </Button>
         </div>
      </Modal>
    </div>
  );
}
