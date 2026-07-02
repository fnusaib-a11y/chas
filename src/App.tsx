/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav, Modal, Button } from './components/UI';
import { dbService, authHelper } from './dbService';
import { AppState, User, Withdrawal, Order, Transaction, AppSettings } from './types';
import { AdManager } from './AdManager';
import { InternetGuard } from './components/InternetGuard';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Navigation Handler to manage back button and exit prompt
const NavigationHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const rootRoutes = ['/dashboard', '/login', '/'];
      if (rootRoutes.includes(location.pathname)) {
        window.history.pushState(null, '', window.location.href);
        setShowExitModal(true);
      }
    };

    const rootRoutes = ['/dashboard', '/login', '/'];
    if (rootRoutes.includes(location.pathname)) {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  const handleExit = () => {
    // Navigate home instead of closing the window, as it's unreliable in webviews
    navigate('/dashboard');
    setShowExitModal(false);
  };

  return (
    <>
      <Modal 
        isOpen={showExitModal} 
        onClose={() => setShowExitModal(false)} 
        title="অ্যাপ থেকে বের হবেন?"
      >
        <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest leading-relaxed">
          আপনি কি নিশ্চিত যে আপনি CASH অ্যাপ থেকে বের হতে চান?
        </p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 h-12 text-[10px]" onClick={() => setShowExitModal(false)}>
            না, থাকব
          </Button>
          <Button className="flex-1 h-12 text-[10px]" onClick={handleExit}>
            হ্যাঁ, বের হব
          </Button>
        </div>
      </Modal>
      {children}
    </>
  );
};

// Page Imports (will be defined in components or same file)
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreens from './screens/AuthScreens';
import Dashboard from './screens/Dashboard';
import TaskScreens from './screens/TaskScreens';
import ShopScreens from './screens/ShopScreens';
import WalletScreens from './screens/WalletScreens';
import ProfileScreens from './screens/ProfileScreens';
import AdminDashboard from './screens/AdminDashboard';
import SocialScreens from './screens/SocialScreens';
import SupportScreen from './screens/SupportScreen';
import CommunityScreen from './screens/CommunityScreen';
import MissionsScreen from './screens/MissionsScreen';
import GamesScreen from './screens/GamesScreen';
import AIChatScreen from './screens/AIChatScreen';
import VirtualShopScreen from './screens/VirtualShopScreen';
import VirtualIslandScreen from './screens/VirtualIslandScreen';
import LuckyNumberScreen from './screens/LuckyNumberScreen';
import DailyChallengesScreen from './screens/DailyChallengesScreen';
import SkillMarketplaceScreen from './screens/SkillMarketplaceScreen';
import SkillPostScreen from './screens/SkillPostScreen';
import SellerAddProductScreen from './screens/SellerAddProductScreen';
import AIShoppingScreen from './screens/AIShoppingScreen';
import FlashGiveawayScreen from './screens/FlashGiveawayScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import GroupChatDetailScreen from './screens/GroupChatDetailScreen';
import ServiceHubScreen from './screens/ServiceHubScreen';
import LogisticsHubScreen from './screens/LogisticsHubScreen';
import EducationHubScreen from './screens/EducationHubScreen';
import AIHubScreen from './screens/AIHubScreen';
import MiningScreen from './screens/MiningScreen';
import InteractiveBackground from './components/InteractiveBackground';

// Main Layout Component
const AppLayout = ({ children, hideNav, state }: { children: React.ReactNode; hideNav?: boolean; state?: AppState }) => {
  const location = useLocation();
  const isDark = state?.currentUser?.darkMode;
  const isOnline = useOnlineStatus();
  const theme = state?.currentUser?.uiTheme || 'default';

  const themeClasses = {
    default: isDark ? 'dark bg-[#064E3B]' : 'bg-[#ECFDF5]',
    gaming: 'bg-black text-emerald-500 font-mono border-2 border-emerald-500/20',
    shopping: 'bg-emerald-50 text-emerald-900 font-sans'
  };

  // If user is suspended, block their access completely
  if (state?.currentUser?.isSuspended) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-slate-900' : 'bg-rose-50/40'} max-w-md mx-auto relative flex flex-col font-sans p-8 justify-center items-center text-center space-y-6 mb-env`}>
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center text-3xl shadow-lg animate-pulse">
          🚫
        </div>
        <div className="space-y-3">
          <h1 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
            অ্যাকাউন্ট সাসপেন্ড করা হয়েছে
          </h1>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">
            Your Account Has Been Suspended
          </h2>
          <div className="p-4 bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-950/50 rounded-2xl shadow-sm text-left max-w-xs mx-auto">
            <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-1">Reason (কারণ):</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              {state.currentUser.suspensionReason || "নিয়ম লঙ্ঘনের কারণে আপনার অ্যাকাউন্টটি সাময়িকভাবে বা স্থায়ীভাবে স্থগিত করা হয়েছে।"}
            </p>
          </div>
        </div>

        <div className="w-full space-y-3 pt-4">
          <button
            onClick={() => {
              dbService.logout();
              window.location.reload();
            }}
            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm shadow-rose-600/10 flex items-center justify-center gap-2"
          >
            🚪 লগ আউট করুন (Log Out)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} max-w-md mx-auto relative flex flex-col font-sans mb-env`}>
      <InternetGuard isOnline={isOnline} />
      <div className={`fixed inset-0 pointer-events-none transition-colors -z-10 ${themeClasses[theme as keyof typeof themeClasses]}`} />
      
      {/* Beautiful Ambient Animated Background Canvas & Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <InteractiveBackground isDark={!!isDark} theme={theme} />
        {/* Soft floating blur circles overlay for depth - highly optimized & clear */}
        <div className="absolute top-[-5%] left-[-5%] w-[180px] h-[180px] bg-emerald-300/5 dark:bg-emerald-500/3 rounded-full blur-[40px]" />
        <div className="absolute bottom-[15%] right-[-5%] w-[150px] h-[150px] bg-amber-300/5 dark:bg-amber-500/3 rounded-full blur-[35px]" />
      </div>

      <main className={`flex-1 ${hideNav ? '' : 'pb-24'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideNav && <BottomNav state={state} />}
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    users: [],
    currentUser: null,
    tasks: [],
    taskLogs: [],
    products: [],
    orders: [],
    transactions: [],
    withdrawals: [],
    coupons: [],
    faqs: [],
    globalNotifications: [],
    topUsers: [],
    myGroupMessages: [],
    joinedGroupMessages: [],
    directMessages: [],
    typingIndicators: [],
    posts: [],
    missions: [],
    userMissions: [],
    scratchCards: [],
    secretDeals: [],
    lootDrops: [],
    sellerShops: [],
    followers: [],
    virtualAssets: [],
    luckyNumbers: [],
    skillTasks: [],
    dailyChallenges: [],
    iqGames: [],
    socialStories: [],
    socialNotifications: [],
    liveStreams: [],
    rechargeRequests: [],
    serviceProviders: [],
    serviceBookings: [],
    courierOrders: [],
    studentResources: [],
    resourcesOwned: [],
    mcqSets: [],
    aiRequests: [],
    aiAssets: [],
    settings: { 
      id: 'main', 
      startioAppId: '', 
      bannerAdUnitId: '', 
      interstitialAdUnitId: '', 
      maintenanceMode: false, 
      minWithdrawal: 0,
      referralCommissionRate: 20,
      hubs: {
        serviceHub: { visible: true, label: 'SERVICE HUB', subLabel: 'LOCAL EXPERTS' },
        logisticsHub: { visible: true, label: 'LOGISTICS', subLabel: 'FAST DELIVERY' },
        educationHub: { visible: true, label: 'EDUCATION', subLabel: 'STUDENT HELPER' },
        aiStudio: { visible: true, label: 'AI STUDIO', subLabel: 'TASK CREATOR' },
      },
      earningChannels: [
        { id: 'featured', name: 'Featured', emoji: '✨', path: '/tasks', enabled: true },
        { id: 'youtube', name: 'YouTube', emoji: '📺', path: '/tasks', enabled: true },
        { id: 'facebook', name: 'Facebook', emoji: '👥', path: '/tasks', enabled: true },
        { id: 'webvisit', name: 'Web Visit', emoji: '🌐', path: '/tasks', enabled: true },
        { id: 'installs', name: 'Installs', emoji: '📱', path: '/tasks/cat/Install', enabled: true },
        { id: 'surveys', name: 'Surveys', emoji: '📋', path: '/tasks/cat/Survey', enabled: true },
        { id: 'mining', name: 'Mining', emoji: '⛏️', path: '/mining', enabled: true },
        { id: 'telegram', name: 'Telegram', emoji: '💬', path: '/support', enabled: true },
        { id: 'bonus', name: 'Bonus', emoji: '⚡', path: '/daily-challenges', enabled: true },
      ],
      coinTabs: [
        { id: 'featured', name: 'Featured', enabled: true, filterType: 'featured' },
        { id: 'survey', name: 'Survey Tasks', enabled: true, filterType: 'survey' },
        { id: 'trending', name: 'Trending', enabled: true, filterType: 'trending' },
      ],
      miningCipherWord: 'MINE',
      miningCipherReward: 50000,
      miningComboCards: ['btc_pairs', 'yt_channel', 'ai_bot'],
      miningComboReward: 500000,
      miningBaseEnergy: 1000,
      miningMaxEnergyBoostsPerDay: 6,
      miningBonusPerTap: 1,
      miningProfitPerHourFactor: 1,
      miningCardsConfig: []
    },
  });

  const [loading, setLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsub = dbService.subscribeToState((newState) => {
      setState(newState);
      const userId = authHelper.getUserId();
      
      // Fixed loading logic: 
      // 1. If no user is logged in, show login screen immediately
      // 2. If a user is logged in, wait until their profile data (currentUser) is fetched from Firestore
      if (!userId) {
        setLoading(false);
      } else if (newState.currentUser) {
        setLoading(false);
      }
    });
    
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [authVersion]);

  // Pulse Interval for Time Currency
  useEffect(() => {
    if (!state.currentUser) return;
    const interval = setInterval(() => {
      dbService.updatePulse(state.currentUser!.id, 10); // Update every 10s
    }, 10000);
    return () => clearInterval(interval);
  }, [state.currentUser?.id]);

  const syncState = () => {
    setAuthVersion(v => v + 1);
  };

  useEffect(() => {
    if (state.currentUser?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.currentUser?.darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Connecting to CASH...</p>
      </div>
    );
  }

  const isAuth = !!state.currentUser;

  const playEarningSound = () => {
    if (state.currentUser?.soundEnabled === false) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    audio.play().catch(e => console.log('Sound playback failed:', e));
  };

  return (
    <BrowserRouter>
      {isAuth && state.settings && <AdManager settings={state.settings} />}
      <NavigationHandler>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to={isAuth ? "/dashboard" : "/login"} replace />} />
          <Route path="/onboarding" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AppLayout hideNav state={state}><AuthScreens mode="login" onAuth={syncState} /></AppLayout>} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />

          {/* Private Routes */}
          <Route path="/dashboard" element={isAuth ? <AppLayout state={state}><Dashboard state={state} /></AppLayout> : <Navigate to="/login" />} />
          
          {/* Task Routes */}
          <Route path="/tasks" element={isAuth ? <AppLayout state={state}><TaskScreens.List state={state} onComplete={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/tasks/history" element={isAuth ? <AppLayout state={state}><TaskScreens.History state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/tasks/cat/:category" element={isAuth ? <AppLayout state={state}><TaskScreens.List state={state} onComplete={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/tasks/:id" element={isAuth ? <AppLayout hideNav state={state}><TaskScreens.Detail state={state} onComplete={() => { syncState(); playEarningSound(); }} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/tasks/complete" element={isAuth ? <AppLayout hideNav state={state}><TaskScreens.Completion /></AppLayout> : <Navigate to="/login" />} />

          {/* Shop Routes */}
          <Route path="/shop" element={isAuth ? <AppLayout state={state}><ShopScreens.Home state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/category/:cat" element={isAuth ? <AppLayout state={state}><ShopScreens.List state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/product/:id" element={isAuth ? <AppLayout hideNav state={state}><ShopScreens.ProductDetail state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/cart" element={isAuth ? <AppLayout state={state}><ShopScreens.Cart state={state} onOrder={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/checkout" element={isAuth ? <AppLayout hideNav state={state}><ShopScreens.Checkout state={state} onOrder={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/order-tracking/:id" element={isAuth ? <AppLayout state={state}><ShopScreens.Tracking state={state} /></AppLayout> : <Navigate to="/login" />} />

          {/* Wallet Routes */}
          <Route path="/wallet" element={isAuth ? <AppLayout state={state}><WalletScreens.Home state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={isAuth ? <AppLayout hideNav state={state}><WalletScreens.Withdraw state={state} onUpdate={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/recharge" element={isAuth ? <AppLayout hideNav state={state}><WalletScreens.Recharge state={state} onUpdate={syncState} /></AppLayout> : <Navigate to="/login" />} />

          {/* User Social / Misc */}
          <Route path="/profile" element={isAuth ? <AppLayout state={state}><ProfileScreens.Main state={state} onLogout={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuth ? <AppLayout hideNav state={state}><ProfileScreens.Settings state={state} onUpdate={syncState} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/referral" element={isAuth ? <AppLayout state={state}><SocialScreens.Referral state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/orders" element={isAuth ? <AppLayout state={state}><ShopScreens.OrderList state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/rank" element={isAuth ? <AppLayout state={state}><SocialScreens.Rank state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/support" element={isAuth ? <AppLayout hideNav state={state}><SupportScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={isAuth ? <AppLayout state={state}><SocialScreens.Leaderboard state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/notifications" element={isAuth ? <AppLayout state={state}><SocialScreens.Notifications state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/community" element={isAuth ? <AppLayout state={state}><CommunityScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/missions" element={isAuth ? <AppLayout state={state}><MissionsScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/games" element={isAuth ? <AppLayout state={state}><GamesScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/ai-assistant" element={isAuth ? <AppLayout state={state}><AIChatScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/my-shop" element={isAuth ? <AppLayout state={state}><VirtualShopScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/my-shop/add-product" element={isAuth ? <AppLayout hideNav state={state}><SellerAddProductScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/shop/seller/:sellerId" element={isAuth ? <AppLayout state={state}><VirtualShopScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/island" element={isAuth ? <AppLayout state={state}><VirtualIslandScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/daily-challenges" element={isAuth ? <AppLayout state={state}><DailyChallengesScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/skills" element={isAuth ? <AppLayout state={state}><SkillMarketplaceScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/skills/post" element={isAuth ? <AppLayout hideNav state={state}><SkillPostScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/flash-giveaway" element={isAuth ? <AppLayout state={state}><FlashGiveawayScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/ai-shopping" element={isAuth ? <AppLayout state={state}><AIShoppingScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/flash-deals" element={isAuth ? <AppLayout state={state}><ShopScreens.Home state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/chat" element={isAuth ? <AppLayout state={state}><ChatListScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/chat/:userId" element={isAuth ? <AppLayout hideNav state={state}><ChatDetailScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/chat/group/:groupId" element={isAuth ? <AppLayout hideNav state={state}><GroupChatDetailScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/service-hub" element={isAuth ? <AppLayout state={state}><ServiceHubScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/logistics-hub" element={isAuth ? <AppLayout state={state}><LogisticsHubScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/education-hub" element={isAuth ? <AppLayout state={state}><EducationHubScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/ai-hub" element={isAuth ? <AppLayout state={state}><AIHubScreen state={state} /></AppLayout> : <Navigate to="/login" />} />
          <Route path="/mining" element={isAuth ? <AppLayout state={state}><MiningScreen state={state} /></AppLayout> : <Navigate to="/login" />} />

          {/* Admin */}
          <Route 
            path="/admin" 
            element={
              isAuth && state.currentUser?.isAdmin ? 
              <AdminDashboard state={state} /> : 
              <Navigate to="/dashboard" />
            } 
          />
        </Routes>
      </NavigationHandler>
    </BrowserRouter>
  );
}
