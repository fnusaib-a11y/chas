/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useRef } from 'react';

import { Home, ClipboardList, ShoppingBag, Wallet, User as UserIcon, Zap, Share2, Pickaxe } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppState } from '../types';

export function BottomNav({ state }: { state?: AppState }) {
  const hasUnreadNotifications = useMemo(() => {
    if (!state?.globalNotifications) return false;
    const lastRead = localStorage.getItem('last_read_notif_time') || '0';
    return state.globalNotifications.some(n => new Date(n.createdAt).getTime() > new Date(lastRead).getTime());
  }, [state?.globalNotifications]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: Pickaxe, label: 'Mining', path: '/mining' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ] as { icon: any; label: string; path: string; hasBadge?: boolean }[];

  return (
    <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 border border-amber-300 flex items-center justify-around py-1 px-2 rounded-2xl shadow-[0_12px_36px_-6px_rgba(245,158,11,0.55)] z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="relative flex-1"
        >
          {({ isActive }) => (
            <div className="flex flex-col items-center justify-center gap-0.5 relative py-1.5 px-0.5">
              {/* Floating Active Background capsule */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute inset-0 bg-white/40 border border-white/40 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 25 }}
                />
              )}

              {/* Icon Container with Micro-scale effect */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative z-10 p-0.5 rounded-lg ${
                  isActive ? 'text-slate-950 font-black' : item.hasBadge ? 'text-rose-600' : 'text-slate-800/60'
                }`}
              >
                <item.icon size={18} className={isActive ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]' : ''} />
                {item.hasBadge && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-slate-950" />
                )}
              </motion.div>

              {/* Text Label */}
              <span className={`text-[8px] font-extrabold tracking-wider uppercase z-10 transition-colors duration-200 ${
                isActive ? 'text-slate-950 font-black' : 'text-slate-800/60 hover:text-slate-950'
              }`}>
                {item.label}
              </span>

              {/* Small indicator bar */}
              {isActive && (
                <motion.span
                  layoutId="activeBottomTabIndicator"
                  className="absolute bottom-0 w-3 h-0.5 bg-slate-950 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 25 }}
                />
              )}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function Card({ children, className, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-4 transition-transform active:scale-[0.98] ${!className?.includes('bg-') ? 'bg-white' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  className,
  variant = 'primary',
  disabled,
  isLoading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.95] disabled:opacity-50 disabled:active:scale-100 uppercase tracking-wider text-sm";
  const variants = {
    primary: "bg-[#FFC107] text-[#37474F] shadow-lg shadow-[#FFC107]/20",
    secondary: "bg-[#37474F] text-white shadow-lg shadow-[#37474F]/20",
    outline: "border-2 border-[#FFC107] text-[#FFC107]",
    ghost: "text-[#37474F] hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

export function BannerAdSlot({ state }: { state: AppState }) {
  const containerId = useMemo(() => "startio-banner-" + Math.random().toString(36).substr(2, 9), []);
  const settings = state.settings;

  useEffect(() => {
    if (!settings?.startioAppId) return;
    const timer = setTimeout(() => {
      // @ts-ignore
      if (window.startapp || window.startApp) {
        // @ts-ignore
        const sdk = window.startapp || window.startApp;
        if (typeof sdk.showBanner === 'function') {
           sdk.showBanner(containerId);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [containerId, settings?.startioAppId]);

  if (settings?.monetagBannerZoneId) {
    return <MonetagAdSlot zoneId={settings.monetagBannerZoneId} />;
  }

  return (
    <div id={containerId} className="w-full min-h-[50px] flex items-center justify-center bg-gray-50/50 rounded-xl overflow-hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">
      {settings?.startioAppId ? 'Ad Placement' : ''}
    </div>
  );
}

export function MonetagAdSlot({ zoneId }: { zoneId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !containerRef.current) return;

    const script = document.createElement('script');
    script.setAttribute('data-cfasync', 'false');
    script.src = `//pl12345678.highperformanceformat.com/${zoneId}/invoke.js`; // Example Monetag format
    script.async = true;
    
    const options = document.createElement('script');
    options.innerHTML = `
      atOptions = {
        'key' : '${zoneId}',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    containerRef.current.appendChild(options);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zoneId]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center min-h-[50px] mb-4" />
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, className, variant = 'primary', ...props }: { children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' } & React.HTMLAttributes<HTMLSpanElement>) {
  const base = "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border";
  const variants = {
    primary: "bg-[#FFC107] text-[#37474F] border-[#FFC107]",
    secondary: "bg-gray-100 text-gray-400 border-gray-100",
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</span>;
}

export function Input({ label, placeholder, value, onChange, type = 'text', icon: Icon, className, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-bold text-gray-500 ml-1">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFC107] transition-colors" size={18} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-white border-2 border-gray-100 rounded-xl py-3 ${Icon ? 'pl-11' : 'px-4'} pr-4 outline-none focus:border-[#FFC107] transition-all text-sm ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export function Textarea({ label, placeholder, value, onChange, rows = 4, className, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-bold text-gray-500 ml-1">{label}</label>}
      <div className="relative group">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          className={`w-full bg-white border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-[#FFC107] transition-all text-sm resize-y ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

