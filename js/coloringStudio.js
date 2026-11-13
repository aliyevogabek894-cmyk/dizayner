window.FQ = window.FQ || {};

FQ.coloring = (() => {
  const PALETTE = [
    '#ff4fa3', '#ff80ab', '#d81b60', '#9d4edd', '#7b2cbf', '#4a148c', '#c77dff',
    '#ffd166', '#f4a261', '#e76f51', '#ef233c', '#06d6a0', '#118ab2', '#073b4c',
    '#4cc9f0', '#4361ee', '#ffffff', '#f8edeb', '#e0aaff', '#1b1b2f', '#b5838d'
  ];

  const FABRICS = [
    { id: 'silk', label: '✨ Ipak' },
    { id: 'satin', label: '💫 Satin' },
    { id: 'tulle', label: '☁️ Tulle' },
    { id: 'cotton', label: '🌿 Paxta' },
    { id: 'velvet', label: '👑 Baxmal', shopId: 'velvet' },
    { id: 'sequin', label: '💎 Yaltiroq', shopId: 'sequin' },
    { id: 'atlas', label: '🇺🇿 Atlas', shopId: 'atlas' }
  ];

  const PATTERNS = [
    { id: 'none', label: 'Tekis' },
    { id: 'floral', label: '🌸 Gulli' },
    { id: 'gold_embroidery', label: '👑 Zardo‘z' },
    { id: 'stars', label: '✦ Yulduzli' },
    { id: 'lace', label: '🕸️ Dantel' }
  ];

  const STICKERS = ['💎', '🌸', '🦋', '⭐', '🎀', '✨', '👑', '🌺'];

  let activePart = 'bodice';
  let activeSticker = null;
  let initialized = false;

  function init() {
    if (!initialized) {
      initialized = true;
      buildPalette();
      buildStickers();
      const canvas = document.getElementById('coloring-canvas');
      canvas.addEventListener('click', handleCanvasClick);
    }
    buildFabrics();
    buildPatterns();
    render();
  }

  function buildPalette() {
    const wrap = document.getElementById('coloring-palette');
    wrap.innerHTML = '';
    PALETTE.forEach((hex) => {
      const btn = document.createElement('button');
      btn.className = 'swatch';
      btn.style.background = hex;
      btn.onclick = () => applyColor(hex);
      wrap.appendChild(btn);
    });
  }

  function buildFabrics() {
    const wrap = document.getElementById('coloring-fabrics');
    wrap.innerHTML = '';
    const unlocked = FQ.state.get().unlockedItems;
    FABRICS.forEach((f) => {
      const isLocked = f.shopId && !unlocked.includes(f.shopId);
      const btn = document.createElement('button');
      btn.className = 'chip' + (FQ.state.currentDraft.fabric === f.id ? ' active' : '') + (isLocked ? ' locked' : '');
      btn.textContent = isLocked ? `🔒 ${f.label}` : f.label;
      btn.onclick = () => {
        if (isLocked) {
          FQ.toast('Bu matoni "Matolar do‘koni"dan sotib oling!');
          return;
        }
        FQ.state.currentDraft.fabric = f.id;
        FQ.audio.click();
        buildFabrics();
        render();
      };
      wrap.appendChild(btn);
    });
  }

  function buildPatterns() {
    const wrap = document.getElementById('coloring-patterns');
    wrap.innerHTML = '';
    PATTERNS.forEach((p) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (FQ.state.currentDraft.pattern === p.id ? ' active' : '');
      btn.textContent = p.label;
      btn.onclick = () => {
        FQ.state.currentDraft.pattern = p.id;
        FQ.audio.sparkle();
        buildPatterns();
        render();
      };
      wrap.appendChild(btn);
    });
  }

  function buildStickers() {
    const wrap = document.getElementById('coloring-stickers');
    wrap.innerHTML = '';
    STICKERS.forEach((icon) => {
      const btn = document.createElement('button');
      btn.className = 'sticker-btn';
      btn.textContent = icon;
      btn.onclick = () => {
        activeSticker = icon;
        // Also place one immediately in a nice spot on the dress
        const rx = 160 + Math.random() * 100;
        const ry = 140 + Math.random() * 260;
        FQ.state.currentDraft.decorations.push({ icon, x: rx, y: ry });
        FQ.audio.sparkle();
        render();
      };
      wrap.appendChild(btn);
    });
  }

  function handleCanvasClick(e) {
    const canvas = document.getElementById('coloring-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 420;
    const y = ((e.clientY - rect.top) / rect.height) * 520;

    if (activeSticker) {
      FQ.state.currentDraft.decorations.push({ icon: activeSticker, x, y });
      FQ.audio.sparkle();
      render();
      return;
    }

    // Smart part detection by Y coordinate
    if (y >= 195 && y <= 215) selectPartByName('belt');
    else if (y < 195 && (x < 162 || x > 258)) selectPartByName('sleeves');
    else if (y < 195) selectPartByName('bodice');
    else selectPartByName('skirt');
  }

  function selectPartByName(part) {
    activePart = part;
    document.querySelectorAll('#color-part-tabs .part-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.part === part);
    });
    FQ.audio.click();
  }

  function applyColor(hex) {
    FQ.state.currentDraft.colors[activePart] = hex;
    FQ.audio.click();
    render();
  }

  function render() {
    const canvas = document.getElementById('coloring-canvas');
    FQ.dressRenderer.renderDress(canvas, FQ.state.currentDraft);
  }

  return {
    init,
    render,
    selectPart(part, btn) {
      activeSticker = null;
      selectPartByName(part);
    },
    applyColor,
    clearDecorations() {
      FQ.state.currentDraft.decorations = [];
      activeSticker = null;
      FQ.audio.click();
      render();
    },
    randomGlam() {
      const c1 = PALETTE[Math.floor(Math.random() * (PALETTE.length - 4))];
      const c2 = PALETTE[Math.floor(Math.random() * (PALETTE.length - 4))];
      FQ.state.currentDraft.colors.bodice = c1;
      FQ.state.currentDraft.colors.skirt = c2;
      FQ.state.currentDraft.colors.sleeves = c1;
      FQ.state.currentDraft.colors.belt = '#ffd166';
      FQ.state.currentDraft.pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)].id;
      FQ.audio.sparkle();
      buildPatterns();
      render();
    },
    markColored() {
      FQ.state.get().missionProgress.colored += 1;
      FQ.state.save();
    }
  };
})();

