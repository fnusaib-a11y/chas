/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, User, Task, Product, Order, Transaction, Withdrawal, TaskLog, UserLevel, TaskType, OrderStatus, Coupon, GlobalNotification, AppSettings, FAQ, Post, Mission, SecretDeal, DailyMissionProgress, ScratchCard, LootDrop, SellerShop, FollowRelation, UserVirtualAsset, LuckyNumber, SkillTask, DailyChallengeStatus, IQGame, SocialStory, SocialNotification, LiveStream, ServiceProvider, ServiceBooking, CourierOrder, StudentResource, MCQSet, AIContentRequest, AIAsset, CoinTab, PromoBanner } from './types';
import { db, auth, storage } from './firebase';
import { 
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  increment,
  Timestamp,
  orderBy,
  limit,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const STORAGE_KEY = 'earn_shop_app_v1';

const INITIAL_TASKS: Task[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ad_task_${i + 1}`,
  title: `Watch Viral Ad #${i + 1}`,
  description: 'Watch a short ad to earn high rewards.',
  type: TaskType.VIDEO,
  reward: 2.5,
  duration: 15,
  category: 'Premium Ads'
}));

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Fresh Potatoes 1kg', description: 'Organically grown fresh potatoes.', price: 45, category: 'Daily Needs', image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400', stock: 100, status: 'approved' },
  { id: 'p2', name: 'Egg Maggi 2pk', description: 'Quick and tasty snack.', price: 30, category: 'Snacks', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', stock: 50, status: 'approved' },
  { id: 'p3', name: 'Dove Soap 100g', description: 'Soft and moisturizing.', price: 55, category: 'Cosmetics', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400', stock: 30, status: 'approved' },
  { id: 'p4', name: 'USB-C Cable', description: 'High speed data & charging.', price: 99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1588506191060-3904664805e7?w=400', stock: 20, isDailyDeal: true, status: 'approved' },
  { id: 'p5', name: 'Salt 1kg', description: 'Iodized table salt.', price: 35, category: 'Daily Needs', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400', stock: 200, status: 'approved' },
  { id: 'p6', name: 'Cotton Socks', description: 'Comfortable daily wear.', price: 25, category: 'Clothing', image: 'https://images.unsplash.com/photo-1582966298438-641ff1f706fa?w=400', stock: 15, status: 'approved' },
];

const INITIAL_FAQS: FAQ[] = [
  { id: 'faq1', question: 'How can I earn rewards?', answer: 'You can earn rewards by completing daily tasks, missions, and referring your friends to the CASH platform.', order: 1 },
  { id: 'faq2', question: 'What is the minimum withdrawal amount?', answer: 'The minimum withdrawal depends on the active settings configured by the admin (usually around 10 ৳).', order: 2 },
  { id: 'faq3', question: 'How long does a withdrawal request take to process?', answer: 'Withdrawals are typically processed by admins within 24 hours of submission.', order: 3 }
];

const INITIAL_NOTIFICATIONS: GlobalNotification[] = [
  { id: 'welcome', title: 'CASH তে আপনাকে স্বাগতম!', message: 'CASH অ্যাপে যোগ দেওয়ার জন্য আপনাকে ধন্যবাদ। প্রতিদিন কাজ সম্পন্ন করুন এবং আকর্ষণীয় পুরষ্কার জিতুন!', type: 'info', createdAt: new Date().toISOString() }
];

const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner_1',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    title: 'স্পেশাল বোনাস টাস্ক!',
    targetUrl: '/tasks',
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner_2',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop',
    title: 'বন্ধুদের রেফার করুন, ২০% কমিশন পান!',
    targetUrl: '/profile',
    createdAt: new Date().toISOString()
  }
];

const fileToBase64AndCompress = (file: File, maxWidth = 512, maxHeight = 512): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = reader.result as string;
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compressed JPEG to be extremely space-efficient
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export const dbService = {
  // Real-time State
  subscribeToState(onUpdate: (state: AppState) => void) {
    const userId = localStorage.getItem('current_user_id');
    
    const defaultHubs = {
      serviceHub: { visible: true, label: 'SERVICE HUB', subLabel: 'LOCAL EXPERTS' },
      logisticsHub: { visible: true, label: 'LOGISTICS', subLabel: 'FAST DELIVERY' },
      educationHub: { visible: true, label: 'EDUCATION', subLabel: 'STUDENT HELPER' },
      aiStudio: { visible: true, label: 'AI STUDIO', subLabel: 'TASK CREATOR' },
    };

    const defaultEarningChannels = [
      { id: 'featured', name: 'Featured', emoji: '✨', path: '/tasks', enabled: true },
      { id: 'youtube', name: 'YouTube', emoji: '📺', path: '/tasks', enabled: true },
      { id: 'facebook', name: 'Facebook', emoji: '👥', path: '/tasks', enabled: true },
      { id: 'webvisit', name: 'Web Visit', emoji: '🌐', path: '/tasks', enabled: true },
      { id: 'installs', name: 'Installs', emoji: '📱', path: '/tasks/cat/Install', enabled: true },
      { id: 'surveys', name: 'Surveys', emoji: '📋', path: '/tasks/cat/Survey', enabled: true },
      { id: 'mining', name: 'Mining', emoji: '⛏️', path: '/mining', enabled: true },
      { id: 'telegram', name: 'Telegram', emoji: '💬', path: '/support', enabled: true },
      { id: 'bonus', name: 'Bonus', emoji: '⚡', path: '/daily-challenges', enabled: true },
    ];

    const defaultCoinTabs: CoinTab[] = [
      { id: 'featured', name: 'Featured', enabled: true, filterType: 'featured' },
      { id: 'survey', name: 'Survey Tasks', enabled: true, filterType: 'survey' },
      { id: 'trending', name: 'Trending', enabled: true, filterType: 'trending' },
    ];

    const settings: AppSettings = { 
      id: 'main', 
      startioAppId: '204643426', 
      bannerAdUnitId: '', 
      interstitialAdUnitId: '', 
      maintenanceMode: false, 
      minWithdrawal: 0,
      referralCommissionRate: 20,
      monetagId: '',
      monetagBannerZoneId: '',
      monetagInterstitialZoneId: '',
      monetagInAppZoneId: '',
      hubs: defaultHubs,
      earningChannels: defaultEarningChannels,
      coinTabs: defaultCoinTabs
    };

    let state: AppState = {
      users: [],
      currentUser: null,
      tasks: INITIAL_TASKS,
      taskLogs: [],
      products: INITIAL_PRODUCTS,
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
      promoBanners: [],
      settings,
    };

    const updateState = (updates: Partial<AppState>) => {
      state = { ...state, ...updates };
      onUpdate(state);
    };

    const unsubs: (() => void)[] = [];

    // Global Collections
    unsubs.push(onSnapshot(doc(db, 'settings', 'main'), (sSnap) => {
      if (sSnap.exists()) {
        const data = sSnap.data();
        updateState({ 
          settings: { 
            id: sSnap.id, 
            ...data,
            hubs: data.hubs || defaultHubs,
            earningChannels: data.earningChannels || defaultEarningChannels,
            coinTabs: data.coinTabs || defaultCoinTabs
          } as AppSettings 
        });
      } else {
        // Auto-seed main settings when it doesn't exist
        setDoc(doc(db, 'settings', 'main'), settings).catch((err) => {
          console.warn("Failed to auto-seed settings:", err);
        });
      }
    }));

    unsubs.push(onSnapshot(collection(db, 'tasks'), async (snap) => {
      const dbTasks = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Task[];
      if (dbTasks.length === 0) {
        // Auto-seed initial tasks when collection is empty
        for (const t of INITIAL_TASKS) {
          setDoc(doc(db, 'tasks', t.id), t).catch(() => {});
        }
      }
      updateState({ tasks: dbTasks });
    }));

    unsubs.push(onSnapshot(collection(db, 'products'), (pSnap) => {
      const allProducts = pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
      if (allProducts.length === 0) {
        // Auto-seed initial products when collection is empty
        for (const p of INITIAL_PRODUCTS) {
          setDoc(doc(db, 'products', p.id), p).catch(() => {});
        }
      }
      updateState({ products: allProducts });
    }));

    unsubs.push(onSnapshot(collection(db, 'faqs'), (fSnap) => {
      const allFaqs = fSnap.docs.map(d => ({ id: d.id, ...d.data() })) as FAQ[];
      if (allFaqs.length === 0) {
        // Auto-seed FAQs when collection is empty
        for (const faq of INITIAL_FAQS) {
          setDoc(doc(db, 'faqs', faq.id), faq).catch(() => {});
        }
      }
      updateState({ faqs: allFaqs });
    }));

    unsubs.push(onSnapshot(collection(db, 'globalNotifications'), (gSnap) => {
      const allNotifs = gSnap.docs.map(d => ({ id: d.id, ...d.data() })) as GlobalNotification[];
      if (allNotifs.length === 0) {
        // Auto-seed notifications when collection is empty
        for (const n of INITIAL_NOTIFICATIONS) {
          setDoc(doc(db, 'globalNotifications', n.id), n).catch(() => {});
        }
      }
      updateState({ globalNotifications: allNotifs });
    }));

    unsubs.push(onSnapshot(query(collection(db, 'users'), orderBy('totalTasksCompleted', 'desc'), limit(10)), (tuSnap) => {
      updateState({ topUsers: tuSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[] });
    }));

    unsubs.push(onSnapshot(collection(db, 'sellerShops'), (ssSnap) => {
      updateState({ sellerShops: ssSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SellerShop[] });
    }));

    unsubs.push(onSnapshot(query(collection(db, 'stories'), where('expiresAt', '>', new Date().toISOString())), (sSnap) => {
      updateState({ socialStories: sSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SocialStory[] });
    }));

    unsubs.push(onSnapshot(query(collection(db, 'liveStreams'), where('isLive', '==', true)), (lsSnap) => {
      updateState({ liveStreams: lsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as LiveStream[] });
    }));

    // Recharge Requests (Admin see all, user see own) moved below logic
    
    unsubs.push(onSnapshot(collection(db, 'serviceProviders'), (spSnap) => {
      updateState({ serviceProviders: spSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ServiceProvider[] });
    }));

    unsubs.push(onSnapshot(collection(db, 'studentResources'), (srSnap) => {
      updateState({ studentResources: srSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StudentResource[] });
    }));

    unsubs.push(onSnapshot(collection(db, 'mcqSets'), (mcqSnap) => {
      updateState({ mcqSets: mcqSnap.docs.map(d => ({ id: d.id, ...d.data() })) as MCQSet[] });
    }));

    unsubs.push(onSnapshot(collection(db, 'aiAssets'), (aaSnap) => {
      updateState({ aiAssets: aaSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AIAsset[] });
    }));

    unsubs.push(onSnapshot(collection(db, 'promoBanners'), (pbSnap) => {
      const bannersList = pbSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PromoBanner[];
      if (bannersList.length === 0) {
        for (const b of INITIAL_BANNERS) {
          setDoc(doc(db, 'promoBanners', b.id), b).catch(() => {});
        }
      }
      updateState({ promoBanners: bannersList.length > 0 ? bannersList : INITIAL_BANNERS });
    }, (err) => handleFirestoreError(err, OperationType.GET, 'promoBanners')));

    // User-Specific Data
    const setupUserListeners = (uid: string) => {
      const userUnsubs: (() => void)[] = [];
      
      userUnsubs.push(onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)), (postSnap) => {
        updateState({ posts: postSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Post[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'posts')));

      userUnsubs.push(onSnapshot(collection(db, 'missions'), (mSnap) => {
        updateState({ missions: mSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Mission[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'missions')));

      userUnsubs.push(onSnapshot(collection(db, 'secretDeals'), (sdSnap) => {
        updateState({ secretDeals: sdSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SecretDeal[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'secretDeals')));

      userUnsubs.push(onSnapshot(query(collection(db, 'lootDrops'), where('expiresAt', '>', new Date().toISOString())), (ldSnap) => {
        updateState({ lootDrops: ldSnap.docs.map(d => ({ id: d.id, ...d.data() })) as LootDrop[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'lootDrops')));

      userUnsubs.push(onSnapshot(collection(db, 'skillTasks'), (stSnap) => {
        updateState({ skillTasks: stSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SkillTask[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'skillTasks')));

      userUnsubs.push(onSnapshot(collection(db, 'iqGames'), (iqSnap) => {
        updateState({ iqGames: iqSnap.docs.map(d => ({ id: d.id, ...d.data() })) as IQGame[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'iqGames')));

      userUnsubs.push(onSnapshot(collection(db, 'coupons'), (cSnap) => {
        updateState({ coupons: cSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Coupon[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'coupons')));

      userUnsubs.push(onSnapshot(query(collection(db, 'typingIndicators'), where('updatedAt', '>', new Date(Date.now() - 60000).toISOString())), (tySnap) => {
        updateState({ typingIndicators: tySnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'typingIndicators')));

      userUnsubs.push(onSnapshot(query(collection(db, 'aiContentRequests'), where('userId', '==', uid)), (aiSnap) => {
        updateState({ aiRequests: aiSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AIContentRequest[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'aiRequests')));

      userUnsubs.push(onSnapshot(query(collection(db, 'courierOrders'), where('userId', '==', uid)), (coSnap) => {
        updateState({ courierOrders: coSnap.docs.map(d => ({ id: d.id, ...d.data() })) as CourierOrder[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'courierOrders')));

      userUnsubs.push(onSnapshot(query(collection(db, 'recharge-requests'), where('userId', '==', uid)), (rrSnap) => {
        updateState({ rechargeRequests: rrSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'recharge-requests')));

      userUnsubs.push(onSnapshot(query(collection(db, 'userMissions'), where('userId', '==', uid)), (umSnap) => {
        updateState({ userMissions: umSnap.docs.map(d => ({ id: d.id, ...d.data() })) as DailyMissionProgress[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'userMissions')));

      userUnsubs.push(onSnapshot(query(collection(db, 'scratchCards'), where('userId', '==', uid)), (scSnap) => {
        updateState({ scratchCards: scSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ScratchCard[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'scratchCards')));

      userUnsubs.push(onSnapshot(query(collection(db, 'followers'), where('followerId', '==', uid)), (fSnap) => {
        updateState({ followers: fSnap.docs.map(d => ({ id: d.id, ...d.data() })) as FollowRelation[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'followers')));

      userUnsubs.push(onSnapshot(doc(db, 'virtualAssets', uid), (vaSnap) => {
        if (vaSnap.exists()) {
          updateState({ virtualAssets: [({ id: vaSnap.id, ...vaSnap.data() } as any)] });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'virtualAssets')));

      userUnsubs.push(onSnapshot(query(collection(db, 'luckyNumbers'), where('userId', '==', uid)), (lnSnap) => {
        updateState({ luckyNumbers: lnSnap.docs.map(d => ({ id: d.id, ...d.data() })) as LuckyNumber[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'luckyNumbers')));

      userUnsubs.push(onSnapshot(query(collection(db, 'dailyChallenges'), where('userId', '==', uid)), (dcSnap) => {
        updateState({ dailyChallenges: dcSnap.docs.map(d => ({ id: d.id, ...d.data() })) as DailyChallengeStatus[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'dailyChallenges')));

      userUnsubs.push(onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) {
          const user = snap.data() as User;
          updateState({ currentUser: user, resourcesOwned: user.resourcesOwned || [] });

          // Admin Data
          if (user.isAdmin) {
             userUnsubs.push(onSnapshot(collection(db, 'recharge-requests'), (rrSnap) => {
               updateState({ rechargeRequests: rrSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'recharge-requests/admin')));
             userUnsubs.push(onSnapshot(collection(db, 'withdrawals'), (wSnap) => {
               updateState({ withdrawals: wSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Withdrawal[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'withdrawals/admin')));
             userUnsubs.push(onSnapshot(collection(db, 'users'), (uSnap) => {
               updateState({ users: uSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'users/admin')));
             userUnsubs.push(onSnapshot(collection(db, 'orders'), (oSnap) => {
               updateState({ orders: oSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'orders/admin')));
             userUnsubs.push(onSnapshot(collection(db, 'taskLogs'), (tlSnap) => {
               updateState({ taskLogs: tlSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TaskLog[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'taskLogs/admin')));
          } else {
             // Non-Admin User Data
             userUnsubs.push(onSnapshot(query(collection(db, 'orders'), where('userId', '==', uid)), (oSnap) => {
               updateState({ orders: oSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'orders/my')));
             userUnsubs.push(onSnapshot(query(collection(db, 'taskLogs'), where('userId', '==', uid)), (tlSnap) => {
               updateState({ taskLogs: tlSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TaskLog[] });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'taskLogs/my')));
             userUnsubs.push(onSnapshot(query(collection(db, 'users'), where('referredBy', '==', uid)), (uSnap) => {
               const referrals = uSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
               updateState({ 
                 users: [...state.users.filter(u => u.referredBy !== uid), ...referrals] 
               });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'users/referred')));
             
             // Include the Referrer for regular users
             if (user.referredBy) {
                const rRef = doc(db, 'users', user.referredBy);
                userUnsubs.push(onSnapshot(rRef, (rSnap) => {
                  if (rSnap.exists()) {
                    const referrer = { id: rSnap.id, ...rSnap.data() } as User;
                    updateState({ users: [...state.users.filter(u => u.id !== user.referredBy), referrer] });
                  }
                }, (err) => handleFirestoreError(err, OperationType.GET, 'users/leader')));

                // Listener for joined group messages
                userUnsubs.push(onSnapshot(query(collection(db, 'groupMessages'), where('groupId', '==', user.referredBy), limit(50)), (mjSnap) => {
                  const msgs = mjSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  updateState({ joinedGroupMessages: msgs as any });
                }, (err) => handleFirestoreError(err, OperationType.GET, 'groupMessages/joined')));
             }

             // Include ALL Admins so regular users can chat with them
             userUnsubs.push(onSnapshot(query(collection(db, 'users'), where('isAdmin', '==', true)), (aSnap) => {
               const admins = aSnap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
               updateState({ 
                 users: [...state.users.filter(u => !u.isAdmin), ...admins] 
               });
             }, (err) => handleFirestoreError(err, OperationType.GET, 'users/admins')));
          }

          userUnsubs.push(onSnapshot(query(collection(db, 'socialNotifications'), where('userId', '==', uid), limit(50)), (nSnap) => {
            const sortedNotifs = nSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            updateState({ socialNotifications: sortedNotifs as SocialNotification[] });
          }, (err) => handleFirestoreError(err, OperationType.GET, 'socialNotifications')));
        } else {
           // User ID exists in localstorage but not in DB
           this.logout();
           window.location.reload(); 
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'users/me')));

      userUnsubs.push(onSnapshot(query(collection(db, 'groupMessages'), where('groupId', '==', uid), limit(50)), (mSnap) => {
        const msgs = mSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        updateState({ myGroupMessages: msgs as any });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'groupMessages/mine')));

      userUnsubs.push(onSnapshot(query(collection(db, 'directMessages'), where('participants', 'array-contains', uid), limit(100)), (dmSnap) => {
        const msgs = dmSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        updateState({ directMessages: msgs as any });

        // Fetch participant profiles for messages
        const participantIds = new Set<string>();
        msgs.forEach((m: any) => {
          m.participants.forEach((p: string) => {
            if (p !== uid) participantIds.add(p);
          });
        });

        participantIds.forEach(pId => {
          if (!state.users.find(u => u.id === pId)) {
            userUnsubs.push(onSnapshot(doc(db, 'users', pId), (uSnap) => {
              if (uSnap.exists()) {
                const newUser = { id: uSnap.id, ...uSnap.data() } as User;
                const currentUsers = [...state.users];
                const idx = currentUsers.findIndex(u => u.id === pId);
                if (idx > -1) currentUsers[idx] = newUser;
                else currentUsers.push(newUser);
                updateState({ users: currentUsers });
              }
            }));
          }
        });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'directMessages')));

      userUnsubs.push(onSnapshot(query(collection(db, 'transactions'), where('userId', '==', uid), limit(50)), (tSnap) => {
        updateState({ transactions: tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'transactions')));

      userUnsubs.push(onSnapshot(query(collection(db, 'serviceBookings'), where('userId', '==', uid)), (sbSnap) => {
        updateState({ serviceBookings: sbSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ServiceBooking[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'serviceBookings')));

      userUnsubs.push(onSnapshot(query(collection(db, 'aiContentRequests'), where('userId', '==', uid)), (aiSnap) => {
        updateState({ aiRequests: aiSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AIContentRequest[] });
      }, (err) => handleFirestoreError(err, OperationType.GET, 'aiRequests/2')));

      return () => userUnsubs.forEach(u => u());
    };

    let userCleanup: (() => void) | null = null;
    unsubs.push(auth.onAuthStateChanged(async (authUser) => {
      if (userCleanup) userCleanup();
      if (authUser) {
        // Find the active uid from localStorage fallback
        const currentUid = localStorage.getItem('current_user_id') || authUser.uid;
        userCleanup = setupUserListeners(currentUid);
      } else {
        const storedUid = localStorage.getItem('current_user_id');
        if (storedUid) {
          userCleanup = setupUserListeners(storedUid);
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.warn("Auto anonymous signin best effort failed (Anonymous Auth may be disabled): ", e);
          }
        } else {
          updateState({ currentUser: null });
        }
      }
    }));

    return () => unsubs.forEach(unsub => unsub());
  },

  // Level Logic
  checkLevelUp(user: User): UserLevel {
    if (user.totalTasksCompleted >= 1000 && user.totalReferrals >= 50) return UserLevel.MASTER;
    if (user.totalTasksCompleted >= 400 && user.totalReferrals >= 15) return UserLevel.EXPERT;
    if (user.totalTasksCompleted >= 150 && user.totalReferrals >= 5) return UserLevel.ACTIVE;
    if (user.totalTasksCompleted >= 50) return UserLevel.REGULAR;
    return UserLevel.BEGINNER;
  },

  // Auth
  async signup(userData: Partial<User>): Promise<User> {
    const phone = userData.phone || '';
    
    // Check uniqueness and handle orphan index deadlock gracefully
    const indexDoc = await getDoc(doc(db, 'phone_index', phone));
    if (indexDoc.exists()) {
      const userId = indexDoc.data()?.userId;
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          throw new Error('Phone number already registered');
        } else {
          // Delete the orphan index doc to clean up
          try {
            await deleteDoc(doc(db, 'phone_index', phone));
          } catch (e) {
            console.warn('Failed to delete orphan index during signup:', e);
          }
        }
      } else {
        try {
          await deleteDoc(doc(db, 'phone_index', phone));
        } catch (e) {
          console.warn('Failed to delete empty index during signup:', e);
        }
      }
    }

    // Ensure anonymous sign in for Firestore rules
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
    } catch (error: any) {
      console.warn('Anonymous Authentication is disabled/failed in signup:', error);
    }
    const userId = auth.currentUser?.uid || `usr_${Math.random().toString(36).substr(2, 9)}`;

    let referrerId: string | undefined = undefined;
    if (userData.referredBy) {
      const q = query(collection(db, 'users'), where('referralCode', '==', userData.referredBy.toUpperCase()));
      const referrerSnap = await getDocs(q);
      if (!referrerSnap.empty) {
        const referrerDoc = referrerSnap.docs[0];
        referrerId = referrerDoc.id;
        
        // Award referral bonus to referrer (e.g. 5 BDT)
        await updateDoc(doc(db, 'users', referrerId), {
          balance: increment(5),
          totalReferrals: increment(1)
        });

        // Record transaction for referrer
        await addDoc(collection(db, 'transactions'), {
          userId: referrerId,
          amount: 5,
          type: 'bonus',
          description: `Referral Bonus: ${userData.name || 'New User'}`,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const newUser: User = {
      id: userId,
      name: userData.name || '',
      phone: userData.phone || '',
      referralCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      groupName: `${userData.name || 'Elite'}'s Team`,
      referredBy: referrerId || null,
      balance: 0,
      pendingBalance: 0,
      bonusBalance: 0,
      totalTasksCompleted: 0,
      totalReferrals: 0,
      socialPoints: 0,
      level: UserLevel.BEGINNER,
      createdAt: new Date().toISOString(),
      streak: 0,
      ...userData,
    };
    
    await setDoc(doc(db, 'users', newUser.id), newUser);
    
    // Also track phone index for easy login
    await setDoc(doc(db, 'phone_index', newUser.phone), { userId: newUser.id });
    
    localStorage.setItem('current_user_id', newUser.id);
    return newUser;
  },

  async getUser(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
  },

  async login(phone: string): Promise<User | null> {
    const indexDoc = await getDoc(doc(db, 'phone_index', phone));
    if (indexDoc.exists()) {
      const userId = indexDoc.data().userId;
      
      // Ensure Firebase Auth is signed in even if we have local storage
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
      } catch (error: any) {
        console.warn('Anonymous Authentication is disabled/failed in login:', error);
      }

      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const user = userDoc.data() as User;
          localStorage.setItem('current_user_id', user.id);
          return user;
        } else {
          // Clean up the orphan index doc to avoid deadlock
          try {
            await deleteDoc(doc(db, 'phone_index', phone));
          } catch (e) {
            console.warn('Failed to delete orphan index in login:', e);
          }
        }
      } else {
        try {
          await deleteDoc(doc(db, 'phone_index', phone));
        } catch (e) {
          console.warn('Failed to delete empty index in login:', e);
        }
      }
    }
    return null;
  },

  logout() {
    localStorage.removeItem('current_user_id');
  },

  async updateCurrentUser(updates: Partial<User>) {
    const userId = localStorage.getItem('current_user_id');
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId), updates);
  },

  async updateUser(userId: string, updates: Partial<User>) {
    await updateDoc(doc(db, 'users', userId), updates);
  },

  async enterReferralCode(code: string): Promise<{ success: boolean; message: string }> {
    const userId = localStorage.getItem('current_user_id');
    if (!userId) return { success: false, message: 'লগইন করুন প্রথমে।' };
    
    const codes = code.trim().toUpperCase();
    const q = query(collection(db, 'users'), where('referralCode', '==', codes));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { success: false, message: 'ভুল রেফারেল কোড! দয়া করে সঠিক কোড দিন।' };
    }
    
    const referrerUser = snap.docs[0].data() as User;
    const referrerId = referrerUser.id || snap.docs[0].id;
    if (referrerId === userId) {
      return { success: false, message: 'আপনি নিজের কোড নিজে রেফার করতে পারবেন না।' };
    }
    
    await updateDoc(doc(db, 'users', userId), {
      referralStatus: 'pending',
      pendingReferredBy: referrerId
    });
    
    return { success: true, message: 'রেফার কোড সফলভাবে সাবমিট হয়েছে। এডমিন সাকসেস দিলেই আপনার বোনাস পেয়ে যাবেন।' };
  },

  async approveReferral(candidateUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const uRef = doc(db, 'users', candidateUserId);
      const uSnap = await getDoc(uRef);
      if (!uSnap.exists()) {
        return { success: false, message: 'ইউজার খুঁজে পাওয়া যায়নি।' };
      }
      
      const user = uSnap.data() as User;
      if (user.referralStatus !== 'pending') {
        return { success: false, message: 'এই রেফারেলটি পেন্ডিং অবস্থায় নেই।' };
      }
      
      const referrerId = user.pendingReferredBy;
      if (!referrerId) {
        // Fallback: If pendingReferredBy is missing, approve the user anyway
        await updateDoc(uRef, {
          referralStatus: 'approved',
        });
        return { success: true, message: 'রেফারেল সফলভাবে সাকসেসফুল করা হয়েছে (কোন রেফারার ছিল না)।' };
      }

      const referrerRef = doc(db, 'users', referrerId);
      const referrerSnap = await getDoc(referrerRef);
      
      if (referrerSnap.exists()) {
        const referrer = referrerSnap.data() as User;
        
        await updateDoc(uRef, {
          referredBy: referrerId,
          referralStatus: 'approved',
          balance: increment(5),
        });
        
        await updateDoc(referrerRef, {
          balance: increment(5),
          totalReferrals: increment(1)
        });
        
        await addDoc(collection(db, 'transactions'), {
          userId: candidateUserId,
          amount: 5,
          type: 'bonus',
          description: `Affiliate Referral Bonus (Referrer: ${referrer.name || 'Sponsor'})`,
          status: 'completed',
          createdAt: new Date().toISOString()
        });
        
        await addDoc(collection(db, 'transactions'), {
          userId: referrerId,
          amount: 5,
          type: 'bonus',
          description: `Commission Referral Bonus: ${user.name || 'New User'}`,
          status: 'completed',
          createdAt: new Date().toISOString()
        });
      } else {
        await updateDoc(uRef, {
          referralStatus: 'approved',
        });
        return { success: true, message: 'রেফারেল সাকসেসফুল করা হয়েছে (কিন্তু রেফারার ডাটাবেজে পাওয়া যায়নি)।' };
      }
      return { success: true, message: 'সফলভাবে রেফারেল সফল (সাকসেস) হয়েছে!' };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: `সমস্যা হয়েছে: ${e.message || e}` };
    }
  },

  async rejectReferral(candidateUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const uRef = doc(db, 'users', candidateUserId);
      await updateDoc(uRef, {
        referralStatus: 'rejected',
        pendingReferredBy: null
      });
      return { success: true, message: 'রেফারেল রিজেক্ট করা হয়েছে।' };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: `রিজেক্ট করার সময় ভুল হয়েছে: ${e.message || e}` };
    }
  },

  async uploadProfileImage(file: File): Promise<string> {
    const userId = localStorage.getItem('current_user_id');
    if (!userId) throw new Error('Not logged in');
    
    // 1. Client-side compression to super lightweight JPEG (max 512x512)
    const compressedBase64 = await fileToBase64AndCompress(file, 512, 512);

    // 2. Try Firebase Storage with a fast 1500ms timeout
    try {
      const storageRef = ref(storage, `avatars/${userId}`);
      const uploadPromise = uploadBytes(storageRef, file).then(async () => {
        return await getDownloadURL(storageRef);
      });

      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 1500)
      );

      const url = await Promise.race([uploadPromise, timeoutPromise]);
      await this.updateCurrentUser({ avatar: url });
      return url;
    } catch (err) {
      console.warn('Firebase Storage upload failed or timed out. Falling back to compressed Base64.', err);
      // Fallback: save compressed Base64 directly
      await this.updateCurrentUser({ avatar: compressedBase64 });
      return compressedBase64;
    }
  },

  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    // 1. Client-side compression to super lightweight JPEG (max 512x512)
    const compressedBase64 = await fileToBase64AndCompress(file, 512, 512);

    // 2. Try Firebase Storage with a fast 1500ms timeout
    try {
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${filename}`);
      const uploadPromise = uploadBytes(storageRef, file).then(async () => {
        return await getDownloadURL(storageRef);
      });

      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 1500)
      );

      const url = await Promise.race([uploadPromise, timeoutPromise]);
      return url;
    } catch (err) {
      console.warn('Firebase Storage upload failed or timed out. Falling back to compressed Base64.', err);
      // Fallback: return compressed Base64 directly
      return compressedBase64;
    }
  },

  // Tasks
  async completeTask(taskId: string, user: User, actualReward: number, taskTitle?: string, surveyAnswers?: any[]): Promise<boolean> {
    let taskUrl = '';
    let title = taskTitle || 'External Activity';
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        const data = taskDoc.data();
        taskUrl = data.url || '';
        title = data.title || title;
      }
    } catch (err) {
      console.warn("Failed to fetch task details from firestore:", err);
    }

    if (!taskUrl) {
      const task = INITIAL_TASKS.find((t) => t.id === taskId);
      taskUrl = task?.url || '';
      title = task?.title || title;
    }

    if (taskUrl) {
      try {
        const q = query(
          collection(db, 'taskLogs'),
          where('userId', '==', user.id),
          where('taskUrl', '==', taskUrl)
        );
        const snap = await getDocs(q);
        const alreadyDone = snap.docs.some(d => d.data().status !== 'rejected');
        if (alreadyDone) {
          console.warn(`User ${user.id} has already completed task link ${taskUrl}`);
          return false;
        }
      } catch (err) {
        console.warn("Failed to check duplicate task URL logs:", err);
      }
    }

    // Create log
    const logBatch: any = {
      userId: user.id,
      taskId: taskId,
      taskUrl: taskUrl,
      completedAt: new Date().toISOString(),
      reward: actualReward,
      status: 'pending',
    };
    if (surveyAnswers) {
      logBatch.surveyAnswers = surveyAnswers;
    }
    
    try {
      await addDoc(collection(db, 'taskLogs'), logBatch);
      
      // Update user balance (increment pending)
      await updateDoc(doc(db, 'users', user.id), {
        pendingBalance: increment(actualReward)
      });

      // Save transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.id,
        amount: actualReward,
        type: 'earn',
        description: `Task: ${title}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'completeTask');
      return false;
    }
  },

  // Admin Actions
  async adminApproveTask(log: TaskLog) {
    if (log.status !== 'pending') return;
    try {
      // 1. Update log status
      await updateDoc(doc(db, 'taskLogs', log.id), { 
        status: 'approved',
        processedAt: new Date().toISOString()
      });

      // 2. Update user balances
      const userRef = doc(db, 'users', log.userId);
      const uSnap = await getDoc(userRef);
      if (!uSnap.exists()) {
        console.warn(`User ${log.userId} not found for task log ${log.id}`);
        return;
      }

      await updateDoc(userRef, {
        pendingBalance: increment(-log.reward),
        balance: increment(log.reward),
        totalTasksCompleted: increment(1)
      });

      // 3. Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: log.userId,
        amount: log.reward,
        type: 'earn',
        description: `Task Approved (ID: ${log.taskId})`,
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      // 4. TEAM COMMISSION LOGIC (Multi-Level Commission Tree: ছোট থেকে বড় পর্যন্ত সবাই কমিশন পাবে)
      const userDoc = await getDoc(doc(db, 'users', log.userId));
      const settingsDoc = await getDoc(doc(db, 'settings', 'main'));
      const baseCommissionRate = settingsDoc.exists() ? (settingsDoc.data().referralCommissionRate || 20) : 20;

      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        
        // Multi-level dynamic commission loop following referredBy pointers up the tree
        // Tier 1: baseCommissionRate % (default 20%), Tier 2: 10%, Tier 3: 5%, Tier 4: 2.5%, Tier 5: 1%
        let currentUplineId = user.referredBy;
        let tier = 1;
        const tierCommissionRates = [baseCommissionRate, 10, 5, 2.5, 1];
        
        while (currentUplineId && tier <= 5) {
          const uplineRef = doc(db, 'users', currentUplineId);
          const uplineSnap = await getDoc(uplineRef);
          
          if (uplineSnap.exists()) {
            const uplineUser = uplineSnap.data() as User;
            const currentRate = tierCommissionRates[tier - 1] ?? 1;
            const commissionAmount = Math.round(log.reward * (currentRate / 100));
            
            await updateDoc(uplineRef, {
              balance: increment(commissionAmount)
            });

            // Record commission transaction for this level upline
            await addDoc(collection(db, 'transactions'), {
              userId: currentUplineId,
              amount: commissionAmount,
              type: 'commission',
              description: `Tier ${tier} commission path: [${user.name}] task (reward: ৳${log.reward})`,
              status: 'completed',
              createdAt: new Date().toISOString(),
            });
            
            // Move up to the next upline
            currentUplineId = uplineUser.referredBy || null;
            tier++;
          } else {
            break;
          }
        }

        const newLevel = this.checkLevelUp(user);
        if (newLevel !== user.level) {
          await updateDoc(doc(db, 'users', user.id), { level: newLevel });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `taskLogs/${log.id}`);
    }
  },

  async adminRejectTask(log: TaskLog) {
    try {
      await updateDoc(doc(db, 'taskLogs', log.id), { 
        status: 'rejected',
        processedAt: new Date().toISOString()
      });
      const userRef = doc(db, 'users', log.userId);
      const uSnap = await getDoc(userRef);
      if (uSnap.exists()) {
        await updateDoc(userRef, {
          pendingBalance: increment(-log.reward)
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `taskLogs/${log.id}`);
    }
  },

  async requestWithdrawal(userId: string, amount: number, method: string, details: string) {
    if (amount <= 0) return false;
    
    try {
      // Deduct balance first
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(-amount)
      });

      const withdrawal = {
        userId,
        amount,
        method,
        details,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'withdrawals'), withdrawal);

      // Activity Log
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount: -amount,
        type: 'withdraw',
        description: `Withdraw: ${method} to ${details}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `withdrawals/request`);
      return false;
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'status'>) {
    await addDoc(collection(db, 'products'), {
      ...product,
      status: 'pending'
    });
  },

  async adminApproveProduct(productId: string) {
    await updateDoc(doc(db, 'products', productId), { status: 'approved' });
  },

  async adminRejectProduct(productId: string) {
    await updateDoc(doc(db, 'products', productId), { status: 'rejected' });
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    await updateDoc(doc(db, 'products', productId), updates);
  },

  async submitSkillTask(task: Omit<SkillTask, 'id'>) {
    await addDoc(collection(db, 'skillTasks'), task);
  },

  async claimSkillTask(taskId: string, userId: string) {
    await updateDoc(doc(db, 'skillTasks', taskId), {
      status: 'claimed',
      claimedBy: userId,
      claimedAt: new Date().toISOString()
    });
  },

  async updateWithdrawalStatus(withdrawalId: string, status: 'approved' | 'rejected' | 'completed' | 'pending') {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status,
        processedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `withdrawals/${withdrawalId}`);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, extra?: any) {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString(),
      ...extra
    });
  },

  async updateSettings(settings: Partial<AppSettings>) {
    await setDoc(doc(db, 'settings', 'main'), settings, { merge: true });
  },

  async setAdmin(userId: string, status: boolean) {
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: status
    });
  },

  async activateAdminSecret(userId: string, secret: string): Promise<boolean> {
    if (secret === 'KI-LAGBE-BOSS') {
      await this.setAdmin(userId, true);
      return true;
    }
    return false;
  },

  async addTask(task: Omit<Task, 'id'>) {
    await addDoc(collection(db, 'tasks'), task);
  },

  async deleteTask(taskId: string) {
    await deleteDoc(doc(db, 'tasks', taskId));
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    await updateDoc(doc(db, 'tasks', taskId), updates);
  },

  async deleteProduct(productId: string) {
    await deleteDoc(doc(db, 'products', productId));
  },

  async addCoupon(coupon: Omit<Coupon, 'id'>) {
    await addDoc(collection(db, 'coupons'), coupon);
  },

  async deleteCoupon(couponId: string) {
    await deleteDoc(doc(db, 'coupons', couponId));
  },

  async updateCoupon(couponId: string, updates: Partial<Coupon>) {
    await updateDoc(doc(db, 'coupons', couponId), updates);
  },

  async sendGlobalNotification(notif: Omit<GlobalNotification, 'id'>) {
    await addDoc(collection(db, 'globalNotifications'), notif);
  },

  async deleteGlobalNotification(id: string) {
    await deleteDoc(doc(db, 'globalNotifications', id));
  },

  async updateGlobalNotification(id: string, updates: Partial<GlobalNotification>) {
    await updateDoc(doc(db, 'globalNotifications', id), updates);
  },

  // FAQs
  async addFAQ(faq: any) {
    await addDoc(collection(db, 'faqs'), faq);
  },

  async updateFAQ(faqId: string, updates: any) {
    await updateDoc(doc(db, 'faqs', faqId), updates);
  },

  async deleteFAQ(faqId: string) {
    await deleteDoc(doc(db, 'faqs', faqId));
  },

  // Promo Banners
  async addPromoBanner(banner: any) {
    await addDoc(collection(db, 'promoBanners'), banner);
  },

  async updatePromoBanner(bannerId: string, updates: any) {
    await updateDoc(doc(db, 'promoBanners', bannerId), updates);
  },

  async deletePromoBanner(bannerId: string) {
    await deleteDoc(doc(db, 'promoBanners', bannerId));
  },

  // Shop
  async createOrder(order: Partial<Order>, user: User): Promise<boolean> {
    if (order.paymentMethod === 'wallet' && user.balance < (order.totalPrice || 0)) {
       return false;
    }

    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder = {
      userId: user.id,
      items: order.items || [],
      totalPrice: order.totalPrice || 0,
      address: order.address || '',
      phone: order.phone || '',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      paymentMethod: order.paymentMethod || 'cod',
    };

    if (order.paymentMethod === 'wallet') {
      await updateDoc(doc(db, 'users', user.id), {
        balance: increment(-(order.totalPrice || 0))
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.id,
        amount: -(order.totalPrice || 0),
        type: 'spend',
        description: `Order ${orderId}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }

    await addDoc(collection(db, 'orders'), newOrder);
    return true;
  },

  // Group Messaging
  async sendGroupMessage(text: string, user: User, targetGroupId?: string) {
    const groupId = targetGroupId || user.id;
    const message = {
      groupId,
      senderId: user.id,
      senderName: user.name,
      text,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'groupMessages'), message);
  },

  async sendDirectMessage(text: string, user: User, recipient: User) {
    const message = {
      participants: [user.id, recipient.id],
      senderId: user.id,
      senderName: user.name,
      recipientId: recipient.id,
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'directMessages'), message);
  },

  async setTypingStatus(userId: string, userName: string, targetId: string, isTyping: boolean) {
    const id = `typing_${userId}_${targetId}`;
    if (isTyping) {
      await setDoc(doc(db, 'typingIndicators', id), {
        userId,
        userName,
        targetId,
        updatedAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(doc(db, 'typingIndicators', id));
    }
  },

  async markDirectMessageRead(messageId: string) {
    await updateDoc(doc(db, 'directMessages', messageId), { isRead: true });
  },

  async markGroupMessageRead(messageId: string, userId: string) {
    const docRef = doc(db, 'groupMessages', messageId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      const readBy = data.readBy || [];
      if (!readBy.includes(userId)) {
        await updateDoc(docRef, {
          readBy: [...readBy, userId]
        });
      }
    }
  },

  // Social Feed
  // Community & Social
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'reactions' | 'sharesCount'>, user?: any) {
    const newPost: Omit<Post, 'id'> = {
      ...post,
      likes: [],
      reactions: {},
      comments: [],
      sharesCount: 0,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'posts'), newPost);
  },

  async reactToPost(postId: string, userId: string, reactionType: string) {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
    const post = snap.data() as Post;
    const reactions = post.reactions || {};
    if (reactions[userId] === reactionType) {
      delete reactions[userId];
    } else {
      reactions[userId] = reactionType;
      // Also notify
      await this.notify(post.userId, userId, 'like', postId, `reacted to your post`);
    }
    await updateDoc(postRef, { reactions });
  },

  async notify(userId: string, fromUserId: string, type: string, targetId: string, text: string) {
    if (userId === fromUserId) return;
    const user = await getDoc(doc(db, 'users', fromUserId));
    if (!user.exists()) return;
    const userData = user.data() as User;

    await addDoc(collection(db, 'socialNotifications'), {
      userId,
      fromUserId,
      fromUserName: userData.name,
      fromUserAvatar: userData.avatar,
      type,
      targetId,
      text,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  },

  async addComment(postId: string, text: string, user: User) {
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text,
      createdAt: new Date().toISOString()
    };
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const post = snap.data() as Post;
      await updateDoc(postRef, { comments: [...(post.comments || []), comment] });
      await this.notify(post.userId, user.id, 'comment', postId, `commented on your post: "${text.substring(0, 20)}..."`);
    }
  },

  async deletePost(postId: string) {
    await deleteDoc(doc(db, 'posts', postId));
  },

  async likePost(postId: string, userId: string) {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
    const post = snap.data() as Post;
    const likes = post.likes || [];
    if (likes.includes(userId)) {
      await updateDoc(postRef, { likes: likes.filter(id => id !== userId) });
    } else {
      await updateDoc(postRef, { likes: [...likes, userId] });
    }
  },

  // Stories
  async createStory(userId: string, type: 'image' | 'video', url: string) {
    const user = await getDoc(doc(db, 'users', userId));
    if (!user.exists()) return;
    const userData = user.data() as User;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await addDoc(collection(db, 'stories'), {
      userId,
      userName: userData.name,
      userAvatar: userData.avatar,
      type,
      url,
      viewers: [],
      expiresAt,
      createdAt: new Date().toISOString()
    });
  },

  async viewStory(storyId: string, userId: string) {
    const sRef = doc(db, 'stories', storyId);
    const snap = await getDoc(sRef);
    if (!snap.exists()) return;
    const viewers = snap.data().viewers || [];
    if (!viewers.includes(userId)) {
      await updateDoc(sRef, { viewers: [...viewers, userId] });
    }
  },

  // Following
  async toggleFollow(followerId: string, followingId: string) {
    const id = `${followerId}_${followingId}`;
    const fRef = doc(db, 'followers', id);
    const snap = await getDoc(fRef);
    
    if (snap.exists()) {
      await deleteDoc(fRef);
      await updateDoc(doc(db, 'users', followerId), { following: increment(-1) });
      await updateDoc(doc(db, 'users', followingId), { followers: increment(-1) });
    } else {
      await setDoc(fRef, { followerId, followingId, createdAt: new Date().toISOString() });
      await updateDoc(doc(db, 'users', followerId), { following: increment(1) });
      await updateDoc(doc(db, 'users', followingId), { followers: increment(1) });
      await this.notify(followingId, followerId, 'follow', followerId, `started following you`);
    }
  },

  // Live Streaming
  async startLive(userId: string, title: string) {
    const user = await getDoc(doc(db, 'users', userId));
    if (!user.exists()) return;
    const userData = user.data() as User;

    const stream = {
      creatorId: userId,
      creatorName: userData.name,
      creatorAvatar: userData.avatar,
      title,
      viewersCount: 0,
      isLive: true,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'liveStreams'), stream);
    return docRef.id;
  },

  async endLive(streamId: string) {
    await updateDoc(doc(db, 'liveStreams', streamId), { isLive: false });
  },

  async joinLive(streamId: string) {
    await updateDoc(doc(db, 'liveStreams', streamId), { viewersCount: increment(1) });
  },

  async leaveLive(streamId: string) {
    await updateDoc(doc(db, 'liveStreams', streamId), { viewersCount: increment(-1) });
  },

  // Missions & Streaks
  async updateMissionProgress(userId: string, type: 'tasks' | 'referrals' | 'spend', incrementValue: number = 1) {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'userMissions'), where('userId', '==', userId), where('date', '==', today));
    const snap = await getDocs(q);
    
    // Find active missions of this type
    const mSnap = await getDocs(query(collection(db, 'missions'), where('status', '==', 'active'), where('type', '==', type)));
    const activeMissions = mSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Mission[];

    for (const mission of activeMissions) {
      const existing = snap.docs.find(d => d.data().missionId === mission.id);
      if (existing) {
        if (!existing.data().completed) {
          const newCurrent = existing.data().current + incrementValue;
          const completed = newCurrent >= mission.goal;
          await updateDoc(doc(db, 'userMissions', existing.id), {
            current: newCurrent,
            completed
          });
          if (completed) {
            await this.rewardUser(userId, mission.reward, `Mission: ${mission.title}`);
          }
        }
      } else {
        const completed = incrementValue >= mission.goal;
        await addDoc(collection(db, 'userMissions'), {
          userId,
          missionId: mission.id,
          current: incrementValue,
          completed,
          date: today
        });
        if (completed) {
          await this.rewardUser(userId, mission.reward, `Mission: ${mission.title}`);
        }
      }
    }
  },

  async rewardUser(userId: string, amount: number, description: string) {
     await updateDoc(doc(db, 'users', userId), {
       balance: increment(amount)
     });
     await addDoc(collection(db, 'transactions'), {
       userId,
       amount,
       type: 'bonus',
       description,
       status: 'completed',
       createdAt: new Date().toISOString()
     });
  },

  async processStrike(user: User) {
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastCheckIn) {
      lastCheckIn.setHours(0, 0, 0, 0);
      const diff = (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        // Continuous
        const newStreak = (user.streak || 0) + 1;
        await updateDoc(doc(db, 'users', user.id), { streak: newStreak, lastCheckIn: new Date().toISOString() });
        // Bonus for streak every 7 days
        if (newStreak % 7 === 0) {
          await this.rewardUser(user.id, 10, `7-Day Streak Bonus!`);
        }
      } else if (diff > 1) {
        // Broken
        await updateDoc(doc(db, 'users', user.id), { streak: 1, lastCheckIn: new Date().toISOString() });
      }
    } else {
      await updateDoc(doc(db, 'users', user.id), { streak: 1, lastCheckIn: new Date().toISOString() });
    }
  },

  async claimDailyCheckIn(user: User): Promise<boolean> {
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastCheckIn) {
      lastCheckIn.setHours(0, 0, 0, 0);
      if (lastCheckIn.getTime() === today.getTime()) {
        return false;
      }
    }

    let newStreak = 1;
    if (lastCheckIn) {
      const diff = (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        newStreak = (user.streak || 0) + 1;
      }
    }

    await this.rewardUser(user.id, 5, `Daily Check-In Streak: ${newStreak} Days (+50 Coins)`);

    await updateDoc(doc(db, 'users', user.id), {
      streak: newStreak,
      lastCheckIn: new Date().toISOString()
    });

    return true;
  },

  async addMission(mission: Omit<Mission, 'id'>) {
    await addDoc(collection(db, 'missions'), mission);
  },

  async deleteMission(missionId: string) {
    await deleteDoc(doc(db, 'missions', missionId));
  },

  async updateMission(missionId: string, updates: Partial<Mission>) {
    await updateDoc(doc(db, 'missions', missionId), updates);
  },

  // Scratch Cards
  async generateScratchCard(userId: string) {
    const reward = Math.floor(Math.random() * 5) + 1; // 1-5 BDT
    await addDoc(collection(db, 'scratchCards'), {
      userId,
      reward,
      isRevealed: false,
      type: 'random',
      createdAt: new Date().toISOString()
    });
  },

  async revealScratchCard(cardId: string, userId: string, rewardValue: number) {
    await updateDoc(doc(db, 'scratchCards', cardId), { isRevealed: true });
    await this.rewardUser(userId, rewardValue, `Scratch Card Win!`);
  },

  // Lucky Number
  async buyLuckyNumber(userId: string, number: number, price: number) {
    await addDoc(collection(db, 'luckyNumbers'), {
      userId,
      number,
      reward: price * 10,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    await this.updateUserBalance(userId, -price);
  },

  // New Features
  async updatePulse(userId: string, seconds: number) {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const user = snap.data() as User;
    
    // Earn 1 Time Coin every 60 seconds
    const newActiveTime = (user.activeTimeToday || 0) + seconds;
    const coinsToEarn = Math.floor(newActiveTime / 60) - Math.floor((user.activeTimeToday || 0) / 60);
    
    await updateDoc(userRef, {
      activeTimeToday: newActiveTime,
      timeCoins: increment(coinsToEarn)
    });
  },

  async updateDailyChallenge(userId: string, type: 'login' | 'task' | 'shopping') {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'dailyChallenges'), where('userId', '==', userId), where('date', '==', today));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      await addDoc(collection(db, 'dailyChallenges'), {
        userId,
        date: today,
        hasLoggedIn: type === 'login',
        tasksCompleted: type === 'task' ? 1 : 0,
        shoppingDone: type === 'shopping',
        isClaimed: false
      });
    } else {
      const docId = snap.docs[0].id;
      const data = snap.docs[0].data();
      const updates: any = {};
      if (type === 'login') updates.hasLoggedIn = true;
      if (type === 'task') updates.tasksCompleted = increment(1);
      if (type === 'shopping') updates.shoppingDone = true;
      await updateDoc(doc(db, 'dailyChallenges', docId), updates);
    }
  },

  async claimDailyChallenge(dcId: string, userId: string) {
    await updateDoc(doc(db, 'dailyChallenges', dcId), { isClaimed: true });
    await this.rewardUser(userId, 50, 'Daily Challenge Giant Reward!');
  },

  async completeSkillTask(taskId: string, userId: string, reward: number) {
    await updateDoc(doc(db, 'skillTasks', taskId), { status: 'completed' });
    await this.rewardUser(userId, reward, 'Skill Task Completion');
  },

  async solveIQGame(gameId: string, userId: string, reward: number) {
    await this.rewardUser(userId, reward, 'IQ Game Reward');
  },

  getDynamicPrice(product: Product) {
    // Price fluctuates by up to 5% every minute
    const now = new Date();
    const seed = now.getMinutes() + now.getHours() * 60;
    const variation = Math.sin(seed) * 0.05; // -5% to +5%
    return Math.round(product.price * (1 + variation));
  },

  async recharge(userId: string, mobileNumber: string, operator: string, amount: number, type: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;
    const user = snap.data() as User;
    if (user.balance < amount) return false;

    try {
      // 1. Create a request for admin approval
      await addDoc(collection(db, 'recharge-requests'), {
        userId,
        userName: user.name,
        userPhone: user.phone,
        mobileNumber,
        operator,
        amount,
        type,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // 2. We deduct balance immediately (escrow)
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      // 3. Log initial transaction as pending
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount: -amount,
        type: 'spend',
        description: `Mobile Recharge Request: ${operator} (${mobileNumber})`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `recharge/${userId}`);
      return false;
    }
  },

  async adminApproveRecharge(request: any) {
    try {
      const requestRef = doc(db, 'recharge-requests', request.id);
      await updateDoc(requestRef, { status: 'approved' });

      // Add cashback if qualified
      if (request.amount >= 50) {
        const userRef = doc(db, 'users', request.userId);
        await updateDoc(userRef, { balance: increment(10) });
        await addDoc(collection(db, 'transactions'), {
          userId: request.userId,
          amount: 10,
          type: 'earn',
          description: `Recharge Hub Cashback (for ${request.operator})`,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }

      // Update the spend transaction status to completed
      const q = query(collection(db, 'transactions'), where('userId', '==', request.userId), where('status', '==', 'pending'), limit(1));
      const tSnap = await getDocs(q);
      if (!tSnap.empty) {
        await updateDoc(doc(db, 'transactions', tSnap.docs[0].id), { 
          status: 'completed',
          description: `Mobile Recharge Success: ${request.operator} (${request.mobileNumber})`
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `approve-recharge/${request.id}`);
    }
  },

  async adminRejectRecharge(request: any) {
    try {
      const requestRef = doc(db, 'recharge-requests', request.id);
      await updateDoc(requestRef, { status: 'rejected' });

      // Refund user
      const userRef = doc(db, 'users', request.userId);
      await updateDoc(userRef, { balance: increment(request.amount) });

      // Update/Add refund transaction
      await addDoc(collection(db, 'transactions'), {
        userId: request.userId,
        amount: request.amount,
        type: 'earn',
        description: `Recharge Hub Refund (Rejected: ${request.operator})`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `reject-recharge/${request.id}`);
    }
  },

  async updateUserBalance(userId: string, amount: number) {
    await updateDoc(doc(db, 'users', userId), {
      balance: increment(amount)
    });
  },

  async claimLootDrop(lootId: string, userId: string, reward: number) {
    await deleteDoc(doc(db, 'lootDrops', lootId));
    await this.rewardUser(userId, reward, 'Loot Drop Discovery');
  },

  async addSecretDeal(deal: any) {
    await addDoc(collection(db, 'secretDeals'), deal);
  },

  async deleteSecretDeal(dealId: string) {
    await deleteDoc(doc(db, 'secretDeals', dealId));
  },

  async updateSecretDeal(dealId: string, updates: Partial<SecretDeal>) {
    await updateDoc(doc(db, 'secretDeals', dealId), updates);
  },

  async updateSellerShop(shopId: string, updates: any) {
    await updateDoc(doc(db, 'sellerShops', shopId), updates);
  },

  // Hub Actions
  async addServiceProvider(provider: Omit<ServiceProvider, 'id'>) {
    await addDoc(collection(db, 'serviceProviders'), provider);
  },

  async updateServiceProvider(id: string, updates: Partial<ServiceProvider>) {
    await updateDoc(doc(db, 'serviceProviders', id), updates);
  },

  async deleteServiceProvider(id: string) {
    await deleteDoc(doc(db, 'serviceProviders', id));
  },

  async deleteServiceBooking(id: string) {
    await deleteDoc(doc(db, 'serviceBookings', id));
  },

  async updateServiceBooking(id: string, updates: Partial<ServiceBooking>) {
    await updateDoc(doc(db, 'serviceBookings', id), updates);
  },

  async deleteCourierOrder(id: string) {
    await deleteDoc(doc(db, 'courierOrders', id));
  },

  async updateCourierOrder(id: string, updates: Partial<CourierOrder>) {
    await updateDoc(doc(db, 'courierOrders', id), updates);
  },

  async updateStudentResource(id: string, updates: Partial<StudentResource>) {
    await updateDoc(doc(db, 'studentResources', id), updates);
  },

  async deleteStudentResource(id: string) {
    await deleteDoc(doc(db, 'studentResources', id));
  },

  async addMCQSet(set: Omit<MCQSet, 'id'>) {
    await addDoc(collection(db, 'mcqSets'), set);
  },

  async updateMCQSet(id: string, updates: Partial<MCQSet>) {
    await updateDoc(doc(db, 'mcqSets', id), updates);
  },

  async deleteMCQSet(id: string) {
    await deleteDoc(doc(db, 'mcqSets', id));
  },

  async bookService(booking: Omit<ServiceBooking, 'id'>) {
    await addDoc(collection(db, 'serviceBookings'), booking);
  },

  async updateBookingStatus(bookingId: string, status: ServiceBooking['status']) {
    await updateDoc(doc(db, 'serviceBookings', bookingId), { status });
  },

  async createCourierOrder(order: Omit<CourierOrder, 'id'>) {
    await addDoc(collection(db, 'courierOrders'), order);
  },

  async uploadResource(resource: Omit<StudentResource, 'id'>) {
    await addDoc(collection(db, 'studentResources'), resource);
  },

  async buyResource(resourceId: string, userId: string, price: number) {
    if (price > 0) {
      await this.updateUserBalance(userId, -price);
      // Find resource owner to credit
      const res = await getDoc(doc(db, 'studentResources', resourceId));
      if (res.exists()) {
        await this.rewardUser(res.data().userId, price, `Resource Sale: ${res.data().title}`);
      }
    }
    await updateDoc(doc(db, 'studentResources', resourceId), { downloads: increment(1) });
  },

  async requestAIContent(request: Omit<AIContentRequest, 'id'>) {
    await addDoc(collection(db, 'aiContentRequests'), request);
  },

  async sellAIAsset(asset: Omit<AIAsset, 'id'>) {
    await addDoc(collection(db, 'aiAssets'), asset);
  },

  async startMining(userId: string): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      miningStartedAt: new Date().toISOString(),
      isMiningActive: true
    });
  },

  async claimMining(userId: string, earnedAmount: number): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      balance: increment(earnedAmount),
      miningStartedAt: new Date().toISOString(),
      miningLastClaimedAt: new Date().toISOString(),
      isMiningActive: true
    });

    await addDoc(collection(db, 'transactions'), {
      userId,
      amount: earnedAmount,
      type: 'earn',
      description: `Mining Income (+${earnedAmount.toFixed(2)} Coins)`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  },

  async transferHamsterMiningToMainBalance(userId: string, amount: number): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    const addedBalance = Math.floor(amount / 10);
    let newBalance = addedBalance;

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentBalance = userData.balance || 0;
      newBalance = Math.round(currentBalance + addedBalance);
    }

    await updateDoc(userDocRef, {
      balance: newBalance,
      hamsterMiningBalance: 0
    });

    await addDoc(collection(db, 'transactions'), {
      userId,
      amount: addedBalance,
      type: 'earn',
      description: `Hamster Mining Game Transfer to Wallet (+${(addedBalance * 10).toFixed(0)} Coins) 🪙`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  },

  async stopMiningSession(userId: string, earnedAmount: number): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      balance: increment(earnedAmount),
      isMiningActive: false,
      miningLastClaimedAt: new Date().toISOString()
    });

    if (earnedAmount > 0) {
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount: earnedAmount,
        type: 'earn',
        description: `Mining Session Completed (+${earnedAmount.toFixed(2)} Coins)`,
        status: 'completed',
        createdAt: new Date().toISOString()
      });
    }
  },

  async upgradeMiningRig(userId: string, nextLevel: number, cost: number): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      balance: increment(-cost),
      miningLevel: nextLevel
    });

    await addDoc(collection(db, 'transactions'), {
      userId,
      amount: -cost,
      type: 'spend',
      description: `Upgraded Mining Rig to Lvl ${nextLevel}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  }
};
