export function setupNavigation(doc = document, win = window) {
  const entries = [...doc.querySelectorAll('nav a')]
    .map(link => ({link, section:doc.getElementById(link.hash.slice(1))}))
    .filter(entry => entry.section);
  if (!entries.length) return;
  let queued = false;
  function update() {
    queued = false;
    // Choose from every section's current position, not just intersection changes.
    const readingLine = win.innerHeight * .3;
    let active = entries[0];
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= readingLine) active = entry;
    }
    for (const entry of entries) {
      const selected = entry === active;
      entry.link.classList.toggle('active', selected);
      if (selected) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(update);
  }
  win.addEventListener('scroll', schedule, {passive:true});
  win.addEventListener('resize', schedule);
  win.addEventListener('hashchange', schedule);
  doc.addEventListener('toggle', schedule, true);
  if (win.ResizeObserver) {
    const observer = new win.ResizeObserver(schedule);
    entries.forEach(({section}) => observer.observe(section));
  }
  doc.fonts?.ready.then(schedule);
  update();
}
if (typeof document !== 'undefined') setupNavigation();
