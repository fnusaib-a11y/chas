/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Download, HelpCircle, CheckCircle2, Timer, ArrowLeft, ExternalLink, CalendarDays, Send, Instagram, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, Button, BannerAdSlot } from '../components/UI';
import { AppState, TaskType, UserLevel } from '../types';
import { dbService } from '../dbService';

import { ads } from '../lib/ads';

// Remove local StartIOBanner as we now use common BannerAdSlot

const getLevelMultiplier = (level: UserLevel) => {
  return 1.0;
};

export const getDailyTaskLimit = (level: UserLevel) => {
  switch (level) {
    case UserLevel.BEGINNER: return 5;
    case UserLevel.REGULAR: return 10;
    case UserLevel.ACTIVE: return 20;
    case UserLevel.EXPERT: return 50;
    case UserLevel.MASTER: return 100;
    default: return 5;
  }
};

const TaskList = ({ state, onComplete }: { state: AppState; onComplete: () => void }) => {
  const navigate = useNavigate();
  const { category: urlCat } = useParams();
  const user = state.currentUser!;
  const multiplier = getLevelMultiplier(user.level);

  const categories = ['All', 'Install', 'Survey', 'Link', 'Special', 'Social'];
  const [activeCat, setActiveCat] = useState(urlCat || 'All');

  useEffect(() => {
    if (urlCat) {
      setActiveCat(urlCat);
    }
  }, [urlCat]);

  const filteredTasks = state.tasks.filter(t => activeCat === 'All' || t.category === activeCat);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#FFC107] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <h2 className="text-3xl font-black text-[#37474F]">Earn Money</h2>
        <div className="flex justify-between items-center mt-2">
           <p className="text-[#37474F]/70 text-xs font-bold uppercase tracking-wider">Level {user.level}</p>
           <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#37474F] uppercase border border-white/30">
              Daily: {user.totalTasksCompleted}/{getDailyTaskLimit(user.level)}
           </div>
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-6">
        {/* Categories Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                activeCat === cat 
                ? 'bg-[#37474F] text-white border-[#37474F] shadow-lg shadow-[#37474F]/20' 
                : 'bg-white text-gray-400 border-gray-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const reward = (task.reward * multiplier).toFixed(2);
          const Icon = task.type === TaskType.INSTALL ? Download : task.type === TaskType.CHECKIN ? CalendarDays : task.type === TaskType.SURVEY ? HelpCircle : ExternalLink;
          
          return (
            <Card key={task.id} className="p-5 border border-gray-50 hover:border-[#FFC107]/30 group bg-white shadow-sm hover:shadow-md transition-all rounded-[32px]" onClick={() => navigate(`/tasks/${task.id}`)}>
              <div className="flex gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                   task.type === TaskType.INSTALL ? 'bg-blue-50 text-blue-500' :
                   task.type === TaskType.SURVEY ? 'bg-purple-50 text-purple-500' :
                   'bg-[#FFC107]/10 text-[#FFC107]'
                }`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-black text-[#37474F] text-sm leading-tight line-clamp-2">{task.title}</h4>
                    <div className="bg-[#FFC107] px-3 py-1 rounded-full shadow-sm shadow-[#FFC107]/20 flex-shrink-0">
                       <span className="text-[#37474F] font-black text-xs italic tracking-tighter">৳{reward}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                       task.type === TaskType.INSTALL ? 'bg-blue-50 text-blue-400' :
                       'bg-gray-100 text-gray-400'
                    }`}>{task.type}</span>
                    <span className="text-[8px] font-black text-gray-300">•</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{task.category}</span>
                    { (task.minDurationRequired || task.duration) && (
                      <div className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-widest ml-auto">
                        <Timer size={8} /> {task.minDurationRequired || task.duration}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Banner Ad at bottom of Task List */}
      <div className="px-6 py-4">
        <BannerAdSlot state={state} />
      </div>
    </div>
    </div>
  );
};

const TaskDetail = ({ state, onComplete }: { state: AppState; onComplete: () => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = state.tasks.find(t => t.id === id);
  const user = state.currentUser!;
  
  const initialDuration = task?.minDurationRequired || task?.duration || 0;
  const [timer, setTimer] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(initialDuration === 0);
  const [loading, setLoading] = useState(false);

  // Background Video Tracking State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Survey-specific state
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string | string[]>>({});

  const [resolvedUrlState, setResolvedUrlState] = useState<string>('');
  const [isResolvingUrl, setIsResolvingUrl] = useState<boolean>(false);

  const hasQuestions = task?.questions && task.questions.length > 0;

  const isSurveyValid = () => {
    if (!task || !task.questions || task.questions.length === 0) return true;
    for (const q of task.questions) {
      if (q.required) {
        const ans = surveyAnswers[q.id];
        if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0) || (typeof ans === 'string' && ans.trim() === '')) {
          return false;
        }
      }
    }
    return true;
  };

  const checkIsVideoTask = (): boolean => {
    if (!task) return false;

    // 1. Explicit admin/task configuration takes highest precedence
    const isExplicitVideo = task.type === TaskType.VIDEO || task.category?.toLowerCase() === 'video';

    const urlToOpen = (task?.adCode && (task.adCode.startsWith('http') || task.adCode.includes('.'))) ? task.adCode : task?.url;
    const fUrl = urlToOpen ? (urlToOpen.startsWith('http') ? urlToOpen : `https://${urlToOpen}`) : '';
    if (!fUrl) return false;

    const lowercaseUrl = fUrl.toLowerCase();
    const lowercaseTitle = (task.title || '').toLowerCase();
    const lowercaseDesc = (task.description || '').toLowerCase();

    const hasVideoKeywords = 
      lowercaseTitle.includes('video') || 
      lowercaseTitle.includes('ভিডিও') || 
      lowercaseTitle.includes('watch') || 
      lowercaseTitle.includes('দেখুন') ||
      lowercaseDesc.includes('video') || 
      lowercaseDesc.includes('ভিডিও');

    // Check if URL points to a channel/profile page instead of a watchable video
    if (
      lowercaseUrl.includes('youtube.com/channel/') ||
      lowercaseUrl.includes('youtube.com/c/') ||
      lowercaseUrl.includes('youtube.com/user/') ||
      (lowercaseUrl.includes('youtube.com/@') && !lowercaseUrl.includes('/watch') && !lowercaseUrl.includes('/shorts'))
    ) {
      return false;
    }

    if (
      lowercaseUrl.includes('facebook.com/groups/') ||
      lowercaseUrl.includes('facebook.com/profile.php') ||
      lowercaseUrl.includes('t.me/') ||
      lowercaseUrl.includes('telegram.org/')
    ) {
      return false;
    }

    // Check if the URL has clear video signatures
    const hasVideoSignatures = 
      lowercaseUrl.includes('watch?v=') || 
      lowercaseUrl.includes('youtu.be/') || 
      lowercaseUrl.includes('youtube.com/shorts/') ||
      lowercaseUrl.includes('youtube.com/embed/') ||
      lowercaseUrl.includes('fb.watch') ||
      lowercaseUrl.includes('facebook.com/watch') ||
      lowercaseUrl.includes('/videos/') ||
      lowercaseUrl.includes('/reel/') ||
      lowercaseUrl.includes('/share/v/') ||
      lowercaseUrl.includes('/share/r/') ||
      lowercaseUrl.includes('facebook.com/share/v/') ||
      lowercaseUrl.includes('facebook.com/share/r/');

    if (hasVideoSignatures) {
      return true;
    }

    if (isExplicitVideo) {
      return true;
    }

    if (lowercaseUrl.includes('facebook.com/') || lowercaseUrl.includes('fb.com')) {
      // For general Facebook links, if there's an explicit video keyword in title/desc, treat it as a video task!
      if (hasVideoKeywords) {
        return true;
      }
      return false;
    }

    if (hasVideoKeywords) {
      return true;
    }

    return false;
  };

  const getSocialAction = (url: string, title: string, desc: string) => {
    const lowercaseUrl = url.toLowerCase();
    const textToSearch = (title + ' ' + desc).toLowerCase();
    
    let platform: 'youtube' | 'facebook' | 'telegram' | 'instagram' | 'tiktok' | 'twitter' | 'other' = 'other';
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
      platform = 'youtube';
    } else if (lowercaseUrl.includes('facebook.com') || lowercaseUrl.includes('fb.com') || lowercaseUrl.includes('fb.watch')) {
      platform = 'facebook';
    } else if (lowercaseUrl.includes('t.me') || lowercaseUrl.includes('telegram')) {
      platform = 'telegram';
    } else if (lowercaseUrl.includes('instagram.com')) {
      platform = 'instagram';
    } else if (lowercaseUrl.includes('tiktok.com')) {
      platform = 'tiktok';
    } else if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
      platform = 'twitter';
    }

    let actionType: 'subscribe' | 'follow' | 'like' | 'join' | 'visit' = 'visit';
    if (textToSearch.includes('subscribe') || textToSearch.includes('সাবস্ক্রাইব') || textToSearch.includes('sub')) {
      actionType = 'subscribe';
    } else if (textToSearch.includes('follow') || textToSearch.includes('ফলো')) {
      actionType = 'follow';
    } else if (textToSearch.includes('like') || textToSearch.includes('লাইক')) {
      actionType = 'like';
    } else if (textToSearch.includes('join') || textToSearch.includes('জয়েন') || textToSearch.includes('গ্রুপ') || textToSearch.includes('group') || textToSearch.includes('channel')) {
      actionType = 'join';
    }

    let titleBn = "লিংক ভিজিট করুন";
    let descBn = "দয়া করে নিচের লিংকে ক্লিক করে আমাদের সাইটটি ভিজিট করুন এবং কাউন্টডাউন শেষ হওয়া পর্যন্ত অপেক্ষা করুন।";

    if (platform === 'youtube') {
      if (actionType === 'subscribe') {
        titleBn = "ইউটিউব চ্যানেল সাবস্ক্রাইব করুন";
        descBn = "নিচের বাটনে ক্লিক করে আমাদের ইউটিউব চ্যানেলে যান, চ্যানেলটি সাবস্ক্রাইব করুন এবং বেল আইকনটি অন করুন। তারপর ফিরে এসে রিওয়ার্ড দাবি করুন।";
      } else {
        titleBn = "ইউটিউব ভিডিও দেখুন";
        descBn = "ভিডিওটি সম্পূর্ণ দেখুন এবং কাউন্টডাউন শেষ হওয়া পর্যন্ত অপেক্ষা করুন।";
      }
    } else if (platform === 'facebook') {
      if (actionType === 'follow' || actionType === 'like') {
        titleBn = "ফেসবুক পেজ লাইক ও ফলো করুন";
        descBn = "নিচের বাটনে ক্লিক করে আমাদের ফেসবুক পেজে যান, পেজটি লাইক এবং ফলো করুন। তারপর ফিরে এসে রিওয়ার্ড দাবি করুন।";
      } else {
        titleBn = "ফেসবুক ভিডিও দেখুন";
        descBn = "ভিডিওটি সম্পূর্ণ দেখুন এবং কাউন্টডাউন শেষ হওয়া পর্যন্ত অপেক্ষা করুন।";
      }
    } else if (platform === 'telegram') {
      titleBn = "টেলিগ্রাম চ্যানেলে জয়েন করুন";
      descBn = "নিচের বাটনে ক্লিক করে আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন এবং জয়েন করা শেষ হলে এই এপে এসে রিওয়ার্ড দাবি করুন।";
    } else if (platform === 'instagram') {
      titleBn = "ইনস্টাগ্রাম প্রোফাইল ফলো করুন";
      descBn = "নিচের বাটনে ক্লিক করে আমাদের ইনস্টাগ্রাম প্রোফাইলে যান এবং ফলো করুন। তারপর ফিরে এসে রিওয়ার্ড দাবি করুন।";
    } else if (platform === 'tiktok') {
      titleBn = "টিকটক আইডি ফলো করুন";
      descBn = "নিচের বাটনে ক্লিক করে আমাদের টিকটক আইডিতে যান এবং ফলো করুন। তারপর ফিরে এসে রিওয়ার্ড দাবি করুন।";
    } else if (platform === 'twitter') {
      titleBn = "টুইটার/X প্রোফাইল ফলো করুন";
      descBn = "নিচের বাটনে ক্লিক করে আমাদের টুইটার প্রোফাইলে যান এবং ফলো করুন। তারপর ফিরে এসে রিওয়ার্ড দাবি করুন।";
    }

    return { platform, actionType, titleBn, descBn };
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    try {
      const trimmed = url.trim();
      if (trimmed.includes('youtu.be/')) {
        const parts = trimmed.split('youtu.be/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#]/)[0];
        }
      } else if (trimmed.includes('youtube.com/shorts/')) {
        const parts = trimmed.split('youtube.com/shorts/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#/]/)[0];
        }
      } else if (trimmed.includes('youtube.com/watch')) {
        const urlObj = new URL(trimmed);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (trimmed.includes('youtube.com/embed/')) {
        const parts = trimmed.split('youtube.com/embed/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#]/)[0];
        }
      } else {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = trimmed.match(regExp);
        if (match && match[2]) {
          videoId = match[2];
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    if (videoId) {
      videoId = videoId.split(/[?#&/]/)[0].trim();
    }
    
    if (videoId && videoId.length === 11) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
    }
    return null;
  };

  const getFacebookEmbedUrl = (url: string) => {
    if (!url) return null;
    let cleanUrl = url.trim();
    if (
      cleanUrl.includes('facebook.com') || 
      cleanUrl.includes('fb.watch') || 
      cleanUrl.includes('fb.com')
    ) {
      // Normalize mobile or other subdomains to www to prevent iframe loading issues
      cleanUrl = cleanUrl
        .replace(/(m|touch|web|business)\.facebook\.com/, 'www.facebook.com')
        .replace(/fb\.com/, 'facebook.com');
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=0&width=500&autoplay=true`;
    }
    return null;
  };

  const urlToOpen = (task?.adCode && (task.adCode.startsWith('http') || task.adCode.includes('.'))) ? task.adCode : task?.url;
  const finalUrl = urlToOpen ? (urlToOpen.startsWith('http') ? urlToOpen : `https://${urlToOpen}`) : '';
  const isUrlAlreadyCompleted = (state.taskLogs || []).some(log => log.taskId === task?.id && log.status !== 'rejected');

  useEffect(() => {
    if (!finalUrl) return;
    
    // Check if the URL needs backend resolution
    // We EXCLUDE youtube.com/shorts and youtu.be as they can be parsed instantly client-side without risk of cloud IP blockage.
    const isFacebookShortOrShare = finalUrl.includes('fb.watch') || finalUrl.includes('facebook.com/share') || finalUrl.includes('fb.com');
    
    if (isFacebookShortOrShare) {
      setIsResolvingUrl(true);
      fetch(`/api/resolve-url?url=${encodeURIComponent(finalUrl)}`)
        .then(res => res.json())
        .then(data => {
          // If the resolved URL points to a login wall, fallback to original to avoid a blank screen
          if (data.resolvedUrl && !data.resolvedUrl.includes('login') && !data.resolvedUrl.includes('checkpoint')) {
            setResolvedUrlState(data.resolvedUrl);
          } else {
            setResolvedUrlState(finalUrl);
          }
        })
        .catch(err => {
          console.error("Error resolving URL:", err);
          setResolvedUrlState(finalUrl);
        })
        .finally(() => {
          setIsResolvingUrl(false);
        });
    } else {
      setResolvedUrlState(finalUrl);
    }
  }, [finalUrl]);

  const reward = task ? (task.reward * getLevelMultiplier(user.level)).toFixed(2) : '0.00';

  const youtubeEmbedUrl = getYoutubeEmbedUrl(resolvedUrlState || finalUrl);
  const facebookEmbedUrl = getFacebookEmbedUrl(resolvedUrlState || finalUrl);
  const hasEmbed = !!(youtubeEmbedUrl || facebookEmbedUrl);

  const isVideoTask = checkIsVideoTask();

  // Tab visibility check to pause timer when user exits/hides the tab
  useEffect(() => {
    if (!isActive) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setIsVideoPlaying(false);
      } else {
        // If it's a non-video task, resume automatic counting
        if (!isVideoTask) {
          setIsVideoPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isActive, isVideoTask]);

  // YouTube API Integration for exact watch tracking
  useEffect(() => {
    if (!isActive) {
      setIsVideoPlaying(false);
      return;
    }

    if (!isVideoTask) {
      setIsVideoPlaying(true);
      return;
    }

    const isYoutube = !!youtubeEmbedUrl;
    if (!isYoutube) {
      // For Facebook or other non-youtube videos, start as active by default, but subject to tab visibility
      setIsVideoPlaying(true);
      return;
    }

    let player: any = null;

    const setupPlayer = () => {
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          player = new (window as any).YT.Player('youtube-task-player', {
            events: {
              onStateChange: (event: any) => {
                // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
                if (event.data === 1) {
                  setIsVideoPlaying(true);
                } else if (event.data === 2 || event.data === 0 || event.data === 3) {
                  setIsVideoPlaying(false);
                }
              }
            }
          });
        }
      } catch (err) {
        console.error("Error setting up YouTube player tracking:", err);
      }
    };

    // Load API dynamically if needed
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    } else {
      setupPlayer();
    }

    // Set fallback: if YouTube API is blocked/failing to initialize after 7 seconds, 
    // let user watch by default (so they don't get stuck)
    const fallbackTimeout = setTimeout(() => {
      if (!player) {
        console.warn("YouTube Player API not responding, falling back to basic active timing");
        setIsVideoPlaying(true);
      }
    }, 7000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [isActive, isVideoTask, youtubeEmbedUrl]);

  useEffect(() => {
    let interval: any;
    if (isActive && !isResolvingUrl && isVideoPlaying && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsFinished(true);
      setIsActive(false);
      // Celebrate reaching the end of the timer
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC107', '#37474F', '#4CAF50']
      });
      ads.showInterstitial(state.settings);
    }
    return () => clearInterval(interval);
  }, [isActive, isResolvingUrl, isVideoPlaying, timer]);

  const startTask = () => {
    // libtl ad trigger
    try {
      if (typeof (window as any).show_9796489 === 'function') {
        (window as any).show_9796489();
      }
    } catch (e) {
      console.warn('Ad SDK error', e);
    }

    setIsActive(true);
    ads.showInterstitial(state.settings);

    if (!isVideoTask && finalUrl) {
      window.open(finalUrl, '_blank');
    }
  };

  const handleComplete = async () => {
    if (hasQuestions && !isSurveyValid()) {
      alert('Please answer all required survey questions!');
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = task.questions?.map(q => ({
        questionId: q.id,
        questionText: q.questionText,
        answer: surveyAnswers[q.id] || ''
      }));

      const success = await dbService.completeTask(task.id, user, parseFloat(reward), task.title, formattedAnswers);
      if (success) {
        onComplete();
        ads.showInterstitial(state.settings);
        navigate('/tasks/complete');
      } else {
        alert('Error completing task!');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return <div className="p-6 text-center text-gray-500 font-bold uppercase">Task missing</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="p-6 flex items-center justify-between bg-white shadow-sm">
        <button onClick={() => navigate('/tasks')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95"><ArrowLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Task Mission</span>
        <div className="w-12 text-[#FFC107] font-black">৳{reward}</div>
      </div>

      {/* Top premium ad slot */}
      <div className="bg-white border-b border-gray-100 px-6 py-2 flex flex-col items-center justify-center">
        <BannerAdSlot state={state} />
      </div>

      <div className="flex-1 p-6 py-10 flex flex-col items-center text-center space-y-8">
        {isActive && finalUrl ? (
          <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300 text-left">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
              {/* Browser control bar */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                
                {/* Simulated URL Bar */}
                <div className="flex-1 bg-white border border-gray-200/60 rounded-xl px-3 py-1.5 text-[10px] font-bold text-gray-500 flex items-center justify-between overflow-hidden select-all font-mono truncate">
                  <span className="truncate">{finalUrl}</span>
                  <span className="text-[8px] font-black uppercase text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0 ml-1">Secure Connection</span>
                </div>

                <button 
                  onClick={() => window.open(finalUrl, '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-[#FFC107] hover:bg-[#FFB300] text-gray-800 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 shadow-sm"
                  title="Open in Browser"
                >
                  <ExternalLink size={10} />
                  <span>Direct Open</span>
                </button>
              </div>

              {/* Viewport Box */}
              {isVideoTask ? (
                <div className="relative aspect-video w-full bg-gray-950 overflow-hidden flex flex-col items-center justify-center border-b border-gray-100">
                  {isResolvingUrl ? (
                    <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-amber-400">Loading Video Player...</p>
                      <p className="text-[10px] text-gray-500 font-bold max-w-xs uppercase">Bypassing iframe blocks & securing server connection...</p>
                    </div>
                  ) : youtubeEmbedUrl ? (
                    <>
                      <iframe
                        id="youtube-task-player"
                        title="YouTube Task Video"
                        src={youtubeEmbedUrl}
                        className="w-full h-full border-none absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                      {/* Active status indicator overlay */}
                      {!isVideoPlaying ? (
                        <div className="absolute top-2 left-2 right-2 bg-red-600/90 text-white text-[9px] font-bold py-1.5 px-3 rounded-lg shadow-md flex items-center gap-1.5 z-20 pointer-events-none font-sans justify-center">
                          <span>⚠️ ভিডিওটি প্লে করুন! (ভিডিও না দেখলে কাউন্টডাউন শুরু হবে না)</span>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 right-2 bg-emerald-600/90 text-white text-[9px] font-bold py-1.5 px-3 rounded-lg shadow-md flex items-center gap-1.5 z-20 pointer-events-none font-sans justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>✅ ভিডিও দেখছেন... এপের ভেতরেই থাকুন</span>
                        </div>
                      )}
                    </>
                  ) : facebookEmbedUrl ? (
                    <iframe
                      title="Facebook Task Video"
                      src={facebookEmbedUrl}
                      className="w-full h-full border-none absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <iframe
                      title="In-App Web Task View"
                      src={finalUrl}
                      className="w-full h-full border-none absolute inset-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  )}

                  {/* Visual Progress Bar at the bottom of the video player screen to show watched time & reward countdown */}
                  {isActive && !isResolvingUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 pt-7 flex items-center justify-between z-20 pointer-events-none font-sans">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${isVideoPlaying ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}>
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                        <span className="text-[10px] font-black text-white tracking-wide uppercase drop-shadow-md">
                          {isVideoPlaying ? 'Watching & Counting...' : 'Playback Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#FFC107] font-mono bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-inner">
                          {timer > 0 ? `${timer}s left` : 'Finished!'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-[#FFC107] transition-all duration-1000 ease-linear rounded-r-sm"
                          style={{ width: `${Math.max(0, Math.min(100, initialDuration > 0 ? ((initialDuration - timer) / initialDuration) * 100 : 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-Video Task Instructions Box (Subscribe / Follow / Like / Join) */
                <div className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center text-center space-y-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FFC107]">
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'youtube' && <Play size={28} className="text-red-500" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'facebook' && <Users size={28} className="text-blue-600" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'telegram' && <Send size={28} className="text-sky-500" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'instagram' && <Instagram size={28} className="text-pink-500" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'tiktok' && <Play size={28} className="text-purple-600 animate-pulse" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'twitter' && <ExternalLink size={28} className="text-blue-400" />}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'other' && <ExternalLink size={28} className="text-amber-500" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                      <CheckCircle2 size={12} />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="text-sm font-black text-gray-800 font-sans">
                      {getSocialAction(finalUrl, task.title, task.description).titleBn}
                    </h4>
                    <p className="text-xs text-gray-600 font-bold leading-relaxed font-sans px-2">
                      {getSocialAction(finalUrl, task.title, task.description).descBn}
                    </p>
                  </div>

                  <button
                    onClick={() => window.open(finalUrl, '_blank')}
                    className="px-6 py-3 bg-[#FFC107] hover:bg-amber-400 text-[#37474F] font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    <span>
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'youtube' && 'ইউটিউব চ্যানেল ওপেন করুন (Open Youtube)'}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'facebook' && 'ফেসবুক পেজ ওপেন করুন (Open Facebook)'}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'telegram' && 'টেলিগ্রাম ওপেন করুন (Open Telegram)'}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'instagram' && 'ইনস্টাগ্রাম ওপেন করুন (Open Instagram)'}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'tiktok' && 'টিকটক ওপেন করুন (Open TikTok)'}
                      {getSocialAction(finalUrl, task.title, task.description).platform === 'other' && 'লিংক ওপেন করুন (Open Link)'}
                    </span>
                  </button>
                </div>
              )}
              {/* Active Task Banner Ad Slot */}
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col items-center justify-center min-h-[60px]">
                <span className="text-[7px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Sponsored Advertisement</span>
                <BannerAdSlot state={state} />
              </div>
            </div>

            {/* In-app guidelines */}
            <div className="bg-amber-50 border border-amber-200/30 p-3.5 rounded-2xl space-y-1">
              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 leading-relaxed">
                💡 <b>পরামর্শ:</b> {isVideoTask ? 'পেজ বা ভিডিওটি এপের ভেতরেই দেখুন এবং সময় শেষ হওয়া পর্যন্ত অপেক্ষা করুন।' : 'নিচের বাটনে ক্লিক করে সোশ্যাল অ্যাকাউন্টটি সাবস্ক্রাইব/ফলো করুন এবং টাইম কাউন্টডাউন শেষ হওয়া পর্যন্ত অপেক্ষা করুন।'}
              </p>
              {!youtubeEmbedUrl && !facebookEmbedUrl && isVideoTask && (
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  যদি সাইটটি এখানে পুরোপুরি লোড না হয়, তবে উপরের <b>"Direct Open"</b> বাটনে চাপ দিয়ে সরাসরি দেখে আসুন, তবে এপটি ব্যাকগ্রাউন্ড থেকে সরাবেন না।
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-28 h-28 bg-white rounded-[40px] flex items-center justify-center text-[#FFC107] shadow-xl relative">
            <div className="absolute inset-0 bg-[#FFC107]/5 rounded-[40px] animate-pulse" />
            <Download size={56} className="relative z-10" />
          </div>
        )}

        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-[#37474F]">{task.title}</h2>
          <p className="text-gray-500 font-medium">{task.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          <Card className="bg-white border border-gray-100 flex flex-col items-center py-8 rounded-3xl">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Reward</span>
            <span className="text-3xl font-black text-[#FFC107]">৳{reward}</span>
          </Card>
          <Card className="bg-white border border-gray-100 flex flex-col items-center py-6 rounded-3xl relative overflow-hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 z-10">Time Remaining</span>
            <div className="relative w-20 h-20 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={226.2}
                  strokeDashoffset={226.2 * (1 - (initialDuration > 0 ? timer / initialDuration : 1))}
                  className={`${isActive ? 'text-[#FFC107]' : 'text-gray-300'} transition-all duration-1000`}
                />
              </svg>
              <span className="absolute text-2xl font-black text-[#37474F]">{timer}s</span>
            </div>
            {isActive && (
              <div className="mt-2 text-[8px] font-black uppercase tracking-wider text-center z-10 font-sans">
                {isVideoPlaying ? (
                  <span className="text-emerald-500 animate-pulse">● Active & Watching</span>
                ) : (
                  <span className="text-amber-500">⚠️ Video Paused / Hidden</span>
                )}
              </div>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 h-1 bg-[#FFC107] transition-all duration-1000" style={{ width: `${(timer / (initialDuration || 1)) * 100}%` }} />
            )}
          </Card>
        </div>

        {hasQuestions && (
          <div className="w-full text-left space-y-6">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-sm font-black text-[#37474F] uppercase tracking-wider">Survey Questions (সার্ভে প্রশ্নাবলী)</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Please fill in the details below to complete the survey</p>
            </div>

            <div className="space-y-4">
              {task.questions?.map((q, idx) => (
                <div key={q.id || idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-start gap-1 justify-between">
                    <span className="text-xs font-black text-gray-700">
                      {idx + 1}. {q.questionText}
                      {q.required && <span className="text-red-500 ml-1 font-black">*</span>}
                    </span>
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                      {q.type}
                    </span>
                  </div>

                  {q.type === 'text' && (
                    <input
                      type="text"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] transition-colors"
                      placeholder="Type your answer here..."
                      value={(surveyAnswers[q.id] as string) || ''}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, [q.id]: e.target.value })}
                    />
                  )}

                  {q.type === 'mcq' && (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options?.map((opt) => {
                        const isSelected = surveyAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSurveyAnswers({ ...surveyAnswers, [q.id]: opt })}
                            className={`w-full h-10 px-4 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/10 text-gray-800 border-amber-400'
                                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FFC107] bg-[#FFC107]' : 'border-gray-200'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options?.map((opt) => {
                        const currentSelection = (surveyAnswers[q.id] as string[]) || [];
                        const isSelected = currentSelection.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const nextSelection = isSelected
                                ? currentSelection.filter(x => x !== opt)
                                : [...currentSelection, opt];
                              setSurveyAnswers({ ...surveyAnswers, [q.id]: nextSelection });
                            }}
                            className={`w-full h-10 px-4 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/10 text-gray-800 border-amber-400'
                                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'border-[#FFC107] bg-[#FFC107]' : 'border-gray-200'}`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-orange-50 p-6 rounded-2xl w-full border border-orange-100 text-left space-y-3">
          <h4 className="text-orange-800 font-bold text-sm uppercase">Instructions / নিয়মাবলী:</h4>
          <ul className="text-xs text-orange-700/80 font-medium space-y-2 font-sans">
            <li>১. কাজ শুরু করতে নিচের <b>"Start Task"</b> বাটনে চাপ দিন।</li>
            {isVideoTask ? (
              <li>২. ভিডিওটি সম্পূর্ণ দেখুন এবং এপের ভেতরেই থাকুন।</li>
            ) : (
              <li>২. সোশ্যাল মিডিয়া লিংকে গিয়ে সাবস্ক্রাইব, লাইক বা ফলো সম্পন্ন করুন।</li>
            )}
            {initialDuration > 0 && <li>৩. টাইমার কাউন্টডাউন শেষ হওয়া পর্যন্ত অপেক্ষা করুন (কমপক্ষে {initialDuration} সেকেন্ড)।</li>}
            {hasQuestions && <li>৪. সার্ভের প্রশ্নগুলোর সঠিক উত্তর দিন।</li>}
            <li>৫. কাজ শেষ হলে <b>"Claim Reward"</b> বাটনে ক্লিক করে বোনাস বুঝে নিন।</li>
          </ul>
        </div>

        {/* Start.io Ad Integration */}
        <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 min-h-[60px] flex flex-col items-center justify-center">
            <BannerAdSlot state={state} />
            {task.adCode && !task.adCode.startsWith('http') && (
              <div 
                id="ad-code-container"
                className="w-full h-full flex items-center justify-center min-h-[50px]"
                ref={(el) => {
                  if (el && task.adCode && !task.adCode.startsWith('http')) {
                    const range = document.createRange();
                    el.innerHTML = ''; // Clear previous
                    const fragment = range.createContextualFragment(task.adCode);
                    el.appendChild(fragment);
                  }
                }}
              />
            )}
        </div>
      </div>

      <div className="p-6 pb-12">
        {isUrlAlreadyCompleted ? (
          <div className="w-full space-y-4 text-center">
            <div className="bg-green-50 p-6 rounded-3xl border border-green-200 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-sm font-black text-green-800 uppercase">Already Completed! (ইতিমধ্যে সম্পন্ন)</h4>
                <p className="text-[10px] text-green-700/80 font-bold uppercase mt-1">You have already earned reward for this link.</p>
              </div>
            </div>
            <Button disabled className="w-full h-14 bg-gray-200 text-gray-400 font-black cursor-not-allowed">
              Already Claimed (৳{reward})
            </Button>
          </div>
        ) : (
          <>
            {initialDuration > 0 && !isActive && !isFinished && (
              <Button onClick={startTask} className="w-full h-14">Start Task</Button>
            )}
            {initialDuration === 0 && !isActive && !isFinished && (
              <Button onClick={startTask} className="w-full h-14">Start Task</Button>
            )}
            {initialDuration > 0 && isActive && (
              <Button disabled className="w-full h-14 bg-gray-200 text-gray-400 font-black">
                Task in Progress... ({timer}s)
              </Button>
            )}
            {(initialDuration === 0 || isFinished) && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full space-y-4"
              >
                 {isSurveyValid() ? (
                   <div className="bg-green-50 p-4 rounded-2xl border border-green-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                         <CheckCircle2 size={24} />
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-black text-green-800 uppercase">Verification Complete!</p>
                         <p className="text-[10px] text-green-700/70 font-bold uppercase">Reward is ready to be claimed</p>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0">
                         <HelpCircle size={24} />
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-black text-amber-800 uppercase">Answer Required Questions</p>
                         <p className="text-[10px] text-amber-700/70 font-bold uppercase">Please answer all questions marked with *</p>
                      </div>
                   </div>
                 )}
                 <Button 
                   onClick={handleComplete} 
                   isLoading={loading}
                   disabled={!isSurveyValid()}
                   className={`w-full h-14 text-sm font-black uppercase tracking-widest ${
                     isSurveyValid() 
                       ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20' 
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                   }`}
                 >
                   {hasQuestions ? 'Submit Survey & Claim ৳' + reward : 'Claim Reward ৳' + reward}
                 </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const LottieCelebration = ({ triggerCount }: { triggerCount: number }) => {
  const particles = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 360) / 24;
    const distance = Math.random() * 80 + 60;
    const delay = Math.random() * 0.15;
    const duration = Math.random() * 0.6 + 0.5;
    const size = Math.random() * 6 + 4;
    const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * distance,
      y: Math.sin((angle * Math.PI) / 180) * distance,
      color: colors[i % colors.length],
      size,
      delay,
      duration,
    };
  });

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Ripple Rings */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.4, 1.8], opacity: [0.3, 0.15, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', type: 'tween' }}
        className="absolute w-28 h-28 bg-white/10 rounded-full"
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.2, 1.5], opacity: [0.4, 0.2, 0] }}
        transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: 'easeOut', type: 'tween' }}
        className="absolute w-28 h-28 bg-white/20 rounded-full"
      />

      {/* Main checkmark container */}
      <motion.div
        key={triggerCount}
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: [0, 1.15, 1], rotate: 0 }}
        transition={{ type: 'tween', duration: 0.5, ease: 'backOut' }}
        className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative z-10"
      >
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>

        {/* Floating Mini Coins / Sparks */}
        <motion.div
          animate={{ y: [-10, -35], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop', ease: 'easeOut', type: 'tween' }}
          className="absolute -top-4 -right-2 text-yellow-300 font-extrabold text-lg drop-shadow-md"
        >
          ৳
        </motion.div>
        <motion.div
          animate={{ y: [-5, -28], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 2, delay: 0.7, repeat: Infinity, repeatType: 'loop', ease: 'easeOut', type: 'tween' }}
          className="absolute -top-2 -left-4 text-yellow-300 font-extrabold text-base drop-shadow-md"
        >
          ৳
        </motion.div>
      </motion.div>

      {/* Confetti Explosion Particles */}
      {particles.map((p) => (
        <motion.div
          key={`${p.id}-${triggerCount}`}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: [1, 1.2, 0] }}
          transition={{
            duration: p.duration,
            ease: 'easeOut',
            delay: p.delay,
            type: 'tween'
          }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
};

const AnimatedBackground = () => {
  const elements = [
    { size: 140, x: ['10%', '75%', '20%'], y: ['15%', '85%', '10%'], color: 'rgba(255, 193, 7, 0.15)', duration: 25 },
    { size: 260, x: ['85%', '15%', '70%'], y: ['75%', '20%', '65%'], color: 'rgba(76, 175, 80, 0.12)', duration: 35 },
    { size: 180, x: ['20%', '85%', '35%'], y: ['80%', '25%', '75%'], color: 'rgba(33, 150, 243, 0.14)', duration: 30 },
    { size: 110, x: ['75%', '25%', '80%'], y: ['10%', '65%', '25%'], color: 'rgba(233, 30, 99, 0.1)', duration: 22 },
  ];

  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    top: `${(i * 7 + 11) % 100}%`,
    left: `${(i * 13 + 5) % 100}%`,
    size: ((i * 3) % 4) + 1.5,
    duration: ((i * 1.5) % 3) + 2.5,
    delay: (i * 0.4) % 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Ambient Glowing Orbs */}
      {elements.map((el, i) => (
        <motion.div
          key={i}
          animate={{
            x: el.x,
            y: el.y,
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute rounded-full blur-3xl"
          style={{
            width: el.size,
            height: el.size,
            backgroundColor: el.color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Shimmering Star Field */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [0.15, 0.9, 0.15],
            scale: [0.75, 1.25, 0.75],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
          className="absolute bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 10px #ffffff',
          }}
        />
      ))}
    </div>
  );
};

const Completion = () => {
  const navigate = useNavigate();
  const [triggerCount, setTriggerCount] = useState(0);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    // Initial burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFC107', '#4CAF50', '#2196F3', '#E91E63']
    });
  }, []);

  const handleSuccessClick = () => {
    setTriggerCount(prev => prev + 1);
    setClicked(true);

    // Immediate visual feedback - massive celebratory confetti explosion!
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFC107', '#4CAF50', '#00E676', '#FFFFFF']
    });

    // Sub-bursts for continuous feedback
    const end = Date.now() + 800;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFC107', '#4CAF50', '#2196F3']
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFC107', '#4CAF50', '#2196F3']
      });
    }, 150);

    // Smooth navigation after a delay to let them enjoy the animation
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#37474F] to-[#1E272C] text-white relative overflow-hidden">
      {/* Background Floating/Twinkling Animations */}
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Lottie-style Celebration Animation */}
        <LottieCelebration triggerCount={triggerCount} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4 max-w-sm"
        >
          <h2 className="text-4xl font-black tracking-tight text-[#FFC107] uppercase drop-shadow-md">Congratulations!</h2>
          <p className="text-sm font-bold opacity-80 text-gray-200 uppercase tracking-wide leading-relaxed">
            Your task reward has been successfully added to your pending balance.
          </p>
        </motion.div>

        {/* Immediate Visual Feedback 'Success' Button */}
        <div className="w-full max-w-xs mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleSuccessClick}
              disabled={clicked}
              className={`w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl border-none transition-all ${
                clicked 
                ? 'bg-[#4CAF50] text-white' 
                : 'bg-[#FFC107] text-[#37474F] hover:bg-[#FFD54F]'
              }`}
            >
              {clicked ? 'Processing...' : 'Success (সাকসেস)'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TaskHistory = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const logs = state.taskLogs;

  return (
    <div className="p-6 pb-32 space-y-8 bg-[#F5F5F5] min-h-screen">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-2 bg-white rounded-xl shadow-sm"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black text-[#37474F] tracking-tight">Task History</h2>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="py-24 text-center text-gray-300 font-black uppercase text-xs tracking-[0.2em] flex flex-col items-center gap-6">
            <div className="p-8 bg-white rounded-[40px] shadow-sm">
                <Timer size={64} className="opacity-10" />
            </div>
            No tasks completed yet
          </div>
        ) : (
          logs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map((log) => {
            const task = state.tasks.find(t => t.id === log.taskId) || { title: 'Unknown Task', type: TaskType.LINK, reward: log.reward };
            const Icon = task.type === TaskType.INSTALL ? Download : task.type === TaskType.CHECKIN ? CalendarDays : task.type === TaskType.SURVEY ? HelpCircle : ExternalLink;

            return (
              <Card key={log.id} className="p-5 flex gap-4 border border-gray-100/50 shadow-sm rounded-[32px] bg-white group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  log.status === 'approved' ? 'bg-green-50 text-green-500' :
                  log.status === 'rejected' ? 'bg-red-50 text-red-500' :
                  'bg-orange-50 text-orange-500'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-[#37474F] text-xs leading-tight line-clamp-1 group-hover:text-[#FFC107] transition-colors">{task.title}</h4>
                    <span className="text-[10px] font-black text-gray-300 uppercase shrink-0 ml-2">
                       {new Date(log.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Status</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                         log.status === 'approved' ? 'text-green-500' :
                         log.status === 'rejected' ? 'text-red-500' :
                         'text-orange-500'
                       }`}>
                         {log.status === 'pending' && <Timer size={10} />}
                         {log.status}
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Reward</p>
                       <span className="text-lg font-black text-[#37474F]">৳{log.reward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default { List: TaskList, Detail: TaskDetail, Completion, History: TaskHistory };
