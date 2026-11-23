(() => {
  const nav = document.querySelector('.primary-nav');
  const toggle = document.querySelector('.nav-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const band = document.querySelector('.transition-band');
  const motionToggles = document.querySelectorAll('[data-motion-toggle]');
  let paused = false;

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });

  const figureFrame = document.querySelector('.selection-frame');
  const turnViews = [...figureFrame.querySelectorAll('.turn-view')];
  let figureNear = false;
  let turnsStarted = false;
  function loadTurnViews() {
    if (!figureNear || reduced.matches || paused || turnsStarted) return;
    turnsStarted = true;
    turnViews.forEach(image => {
      if (image.dataset.src) { image.src = image.dataset.src; delete image.dataset.src; }
    });
    Promise.all(turnViews.map(image => image.decode().catch(() => undefined))).then(() => {
      if (turnViews.every(image => image.naturalWidth > 0)) figureFrame.classList.add('turn-ready');
    });
  }
  function updateMotion() {
    const disabled = reduced.matches;
    band.classList.toggle('is-paused', paused || disabled);
    document.body.classList.toggle('motion-paused', paused || disabled);
    motionToggles.forEach(button => {
      button.hidden = disabled;
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
    loadTurnViews();
  }
  motionToggles.forEach(button => button.addEventListener('click', () => { paused = !paused; updateMotion(); }));
  reduced.addEventListener('change', updateMotion);
  updateMotion();

  const moreProjects = document.getElementById('more-projects');
  const projectsToggle = document.getElementById('projects-toggle');
  if (moreProjects && projectsToggle) {
    moreProjects.hidden = true;
    projectsToggle.hidden = false;
    projectsToggle.addEventListener('click', () => {
      const opening = moreProjects.hidden;
      moreProjects.hidden = !opening;
      projectsToggle.setAttribute('aria-expanded', String(opening));
      projectsToggle.textContent = opening ? 'View fewer' : 'View more';
    });
  }

  if ('IntersectionObserver' in window) {
    const figureObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { figureNear = true; loadTurnViews(); figureObserver.disconnect(); } }), { rootMargin: '300px 0px' });
    figureObserver.observe(figureFrame);
    const bandObserver = new IntersectionObserver(entries => entries.forEach(entry => band.classList.toggle('in-view', entry.isIntersecting)), { threshold: 0.1 });
    bandObserver.observe(band);
    const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
    const intro = document.querySelector('.intro');
    const introObserver = new IntersectionObserver(entries => entries.forEach(entry => intro.classList.toggle('is-visible', entry.isIntersecting)), { threshold: 0.08 });
    introObserver.observe(intro);
  } else {
    figureNear = true; loadTurnViews();
    band.classList.add('in-view');
    document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
    document.querySelector('.intro').classList.add('is-visible');
  }

  function openLinkedCase(hash) {
    const study = hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
    if (study?.matches('[data-case-study]')) study.querySelector('.case-disclosure').open = true;
  }
  document.querySelectorAll('a[href$="-case-study"]').forEach(link => {
    link.addEventListener('click', () => openLinkedCase(link.getAttribute('href')));
  });
  window.addEventListener('hashchange', () => openLinkedCase(window.location.hash));
  openLinkedCase(window.location.hash);

  const dialog = document.getElementById('caseImageDialog');
  const dialogImage = dialog.querySelector('img');
  const dialogTitle = document.getElementById('caseImageDialogTitle');
  const close = dialog.querySelector('[data-dialog-close]');
  let opener;
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault(); opener = link; dialogImage.src = link.href; dialogImage.alt = (link.querySelector('img') || link.closest('article')?.querySelector('.project-image img'))?.alt || 'Project screenshot'; dialogTitle.textContent = link.dataset.lightboxTitle; dialog.showModal(); close.focus();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { dialogImage.removeAttribute('src'); if (opener) opener.focus(); });
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();
