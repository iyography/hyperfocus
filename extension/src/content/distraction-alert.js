// Hyperfocus Extension - Content Script
// Injects distraction alerts, focus nudges, task banners, feed hiding, and celebrations

(() => {
  'use strict';

  // ── Shared Constants ──────────────────────────────────────────────
  const Z_TOP = '2147483647';
  const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  const COLOR = {
    bgDeep: '#0a0a0f',
    bgCard: '#13131a',
    text: '#f0f0f5',
    textMuted: '#8888a0',
    accent: '#6366f1',
    accentGlow: 'rgba(99,102,241,0.25)',
    border: '#2a2a3a',
    warn: '#f59e0b',
    danger: '#ef4444',
    success: '#22c55e',
  };

  // ── Utility Helpers ───────────────────────────────────────────────

  function removeEl(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function fadeIn(el, duration = 300) {
    el.style.opacity = '0';
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        if (el.dataset.scaleIn) el.style.transform = 'scale(1)';
        if (el.dataset.slideIn) el.style.transform = 'translateX(0)';
      });
    });
  }

  function fadeOut(el, duration = 300, then) {
    el.style.opacity = '0';
    if (el.dataset.slideIn) el.style.transform = 'translateX(120%)';
    setTimeout(() => {
      el.remove();
      if (then) then();
    }, duration);
  }

  // ── 1. Distraction Alert (full-screen overlay) ────────────────────

  let fiveMinTimer = null;

  function showDistractionAlert({ site, task, repeatOffender }) {
    removeEl('hyperfocus-overlay');
    if (fiveMinTimer) clearTimeout(fiveMinTimer);

    const overlay = document.createElement('div');
    overlay.id = 'hyperfocus-overlay';
    overlay.dataset.scaleIn = '1';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: Z_TOP,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, transform: 'scale(0.96)', opacity: '0',
      transition: 'opacity 350ms ease, transform 350ms ease',
    });

    const repeatMsg = repeatOffender
      ? `<div style="background:${COLOR.danger}18;border:1px solid ${COLOR.danger}44;border-radius:12px;padding:12px 16px;margin-bottom:20px;color:${COLOR.danger};font-size:13px;font-weight:600;">
           You've visited this site multiple times. Your focus score is dropping.
         </div>`
      : '';

    overlay.innerHTML = `
      <div style="background:${COLOR.bgCard};border:1px solid ${COLOR.border};border-radius:24px;padding:48px 40px;max-width:460px;width:90%;text-align:center;color:${COLOR.text};box-shadow:0 24px 80px rgba(0,0,0,0.6);">
        <div style="width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:${COLOR.warn}20;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">&#9888;</span>
        </div>
        <div style="color:${COLOR.warn};font-size:14px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:16px;">You're on ${site}</div>
        ${repeatMsg}
        <div style="font-size:15px;color:${COLOR.textMuted};margin-bottom:8px;">THIS is the task you chose to work on right now:</div>
        <div style="font-size:26px;font-weight:800;margin-bottom:24px;line-height:1.3;color:${COLOR.text};">${task || 'Your current task'}</div>
        <div style="color:${COLOR.warn};font-weight:600;font-size:16px;margin-bottom:32px;">Is this helping you complete that?</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button id="hf-return" style="background:${COLOR.accent};color:white;border:none;padding:12px 28px;border-radius:14px;font-weight:700;font-size:15px;cursor:pointer;transition:transform 120ms ease,box-shadow 120ms ease;box-shadow:0 4px 20px ${COLOR.accentGlow};">
            Return to Focus
          </button>
          <button id="hf-five-min" style="background:${COLOR.bgDeep};color:${COLOR.textMuted};border:1px solid ${COLOR.border};padding:12px 28px;border-radius:14px;font-size:14px;cursor:pointer;transition:background 120ms ease;">
            5 More Minutes
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay, 350);

    document.getElementById('hf-return').addEventListener('click', () => {
      fadeOut(overlay, 250, () => history.back());
    });

    document.getElementById('hf-five-min').addEventListener('click', () => {
      fadeOut(overlay, 250);
      // Re-trigger after 5 minutes
      fiveMinTimer = setTimeout(() => {
        showDistractionAlert({ site, task, repeatOffender: true });
      }, 5 * 60 * 1000);
    });
  }

  // ── 2. Tab Overload Warning ───────────────────────────────────────

  function showTabOverloadWarning({ count, limit, closableTabs = [] }) {
    removeEl('hyperfocus-tab-warning');

    const card = document.createElement('div');
    card.id = 'hyperfocus-tab-warning';
    card.dataset.slideIn = '1';
    Object.assign(card.style, {
      position: 'fixed', top: '16px', right: '16px', zIndex: Z_TOP,
      background: COLOR.bgCard, border: `1px solid ${COLOR.accent}44`,
      borderRadius: '18px', padding: '24px', maxWidth: '380px', width: '380px',
      fontFamily: FONT, color: COLOR.text,
      boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${COLOR.accentGlow}`,
      transform: 'translateX(120%)', opacity: '0',
      transition: 'opacity 400ms ease, transform 400ms cubic-bezier(0.22,1,0.36,1)',
      maxHeight: '80vh', overflowY: 'auto',
    });

    // Build tab list HTML
    const tabListHtml = closableTabs.length > 0
      ? closableTabs.map((t, i) => `
          <div id="hf-tab-row-${i}" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:${COLOR.bgDeep};border:1px solid ${COLOR.border};border-radius:8px;margin-bottom:4px;">
            <input type="checkbox" id="hf-tab-check-${i}" data-tab-id="${t.id}" style="accent-color:${COLOR.accent};width:16px;height:16px;cursor:pointer;" />
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:500;color:${COLOR.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.title || 'Untitled'}</div>
              <div style="font-size:10px;color:${COLOR.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.url || ''}</div>
            </div>
          </div>
        `).join('')
      : '<div style="font-size:12px;color:${COLOR.textMuted};padding:8px 0;">No closable tabs found.</div>';

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
        <span style="font-size:28px;">📑</span>
        <span style="font-size:32px;font-weight:800;color:${COLOR.accent};animation:hf-pulse 2s ease-in-out infinite;">${count}</span>
        <span style="font-size:15px;color:${COLOR.textMuted};font-weight:600;">tabs open</span>
      </div>
      <div style="font-size:13px;color:${COLOR.textMuted};line-height:1.5;margin-bottom:14px;">
        Your limit is <strong style="color:${COLOR.text};">${limit}</strong>. Choose what to do with these tabs:
      </div>

      <div style="display:flex;gap:6px;margin-bottom:12px;">
        <button id="hf-select-all-tabs" style="background:none;border:1px solid ${COLOR.border};color:${COLOR.textMuted};padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;">Select All</button>
        <button id="hf-select-none-tabs" style="background:none;border:1px solid ${COLOR.border};color:${COLOR.textMuted};padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;">Select None</button>
      </div>

      <div id="hf-tab-list" style="margin-bottom:14px;max-height:200px;overflow-y:auto;">
        ${tabListHtml}
      </div>

      <div style="display:flex;gap:6px;flex-direction:column;">
        <button id="hf-save-close-tabs" style="background:${COLOR.accent};color:white;border:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>💾</span> Save & Close Selected
        </button>
        <button id="hf-just-close-tabs" style="background:${COLOR.bgDeep};color:${COLOR.warn};border:1px solid ${COLOR.warn}44;padding:10px 16px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;">
          Close Selected (No Save)
        </button>
        <button id="hf-dismiss-tabs" style="background:none;color:${COLOR.textMuted};border:1px solid ${COLOR.border};padding:8px 16px;border-radius:10px;font-size:12px;cursor:pointer;">
          Dismiss — I'll handle it
        </button>
      </div>

      <style>
        @keyframes hf-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      </style>
    `;

    document.body.appendChild(card);
    fadeIn(card, 400);

    // Helper: get selected tab IDs
    function getSelectedTabIds() {
      return Array.from(card.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.dataset.tabId))
        .filter(id => !isNaN(id));
    }

    // Select all / none
    const selectAll = document.getElementById('hf-select-all-tabs');
    const selectNone = document.getElementById('hf-select-none-tabs');
    if (selectAll) {
      selectAll.addEventListener('click', () => {
        card.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
      });
    }
    if (selectNone) {
      selectNone.addEventListener('click', () => {
        card.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      });
    }

    // Save & Close
    document.getElementById('hf-save-close-tabs').addEventListener('click', () => {
      const tabIds = getSelectedTabIds();
      if (tabIds.length > 0) {
        chrome.runtime.sendMessage({ type: 'SAVE_AND_CLOSE_TABS', tabIds });
      }
      fadeOut(card, 300);
    });

    // Just Close
    document.getElementById('hf-just-close-tabs').addEventListener('click', () => {
      const tabIds = getSelectedTabIds();
      if (tabIds.length > 0) {
        chrome.runtime.sendMessage({ type: 'CLOSE_TABS', tabIds });
      }
      fadeOut(card, 300);
    });

    // Dismiss
    document.getElementById('hf-dismiss-tabs').addEventListener('click', () => {
      fadeOut(card, 300);
    });

    // Auto-dismiss after 30 seconds (longer since user needs time to choose)
    setTimeout(() => {
      if (document.getElementById('hyperfocus-tab-warning')) {
        fadeOut(card, 300);
      }
    }, 30000);
  }

  // ── 3. Focus Nudge ────────────────────────────────────────────────

  function showFocusNudge({ message: nudgeMsg, task }) {
    removeEl('hyperfocus-nudge');

    const nudge = document.createElement('div');
    nudge.id = 'hyperfocus-nudge';
    Object.assign(nudge.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: Z_TOP,
      background: COLOR.bgCard, border: `1px solid ${COLOR.border}`,
      borderRadius: '16px', padding: '20px', maxWidth: '300px', width: '300px',
      fontFamily: FONT, color: COLOR.text,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
      opacity: '0', transition: 'opacity 400ms ease',
    });

    nudge.innerHTML = `
      <div style="font-size:13px;color:${COLOR.textMuted};line-height:1.5;margin-bottom:10px;">${nudgeMsg || 'Are you still focused?'}</div>
      ${task ? `<div style="font-size:15px;font-weight:700;margin-bottom:16px;color:${COLOR.text};">${task}</div>` : ''}
      <div style="display:flex;gap:8px;">
        <button id="hf-nudge-yes" style="flex:1;background:${COLOR.success}22;color:${COLOR.success};border:1px solid ${COLOR.success}44;padding:8px 12px;border-radius:10px;font-weight:600;font-size:12px;cursor:pointer;">
          Yes, I'm focused
        </button>
        <button id="hf-nudge-refocus" style="flex:1;background:${COLOR.accent}22;color:${COLOR.accent};border:1px solid ${COLOR.accent}44;padding:8px 12px;border-radius:10px;font-weight:600;font-size:12px;cursor:pointer;">
          I need to refocus
        </button>
      </div>
    `;

    document.body.appendChild(nudge);
    fadeIn(nudge, 400);

    document.getElementById('hf-nudge-yes').addEventListener('click', () => {
      fadeOut(nudge, 300);
    });

    document.getElementById('hf-nudge-refocus').addEventListener('click', () => {
      // Open the Hyperfocus web app
      chrome.runtime.sendMessage({ type: 'OPEN_FOCUS_APP' });
      fadeOut(nudge, 300);
    });

    // Auto-dismiss after 20 seconds
    setTimeout(() => {
      if (document.getElementById('hyperfocus-nudge')) {
        fadeOut(nudge, 300);
      }
    }, 20000);
  }

  // ── 4. Current Task Banner ────────────────────────────────────────

  function showTaskBanner({ task }) {
    removeEl('hyperfocus-task-banner');

    const banner = document.createElement('div');
    banner.id = 'hyperfocus-task-banner';
    Object.assign(banner.style, {
      position: 'fixed', top: '0', left: '0', right: '0', height: '40px',
      zIndex: Z_TOP,
      background: `linear-gradient(135deg, ${COLOR.bgCard}, ${COLOR.bgDeep})`,
      borderBottom: `1px solid ${COLOR.accent}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontFamily: FONT, fontSize: '13px', color: COLOR.textMuted,
      opacity: '0', transition: 'opacity 300ms ease',
    });

    banner.innerHTML = `
      <span style="color:${COLOR.accent};font-size:10px;">&#9679;</span>
      <span>Currently working on:</span>
      <strong style="color:${COLOR.text};font-weight:700;">${task}</strong>
      <button id="hf-banner-close" style="position:absolute;right:12px;background:none;border:none;color:${COLOR.textMuted};font-size:18px;cursor:pointer;padding:4px 8px;line-height:1;" title="Dismiss">&times;</button>
    `;

    document.body.appendChild(banner);
    // Push page content down
    document.body.style.transition = 'padding-top 300ms ease';
    document.body.style.paddingTop = '40px';
    fadeIn(banner, 300);

    document.getElementById('hf-banner-close').addEventListener('click', () => {
      hideTaskBanner();
    });
  }

  function hideTaskBanner() {
    const banner = document.getElementById('hyperfocus-task-banner');
    if (banner) {
      fadeOut(banner, 250, () => {
        document.body.style.paddingTop = '';
      });
    }
  }

  // ── 5. Feed Hiding CSS Injection ──────────────────────────────────

  const FEED_STYLE_ID = 'hyperfocus-feed-hide';

  const FEED_RULES = {
    'youtube.com': `
      #secondary { filter: blur(10px) !important; pointer-events: none !important; }
      #contents.ytd-rich-grid-renderer { display: none !important; }
      ytd-watch-next-secondary-results-renderer { filter: blur(10px) !important; pointer-events: none !important; }
    `,
    'twitter.com': `
      [data-testid="primaryColumn"] > div > div:nth-child(n+3) { display: none !important; }
      [data-testid="sidebarColumn"] [aria-label="Who to follow"] { display: none !important; }
      [data-testid="sidebarColumn"] section[aria-label*="Trending"] { display: none !important; }
    `,
    'x.com': `
      [data-testid="primaryColumn"] > div > div:nth-child(n+3) { display: none !important; }
      [data-testid="sidebarColumn"] [aria-label="Who to follow"] { display: none !important; }
      [data-testid="sidebarColumn"] section[aria-label*="Trending"] { display: none !important; }
    `,
    'reddit.com': `
      .rpBJOHq2PR60pnwJlUyP0 { display: none !important; }
      [data-testid="post-container"] { display: none !important; }
      shreddit-feed { display: none !important; }
    `,
    'instagram.com': `
      main article { filter: blur(12px) !important; pointer-events: none !important; }
      main section > div > div > div { filter: blur(12px) !important; pointer-events: none !important; }
    `,
    'facebook.com': `
      [role="feed"] { display: none !important; }
      [aria-label="Stories"] { display: none !important; }
    `,
    'tiktok.com': `
      #app > div > div:nth-child(2) { filter: blur(12px) !important; pointer-events: none !important; }
    `,
  };

  function hideFeeds({ site }) {
    removeEl(FEED_STYLE_ID);

    // Match the site key from hostname
    const hostname = site || window.location.hostname;
    let css = '';
    for (const [domain, rules] of Object.entries(FEED_RULES)) {
      if (hostname.includes(domain)) {
        css += rules;
        break;
      }
    }
    if (!css) return;

    const style = document.createElement('style');
    style.id = FEED_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showFeeds() {
    removeEl(FEED_STYLE_ID);
  }

  // ── 6. Session Complete Celebration ───────────────────────────────

  function showSessionComplete({ xp, duration }) {
    removeEl('hyperfocus-celebration');

    const overlay = document.createElement('div');
    overlay.id = 'hyperfocus-celebration';
    overlay.dataset.scaleIn = '1';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: Z_TOP,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, pointerEvents: 'none',
      transform: 'scale(0.95)', opacity: '0',
      transition: 'opacity 500ms ease, transform 500ms ease',
    });

    // Generate confetti particles (CSS only)
    let confettiHtml = '';
    const confettiColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
    for (let i = 0; i < 40; i++) {
      const color = confettiColors[i % confettiColors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const size = 4 + Math.random() * 8;
      const rotation = Math.random() * 360;
      confettiHtml += `<div style="position:absolute;top:-10px;left:${left}%;width:${size}px;height:${size * 0.6}px;background:${color};border-radius:2px;transform:rotate(${rotation}deg);animation:hf-confetti-fall ${1.5 + Math.random()}s ease-in ${delay}s forwards;opacity:0;"></div>`;
    }

    const durationMin = duration ? Math.round(duration / 60) : null;
    const durationText = durationMin ? `<div style="font-size:13px;color:${COLOR.textMuted};margin-top:4px;">${durationMin} minutes of deep focus</div>` : '';

    overlay.innerHTML = `
      <style>
        @keyframes hf-confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(${window.innerHeight}px) rotate(720deg); }
        }
      </style>
      ${confettiHtml}
      <div style="background:${COLOR.bgCard};border:1px solid ${COLOR.accent}44;border-radius:24px;padding:40px 48px;text-align:center;color:${COLOR.text};box-shadow:0 16px 60px rgba(0,0,0,0.5),0 0 40px ${COLOR.accentGlow};">
        <div style="font-size:48px;margin-bottom:12px;">&#127881;</div>
        <div style="font-size:24px;font-weight:800;margin-bottom:8px;">Session Complete!</div>
        <div style="font-size:20px;font-weight:700;color:${COLOR.accent};">+${xp || 0} XP earned</div>
        ${durationText}
      </div>
    `;

    document.body.appendChild(overlay);
    fadeIn(overlay, 500);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      if (document.getElementById('hyperfocus-celebration')) {
        fadeOut(overlay, 500);
      }
    }, 4000);
  }

  // ── Message Listener ──────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'DISTRACTION_ALERT':
        showDistractionAlert(message);
        break;
      case 'TAB_OVERLOAD':
        showTabOverloadWarning(message);
        break;
      case 'FOCUS_NUDGE':
        showFocusNudge(message);
        break;
      case 'SHOW_TASK_BANNER':
        showTaskBanner(message);
        break;
      case 'HIDE_TASK_BANNER':
        hideTaskBanner();
        break;
      case 'HIDE_FEEDS':
        hideFeeds(message);
        break;
      case 'SHOW_FEEDS':
        showFeeds();
        break;
      case 'SESSION_COMPLETE':
        showSessionComplete(message);
        break;
    }
  });

  // ── Storage Change Listener (auto-update task banner) ─────────────

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.currentSession) {
      const session = changes.currentSession.newValue;
      if (session && session.active && session.task) {
        showTaskBanner({ task: session.task });
      } else {
        hideTaskBanner();
      }
    }
  });

  // ── 7. Web App Bridge ─────────────────────────────────────────────
  // Relay messages between the web app and the extension background

  // Signal to web app that extension is installed
  window.__HYPERFOCUS_EXTENSION__ = true;

  // Dispatch a custom event so the web app knows we're here
  window.dispatchEvent(new CustomEvent('hyperfocus-extension-ready'));

  window.addEventListener('message', async (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;
    if (!event.data || event.data.source !== 'hyperfocus-webapp') return;

    const { type, requestId, payload } = event.data;

    try {
      let result;

      switch (type) {
        case 'GET_STATE': {
          result = await chrome.storage.local.get(null);
          break;
        }
        case 'UPDATE_STATE': {
          await chrome.storage.local.set(payload);
          // Notify background of settings change
          try { chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: payload }); } catch {}
          result = { success: true };
          break;
        }
        case 'START_SESSION': {
          result = await chrome.runtime.sendMessage({
            type: 'SESSION_START',
            task: payload.task,
            duration: payload.duration,
          });
          break;
        }
        case 'STOP_SESSION': {
          result = await chrome.runtime.sendMessage({ type: 'SESSION_END' });
          break;
        }
        case 'SYNC_PLAN': {
          await chrome.storage.local.set({
            dailyPriority: payload.dailyPriority,
            tasks: payload.tasks,
          });
          result = { success: true };
          break;
        }
        default:
          result = { error: 'Unknown message type' };
      }

      window.postMessage({
        source: 'hyperfocus-extension',
        responseId: requestId,
        payload: result,
      }, '*');
    } catch (err) {
      window.postMessage({
        source: 'hyperfocus-extension',
        responseId: requestId,
        error: err.message || 'Unknown error',
      }, '*');
    }
  });

  // Forward storage changes to web app
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const updated = {};
    for (const [key, { newValue }] of Object.entries(changes)) {
      updated[key] = newValue;
    }
    window.postMessage({
      source: 'hyperfocus-extension',
      type: 'STATE_CHANGED',
      payload: updated,
    }, '*');
  });

})();
