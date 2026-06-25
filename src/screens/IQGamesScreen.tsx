/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Brain, Trophy, Zap, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { AppState, IQGame } from '../types';
import { dbService } from '../dbService';

export default function IQGamesScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState<IQGame | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const games: IQGame[] = [
    { 
      id: 'g1', 
      question: 'Which word does NOT belong with the others?', 
      options: ['Tyre', 'Steering Wheel', 'Engine', 'Car'], 
      answerIndex: 3, 
      reward: 5 
    },
    { 
      id: 'g2', 
      question: 'Find the missing number: 1, 3, 6, 10, ?', 
      options: ['12', '15', '18', '21'], 
      answerIndex: 1, 
      reward: 5 
    },
    { 
      id: 'g3', 
      question: 'Book is to Reading as Fork is to ?', 
      options: ['Drawing', 'Writing', 'Eating', 'Stirring'], 
      answerIndex: 2, 
      reward: 5 
    }
  ];

  const handleStart = (game: IQGame) => {
    setCurrentGame(game);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !currentGame) return;

    const correct = selectedAnswer === currentGame.answerIndex;
    setIsCorrect(correct);

    if (correct) {
      await dbService.solveIQGame(currentGame.id, state.currentUser!.id, currentGame.reward);
      setTimeout(() => {
        alert(`Correct! You earned ৳${currentGame.reward}`);
        setCurrentGame(null);
      }, 1500);
    } else {
      setTimeout(() => {
        alert('Wrong answer. Try again!');
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-indigo-600 p-8 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-black text-white">IQ Mini Games</h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/10 p-6 rounded-[32px]">
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Brain size={24} className="text-white" />
           </div>
           <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Training Mode</p>
              <h3 className="text-lg font-black text-white">EARN BY SMARTNESS</h3>
           </div>
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-6 pb-32">
        <AnimatePresence mode="wait">
          {!currentGame ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
               {games.map((game, i) => (
                 <Card key={game.id} className="p-6 rounded-[32px] border-none shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                          {i + 1}
                       </div>
                       <div>
                          <h4 className="text-xs font-black text-[#37474F] uppercase tracking-tight">Challenge #{i + 1}</h4>
                          <p className="text-[9px] font-bold text-gray-400">WIN ৳{game.reward} BONUS</p>
                       </div>
                    </div>
                    <Button onClick={() => handleStart(game)} className="h-10 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest">Start</Button>
                 </Card>
               ))}
            </motion.div>
          ) : (
            <motion.div 
               key="quiz"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-8"
            >
               <Card className="p-10 rounded-[48px] border-none shadow-2xl bg-white text-center relative overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                     <HelpCircle size={32} className="text-indigo-100" />
                  </div>
                  <h3 className="text-lg font-black text-[#37474F] mt-8 leading-relaxed">
                     {currentGame.question}
                  </h3>
               </Card>

               <div className="space-y-3">
                  {currentGame.options.map((option, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      disabled={isCorrect !== null}
                      className={`w-full p-6 h-18 rounded-[24px] border-2 transition-all flex justify-between items-center ${
                        selectedAnswer === idx 
                        ? (isCorrect === true ? 'border-green-500 bg-green-50' : isCorrect === false ? 'border-red-500 bg-red-50' : 'border-indigo-500 bg-indigo-50')
                        : 'border-white bg-white shadow-sm'
                      }`}
                    >
                       <span className={`text-[12px] font-black uppercase tracking-tight ${selectedAnswer === idx ? 'text-indigo-600' : 'text-[#37474F]'}`}>
                          {option}
                       </span>
                       {selectedAnswer === idx && (
                         isCorrect === true ? <CheckCircle2 className="text-green-500" /> : isCorrect === false ? <XCircle className="text-red-500" /> : < Zap size={16} className="text-indigo-500 fill-indigo-500" />
                       )}
                    </button>
                  ))}
               </div>

               <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentGame(null)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Quit</Button>
                  <Button disabled={selectedAnswer === null || isCorrect !== null} onClick={handleSubmit} className="flex-[2] h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">Submit Answer</Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6">
         <Card className="bg-yellow-50 p-6 rounded-[32px] border border-yellow-100 flex items-center gap-4">
            <Trophy size={32} className="text-[#FFC107]" />
            <div>
               <h5 className="text-[10px] font-black uppercase text-yellow-800 tracking-widest">Global Ranking</h5>
               <p className="text-[9px] font-medium text-yellow-700">Solve 10 more to enter the Top 100 Smarts!</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
