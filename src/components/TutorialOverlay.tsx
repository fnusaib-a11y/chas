/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Sparkles, 
  Trophy, 
  ShoppingBag, 
  ShieldCheck, 
  Gift, 
  Compass, 
  CheckCircle2, 
  Coins 
} from 'lucide-react';
import { AppState, User } from '../types';
import { dbService } from '../dbService';
import { Button } from './UI';

interface TutorialOverlayProps {
  state: AppState;
  onClose: () => void;
  autoOpened?: boolean;
}

const TUTORIAL_STEPS = [
  {
    title: "CASH প্ল্যাটফর্মে আপনাকে স্বাগতম!",
    subtitle: "কয়েন ইনকাম করুন এবং নিত্যপ্রয়োজনীয় পণ্য কিনুন",
    icon: Sparkles,
    color: "from-amber-400 to-amber-600 text-amber-500",
    videoUrl: "https://www.youtube.com/embed/p8Z_0bZqX8g", // A standard educational / explanatory video clip
    description: "CASH একটি নির্ভরযোগ্য প্ল্যাটফর্ম যেখানে আপনি প্রতিদিন সহজ সব কাজ সম্পূর্ণ করে টাকা ইনকাম করতে পারবেন এবং সেই অর্জিত কয়েন দিয়ে সরাসরি অনলাইন শপ থেকে শপিং করতে পারবেন। চলুন দেখে নিই এটি কিভাবে কাজ করে!",
    bulletPoints: [
      "প্রতিদিন নতুন নতুন কাজ এবং মিশন পাবেন।",
      "অর্জিত ব্যালেন্স দিয়ে শপিং অথবা সরাসরি বিকাশ/নগদে ক্যাশআউট।",
      "লেভেল আপ করে আরো বেশি গুণিতক রিওয়ার্ড আয় করুন।"
    ]
  },
  {
    title: "মিশন ও সহজ কাজ (Earn Money)",
    subtitle: "ভিডিও অ্যাডস, সার্ভে এবং ইনস্টল করে আয় করুন",
    icon: Trophy,
    color: "from-blue-400 to-blue-600 text-blue-500",
    videoUrl: "https://www.youtube.com/embed/z6p7b23I4Zk",
    description: "আপনার ড্যাশবোর্ডে বিভিন্ন ক্যাটাগরির কাজ দেওয়া আছে। প্রতিদিনের লিমিট অনুযায়ী কাজ সম্পন্ন করে আয় করুন। আপনি লেভেল যত বাড়াবেন, কাজ করার সীমা এবং গুণিতক বোনাসও তত বৃদ্ধি পাবে!",
    bulletPoints: [
      "Survey Tasks: বিভিন্ন প্রশ্নের সঠিক উত্তর দিয়ে বেশি বেশি কয়েন আর্ন করুন।",
      "Video Ads: মাত্র ১৫-৩০ সেকেন্ডের আকর্ষণীয় ভিডিও দেখে নিশ্চিত ইনকাম।",
      "Daily Missions: প্রতিদিনের স্পেশাল মিশন কমপ্লিট করে আকর্ষণীয় বোনাস।"
    ]
  },
  {
    title: "শপিং ও আকর্ষণীয় অফার (Shopping)",
    subtitle: "অর্জিত কয়েন ও টাকা দিয়ে সরাসরি ঘরে বসেই শপিং করুন",
    icon: ShoppingBag,
    color: "from-green-400 to-green-600 text-green-500",
    videoUrl: "https://www.youtube.com/embed/tV2Tz79Cg-E",
    description: "আমাদের শপে পাবেন চাল, ডাল, আলু, ডিম, সাবান থেকে শুরু করে প্রয়োজনীয় সব পণ্য। আপনার অর্জিত ওয়ালেট ব্যালেন্স দিয়েই সরাসরি মূল্য পরিশোধ করতে পারবেন এবং দ্রুততম সময়ে আপনার ঠিকানায় ডেলিভারি পৌঁছে যাবে!",
    bulletPoints: [
      "ডেইলি ডিলস: প্রতিদিন বিভিন্ন পণ্যের ওপর আকর্ষণীয় ডিসকাউন্ট অফার।",
      "কুপন কোড: প্রোমোশনাল কোড ব্যবহার করে অতিরিক্ত ডিসকাউন্টে অর্ডার।",
      "অর্ডার ট্র্যাকিং: শপ থেকে কেনা পণ্যের বর্তমান ডেলিভারি অবস্থা চেক করা।"
    ]
  },
  {
    title: "ভেরিফিকেশন ও উইথড্র পদ্ধতি (KYC)",
    subtitle: "বিকাশ, নগদ বা রকেটে টাকা উত্তোলন এবং একাউন্ট সুরক্ষা",
    icon: ShieldCheck,
    color: "from-purple-400 to-purple-600 text-purple-500",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "আমাদের প্ল্যাটফর্ম থেকে আপনার উপার্জিত অর্থ নিরাপদে উত্তোলন করতে এবং একাউন্ট সুরক্ষিত রাখতে KYC ভেরিফিকেশন সম্পূর্ণ করুন। ভেরিফাইড ইউজাররা আরো দ্রুত ডেলিভারি এবং ক্যাশআউট সুবিধা পাবেন!",
    bulletPoints: [
      "বিকাশ, নগদ ও রকেটে সর্বনিম্ন ১০ টাকা হলেই উইথড্রাল রিকুয়েস্ট।",
      "KYC ভেরিফিকেশন করার সাথে সাথেই একাউন্টে বাড়তি বোনাস ও ট্রাস্ট ব্যাজ।",
      "২৪ ঘন্টার মধ্যে পেমেন্ট প্রসেসিং এবং অ্যাডমিন দ্বারা সরাসরি অনুমোদন।"
    ]
  }
];

export default function TutorialOverlay({ state, onClose, autoOpened = false }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const user = state.currentUser;

  const handleNext = async () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsPlayingVideo(false);
    } else {
      // Mark tutorial as seen in Firebase & trigger close
      if (user) {
        try {
          await dbService.updateUser(user.id, { tutorialSeen: true });
        } catch (error) {
          console.error("Failed to update user tutorial state in Firestore:", error);
        }
      }
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsPlayingVideo(false);
    }
  };

  const stepInfo = TUTORIAL_STEPS[currentStep];
  const StepIcon = stepInfo.icon;

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 relative"
      >
        {/* Top Header Panel */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-500">
              <Coins size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Walkthrough Guide</span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom Progress Bar Indicator */}
        <div className="w-full bg-gray-100 h-1.5 flex">
          {TUTORIAL_STEPS.map((_, index) => (
            <div 
              key={index}
              className={`flex-1 transition-all duration-300 ${
                index <= currentStep ? 'bg-[#FFC107]' : 'bg-gray-100'
              } border-r border-white last:border-r-0`}
            />
          ))}
        </div>

        {/* Main Interactive Container */}
        <div className="p-6 md:p-8 flex-1 flex flex-col min-h-0 space-y-6">
          {/* Headline & Visual icon */}
          <div className="flex items-start gap-4">
            <div className={`p-4 bg-gradient-to-br ${stepInfo.color} rounded-2xl text-white shrink-0 shadow-sm`}>
              <StepIcon size={28} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#37474F] font-sans leading-tight">
                {stepInfo.title}
              </h2>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider font-sans">
                {stepInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Dynamic Walkthrough Video Showcase Section */}
          <div className="relative aspect-video w-full bg-gray-950 rounded-2xl overflow-hidden border border-gray-100/70 shadow-inner group">
            {isPlayingVideo ? (
              <iframe
                title={`Tutorial Video Step ${currentStep + 1}`}
                src={`${stepInfo.videoUrl}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-gray-950/90 via-gray-900/60 to-gray-950/70 text-center space-y-3">
                <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600')` }} />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlayingVideo(true)}
                  className="w-16 h-16 bg-[#FFC107] text-[#37474F] rounded-full flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors z-10"
                >
                  <Play size={28} className="fill-current ml-1" />
                </motion.button>
                
                <div className="z-10 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-300">ভিডিও গাইড প্লে করুন</p>
                  <p className="text-[10px] text-gray-400 max-w-sm mx-auto uppercase font-bold">Watch a quick video walkthrough showing this exact feature in action!</p>
                </div>
              </div>
            )}
          </div>

          {/* Rich Description */}
          <div className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium whitespace-pre-line select-text bg-gray-50 p-4 rounded-xl border border-gray-100">
              {stepInfo.description}
            </p>

            {/* Bullet Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2.5">
              {stepInfo.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 font-bold">
                  <CheckCircle2 size={16} className="text-[#00B074] shrink-0 mt-0.5" />
                  <span className="font-sans font-bold text-gray-600">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Controller */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          {/* Skip / Back button */}
          <div>
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="h-11 px-4 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>পেছনে</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="h-11 px-4 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                স্কিপ করুন (Skip)
              </button>
            )}
          </div>

          {/* Step Indicator Text */}
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Slide {currentStep + 1} of {TUTORIAL_STEPS.length}
          </span>

          {/* Next / Got It button */}
          <Button
            onClick={handleNext}
            className="h-11 px-6 bg-[#FFC107] text-[#37474F] hover:bg-amber-400 rounded-xl font-black uppercase tracking-wider text-xs shadow-md shadow-[#FFC107]/15 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'বুঝেছি (Done)' : 'পরবর্তী ধাপ'}</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
