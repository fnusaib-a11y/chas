/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Download, HelpCircle, CheckCircle2, Timer, ArrowLeft, ExternalLink, CalendarDays } from 'lucide-react';
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

  // Survey-specific state
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
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
  }, [isActive, timer]);

  if (!task) return <div>Task missing</div>;
  const reward = (task.reward * getLevelMultiplier(user.level)).toFixed(2);

  const hasQuestions = task.questions && task.questions.length > 0;

  const isSurveyValid = () => {
    if (!task.questions || task.questions.length === 0) return true;
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

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&enablejsapi=1` : null;
  };

  const getFacebookEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
      if (url.includes('/videos/') || url.includes('/watch') || url.includes('fb.watch') || url.includes('/posts/')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=500`;
      }
    }
    return null;
  };

  const urlToOpen = (task.adCode && (task.adCode.startsWith('http') || task.adCode.includes('.'))) ? task.adCode : task.url;
  const finalUrl = urlToOpen ? (urlToOpen.startsWith('http') ? urlToOpen : `https://${urlToOpen}`) : '';
  const youtubeEmbedUrl = getYoutubeEmbedUrl(finalUrl);
  const facebookEmbedUrl = getFacebookEmbedUrl(finalUrl);
  const hasEmbed = !!(youtubeEmbedUrl || facebookEmbedUrl);

  const startTask = () => {
    // libtl ad trigger
    try {
      if (typeof (window as any).show_9796489 === 'function') {
        (window as any).show_9796489();
      }
    } catch (e) {
      console.warn('Ad SDK error', e);
    }

    // Instead of forcing window.open and redirecting user out of the app, 
    // we now activate the premium in-app web browser frame!
    setIsActive(true);
    ads.showInterstitial(state.settings);
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <div className="p-6 flex items-center justify-between bg-white shadow-sm">
        <button onClick={() => navigate('/tasks')} className="p-3 bg-gray-50 rounded-2xl transition-transform active:scale-95"><ArrowLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Task Mission</span>
        <div className="w-12 text-[#FFC107] font-black">৳{reward}</div>
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
              <div className="relative aspect-video w-full bg-gray-950 overflow-hidden flex flex-col items-center justify-center border-b border-gray-100">
                {youtubeEmbedUrl ? (
                  <iframe
                    title="YouTube Task Video"
                    src={youtubeEmbedUrl}
                    className="w-full h-full border-none absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
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
              </div>
            </div>

            {/* In-app guidelines */}
            <div className="bg-amber-50 border border-amber-200/30 p-3.5 rounded-2xl space-y-1">
              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 leading-relaxed">
                💡 <b>পরামর্শ:</b> পেজ বা ভিডিওটি এপের ভেতরেই দেখুন এবং সময় শেষ হওয়া পর্যন্ত অপেক্ষা করুন।
              </p>
              {!youtubeEmbedUrl && !facebookEmbedUrl && (
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
          <h4 className="text-orange-800 font-bold text-sm uppercase">Instructions:</h4>
          <ul className="text-xs text-orange-700/80 font-medium space-y-2">
            <li>1. Tap "Start Task" to begin.</li>
            {initialDuration > 0 && <li>2. Wait for the timer to reach 0 seconds.</li>}
            {hasQuestions && <li>3. Fill in all survey questions properly.</li>}
            <li>4. Click "Claim Reward" once finished.</li>
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
        {initialDuration > 0 && !isActive && !isFinished && (
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
