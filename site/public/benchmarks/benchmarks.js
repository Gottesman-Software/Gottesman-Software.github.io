/* Progressive-enhancement filters; content remains readable without JavaScript. */
(() => {
  const controls = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.stream-card')];
  const search = document.getElementById('search');
  const count = document.getElementById('filter-count');
  const empty = document.getElementById('no-results');
  let active = 'all';

  function update() {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const inStream = active === 'all' || card.dataset.track === active;
      const matches = `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
      card.hidden = !(inStream && matches);
      if (!card.hidden) shown += 1;
    }
    count.textContent = `${shown} of ${cards.length} research streams shown`;
    empty.hidden = shown !== 0;
  }

  controls.forEach(button => button.addEventListener('click', () => {
    active = button.dataset.filter;
    controls.forEach(control => {
      const selected = control === button;
      control.classList.toggle('is-active', selected);
      control.setAttribute('aria-pressed', String(selected));
    });
    update();
  }));
  search.addEventListener('input', update);
  update();
})();
