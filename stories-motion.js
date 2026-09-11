(async()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'); let paused=reduced.matches;
 const toggle=document.querySelector('#pause');
 function controls(){document.body.classList.toggle('paused',paused);toggle.textContent=paused?'Play movement':'Pause movement';toggle.setAttribute('aria-pressed',String(paused));}
 controls();toggle.onclick=()=>{paused=!paused;controls()};reduced.addEventListener('change',e=>{paused=e.matches;controls()});
 const safe=src=>typeof src==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpg|jpeg|png)$/i.test(src)&&!src.includes('..');
 const valid=items=>(items||[]).filter(i=>i.published===true&&safe(i.src));
 const load=async item=>{const i=new Image();i.src=item.src;try{await i.decode();return item}catch{return null}};
 try{
 const response=await fetch('assets/gallery/catalogue.json',{cache:'no-cache'});if(!response.ok)throw Error('Catalogue unavailable');const data=await response.json();
 let events=(await Promise.all(valid(data.events).map(load))).filter(Boolean);
 if(!events.length)events=(await Promise.all(valid(data.artwork).map(load))).filter(Boolean);else document.querySelector('#gallery-note').hidden=true;
 function picture(item){const i=document.createElement('img');i.src=item.src;i.alt=item.alt||'';i.width=220;i.height=165;i.decoding='async';return i}
 for(const id of ['film-left','film-right']){const el=document.getElementById(id);if(!events.length){el.parentElement.hidden=true;continue}const group=document.createElement('div');group.className='film-group';for(let n=0;n<Math.max(8,events.length);n++)group.append(picture(events[(n+(id==='film-right'?2:0))%events.length]));el.append(group);const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');el.append(duplicate)}
 const portraits=(await Promise.all(valid(data.portraits).map(load))).filter(Boolean);let current=0,front=document.querySelector('#portrait-a'),back=document.querySelector('#portrait-b');if(portraits.length){front.src=portraits[0].src;front.alt=portraits[0].alt||'Portrait'}
 if(portraits.length>1)setInterval(()=>{if(paused||document.hidden||reduced.matches)return;current=(current+1)%portraits.length;back.src=portraits[current].src;back.alt=portraits[current].alt||'Portrait';back.removeAttribute('aria-hidden');back.classList.add('visible');front.classList.remove('visible');front.setAttribute('aria-hidden','true');[front,back]=[back,front]},6000);
 const real=(data.reviews||[]).filter(r=>r.published===true&&r.verified===true);const reviews=real.length?real:data.sampleReviews||[];document.querySelector('#sample-label').hidden=real.length>0;
 const group=document.createElement('div');group.className='review-group';for(const r of reviews){const article=document.createElement('article');article.className='paper review-card';const mark=document.createElement('span');mark.className='quote';mark.textContent='“';const quote=document.createElement('blockquote');quote.textContent=r.text;const name=document.createElement('small');name.textContent=real.length?r.name:'SAMPLE · '+r.category;article.append(mark,quote,name);group.append(article)}const track=document.querySelector('#reviews');track.append(group);const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');track.append(duplicate);
 }catch(e){document.querySelectorAll('.film,.reviews').forEach(el=>el.hidden=true);document.querySelector('#gallery-note').hidden=true;console.warn('Gallery unavailable; retained portrait and page content.')}
})();
