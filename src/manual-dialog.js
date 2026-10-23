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
// Escape from the sandboxed manual iframe cannot close the parent native dialog alone.
window.addEventListener('message',event=>{
  if(event.source!==frame?.contentWindow||event.data?.type!=='ccip:manual:escape')return;
  if(dialog?.open)dialog.close();
});
// Native dialog already handles Escape while focus remains in the parent document.
