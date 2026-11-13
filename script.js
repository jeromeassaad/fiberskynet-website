(()=>{const button=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-navigation');if(button&&nav){const close=()=>{nav.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu')};button.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close menu':'Open menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('resize',()=>{if(innerWidth>800)close()})}const form=document.querySelector('#contact-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),message=form.elements.message.value.trim(),subject=form.elements.subject.value;if(!name||!email||!message||!form.elements.email.checkValidity()){document.querySelector('#form-note').textContent='Please enter your name, a valid email address, and a message.';form.reportValidity();return}const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;window.location.href=`mailto:info@fiberskynet.net?subject=${encodeURIComponent('FiberSkynet: '+subject)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-note').textContent='Your email application should open. Please send the draft from there.'})}})();
(()=>{const h=document.querySelector('.site-header');if(!h)return;const sync=()=>h.classList.toggle('is-scrolled',window.scrollY>24);sync();window.addEventListener('scroll',sync,{passive:true})})();

/* FiberSkynet V6 — minimal, editorial radial-network animation.
   Inspired by the supplied monochrome reference: a central hub, fine radial
   spokes, suspended dots and a sparse point matrix. No 3D libraries/assets. */
(()=>{
  const canvas=document.getElementById('connectivity-canvas');
  if(!canvas)return;
  const host=canvas.parentElement;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const TWO_PI=2*Math.PI;
  const spokeAngles=Array.from({length:12},(_,i)=>-Math.PI/2+i*TWO_PI/12);
  // Static dot grid behind the moving star. Similar to the reference animation.
  const grid=[];
  for(let row=0;row<8;row++){
    for(let col=0;col<10;col++){
      grid.push({x:.065+col*.096,y:.11+row*.111,row,col,
        large:(row+col*2)%6===0});
    }
  }
  const floatingDots=Array.from({length:12},(_,i)=>{
    const a=-Math.PI/2+i*TWO_PI/12+Math.PI/12;
    return {angle:a,radius:(i%3===0?.145:.127)};
  });

  let width=1,height=1,dpr=1,frame=0,last=0,visible=true,initialized=false;
  const epoch=performance.now();

  const circle=(x,y,r)=>{
    ctx.beginPath();
    ctx.arc(x,y,r,0,TWO_PI);
    ctx.fill();
  };

  function draw(t){
    ctx.clearRect(0,0,width,height);
    const still=reduce.matches;
    // Hub travels gently across the underlying fixed grid, just as in the video.
    // Positions remain entirely in the right-hand graphic container.
    const dx=still?0:Math.sin(t*.25)*width*.095;
    const dy=still?0:Math.sin(t*.15+.6)*height*.026;
    const cx=width*.53+dx;
    const cy=height*.50+dy;
    const unit=Math.min(width,height);
    const extent=unit*.265;
    const breathe=still?1:1+Math.sin(t*.67)*.018;

    // Elegant dot field: white points of differing sizes, soft falloff at edges.
    for(const dot of grid){
      const x=dot.x*width,y=dot.y*height;
      const radial=Math.hypot((dot.x-.52)*1.15,(dot.y-.49)*.95);
      const edge=Math.max(.1,1-radial*.88);
      const flicker=still?0:Math.sin(t*.37+dot.col*1.5+dot.row*.9)*.045;
      ctx.fillStyle='rgba(239,241,255,'+Math.max(.10,(dot.large?.53:.30)*edge+flicker).toFixed(3)+')';
      circle(x,y,dot.large?2.55:1.4);
    }

    // One center of connection and twelve crisp, evenly spaced spokes.
    // Spokes vary very slightly in length, mirroring the reference's geometry.
    const endpoints=spokeAngles.map((angle,i)=>{
      const radial=extent*(i%3===1?.93:(i%5===0?1.11:1))*breathe;
      return {x:cx+Math.cos(angle)*radial,y:cy+Math.sin(angle)*radial};
    });
    ctx.lineWidth=1.45;
    ctx.lineCap='round';
    ctx.strokeStyle='rgba(244,245,255,.76)';
    ctx.beginPath();
    for(const p of endpoints){ctx.moveTo(cx,cy);ctx.lineTo(p.x,p.y);}
    ctx.stroke();

    // Small points between the spokes form the second, unconnected ring.
    for(let i=0;i<floatingDots.length;i++){
      const dot=floatingDots[i];
      const radius=unit*dot.radius*breathe;
      const x=cx+Math.cos(dot.angle)*radius;
      const y=cy+Math.sin(dot.angle)*radius;
      ctx.fillStyle='rgba(245,246,255,.87)';
      circle(x,y,4.1);
    }

    for(let i=0;i<endpoints.length;i++){
      const p=endpoints[i];
      const pulse=still?0:Math.sin(t*.76+i*.73)*.15;
      ctx.fillStyle='rgba(248,249,255,'+(.90+pulse*.35).toFixed(3)+')';
      circle(p.x,p.y,3.6);
    }

    // Restrained illumination: close to white, a hint of FiberSkynet lavender.
    const halo=ctx.createRadialGradient(cx,cy,1,cx,cy,40);
    halo.addColorStop(0,'rgba(205,208,255,.17)');
    halo.addColorStop(1,'rgba(145,142,255,0)');
    ctx.fillStyle=halo;
    circle(cx,cy,40);
    ctx.fillStyle='rgba(249,249,255,.98)';
    circle(cx,cy,10.5);
  }

  function resize(){
    const bounds=host.getBoundingClientRect();
    width=Math.max(1,Math.round(bounds.width));
    height=Math.max(1,Math.round(bounds.height));
    dpr=Math.min(window.devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*dpr);
    canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    initialized=true;
    draw((performance.now()-epoch)/1000);
  }
  function animate(now){
    frame=0;
    if(!visible||document.hidden)return;
    if(now-last>31){last=now;draw((now-epoch)/1000);}
    if(!reduce.matches)frame=requestAnimationFrame(animate);
  }
  function resume(){
    if(!initialized||!visible||document.hidden)return;
    if(frame){cancelAnimationFrame(frame);frame=0;}
    draw((performance.now()-epoch)/1000);
    if(!reduce.matches)frame=requestAnimationFrame(animate);
  }
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible)resume();
    else if(frame){cancelAnimationFrame(frame);frame=0;}
  },{threshold:0});
  observer.observe(host);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}
    else resume();
  });
  if(reduce.addEventListener)reduce.addEventListener('change',resume);
  resize();
  resume();
})();
