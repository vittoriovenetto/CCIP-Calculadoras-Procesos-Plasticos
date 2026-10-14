// Una ayuda a la vez: hover, foco y toque. El popup no modifica entradas.
export function bindParameterHelp(root) {
  let button = null, tip = null, pinned = false, timer;
  const cancel = () => clearTimeout(timer);
  function close() {
    cancel();
    if (tip) tip.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
    button = tip = null;
    pinned = false;
  }
  function position() {
    if (!button?.isConnected || !tip?.isConnected) return close();
    const anchor = button.getBoundingClientRect();
    // getBoundingClientRect está en píxeles visibles; las coordenadas CSS
    // pueden estar escaladas (por ejemplo, contenido ampliado al 200 %).
    const scale = tip.getBoundingClientRect().width / parseFloat(getComputedStyle(tip).width) || 1;
    const margin = 8, gap = 6;
    tip.style.maxWidth = `${(innerWidth - 2 * margin) / scale}px`;
    tip.style.maxHeight = `${(innerHeight - 2 * margin) / scale}px`;
    const box = tip.getBoundingClientRect();
    let left = anchor.right + gap, top = anchor.top + (anchor.height - box.height) / 2;
    if (left + box.width > innerWidth - margin) {
      if (anchor.left - gap - box.width >= margin) left = anchor.left - gap - box.width;
      else { left = Math.max(margin, Math.min(anchor.left, innerWidth - box.width - margin)); top = anchor.bottom + gap; }
    }
    tip.style.left = `${Math.max(margin, Math.min(left, innerWidth - box.width - margin)) / scale}px`;
    tip.style.top = `${Math.max(margin, Math.min(top, innerHeight - box.height - margin)) / scale}px`;
  }
  function show(next) {
    cancel();
    if (next === button) return;
    close();
    button = next;
    tip = document.getElementById(button.getAttribute('aria-controls'));
    if (!tip) return close();
    tip.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    position();
  }
  root.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    if (tip?.contains(e.target)) return cancel();
    const next = e.target.closest('[data-help]');
    if (next) show(next);
  });
  root.addEventListener('pointerout', e => {
    if (!button || pinned || e.pointerType === 'touch') return;
    if (button.contains(e.relatedTarget) || tip.contains(e.relatedTarget)) return;
    if (document.activeElement === button) return;
    timer = setTimeout(close, 180);
  });
  root.addEventListener('focusin', e => { const next = e.target.closest('[data-help]'); if (next) show(next); });
  root.addEventListener('focusout', e => { if (e.target === button) close(); });
  root.addEventListener('click', e => {
    const next = e.target.closest('[data-help]');
    if (!next) return;
    if (next === button && pinned) close();
    else { show(next); pinned = true; }
  });
  document.addEventListener('pointerdown', e => { if (button && !button.contains(e.target) && !tip.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && button) { close(); e.preventDefault(); } });
  window.addEventListener('resize', () => { if (button) position(); });
  window.addEventListener('scroll', () => { if (button) position(); }, true);
  return { close };
}
