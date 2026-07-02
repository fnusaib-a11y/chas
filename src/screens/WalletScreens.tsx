/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wallet, ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Landmark, PhoneOutgoing, ChevronRight, Shield, ShieldCheck, ShieldAlert, FileText, UserCheck, Lock, Camera, Upload, Check, ChevronLeft, MapPin, Calendar, HelpCircle } from 'lucide-react';
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
                  <h3 className="text-4xl font-black text-[#37474F]">{user.balance.toFixed(0)} <span className="text-lg font-bold">Coins</span></h3>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-[#FFC107] tracking-widest mb-1">Pending</p>
                  <h4 className="text-xl font-black text-[#FFC107]">{user.pendingBalance.toFixed(0)} <span className="text-xs font-bold">Coins</span></h4>
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
                 <p className="text-[9px] font-bold text-amber-700/80 uppercase">উইথড্র করতে KYC সম্পন্ন করুন</p>
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

  // KYC States (New Multi-step Wizard)
  const [kycStep, setKycStep] = useState(1);
  const [kycFullName, setKycFullName] = useState(user.kycFullName || '');
  const [kycDob, setKycDob] = useState(user.kycDob || '');
  const [kycPhone, setKycPhone] = useState(user.kycPhone || user.phone || '');
  const [kycEmail, setKycEmail] = useState(user.kycEmail || '');
  const [kycAddress, setKycAddress] = useState(user.kycAddress || '');

  const [kycDocType, setKycDocType] = useState(user.kycDocType || 'NID');
  const [kycFrontImage, setKycFrontImage] = useState(user.kycFrontImage || '');
  const [kycBackImage, setKycBackImage] = useState(user.kycBackImage || '');
  const [kycSelfie, setKycSelfie] = useState(user.kycSelfie || '');

  const [kycPaymentNumber, setKycPaymentNumber] = useState(user.kycPaymentNumber || '');
  const [kycPaymentNumberConfirmed, setKycPaymentNumberConfirmed] = useState(user.kycPaymentNumberConfirmed || false);
  const [kycDeclarationAccepted, setKycDeclarationAccepted] = useState(user.kycDeclarationAccepted || false);

  const [submittingKyc, setSubmittingKyc] = useState(false);

  const handleWithdraw = async () => {
    const minVal = state.settings.minWithdrawal || 50;
    const val = parseFloat(amount);
    if (!val || val < minVal) {
      alert(`নূন্যতম উইথড্র পরিমাণ হচ্ছে ${minVal} কয়েন`);
      return;
    }
    if (val > (state.currentUser?.balance || 0)) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
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
    if (!kycFullName.trim()) {
      alert('দয়া করে পুরো নাম লিখুন।');
      return;
    }
    if (!kycDob) {
      alert('দয়া করে জন্ম তারিখ সিলেক্ট করুন।');
      return;
    }
    if (!kycPhone.trim()) {
      alert('দয়া করে মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!kycAddress.trim()) {
      alert('দয়া করে বর্তমান ঠিকানা লিখুন।');
      return;
    }
    if (!kycFrontImage || !kycBackImage) {
      alert('দয়া করে পরিচয়পত্রের সামনের ও পেছনের ছবি আপলোড করুন।');
      return;
    }
    if (!kycSelfie) {
      alert('দয়া করে আপনার সেলফি আপলোড করুন।');
      return;
    }
    if (!kycPaymentNumber.trim()) {
      alert('দয়া করে পেমেন্ট নম্বর লিখুন।');
      return;
    }
    if (!kycPaymentNumberConfirmed) {
      alert('দয়া করে পেমেন্ট নম্বর আপনার নিজের কিনা তা নিশ্চিত করুন।');
      return;
    }
    if (!kycDeclarationAccepted) {
      alert('দয়া করে ঘোষণাপত্রটি টিক দিয়ে সম্মতি প্রদান করুন।');
      return;
    }

    setSubmittingKyc(true);
    try {
      await dbService.updateCurrentUser({
        kycStatus: 'pending',
        kycFullName,
        kycDob,
        kycPhone,
        kycEmail,
        kycAddress,
        kycDocType,
        kycFrontImage,
        kycBackImage,
        kycSelfie,
        kycPaymentNumber,
        kycPaymentNumberConfirmed,
        kycDeclarationAccepted,
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
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 animate-pulse">
                <Clock size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#37474F]">আবেদনটি প্রক্রিয়াধীন আছে</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">KYC Status: Pending ⏳</p>
              </div>
              
              <div className="bg-amber-50/55 p-5 rounded-3xl border border-amber-100/70 text-left w-full space-y-3.5">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide border-b border-amber-100 pb-1.5 flex items-center gap-1.5">
                  <Shield size={14} /> জমা দেওয়া তথ্য:
                </h4>
                <div className="text-[11px] font-bold text-[#37474F] space-y-2">
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>👤 পুরো নাম:</span> <span>{user.kycFullName}</span></p>
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>📅 জন্ম তারিখ:</span> <span>{user.kycDob}</span></p>
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>📱 মোবাইল নম্বর:</span> <span>{user.kycPhone}</span></p>
                  {user.kycEmail && <p className="flex justify-between border-b border-amber-50 pb-1"><span>📧 ইমেইল:</span> <span>{user.kycEmail}</span></p>}
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>📍 বর্তমান ঠিকানা:</span> <span className="text-right max-w-[150px] truncate">{user.kycAddress}</span></p>
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>💳 পরিচয়পত্রের ধরন:</span> <span>{user.kycDocType}</span></p>
                  <p className="flex justify-between border-b border-amber-50 pb-1"><span>💰 পেমেন্ট নম্বর:</span> <span>{user.kycPaymentNumber}</span></p>
                </div>

                {/* Thumbnails of uploaded ID cards & selfie */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-100">
                  {user.kycFrontImage && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-amber-100 bg-white">
                        <img src={user.kycFrontImage} alt="Front" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[8px] text-amber-700 font-bold uppercase">Front ID</span>
                    </div>
                  )}
                  {user.kycBackImage && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-amber-100 bg-white">
                        <img src={user.kycBackImage} alt="Back" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[8px] text-amber-700 font-bold uppercase">Back ID</span>
                    </div>
                  )}
                  {user.kycSelfie && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-amber-100 bg-white">
                        <img src={user.kycSelfie} alt="Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[8px] text-amber-700 font-bold uppercase">Selfie</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                আপনার দেওয়া তথ্য আমাদের টিম যাচাই করছে। সাধারণত ২৪ ঘণ্টার মধ্যে এটি এপ্রুভ হয়ে যাবে। এপ্রুভ হওয়ার পর আপনি কোনো বাধা ছাড়াই টাকা তুলতে পারবেন।
              </p>
              <Button onClick={() => navigate('/wallet')} className="w-full h-14 rounded-2xl bg-[#37474F] text-white">ওয়ালেটে ফিরে যান</Button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 space-y-6">
              {/* Header */}
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

              {/* Steps Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <span>ধাপ {kycStep} / ৪</span>
                  <span>{kycStep === 1 ? 'ব্যক্তিগত তথ্য' : kycStep === 2 ? 'পরিচয়পত্র আপলোড' : kycStep === 3 ? 'পেমেন্ট যাচাই' : 'শর্তাবলী ও সম্মতি'}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FFC107] transition-all duration-300"
                    style={{ width: `${(kycStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step 1: Basic Information */}
              {kycStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                    <p className="text-xs font-bold text-[#37474F] leading-relaxed">
                      সিকিউরিটি পলিসি অনুযায়ী টাকা তুলতে হলে আপনার পরিচয় নিশ্চিত করা বাধ্যতামূলক। ১ম ধাপে আপনার মৌলিক তথ্যগুলো পূরণ করুন।
                    </p>
                  </div>

                  <Input 
                    label="পুরো নাম (জাতীয় পরিচয়পত্র অনুযায়ী) *" 
                    placeholder="যেমন: Md. Rocky Farazi" 
                    value={kycFullName} 
                    onChange={setKycFullName} 
                    icon={UserCheck} 
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">জন্ম তারিখ *</label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-100 px-4 h-14 group focus-within:border-[#FFC107] transition-all">
                      <Calendar size={18} className="text-gray-400 group-focus-within:text-[#FFC107]" />
                      <input 
                        type="date" 
                        value={kycDob}
                        onChange={(e) => setKycDob(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-gray-700 outline-none placeholder-gray-300 h-full"
                      />
                    </div>
                  </div>

                  <Input 
                    label="মোবাইল নম্বর *" 
                    placeholder="যেমন: 017XXXXXXXX" 
                    value={kycPhone} 
                    onChange={setKycPhone} 
                    icon={PhoneOutgoing} 
                  />

                  <Input 
                    label="ইমেইল (ঐচ্ছিক, তবে ভালো)" 
                    placeholder="যেমন: rocky@email.com" 
                    value={kycEmail} 
                    onChange={setKycEmail} 
                    icon={Lock} 
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">বর্তমান ঠিকানা (জেলা/উপজেলা পর্যন্ত হলেও চলবে) *</label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-100 px-4 h-14 group focus-within:border-[#FFC107] transition-all">
                      <MapPin size={18} className="text-gray-400 group-focus-within:text-[#FFC107]" />
                      <input 
                        type="text" 
                        placeholder="যেমন: মিরপুর, ঢাকা"
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-gray-700 outline-none placeholder-gray-300 h-full"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        if (!kycFullName.trim() || !kycDob || !kycPhone.trim() || !kycAddress.trim()) {
                          alert('দয়া করে সকল বাধ্যতামূলক (*) ফিল্ড পূরণ করুন।');
                          return;
                        }
                        setKycStep(2);
                      }} 
                      className="w-full h-15 rounded-2xl bg-[#FFC107] text-[#37474F] font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>পরবর্তী ধাপ</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Identity Verification */}
              {kycStep === 2 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">পরিচয়পত্র সিলেক্ট করুন *</label>
                    <select 
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                      className="w-full bg-gray-50 rounded-2xl border border-gray-100 px-4 h-14 text-xs font-bold text-gray-700 outline-none focus:border-[#FFC107]"
                    >
                      <option value="NID">জাতীয় পরিচয়পত্র (NID)</option>
                      <option value="Passport">পাসপোর্ট (Passport)</option>
                      <option value="Driving License">ড্রাইভিং লাইসেন্স (Driving License)</option>
                    </select>
                  </div>

                  {/* Upload Front Image */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">সামনের ছবি *</label>
                      <div className="border-2 border-dashed border-gray-200 hover:border-[#FFC107] bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 h-32 overflow-hidden relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setKycFrontImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                        {kycFrontImage ? (
                          <>
                            <img src={kycFrontImage} alt="Front ID" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1 text-[9px] font-black uppercase">
                              <Camera size={18} />
                              <span>Change Photo</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#FFC107] transition-all shadow-sm">
                              <Upload size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 text-center">সামনের পৃষ্ঠা</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">পেছনের ছবি *</label>
                      <div className="border-2 border-dashed border-gray-200 hover:border-[#FFC107] bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 h-32 overflow-hidden relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setKycBackImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                        {kycBackImage ? (
                          <>
                            <img src={kycBackImage} alt="Back ID" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1 text-[9px] font-black uppercase">
                              <Camera size={18} />
                              <span>Change Photo</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#FFC107] transition-all shadow-sm">
                              <Upload size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 text-center">পেছনের পৃষ্ঠা</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Selfie */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">একটি সেলফি (লাইভ বা হাতে আইডি ধরে) *</label>
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#FFC107] bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 h-36 overflow-hidden relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => setKycSelfie(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                      {kycSelfie ? (
                        <>
                          <img src={kycSelfie} alt="Selfie" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white gap-1 text-[10px] font-black uppercase">
                            <Camera size={18} />
                            <span>Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#FFC107] transition-all shadow-sm">
                            <Camera size={18} />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold text-gray-700 block">ক্যামেরা দিয়ে সেলফি বা লাইভ ছবি আপলোড করুন</span>
                            <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">নিশ্চিত করুন আইডি কার্ড বা মুখমণ্ডল একদম স্পষ্ট</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setKycStep(1)} 
                      className="flex-1 h-14 rounded-2xl border-gray-200 text-gray-600 font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>পেছনে</span>
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!kycFrontImage || !kycBackImage || !kycSelfie) {
                          alert('দয়া করে পরিচয়পত্রের সামনের ও পেছনের ছবি এবং একটি সেলফি আপলোড করুন।');
                          return;
                        }
                        setKycStep(3);
                      }} 
                      className="flex-[2] h-14 rounded-2xl bg-[#FFC107] text-[#37474F] font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <span>পরবর্তী ধাপ</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Verification */}
              {kycStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">পেমেন্ট নম্বর কেন প্রয়োজন?</h4>
                    <p className="text-[11px] font-bold text-[#37474F] leading-relaxed">
                      উইথড্র দ্রুত প্রোসেস করার জন্য এবং পেমেন্ট হ্যাক হওয়া থেকে বাঁচাতে আপনার নিজস্ব পেমেন্ট নম্বরটি ভেরিফাই করা জরুরি।
                    </p>
                  </div>

                  <Input 
                    label="বিকাশ/নগদ/রকেট নম্বর *" 
                    placeholder="যেমন: 017XXXXXXXX" 
                    value={kycPaymentNumber} 
                    onChange={setKycPaymentNumber} 
                    icon={PhoneOutgoing} 
                  />

                  {/* Declaration Checklist */}
                  <div 
                    onClick={() => setKycPaymentNumberConfirmed(!kycPaymentNumberConfirmed)}
                    className="flex items-start gap-3 p-4 rounded-2xl border bg-gray-50 cursor-pointer select-none transition-colors hover:bg-gray-50/75"
                    style={{ borderColor: kycPaymentNumberConfirmed ? '#FFC107' : '#F1F1F1' }}
                  >
                    <button 
                      type="button" 
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors border mt-0.5 ${kycPaymentNumberConfirmed ? 'bg-[#FFC107] border-[#FFC107] text-white' : 'bg-white border-gray-300'}`}
                    >
                      {kycPaymentNumberConfirmed && <Check size={14} className="stroke-[3]" />}
                    </button>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">পেমেন্ট নম্বর মালিকানা ঘোষণা *</h4>
                      <p className="text-[11px] font-bold text-gray-500 mt-1 leading-relaxed">
                        আমি নিশ্চিত করছি এবং ঘোষণা দিচ্ছি যে এই বিকাশ/নগদ/রকেট নম্বরটি আমার নিজের এবং বর্তমানে সচল আছে।
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setKycStep(2)} 
                      className="flex-1 h-14 rounded-2xl border-gray-200 text-gray-600 font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>পেছনে</span>
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!kycPaymentNumber.trim()) {
                          alert('দয়া করে পেমেন্ট নম্বরটি টাইপ করুন।');
                          return;
                        }
                        if (!kycPaymentNumberConfirmed) {
                          alert('পেমেন্ট নম্বরের মালিকানা নিশ্চিত করে টিক মার্ক করুন।');
                          return;
                        }
                        setKycStep(4);
                      }} 
                      className="flex-[2] h-14 rounded-2xl bg-[#FFC107] text-[#37474F] font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <span>পরবর্তী ধাপ</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Additional conditions and final Declaration */}
              {kycStep === 4 && (
                <div className="space-y-5">
                  {/* Additional withdrawal conditions */}
                  <div className="bg-[#37474F] p-5 rounded-3xl text-white space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <HelpCircle size={18} className="text-[#FFC107]" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#FFC107]">উইথড্রের অতিরিক্ত শর্তাবলী</h4>
                    </div>

                    <div className="space-y-3 text-[11px] font-bold leading-relaxed text-gray-100">
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">🔒</span>
                        <span>KYC সম্পন্ন না হলে অ্যাকাউন্ট থেকে উইথড্র করা যাবে না।</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">👤</span>
                        <span>KYC-তে দেওয়া নাম এবং উইথড্র অ্যাকাউন্টের নাম মিলতে হবে (যদি সম্ভব হয়)।</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">🚫</span>
                        <span>একই NID/পরিচয়পত্র দিয়ে একাধিক Cash Earn অ্যাকাউন্ট খোলা যাবে না।</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">🛑</span>
                        <span>একই KYC তথ্য দিয়ে একাধিক অ্যাকাউন্ট ভেরিফাই করা যাবে না।</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">⚠️</span>
                        <span>ভুয়া বা সম্পাদিত (এডিট করা) পরিচয়পত্র দিলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করা হতে পারে।</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <span className="text-[#FFC107]">🔄</span>
                        <span>KYC একবার অনুমোদিত হলে পরে তথ্য পরিবর্তনের জন্য অতিরিক্ত যাচাই লাগতে পারে।</span>
                      </p>
                    </div>
                  </div>

                  {/* KYC Declaration Checkbox */}
                  <div 
                    onClick={() => setKycDeclarationAccepted(!kycDeclarationAccepted)}
                    className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50/50 cursor-pointer select-none transition-colors hover:bg-amber-50/70"
                    style={{ borderColor: kycDeclarationAccepted ? '#FFC107' : '#F1F1F1' }}
                  >
                    <button 
                      type="button" 
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors border mt-0.5 shrink-0 ${kycDeclarationAccepted ? 'bg-[#FFC107] border-[#FFC107] text-white' : 'bg-white border-gray-300'}`}
                    >
                      {kycDeclarationAccepted && <Check size={14} className="stroke-[3]" />}
                    </button>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">KYC Declaration (ঘোষণা) *</h4>
                      <p className="text-[11px] font-semibold text-gray-600 mt-1 leading-relaxed">
                        আমি নিশ্চিত করছি যে, KYC-তে জমা দেওয়া সকল তথ্য সঠিক এবং আমার নিজের। ভুয়া তথ্য, অন্যের পরিচয়পত্র বা জাল নথি ব্যবহার করলে Cash Earn আমার অ্যাকাউন্ট স্থগিত/বাতিল করতে এবং উইথড্র প্রত্যাখ্যান করতে পারবে।
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setKycStep(3)} 
                      className="flex-1 h-14 rounded-2xl border-gray-200 text-gray-600 font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={16} />
                      <span>পেছনে</span>
                    </Button>
                    <Button 
                      onClick={handleKycSubmit} 
                      isLoading={submittingKyc} 
                      disabled={!kycDeclarationAccepted}
                      className={`flex-[2] h-14 rounded-2xl font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all ${kycDeclarationAccepted ? 'bg-[#FFC107] text-[#37474F] hover:bg-[#ffca28]' : 'bg-gray-150 text-gray-400 cursor-not-allowed border-none shadow-none'}`}
                    >
                      <span>সাবমিট করুন</span>
                      <ShieldCheck size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isWithdrawalEnabled = state.settings.withdrawalsEnabled !== false;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
       <div className="p-6 flex items-center gap-4 bg-white shadow-sm rounded-b-[32px]">
        <button onClick={() => navigate('/wallet')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95"><ArrowLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Withdraw Coins</span>
      </div>

      <div className="p-6 space-y-8">
         <Card className="bg-[#37474F] p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-center">
            <div className="relative z-10 space-y-1">
               <h1 className="text-5xl font-black text-[#FFC107]">{state.currentUser?.balance.toFixed(0)}</h1>
               <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Available Coins Balance</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
         </Card>

         {!isWithdrawalEnabled ? (
           <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-[32px] shadow-xl text-center space-y-6">
             <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
               <Lock size={32} />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-black text-red-800 uppercase tracking-tight">উইথড্র সাময়িকভাবে বন্ধ আছে</h3>
               <p className="text-xs font-bold text-red-700/80 uppercase">Withdrawal Temporarily Suspended</p>
             </div>
             
             {state.settings.withdrawalsDisabledReason && (
               <div className="bg-white p-4 rounded-2xl border border-red-100 text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">কারণ / Reason:</p>
                 <p className="text-xs font-bold text-gray-700 leading-relaxed">{state.settings.withdrawalsDisabledReason}</p>
               </div>
             )}

             {state.settings.withdrawalsReopenDate && (
               <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left flex gap-3 items-center">
                 <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                   <Calendar size={18} />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">লিস্টিং / পুনরায় খোলার তারিখ:</p>
                   <p className="text-xs font-black text-amber-900">{state.settings.withdrawalsReopenDate}</p>
                 </div>
               </div>
             )}

             <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed pt-2">
               যেকোনো আপডেটের জন্য আমাদের অফিশিয়াল চ্যানেলে যুক্ত থাকুন। ধন্যবাদ।
             </p>
           </Card>
         ) : (
           <>
             <div className="space-y-6">
                <Input label="Withdraw Amount (Coins)" placeholder={`Enter amount (min ${state.settings.minWithdrawal || 50} coins)`} value={amount} onChange={setAmount} type="number" icon={Wallet} />
                
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
           </>
         )}
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
    const minCoins = (state.settings.coinRate || 100) * 10;
    if (!val || val < minCoins) {
      alert(`নূন্যতম রিচার্জ হচ্ছে ${minCoins} কয়েন`);
      return;
    }
    if (val > (state.currentUser?.balance || 0)) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    setLoading(true);
    try {
      const success = await dbService.recharge(state.currentUser!.id, number, operator, val, type);
      if (success) {
        onUpdate();
        alert(`রিচার্জ সফল হয়েছে! ${val} কয়েন রিচার্জ প্রক্রিয়াধীন রয়েছে।`);
        navigate('/wallet');
      } else {
        alert('রিচার্জ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
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
            <h2 className="text-5xl font-black text-[#FFC107] drop-shadow-md tracking-tighter">{state.currentUser?.balance.toFixed(0)}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Current Coins Balance</p>
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
            <Input label="Recharge Amount (Coins)" placeholder={`Min ${(state.settings.coinRate || 100) * 10} Coins`} value={amount} onChange={setAmount} type="number" icon={Wallet} className="rounded-[32px] p-6 h-18 text-sm" />
          </div>
          
          {parseFloat(amount) >= (state.settings.coinRate || 100) * 50 ? (
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
                <p className="text-[10px] font-bold text-white/80 uppercase">You'll receive {(state.settings.coinRate || 100) * 10} Coins cashback after successful recharge</p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#37474F]/5 p-6 rounded-[32px] flex items-center gap-4 border border-dashed border-[#37474F]/20">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FFC107] text-xl shadow-sm">
                🎁
              </div>
              <p className="text-[9px] font-black text-[#37474F]/40 uppercase leading-tight">
                 Recharge {(state.settings.coinRate || 100) * 50} or more Coins to unlock your INSTANT CASHBACK gift!
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
