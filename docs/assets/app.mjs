import{validatePortfolio,visibleAlbums,coverPhoto,routeAlbum,homePhoto}from'./model.mjs';
const $=s=>document.querySelector(s),content=$('#content'),menu=$('#menu'),viewer=$('#viewer');
let data,albums=[],activePhotos=[],activeIndex=0;
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function photo(p,lazy=true){const i=el('img');i.src=p.src;i.srcset=`${p.thumb} ${Math.max(1,Math.round(p.width*Math.min(1,800/Math.max(p.width,p.height))))}w, ${p.src} ${p.width}w`;i.sizes='(max-width:680px) 88vw, 60vw';i.width=p.width;i.height=p.height;i.alt='';i.loading=lazy?'lazy':'eager';i.decoding='async';i.draggable=false;i.addEventListener('contextmenu',e=>e.preventDefault());return i;}
function anchor(hash,cls,text){const a=el('a',cls,text);a.href=hash;return a;}
function quote(text,cls=''){return el('blockquote',cls,text);}
function home(){
 const hero=el('section','hero');hero.id='cover';hero.setAttribute('aria-label','Accueil');
 const cover=homePhoto(data);if(cover){const image=photo(cover,false);image.className='hero-image';image.sizes='100vw';image.setAttribute('fetchpriority','high');hero.append(image);}
 const words=el('div','hero-words');words.append(el('div','eyebrow',data.site.artist),el('h1','',data.site.title),quote(data.site.quote));hero.append(words);
 const scroll=anchor('#collections','scroll-note','THÈMES / PROJETS');scroll.append(el('span','','↓'));hero.append(scroll);content.append(hero);
 const section=el('section','collections');section.id='collections';section.setAttribute('aria-label','Thèmes et projets');
 if(albums.length){albums.forEach((a,index)=>{
   const screen=el('section','project-screen');screen.id='project-'+a.id;
   const link=anchor(`#theme/${a.id}`,'project-link');link.setAttribute('aria-label',`Découvrir ${a.title}`);
   const image=photo(coverPhoto(a),index>0);image.className='project-image';image.sizes='100vw';link.append(image);
   const words=el('div','project-words');words.append(el('span','eyebrow',`${String(index+1).padStart(2,'0')} / ${String(albums.length).padStart(2,'0')} — SÉRIE PHOTOGRAPHIQUE`),el('h2','',a.title));if(a.quote)words.append(quote(a.quote));link.append(words,el('span','project-open','DÉCOUVRIR LA SÉRIE ↗'));screen.append(link);section.append(screen);
 });}else{const empty=el('div','empty');empty.append(el('p','','Le regard en mouvement.'),el('span','','PREMIÈRES SÉRIES À VENIR'));section.append(empty);}
 content.append(section);document.title=`${data.site.title} — ${data.site.artist}`;
}
function albumPage(album){const head=el('section','album-head enter');head.append(anchor(`#project/${album.id}`,'back','← Tous les thèmes'),el('span','eyebrow',`${String(albums.indexOf(album)+1).padStart(2,'0')} / ${String(albums.length).padStart(2,'0')} — ${album.photos.length} PHOTOGRAPHIES`),el('h1','',album.title));if(album.quote)head.append(quote(album.quote));content.append(head);
 const grid=el('section','photos');grid.setAttribute('aria-label',album.title);album.photos.forEach((p,index)=>{const button=el('button','photo-button');button.setAttribute('aria-label',`Ouvrir la photographie ${index+1} — ${album.title}`);button.append(photo(p,index>1));button.addEventListener('click',()=>{activePhotos=album.photos;activeIndex=index;showPhoto();viewer.showModal();});grid.append(button);});content.append(grid);
 if(albums.length>1){const next=albums[(albums.indexOf(album)+1)%albums.length],link=anchor(`#theme/${next.id}`,'next-theme');link.append(el('span','eyebrow','POURSUIVRE L’EXPLORATION'),el('strong','',`${next.title} ↗`));content.append(link);}document.title=`${album.title} — ${data.site.title}`;}
let screens=[],pageIndex=0,scrollFrame=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function pageTo(index,animate=true){const screen=screens[index];if(screen)content.scrollTo({top:screen.offsetTop,behavior:animate&&!reduced()?'smooth':'instant'});}
function trackPage(){
 cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{
  if(!document.body.classList.contains('is-home'))return;
  let closest=Infinity;
  screens.forEach((screen,index)=>{const distance=Math.abs(screen.offsetTop-content.scrollTop),amount=Math.min(1,distance/Math.max(1,content.clientHeight));if(distance<closest){closest=distance;pageIndex=index;}
    const image=screen.querySelector('.hero-image,.project-image');if(image)image.style.opacity=reduced()?'1':String(1-amount*.45);
    const words=screen.querySelector('.hero-words,.project-words');if(words){words.style.opacity=reduced()?'1':String(1-amount*.8);words.style.transform=reduced()?'none':`translateY(${amount*24}px)`;}
  });
  const a=albums[pageIndex-1];$('#current-section').textContent=pageIndex===0?'PAGE DE GARDE':a?'THÈME · '+a.title:'THÈMES';
  $('#page-position').textContent=String(pageIndex).padStart(2,'0')+' / '+String(Math.max(0,screens.length-1)).padStart(2,'0');$('#page-prev').disabled=pageIndex===0;$('#page-next').disabled=pageIndex===screens.length-1;
  document.querySelectorAll('#theme-menu a,#menu-cover').forEach(link=>{const on=link.id==='menu-cover'?pageIndex===0:link.getAttribute('href')==='#project/'+a?.id;if(on)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 });
}
content.addEventListener('scroll',trackPage,{passive:true});
$('#page-prev').onclick=()=>pageTo(pageIndex-1);$('#page-next').onclick=()=>pageTo(pageIndex+1);
window.addEventListener('resize',()=>{if(document.body.classList.contains('is-home'))pageTo(pageIndex,false);});
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('is-home')||menu.open||viewer.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select'))return;const direction=['ArrowDown','PageDown'].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(direction){e.preventDefault();pageTo(Math.max(0,Math.min(screens.length-1,pageIndex+direction)));}if(e.key==='Home'||e.key==='End'){e.preventDefault();pageTo(e.key==='Home'?0:screens.length-1);}});
function render(){
 if(!data)return;menu.close();viewer.close();const a=routeAlbum(location.hash,albums),wasHome=document.body.classList.contains('is-home');document.body.classList.toggle('is-home',!a);$('#page-controls').hidden=!!a;
 if(a){content.replaceChildren();albumPage(a);screens=[];$('#current-section').textContent='GALERIE · '+a.title;document.querySelectorAll('#theme-menu a,#menu-cover').forEach(link=>{if(link.getAttribute('href')==='#project/'+a.id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});content.scrollTop=0;window.scrollTo({top:0,behavior:'instant'});}
 else{if(!wasHome||!content.querySelector('.hero')){content.replaceChildren();home();screens=[content.querySelector('.hero'),...content.querySelectorAll('.project-screen,.collections>.empty')];}
   const index=location.hash==='#collections'?1:location.hash.startsWith('#project/')?albums.findIndex(x=>x.id===location.hash.slice(9))+1:0;
   pageIndex=Math.max(0,Math.min(screens.length-1,index));pageTo(pageIndex,wasHome);trackPage();document.title=`${data.site.title} — ${data.site.artist}`;
 }
}
function showPhoto(){const p=activePhotos[activeIndex],i=$('#viewer-image');i.src=p.src;i.alt=`Photographie ${activeIndex+1} de ${data.site.artist}`;$('#viewer-count').textContent=`${String(activeIndex+1).padStart(2,'0')} / ${String(activePhotos.length).padStart(2,'0')}`;$('#previous').disabled=activeIndex===0;$('#next').disabled=activeIndex===activePhotos.length-1;}
function move(delta){if(activeIndex+delta>=0&&activeIndex+delta<activePhotos.length){activeIndex+=delta;showPhoto();}}
$('#menu-open').onclick=()=>menu.showModal();$('#menu-close').onclick=()=>menu.close();$('#menu').addEventListener('click',e=>{if(e.target.closest('a'))menu.close();});$('#viewer-close').onclick=()=>viewer.close();$('#previous').onclick=()=>move(-1);$('#next').onclick=()=>move(1);viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}});
let touchX=0;$('#viewer-image').addEventListener('touchstart',e=>{touchX=e.touches.length===1?e.touches[0].clientX:NaN;},{passive:true});$('#viewer-image').addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>65)move(delta>0?-1:1);},{passive:true});$('#viewer-image').addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('hashchange',render);document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(link&&link.getAttribute('href').replace(/^#$/,'')===location.hash.replace(/^#$/,'')){e.preventDefault();render();}});$('#year').textContent=new Date().getFullYear();
try{const response=await fetch('data/portfolio.json',{cache:'no-cache'});if(!response.ok)throw Error();data=validatePortfolio(await response.json());albums=visibleAlbums(data);$('#contact').href=`mailto:${data.site.email}`;$('.menu-home').href=`mailto:${data.site.email}`;document.querySelectorAll('.artist').forEach(e=>e.textContent=data.site.artist);$('#theme-menu').replaceChildren(...albums.map((a,i)=>{const link=anchor(`#project/${a.id}`,'',a.title);link.prepend(el('span','',String(i+1).padStart(2,'0')));return link;}));if(!albums.length)$('#theme-menu').append(el('p','notice','Les premiers thèmes seront bientôt présentés ici.'));render();}catch{content.replaceChildren(el('p','notice','La galerie est momentanément indisponible. Merci de réessayer dans quelques instants.'));}
