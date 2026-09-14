/* Volu landing — vanilla interactions. */
(function () {
  var ACCENT = '#6ee7ff';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var pipeDefs = [
    ['01', 'Shoot on your phone', 'One exterior from the curb. One frame per room you want walkable. We correct exposure, lens distortion and vertical lines automatically.', ['any phone', 'no tripod', '2 minutes']],
    ['02', 'Volu solves the space', 'Geometry, materials and light are reconstructed to real-world scale — sun position derived from the property’s own address, date and hour.', ['1.24m tris', 'pbr materials', 'sun-accurate']],
    ['03', 'Embed it anywhere', 'One script tag on your own domain. Buyers orbit, walk through and share the property without ever leaving your site.', ['2 kb script', 'your domain', 'no plugin']]
  ];
  var stepDefs = [
    ['Uploading exterior.jpg', '4.2 MB'], ['Uploading living-room.jpg', '3.8 MB'],
    ['Solving geometry', '1.24M tris'], ['Reconstructing materials', 'PBR'],
    ['Relighting for 38.9°N', 'sun solved'], ['Publishing viewer', 'live']
  ];
  var faqDefs = [
    ['What photos do I actually need?', 'One exterior from the curb, plus one frame per room you want walkable. A phone camera is fine — exposure, lens distortion and vertical lines are corrected on our side.'],
    ['How long does a listing take?', '47 minutes median, end to end. The rush queue returns in about 12 minutes if you are shooting between showings.'],
    ['Is it accurate enough to publish?', 'Geometry lands within 2% of measured dimensions. Anything the solver is unsure about gets flagged for review rather than invented.'],
    ['Where does the viewer live?', 'On your site, on your domain. A single script tag, or an iframe if your CMS is strict about scripts.'],
    ['What if a model comes back wrong?', 'Flag it inside the viewer and we re-solve at no charge, usually the same day. You only publish what you approve.']
  ];
  var monthly = [
    { tag: 'Solo', price: '$99', unit: '/ mo', body: 'For the agent shooting their own listings.', items: ['10 listings a month', 'Exterior + interior model', 'Embeddable viewer', '47-min standard queue'], cta: 'Start free', hero: false },
    { tag: 'Team', price: '$299', unit: '/ mo', body: 'For a small team sharing a marketing budget.', items: ['40 listings a month', 'Everything in Solo', '12-min rush queue', 'Relight variants + 4K stills', 'Shared asset library'], cta: 'Start free', hero: true },
    { tag: 'Brokerage', price: 'Custom', unit: '', body: 'Volume pricing with your brand on the viewer.', items: ['Unlimited listings', 'White-label viewer', 'MLS + CRM sync', 'Dedicated solver capacity'], cta: 'Talk to us', hero: false }
  ];
  var per = [
    { tag: 'Single listing', price: '$49', unit: '/ listing', body: 'Pay as you list. Nothing recurring.', items: ['Exterior + interior model', 'Embeddable viewer', '47-min standard queue', 'One free re-solve'], cta: 'Upload a photo', hero: true },
    { tag: 'Rush', price: '$79', unit: '/ listing', body: 'For the listing that goes live tonight.', items: ['Everything in Single', '12-min rush queue', 'Relight variants', '4K print stills'], cta: 'Upload a photo', hero: false },
    { tag: '10-pack', price: '$390', unit: '/ 10', body: 'Buy a block, use it whenever.', items: ['Ten listings, no expiry', 'Transferable across a team', 'Shared asset library', 'Priority support'], cta: 'Buy a pack', hero: false }
  ];

  var state = { phase: 'idle', stepIdx: 0, variant: 'Daylight', pricing: 'monthly', openFaq: 0, pipeStep: 0 };
  var timers = [];
  var mono = "font-family:'JetBrains Mono',monospace; text-transform:uppercase;";

  function renderPipeSteps() {
    var host = $('#pipeSteps'); if (!host) return;
    host.innerHTML = pipeDefs.map(function (s) {
      var chips = s[3].map(function (c) { return '<span style="padding:7px 13px; border:1px solid rgba(255,255,255,0.11); ' + mono + ' font-size:9.5px; letter-spacing:0.16em; color:#8d95a6">' + c + '</span>'; }).join('');
      return '<div data-step="0" style="min-height:min(64vh, 540px); display:flex; flex-direction:column; justify-content:center; padding:34px 0; border-top:1px solid rgba(255,255,255,0.09)">' +
        '<div style="display:flex; align-items:center; gap:14px"><span class="p-num" style="' + mono + ' font-size:11px; letter-spacing:0.22em">' + s[0] + '</span><span class="p-rule" style="height:1px; display:block; transition:width .5s ease"></span></div>' +
        '<h3 class="p-head" style="margin:22px 0 14px; font-size:clamp(28px, 3.4vw, 46px); line-height:1.02; letter-spacing:-0.035em; font-weight:500; transition:color .4s ease">' + s[1] + '</h3>' +
        '<p style="margin:0 0 22px; font-size:clamp(15.5px, 1.2vw, 18px); line-height:1.6; color:#8d95a6; max-width:40ch">' + s[2] + '</p>' +
        '<div style="display:flex; flex-wrap:wrap; gap:8px">' + chips + '</div></div>';
    }).join('');
    document.querySelectorAll('#pipeSteps [data-step]').forEach(function (el, i) { el.setAttribute('data-step', i); });
    stylePipeSteps();
  }
  function stylePipeSteps() {
    document.querySelectorAll('#pipeSteps [data-step]').forEach(function (el, i) {
      var on = i === state.pipeStep;
      $('.p-num', el).style.color = on ? ACCENT : '#7d8595';
      var rule = $('.p-rule', el); rule.style.background = on ? ACCENT : '#7d8595'; rule.style.width = on ? '64px' : '22px';
      $('.p-head', el).style.color = on ? '#f4f6f9' : '#6b7382';
    });
  }
  function cube() {
    function d(w, h, extra) { return 'position:absolute; width:' + w + 'px; height:' + h + 'px; margin:' + (-h / 2) + 'px 0 0 ' + (-w / 2) + 'px; ' + extra; }
    return '<div style="position:relative; width:0; height:0; transform-style:preserve-3d; animation:voluSpin 26s linear infinite">' +
      '<div style="' + d(520, 360, 'transform:translateY(74px) rotateX(90deg); background:repeating-linear-gradient(0deg, transparent 0 39px, rgba(110,231,255,0.18) 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, rgba(110,231,255,0.18) 39px 40px)') + '"></div>' +
      '<div style="' + d(230, 120, 'transform:translateZ(78px); border:1px solid rgba(110,231,255,0.6); background:rgba(110,231,255,0.06)') + '"></div>' +
      '<div style="' + d(230, 120, 'transform:translateZ(-78px); border:1px solid rgba(110,231,255,0.3)') + '"></div>' +
      '<div style="' + d(156, 120, 'transform:translateX(-115px) rotateY(-90deg); border:1px solid rgba(110,231,255,0.42)') + '"></div>' +
      '<div style="' + d(156, 120, 'transform:translateX(115px) rotateY(90deg); border:1px solid rgba(110,231,255,0.42)') + '"></div>' +
      '<div style="' + d(284, 210, 'transform:translateY(-70px) rotateX(90deg); border:1px solid rgba(179,157,255,0.55); background:rgba(179,157,255,0.06)') + '"></div></div>';
  }
  function renderDemo() {
    var labels = { idle: 'awaiting input', busy: 'solving', done: 'model published' };
    if ($('#phaseLabel')) $('#phaseLabel').textContent = labels[state.phase];
    var panel = $('#demoPanel'), visual = $('#demoVisual'); if (!panel || !visual) return;
    if (state.phase === 'idle') {
      panel.innerHTML = '<div class="drop-zone" id="dropZone" style="border:1px dashed rgba(110,231,255,0.45); padding:40px 26px; text-align:center; cursor:pointer; background:rgba(110,231,255,0.035)"><div style="display:flex; justify-content:center; margin-bottom:18px"><span style="width:36px; height:36px; border:1px solid #6ee7ff; display:block; transform:rotate(45deg)"></span></div><div style="font-size:17px; font-weight:500">Drop two photos, or run the sample</div><div style="' + mono + ' font-size:9.5px; letter-spacing:0.18em; color:#7d8595; margin-top:11px">jpg · heic · up to 40 mb</div></div>';
      $('#dropZone').addEventListener('click', run);
    } else if (state.phase === 'busy') {
      panel.innerHTML = '<div style="border:1px solid rgba(255,255,255,0.1); padding:24px; background:rgba(255,255,255,0.02)">' + stepDefs.map(function (st, i) {
        var color = i < state.stepIdx ? '#f4f6f9' : i === state.stepIdx ? ACCENT : '#7d8595';
        var dot = i < state.stepIdx ? ACCENT : i === state.stepIdx ? 'rgba(110,231,255,0.5)' : 'rgba(255,255,255,0.14)';
        var note = i < state.stepIdx ? st[1] : i === state.stepIdx ? 'working…' : 'queued';
        return '<div style="display:flex; align-items:center; gap:13px; padding:9px 0"><span style="width:7px; height:7px; display:block; flex:none; background:' + dot + '"></span><span style="' + mono + ' text-transform:none; font-size:12px; letter-spacing:0.05em; color:' + color + '">' + st[0] + '</span><span style="flex:1; height:1px; background:rgba(255,255,255,0.07)"></span><span style="' + mono + ' text-transform:none; font-size:10.5px; color:' + color + '">' + note + '</span></div>';
      }).join('') + '</div>';
    } else {
      panel.innerHTML = '<div style="border:1px solid rgba(110,231,255,0.35); padding:26px; background:rgba(110,231,255,0.06)"><div style="font-size:19px; font-weight:500">Model ready — 3 assets published</div><p style="margin:10px 0 22px; font-size:15px; line-height:1.6; color:#8d95a6">Orbitable exterior, walkable interior and a dimensioned floor plan. Paste the snippet on your listing page.</p><div style="display:flex; flex-wrap:wrap; gap:10px"><a href="#pricing" class="btn-cyan" style="padding:13px 24px; background:#6ee7ff; color:#06070a; font-weight:600; font-size:15px">Claim your free listing</a><span id="demoReset" style="padding:13px 24px; border:1px solid rgba(255,255,255,0.18); font-size:15px; cursor:pointer; color:#f4f6f9">Run again</span></div></div>';
      $('#demoReset').addEventListener('click', reset);
    }
    if (state.phase !== 'done') {
      visual.innerHTML = '<div style="position:relative; width:74%; max-width:440px; aspect-ratio:4/3; border:1px solid rgba(255,255,255,0.16); overflow:hidden; box-shadow:0 30px 70px -28px rgba(0,0,0,0.95)"><img src="assets/demo-sample.jpg" alt="Sample listing photo" style="width:100%; height:100%; object-fit:cover; display:block" /><div style="position:absolute; left:0; right:0; bottom:0; padding:14px 14px 12px; background:linear-gradient(0deg, rgba(6,7,10,0.94), transparent); display:flex; flex-direction:column; gap:4px"><span style="' + mono + ' font-size:10px; letter-spacing:0.2em; color:rgba(244,246,249,0.95)">sample listing photo</span><span style="' + mono + ' text-transform:none; font-size:9.5px; letter-spacing:0.12em; color:rgba(244,246,249,0.66)">1820 cedar ridge · exterior</span></div></div>';
    } else {
      var variants = ['Daylight', 'Twilight', 'Wireframe', 'Floor plan'];
      var chips = variants.map(function (label) { var on = state.variant === label; return '<span data-variant="' + label + '" style="padding:7px 13px; cursor:pointer; ' + mono + ' font-size:9.5px; letter-spacing:0.16em; border:1px solid ' + (on ? ACCENT : 'rgba(255,255,255,0.14)') + '; background:' + (on ? 'rgba(110,231,255,0.14)' : 'transparent') + '; color:' + (on ? ACCENT : '#8d95a6') + '">' + label + '</span>'; }).join('');
      visual.innerHTML = '<div style="position:relative; width:100%; height:100%; min-height:420px; display:flex; align-items:center; justify-content:center; perspective:1000px">' + cube() + '<div style="position:absolute; left:0; right:0; bottom:0; display:flex; flex-wrap:wrap; gap:8px; padding:15px 17px; border-top:1px solid rgba(255,255,255,0.07); background:rgba(6,7,10,0.5); backdrop-filter:blur(8px)">' + chips + '</div></div>';
      visual.querySelectorAll('[data-variant]').forEach(function (el) { el.addEventListener('click', function () { state.variant = el.getAttribute('data-variant'); renderDemo(); }); });
    }
  }
  function run() { timers.forEach(clearTimeout); timers = []; state.phase = 'busy'; state.stepIdx = 0; renderDemo(); stepDefs.forEach(function (_, i) { timers.push(setTimeout(function () { state.stepIdx = i + 1; renderDemo(); }, 620 * (i + 1))); }); timers.push(setTimeout(function () { state.phase = 'done'; renderDemo(); }, 620 * stepDefs.length + 500)); }
  function reset() { timers.forEach(clearTimeout); state.phase = 'idle'; state.stepIdx = 0; renderDemo(); }

  function renderPlans() {
    var host = $('#planGrid'); if (!host) return;
    var set = state.pricing === 'monthly' ? monthly : per;
    host.innerHTML = set.map(function (p) {
      var border = p.hero ? 'rgba(110,231,255,0.45)' : 'rgba(255,255,255,0.1)';
      var bg = p.hero ? 'linear-gradient(180deg, rgba(110,231,255,0.09), rgba(110,231,255,0.015))' : '#08090d';
      var items = p.items.map(function (line) { return '<div style="display:flex; gap:12px; align-items:flex-start; font-size:14.5px; color:#c3c9d4; line-height:1.5"><span style="width:5px; height:5px; background:#6ee7ff; display:block; flex:none; margin-top:8px"></span><span>' + line + '</span></div>'; }).join('');
      return '<div style="position:relative; border:1px solid ' + border + '; padding:clamp(26px, 2.8vw, 40px); background:' + bg + '; display:flex; flex-direction:column; gap:22px"><div style="' + mono + ' font-size:10.5px; letter-spacing:0.22em; color:' + (p.hero ? ACCENT : '#8d95a6') + '">' + p.tag + '</div><div style="display:flex; align-items:baseline; gap:8px"><span style="font-size:clamp(40px, 4.2vw, 58px); font-weight:500; letter-spacing:-0.05em">' + p.price + '</span><span style="font-size:15px; color:#8d95a6">' + p.unit + '</span></div><p style="margin:0; font-size:15px; line-height:1.6; color:#8d95a6">' + p.body + '</p><div style="height:1px; background:rgba(255,255,255,0.08)"></div>' + items + '<a href="#top" class="' + (p.hero ? 'btn-cyan' : 'btn-ghost') + '" style="margin-top:auto; padding:14px 22px; text-align:center; font-weight:600; font-size:15px; background:' + (p.hero ? ACCENT : 'transparent') + '; color:' + (p.hero ? '#06070a' : '#f4f6f9') + '; border:1px solid ' + (p.hero ? ACCENT : 'rgba(255,255,255,0.18)') + '">' + p.cta + '</a></div>';
    }).join('');
    $('#toggleMonthly').style.background = state.pricing === 'monthly' ? '#f4f6f9' : 'transparent';
    $('#toggleMonthly').style.color = state.pricing === 'monthly' ? '#06070a' : '#8d95a6';
    $('#togglePer').style.background = state.pricing === 'per' ? '#f4f6f9' : 'transparent';
    $('#togglePer').style.color = state.pricing === 'per' ? '#06070a' : '#8d95a6';
  }
  function renderFaq() {
    var host = $('#faqList'); if (!host) return;
    host.innerHTML = faqDefs.map(function (q, i) {
      var open = state.openFaq === i;
      return '<div style="border-top:1px solid rgba(255,255,255,0.1)"><div class="faq-head" data-faq="' + i + '" style="display:flex; align-items:center; justify-content:space-between; gap:20px; padding:26px 0; cursor:pointer"><span style="font-size:clamp(18px, 1.7vw, 23px); font-weight:500; letter-spacing:-0.02em">' + q[0] + '</span><span style="' + mono + ' font-size:19px; color:#6ee7ff; flex:none">' + (open ? '−' : '+') + '</span></div>' + (open ? '<p style="margin:0; padding:0 0 30px; max-width:62ch; font-size:16px; line-height:1.65; color:#8d95a6">' + q[1] + '</p>' : '') + '</div>';
    }).join('');
    host.querySelectorAll('[data-faq]').forEach(function (el) { el.addEventListener('click', function () { var i = +el.getAttribute('data-faq'); state.openFaq = state.openFaq === i ? -1 : i; renderFaq(); }); });
  }
  function wireScroll() {
    var nav = $('#nav'), progress = $('#progress'), dots = Array.prototype.slice.call(document.querySelectorAll('#dots [data-dot]'));
    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      if (nav) { var solid = window.scrollY > 40; nav.style.background = solid ? 'rgba(6,7,10,0.88)' : 'rgba(6,7,10,0.5)'; nav.style.borderBottomColor = solid ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'; }
      if (dots.length) { var active = dots[0]; dots.forEach(function (d) { var t = document.getElementById(d.getAttribute('data-dot')); if (t && t.getBoundingClientRect().top <= window.innerHeight * 0.4) active = d; }); dots.forEach(function (d) { var on = d === active; d.style.background = on ? ACCENT : 'rgba(255,255,255,0.22)'; d.style.transform = on ? 'scale(1.6)' : 'scale(1)'; d.style.transition = 'background .3s ease, transform .3s ease'; }); }
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  function wirePointer() { var glow = $('#glow'); if (!glow) return; window.addEventListener('pointermove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = (e.clientY + window.scrollY) + 'px'; }); }
  function wireReveal() {
    if (typeof IntersectionObserver === 'undefined') return;
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    nodes.forEach(function (n, i) { if (n.getBoundingClientRect().top < window.innerHeight) return; n.style.opacity = '0'; n.style.transform = 'translateY(28px)'; n.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) ' + ((i % 3) * 80) + 'ms, transform .8s cubic-bezier(.16,1,.3,1) ' + ((i % 3) * 80) + 'ms'; });
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.style.opacity = '1'; en.target.style.transform = 'none'; io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -12% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }
  function wirePipeline() {
    if (typeof IntersectionObserver === 'undefined') return;
    var stage = $('#pipeStage'); if (!stage) return;
    var layers = Array.prototype.slice.call(stage.querySelectorAll('[data-layer]'));
    var steps = Array.prototype.slice.call(document.querySelectorAll('#pipeSteps [data-step]'));
    if (!layers.length || !steps.length) return;
    function show(i) { layers.forEach(function (l) { l.style.opacity = +l.getAttribute('data-layer') === i ? '1' : '0'; }); if (state.pipeStep !== i) { state.pipeStep = i; stylePipeSteps(); } }
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) show(steps.indexOf(en.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }
  function wireViewerControls() {
    var viewer = document.getElementById('listingViewer'); if (!viewer) return;
    function bind(attr, method) {
      document.querySelectorAll('[data-' + attr + ']').forEach(function (b) {
        b.addEventListener('click', function () {
          b.parentNode.querySelectorAll('.vc').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          if (typeof viewer[method] === 'function') viewer[method](b.getAttribute('data-' + attr)); else viewer.setAttribute(attr, b.getAttribute('data-' + attr));
        });
      });
    }
    bind('preset', 'setPreset'); bind('backdrop', 'setBackdrop');
  }
  function init() {
    wireViewerControls(); renderPipeSteps(); renderDemo(); renderPlans(); renderFaq();
    if ($('#toggleMonthly')) $('#toggleMonthly').addEventListener('click', function () { state.pricing = 'monthly'; renderPlans(); });
    if ($('#togglePer')) $('#togglePer').addEventListener('click', function () { state.pricing = 'per'; renderPlans(); });
    wireScroll(); wirePointer(); wireReveal(); wirePipeline();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
