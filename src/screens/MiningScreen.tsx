/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Zap, Flame, Clock, Cpu, Award, Trophy, Play, CheckCircle, 
  AlertCircle, Sparkles, Shield, ChevronRight, Hammer, TrendingUp, Info, 
  Coins, Volume2, VolumeX, HelpCircle, Check, Compass, Users, Radio, Calendar
} from 'lucide-react';
import { Card, Button, BannerAdSlot } from '../components/UI';
import { AppState, User } from '../types';
import { dbService } from '../dbService';
import { ads } from '../lib/ads';

// Import Mascot Image
// @ts-ignore
import hamsterMascot from '../assets/images/hamster_mascot_1782915988596.jpg';

// Rank configuration
interface RankInfo {
  name: string;
  emoji: string;
  minCoins: number;
}

const HAMSTER_RANKS: RankInfo[] = [
  { name: 'Bronze', emoji: '🥉', minCoins: 0 },
  { name: 'Silver', emoji: '🥈', minCoins: 5000 },
  { name: 'Gold', emoji: '🥇', minCoins: 25000 },
  { name: 'Platinum', emoji: '💎', minCoins: 100000 },
  { name: 'Diamond', emoji: '👑', minCoins: 1000000 },
  { name: 'Master', emoji: '🧙‍♂️', minCoins: 10000000 },
  { name: 'Grandmaster', emoji: '⚡', minCoins: 50000000 },
  { name: 'Lord', emoji: '🌌', minCoins: 100000000 },
];

// Cards upgrade definition
interface UpgradeCard {
  id: string;
  name: string;
  banglaName: string;
  emoji: string;
  category: 'markets' | 'team' | 'legal' | 'specials';
  baseCost: number;
  costMultiplier: number;
  baseProfit: number;
  profitMultiplier: number;
  description: string;
}

const UPGRADE_CARDS: UpgradeCard[] = [
  // Markets
  { id: 'btc_pairs', name: 'BTC Pairs Trading', banglaName: 'বিটিসি পেয়ার ট্রেডিং', emoji: '📈', category: 'markets', baseCost: 150, costMultiplier: 1.45, baseProfit: 15, profitMultiplier: 1.35, description: 'Trade Bitcoin pairs for solid consistent passive gains.' },
  { id: 'eth_pairs', name: 'ETH Pairs Trading', banglaName: 'ইথেরিয়াম ট্রেডিং', emoji: '📉', category: 'markets', baseCost: 400, costMultiplier: 1.48, baseProfit: 45, profitMultiplier: 1.36, description: 'Trade Ethereum on low margin to increase returns.' },
  { id: 'meme_coins', name: 'Meme Coins Venture', banglaName: 'মিম কয়েন ভেঞ্চার', emoji: '🐕', category: 'markets', baseCost: 1200, costMultiplier: 1.5, baseProfit: 140, profitMultiplier: 1.38, description: 'Highly volatile, high reward investments in trending meme coins.' },
  { id: 'derivatives', name: 'DeFi Derivatives', banglaName: 'ডিপাই ডেরিভেটিভস', emoji: '⛓️', category: 'markets', baseCost: 4500, costMultiplier: 1.55, baseProfit: 550, profitMultiplier: 1.4, description: 'Liquidity pools and decentralized margin leverage systems.' },
  
  // PR & Team
  { id: 'yt_channel', name: 'Hamster YT Channel', banglaName: 'ইউটিউব চ্যানেল ক্রিয়েশন', emoji: '📺', category: 'team', baseCost: 200, costMultiplier: 1.4, baseProfit: 20, profitMultiplier: 1.32, description: 'Create viral videos to attract more miners and investors.' },
  { id: 'tg_community', name: 'Telegram Community', banglaName: 'টেলিগ্রাম কমিউনিটি', emoji: '💬', category: 'team', baseCost: 500, costMultiplier: 1.42, baseProfit: 60, profitMultiplier: 1.33, description: 'Engage with our army of tap-to-earn community members.' },
  { id: 'support_team', name: '24/7 Support Desk', banglaName: 'গ্রাহক সেবা টিম', emoji: '🎧', category: 'team', baseCost: 1500, costMultiplier: 1.45, baseProfit: 190, profitMultiplier: 1.35, description: 'Improve user retention and confidence with helpful customer support.' },
  { id: 'influencers', name: 'Influencer Marketing', banglaName: 'ইনফ্লুয়েন্সার পার্টনারশিপ', emoji: '📢', category: 'team', baseCost: 5000, costMultiplier: 1.5, baseProfit: 680, profitMultiplier: 1.38, description: 'Collaborate with top crypto influencers to hype our token.' },

  // Legal
  { id: 'lic_europe', name: 'Europe Crypto License', banglaName: 'ইউরোপ লাইসেন্স', emoji: '🇪🇺', category: 'legal', baseCost: 800, costMultiplier: 1.45, baseProfit: 95, profitMultiplier: 1.34, description: 'Establish legal compliance in European jurisdictions.' },
  { id: 'lic_asia', name: 'Asia Operative License', banglaName: 'এশিয়া অপারেটিভ লাইসেন্স', emoji: '🌏', category: 'legal', baseCost: 2500, costMultiplier: 1.48, baseProfit: 320, profitMultiplier: 1.36, description: 'Expand our services into high-volume Asian markets.' },
  { id: 'kyc_system', name: 'KYC Verification System', banglaName: 'কেওয়াইসি ভেরিফিকেশন', emoji: '🆔', category: 'legal', baseCost: 6000, costMultiplier: 1.52, baseProfit: 850, profitMultiplier: 1.39, description: 'Automated user identity check to reduce fraud risk.' },
  { id: 'aml_protocol', name: 'Anti-Money Laundering', banglaName: 'এএমএল প্রটোকল', emoji: '🛡️', category: 'legal', baseCost: 15000, costMultiplier: 1.58, baseProfit: 2300, profitMultiplier: 1.42, description: 'High-level audits to guarantee safety and compliance.' },

  // Specials
  { id: 'ai_bot', name: 'AI Quantitative Bot', banglaName: 'এআই কোয়ান্টাম ট্রেডিং', emoji: '🤖', category: 'specials', baseCost: 3000, costMultiplier: 1.6, baseProfit: 450, profitMultiplier: 1.45, description: 'Let AI analyze market trends to execute automated trades.' },
  { id: 'musk_collab', name: 'Musk Direct Collab', banglaName: 'ইলন মাস্ক সরাসরি পার্টনারশিপ', emoji: '🚀', category: 'specials', baseCost: 25000, costMultiplier: 1.7, baseProfit: 4200, profitMultiplier: 1.5, description: 'A single tweet from the leader of Mars sky-rockets our volume!' },
  { id: 'web3_summit', name: 'Global Web3 Summit Host', banglaName: 'ওয়ার্ল্ড ওয়েব৩ সামিট', emoji: '🎪', category: 'specials', baseCost: 75000, costMultiplier: 1.75, baseProfit: 14500, profitMultiplier: 1.52, description: 'Host the premier cryptocurrency conference of the year.' },
];

// Morse Code Dictionary
const MORSE_DICTIONARY: Record<string, string> = {
  '•—': 'A', '—•••': 'B', '—•—•': 'C', '—••': 'D', '•': 'E',
  '••—•': 'F', '——•': 'G', '••••': 'H', '••': 'I', '•———': 'J',
  '—•—': 'K', '•—••': 'L', '——': 'M', '—•': 'N', '———': 'O',
  '•——•': 'P', '——•—': 'Q', '•—•': 'R', '•••': 'S', '—': 'T',
  '••—': 'U', '•••—': 'V', '•——': 'W', '—••—': 'X', '—•——': 'Y',
  '——••': 'Z'
};

const GLOBAL_DEFAULT_CIPHER_WORD = 'MINE';
const GLOBAL_DEFAULT_CIPHER_CODES = ['——', '••', '—•', '•'];

export default function MiningScreen({ state }: { state: AppState }) {
  const user = state.currentUser;
  const navigate = useNavigate();

  // Dynamic parameters from Admin Panel Settings
  const currentCipherWord = useMemo(() => {
    return (state.settings?.miningCipherWord || GLOBAL_DEFAULT_CIPHER_WORD).toUpperCase();
  }, [state.settings?.miningCipherWord]);

  const currentCipherCodes = useMemo(() => {
    const REVERSE_MORSE: Record<string, string> = {};
    Object.entries(MORSE_DICTIONARY).forEach(([code, letter]) => {
      REVERSE_MORSE[letter as string] = code;
    });
    return currentCipherWord.split('').map(char => REVERSE_MORSE[char as string] || '');
  }, [currentCipherWord]);

  const CIPHER_WORD = currentCipherWord;
  const CIPHER_CODES = currentCipherCodes;

  const COMBO_CARDS = useMemo(() => {
    return state.settings?.miningComboCards || ['btc_pairs', 'yt_channel', 'ai_bot'];
  }, [state.settings?.miningComboCards]);

  const UPGRADE_CARDS = useMemo(() => {
    if (state.settings?.miningCardsConfig && state.settings.miningCardsConfig.length > 0) {
      return state.settings.miningCardsConfig as UpgradeCard[];
    }
    return [
      // Markets
      { id: 'btc_pairs', name: 'BTC Pairs Trading', banglaName: 'বিটিসি পেয়ার ট্রেডিং', emoji: '📈', category: 'markets', baseCost: 150, costMultiplier: 1.45, baseProfit: 15, profitMultiplier: 1.35, description: 'Trade Bitcoin pairs for solid consistent passive gains.' },
      { id: 'eth_pairs', name: 'ETH Pairs Trading', banglaName: 'ইথেরিয়াম ট্রেডিং', emoji: '📉', category: 'markets', baseCost: 400, costMultiplier: 1.48, baseProfit: 45, profitMultiplier: 1.36, description: 'Trade Ethereum on low margin to increase returns.' },
      { id: 'meme_coins', name: 'Meme Coins Venture', banglaName: 'মিম কয়েন ভেঞ্চার', emoji: '🐕', category: 'markets', baseCost: 1200, costMultiplier: 1.5, baseProfit: 140, profitMultiplier: 1.38, description: 'Highly volatile, high reward investments in trending meme coins.' },
      { id: 'derivatives', name: 'DeFi Derivatives', banglaName: 'ডিপাই ডেরিভেটিভস', emoji: '⛓️', category: 'markets', baseCost: 4500, costMultiplier: 1.55, baseProfit: 550, profitMultiplier: 1.4, description: 'Liquidity pools and decentralized margin leverage systems.' },
      
      // PR & Team
      { id: 'yt_channel', name: 'Hamster YT Channel', banglaName: 'ইউটিউব চ্যানেল ক্রিয়েশন', emoji: '📺', category: 'team', baseCost: 200, costMultiplier: 1.4, baseProfit: 20, profitMultiplier: 1.32, description: 'Create viral videos to attract more miners and investors.' },
      { id: 'tg_community', name: 'Telegram Community', banglaName: 'টেলিগ্রাম কমিউনিটি', emoji: '💬', category: 'team', baseCost: 500, costMultiplier: 1.42, baseProfit: 60, profitMultiplier: 1.33, description: 'Engage with our army of tap-to-earn community members.' },
      { id: 'support_team', name: '24/7 Support Desk', banglaName: 'গ্রাহক সেবা টিম', emoji: '🎧', category: 'team', baseCost: 1500, costMultiplier: 1.45, baseProfit: 190, profitMultiplier: 1.35, description: 'Improve user retention and confidence with helpful customer support.' },
      { id: 'influencers', name: 'Influencer Marketing', banglaName: 'ইনফ্লুয়েন্সার পার্টনারশিপ', emoji: '📢', category: 'team', baseCost: 5000, costMultiplier: 1.5, baseProfit: 680, profitMultiplier: 1.38, description: 'Collaborate with top crypto influencers to hype our token.' },

      // Legal
      { id: 'lic_europe', name: 'Europe Crypto License', banglaName: 'ইউরোপ লাইসেন্স', emoji: '🇪🇺', category: 'legal', baseCost: 800, costMultiplier: 1.45, baseProfit: 95, profitMultiplier: 1.34, description: 'Establish legal compliance in European jurisdictions.' },
      { id: 'lic_asia', name: 'Asia Operative License', banglaName: 'এশিয়া অপারেটিভ লাইসেন্স', emoji: '🌏', category: 'legal', baseCost: 2500, costMultiplier: 1.48, baseProfit: 320, profitMultiplier: 1.36, description: 'Expand our services into high-volume Asian markets.' },
      { id: 'kyc_system', name: 'KYC Verification System', banglaName: 'কেওয়াইসি ভেরিফিকেশন', emoji: '🆔', category: 'legal', baseCost: 6000, costMultiplier: 1.52, baseProfit: 850, profitMultiplier: 1.39, description: 'Automated user identity check to reduce fraud risk.' },
      { id: 'aml_protocol', name: 'Anti-Money Laundering', banglaName: 'এএমএল প্রটোকল', emoji: '🛡️', category: 'legal', baseCost: 15000, baseProfit: 2300, description: 'High-level audits to guarantee safety and compliance.' } as any, // fallback for schema diffs
    ];
  }, [state.settings?.miningCardsConfig]);

  const cipherBonusCoins = state.settings?.miningCipherReward ?? 50000;
  const comboBonusCoins = state.settings?.miningComboReward ?? 500000;
  const maxEnergyBoostsValue = state.settings?.miningMaxEnergyBoostsPerDay ?? 6;
  const miningBaseEnergyValue = state.settings?.miningBaseEnergy ?? 500;
  const miningBonusPerTap = state.settings?.miningBonusPerTap ?? 1;

  const getCardProfitValue = (level: number) => {
    if (level <= 0) return 0;
    const factor = state.settings?.miningProfitPerHourFactor ?? 1;
    const q = Math.floor((level - 1) / 4);
    const r = (level - 1) % 4;
    let val24h = 0;
    if (r === 0) val24h = q * 0.1 + 0.0001;
    else if (r === 1) val24h = q * 0.1 + 0.0010;
    else if (r === 2) val24h = q * 0.1 + 0.0100;
    else val24h = (q + 1) * 0.1;
    return (val24h / 24) * factor; // Hourly profit
  };

  // Active Navigation Screen Tab inside Mining screen: 'exchange' | 'mine' | 'cipher' | 'boosts'
  const [activeScreenTab, setActiveScreenTab] = useState<'exchange' | 'mine' | 'cipher' | 'boosts'>('exchange');
  
  // Mining upgrade station category
  const [activeCategory, setActiveCategory] = useState<'markets' | 'team' | 'legal' | 'specials'>('markets');

  // Sound toggle (fallbacks to true)
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    const localSound = localStorage.getItem('mining_sound_on');
    return localSound !== null ? localSound === 'true' : true;
  });
  const lastSoundUserIdRef = useRef<string | null>(null);

  // Floating Taps Particle state
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; value: number }[]>([]);

  // Local synchronized states (to avoid rapid Firestore writes on every click)
  const [localBalance, setLocalBalance] = useState<number>(0);
  const [profitPerHour, setProfitPerHour] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [multiTapLevel, setMultiTapLevel] = useState<number>(1);
  const [energyLevel, setEnergyLevel] = useState<number>(1);
  const [ownedCards, setOwnedCards] = useState<Record<string, number>>({});
  
  // Welcome back offline earnings state
  const [offlineEarnings, setOfflineEarnings] = useState<{ hours: number; coins: number } | null>(null);
  
  // Status feedback / Toast messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Daily Cipher Morse Code states
  const [cipherInput, setCipherInput] = useState<string>(''); // Current dots/dashes e.g. '•—'
  const [solvedWord, setSolvedWord] = useState<string>(''); // Decrypted characters so far e.g. 'M'
  const [cipherCompletedToday, setCipherCompletedToday] = useState<boolean>(false);
  const pointerStartRef = useRef<number>(0);
  const cipherTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Daily Combo Tracker
  // In our combo, they must own 'btc_pairs', 'yt_channel', and 'ai_bot' at Level 1 or higher
  const [comboCompletedToday, setComboCompletedToday] = useState<boolean>(false);

  // Full Energy boost limit tracker (6 per day)
  const [fullEnergyClaims, setFullEnergyClaims] = useState<number>(0);
  const [lastFullEnergyClaimedAt, setLastFullEnergyClaimedAt] = useState<string>('');

  // Local changes pending save indicator
  const isDirtyRef = useRef<boolean>(false);

  // Refs to hold the latest values for background saving without re-running effects
  const latestBalanceRef = useRef<number>(localBalance);
  const latestEnergyRef = useRef<number>(energy);
  const latestUserRef = useRef<User | null>(user);

  // Sync refs with state on every render
  latestBalanceRef.current = localBalance;
  latestEnergyRef.current = energy;
  latestUserRef.current = user;

  const lastInitializedUserIdRef = useRef<string | null>(null);

  // Initialize values from Current User profile
  useEffect(() => {
    if (!user) return;

    // Calculate total profit per hour based on cards under the new rule
    const userCards = user.hamsterCards || {};
    let calculatedProfit = 0;
    UPGRADE_CARDS.forEach(card => {
      const lvl = userCards[card.id] || 0;
      if (lvl > 0) {
        calculatedProfit += getCardProfitValue(lvl);
      }
    });

    if (lastInitializedUserIdRef.current !== user.id) {
      lastInitializedUserIdRef.current = user.id;

      setLocalBalance(user.hamsterMiningBalance || 0);
      setProfitPerHour(calculatedProfit);
      setMultiTapLevel(user.hamsterMultiTapLevel || 1);
      setEnergyLevel(user.hamsterEnergyLevel || 1);
      setOwnedCards(userCards);
      setFullEnergyClaims(user.hamsterFullEnergyClaimsToday || 0);
      setLastFullEnergyClaimedAt(user.hamsterLastFullEnergyClaimedAt || '');

      // Check if daily cipher completed today
      if (user.hamsterLastCipherClaimedAt) {
        const lastClaim = new Date(user.hamsterLastCipherClaimedAt);
        const today = new Date();
        if (lastClaim.toDateString() === today.toDateString()) {
          setCipherCompletedToday(true);
          setSolvedWord(CIPHER_WORD);
        } else {
          setCipherCompletedToday(false);
          setSolvedWord('');
        }
      } else {
        setCipherCompletedToday(false);
        setSolvedWord('');
      }

      // Check if daily combo completed today
      if (user.hamsterLastComboClaimedAt) {
        const lastClaim = new Date(user.hamsterLastComboClaimedAt);
        const today = new Date();
        if (lastClaim.toDateString() === today.toDateString()) {
          setComboCompletedToday(true);
        } else {
          setComboCompletedToday(false);
        }
      } else {
        setComboCompletedToday(false);
      }

      // Calculate energy restoration offline since last active
      const maxEnergyVal = (user.hamsterEnergyLevel || 1) * miningBaseEnergyValue;
      const initialEnergy = user.hamsterCurrentEnergy !== undefined ? user.hamsterCurrentEnergy : maxEnergyVal;
      
      if (user.hamsterLastActiveAt) {
        const lastActive = new Date(user.hamsterLastActiveAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.max(0, (now - lastActive) / 1000);
        const regenerated = Math.floor(elapsedSeconds / 300); // +1 energy every 5 minutes (300 seconds)
        setEnergy(Math.min(maxEnergyVal, initialEnergy + regenerated));
      } else {
        setEnergy(initialEnergy);
      }

      // Calculate passive offline earnings accumulated (cap at 3 hours of offline time)
      if (calculatedProfit > 0) {
        const lastClaimTime = user.hamsterLastClaimedAt 
          ? new Date(user.hamsterLastClaimedAt).getTime() 
          : (user.hamsterLastActiveAt ? new Date(user.hamsterLastActiveAt).getTime() : Date.now());
        
        const now = Date.now();
        const elapsedMs = now - lastClaimTime;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);

        if (elapsedHours >= 0.01) { // minimum 36 seconds away
          const cappedHours = Math.min(3, elapsedHours);
          const coinsEarned = parseFloat((cappedHours * calculatedProfit).toFixed(2));
          
          if (coinsEarned > 1) {
            setOfflineEarnings({
              hours: elapsedHours,
              coins: coinsEarned
            });
          }
        }
      }
    } else {
      // Keep static variables in sync if updated from external database
      setProfitPerHour(calculatedProfit);
      setMultiTapLevel(user.hamsterMultiTapLevel || 1);
      setEnergyLevel(user.hamsterEnergyLevel || 1);
      setOwnedCards(userCards);
      setFullEnergyClaims(user.hamsterFullEnergyClaimsToday || 0);
      setLastFullEnergyClaimedAt(user.hamsterLastFullEnergyClaimedAt || '');
    }

    // Sound setting
    if (user.soundEnabled !== undefined && lastSoundUserIdRef.current !== user.id) {
      setSoundOn(user.soundEnabled);
      lastSoundUserIdRef.current = user.id;
    }
  }, [user, UPGRADE_CARDS]);

  // Max energy limit
  const maxEnergy = useMemo(() => energyLevel * miningBaseEnergyValue, [energyLevel, miningBaseEnergyValue]);

  // Current CEO Rank Title & Level configuration
  const { currentRank, nextRank, progressToNextRank } = useMemo(() => {
    const currentBalance = localBalance;
    const currentRankIndex = [...HAMSTER_RANKS].reverse().findIndex(r => currentBalance >= r.minCoins);
    const activeRank = currentRankIndex !== -1 ? HAMSTER_RANKS[HAMSTER_RANKS.length - 1 - currentRankIndex] : HAMSTER_RANKS[0];
    const followingRank = HAMSTER_RANKS[HAMSTER_RANKS.indexOf(activeRank) + 1] || null;

    let progress = 100;
    if (followingRank) {
      const range = followingRank.minCoins - activeRank.minCoins;
      const progressAmount = currentBalance - activeRank.minCoins;
      progress = Math.min(100, Math.max(0, (progressAmount / range) * 100));
    }

    return { currentRank: activeRank, nextRank: followingRank, progressToNextRank: progress };
  }, [localBalance]);

  // Online Real-time Accumulation Loop (Ticking Balance and Energy)
  useEffect(() => {
    const ticker = setInterval(() => {
      // 1. Accumulate real-time passive profit (+profitPerHour/3600 per second)
      if (profitPerHour > 0) {
        setLocalBalance(prev => prev + (profitPerHour / 3600));
        isDirtyRef.current = true;
      }

      // 2. Refill energy dynamically (+1 every 5 minutes, i.e., +1/300 per second)
      setEnergy(prev => {
        if (prev < maxEnergy) {
          isDirtyRef.current = true;
          return Math.min(maxEnergy, prev + (1 / 300));
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [profitPerHour, maxEnergy]);

  // Auto-Save background sync every 4 seconds if local state has changed (isDirty)
  useEffect(() => {
    const autoSaver = setInterval(async () => {
      const currentUser = latestUserRef.current;
      if (isDirtyRef.current && currentUser) {
        isDirtyRef.current = false;
        try {
          await dbService.updateUser(currentUser.id, {
            hamsterMiningBalance: parseFloat(latestBalanceRef.current.toFixed(2)),
            hamsterCurrentEnergy: latestEnergyRef.current,
            hamsterLastActiveAt: new Date().toISOString(),
          });
        } catch (e) {
          console.error("Auto save failed", e);
        }
      }
    }, 4000);

    return () => clearInterval(autoSaver);
  }, []);

  // Manual fallback save on unmount
  useEffect(() => {
    return () => {
      const currentUser = latestUserRef.current;
      if (isDirtyRef.current && currentUser) {
        dbService.updateUser(currentUser.id, {
          hamsterMiningBalance: parseFloat(latestBalanceRef.current.toFixed(2)),
          hamsterCurrentEnergy: latestEnergyRef.current,
          hamsterLastActiveAt: new Date().toISOString()
        }).catch(err => console.error("Final unmount save failed", err));
      }
    };
  }, []);

  const handleTransferMiningToWallet = async () => {
    if (!user) return;
    const amountToTransfer = parseFloat(localBalance.toFixed(2));

    if (amountToTransfer <= 0) {
      playErrorSound();
      showToast('ট্রান্সফার করার মতো কোনো কয়েন নেই! আগে মাইনিং করে কয়েন জমান।', 'error');
      return;
    }

    if (amountToTransfer < 10) {
      playErrorSound();
      showToast('ট্রান্সফার করতে কমপক্ষে ১০টি কয়েন থাকতে হবে! (Minimum 10 Coins required for transfer)', 'error');
      return;
    }

    try {
      // Clear the local state immediately for direct visual feedback
      setLocalBalance(0);
      isDirtyRef.current = false; // Reset dirty ref since we cleared the balance
      
      // Atomic Firestore transaction & logger
      await dbService.transferHamsterMiningToMainBalance(user.id, amountToTransfer);
      
      playClaimSound();
      showToast(`অভিনন্দন! সফলভাবে ${Math.floor(amountToTransfer).toLocaleString()} কয়েন মূল ব্যালেন্সে ট্রান্সফার করা হয়েছে! 💰✨`, 'success');
    } catch (err) {
      // Rollback on error
      setLocalBalance(amountToTransfer);
      showToast('কয়েন ট্রান্সফার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।', 'error');
    }
  };

  const handleToggleSound = async () => {
    const nextSound = !soundOn;
    setSoundOn(nextSound);
    localStorage.setItem('mining_sound_on', nextSound ? 'true' : 'false');
    if (user) {
      try {
        await dbService.updateUser(user.id, { soundEnabled: nextSound });
      } catch (err) {
        console.error("Failed to save sound settings:", err);
      }
    }
  };

  // Sound triggers
  const playSound = (url: string) => {
    if (!soundOn) return;
    const audio = new Audio(url);
    audio.play().catch(() => {});
  };

  const playTapSound = () => playSound('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
  const playClaimSound = () => playSound('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
  const playUpgradeSound = () => playSound('https://assets.mixkit.co/active_storage/sfx/1627/1627-preview.mp3');
  const playErrorSound = () => playSound('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');

  // Trigger Toast alerts
  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Active Tap Handler
  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!user) return;

    // Each tap adds exactly multiTapLevel coins, as described in the booster UI
    const tapValue = multiTapLevel;

    // Verify energy limits
    if (energy < 1) {
      playErrorSound();
      showToast('পর্যাপ্ত এনার্জি নেই! রিফিল হওয়ার জন্য অপেক্ষা করুন।', 'error');
      return;
    }

    // Get click location relative to the hamster element
    const rect = e.currentTarget.getBoundingClientRect();
    let clickX = rect.width / 2;
    let clickY = rect.height / 2;

    if ('touches' in e && e.touches.length > 0) {
      clickX = e.touches[0].clientX - rect.left;
      clickY = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    }

    // Deduct energy and add balance
    setEnergy(prev => Math.max(0, prev - 1));
    setLocalBalance(prev => prev + tapValue);
    isDirtyRef.current = true;

    // Create particle animation
    const pId = Date.now() + Math.random();
    setParticles(prev => [...prev, { id: pId, x: clickX, y: clickY, value: tapValue }]);

    playTapSound();
  };

  // Morse Cipher Tap Handlers
  const handleMorsePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    pointerStartRef.current = Date.now();
    if (cipherTimeoutRef.current) {
      clearTimeout(cipherTimeoutRef.current);
    }
  };

  const handleMorsePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (cipherCompletedToday) return;

    const duration = Date.now() - pointerStartRef.current;
    const clickChar = duration < 250 ? '•' : '—';
    
    setCipherInput(prev => prev + clickChar);
    playTapSound();

    // Set 1.2 second inactivity timer to auto-parse current letter
    cipherTimeoutRef.current = setTimeout(() => {
      parseMorseLetter();
    }, 1200);
  };

  // Decrypts the Morse input buffer into a single character
  const parseMorseLetter = () => {
    setCipherInput(currentCode => {
      if (!currentCode) return '';
      
      const char = MORSE_DICTIONARY[currentCode];
      if (char) {
        const nextTargetIndex = solvedWord.length;
        const targetChar = CIPHER_WORD[nextTargetIndex];

        if (char === targetChar) {
          const newWord = solvedWord + char;
          setSolvedWord(newWord);
          playUpgradeSound();

          if (newWord === CIPHER_WORD) {
            // Completed! Let the user claim reward
            showToast('অভিনন্দন! আপনি আজকের ডেইল কোড সফলভাবে ডিকোড করেছেন! 🕵️‍♂️🎉', 'success');
          }
        } else {
          // Wrong Morse character
          playErrorSound();
          showToast(`ভুল কোড! "${char}" আজকের পরবর্তী অক্ষর ছিল না। আবার চেষ্টা করুন।`, 'error');
        }
      } else {
        playErrorSound();
        showToast('ভুল মোর্স প্যাটার্ন! ডিকশনারিতে কোনো অক্ষর মিলল না।', 'error');
      }
      return '';
    });
  };

  // Claim Daily Cipher Bounty
  const handleClaimCipherBonus = async () => {
    if (!user || cipherCompletedToday || solvedWord !== CIPHER_WORD) return;
    
    try {
      const bonusCoins = cipherBonusCoins;
      const updatedBalance = localBalance + bonusCoins;
      setLocalBalance(updatedBalance);
      setCipherCompletedToday(true);
      
      await dbService.updateUser(user.id, {
        hamsterMiningBalance: parseFloat(updatedBalance.toFixed(2)),
        hamsterLastCipherClaimedAt: new Date().toISOString()
      });

      // Save Transaction
      await dbService.claimMining(user.id, 0); // triggers tx logging internally, or we can use custom tx log
      
      playClaimSound();
      showToast(`দারুন! সফলভাবে +${bonusCoins.toLocaleString()} কয়েন বোনাস পেয়েছেন! 🪙`, 'success');
      ads.showInterstitial(state.settings);
    } catch (err) {
      showToast('বোনাস সংগ্রহ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।', 'error');
    }
  };

  // Claim Offline Passive Earnings
  const handleClaimOfflineEarnings = async () => {
    if (!user || !offlineEarnings) return;

    try {
      const earned = offlineEarnings.coins;
      const updatedBalance = localBalance + earned;
      setLocalBalance(updatedBalance);
      setOfflineEarnings(null);

      await dbService.updateUser(user.id, {
        hamsterMiningBalance: parseFloat(updatedBalance.toFixed(2)),
        hamsterLastClaimedAt: new Date().toISOString()
      });

      playClaimSound();
      showToast(`আপনার ব্যবসায়ের অফলাইন অর্জিত ${earned.toLocaleString()} কয়েন সংগ্রহ করা হয়েছে!`, 'success');
    } catch (e) {
      showToast('সংগ্রহ করতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Upgradable Card Cost & Profit Helpers
  const getCardLevel = (cardId: string) => ownedCards[cardId] || 0;
  
  const getCardCost = (card: UpgradeCard) => {
    const lvl = getCardLevel(card.id);
    return Math.round(card.baseCost * Math.pow(card.costMultiplier, lvl));
  };

  const getCardProfitAdded = (card: UpgradeCard) => {
    const lvl = getCardLevel(card.id);
    return getCardProfitValue(lvl + 1) - getCardProfitValue(lvl);
  };

  // Upgrade or Buy Card handler
  const handleBuyUpgradeCard = async (card: UpgradeCard) => {
    if (!user) return;

    const cost = getCardCost(card);
    const profitAdded = getCardProfitAdded(card);

    const mainWalletCoins = Math.floor((user.balance || 0) * 10);
    const totalAvailableCoins = localBalance + mainWalletCoins;

    if (totalAvailableCoins < cost) {
      playErrorSound();
      showToast(`পর্যাপ্ত ব্যালেন্স নেই! এই কার্ডের জন্য ${cost.toLocaleString()} কয়েন লাগবে।`, 'error');
      return;
    }

    const currentLvl = getCardLevel(card.id);
    const updatedCards = { ...ownedCards, [card.id]: currentLvl + 1 };
    
    let updatedLocalBalance = localBalance;
    let mainWalletDeduction = 0;

    if (updatedLocalBalance >= cost) {
      updatedLocalBalance -= cost;
    } else {
      const remainder = cost - updatedLocalBalance;
      updatedLocalBalance = 0;
      mainWalletDeduction = remainder / 10;
    }

    // Recalculate total profit per hour based on updated cards to prevent precision drift
    let updatedProfitPerHour = 0;
    UPGRADE_CARDS.forEach(c => {
      const lvl = updatedCards[c.id] || 0;
      if (lvl > 0) {
        updatedProfitPerHour += getCardProfitValue(lvl);
      }
    });

    // Check if daily combo unlocks with this purchase
    let alertCombo = false;
    const hasAllCombo = COMBO_CARDS.every(cid => updatedCards[cid] && updatedCards[cid] > 0);
    if (hasAllCombo && !comboCompletedToday) {
      alertCombo = true;
    }

    try {
      setLocalBalance(updatedLocalBalance);
      setProfitPerHour(updatedProfitPerHour);
      setOwnedCards(updatedCards);

      const updateFields: any = {
        hamsterMiningBalance: parseFloat(updatedLocalBalance.toFixed(2)),
        hamsterProfitPerHour: updatedProfitPerHour,
        hamsterCards: updatedCards,
        hamsterLastActiveAt: new Date().toISOString()
      };

      if (mainWalletDeduction > 0) {
        const newMainBalance = Math.max(0, (user.balance || 0) - mainWalletDeduction);
        updateFields.balance = parseFloat(newMainBalance.toFixed(4));
      }

      await dbService.updateUser(user.id, updateFields);

      playUpgradeSound();
      showToast(`সফলভাবে "${card.name}" আপগ্রেড করেছেন! (+${(profitAdded * 24).toFixed(4)} Coins/24h) 📈`, 'success');

      if (alertCombo) {
        showToast('অভিনন্দন! আজকের ডেইলি কম্বো কার্ডের সেট মিলে গেছে! 🎁', 'success');
      }
    } catch (e) {
      showToast('কার্ড আপগ্রেড করা যায়নি। আবার চেষ্টা করুন।', 'error');
    }
  };

  // Claim Daily Combo Bounty
  const handleClaimComboBonus = async () => {
    if (!user || comboCompletedToday) return;

    const hasAllCombo = COMBO_CARDS.every(cid => getCardLevel(cid) > 0);
    if (!hasAllCombo) {
      playErrorSound();
      showToast('ডেইলি কম্বো কার্ডগুলো এখনো আনলক করা হয়নি!', 'error');
      return;
    }

    try {
      const bonusCoins = comboBonusCoins;
      const updatedBalance = localBalance + bonusCoins;
      setLocalBalance(updatedBalance);
      setComboCompletedToday(true);

      await dbService.updateUser(user.id, {
        hamsterMiningBalance: parseFloat(updatedBalance.toFixed(2)),
        hamsterLastComboClaimedAt: new Date().toISOString()
      });

      playClaimSound();
      showToast(`সুপার কম্বো বোনাস! সফলভাবে +${bonusCoins.toLocaleString()} কয়েন সংগ্রহ করেছেন! 🏆🌟`, 'success');
      ads.showInterstitial(state.settings);
    } catch (e) {
      showToast('বোনাস সংগ্রহ করতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Full Energy Refuel Claim
  const handleFullEnergyRefuel = async () => {
    if (!user) return;
    
    const today = new Date().toDateString();
    const lastClaimDate = lastFullEnergyClaimedAt ? new Date(lastFullEnergyClaimedAt).toDateString() : '';
    
    let currentClaimsCount = fullEnergyClaims;
    if (lastClaimDate !== today) {
      currentClaimsCount = 0; // Reset daily limit on new day
    }

    if (currentClaimsCount >= maxEnergyBoostsValue) {
      playErrorSound();
      showToast(`আজকের ফুল এনার্জি লিমিট শেষ হয়ে গেছে! (সর্বোচ্চ ${maxEnergyBoostsValue} বার)`, 'error');
      return;
    }

    try {
      const now = new Date().toISOString();
      setEnergy(maxEnergy);
      setFullEnergyClaims(currentClaimsCount + 1);
      setLastFullEnergyClaimedAt(now);

      await dbService.updateUser(user.id, {
        hamsterCurrentEnergy: maxEnergy,
        hamsterFullEnergyClaimsToday: currentClaimsCount + 1,
        hamsterLastFullEnergyClaimedAt: now,
        hamsterLastActiveAt: now
      });

      playClaimSound();
      showToast('আপনার এনার্জি বার সম্পূর্ণ ফুল করা হয়েছে! ⚡🔋', 'success');
    } catch (e) {
      showToast('এনার্জি রিফিল করতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Upgrade Multi-tap Boost
  const getMultiTapCost = () => {
    return Math.round(200 * Math.pow(2, multiTapLevel));
  };

  const handleUpgradeMultiTap = async () => {
    if (!user) return;
    const cost = getMultiTapCost();

    const mainWalletCoins = Math.floor((user.balance || 0) * 10);
    const totalAvailableCoins = localBalance + mainWalletCoins;

    if (totalAvailableCoins < cost) {
      playErrorSound();
      showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ${cost.toLocaleString()} কয়েন।`, 'error');
      return;
    }

    try {
      let updatedLocalBalance = localBalance;
      let mainWalletDeduction = 0;

      if (updatedLocalBalance >= cost) {
        updatedLocalBalance -= cost;
      } else {
        const remainder = cost - updatedLocalBalance;
        updatedLocalBalance = 0;
        mainWalletDeduction = remainder / 10;
      }

      const updatedLevel = multiTapLevel + 1;

      setLocalBalance(updatedLocalBalance);
      setMultiTapLevel(updatedLevel);

      const updateFields: any = {
        hamsterMiningBalance: parseFloat(updatedLocalBalance.toFixed(2)),
        hamsterMultiTapLevel: updatedLevel
      };

      if (mainWalletDeduction > 0) {
        const newMainBalance = Math.max(0, (user.balance || 0) - mainWalletDeduction);
        updateFields.balance = parseFloat(newMainBalance.toFixed(4));
      }

      await dbService.updateUser(user.id, updateFields);

      playUpgradeSound();
      showToast(`ট্যাপ বুস্টার আপগ্রেড হয়েছে! এখন প্রতি ট্যাপে পাবেন +${updatedLevel} কয়েন।`, 'success');
    } catch (e) {
      showToast('বুস্টার আপগ্রেড করা যায়নি।', 'error');
    }
  };

  // Upgrade Energy Limit Boost
  const getEnergyLimitCost = () => {
    return Math.round(200 * Math.pow(2, energyLevel));
  };

  const handleUpgradeEnergyLimit = async () => {
    if (!user) return;
    const cost = getEnergyLimitCost();

    const mainWalletCoins = Math.floor((user.balance || 0) * 10);
    const totalAvailableCoins = localBalance + mainWalletCoins;

    if (totalAvailableCoins < cost) {
      playErrorSound();
      showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ${cost.toLocaleString()} কয়েন।`, 'error');
      return;
    }

    try {
      let updatedLocalBalance = localBalance;
      let mainWalletDeduction = 0;

      if (updatedLocalBalance >= cost) {
        updatedLocalBalance -= cost;
      } else {
        const remainder = cost - updatedLocalBalance;
        updatedLocalBalance = 0;
        mainWalletDeduction = remainder / 10;
      }

      const updatedLevel = energyLevel + 1;

      setLocalBalance(updatedLocalBalance);
      setEnergyLevel(updatedLevel);

      const updateFields: any = {
        hamsterMiningBalance: parseFloat(updatedLocalBalance.toFixed(2)),
        hamsterEnergyLevel: updatedLevel
      };

      if (mainWalletDeduction > 0) {
        const newMainBalance = Math.max(0, (user.balance || 0) - mainWalletDeduction);
        updateFields.balance = parseFloat(newMainBalance.toFixed(4));
      }

      await dbService.updateUser(user.id, updateFields);

      playUpgradeSound();
      showToast(`এনার্জি লিমিট আপগ্রেড হয়েছে! এখন সর্বোচ্চ লিমিট ${(updatedLevel * 500).toLocaleString()} ⚡`, 'success');
    } catch (e) {
      showToast('বুস্টার আপগ্রেড করা যায়নি।', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex flex-col pb-16 select-none relative overflow-x-hidden font-sans">
      
      {/* 50,000 & 1M claims Floating status bars */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-none"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-500/90 backdrop-blur-md border-emerald-400 text-white' 
                : 'bg-rose-500/90 backdrop-blur-md border-rose-400 text-white'
            }`}>
              {message.type === 'success' ? <CheckCircle size={22} className="shrink-0" /> : <AlertCircle size={22} className="shrink-0" />}
              <p className="text-[11px] font-black leading-snug">{message.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Earnings Popup Modal */}
      <AnimatePresence>
        {offlineEarnings && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#182030] border border-amber-500/20 max-w-sm w-full rounded-[32px] p-6 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-3xl">
                🐹
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-amber-400 tracking-tight">Welcome Back, CEO!</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  আপনি যখন অফলাইনে ছিলেন, তখন আপনার কর্মীরা এবং ব্যবসায়ের ডিল সচল ছিল!
                </p>
              </div>

              <div className="bg-[#101622] rounded-2xl p-4 border border-slate-800 space-y-1.5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">অফলাইন সময়: {offlineEarnings.hours.toFixed(1)} ঘণ্টা</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-[#D4AF37] tracking-tight">{offlineEarnings.coins.toLocaleString()}</span>
                  <span className="text-amber-500 text-lg">🪙</span>
                </div>
                <p className="text-[9px] text-[#D4AF37] font-semibold">(৩ ঘণ্টার অফলাইন ক্যাপ অনুযায়ী সর্বোচ্চ প্যাসিভ আয়)</p>
              </div>

              <Button
                onClick={handleClaimOfflineEarnings}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-black rounded-2xl tracking-wide text-xs shadow-xl active:scale-95 transition-all"
              >
                প্যাসিভ কয়েন সংগ্রহ করুন (Claim Profit)
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="sticky top-0 bg-[#0E131F]/90 backdrop-blur-md z-30 border-b border-slate-800/40 flex items-center justify-between p-4 h-16 shrink-0">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-10 h-10 rounded-full border border-slate-800/80 bg-slate-900 flex items-center justify-center hover:bg-slate-850 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-350" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-[#F59E0B] uppercase tracking-wider font-sans">CEO Exchange Office</h1>
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Hamster Kombat tap-to-earn
          </p>
        </div>
        <button 
          onClick={handleToggleSound}
          className="w-10 h-10 rounded-full border border-slate-800/80 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-200"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </header>

      {/* Inner Screen Tab Navigation */}
      <div className="grid grid-cols-4 border-b border-slate-800/30 bg-[#121926]/40 p-1 font-semibold text-[10px] uppercase tracking-wider">
        <button 
          onClick={() => setActiveScreenTab('exchange')}
          className={`py-3 text-center transition-all ${activeScreenTab === 'exchange' ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-black' : 'text-slate-400'}`}
        >
          Exchange
        </button>
        <button 
          onClick={() => setActiveScreenTab('mine')}
          className={`py-3 text-center transition-all ${activeScreenTab === 'mine' ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-black' : 'text-slate-400'}`}
        >
          Mine (কার্ড)
        </button>
        <button 
          onClick={() => setActiveScreenTab('cipher')}
          className={`py-3 text-center transition-all ${activeScreenTab === 'cipher' ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-black' : 'text-slate-400'}`}
        >
          Cipher (কোড)
        </button>
        <button 
          onClick={() => setActiveScreenTab('boosts')}
          className={`py-3 text-center transition-all ${activeScreenTab === 'boosts' ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-black' : 'text-slate-400'}`}
        >
          Boosts
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1 max-w-md mx-auto w-full">
        
        {/* CEO Rank / Level & Progress bar */}
        <div className="bg-[#121824] border border-slate-800 p-3 rounded-2xl space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-300">
            <div className="flex items-center gap-1">
              <span>{currentRank.emoji}</span>
              <span className="uppercase tracking-wider">{currentRank.name} CEO</span>
            </div>
            <div className="text-slate-400">
              Level <span className="text-[#FFC107]">{HAMSTER_RANKS.indexOf(currentRank) + 1}</span> / {HAMSTER_RANKS.length}
            </div>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressToNextRank}%` }}
            />
          </div>
          {nextRank && (
            <div className="flex justify-between items-center text-[8px] font-semibold text-slate-400">
              <span>Next Rank: {nextRank.name}</span>
              <span>{Math.round(localBalance).toLocaleString()} / {nextRank.minCoins.toLocaleString()} 🪙</span>
            </div>
          )}
        </div>

        {/* Triple Action Cards Bar */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Daily checkin card */}
          <button 
            onClick={() => navigate('/dashboard')} // connects to daily check-in on dashboard
            className="bg-[#121824] border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:border-slate-750 transition-colors"
          >
            <Calendar size={18} className="text-[#F59E0B]" />
            <span className="text-[8px] font-black text-slate-200 uppercase tracking-wider leading-none">Daily Reward</span>
            <p className="text-[7px] font-bold text-slate-400">Claim 1.5K+ Coins</p>
          </button>

          {/* Daily Cipher morse decoder card */}
          <button 
            onClick={() => setActiveScreenTab('cipher')}
            className={`border p-2.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 transition-colors ${
              cipherCompletedToday 
                ? 'bg-[#121824]/60 border-emerald-500/20' 
                : 'bg-[#121824] border-slate-800 hover:border-slate-750'
            }`}
          >
            <Radio size={18} className={cipherCompletedToday ? "text-emerald-400" : "text-sky-400"} />
            <span className="text-[8px] font-black text-slate-200 uppercase tracking-wider leading-none">Daily Cipher</span>
            <p className={`text-[7px] font-bold ${cipherCompletedToday ? "text-emerald-400" : "text-slate-400"}`}>
              {cipherCompletedToday ? "Claimed ✓" : "Morse: +50K"}
            </p>
          </button>

          {/* Daily Combo Card */}
          <button 
            onClick={() => {
              setActiveScreenTab('mine');
              showToast('ডেইলি কম্বো কার্ডগুলো সংগ্রহ করতে Markets/PR/Legal কার্ড আপগ্রেড করুন!', 'success');
            }}
            className={`border p-2.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 transition-colors ${
              comboCompletedToday 
                ? 'bg-[#121824]/60 border-emerald-500/20' 
                : 'bg-[#121824] border-slate-800 hover:border-slate-750'
            }`}
          >
            <Trophy size={18} className={comboCompletedToday ? "text-emerald-400" : "text-amber-400"} />
            <span className="text-[8px] font-black text-slate-200 uppercase tracking-wider leading-none">Daily Combo</span>
            <p className={`text-[7px] font-bold ${comboCompletedToday ? "text-emerald-400" : "text-slate-400"}`}>
              {comboCompletedToday ? "Claimed ✓" : `Combo: +${(comboBonusCoins / 1000).toFixed(0)}K`}
            </p>
          </button>

        </div>

        {/* Real-time Ticking Coins Wallet Balance Display */}
        <div className="bg-gradient-to-b from-[#131A26] to-[#0A0D14] border border-slate-800 p-5 rounded-[28px] text-center space-y-3 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
          
          <div className="grid grid-cols-2 gap-3 divide-x divide-slate-800">
            <div>
              <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest leading-none">MINING (Unclaimed)</p>
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <span className="text-xl font-black text-[#FFF]/95 tracking-tight font-mono select-all">
                  {Math.floor(localBalance).toLocaleString()}
                </span>
                <span className="text-lg animate-bounce filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.4)]">🪙</span>
              </div>
            </div>
            
            <div>
              <p className="text-[8px] font-black text-sky-400 uppercase tracking-widest leading-none">MAIN WALLET</p>
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <span className="text-xl font-black text-[#FFF]/95 tracking-tight font-mono select-all">
                  {Math.floor((user?.balance || 0) * 10).toLocaleString()}
                </span>
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-slate-400 font-bold border-t border-slate-850 pt-2.5">
            <span className="text-[#38BDF8] font-black">Daily Profit: +{(profitPerHour * 24).toFixed(4)} Coins 🪙</span>
            <span className="text-slate-500 font-extrabold">Hourly Profit: +{profitPerHour.toFixed(6)} Coins / Hr 🚀</span>
          </div>

          {/* Transfer to Main Wallet Button */}
          <div className="pt-1">
            <button
              onClick={handleTransferMiningToWallet}
              className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                localBalance > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] shadow-emerald-500/10 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-800/80 cursor-not-allowed'
              }`}
              disabled={localBalance <= 0}
            >
              <Coins size={14} className={localBalance > 0 ? "animate-spin-slow" : ""} />
              <span>মূল ব্যালেন্সে ট্রান্সফার করুন (Transfer)</span>
            </button>
          </div>
        </div>

        {/* 1. EXCHANGE SCREEN TAB (Main Tap Game) */}
        {activeScreenTab === 'exchange' && (
          <div className="space-y-6 flex flex-col items-center">
            
            {/* Clickable Hamster Target Area */}
            <div className="relative w-64 h-64 flex items-center justify-center mt-3">
              {/* Outer Energy Orbit ring */}
              <div className="absolute inset-0 rounded-full border-[8px] border-[#1A253C] flex items-center justify-center pointer-events-none">
                <div className="w-full h-full rounded-full border border-[#273B5E] animate-ping opacity-10" />
              </div>

              {/* Glowing ring */}
              <div className="absolute inset-2 rounded-full border-4 border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.2)] pointer-events-none" />

              {/* Main Mascot Button Frame */}
              <motion.div
                whileTap={{ scale: 0.94 }}
                onPointerDown={handleTap}
                className="w-[200px] h-[200px] rounded-full overflow-hidden bg-slate-900 border-4 border-[#3A4E7A] shadow-[0_10px_40px_rgba(0,0,0,0.6)] cursor-pointer relative flex items-center justify-center active:border-amber-500 transition-colors"
              >
                <img 
                  src={hamsterMascot} 
                  alt="Hamster Mascot CEO" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none hover:scale-105 transition-transform duration-500"
                />

                {/* Inner Overlay Ring */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E131F]/30 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Taps Particles Array Renderer */}
              <AnimatePresence>
                {particles.map(p => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 1, y: p.y - 20, x: p.x - 20, scale: 0.8 }}
                    animate={{ opacity: 0, y: p.y - 120, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onAnimationComplete={() => setParticles(prev => prev.filter(item => item.id !== p.id))}
                    className="absolute text-2xl font-extrabold text-[#FFC107] font-mono pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-40"
                  >
                    +{p.value}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Energy Status and Refill meter */}
            <div className="w-full space-y-1.5 bg-[#121824]/50 border border-slate-800/60 p-4 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between text-xs font-black">
                <p className="text-slate-350 uppercase tracking-wider flex items-center gap-1">
                  <Zap size={14} className="text-[#FFC107] animate-pulse" />
                  <span>ENERGY LIMIT</span>
                </p>
                <p className="text-slate-100 font-mono text-xs">
                  {Math.floor(energy)} / {maxEnergy}
                </p>
              </div>

              {/* Energy progress bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(Math.floor(energy) / maxEnergy) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 pt-1">
                <span>৫ মিনিট পর পর ১ ⚡ জমা হবে (Refills +1 every 5 minutes)</span>
                <button 
                  onClick={() => setActiveScreenTab('boosts')}
                  className="text-amber-400 hover:underline uppercase tracking-widest flex items-center gap-0.5"
                >
                  Boosters ⚡🚀
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. MINE SCREEN TAB (Upgrade Cards Station) */}
        {activeScreenTab === 'mine' && (
          <div className="space-y-4">
            
            {/* Daily Combo Mission Box inside Cards Shop */}
            <div className="bg-[#192132] border border-amber-500/20 p-4 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest">DAILY COMBO DEALS</h4>
                  <p className="text-[9px] text-slate-400">오늘 3가지 특정 카드들을 활성화하고 보상을 받으세요!</p>
                </div>
                {comboCompletedToday ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Completed ✓
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Reward: +${(comboBonusCoins / 1000).toLocaleString()}K 🪙
                  </span>
                )}
              </div>

              {/* Three Combo Card Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {COMBO_CARDS.map(cid => {
                  const card = UPGRADE_CARDS.find(c => c.id === cid);
                  const isUnlocked = getCardLevel(cid) > 0;
                  return (
                    <div key={cid} className={`border p-2 rounded-xl flex flex-col items-center justify-center text-center space-y-1 ${
                      isUnlocked ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-xl">{card?.emoji || '❓'}</span>
                      <p className="text-[8px] font-extrabold truncate w-full">{card?.name || 'Loading'}</p>
                      <span className="text-[7px] font-black uppercase">
                        {isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Claim Combo Reward button */}
              {!comboCompletedToday && (
                <button
                  onClick={handleClaimComboBonus}
                  disabled={!COMBO_CARDS.every(cid => getCardLevel(cid) > 0)}
                  className={`w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all border ${
                    COMBO_CARDS.every(cid => getCardLevel(cid) > 0)
                      ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-md hover:bg-amber-400 active:scale-98'
                      : 'bg-slate-900 text-slate-500 border-slate-800/80 cursor-not-allowed'
                  }`}
                >
                  ক্লেম ডেইলি কম্বো বোনাস (Claim ${comboBonusCoins.toLocaleString()} Coins)
                </button>
              )}
            </div>

            {/* Upgrade categories selector tabs */}
            <div className="grid grid-cols-4 bg-[#121824] p-1.5 rounded-2xl border border-slate-800/60 font-black text-[9px] uppercase tracking-wider">
              {(['markets', 'team', 'legal', 'specials'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 text-center rounded-xl transition-all ${
                    activeCategory === cat 
                      ? 'bg-amber-500 text-slate-900 font-extrabold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'markets' ? 'Markets' : cat === 'team' ? 'PR/Team' : cat === 'legal' ? 'Legal' : 'Specials'}
                </button>
              ))}
            </div>

            {/* List of Cards filtered by Category */}
            <div className="grid grid-cols-2 gap-3">
              {UPGRADE_CARDS.filter(card => card.category === activeCategory).map(card => {
                const level = getCardLevel(card.id);
                const cost = getCardCost(card);
                const profitAdded = getCardProfitAdded(card);
                const mainWalletCoins = Math.floor((user?.balance || 0) * 10);
                const canAfford = (localBalance + mainWalletCoins) >= cost;

                return (
                  <div 
                    key={card.id}
                    className="bg-[#121824] border border-slate-800 p-3.5 rounded-[24px] flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{card.emoji}</span>
                        <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Lvl {level}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-100 leading-tight truncate">{card.name}</h4>
                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">{card.banglaName}</p>
                      </div>
                    </div>

                    <div className="bg-[#0E131F] p-2 rounded-xl border border-slate-800/30 text-[8px] space-y-0.5">
                      <p className="text-slate-500 font-bold">PASSIVE PROFIT ADDED</p>
                      <p className="text-[#38BDF8] font-black flex flex-col gap-0.5">
                        <span>+{(profitAdded * 24).toFixed(4)} Coins / 24h 🪙</span>
                        <span className="text-slate-500 text-[7px] font-extrabold">+{(profitAdded).toFixed(6)} / Hr</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyUpgradeCard(card)}
                      className={`w-full h-10 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1 border ${
                        canAfford 
                          ? 'bg-amber-500 text-slate-900 border-amber-400 hover:bg-amber-400 active:scale-95' 
                          : 'bg-slate-900 text-slate-500 border-slate-800/80 cursor-not-allowed'
                      }`}
                    >
                      <span>Buy:</span>
                      <span className="font-bold">{cost.toLocaleString()}</span>
                      <span>🪙</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* 3. CIPHER SCREEN TAB (Morse Decoding Mini-Game) */}
        {activeScreenTab === 'cipher' && (
          <div className="space-y-4">
            
            <div className="bg-[#18111A] border border-rose-500/20 p-5 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-center space-y-1">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  MORSE DECODER CONSOLE
                </h4>
                <p className="text-[10px] text-slate-400 font-bold">
                  নিচে মোর্স কোডে ট্যাপ করে আজকের গোপন শব্দটি টাইপ করুন!
                </p>
              </div>

              {/* Solved Character slots indicator */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {CIPHER_WORD.split('').map((char, index) => {
                  const isSolved = solvedWord.length > index;
                  return (
                    <div 
                      key={index} 
                      className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border text-lg font-black transition-all ${
                        isSolved 
                          ? 'bg-rose-950/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-600'
                      }`}
                    >
                      <span>{isSolved ? char : '_'}</span>
                      <span className="text-[7px] text-slate-500 mt-1 uppercase font-mono">{CIPHER_CODES[index]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Morse Input buffer live representation */}
              <div className="bg-[#100C13] rounded-2xl p-3 border border-slate-900 text-center space-y-1">
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">CURRENT TAP INPUT BUFFER (১.২ সে. পর ডিকোড হবে)</p>
                <div className="h-6 flex items-center justify-center gap-1.5 text-xl font-bold font-mono text-rose-400">
                  {cipherInput || <span className="text-[11px] text-slate-600 italic">ট্যাপ করুন (শর্ট ট্যাপ • / লং প্রেস —)</span>}
                </div>
              </div>

              {/* Complete Reward claim panel */}
              {solvedWord === CIPHER_WORD && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] text-center text-emerald-400 font-black uppercase tracking-wider">✓ শব্দ সফলভাবে ডিকোড করা হয়েছে!</p>
                  <Button
                    onClick={handleClaimCipherBonus}
                    disabled={cipherCompletedToday}
                    className={`w-full h-11 rounded-2xl font-black uppercase text-xs tracking-wider transition-all ${
                      cipherCompletedToday 
                        ? 'bg-[#121824]/60 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold shadow-lg shadow-rose-500/20 active:scale-95'
                    }`}
                  >
                    {cipherCompletedToday ? `ক্লেমড বোনাস ✓ (+${cipherBonusCoins.toLocaleString()})` : `ক্লেম বোনাস (Claim ${cipherBonusCoins.toLocaleString()} Coins)`}
                  </Button>
                </div>
              )}

              {/* Morse helper guide cheat-sheet */}
              <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-2xl space-y-1.5 text-[8px] font-bold text-slate-400">
                <p className="text-slate-300 uppercase tracking-wider text-[9px] font-black">মোর্স গাইড বুক (Morse Clue):</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 leading-relaxed">
                  <li>M: <span className="text-[#F59E0B] font-mono">——</span> (লং + লং)</li>
                  <li>I: <span className="text-[#F59E0B] font-mono">••</span> (শর্ট + শর্ট)</li>
                  <li>N: <span className="text-[#F59E0B] font-mono">—•</span> (লং + শর্ট)</li>
                  <li>E: <span className="text-[#F59E0B] font-mono">•</span> (একটি শর্ট ট্যাপ)</li>
                </ul>
              </div>
            </div>

            {/* Cyber Morse Key Touchpad */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest text-center">TAPPING TOUCHPAD</p>
              
              <div 
                onPointerDown={handleMorsePointerDown}
                onPointerUp={handleMorsePointerUp}
                className="bg-gradient-to-br from-[#1E1122] to-[#120B15] border-2 border-rose-500/30 h-44 rounded-3xl flex flex-col items-center justify-center cursor-pointer shadow-inner active:border-rose-400 select-none touch-none"
              >
                <div className="w-16 h-16 bg-rose-500/5 rounded-full flex items-center justify-center border border-rose-500/20 text-2xl animate-pulse">
                  📻
                </div>
                <p className="text-[11px] text-rose-400/80 font-black uppercase tracking-wider mt-3">TAP INSIDE TO MORSE CODE</p>
                <p className="text-[8px] text-slate-500 font-semibold mt-0.5">Hold for dash, release quickly for dot</p>
              </div>
            </div>

          </div>
        )}

        {/* 4. BOOSTS SCREEN TAB (Upgrade Tap Value & Energy) */}
        {activeScreenTab === 'boosts' && (
          <div className="space-y-4">
            
            {/* Free daily refills section */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-1">FREE DAILY BOOSTERS</h3>
              
              <div className="bg-[#121824] border border-slate-800 p-4 rounded-[24px] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider leading-none">Full Energy Refuel</h4>
                    <p className="text-[8px] text-slate-400 mt-1">সর্বোচ্চ এনার্জি লিমিট ফুল চার্জ করুন।</p>
                    <p className="text-[8px] text-amber-500 font-black mt-0.5">
                      ব্যবহার আজ: {fullEnergyClaims} / {maxEnergyBoostsValue}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFullEnergyRefuel}
                  disabled={fullEnergyClaims >= maxEnergyBoostsValue}
                  className={`text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-full border shadow-sm transition-all active:scale-95 ${
                    fullEnergyClaims < maxEnergyBoostsValue 
                      ? 'bg-amber-500 text-slate-900 border-amber-400 hover:bg-amber-400' 
                      : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                  }`}
                >
                  Refuel Free
                </button>
              </div>
            </div>

            {/* Paid coin boosts section */}
            <div className="space-y-2.5 pt-1">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-1">BOOST CARDS (কয়েন আপগ্রেডার)</h3>

              <div className="space-y-3">
                
                {/* Multitap Upgrade Card */}
                <div className="bg-[#121824] border border-slate-800 p-4 rounded-[24px] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center text-2xl">
                      👆
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider leading-none">Multitap Booster</h4>
                      <p className="text-[8px] text-slate-400 mt-1">প্রতি ট্যাপে অর্জিত কয়েনের পরিমাণ বাড়ান।</p>
                      <p className="text-[8px] text-sky-400 font-black mt-0.5">
                        Current level: {multiTapLevel} (+{multiTapLevel} coins/tap)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeMultiTap}
                    className="text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-full border bg-slate-900 border-slate-800 hover:border-slate-700 active:scale-95 text-sky-400"
                  >
                    Upgrade - {getMultiTapCost().toLocaleString()} 🪙
                  </button>
                </div>

                {/* Energy Limit Booster */}
                <div className="bg-[#121824] border border-slate-800 p-4 rounded-[24px] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-2xl">
                      🔋
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-wider leading-none">Energy Capacity</h4>
                      <p className="text-[8px] text-slate-400 mt-1">সর্বোচ্চ এনার্জি রিফিল ক্যাপাসিটি বাড়ান।</p>
                      <p className="text-[8px] text-yellow-500 font-black mt-0.5">
                        Current: {(energyLevel * 500).toLocaleString()} Max Energy
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeEnergyLimit}
                    className="text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-full border bg-slate-900 border-slate-800 hover:border-slate-700 active:scale-95 text-yellow-500"
                  >
                    Upgrade - {getEnergyLimitCost().toLocaleString()} 🪙
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Informative Help Guide Card */}
        <div className="bg-[#121824]/30 border border-slate-800 p-4 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-[#FFC107]">
            <Info size={15} />
            <h4 className="text-[10px] font-black uppercase tracking-wider font-sans">RULES OF THE HAMSTER EMPIRE (নিয়মাবলী)</h4>
          </div>
          <ul className="text-[9px] text-slate-400 space-y-1 font-bold leading-relaxed list-disc list-inside">
            <li><span className="text-slate-200">এক্সচেঞ্জ মোড:</span> স্ক্রিনে ট্যাপ করে কয়েন আয় করুন। এনার্জি রিফিল হতে সময় লাগে।</li>
            <li><span className="text-slate-200">অফলাইন ইনকাম:</span> "Mine" কার্ড আপগ্রেড করলে আপনি অফলাইনে থাকলেও কয়েন জমবে (সর্বোচ্চ ৩ ঘণ্টা)।</li>
            <li><span className="text-slate-200">ডেইলি কম্বো ও সাইফার:</span> বিশেষ ৩টি কার্ড আনলক করুন বা গোপন মোর্স কোড "MINE" টাইপ করে লাখ লাখ বোনাস পান!</li>
          </ul>
        </div>

        {/* Live Banner Advertising space */}
        <div className="pt-1 text-center">
          <BannerAdSlot state={state} />
        </div>
      </div>
    </div>
  );
}
