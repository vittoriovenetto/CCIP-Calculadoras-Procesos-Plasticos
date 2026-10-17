const trigger = document.getElementById('manual-open');
const dialog = document.getElementById('user-manual');
// El diálogo nativo admite Escape y bloquea el fondo.
trigger?.addEventListener('click', () => dialog.showModal());
dialog?.addEventListener('close', () => trigger.focus({ preventScroll: true }));
dialog?.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    event.preventDefault();
    dialog.querySelector('button').focus();
  }
});
