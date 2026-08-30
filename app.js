import { opportunities } from './src/data.js';
import { applications, joinedSpaces, profile, savedTitles, writeList, writeObject } from './src/storage.js';

const savedKey = 'pulseup-saved-opportunities';
const joinedSpacesKey = 'pulseup-joined-spaces';
const levelNames = ['Starter', 'Explorer', 'Research Scout', 'Career Builder', 'Resident Explorer', 'Clinical Leader'];
let activeFilter = 'all';
let activeQuery = '';

function injectGamificationStyles() {
  const styleTag = document.querySelector('#pulseup-gamification-styles');
  if (styleTag) return;
  const style = document.createElement('style');
  style.id = 'pulseup-gamification-styles';
  style.textContent = `
    .gamified-panel{background:linear-gradient(135deg,#f4fbfc,#fff7ef);border:1px solid #dfeaf0;border-radius:18px;padding:20px 20px 18px;box-shadow:0 18px 36px rgba(35,127,155,.08);margin-bottom:18px}.gamified-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.gamified-header h2{margin:6px 0 0;font:800 22px Manrope,sans-serif;letter-spacing:-.7px;color:var(--ink)}.xp-pill{background:#fff;border:1px solid #dfeaf0;border-radius:999px;padding:8px 12px;font-weight:800;color:var(--blue);box-shadow:0 8px 22px rgba(35,127,155,.08)}.xp-score{font-size:22px;letter-spacing:-.8px}.progress-track{height:12px;border-radius:999px;background:rgba(35,127,155,.12);overflow:hidden;margin:16px 0 12px;position:relative}.level-progress-fill{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#237f9b,#5ab0c7 60%,#ffb16a)}.progress-meta{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:11px}.progress-meta span{display:flex;align-items:center;gap:6px}.progress-meta strong{color:var(--ink)}.progress-meta svg{width:13px}        .badge-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.badge-chip{padding:6px 10px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase}.badge-boost{background:#edf6f3;color:#2e8d74}.badge-complete{background:#dfeef5;color:#195d72}.mission-panel,.leaderboard-panel{margin-bottom:18px}.mission-list,.leaderboard-list{display:grid;gap:10px}.mission-item,.leaderboard-row{width:100%;border:1px solid var(--line);background:#fff;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;justify-content:space-between;cursor:pointer;text-align:left;color:var(--ink);box-shadow:0 12px 22px rgba(23,45,59,.04)}.mission-item div{flex:1;display:grid;gap:4px}.mission-item strong{font-size:13px}.mission-item small{color:var(--muted);font-size:10px}.mission-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--pale-blue);color:var(--blue)}.mission-state{font-size:10px;font-weight:800;background:var(--peach);color:#b76541;padding:6px 8px;border-radius:999px}.mission-item.complete{border-color:#cfe6d7;background:#f4fcf7}.mission-item.complete .mission-state{background:#dff6ea;color:#2f8d74}.mission-item[data-action="planner"] .mission-icon{background:#eaf5f4;color:#1e7b86}.mission-item[data-action="mentor"] .mission-icon{background:#fff1e7;color:#be724d}.mission-item[data-action="spaces"] .mission-icon{background:#eef3ff;color:#4f73d9}.leaderboard-row{padding:12px 14px;justify-content:flex-start}.leaderboard-row.is-current-user{background:linear-gradient(135deg,#edf9fb,#f9f6ec);border-color:#cfe4ea}.rank-badge{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#eef4f6;color:var(--blue);font-size:10px;font-weight:800}.rank-current{background:var(--blue);color:#fff}.leaderboard-user{display:flex;align-items:center;gap:10px;min-width:0;flex:1}.leaderboard-user strong{display:block;font-size:12px}.leaderboard-user small{color:var(--muted);font-size:10px}.mini-avatar{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#a9d1d4,#e7bb9f);color:#fff;font-size:10px;font-weight:800}.leaderboard-score{font-size:11px;color:var(--ink);font-weight:800}.achievement-toast{position:fixed;right:24px;bottom:110px;z-index:50;max-width:320px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,#1a5b73,#237f9b);color:#fff;box-shadow:0 18px 40px rgba(35,127,155,.2);opacity:0;transform:translateY(12px) scale(.98);transition:all .25s ease;pointer-events:none}.achievement-toast.visible{opacity:1;transform:translateY(0) scale(1)}.achievement-toast strong{display:block;margin-bottom:4px;font-size:12px;text-transform:uppercase;letter-spacing:1px}.achievement-toast span{font-size:13px;line-height:1.4}@media(max-width:800px){.gamified-panel{padding:16px}.gamified-header,.progress-meta{align-items:flex-start}.xp-pill{padding:7px 10px}.xp-score{font-size:18px}.leaderboard-row{padding:10px 12px}.leaderboard-score{font-size:10px}}`;  document.head.append(style);}

function getGamifiedProfile() {
  const current = profile();
  const xp = Number(current.xp || 1450);
  const streak = Number(current.streak || 7);
  const levelIndex = Math.min(levelNames.length - 1, Math.max(0, Math.floor(xp / 500)));
  return {
    ...current,
    xp,
    streak,
    levelName: current.levelName || levelNames[levelIndex],
    badges: Array.isArray(current.badges) && current.badges.length ? current.badges : ['Verified', 'Researcher', 'Connector']
  };
}

function saveGamifiedProfile(updates = {}) {
  const current = profile();
  const next = { ...current, ...updates };
  writeObject('pulseup-profile', next);
}

function showAchievementToast(title, message) {
  let toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.append(toast);
  }
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  toast.classList.add('visible');
  window.clearTimeout(showAchievementToast.timeout);
  showAchievementToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

function awardXp(amount, message, achievementTitle) {
  const current = profile();
  const nextXp = Math.max(0, Number(current.xp || 1450) + amount);
  const nextProfile = { ...current, xp: nextXp };
  writeObject('pulseup-profile', nextProfile);
  updateProfileUi();
  if (message) showFeedback(message);
  if (achievementTitle) showAchievementToast('Achievement unlocked', achievementTitle);
}

function updateDailyStreak() {
  const data = profile();
  const today = new Date().toISOString().slice(0, 10);
  const lastActive = data.lastActiveDate;
  const currentStreak = Number(data.streak || 7);

  if (!lastActive) {
    saveGamifiedProfile({ streak: currentStreak, lastActiveDate: today });
    return;
  }

  if (lastActive === today) return;

  const prev = new Date(lastActive);
  const next = new Date(today);
  const diffDays = Math.round((next - prev) / 86400000);

  if (diffDays === 1) {
    saveGamifiedProfile({ streak: currentStreak + 1, lastActiveDate: today });
  } else if (diffDays > 1) {
    saveGamifiedProfile({ streak: 1, lastActiveDate: today });
  }
}

function updateGamifiedUi() {
  const state = getGamifiedProfile();
  const levelIndex = Math.min(levelNames.length - 1, Math.max(0, Math.floor(state.xp / 500)));
  const nextLevel = 500 - (state.xp % 500 || 500);
  const progress = (state.xp % 500) / 500 * 100;
  const levelName = levelNames[levelIndex];
  const xpValue = document.querySelector('.xp-score');
  const streakValue = document.querySelector('.streak-days');
  const levelDisplay = document.querySelector('.level-name');
  const nextLevelValue = document.querySelector('.next-level');
  const fill = document.querySelector('.level-progress-fill');
  const badgeNodes = document.querySelectorAll('.badge-chip');
  const missionItems = document.querySelectorAll('.mission-item');
  const leaderboardScore = document.querySelector('.leaderboard-row.is-current-user .leaderboard-score');

  if (xpValue) xpValue.textContent = state.xp;
  if (streakValue) streakValue.textContent = `${state.streak} day${state.streak === 1 ? '' : 's'}`;
  if (levelDisplay) levelDisplay.textContent = levelName;
  if (nextLevelValue) nextLevelValue.textContent = `${nextLevel} XP`;
  if (fill) fill.style.width = `${Math.min(100, progress)}%`;
  if (leaderboardScore) leaderboardScore.textContent = `${state.xp} XP`;
  if (badgeNodes.length) {
    badgeNodes.forEach((node, index) => {
      const label = state.badges[index] || state.badges[0];
      node.textContent = label;
      node.classList.toggle('badge-complete', index === 0 || index === 1 || index === 2);
      node.classList.toggle('badge-boost', index === 0 || index === 1 || index === 2);
    });
  }

  const savedProgress = Math.min(3, savedTitles().length);
  const applicationProgress = Math.min(2, applications().length);
  const spaceProgress = Math.min(1, joinedSpaces().length);

  missionItems.forEach((item) => {
    const action = item.dataset.action;
    let count = 0;
    let target = 0;
    if (action === 'planner') {
      count = savedProgress;
      target = 3;
    } else if (action === 'mentor') {
      count = applicationProgress;
      target = 2;
    } else if (action === 'spaces') {
      count = spaceProgress;
      target = 1;
    }
    const stateText = item.querySelector('.mission-state');
    if (stateText) stateText.textContent = `${count}/${target}`;
    item.classList.toggle('complete', count >= target);
  });
}

function visibleOpportunities() {
  return opportunities.filter((item) => {
    const matchesQuery = `${item.title} ${item.org} ${item.type} ${item.detail}`.toLowerCase().includes(activeQuery);
    const matchesFilter = activeFilter === 'all'
      || item.type === activeFilter
      || (activeFilter === 'ONLINE' && /online|remote|hybrid/i.test(item.detail));
    return matchesQuery && matchesFilter;
  });
}

function updateSavedUi() {
  const count = savedTitles().filter((title) => opportunities.some((item) => item.title === title)).length;
  document.querySelector('.nav-count').textContent = count;
  document.querySelector('.profile-saved-count').textContent = count;
  document.querySelectorAll('[data-title]').forEach((card) => {
    const button = card.querySelector('.save-button');
    if (!button) return;
    const saved = savedTitles().includes(card.dataset.title);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-label', saved ? 'Remove from saved' : 'Save opportunity');
  });
}

function showOpportunityDetails(title) {
  const item = opportunities.find((opportunity) => opportunity.title === title);
  const modal = document.querySelector('#opportunity-modal');
  if (!item || !modal) return;
  modal.querySelector('.modal-tag').textContent = item.type;
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-org').textContent = item.org;
  modal.querySelector('.modal-detail').textContent = item.detail;
  modal.querySelector('.modal-status').textContent = item.status;
  modal.querySelector('.modal-summary').textContent = item.summary;
  const source = modal.querySelector('.modal-source');
  source.href = item.source;
  source.textContent = `Review ${item.sourceLabel}`;
  const applyButton = modal.querySelector('.modal-apply');
  const applied = applications().includes(title);
  applyButton.textContent = applied ? 'Application tracked' : 'Track application';
  applyButton.classList.toggle('tracked', applied);
  applyButton.dataset.title = title;
  modal.showModal();
}

function updateProfileUi() {
  const data = profile();
  const status = data.verificationStatus || 'unverified';
  const badge = document.querySelector('.profile-badge');
  const verificationButton = document.querySelector('[data-action="verify"]');
  if (badge) badge.innerHTML = `<i data-lucide="badge-check"></i>${status === 'pending' ? 'Verification pending' : status === 'verified' ? 'Verified student' : 'Verification recommended'}`;
  if (verificationButton) verificationButton.textContent = status === 'pending' ? 'Verification requested' : 'Request verification';
  document.querySelector('.applications-count').textContent = applications().length;
  updateGamifiedUi();
  renderIcons();
}

function renderApplications(status = 'all') {
  const list = document.querySelector('.application-list');
  const empty = document.querySelector('.applications-empty');
  const tracked = applications().map((title) => opportunities.find((item) => item.title === title)).filter(Boolean);
  const visible = status === 'tracked' ? tracked : tracked;
  list.innerHTML = visible.map((item) => `<article class="application-row" data-title="${item.title}"><div><span class="tag">${item.type}</span><h3>${item.title}</h3><p>${item.org} · ${item.detail}</p></div><div class="application-row-actions"><span class="application-status">Tracked</span><button class="text-button application-remove" data-title="${item.title}">Remove</button></div></article>`).join('');
  list.style.display = visible.length ? 'grid' : 'none';
  empty.style.display = visible.length ? 'none' : 'block';
  renderIcons();
}

function showFeedback(message) {
  let feedback = document.querySelector('.feedback-toast');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'feedback-toast';
    document.body.append(feedback);
  }

  feedback.textContent = message;
  feedback.classList.add('visible');
  window.clearTimeout(showFeedback.timeout);
  showFeedback.timeout = window.setTimeout(() => feedback.classList.remove('visible'), 2600);
}

function renderIcons() { if (window.lucide) lucide.createIcons(); }

function showView(viewName) {
  const modal = document.querySelector('#opportunity-modal');
  if (modal?.open) modal.close();
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active-view', view.dataset.section === viewName));
  document.querySelectorAll('[data-view]').forEach((link) => link.classList.toggle('active', link.dataset.view === viewName));
  if (viewName === 'saved') renderSaved();
  if (viewName === 'applications') renderApplications();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDiscover(items = opportunities) {
  const results = document.querySelector('.discover-results');
  results.innerHTML = items.length ? items.map((item) => `<article class="opportunity-card" data-title="${item.title}"><div class="card-banner ${item.color}"><span class="tag">${item.type}</span><button class="save-button" aria-label="Save opportunity"><i data-lucide="bookmark"></i></button><div class="banner-label">PULSE<br>INDEX</div></div><div class="card-body"><div class="org-line"><span class="org-logo study">P</span><span>${item.org} <i class="verified" data-lucide="badge-check"></i></span><time>New</time></div><h3>${item.title}</h3><div class="card-details"><span><i data-lucide="sparkles"></i>${item.detail}</span></div><div class="card-footer"><span class="spots">Open opportunity</span><button class="text-button" data-details="${item.title}">View details <i data-lucide="arrow-right"></i></button></div></div></article>`).join('') : '<p class="subtitle">No opportunities found. Try a broader search.</p>';
  updateSavedUi();
  renderIcons();
}

function renderSaved() {
  const saved = savedTitles().filter((title) => opportunities.some((item) => item.title === title));
  const results = document.querySelector('.saved-results');
  const emptyState = document.querySelector('#saved-view .empty-state');
  results.innerHTML = saved.map((title) => {
    const item = opportunities.find((opportunity) => opportunity.title === title);
    return item ? `<article class="opportunity-card" data-title="${item.title}"><div class="card-banner ${item.color}"><span class="tag">${item.type}</span><button class="save-button saved" aria-label="Remove from saved"><i data-lucide="bookmark"></i></button><div class="banner-label">PULSE<br>INDEX</div></div><div class="card-body"><div class="org-line"><span class="org-logo study">P</span><span>${item.org}</span></div><h3>${item.title}</h3><div class="card-details"><span><i data-lucide="sparkles"></i>${item.detail}</span></div></div></article>` : '';
  }).join('');
  emptyState.style.display = saved.length ? 'none' : 'block';
  results.className = saved.length ? 'saved-results opportunity-grid' : 'saved-results';
  updateSavedUi();
  renderIcons();
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    const href = viewLink.getAttribute('href');
    if (href) history.pushState(null, '', href);
    showView(viewLink.dataset.view);
  }
  const saveButton = event.target.closest('.save-button');
  if (saveButton) {
    const title = saveButton.closest('[data-title]')?.dataset.title;
    if (title) {
      const saved = savedTitles();
      const isSaved = saved.includes(title);
      const next = isSaved ? saved.filter((item) => item !== title) : [...saved, title];
      writeList(savedKey, next);
      if (!isSaved) {
        const current = profile();
        const currentXp = Number(current.xp || 1450);
        const nextXp = currentXp + 30;
        saveGamifiedProfile({ xp: nextXp, lastActiveDate: new Date().toISOString().slice(0, 10) });
        updateDailyStreak();
      }
      renderDiscover(visibleOpportunities());
      renderSaved();
      updateProfileUi();
    }
  }
  const detailsButton = event.target.closest('[data-details], .text-button');
  if (detailsButton) {
    const title = detailsButton.dataset.details || detailsButton.closest('[data-title]')?.dataset.title;
    if (title) showOpportunityDetails(title);
  }
  const applyButton = event.target.closest('.modal-apply');
  if (applyButton) {
    const title = applyButton.dataset.title;
    if (title && !applications().includes(title)) {
      writeList('pulseup-applications', [...applications(), title]);
      const current = profile();
      const nextXp = Number(current.xp || 1450) + 75;
      saveGamifiedProfile({ xp: nextXp, lastActiveDate: new Date().toISOString().slice(0, 10) });
      updateDailyStreak();
      applyButton.textContent = 'Application tracked';
      applyButton.classList.add('tracked');
      updateProfileUi();
      showFeedback('Application saved to your career dashboard.');
    }
    const removeApplication = event.target.closest('.application-remove');
    if (removeApplication) {
      writeList('pulseup-applications', applications().filter((title) => title !== removeApplication.dataset.title));
      renderApplications(document.querySelector('.application-filter.active')?.dataset.status || 'all');
      updateProfileUi();
      showFeedback('Application removed from your pipeline.');
    }
    const applicationFilter = event.target.closest('.application-filter');
    if (applicationFilter) {
      document.querySelectorAll('.application-filter').forEach((button) => button.classList.toggle('active', button === applicationFilter));
      renderApplications(applicationFilter.dataset.status);
    }
  }
  const filter = event.target.closest('.filter');
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === filter));
    renderDiscover(visibleOpportunities());
  }
  const action = event.target.closest('[data-action]');
  if (action) {
    const messages = {
      cv: 'CV builder is ready for your verified profile data.',
      planner: 'Career planner saved as your next step.',
      mentor: 'Mentor matching will use your specialty and goals.',
      spaces: 'Goal Space directory is coming next.',
      verify: 'Verification request submitted for review.'
    };
    const rewards = { cv: 40, planner: 50, mentor: 60, spaces: 35, verify: 120 };
    const key = action.dataset.action;
    if (rewards[key]) {
      const current = profile();
      const baseXp = Number(current.xp || 1450);
      const nextXp = baseXp + rewards[key];
      saveGamifiedProfile({ xp: nextXp, lastActiveDate: new Date().toISOString().slice(0, 10) });
      updateDailyStreak();
      if (nextXp >= 1500 && !(current.achievementMilestones || []).includes('Research Scout')) {
        const milestoneList = Array.isArray(current.achievementMilestones) ? current.achievementMilestones : [];
        saveGamifiedProfile({ achievementMilestones: [...milestoneList, 'Research Scout'] });
        showAchievementToast('Level unlocked', 'Research Scout unlocked!');
      }
    }
    if (key === 'verify') {
      saveGamifiedProfile({ verificationStatus: 'pending' });
    }
    showFeedback(messages[key]);
    updateProfileUi();
  }
  const joinButton = event.target.closest('.join-button');
  if (joinButton) {
    const space = joinButton.dataset.space;
    const joined = joinedSpaces();
    const isJoined = joined.includes(space);
    const next = isJoined ? joined.filter((item) => item !== space) : [...joined, space];
    writeList(joinedSpacesKey, next);
    if (!isJoined) {
      const current = profile();
      const nextXp = Number(current.xp || 1450) + 45;
      saveGamifiedProfile({ xp: nextXp, lastActiveDate: new Date().toISOString().slice(0, 10) });
      updateDailyStreak();
    }
    joinButton.textContent = next.includes(space) ? 'Joined' : 'Join';
    joinButton.classList.toggle('joined', next.includes(space));
    showFeedback(next.includes(space) ? `Joined ${space}.` : `Left ${space}.`);
    updateProfileUi();
  }
});

document.querySelector('#search-input').addEventListener('input', (event) => {
  activeQuery = event.target.value.trim().toLowerCase();
  renderDiscover(visibleOpportunities());
});

window.addEventListener('popstate', () => showView(window.location.hash.slice(1) || 'home'));

injectGamificationStyles();
renderDiscover(visibleOpportunities());
renderSaved();
renderIcons();
showView(window.location.hash.slice(1) || 'home');
document.querySelectorAll('.join-button').forEach((button) => {
  const joined = joinedSpaces().includes(button.dataset.space);
  button.textContent = joined ? 'Joined' : 'Join';
  button.classList.toggle('joined', joined);
});
updateProfileUi();