/* Fully interactive, dependency-free birthday story. Change content in site.config.js. */
(() => {
  'use strict';
  const c = window.BIRTHDAY_CONFIG || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const screens = $$('.screen');
  const memories = Array.isArray(c.memories) && c.memories.length ? c.memories : [];
  let current = 0;
  let unlocked = false;
  let pin = '';
  let transitioning = false;
  let selectedMemory = 0;
  let lastModalFocus = null;
  let activePhotoURLs = [];
  let activeAudioURL = null;
  let toastTimeout = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chapterNames = ['your secret','happy birthday','a little letter','make a wish','our memories','my wish','flowers for you','our song','one last note','always and forever'];
  const named = (c.bestieName || 'Bestie').toString().trim();

  const setText = (selector, value) => { const el = $(selector); if (el) el.textContent = value || ''; };
  $$('[data-name]').forEach(el => { el.textContent = named.toLowerCase(); });
  document.title = `Happy Birthday, ${named}! 💗`;
  setText('#heroName', named.toLowerCase() + '!');
  setText('#heroSubtitle', c.heroSubtitle || 'the world got a little brighter because you exist');
  setText('#birthdayLetter', c.birthdayLetter);
  setText('#myWish', c.myWish);
  setText('#finalLetter', c.finalLetter);
  setText('#songTitle', c.songTitle || 'Little Things, Big Love');
  setText('#songArtist', c.songArtist || 'An original birthday melody');
  setText('#songNote', c.songNote);
  setText('#endingName', `happy birthday again, ${named.toLowerCase()}! 🎂`);
  if (String(c.birthdayDate || '').trim() && c.birthdayDate !== 'Your special day') {
    $('.hero-center .eyebrow').textContent = c.birthdayDate + ' ✦';
  }
  if (String(c.age || '').trim()) {
    const n = Number(c.age);
    const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
    setText('#ageLabel', `happy ${c.age}${suffix} birthday! ♡`);
    $('#ageLabel').hidden = false;
  }

  // The illustration is shown until the user sets a real photo in the config.
  const placeholder = $('.unlock-left .avatar-art');
  const copyPlaceholder = $('.copy-avatar');
  if (copyPlaceholder && placeholder) copyPlaceholder.innerHTML = placeholder.innerHTML;
  if (c.avatarPhoto) {
    $$('.avatar-img').forEach(img => {
      img.src = c.avatarPhoto;
      img.onload = () => { img.hidden = false; if (img.nextElementSibling) img.nextElementSibling.hidden = true; };
      img.onerror = () => { img.hidden = true; };
    });
  }

  // Secret keypad + keyboard support.
  function renderPin() {
    $$('#pinSlots span').forEach((el,i) => el.classList.toggle('filled', i < pin.length));
  }
  function pinStatus(message, error = false) {
    const el = $('#pinStatus');
    el.textContent = message;
    el.style.color = error ? '#ad435d' : '';
  }
  function addDigit(d) {
    if (unlocked || transitioning || pin.length >= 4) return;
    pin += d;
    renderPin();
    if (pin.length === 4) setTimeout(tryUnlock, 220);
  }
  function clearPin() { pin = ''; renderPin(); pinStatus('a little secret, just between us ♡'); }
  function tryUnlock() {
    if (unlocked || transitioning) return;
    if (pin === String(c.secretPin || '1234')) {
      unlocked = true;
      pinStatus('yay! you unlocked it! 💕');
      celebrate(85);
      setTimeout(() => goTo(1, true), reducedMotion ? 120 : 750);
    } else {
      const card = $('#pinCard');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      pinStatus('oops! not quite — try again ♡', true);
      pin = ''; renderPin();
    }
  }
  $$('[data-digit]').forEach(button => button.addEventListener('click', () => addDigit(button.dataset.digit)));
  $('#deletePin').addEventListener('click', () => { pin = pin.slice(0,-1); renderPin(); });
  $('#clearPin').addEventListener('click', clearPin);
  $('#unlockBtn').addEventListener('click', tryUnlock);
  if (c.secretPin && String(c.secretPin) !== '1234') pinStatus('your four-digit secret code is waiting ♡');

  // Chapter navigation with scroll restoration.
  function goTo(index, fromUnlock = false) {
    if (!unlocked && index !== 0) return;
    if (transitioning || index < 0 || index >= screens.length) return;
    if (index === current && !fromUnlock) return;
    transitioning = true;
    const from = screens[current];
    const to = screens[index];
    if (from) {
      from.classList.remove('active');
      from.classList.add('leaving');
      from.setAttribute('aria-hidden', 'true');
    }
    to.classList.remove('leaving');
    to.classList.add('active');
    to.setAttribute('aria-hidden', 'false');
    to.scrollTop = 0;
    current = index;
    $('#topbar').hidden = index === 0;
    $('#journeyNav').hidden = index === 0;
    $('#chapterLabel').textContent = chapterNames[index];
    $('#navCounter').textContent = `${String(index).padStart(2,'0')} / 09`;
    $('#prevBtn').disabled = index <= 1;
    $('#nextBtn').disabled = index === screens.length - 1;
    $$('#progressDots button').forEach((dot,i) => {
      dot.classList.toggle('active',i === index - 1);
      dot.setAttribute('aria-current', i === index - 1 ? 'step' : 'false');
    });
    if (index === screens.length - 1) celebrate(85);
    if (from && from !== to) setTimeout(() => from.classList.remove('leaving'), reducedMotion ? 0 : 380);
    setTimeout(() => { transitioning = false; }, reducedMotion ? 25 : 410);
  }
  const dotParent = $('#progressDots');
  for (let i=1; i<screens.length; i++) {
    const dot = document.createElement('button'); dot.className = 'progress-dot';
    dot.type='button'; dot.title=`Go to chapter ${i}: ${chapterNames[i]}`;
    dot.setAttribute('aria-label', dot.title);
    dot.addEventListener('click', () => goTo(i)); dotParent.appendChild(dot);
  }
  $('#prevBtn').addEventListener('click',()=>goTo(current-1));
  $('#nextBtn').addEventListener('click',()=>goTo(current+1));
  $$('[data-next]').forEach(btn=>btn.addEventListener('click',()=>goTo(current+1)));
  $('#replayBtn').addEventListener('click',()=>{
    relightCandles();
    $('#flowerResult').textContent='';
    $('#acceptFlowers').disabled=false;
    goTo(1);
  });

  // Cake: each of the five candles works independently.
  function relightCandles() {
    $$('#candles .candle').forEach(b=>{b.classList.remove('out'); b.setAttribute('aria-label', b.getAttribute('aria-label').replace('Relight','Blow out'));});
    setText('#wishResult','5 little wishes waiting to be made ♡');
  }
  $$('#candles .candle').forEach((button,i) => button.addEventListener('click', () => {
    if (button.classList.contains('out')) return;
    button.classList.add('out');
    button.setAttribute('aria-label', `Candle ${i+1} blown out`);
    const left = $$('#candles .candle:not(.out)').length;
    setText('#wishResult',left ? `${left} little ${left === 1 ? 'wish' : 'wishes'} left... ♡` : 'may all your wishes come true! 🥹💕');
    if (!left) celebrate(100);
  }));
  $('#relightBtn').addEventListener('click',relightCandles);

  // Accessible polaroid gallery + lightbox. Changes to uploaded photos last until refresh.
  function artElement(memory, className='polaroid-image') {
    const art = document.createElement('div');
    art.className = `${className} art-${memory.artwork || 'strawberry'}`;
    if (memory.photo) {
      const img = document.createElement('img'); img.alt = memory.title || 'Our memory';
      img.src = memory.photo;
      img.onerror = () => { img.remove(); addPlaceholder(art,memory); };
      art.appendChild(img);
    } else addPlaceholder(art,memory);
    return art;
  }
  function addPlaceholder(art, memory) {
    const a = document.createElement('span'); a.className = 'art-orbit'; a.textContent = '✧ ♡';
    const b = document.createElement('span'); b.className = 'art-spot';
    const e = document.createElement('span'); e.className = 'art-emoji'; e.textContent = memory.emoji || '💗';
    art.append(a,b,e);
  }
  function renderGallery() {
    const gallery = $('#memoryGallery'); gallery.innerHTML='';
    memories.forEach((memory,i)=>{
      const btn = document.createElement('button');
      btn.type='button'; btn.className='polaroid';
      btn.style.setProperty('--tilt',[-6,4,-4,5,-2,6][i%6]+'deg');
      btn.setAttribute('aria-label',`Open memory: ${memory.title}`);
      btn.appendChild(artElement(memory));
      const p=document.createElement('span'); p.className='polaroid-caption';p.textContent=memory.title;
      btn.appendChild(p);btn.addEventListener('click',()=>openMemory(i));gallery.appendChild(btn);
    });
  }
  function openMemory(index) {
    if (!memories.length) return;
    selectedMemory=(index+memories.length)%memories.length;
    const m=memories[selectedMemory];
    const modalArt = $('#modalArt'); modalArt.replaceWith(artElement(m,'modal-art'));
    setText('#modalTitle',m.title); setText('#modalCaption',m.caption);
    lastModalFocus = document.activeElement;
    $('#memoryModal').hidden=false; document.body.style.overflow='hidden';
    $('#modalClose').focus();
  }
  function swapMemory(n) {
    if(!memories.length)return;
    const wasOpen=!$('#memoryModal').hidden;
    const next=(selectedMemory+n+memories.length)%memories.length;
    if(wasOpen){selectedMemory=next;const m=memories[next];$('#modalArt').replaceWith(artElement(m,'modal-art'));setText('#modalTitle',m.title);setText('#modalCaption',m.caption);}
  }
  function closeMemory(){ $('#memoryModal').hidden=true;document.body.style.overflow='';if(lastModalFocus?.focus)lastModalFocus.focus(); }
  $('#modalClose').addEventListener('click',closeMemory);
  $('#modalBackdrop').addEventListener('click',closeMemory);
  $('#modalPrev').addEventListener('click',()=>swapMemory(-1));
  $('#modalNext').addEventListener('click',()=>swapMemory(1));
  let touchStart=0;
  $('#memoryModal').addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX;},{passive:true});
  $('#memoryModal').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>55)swapMemory(dx<0?1:-1);},{passive:true});
  $('#photoUpload').addEventListener('change', e=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(!file.type.startsWith('image/')) {showToast('choose an image file ♡');return;}
    if(activePhotoURLs[selectedMemory])URL.revokeObjectURL(activePhotoURLs[selectedMemory]);
    const url=URL.createObjectURL(file);activePhotoURLs[selectedMemory]=url;
    memories[selectedMemory].photo=url;renderGallery();
    const m=memories[selectedMemory];$('#modalArt').replaceWith(artElement(m,'modal-art'));
    showToast('photo added! to keep it forever, add the image path in site.config.js 💗');
    e.target.value='';
  });
  renderGallery();

  // Bouquet surprise.
  $('#acceptFlowers').addEventListener('click',()=>{
    setText('#flowerResult','a little reminder that you are so loved! 🥹💕');
    $('#acceptFlowers').disabled=true;
    celebrate(45,true);
  });

  // Music player: original supplied melody, or upload your own audio file.
  const audio=$('#birthdayAudio');
  audio.src=c.backgroundSong || '';
  audio.volume=.75;
  const timefmt=s=>Number.isFinite(s) ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '0:00';
  function syncMusic() {
    const playing=!audio.paused && !audio.ended;
    $('#playMusic').textContent=playing?'Ⅱ':'▶';
    $('#playMusic').setAttribute('aria-label',playing?'Pause song':'Play song');
    $('#artRecord').classList.toggle('playing',playing);
    $('#currentTime').textContent=timefmt(audio.currentTime);
    $('#duration').textContent=timefmt(audio.duration);
    $('#musicSeek').value=(audio.duration && Number.isFinite(audio.duration))?String(audio.currentTime/audio.duration*100):'0';
  }
  $('#playMusic').addEventListener('click',async()=>{
    if(!audio.src){showToast('add your own song using “+ add your song” ♡');return;}
    if(audio.paused) {
      try{await audio.play();}catch{showToast('this audio could not play — try adding your own song ♡');}
    }else audio.pause();syncMusic();
  });
  $('#restartMusic').addEventListener('click',()=>{audio.currentTime=0;syncMusic();});
  $('#skipMusic').addEventListener('click',()=>{audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10);syncMusic();});
  $('#musicSeek').addEventListener('input',e=>{if(audio.duration && Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value)/100*audio.duration;syncMusic();});
  $('#musicVolume').addEventListener('input',e=>audio.volume=Number(e.target.value));
  ['timeupdate','loadedmetadata','play','pause','ended','durationchange'].forEach(name=>audio.addEventListener(name,syncMusic));
  audio.addEventListener('error',()=>{if(c.backgroundSong)showToast('could not load the default melody — you can add your own song ♡');});
  $('#songUpload').addEventListener('change',e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('audio/')){showToast('please choose an audio file ♡');return;}
    audio.pause();if(activeAudioURL)URL.revokeObjectURL(activeAudioURL);
    activeAudioURL=URL.createObjectURL(file);audio.src=activeAudioURL;audio.load();
    setText('#songTitle',file.name.replace(/\.[^.]*$/,''));setText('#songArtist','Your personal dedication ♡');
    syncMusic();showToast('your special song is ready — press play ♫');e.target.value='';
  });
  syncMusic();

  // Confetti is lightweight DOM animation and respects reduced-motion preferences.
  function celebrate(n=65,petals=false) {
    if(reducedMotion)return;
    const layer=$('#confetti');
    const colors=['#e99bb6','#f4c5ce','#ffdc93','#d0c9ef','#a5caaa','#ffffff'];
    for(let i=0;i<n;i++){
      const piece=document.createElement('span');piece.className='confetti-particle';
      piece.style.left=(Math.random()*100)+'%';
      piece.style.setProperty('--fall',(2.5+Math.random()*2.3)+'s');
      piece.style.setProperty('--sway',(Math.random()*230-115)+'px');
      piece.style.animationDelay=(Math.random()*.7)+'s';
      if(petals){piece.textContent=Math.random()>.5?'🌸':'💗';piece.style.fontSize=(12+Math.random()*14)+'px';piece.style.background='none';}
      else{piece.style.background=colors[Math.floor(Math.random()*colors.length)];piece.style.width=(5+Math.random()*7)+'px';piece.style.height=(7+Math.random()*10)+'px';piece.style.borderRadius=Math.random()>.5?'50%':'2px';}
      layer.appendChild(piece);setTimeout(()=>piece.remove(),5700);
    }
  }
  function showToast(s) {
    const toast=$('#toast');toast.textContent=s;toast.classList.add('show');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),3000);
  }
  document.addEventListener('keydown',e=>{
    if(!$('#memoryModal').hidden) {
      if(e.key==='Escape')closeMemory();
      else if(e.key==='ArrowLeft')swapMemory(-1);
      else if(e.key==='ArrowRight')swapMemory(1);
      return;
    }
    if(!unlocked){
      if(/^\d$/.test(e.key)){e.preventDefault();addDigit(e.key);}
      else if(e.key==='Backspace'){e.preventDefault();pin=pin.slice(0,-1);renderPin();}
      else if(e.key==='Enter'){e.preventDefault();tryUnlock();}
      return;
    }
    if(['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName) && document.activeElement?.id!=='nextBtn' && document.activeElement?.id!=='prevBtn')return;
    if(e.key==='ArrowRight')goTo(current+1);
    else if(e.key==='ArrowLeft')goTo(current-1);
  });
  window.addEventListener('beforeunload',()=>{activePhotoURLs.forEach(u=>u&&URL.revokeObjectURL(u));if(activeAudioURL)URL.revokeObjectURL(activeAudioURL);});
})();
