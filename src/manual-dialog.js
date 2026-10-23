const trigger=document.getElementById('manual-open');
const dialog=document.getElementById('user-manual');
const close=document.getElementById('manual-close');
const frame=document.getElementById('manual-frame');

trigger?.addEventListener('click',()=>{
  if(!dialog || !frame)return;
  if(!frame.getAttribute('src'))frame.src=frame.dataset.src;
  dialog.showModal();
  close?.focus({preventScroll:true});
});
close?.addEventListener('click',()=>dialog?.close());
dialog?.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
// Native dialog handles Escape, backdrop and keyboard focus within the modal.
