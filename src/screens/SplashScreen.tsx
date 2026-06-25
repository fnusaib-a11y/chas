/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';

import { AppState, User } from '../types';

export default function SplashScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (state.currentUser) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.currentUser, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b from-[#FFC107] to-[#FFA000]">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative"
        >
          <ShoppingCart size={64} className="text-[#FFC107]" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, type: 'tween' }}
            className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">✓</div>
          </motion.div>
        </motion.div>
        
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-[#37474F] tracking-tighter"
          >
            CASH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#37474F]/70 font-black text-xs uppercase tracking-[0.3em] mt-2"
          >
            Earn • Refer • Shop
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full"
      >
        <Button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 text-lg"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
