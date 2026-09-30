document.querySelectorAll('[data-gallery]').forEach(gallery=>{
 const slides=[...gallery.querySelectorAll('.photo-slide')],dots=[...gallery.querySelectorAll('[data-slide]')],stage=gallery.querySelector('.gallery-stage'),hint=gallery.querySelector('[data-gallery-hint]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,playing=!reduced.matches,timer;
 function show(index){current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>slide.hidden=i!==current);dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));gallery.querySelector('[data-counter]').textContent=`${current+1} / ${slides.length}`;}
 function schedule(){clearInterval(timer);stage.setAttribute('aria-label',playing?'Pause automatic slideshow':'Resume automatic slideshow');stage.setAttribute('aria-pressed',String(!playing));hint.textContent=playing?'Click photo to pause':'Paused · Click photo to resume';if(playing&&!document.hidden)timer=setInterval(()=>show(current+1),4500);}
 function toggle(){playing=!playing;schedule();}
 stage.addEventListener('click',toggle);stage.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
 gallery.querySelector('[data-prev]').addEventListener('click',()=>{show(current-1);schedule();});gallery.querySelector('[data-next]').addEventListener('click',()=>{show(current+1);schedule();});dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);schedule();}));document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{playing=!reduced.matches;schedule();});schedule();
});
