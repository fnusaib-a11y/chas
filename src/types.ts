/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserLevel {
  BEGINNER = 1,
  REGULAR = 2,
  ACTIVE = 3,
  EXPERT = 4,
  MASTER = 5,
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
  pendingBalance: number;
  bonusBalance: number;
  totalTasksCompleted: number;
  totalReferrals: number;
  level: UserLevel;
  lastCheckIn?: string; // ISO date string
  createdAt: string;
  avatar?: string;
  avatarConfig?: {
    skin: string;
    hair: string;
    clothing: string;
    accessory: string;
  };
  timeCoins?: number;
  activeTimeToday?: number; // in seconds
  uiTheme?: 'gaming' | 'shopping' | 'default';
  stylePreferences?: string[];
  age?: number;
  budget?: number;
  searchHistory?: string[];
  shoppingList?: {
    productId: string;
    productName: string;
    reason: string;
  }[];
  streak: number;
  groupName?: string;
  isAdmin?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  darkMode?: boolean;
  soundEnabled?: boolean;
  coverPhoto?: string;
  bio?: string;
  followers?: string[]; // UIDs
  following?: string[]; // UIDs
  isVerified?: boolean;
  isVIP?: boolean;
  socialPoints?: number;
  resourcesOwned?: string[];
  referralStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  pendingReferredBy?: string;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  kycFullName?: string;
  kycNidOrPassport?: string;
  kycPaymentNumber?: string;
  kycFacebookPhone?: string;
  kycFacebookPassword?: string;
  kycSubmittedAt?: string;
  kycRejectReason?: string;
  kycDob?: string;
  kycPhone?: string;
  kycEmail?: string;
  kycAddress?: string;
  kycDocType?: string;
  kycFrontImage?: string;
  kycBackImage?: string;
  kycSelfie?: string;
  kycPaymentNumberConfirmed?: boolean;
  kycDeclarationAccepted?: boolean;
  tutorialSeen?: boolean;
  miningStartedAt?: string;
  miningLevel?: number;
  miningLastClaimedAt?: string;
  isMiningActive?: boolean;
  hamsterProfitPerHour?: number;
  hamsterLastClaimedAt?: string;
  hamsterMultiTapLevel?: number;
  hamsterEnergyLevel?: number;
  hamsterCurrentEnergy?: number;
  hamsterLastActiveAt?: string;
  hamsterCards?: Record<string, number>;
  hamsterLastCipherClaimedAt?: string;
  hamsterLastComboClaimedAt?: string;
  hamsterFullEnergyClaimsToday?: number;
  hamsterLastFullEnergyClaimedAt?: string;
  hamsterMiningBalance?: number;
}

export enum TaskType {
  INSTALL = 'install',
  SURVEY = 'survey',
  CHECKIN = 'checkin',
  LINK = 'link',
  VIDEO = 'video',
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  type: 'text' | 'mcq' | 'checkbox';
  options?: string[];
  required?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  reward: number;
  duration?: number; // seconds - required duration to spend on task
  minDurationRequired?: number; // Explicit duration setting by admin
  url?: string;
  adCode?: string; // Direct ad link or script code
  isDaily?: boolean;
  category: string;
  questions?: SurveyQuestion[];
}

export interface TaskLog {
  id: string;
  userId: string;
  taskId: string;
  completedAt: string;
  reward: number;
  status: 'pending' | 'approved' | 'rejected';
  surveyAnswers?: {
    questionId: string;
    questionText: string;
    answer: string | string[];
  }[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  isDailyDeal?: boolean;
  flashSaleUntil?: string;
  status: 'pending' | 'approved' | 'rejected';
  sellerId?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  REJECTED = 'rejected',
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  value: number;
  minSpend?: number;
  expiresAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  deliveryCharge: number;
  discount: number;
  address: string;
  phone: string;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: 'wallet' | 'cod';
  estimatedDeliveryDate?: string;
  carrier?: string;
  trackingNumber?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'withdraw' | 'bonus' | 'commission';
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Bank';
  details: string;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  createdAt: string;
  processedAt?: string;
}

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'update';
  imageUrl?: string;
  showAsPopup?: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface HubSettings {
  visible: boolean;
  label: string;
  subLabel: string;
  bg?: string;
  color?: string;
}

export interface AppSettings {
  id: string;
  startioAppId: string;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  maintenanceMode: boolean;
  minWithdrawal: number;
  referralCommissionRate: number; // e.g. 20 for 20%
  monetagId?: string;
  monetagBannerZoneId?: string;
  monetagInterstitialZoneId?: string;
  monetagInAppZoneId?: string;
  globalMinTaskDuration?: number; // Global duration in seconds
  devDebugMode?: boolean;
  devBypassTaskTimer?: boolean;
  devMockAdsEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  withdrawalsDisabledReason?: string;
  withdrawalsReopenDate?: string;
  coinRate?: number; // How many coins = 1 BDT (e.g. 100)
  hubs: {
    serviceHub: HubSettings;
    logisticsHub: HubSettings;
    educationHub: HubSettings;
    aiStudio: HubSettings;
  };
  earningChannels?: EarningChannel[];
  coinTabs?: CoinTab[];
  miningCipherWord?: string;
  miningCipherReward?: number;
  miningComboCards?: string[];
  miningComboReward?: number;
  miningBaseEnergy?: number;
  miningMaxEnergyBoostsPerDay?: number;
  miningBonusPerTap?: number;
  miningProfitPerHourFactor?: number;
  miningCardsConfig?: {
    id: string;
    name: string;
    banglaName: string;
    emoji: string;
    category: string;
    baseCost: number;
    baseProfit: number;
    description: string;
  }[];
}

export interface CoinTab {
  id: string;
  name: string;
  enabled: boolean;
  filterType: 'featured' | 'survey' | 'trending' | 'install' | 'link' | 'special' | 'social' | 'all';
}

export interface EarningChannel {
  id: string;
  name: string;
  emoji: string;
  path: string;
  enabled: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string; // The ID of the Team Leader
  senderId: string;
  senderName: string;
  text: string;
  readBy: string[]; // List of UIDs who saw this
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  participants: string[]; // [uid1, uid2]
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface TypingStatus {
  id: string;
  userId: string;
  userName: string;
  targetId: string; // groupId or recipientId
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'product' | 'proof';
  mediaUrl?: string;
  productId?: string;
  likes: string[]; // UIDs
  reactions: { [userId: string]: string }; // userId -> reactionType (like, heart, lol, wow, cry, angry)
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
  }[];
  sharesCount: number;
  isSponsored?: boolean;
  createdAt: string;
}

export interface SocialStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'image';
  url: string;
  viewers: string[];
  expiresAt: string;
  createdAt: string;
}

export interface SocialNotification {
  id: string;
  userId: string; // Target user
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'gift' | 'order_update';
  targetId?: string; // postId, commentId, orderId
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface LiveStream {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  viewersCount: number;
  isLive: boolean;
  thumbnail?: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  goal: number;
  reward: number;
  type: 'tasks' | 'referrals' | 'spend';
  status: 'active' | 'completed' | 'expired';
}

export interface DailyMissionProgress {
  id: string;
  userId: string;
  missionId: string;
  current: number;
  completed: boolean;
  date: string;
}

export interface ScratchCard {
  id: string;
  userId: string;
  reward: number;
  isRevealed: boolean;
  type: 'fixed' | 'random';
  createdAt: string;
}

export interface SecretDeal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  expiresAt: string;
  isActive: boolean;
}

export interface LootDrop {
  id: string;
  type: 'coin' | 'discount' | 'product' | 'coupon';
  value: number;
  productId?: string;
  couponId?: string;
  claimedBy?: string;
  claimedAt?: string;
  expiresAt: string;
}

export interface SellerShop {
  id: string;
  userId: string;
  name: string;
  banner?: string;
  theme: 'modern' | 'retro' | 'neon' | 'glass';
  isMusicEnabled: boolean;
  musicUrl?: string; // e.g. youtube or mp3
  isAnimated: boolean;
  description: string;
  followersCount: number;
  totalSales: number;
  products: string[]; // Product IDs
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface UserVirtualAsset {
  id: string;
  userId: string;
  level: number;
  type: 'island' | 'building';
  exp: number;
  lastGrowthAt: string;
}

export interface LuckyNumber {
  id: string;
  userId: string;
  number: number;
  reward: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export interface SkillTask {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  type: 'logo' | 'typing' | 'task';
  reward: number;
  status: 'open' | 'claimed' | 'completed';
  createdAt: string;
}

export interface IQGame {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  reward: number;
}

export interface DailyChallengeStatus {
  id: string;
  userId: string;
  hasLoggedIn: boolean;
  tasksCompleted: number;
  shoppingDone: boolean; // At least one order
  isClaimed: boolean;
  date: string;
}

export interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  mobileNumber: string;
  operator: string;
  amount: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  name: string;
  category: 'plumber' | 'electrician' | 'mechanic' | 'cleaner' | 'repair' | 'other';
  phone: string;
  location: { lat: number; lng: number; address: string };
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  basePrice: number;
  bio: string;
  availability: boolean;
}

export interface ServiceBooking {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  category: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  price: number;
  scheduledAt: string;
  address: string;
  phone: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface CourierOrder {
  id: string;
  userId: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  price: number;
  status: 'pending' | 'rider_assigned' | 'picked_up' | 'delivered' | 'cancelled';
  trackingId: string;
  riderId?: string;
  riderName?: string;
  createdAt: string;
}

export interface StudentResource {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: 'Note' | 'PDF' | 'Book' | 'Question';
  url: string;
  previewUrl: string;
  price: number; // 0 for free
  category: string; // e.g. "Physics", "Math"
  createdAt: string;
}

export interface MCQSet {
  id: string;
  title: string;
  subject: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  reward: number;
  timeLimit: number; // minutes
}

export interface AIContentRequest {
  id: string;
  userId: string;
  type: string;
  prompt: string;
  result: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface AIAsset {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  type: 'Model' | 'Prompt' | 'Art';
  previewUrl: string;
  price: number;
  status: 'active' | 'sold';
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  imageUrl: string;
  targetUrl?: string;
  title?: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  tasks: Task[];
  taskLogs: TaskLog[];
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  coupons: Coupon[];
  faqs: FAQ[];
  globalNotifications: GlobalNotification[];
  topUsers: User[];
  myGroupMessages: GroupMessage[];
  joinedGroupMessages: GroupMessage[];
  directMessages: DirectMessage[];
  typingIndicators: TypingStatus[];
  posts: Post[];
  missions: Mission[];
  userMissions: DailyMissionProgress[];
  scratchCards: ScratchCard[];
  secretDeals: SecretDeal[];
  lootDrops: LootDrop[];
  sellerShops: SellerShop[];
  followers: FollowRelation[];
  virtualAssets: UserVirtualAsset[];
  luckyNumbers: LuckyNumber[];
  skillTasks: SkillTask[];
  dailyChallenges: DailyChallengeStatus[];
  iqGames: IQGame[];
  socialStories: SocialStory[];
  socialNotifications: SocialNotification[];
  liveStreams: LiveStream[];
  rechargeRequests: RechargeRequest[];
  serviceProviders: ServiceProvider[];
  serviceBookings: ServiceBooking[];
  courierOrders: CourierOrder[];
  studentResources: StudentResource[];
  resourcesOwned: string[]; // List of StudentResource IDs
  mcqSets: MCQSet[];
  aiRequests: AIContentRequest[];
  aiAssets: AIAsset[];
  promoBanners: PromoBanner[];
  settings: AppSettings;
}
