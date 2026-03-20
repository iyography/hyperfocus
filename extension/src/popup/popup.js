document.getElementById('open-app').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://hyperfocus.app' });
});

// Load data from storage
chrome.storage.local.get(['userProfile', 'streak'], (data) => {
  if (data.userProfile) {
    document.getElementById('level').textContent = data.userProfile.level || '-';
    document.getElementById('user-name').textContent = data.userProfile.displayName || 'User';
    document.getElementById('user-xp').textContent = `${data.userProfile.totalXp || 0} XP`;
  }
  if (data.streak) {
    document.getElementById('streak').textContent = `${data.streak.currentStreak || 0} days`;
  }
});
