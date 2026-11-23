(()=>{const button=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-navigation');if(button&&nav){const close=()=>{nav.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu')};button.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close menu':'Open menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('resize',()=>{if(innerWidth>800)close()})}const form=document.querySelector('#contact-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),message=form.elements.message.value.trim(),subject=form.elements.subject.value;if(!name||!email||!message||!form.elements.email.checkValidity()){document.querySelector('#form-note').textContent='Please enter your name, a valid email address, and a message.';form.reportValidity();return}const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;window.location.href=`mailto:info@fiberskynet.net?subject=${encodeURIComponent('FiberSkynet: '+subject)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-note').textContent='Your email application should open. Please send the draft from there.'})}})();
(()=>{const h=document.querySelector('.site-header');if(!h)return;const sync=()=>h.classList.toggle('is-scrolled',window.scrollY>24);sync();window.addEventListener('scroll',sync,{passive:true})})();


/* FSN support chat toggle V18.
   Free support contact through the existing WhatsApp link; NOT an in-page
   human messaging service. Can be replaced with a tawk.to widget after its
   property and widget IDs are supplied. */
(()=>{
  if(document.getElementById('fsn-chat-root'))return;
  const base=document.querySelector('.site-header .brand')?.getAttribute('href')||'./';
  const root=document.createElement('div');
  root.id='fsn-chat-root';
  root.className='fsn-chat-root';
  const bubble='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M20 11.5a8 8 0 0 1-8.4 8 8.5 8.5 0 0 1-2.9-.8L4 20l1.3-4.2A8 8 0 1 1 20 11.5Z"/><path d="M8.8 11.1h6.5m-6.5 3h4.5"/></svg>';
  const arrow='<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
  const parts=[
    '<section class="fsn-chat-panel" id="fsn-chat-panel" role="dialog" aria-label="FiberSkynet help and support" hidden>',
      '<div class="fsn-chat-header">',
        '<div class="fsn-chat-header-row"><div class="fsn-chat-brand"><span class="fsn-chat-brand-icon">'+bubble+'</span>FiberSkynet</div>',
          '<button type="button" class="fsn-chat-close" aria-label="Close support panel">×</button></div>',
        '<div class="fsn-chat-eyebrow">WE’RE HERE TO HELP</div>',
        '<h2>How can we help?</h2>',
        '<p>Find your next connection or speak with the FiberSkynet team.</p>',
      '</div>',
      '<div class="fsn-chat-body">',
        '<a class="fsn-chat-main" href="https://wa.me/96171999848" target="_blank" rel="noopener noreferrer">',
          '<span class="fsn-chat-main-icon">'+bubble+'</span>',
          '<span class="fsn-chat-main-copy"><strong>Chat with our team</strong><small>Continue on WhatsApp</small></span>',
          '<span class="fsn-chat-arrow">'+arrow+'</span>',
        '</a>',
        '<div class="fsn-chat-subhead">QUICK LINKS</div>',
        '<div class="fsn-chat-links">',
          '<a href="'+base+'packages/"><span class="fsn-chat-link-icon">◎</span><span>Internet Packages</span>'+arrow+'</a>',
          '<a href="'+base+'#tv-packages"><span class="fsn-chat-link-icon">▣</span><span>TV Packages</span>'+arrow+'</a>',
          '<a href="https://fiberskynet.speedtestcustom.com/" target="_blank" rel="noopener noreferrer"><span class="fsn-chat-link-icon">↗</span><span>Speed Test</span>'+arrow+'</a>',
          '<a href="https://portal.fiberskynet.net/" target="_blank" rel="noopener noreferrer"><span class="fsn-chat-link-icon">⌁</span><span>Customer Portal</span>'+arrow+'</a>',
        '</div>',
        '<p class="fsn-chat-footnote">Human support conversations open in WhatsApp.</p>',
      '</div>',
    '</section>',
    '<button type="button" class="fsn-chat-toggle" aria-controls="fsn-chat-panel" aria-expanded="false" aria-label="Open FiberSkynet support">',
      '<span class="fsn-chat-toggle-bubble">'+bubble+'</span><span class="fsn-chat-toggle-label">Chat</span>',
      '<span class="fsn-chat-toggle-x" aria-hidden="true">×</span>',
    '</button>'
  ];
  root.innerHTML=parts.join('');
  document.body.appendChild(root);
  const toggle=root.querySelector('.fsn-chat-toggle');
  const panel=root.querySelector('.fsn-chat-panel');
  const close=root.querySelector('.fsn-chat-close');
  let isOpen=false;
  function setOpen(value,restoreFocus=false){
    isOpen=!!value;
    panel.hidden=!isOpen;
    toggle.classList.toggle('is-open',isOpen);
    toggle.setAttribute('aria-expanded',String(isOpen));
    toggle.setAttribute('aria-label',isOpen?'Close FiberSkynet support':'Open FiberSkynet support');
    if(isOpen)close.focus({preventScroll:true});
    else if(restoreFocus)toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>{
    if(isOpen)setOpen(false,true);
    else setOpen(true);
  });
  close.addEventListener('click',()=>setOpen(false,true));
  document.addEventListener('pointerdown',event=>{
    if(isOpen&&!root.contains(event.target))setOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(isOpen&&event.key==='Escape'){
      event.preventDefault();
      setOpen(false,true);
    }
  });

  /* V34 — Hide the support launcher under the footer on all pages.
     Detect the actual launcher/footer overlap, not an arbitrary scroll depth,
     so this works with different viewport sizes and footer layouts. */
  const footer=document.querySelector('footer.footer');
  if(footer){
    let scheduled=false;
    const updateFooterVisibility=()=>{
      scheduled=false;
      const buttonBounds=toggle.getBoundingClientRect();
      const footerBounds=footer.getBoundingClientRect();
      const overlap=footerBounds.top<=buttonBounds.bottom+12&&footerBounds.bottom>0;
      const wasHidden=root.classList.contains('fsn-chat-under-footer');
      if(overlap===wasHidden)return;
      if(overlap){
        if(isOpen)setOpen(false);
        if(root.contains(document.activeElement))document.activeElement.blur();
      }
      root.classList.toggle('fsn-chat-under-footer',overlap);
    };
    const queueFooterCheck=()=>{
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(updateFooterVisibility);
    };
    window.addEventListener('scroll',queueFooterCheck,{passive:true});
    window.addEventListener('resize',queueFooterCheck,{passive:true});
    window.addEventListener('pageshow',queueFooterCheck);
    if('ResizeObserver' in window){
      new ResizeObserver(queueFooterCheck).observe(footer);
    }
    queueFooterCheck();
  }
})();


/* V20 — align floating chat with the visible Request Setup CTA.
   ResizeObserver handles responsive header changes without assuming widths. */
(()=>{
  const chat=document.getElementById('fsn-chat-root');
  const request=document.querySelector('.header-cta .btn');
  if(!chat||!request)return;
  const sync=()=>{
    const visible=request.getClientRects().length>0 && getComputedStyle(request).display!=='none';
    if(!visible || window.innerWidth<=560){
      chat.style.removeProperty('--fsn-chat-aligned-right');
      return;
    }
    const rect=request.getBoundingClientRect();
    const aligned=Math.max(14,Math.round(document.documentElement.clientWidth-rect.right));
    chat.style.setProperty('--fsn-chat-aligned-right',aligned+'px');
  };
  sync();
  window.addEventListener('resize',sync,{passive:true});
  if('ResizeObserver' in window){
    const observer=new ResizeObserver(sync);
    observer.observe(request);
    const header=document.querySelector('.header-row');
    if(header)observer.observe(header);
  }
})();
