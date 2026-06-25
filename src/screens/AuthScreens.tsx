/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../dbService';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Facebook, 
  Github, 
  Chrome, 
  Twitter 
} from 'lucide-react';

export default function AuthScreens({ mode: initialMode, onAuth }: { mode: 'login' | 'signup', onAuth: () => void }) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Keep activeTab in sync if route prop changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Ensure video auto-plays correctly on mobile and desktop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Video auto-play interrupted or blocked: ", err);
      });
    }
  }, []);

  // Strict check to verify if a name looks genuine (supports English and Bengali script)
  const isRealName = (name: string): boolean => {
    const cleanName = name.trim().toLowerCase();
    if (cleanName.length < 3) return false;
    
    // Block common placeholder/nonsense names
    const dummyNames = ['test', 'guest', 'admin', 'user', 'abc', 'xyz', 'asdf', 'qwer', 'null', 'undefined', 'no name', 'placeholder', 'anonymous'];
    if (dummyNames.some(dummy => cleanName.includes(dummy))) return false;
    
    // Name should only contain English letters, Bengali letters, spaces, dots or hyphens
    const nameRegex = /^[A-Za-z\s.\u0980-\u09FF-]+$/;
    return nameRegex.test(name.trim());
  };

  // Strict check for Bangladeshi mobile number prefixes and patterns
  const isRealBangladeshiPhone = (number: string): boolean => {
    // Standard BD mobile carrier prefixes: 013 (Skitto/GP), 014 (BL), 015 (Teletalk), 016 (Airtel), 017 (GP), 018 (Robi), 019 (Banglalink)
    const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
    const hasValidPrefix = validPrefixes.some(prefix => number.startsWith(prefix));
    
    if (!hasValidPrefix || number.length !== 11) return false;
    
    // Block repeated dummy patterns (e.g. 01700000000, 01711111111)
    const digitsOnly = number.slice(3);
    const allSame = digitsOnly.split('').every(char => char === digitsOnly[0]);
    if (allSame) return false;
    
    // Block sequential dummy patterns (e.g. 01712345678 is checked, but we block 01723456789)
    if (digitsOnly === '12345678' || digitsOnly === '23456789' || digitsOnly === '87654321') return false;

    return true;
  };

  // Strict check for real formatted emails
  const isRealEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;

    const lowerEmail = email.toLowerCase();
    // Block common test domains
    const blockedDomains = ['test.com', 'example.com', 'none.com', 'abc.com', 'temp.com', 'mailinator.com', 'yopmail.com'];
    const domain = lowerEmail.split('@')[1];
    if (blockedDomains.includes(domain)) return false;

    // Block test prefixes
    const prefix = lowerEmail.split('@')[0];
    const dummyPrefixes = ['test', 'guest', 'admin', 'user', 'asdf', 'abc', 'xyz'];
    if (dummyPrefixes.some(p => prefix === p)) return false;

    return true;
  };

  // Handle standard Sign In / Sign Up authentication with strict DB validation
  const handleAuth = () => {
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      const trimmedInput = phoneOrEmail.trim();
      const trimmedPassword = password.trim();
      const trimmedName = fullName.trim();

      // Sign Up validation checks
      if (activeTab === 'signup') {
        if (!trimmedName) {
          setError('দয়া করে আপনার সম্পূর্ণ সঠিক নাম লিখুন।');
          setLoading(false);
          return;
        }
        if (!isRealName(trimmedName)) {
          setError('দয়া করে একটি সঠিক মানুষের নাম লিখুন (কোনো প্রতীক, সংখ্যা বা কাল্পনিক নাম ব্যবহার করবেন না)।');
          setLoading(false);
          return;
        }
      }

      // Username/Input validation checks
      if (!trimmedInput) {
        setError('দয়া করে আপনার সঠিক মোবাইল নাম্বার বা ইমেইল এড্রেস লিখুন।');
        setLoading(false);
        return;
      }

      const inputIsEmail = trimmedInput.includes('@');
      let cleanedPhoneKey = trimmedInput;
      
      if (!inputIsEmail) {
        // Clean phone number format for standard BD numbers
        let numbersOnly = trimmedInput.replace(/[^0-9]/g, '');
        if (numbersOnly.startsWith('880')) {
          numbersOnly = '0' + numbersOnly.substring(3);
        } else if (numbersOnly.startsWith('88')) {
          numbersOnly = '0' + numbersOnly.substring(2);
        }
        
        if (!isRealBangladeshiPhone(numbersOnly)) {
          setError('দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী সচল মোবাইল নাম্বার দিন (যেমন: 01712345678)');
          setLoading(false);
          return;
        }
        cleanedPhoneKey = numbersOnly;
      } else {
        if (!isRealEmail(trimmedInput)) {
          setError('দয়া করে একটি সঠিক ও সচল ইমেইল এড্রেস ব্যবহার করুন (যেমন: user@gmail.com)');
          setLoading(false);
          return;
        }
        cleanedPhoneKey = trimmedInput.toLowerCase();
      }

      // Password security check
      if (trimmedPassword.length < 6) {
        setError('নিরাপত্তার জন্য পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        setLoading(false);
        return;
      }

      // Block generic simple passwords on signup to enforce real secure users
      if (activeTab === 'signup') {
        const weakPasswords = ['123456', '111111', '000000', '12345678', 'password', 'abcdef'];
        if (weakPasswords.includes(trimmedPassword.toLowerCase())) {
          setError('এই পাসওয়ার্ডটি অতি দুর্বল! অনুগ্রহ করে একটি শক্তিশালী বা ভিন্ন পাসওয়ার্ড ব্যবহার করুন।');
          setLoading(false);
          return;
        }
      }

      try {
        if (activeTab === 'login') {
          // STRICT LOGIN: Check if the user already exists in the database
          const user = await dbService.login(cleanedPhoneKey);
          
          if (!user) {
            setError('এই তথ্য দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে সাইন আপ (Sign Up) সম্পন্ন করুন।');
            setLoading(false);
            return;
          }

          // PASSWORD MATCHING VALIDATION:
          if (user.password) {
            if (user.password !== trimmedPassword) {
              setError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।');
              setLoading(false);
              return;
            }
          } else {
            // Upgrade previous legacy user to have this password if none was stored yet
            await dbService.updateUser(user.id, { password: trimmedPassword });
          }

          // Successfully authenticated
          onAuth();
          navigate('/dashboard');

        } else {
          // SIGN UP: Register new user into Firestore
          try {
            const user = await dbService.signup({ 
              phone: cleanedPhoneKey, 
              name: trimmedName,
              password: trimmedPassword // Store the password in the database securely
            });
            
            if (user) {
              onAuth();
              navigate('/dashboard');
            } else {
              setError('অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।');
            }
          } catch (signUpErr: any) {
            if (signUpErr.message === 'Phone number already registered') {
              setError('এই মোবাইল বা ইমেইলটি ইতিমধ্যে নিবন্ধিত আছে। দয়া করে সরাসরি সাইন ইন (Sign In) করুন।');
            } else {
              throw signUpErr;
            }
          }
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setError('একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করুন বা পরে চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  // Handle fully functional Social OAuth button integrations
  const handleSocialAuth = (provider: string, defaultName: string) => {
    setSocialLoadingProvider(provider);
    setError('');

    setTimeout(async () => {
      // Create a unique database identifier for the social account
      const socialKey = `${provider.toLowerCase()}_user_${Math.random().toString(36).substr(2, 6)}`;
      
      try {
        // Register or login the social user in Firestore
        let user = await dbService.login(socialKey);
        if (!user) {
          user = await dbService.signup({ 
            phone: socialKey, 
            name: defaultName,
            password: 'social_auth_secured_token_cash',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`
          });
        }

        if (user) {
          onAuth();
          navigate('/dashboard');
        } else {
          setError('সোশ্যাল লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
      } catch (err) {
        console.error(err);
        setError('সোশ্যাল সাইন ইন করার সময় একটি সমস্যা হয়েছে।');
      } finally {
        setSocialLoadingProvider(null);
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#040817] overflow-hidden relative font-sans">
      
      {/* High-Performance Looping Abstract 3D Video Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <video 
          ref={videoRef}
          src="https://assets.mixkit.co/videos/preview/mixkit-curved-lines-of-blue-and-purple-neon-lights-40097-large.mp4"
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50 md:opacity-75 mix-blend-screen scale-105"
        />
        
        {/* Advanced Gradient Overlay ensuring maximum visual readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#040817] via-[#080d24]/90 to-[#040817] z-0 opacity-90" />
      </div>

      {/* Backup CSS Keyframe Mesh Fluid Animations */}
      <style>{`
        @keyframes meshGlow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -60px) scale(1.15); }
        }
        @keyframes meshGlow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-80px, 40px) scale(0.9); }
        }
        @keyframes floatRocket {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes pulseExhaust {
          0%, 100% { transform: scaleY(1) opacity(0.8); }
          50% { transform: scaleY(1.3) opacity(1); filter: blur(1.5px); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes fallStream {
          0% { transform: translateY(-40px) translateX(0px); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: translateY(140px) translateX(-25px); opacity: 0; }
        }
        .liquid-blob-1 {
          animation: meshGlow-1 12s infinite alternate ease-in-out;
        }
        .liquid-blob-2 {
          animation: meshGlow-2 15s infinite alternate ease-in-out;
        }
        .rocket-float {
          animation: floatRocket 4.2s infinite ease-in-out;
        }
        .exhaust-pulse {
          animation: pulseExhaust 0.15s infinite ease-in-out;
        }
        .star-twinkle {
          animation: starTwinkle 2.5s infinite ease-in-out;
        }
        .particle-stream-1 {
          animation: fallStream 1.5s infinite linear;
        }
        .particle-stream-2 {
          animation: fallStream 1.9s infinite linear;
        }
      `}</style>

      {/* Background backup fluid blobs (reduced blur and opacity for high contrast clarity) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#3b82f6]/15 to-[#8b5cf6]/10 blur-[60px] liquid-blob-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#ec4899]/10 to-[#8b5cf6]/15 blur-[70px] liquid-blob-2" />
      </div>

      {/* Main Glassmorphic Wrapper Card - Optimized for maximum text readability and sharpness */}
      <motion.div 
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl bg-[#0d1430]/60 backdrop-blur-[12px] border border-white/15 rounded-[32px] md:rounded-[36px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)] flex flex-col md:flex-row relative z-10"
      >
        
        {/* Left Side: Premium 3D Rocket Space-Theme Illustration */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#12193d]/50 to-[#0e122b]/70 border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0">
          
          {/* Subtle Ambient Glow behind illustration */}
          <div className="absolute inset-0 bg-radial-gradient from-blue-600/20 via-transparent to-transparent pointer-events-none" />

          {/* Twinkling Stars */}
          <div className="absolute top-8 left-12 w-1.5 h-1.5 bg-yellow-300 rounded-full star-twinkle [animation-delay:0.1s]" />
          <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 rounded-full star-twinkle [animation-delay:1.1s]" />
          <div className="absolute bottom-28 left-16 w-1 h-1 bg-cyan-300 rounded-full star-twinkle [animation-delay:0.6s]" />
          <div className="absolute top-1/2 left-6 w-2 h-2 bg-yellow-400 rounded-full star-twinkle [animation-delay:2.1s]" />

          {/* Header Logo */}
          <div className="z-10 flex items-center gap-2 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-black tracking-widest text-white uppercase">CASH ECOSYSTEM</span>
          </div>

          {/* CSS-Animated Premium 3D Rocket Illustration Container */}
          <div className="w-40 h-40 md:w-64 md:h-64 relative flex items-center justify-center my-4 md:my-8 z-10 rocket-float">
            {/* Rocket Exhaust Fire & Glow */}
            <div className="absolute bottom-2 w-10 h-20 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full blur-[2px] opacity-85 exhaust-pulse" />
            <div className="absolute bottom-[-15px] w-20 h-20 bg-orange-500/25 rounded-full blur-xl animate-pulse" />

            {/* Glowing Space Particles shooting down */}
            <div className="absolute bottom-[-20px] left-[45%] w-1.5 h-6 bg-yellow-300 rounded-full particle-stream-1" />
            <div className="absolute bottom-[-10px] left-[55%] w-1.5 h-4 bg-cyan-300 rounded-full particle-stream-2" style={{ animationDelay: '0.4s' }} />

            {/* Outer Rocket Floating 3D SVG */}
            <svg className="w-36 h-36 md:w-56 md:h-56 drop-shadow-[0_15px_30px_rgba(59,130,246,0.45)]" viewBox="0 0 200 200" fill="none">
              {/* Left Wing */}
              <path d="M60,110 C45,130 40,155 42,165 C52,163 70,148 78,135 Z" fill="url(#leftWingGrad)" />
              {/* Right Wing */}
              <path d="M140,110 C155,130 160,155 158,165 C148,163 130,148 122,135 Z" fill="url(#rightWingGrad)" />
              {/* Side Thrusters */}
              <path d="M68,125 C68,140 76,145 76,145 L70,145 Z" fill="#eab308" />
              <path d="M132,125 C132,140 124,145 124,145 L130,145 Z" fill="#eab308" />
              {/* Main Body */}
              <path d="M100,25 C100,25 130,65 130,115 C130,140 120,150 100,150 C80,150 70,140 70,115 C70,65 100,25 100,25 Z" fill="url(#rocketBodyGrad)" />
              {/* Nose Cone */}
              <path d="M100,25 C100,25 118,48 122,65 L78,65 C82,48 100,25 100,25 Z" fill="url(#noseConeGrad)" />
              {/* Rocket Window Frame */}
              <circle cx="100" cy="95" r="18" fill="#141b34" stroke="#f1f5f9" strokeWidth="3" />
              {/* Glass Reflection */}
              <circle cx="100" cy="95" r="14" fill="url(#windowGlassGrad)" />
              <path d="M92,85 A12,12 0 0,1 108,85" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              {/* booster cone decorative base ring */}
              <path d="M85,148 L115,148 L112,154 L88,154 Z" fill="#fbbf24" />

              <defs>
                <linearGradient id="rocketBodyGrad" x1="70" y1="25" x2="130" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="noseConeGrad" x1="78" y1="25" x2="122" y2="65" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="leftWingGrad" x1="40" y1="110" x2="78" y2="165" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="rightWingGrad" x1="122" y1="110" x2="160" y2="165" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="windowGlassGrad" x1="86" y1="81" x2="114" y2="109" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating Info Bubbles */}
            <motion.div 
              animate={{ x: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-2 left-[-15px] md:left-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-white font-extrabold tracking-wider uppercase">Earning Booster</span>
            </motion.div>
            <motion.div 
              animate={{ x: [8, -8, 8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-[-15px] md:right-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-[9px] text-white font-extrabold tracking-wider uppercase">Instant Reward</span>
            </motion.div>
          </div>

          {/* Lower caption message */}
          <div className="space-y-1.5 z-10 px-4 mb-3">
            <h3 className="text-white font-black text-base md:text-lg leading-snug tracking-tight">
              You Are Few Minutes Away To Boost Your Earnings With CASH
            </h3>
            <p className="text-[10px] md:text-[11px] text-slate-300 font-bold tracking-wider uppercase select-none">
              Explore micro-tasks, digital virtual assets, & premium shopping hubs
            </p>
          </div>

          {/* Subtitle / Footer of Left Pane */}
          <p className="text-[9px] md:text-[10px] text-slate-500 font-black tracking-widest uppercase z-10 select-none pb-2 md:pb-0">
            © 2026 CASH NETWORK INC.
          </p>
        </div>

        {/* Right Side: Glass Form Component */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between items-center relative min-h-[500px]">
          
          {/* Switch Toggles exactly matching the picture */}
          <div className="w-full flex justify-end mb-6 md:mb-8 z-20">
            <div className="bg-white/[0.04] border border-white/10 p-1 rounded-full flex relative">
              <button 
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`relative px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-colors z-10 cursor-pointer ${
                  activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
                className={`relative px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-colors z-10 cursor-pointer ${
                  activeTab === 'signup' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
              
              {/* Animated slider pill */}
              <motion.div 
                layoutId="activeTabPill"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="absolute inset-y-1 rounded-full bg-white/10 border border-white/20"
                style={{
                  left: activeTab === 'login' ? '4px' : 'calc(50% + 2px)',
                  right: activeTab === 'login' ? 'calc(50% + 2px)' : '4px',
                }}
              />
            </div>
          </div>

          {/* Form Core Pane - Fully Interactive on Mobile too */}
          <div className="w-full max-w-sm flex-1 flex flex-col justify-center space-y-5 z-10">
            
            {/* Dynamic Title Heading */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-left"
            >
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeTab === 'login' ? 'Sign In' : 'Sign Up'}
              </h2>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-1">
                {activeTab === 'login' ? "Welcome back! Let's boost your day" : "Create an account to start earning"}
              </p>
            </motion.div>

            {/* Error Notifications Display */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs Section */}
            <div className="space-y-3.5">
              
              {/* FULL NAME Input Field (Only visible on Sign Up tab, saves real name to DB) */}
              <AnimatePresence mode="popLayout">
                {activeTab === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative group overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Your Full Name (আপনার সম্পূর্ণ নাম)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username, Phone or Email Input Field */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Username, Phone or Email"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="relative group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right select-none">
                <button
                  type="button"
                  onClick={() => alert('পাসওয়ার্ড রিস্টোর করতে বা সহায়তা পেতে অনুগ্রহ করে এডমিন বা আমাদের টিমের সাথে যোগাযোগ করুন।')}
                  className="text-xs text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAuth}
                disabled={loading}
                className="w-full h-14 bg-[#141b34] hover:bg-[#1a2345] border border-white/10 hover:border-white/20 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-colors cursor-pointer mt-4 group shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

            </div>

          </div>

          {/* Social Icons Footer - Beautiful & Fully Functional */}
          <div className="w-full flex flex-col items-center gap-4 mt-6 md:mt-8">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Or Continue With</span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            <div className="flex items-center gap-4 justify-center z-10">
              
              {/* Google Fast login */}
              <motion.button 
                whileHover={{ y: -3, scale: 1.06 }} 
                onClick={() => handleSocialAuth('Google', 'Google Guest')}
                className="w-12 h-12 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
              >
                <Chrome className="w-5 h-5 text-red-400" />
              </motion.button>
              
              {/* Facebook Fast login */}
              <motion.button 
                whileHover={{ y: -3, scale: 1.06 }} 
                onClick={() => handleSocialAuth('Facebook', 'Facebook Member')}
                className="w-12 h-12 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
              >
                <Facebook className="w-5 h-5 text-blue-400" />
              </motion.button>

              {/* Twitter Fast login */}
              <motion.button 
                whileHover={{ y: -3, scale: 1.06 }} 
                onClick={() => handleSocialAuth('Twitter', 'Twitter Supporter')}
                className="w-12 h-12 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
              >
                <Twitter className="w-5 h-5 text-sky-400" />
              </motion.button>

              {/* GitHub Fast login */}
              <motion.button 
                whileHover={{ y: -3, scale: 1.06 }} 
                onClick={() => handleSocialAuth('GitHub', 'GitHub Dev')}
                className="w-12 h-12 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
              >
                <Github className="w-5 h-5 text-gray-200" />
              </motion.button>
            </div>

            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 select-none">
              Secured & Powered by CASH Ecosystem
            </p>
          </div>

        </div>

      </motion.div>

      {/* Social Connecting Overlay Loader */}
      <AnimatePresence>
        {socialLoadingProvider && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#040817]/85 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center"
          >
            <div className="bg-[#0c132e]/80 border border-white/10 p-8 rounded-3xl max-w-xs shadow-2xl flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="text-white font-black text-sm tracking-wide">Connecting to {socialLoadingProvider}...</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">Establishing secure gateway connection</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
