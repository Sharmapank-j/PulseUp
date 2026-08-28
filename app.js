import { opportunities } from './src/data.js';
import { applications, joinedSpaces, profile, savedTitles, writeList, writeObject } from './src/storage.js';

const savedKey = 'pulseup-saved-opportunities';
const joinedSpacesKey = 'pulseup-joined-spaces';
let activeFilter = 'all';
let activeQuery = '';

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
    history.pushState(null, '', viewLink.getAttribute('href'));
    showView(viewLink.dataset.view);
  }
  const saveButton = event.target.closest('.save-button');
  if (saveButton) {
    const title = saveButton.closest('[data-title]')?.dataset.title;
    if (title) {
      const saved = savedTitles();
      const next = saved.includes(title) ? saved.filter((item) => item !== title) : [...saved, title];
      writeList(savedKey, next);
      renderDiscover(visibleOpportunities());
      renderSaved();
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
      spaces: 'Goal Space directory is coming next.'
      , verify: 'Verification request submitted for review.'
    };
    showFeedback(messages[action.dataset.action]);
    if (action.dataset.action === 'verify') {
      writeObject('pulseup-profile', { ...profile(), verificationStatus: 'pending' });
      updateProfileUi();
    }
  }
  const joinButton = event.target.closest('.join-button');
  if (joinButton) {
    const space = joinButton.dataset.space;
    const joined = joinedSpaces();
    const next = joined.includes(space) ? joined.filter((item) => item !== space) : [...joined, space];
    writeList(joinedSpacesKey, next);
    joinButton.textContent = next.includes(space) ? 'Joined' : 'Join';
    joinButton.classList.toggle('joined', next.includes(space));
    showFeedback(next.includes(space) ? `Joined ${space}.` : `Left ${space}.`);
  }
});

document.querySelector('#search-input').addEventListener('input', (event) => {
  activeQuery = event.target.value.trim().toLowerCase();
  renderDiscover(visibleOpportunities());
});

window.addEventListener('popstate', () => showView(window.location.hash.slice(1) || 'home'));

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