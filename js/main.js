window.FQ = window.FQ || {};

(() => {
  FQ.nav = function (screenId) {
    FQ.audio.click();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screenId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.side-nav .nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === screenId);
    });

    if (screenId === 'home') renderHomeShowcase();
    if (screenId === 'design') FQ.design.init();
    if (screenId === 'coloring') FQ.coloring.init();
    if (screenId === 'sewing') FQ.sewing.init();
    if (screenId === 'showroom') FQ.showroom.init();
    if (screenId === 'academy') FQ.academy.render();
    if (screenId === 'missions') FQ.missions.render();
    if (screenId === 'shop') FQ.shop.render();
    if (screenId === 'contest') FQ.contest.render();
  };

  FQ.startNewWorkflow = function () {
    FQ.state.resetDraft();
    FQ.nav('design');
    FQ.toast('✨ Yangi libos dizaynini boshlang!');
  };

  FQ.saveAndGoColoring = function () {
    FQ.design.exportSketch();
    FQ.nav('coloring');
  };

  FQ.saveAndGoSewing = function () {
    FQ.coloring.markColored();
    FQ.nav('sewing');
  };

  FQ.updateHUD = function () {
    const data = FQ.state.get();
    const lvl = FQ.state.getLevelInfo();
    document.getElementById('hud-avatar').textContent = data.avatar;
    document.getElementById('hud-player-name').textContent = data.playerName;
    document.getElementById('hud-player-level').textContent = `${lvl.level}-daraja • ${lvl.title}`;
    document.getElementById('hud-xp-fill').style.width = lvl.pct + '%';
    document.getElementById('hud-coins').textContent = data.coins;
    document.getElementById('hud-dresses-count').textContent = data.collection.length;
  };

  FQ.toggleSound = function () {
    const next = !FQ.audio.isEnabled();
    FQ.audio.setEnabled(next);
    document.getElementById('sound-toggle').textContent = next ? '🔊' : '🔇';
    if (next) FQ.audio.click();
  };

  FQ.toast = function (msg) {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  FQ.closeModal = function () {
    document.getElementById('modal-overlay').classList.add('hidden');
  };

  FQ.openAvatarModal = function () {
    const data = FQ.state.get();
    const avatars = ['👸', '🧚‍♀️', '💃', '👑', '🌸', '🦋'];
    const box = document.getElementById('modal-box');
    box.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:12px;">👑 Dizayner Profili</h2>
      <label style="font-size:0.85rem;color:var(--text-muted);">Ismingiz:</label>
      <input id="modal-name-input" class="luxury-input" value="${data.playerName}" maxlength="22" style="margin:6px 0 14px;" />
      <label style="font-size:0.85rem;color:var(--text-muted);">Avatar tanlang:</label>
      <div style="display:flex;gap:10px;margin:8px 0 18px;">
        ${avatars.map(a => `
          <button class="sticker-btn" onclick="FQ.setAvatar('${a}')">${a}</button>
        `).join('')}
      </div>
      <button class="btn-gold" onclick="FQ.saveProfileName()">Saqlash</button>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  };

  FQ.setAvatar = function (av) {
    FQ.state.get().avatar = av;
    FQ.state.save();
    FQ.updateHUD();
    FQ.audio.sparkle();
  };

  FQ.saveProfileName = function () {
    const val = document.getElementById('modal-name-input').value.trim();
    if (val) FQ.state.get().playerName = val;
    FQ.state.save();
    FQ.updateHUD();
    FQ.closeModal();
    FQ.toast('✅ Profil yangilandi!');
  };

  function renderHomeShowcase() {
    const data = FQ.state.get();
    const featured = data.collection.find(d => d.id === data.featuredDressId) || data.collection[0];
    if (!featured) return;
    const c = document.getElementById('home-mannequin-canvas');
    FQ.dressRenderer.renderDress(c, featured);
    document.getElementById('home-dress-label').textContent = featured.name;

    // Update daily mission chips on home
    const chips = document.querySelectorAll('#home-daily-steps .step-chip');
    const p = data.missionProgress;
    if (chips[0]) chips[0].classList.toggle('done', p.designed > 0);
    if (chips[1]) chips[1].classList.toggle('done', p.colored > 0);
    if (chips[2]) chips[2].classList.toggle('done', p.sewn > 0);
    if (chips[3]) chips[3].classList.toggle('done', p.sold > 0);
  }

  // Ambient Butterflies & Sparkling Particles
  function initAmbient() {
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.2 + 0.8,
      vy: -(Math.random() * 0.4 + 0.15),
      alpha: Math.random()
    }));

    const butterflies = Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2
    }));

    function tick() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.y += p.vy;
        p.alpha += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.fillStyle = `rgba(255, 209, 102, ${0.25 + Math.abs(Math.sin(p.alpha)) * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.font = '18px serif';
      butterflies.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy + Math.sin(b.phase) * 0.35;
        b.phase += 0.06;
        if (b.x < -30) b.x = w + 30;
        if (b.x > w + 30) b.x = -30;
        if (b.y < -30) b.y = h + 30;
        if (b.y > h + 30) b.y = -30;
        ctx.globalAlpha = 0.55;
        ctx.fillText('🦋', b.x, b.y);
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(tick);
    }
    tick();
  }

  window.addEventListener('DOMContentLoaded', () => {
    FQ.updateHUD();
    renderHomeShowcase();
    initAmbient();
  });
})();

