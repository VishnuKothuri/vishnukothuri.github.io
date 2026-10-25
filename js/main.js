// Copy email button: uses the Clipboard API, falls back to selecting the text.
document.getElementById('copyBtn').addEventListener('click',function(){
  var t=document.getElementById('email').textContent, msg=document.getElementById('copied');
  function sel(){var r=document.createRange();r.selectNodeContents(document.getElementById('email'));var s=getSelection();s.removeAllRanges();s.addRange(r);msg.textContent='Selected. Press Ctrl/⌘+C';}
  try{navigator.clipboard.writeText(t).then(function(){msg.textContent='Copied';},sel);}catch(e){sel();}
});


// "Expand all / Collapse all" for the What I do cards
(function(){
  var btn = document.getElementById('toggleAll');
  if (!btn) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('#work details.more'));
  function sync(){
    var allOpen = items.every(function(d){ return d.open; });
    btn.textContent = allOpen ? 'Collapse all' : 'Expand all';
    btn.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
  }
  btn.addEventListener('click', function(){
    var open = !items.every(function(d){ return d.open; });
    items.forEach(function(d){ d.open = open; });
    sync();
  });
  items.forEach(function(d){ d.addEventListener('toggle', sync); });
})();

// ---- Motion (skipped for visitors who prefer reduced motion) ----
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  // Scroll reveal: fade cards and headings up as they enter the viewport
  var groups = ['.sec-head', '.about-grid', '.area', '.stage', '.cert', '.contact h2', '.contact .lead', '.email-row'];
  var targets = [];
  groups.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el, i){
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      targets.push(el);
    });
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function(el){ io.observe(el); });

  // Count-up numbers in the quick-facts strip
  var counters = document.querySelectorAll('[data-count]');
  var co = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var node = e.target.firstChild, end = +e.target.getAttribute('data-count'), t0 = null;
      function step(t){
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / 1100, 1), eased = 1 - Math.pow(1 - k, 3);
        node.nodeValue = String(Math.round(end * eased));
        if (k < 1) requestAnimationFrame(step);
      }
      node.nodeValue = '0';
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  counters.forEach(function(el){ co.observe(el); });

  // Experience timeline: fill the line as you scroll through the section
  var stages = document.querySelector('.stages');
  if (stages){
    var ticking = false;
    function update(){
      var r = stages.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      stages.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();

// ---- v2: header, progress, active nav, theme, menu, back-to-top ----
(function(){
  var root=document.documentElement, header=document.querySelector('.site-header');
  var bar=document.getElementById('progressBar'), toTop=document.getElementById('toTop');
  function onScroll(){
    var max=root.scrollHeight-innerHeight, y=scrollY;
    if(bar) bar.style.transform='scaleX('+(max>0?Math.min(1,y/max):0)+')';
    if(header) header.classList.toggle('scrolled',y>8);
    if(toTop) toTop.classList.toggle('show',y>900);
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Active section in nav
  var links=[].slice.call(document.querySelectorAll('#mainNav a'));
  var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ links.forEach(function(a){a.removeAttribute('aria-current')}); var a=map[e.target.id]; if(a) a.setAttribute('aria-current','true'); }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){ var s=document.getElementById(id); if(s) so.observe(s); });
  }

  // Mobile menu
  var mb=document.getElementById('menuBtn'), nav=document.getElementById('mainNav');
  if(mb&&nav){
    mb.addEventListener('click',function(){ var o=nav.classList.toggle('open'); mb.setAttribute('aria-expanded',o); mb.setAttribute('aria-label',o?'Close menu':'Open menu'); });
    links.forEach(function(a){ a.addEventListener('click',function(){ nav.classList.remove('open'); mb.setAttribute('aria-expanded','false'); }); });
  }

  // Theme toggle (remembered per visitor)
  var tb=document.getElementById('themeBtn');
  if(tb) tb.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    var next=cur==='dark'?'light':'dark'; root.setAttribute('data-theme',next);
    try{ localStorage.setItem('theme',next); }catch(e){}
  });
})();

// Share button: native share sheet on phones, copy link elsewhere
(function(){
  var btn=document.getElementById('shareBtn'), msg=document.getElementById('shareMsg');
  if(!btn) return;
  var url='https://vishnukothuri.github.io/';
  var data={url:url};
  function say(t){ msg.textContent=t; clearTimeout(say.t); say.t=setTimeout(function(){msg.textContent='';},3000); }
  function copy(){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){say('Link copied');},function(){say(url);});
    } else { say(url); }
  }
  btn.addEventListener('click',function(){
    if(navigator.share){ navigator.share(data).catch(function(e){ if(e && e.name!=='AbortError') copy(); }); }
    else copy();
  });
})();
