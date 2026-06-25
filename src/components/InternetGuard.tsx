import React, { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './UI';

export function InternetGuard({ isOnline }: { isOnline: boolean }) {
  const [showModal, setShowModal] = useState(true);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="max-w-xs w-full space-y-8 bg-white p-10 rounded-[40px] shadow-2xl border border-white/50">
          <div className="relative">
            {/* Using an img tag for the user-provided image, falling back to icon if missing */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="/no-internet.png" 
                  alt="No Internet" 
                  className="w-48 h-48 object-contain mb-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const iconContainer = document.createElement('div');
                      iconContainer.className = 'flex justify-center';
                      iconContainer.innerHTML = '<div class="relative"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wifi-off text-gray-300"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/></svg><div class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-white"><span class="text-white text-xs font-black">X</span></div></div>';
                      parent.appendChild(iconContainer);
                    }
                  }}
                />
              </div>
            </div>
            {/* 
              Comment: The user provided an image. 
              In a real scenario, we'd reference /no-internet.png 
            */}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#37474F]">No Internet Connection</h2>
            <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
              Please check your connection and try again.
            </p>
          </div>

          <Button 
            onClick={() => window.location.reload()}
            className="w-full h-14 rounded-2xl bg-[#37474F] text-white hover:bg-[#2c3940]"
          >
            OK
          </Button>
        </div>

        {/* Instructions for background UI */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-5 grayscale blur-sm">
          {/* This represents the UI still being visible but not reachable */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
