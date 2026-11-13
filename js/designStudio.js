window.FQ = window.FQ || {};

FQ.design = (() => {
  const SKIRTS = [
    { id: 'ballgown', label: '👑 Malika' },
    { id: 'aline', label: '👗 A-Siluet' },
    { id: 'mermaid', label: '🧜‍♀️ Baliq' },
    { id: 'mini', label: '☀️ Yozgi' },
    { id: 'national', label: '🌸 Milliy' }
  ];
  const BODICES = [
    { id: 'heart', label: '💖 Yurakcha' },
    { id: 'vneck', label: '✨ V-yoqa' },
    { id: 'high', label: '🎀 Yoqali' },
    { id: 'offshoulder', label: '💃 Yelka ochiq' }
  ];
  const SLEEVES = [
    { id: 'none', label: 'Yengsiz' },
    { id: 'short', label: 'Kalta' },
    { id: 'long', label: 'Uzun' },
    { id: 'puff', label: 'Fonarik' }
  ];
  const PEN_COLORS = ['#ffffff', '#ffd166', '#ff5ca8', '#c77dff', '#72efdd', '#ff4d6d', '#111111'];

  let tool = 'pencil';
  let penColor = '#ffd166';
  let penSize = 4;
  let symmetry = true;
  let zoomLevel = 1;
  let drawing = false;
  let lastPt = null;
  let history = [];
  let redoStack = [];
  let initialized = false;

  function init() {
    if (initialized) {
      refreshBase();
      return;
    }
    initialized = true;

    renderTemplateChips('tpl-skirts', SKIRTS, 'skirt');
    renderTemplateChips('tpl-bodices', BODICES, 'bodice');
    renderTemplateChips('tpl-sleeves', SLEEVES, 'sleeves');

    const colorWrap = document.getElementById('design-colors');
    colorWrap.innerHTML = '';
    PEN_COLORS.forEach((c, idx) => {
      const b = document.createElement('button');
      b.className = 'swatch' + (idx === 1 ? ' active' : '');
      b.style.background = c;
      b.onclick = () => {
        penColor = c;
        colorWrap.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        b.classList.add('active');
        FQ.audio.click();
      };
      colorWrap.appendChild(b);
    });

    const drawCanvas = document.getElementById('design-draw-canvas');
    const getPos = (e) => {
      const rect = drawCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * drawCanvas.width,
        y: ((clientY - rect.top) / rect.height) * drawCanvas.height
      };
    };

    const start = (e) => {
      e.preventDefault();
      drawing = true;
      lastPt = getPos(e);
      pushHistory();
    };
    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const pt = getPos(e);
      drawSegment(lastPt, pt);
      if (symmetry) {
        drawSegment(
          { x: drawCanvas.width - lastPt.x, y: lastPt.y },
          { x: drawCanvas.width - pt.x, y: pt.y }
        );
      }
      lastPt = pt;
    };
    const end = () => { drawing = false; lastPt = null; };

    drawCanvas.addEventListener('mousedown', start);
    drawCanvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    drawCanvas.addEventListener('touchstart', start, { passive: false });
    drawCanvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    const nameInput = document.getElementById('dress-name-input');
    nameInput.value = FQ.state.currentDraft.name;
    nameInput.addEventListener('input', (e) => {
      FQ.state.currentDraft.name = e.target.value || 'Malika Libosi';
    });

    refreshBase();
  }

  function renderTemplateChips(containerId, items, key) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (FQ.state.currentDraft[key] === item.id ? ' active' : '');
      btn.textContent = item.label;
      btn.onclick = () => {
        FQ.state.currentDraft[key] = item.id;
        el.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        FQ.audio.click();
        refreshBase();
      };
      el.appendChild(btn);
    });
  }

  function refreshBase() {
    const base = document.getElementById('design-base-canvas');
    FQ.dressRenderer.renderDress(base, FQ.state.currentDraft, { outlineOnly: true, skipSketchOverlay: true });
    document.getElementById('dress-name-input').value = FQ.state.currentDraft.name;
  }

  function drawSegment(p1, p2) {
    const ctx = document.getElementById('design-draw-canvas').getContext('2d');
    ctx.save();
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penSize * 2.5;
    } else if (tool === 'glitter') {
      ctx.fillStyle = penColor;
      for (let i = 0; i < 4; i++) {
        const ox = (Math.random() - 0.5) * penSize * 3;
        const oy = (Math.random() - 0.5) * penSize * 3;
        ctx.beginPath();
        ctx.arc(p2.x + ox, p2.y + oy, Math.random() * 2.5 + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = tool === 'brush' ? penSize * 1.9 : penSize;
      if (tool === 'brush') ctx.globalAlpha = 0.72;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  function pushHistory() {
    const c = document.getElementById('design-draw-canvas');
    history.push(c.toDataURL());
    if (history.length > 25) history.shift();
    redoStack = [];
  }

  function restoreDataUrl(url) {
    const c = document.getElementById('design-draw-canvas');
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    if (!url) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = url;
  }

  return {
    init,
    refreshBase,
    setTool(t, btn) {
      tool = t;
      document.querySelectorAll('#screen-design .tool-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      FQ.audio.click();
    },
    setSymmetry(val) { symmetry = val; },
    setSize(val) {
      penSize = Number(val);
      document.getElementById('brush-size-val').textContent = val;
    },
    undo() {
      if (!history.length) return;
      const c = document.getElementById('design-draw-canvas');
      redoStack.push(c.toDataURL());
      restoreDataUrl(history.pop());
      FQ.audio.click();
    },
    redo() {
      if (!redoStack.length) return;
      const c = document.getElementById('design-draw-canvas');
      history.push(c.toDataURL());
      restoreDataUrl(redoStack.pop());
      FQ.audio.click();
    },
    zoom(delta) {
      zoomLevel = Math.max(0.75, Math.min(1.5, zoomLevel + delta));
      document.getElementById('design-canvas-wrap').style.transform = `scale(${zoomLevel})`;
      FQ.audio.click();
    },
    clearDrawing() {
      pushHistory();
      const c = document.getElementById('design-draw-canvas');
      c.getContext('2d').clearRect(0, 0, c.width, c.height);
      FQ.audio.click();
    },
    exportSketch() {
      const c = document.getElementById('design-draw-canvas');
      FQ.state.currentDraft.sketchDataUrl = c.toDataURL();
      const data = FQ.state.get();
      data.missionProgress.designed += 1;
      FQ.state.save();
    }
  };
})();

