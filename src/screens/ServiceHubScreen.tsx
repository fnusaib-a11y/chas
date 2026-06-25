/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  MapPin, 
  Star, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Search,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { AppState, ServiceProvider, ServiceBooking } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/UI';
import { dbService } from '../dbService';

export default function ServiceHubScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingData, setBookingData] = useState({ address: '', phone: '', scheduledAt: '' });
  const [isBooking, setIsBooking] = useState(false);

  const categories = [
    { id: 'All', label: 'All Services', icon: Search },
    { id: 'plumber', label: 'Plumbing', icon: Hammer },
    { id: 'electrician', label: 'Electrician', icon: Zap },
    { id: 'cleaner', label: 'Cleaning', icon: Wrench },
    { id: 'repair', label: 'Repair', icon: Hammer },
  ];

  const filteredProviders = state.serviceProviders.filter(p => 
    selectedCategory === 'All' || p.category === selectedCategory
  );

  const providers = filteredProviders;

  const handleBook = async () => {
    if (!state.currentUser || !selectedProvider) return;
    setIsBooking(true);
    await dbService.bookService({
      userId: state.currentUser.id,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      category: selectedProvider.category,
      price: selectedProvider.basePrice,
      status: 'pending',
      address: bookingData.address,
      phone: bookingData.phone,
      scheduledAt: bookingData.scheduledAt || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    setIsBooking(false);
    setSelectedProvider(null);
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-[#1E293B] text-white p-6 pt-12 rounded-b-[40px] shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/10 rounded-2xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic">Service Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Experts at Your Doorstep</p>
          </div>
        </div>

        <div className="flex p-1 bg-white/5 rounded-2xl mb-4">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-[#FFC107] text-[#1E293B] shadow-lg' : 'text-slate-400'}`}
          >
            Find Service
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-[#FFC107] text-[#1E293B] shadow-lg' : 'text-slate-400'}`}
          >
            My Bookings
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'browse' ? (
          <div className="space-y-6">
            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl min-w-[90px] transition-all border-2 ${selectedCategory === cat.id ? 'bg-[#FFC107]/10 border-[#FFC107] text-[#1E293B]' : 'bg-white border-white text-slate-400'}`}
                >
                  <div className={`p-3 rounded-2xl ${selectedCategory === cat.id ? 'bg-[#FFC107] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <cat.icon size={20} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Providers List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-[#FFC107]" />
                Nearby Pros in Dhaka
              </h3>
              
              {providers.map(p => (
                <Card key={p.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all rounded-[32px] bg-white group">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400 font-black text-xl overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`} alt="avatar" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1">
                            {p.name}
                            {p.isVerified && <ShieldCheck size={12} className="text-blue-500" />}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.category} Specialist</span>
                        </div>
                        <div className="bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1">
                           <Star size={10} className="text-[#FFC107] fill-[#FFC107]" />
                           <span className="text-[10px] font-black text-slate-900">{p.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Price</span>
                           <span className="text-sm font-black text-[#1E293B]">৳{p.basePrice}</span>
                        </div>
                        <Button 
                          onClick={() => setSelectedProvider(p)}
                          className="h-9 px-6 rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             {state.serviceBookings.length === 0 ? (
               <div className="py-20 text-center space-y-4 opacity-30">
                  <Clock size={48} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest">No bookings yet</p>
               </div>
             ) : (
               state.serviceBookings.map(b => (
                 <Card key={b.id} className="p-5 rounded-[32px] border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <Badge className={`${
                            b.status === 'completed' ? 'bg-green-100 text-green-600' :
                            b.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          } border-none`}>{b.status}</Badge>
                          <h4 className="font-black text-slate-900 text-sm mt-2">{b.providerName}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{b.category}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-lg font-black text-slate-900">৳{b.price}</span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Paid via Wallet</p>
                       </div>
                    </div>
                    <div className="space-y-2 border-t border-slate-50 pt-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <MapPin size={12} /> {b.address}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Clock size={12} /> {new Date(b.scheduledAt).toLocaleString()}
                       </div>
                    </div>
                 </Card>
               ))
             )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal 
        isOpen={!!selectedProvider} 
        onClose={() => setSelectedProvider(null)}
        title={`Book ${selectedProvider?.name}`}
      >
        <div className="space-y-4 py-4">
           <Input 
             label="Service Address" 
             placeholder="Where should they come?"
             value={bookingData.address}
             onChange={(v) => setBookingData({...bookingData, address: v})}
           />
           <Input 
             label="Contact Number" 
             placeholder="Their rider will call here"
             value={bookingData.phone}
             onChange={(v) => setBookingData({...bookingData, phone: v})}
           />
           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Schedule Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold outline-none h-[52px]"
                onChange={(e) => setBookingData({...bookingData, scheduledAt: e.target.value})}
              />
           </div>

           <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Base Fee</span>
                 <span>৳{selectedProvider?.basePrice}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-2 border-t border-slate-200">
                 <span>Total Payable</span>
                 <span>৳{selectedProvider?.basePrice}</span>
              </div>
           </div>

           <Button 
             className="w-full h-14 bg-[#1E293B] text-[#FFC107]"
             onClick={handleBook}
             isLoading={isBooking}
           >
             Confirm Booking
           </Button>
        </div>
      </Modal>
    </div>
  );
}
