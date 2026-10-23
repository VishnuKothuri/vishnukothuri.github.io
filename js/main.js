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
