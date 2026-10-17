// Una ayuda a la vez: hover, foco y toque. El popup no modifica entradas.
export function bindParameterHelp(root) {
  let button = null, tip = null, pinned = false, timer, observer;
  const cancel = () => clearTimeout(timer);
  function close() {
    cancel();observer?.disconnect();
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
    const width = tip.getBoundingClientRect().width;
    let maxHeight = innerHeight - 2 * margin, vertical = false, useBelow;
    let left = anchor.right + gap;
    if (left + width > innerWidth - margin) {
      if (anchor.left - gap - width >= margin) left = anchor.left - gap - width;
      else {
        // En móvil el formulario puede ser más alto que el espacio disponible.
        // Mantener el botón «?» accesible: elegir un lado vertical y permitir
        // desplazamiento dentro del popup, sin cubrir su propio disparador.
        const below = Math.max(0, innerHeight - margin - anchor.bottom - gap);
        const above = Math.max(0, anchor.top - gap - margin);
        const style = getComputedStyle(tip);
        const contentHeight = (tip.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)) * scale;
        useBelow = contentHeight <= below || below >= above;
        maxHeight = useBelow ? below : above;
        vertical = true;
        left = Math.max(margin, Math.min(anchor.left, innerWidth - width - margin));
      }
    }
    // No expandir temporalmente en cada scroll: eso reiniciaría scrollTop
    // e impediría alcanzar los últimos controles del formulario.
    tip.style.maxHeight = `${maxHeight / scale}px`;
    const box = tip.getBoundingClientRect();
    const top = vertical ? (useBelow ? anchor.bottom + gap : anchor.top - gap - box.height) : anchor.top + (anchor.height - box.height) / 2;
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
    observer = new ResizeObserver(position);observer.observe(tip);
  }
  root.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    if (tip?.contains(e.target)) return cancel();
    const next = e.target.closest('[data-help]');
    // Una ayuda fijada por clic no cambia al pasar sobre otro «?» durante
    // un reflujo/resize. El siguiente clic o foco explícito sí puede cambiarla.
    if (pinned && next !== button) return;
    if (next) show(next);
  });
  root.addEventListener('pointerout', e => {
    if (!button || pinned || e.pointerType === 'touch') return;
    if (button.contains(e.relatedTarget) || tip.contains(e.relatedTarget)) return;
    if (document.activeElement === button) return;
    timer = setTimeout(close, 180);
  });
  root.addEventListener('focusin', e => { const next = e.target.closest('[data-help]'); if (next) show(next); });
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget) || (!tip?.contains(e.relatedTarget) && e.relatedTarget !== button)) close(); });
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
