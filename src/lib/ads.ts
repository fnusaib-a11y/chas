/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare global {
  interface Window {
    startapp?: {
      showInterstitial: () => void;
      showBanner: (containerId: string) => void;
    };
    startApp?: {
      showInterstitial: () => void;
      showBanner: (containerId: string) => void;
    };
  }
}

export const ads = {
  showInterstitial: (settings?: any) => {
    // 1. Try Monetag if Zone ID provided
    if (settings?.monetagInterstitialZoneId) {
       // Monetag interstitials are often automatic on script load, 
       // but we can try to trigger if they expose a function.
       // Usually, for web, just having the tag is enough.
       console.log('Monetag Interstitial check');
    }

    // 2. Try Start.io
    if (window.startapp && typeof window.startapp.showInterstitial === 'function') {
      window.startapp.showInterstitial();
    } else if (window.startApp && typeof window.startApp.showInterstitial === 'function') {
      window.startApp.showInterstitial();
    } else {
      console.warn('Ad SDK not loaded yet or showInterstitial not available');
    }
  },
  showBanner: (containerId: string) => {
    if (window.startapp && typeof window.startapp.showBanner === 'function') {
      window.startapp.showBanner(containerId);
    } else if (window.startApp && typeof window.startApp.showBanner === 'function') {
      window.startApp.showBanner(containerId);
    }
  }
};
