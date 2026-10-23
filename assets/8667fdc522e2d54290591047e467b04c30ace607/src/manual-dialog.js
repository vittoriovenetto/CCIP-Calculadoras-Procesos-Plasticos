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
// Explicit focus cycle in dialog header: browsers may otherwise move focus outside via iframe.
dialog?.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const link=dialog.querySelector('.visual-manual-actions a');
  if(document.activeElement===close && !event.shiftKey && link){
    event.preventDefault();
    link.focus({preventScroll:true});
  }else if(document.activeElement===link && event.shiftKey){
    event.preventDefault();
    close?.focus({preventScroll:true});
  }
});
document.addEventListener('focusin',event=>{
  if(dialog?.open && !dialog.contains(event.target) && event.target!==dialog){
    close?.focus({preventScroll:true});
  }
});
dialog?.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
// Escape from the sandboxed manual iframe cannot close the parent native dialog alone.
window.addEventListener('message',event=>{
  if(event.source!==frame?.contentWindow||event.data?.type!=='ccip:manual:escape')return;
  if(dialog?.open)dialog.close();
});
// Native dialog already handles Escape while focus remains in the parent document.
