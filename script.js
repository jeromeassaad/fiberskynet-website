(()=>{const button=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-navigation');if(button&&nav){const close=()=>{nav.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu')};button.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close menu':'Open menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('resize',()=>{if(innerWidth>800)close()})}const form=document.querySelector('#contact-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),message=form.elements.message.value.trim(),subject=form.elements.subject.value;if(!name||!email||!message||!form.elements.email.checkValidity()){document.querySelector('#form-note').textContent='Please enter your name, a valid email address, and a message.';form.reportValidity();return}const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;window.location.href=`mailto:info@fiberskynet.net?subject=${encodeURIComponent('FiberSkynet: '+subject)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-note').textContent='Your email application should open. Please send the draft from there.'})}})();
(()=>{const h=document.querySelector('.site-header');if(!h)return;const sync=()=>h.classList.toggle('is-scrolled',window.scrollY>24);sync();window.addEventListener('scroll',sync,{passive:true})})();


/* FiberSkynet hero: ambient connectivity mesh (decorative and non-interactive).
   Canvas is scoped to the hero, capped at ~30 fps and pauses when offscreen.
   Reduced-motion preference keeps a still network illustration. */
(()=>{
  const canvas=document.getElementById('connectivity-canvas');
  if(!canvas)return;
  const context=canvas.getContext('2d',{alpha:true});
  if(!context)return;
  const container=canvas.parentElement;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const TAU=Math.PI*2;
  const coordinates=[
    [.49,.095],[.61,.12],[.74,.18],[.83,.27],[.88,.41],
    [.88,.55],[.82,.70],[.69,.81],[.54,.89],[.40,.85],
    [.26,.76],[.17,.64],[.13,.50],[.20,.35],[.30,.22],
    [.39,.16],[.47,.30],[.60,.31],[.71,.41],[.71,.55],
    [.61,.68],[.48,.70],[.36,.61],[.30,.48],[.39,.39],
    [.53,.49],[.10,.23],[.95,.21],[.95,.76],[.13,.84]
  ];
  const nodes=coordinates.map(([x,y],index)=>({
    x,y,
    dx:.007+(index%5)*.0014,
    dy:.007+(index%4)*.0017,
    phase:index*1.67,
    major:[3,8,16,21,25].includes(index)
  }));
  // Build a sparse triangulated topology: no overwhelming all-to-all lines.
  const edgeMap=new Map();
  nodes.forEach((n,i)=>{
    const nearest=nodes.map((other,j)=>({
      j,d:Math.hypot((n.x-other.x)*.94,(n.y-other.y)*1.12)
    })).filter(p=>p.j!==i&&p.d<.30).sort((a,b)=>a.d-b.d).slice(0,i%5===0?4:3);
    nearest.forEach(({j,d})=>{
      const a=Math.min(i,j),b=Math.max(i,j);
      edgeMap.set(a+'-'+b,{a,b,d});
    });
  });
  const edges=Array.from(edgeMap.values());
  let width=0,height=0,pixelRatio=1,raf=0,visible=true,lastFrame=0;
  let startTime=performance.now();
  function resize(){
    const rect=container.getBoundingClientRect();
    const nextWidth=Math.max(1,Math.round(rect.width));
    const nextHeight=Math.max(1,Math.round(rect.height));
    pixelRatio=Math.min(window.devicePixelRatio||1,1.75);
    width=nextWidth;height=nextHeight;
    canvas.width=Math.round(width*pixelRatio);
    canvas.height=Math.round(height*pixelRatio);
    context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    draw((performance.now()-startTime)/1000);
  }
  function draw(time){
    if(!width||!height)return;
    context.clearRect(0,0,width,height);
    const positions=nodes.map(n=>({
      x:(n.x+Math.sin(time*.23+n.phase)*n.dx)*width,
      y:(n.y+Math.cos(time*.18+n.phase*.8)*n.dy)*height,
      major:n.major
    }));
    // Restrained orbital guides to add dimensional depth.
    context.save();
    context.lineWidth=.85;
    context.strokeStyle='rgba(111,116,240,.105)';
    context.beginPath();
    context.ellipse(width*.53,height*.49,width*.32,height*.37,-.26,0,TAU);
    context.stroke();
    context.strokeStyle='rgba(128,176,255,.075)';
    context.beginPath();
    context.ellipse(width*.52,height*.49,width*.39,height*.29,.20,0,TAU);
    context.stroke();
    context.restore();

    // Fine connective filaments between nearby nodes.
    edges.forEach(({a,b,d})=>{
      const p=positions[a],q=positions[b];
      const alpha=Math.max(.11,.31-d*.55);
      context.strokeStyle='rgba(135,150,255,'+alpha.toFixed(3)+')';
      context.lineWidth=d<.16?1.05:.75;
      context.beginPath();
      context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke();
    });
    // Traveling light packets imply data flowing through the network.
    if(!reducedMotion.matches){
      edges.forEach(({a,b},i)=>{
        if(i%4!==0)return;
        const p=positions[a],q=positions[b];
        const progress=(time*(.056+(i%3)*.012)+i*.113)%1;
        const x=p.x+(q.x-p.x)*progress;
        const y=p.y+(q.y-p.y)*progress;
        const glow=context.createRadialGradient(x,y,0,x,y,13);
        glow.addColorStop(0,'rgba(226,230,255,.59)');
        glow.addColorStop(.27,'rgba(138,187,255,.30)');
        glow.addColorStop(1,'rgba(119,118,255,0)');
        context.fillStyle=glow;context.beginPath();context.arc(x,y,13,0,TAU);context.fill();
        context.fillStyle='rgba(218,231,255,.86)';
        context.beginPath();context.arc(x,y,1.45,0,TAU);context.fill();
      });
    }
    // Nodes glow gently without distracting from the headline.
    positions.forEach((p,i)=>{
      const pulse=reducedMotion.matches?0.5:(.5+.5*Math.sin(time*.83+i*.67));
      const size=p.major?4.1:2.1;
      const radius=p.major?24:13;
      const glow=context.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
      glow.addColorStop(0,'rgba(150,174,255,'+(p.major?.37:.23)+')');
      glow.addColorStop(1,'rgba(127,121,244,0)');
      context.fillStyle=glow;context.beginPath();context.arc(p.x,p.y,radius,0,TAU);context.fill();
      context.fillStyle=p.major?'rgba(216,219,255,'+(.70+pulse*.18)+')':'rgba(160,183,255,'+(.54+pulse*.22)+')';
      context.beginPath();context.arc(p.x,p.y,size*(.88+pulse*.12),0,TAU);context.fill();
      if(p.major){
        context.strokeStyle='rgba(148,167,255,.26)';
        context.lineWidth=.8;
        context.beginPath();context.arc(p.x,p.y,9+pulse*1.5,0,TAU);context.stroke();
      }
    });
  }
  function tick(now){
    raf=0;
    if(!visible||document.hidden)return;
    if(now-lastFrame>=30){draw((now-startTime)/1000);lastFrame=now;}
    if(!reducedMotion.matches)raf=requestAnimationFrame(tick);
  }
  function resume(){
    if(!visible||document.hidden)return;
    if(!raf)raf=requestAnimationFrame(tick);
  }
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(container);
  else window.addEventListener('resize',resize,{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)resume();
  },{threshold:.01}).observe(container);
  document.addEventListener('visibilitychange',resume);
  if(reducedMotion.addEventListener)reducedMotion.addEventListener('change',()=>{
    draw((performance.now()-startTime)/1000);
    resume();
  });
  resize();resume();
})();
