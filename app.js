const opportunities = [
  { type: 'CONFERENCE', title: 'AIIMS International Cardiology Summit 2026', org: 'AIIMS New Delhi', detail: '18–20 Sep 2026 · New Delhi · Hybrid', color: 'banner-one' },
  { type: 'RESEARCH', title: 'Seeking MBBS students for a multi-centre case study', org: 'Study Collective', detail: 'Clinical research · Remote', color: 'banner-two' },
  { type: 'FELLOWSHIP', title: 'Global Health Fellowship Programme', org: 'The Wellcome Trust', detail: 'Applications open to medical students', color: 'banner-two' },
  { type: 'WORKSHOP', title: 'Point-of-Care Ultrasound Workshop', org: 'Manipal Hospitals', detail: 'Bengaluru · 12 Sep 2026', color: 'banner-one' }
];
const savedKey = 'pulseup-saved-opportunities';
const savedTitles = () => JSON.parse(localStorage.getItem(savedKey) || '[]');

function renderIcons() { if (window.lucide) lucide.createIcons(); }

function showView(viewName) {
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active-view', view.dataset.section === viewName));
  document.querySelectorAll('[data-view]').forEach((link) => link.classList.toggle('active', link.dataset.view === viewName));
  if (viewName === 'saved') renderSaved();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDiscover(items = opportunities) {
  const results = document.querySelector('.discover-results');
  results.innerHTML = items.length ? items.map((item) => `<article class="opportunity-card" data-title="${item.title}"><div class="card-banner ${item.color}"><span class="tag">${item.type}</span><button class="save-button ${savedTitles().includes(item.title) ? 'saved' : ''}" aria-label="${savedTitles().includes(item.title) ? 'Remove from saved' : 'Save opportunity'}"><i data-lucide="bookmark"></i></button><div class="banner-label">PULSE<br>INDEX</div></div><div class="card-body"><div class="org-line"><span class="org-logo study">P</span><span>${item.org} <i class="verified" data-lucide="badge-check"></i></span><time>New</time></div><h3>${item.title}</h3><div class="card-details"><span><i data-lucide="sparkles"></i>${item.detail}</span></div><div class="card-footer"><span class="spots">Open opportunity</span><button class="text-button">View details <i data-lucide="arrow-right"></i></button></div></div></article>`).join('') : '<p class="subtitle">No opportunities found. Try a broader search.</p>';
  renderIcons();
}

function renderSaved() {
  const saved = savedTitles();
  const results = document.querySelector('.saved-results');
  const emptyState = document.querySelector('#saved-view .empty-state');
  results.innerHTML = saved.map((title) => {
    const item = opportunities.find((opportunity) => opportunity.title === title);
    return item ? `<article class="opportunity-card" data-title="${item.title}"><div class="card-banner ${item.color}"><span class="tag">${item.type}</span><button class="save-button saved" aria-label="Remove from saved"><i data-lucide="bookmark"></i></button><div class="banner-label">PULSE<br>INDEX</div></div><div class="card-body"><div class="org-line"><span class="org-logo study">P</span><span>${item.org}</span></div><h3>${item.title}</h3><div class="card-details"><span><i data-lucide="sparkles"></i>${item.detail}</span></div></div></article>` : '';
  }).join('');
  emptyState.style.display = saved.length ? 'none' : 'block';
  results.className = saved.length ? 'saved-results opportunity-grid' : 'saved-results';
  renderIcons();
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) { event.preventDefault(); showView(viewLink.dataset.view); }
  const saveButton = event.target.closest('.save-button');
  if (saveButton) {
    const title = saveButton.closest('[data-title]')?.dataset.title;
    if (title) {
      const saved = savedTitles();
      const next = saved.includes(title) ? saved.filter((item) => item !== title) : [...saved, title];
      localStorage.setItem(savedKey, JSON.stringify(next));
    }
    saveButton.classList.toggle('saved');
    saveButton.setAttribute('aria-label', saveButton.classList.contains('saved') ? 'Remove from saved' : 'Save opportunity');
  }
  const filter = event.target.closest('.filter');
  if (filter) { document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active')); filter.classList.add('active'); }
});

document.querySelector('#search-input').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  renderDiscover(opportunities.filter((item) => `${item.title} ${item.org} ${item.type}`.toLowerCase().includes(query)));
});

renderDiscover();
renderSaved();
renderIcons();