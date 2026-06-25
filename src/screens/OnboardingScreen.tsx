/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, ShoppingCart, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';

const slides = [
  {
    title: "Complete Small Tasks",
    description: "Install apps, or take surveys to build your wallet balance in minutes.",
    icon: ClipboardList,
    color: "#FFC107"
  },
  {
    title: "Shop for 1-99 Taka",
    description: "Use your earnings to buy daily essentials, snacks, and electronics at unbeatable prices.",
    icon: ShoppingCart,
    color: "#37474F"
  },
  {
    title: "Refer & Level Up",
    description: "Invite friends to earn bonuses and reach Master level for higher task rewards.",
    icon: TrendingUp,
    color: "#4CAF50"
  }
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate('/signup');
    }
  };

  const Icon = slides[current].icon;

  return (
    <div className="h-screen bg-white flex flex-col justify-between py-12 px-6">
      <div className="flex justify-between items-center px-2">
        {current > 0 ? (
          <button onClick={() => setCurrent(current - 1)} className="text-gray-400 font-black text-sm uppercase flex items-center gap-1">
            <ArrowLeft size={16} /> Previous
          </button>
        ) : <div />}
        <button onClick={() => navigate('/signup')} className="text-gray-400 font-bold text-sm uppercase">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex flex-col items-center gap-12"
          >
            <div
              className={`w-48 h-48 rounded-full flex items-center justify-center`}
              style={{ backgroundColor: `${slides[current].color}10` }}
            >
              <Icon size={80} style={{ color: slides[current].color }} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-[#37474F]" style={{ color: slides[current].color }}>
                {slides[current].title}
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                {slides[current].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === current ? 'w-8 bg-[#FFC107]' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full flex items-center justify-between group h-14"
        >
          <span>{current === slides.length - 1 ? 'Start Earning' : 'Next'}</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
