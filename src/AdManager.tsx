/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppSettings } from './types';

export const AdManager = ({ settings }: { settings: AppSettings }) => {
  React.useEffect(() => {
    if (settings.monetagId && settings.monetagId.includes('<script')) {
      const div = document.createElement('div');
      div.innerHTML = settings.monetagId;
      const scripts = div.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const s = document.createElement('script');
        s.type = scripts[i].type || 'text/javascript';
        if (scripts[i].src) s.src = scripts[i].src;
        if (scripts[i].innerHTML) s.innerHTML = scripts[i].innerHTML;
        // copy data attributes
        Array.from(scripts[i].attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            s.setAttribute(attr.name, attr.value);
          }
        });
        document.head.appendChild(s);
      }
    } else if (settings.monetagId) {
      const script = document.createElement('script');
      script.src = 'https://alwingulla.com/88/p.js';
      script.setAttribute('data-polyglot-id', settings.monetagId);
      document.head.appendChild(script);
    }
  }, [settings.monetagId]);

  React.useEffect(() => {
    if (!settings.startioAppId) return;

    let meta = document.querySelector('meta[name="startapp-application-id"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'startapp-application-id');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', settings.startioAppId);

    if (!document.querySelector('script[src*="mbi.js"]')) {
      const script = document.createElement('script');
      script.src = "https://mbi.startappservice.com/mbi.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [settings.startioAppId]);

  return null;
};
