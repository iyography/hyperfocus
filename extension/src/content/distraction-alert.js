// Hyperfocus Extension - Content Script
// Injects distraction alerts into web pages

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'DISTRACTION_ALERT') {
    showDistractionAlert(message.site, message.task);
  } else if (message.type === 'TAB_OVERLOAD') {
    showTabOverloadWarning(message.count);
  }
});

function showDistractionAlert(site, task) {
  if (document.getElementById('hyperfocus-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'hyperfocus-overlay';
  overlay.innerHTML = `
    <div style="position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;">
      <div style="background:#13131a;border:1px solid #2a2a3a;border-radius:20px;padding:40px;max-width:400px;text-align:center;color:#f0f0f5;">
        <div style="color:#f59e0b;font-size:14px;margin-bottom:12px;">You're on ${site}</div>
        <div style="font-size:14px;color:#8888a0;margin-bottom:8px;">You said you wanted to work on:</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:20px;">${task}</div>
        <div style="color:#f59e0b;font-weight:600;margin-bottom:24px;">Is this helping?</div>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="hf-return" style="background:#7c5cff;color:white;border:none;padding:10px 24px;border-radius:12px;font-weight:600;cursor:pointer;">Return to Focus</button>
          <button id="hf-continue" style="background:#1c1c27;color:#8888a0;border:1px solid #2a2a3a;padding:10px 24px;border-radius:12px;cursor:pointer;">Continue Anyway</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('hf-return').addEventListener('click', () => {
    overlay.remove();
    history.back();
  });

  document.getElementById('hf-continue').addEventListener('click', () => {
    overlay.remove();
  });
}

function showTabOverloadWarning(count) {
  if (document.getElementById('hyperfocus-tab-warning')) return;

  const warning = document.createElement('div');
  warning.id = 'hyperfocus-tab-warning';
  warning.innerHTML = `
    <div style="position:fixed;top:16px;right:16px;z-index:2147483647;background:#13131a;border:1px solid #7c5cff33;border-radius:16px;padding:20px;max-width:300px;font-family:system-ui,sans-serif;color:#f0f0f5;box-shadow:0 0 30px rgba(124,92,255,0.15);">
      <div style="font-size:24px;font-weight:700;color:#7c5cff;margin-bottom:4px;">${count} tabs</div>
      <div style="font-size:13px;color:#8888a0;margin-bottom:12px;">You have a lot of tabs open. Are you still focused?</div>
      <button id="hf-dismiss-tabs" style="background:#1c1c27;color:#8888a0;border:1px solid #2a2a3a;padding:6px 16px;border-radius:8px;cursor:pointer;width:100%;font-size:13px;">Got it</button>
    </div>
  `;
  document.body.appendChild(warning);

  document.getElementById('hf-dismiss-tabs').addEventListener('click', () => {
    warning.remove();
  });

  // Auto dismiss after 10s
  setTimeout(() => warning.remove(), 10000);
}
