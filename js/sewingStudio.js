window.FQ = window.FQ || {};

FQ.sewing = (() => {
  let step = 1;
  let measuresDone = [false, false, false];
  let cutProgress = 0;
  let sewProgress = 0;
  let sewingTimer = null;
  let needlePhase = 0;
  let buttonsDone = [false, false, false, false]; // 3 buttons + 1 zipper
  let initialized = false;

  const MEASURE_ZONES = [
    { label: 'Ko‘krak: 88 sm', x: 250, y: 140, w: 160 },
    { label: 'Bel: 64 sm', x: 265, y: 215, w: 130 },
    { label: 'Etak uzunligi: 115 sm', x: 330, y: 295, h: 110 }
  ];

  function init() {
    if (!initialized) {
      initialized = true;
      const c = document.getElementById('sewing-canvas');
      c.addEventListener('click', handleCanvasClick);
      c.addEventListener('mousemove', handleCanvasMove);
    }
    resetFlow();
  }

  function resetFlow() {
    step = 1;
    measuresDone = [false, false, false];
    cutProgress = 0;
    sewProgress = 0;
    buttonsDone = [false, false, false, false];
    stopSewingLoop();
    updateStepper();
    renderControls();
    drawScene();
  }

  function updateStepper() {
    document.getElementById('sewing-step-num').textContent = step;
    document.querySelectorAll('#sewing-stepper .s-step').forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle('active', s === step);
      el.classList.toggle('done', s < step);
    });
  }

  function renderControls() {
    const box = document.getElementById('sewing-controls');
    const draft = FQ.state.currentDraft;

    if (step === 1) {
      box.innerHTML = `
        <div>
          <h3>1. Mato va Ip Tanlash</h3>
          <p style="color:var(--text-muted);margin:8px 0 14px;">
            Tanlangan mato: <b style="color:var(--gold)">${draft.fabric.toUpperCase()}</b>.<br>
            Tikish uchun ip rangini tekshiring va boshlang!
          </p>
          <div class="chip-grid">
            <button class="chip active">🧵 Oltin ip</button>
            <button class="chip">🌸 Pushti ip</button>
            <button class="chip">💜 Binafsha ip</button>
          </div>
        </div>
        <button class="btn-gold" onclick="FQ.sewing.nextStep()">O‘lchashga o‘tish ➜</button>
      `;
    } else if (step === 2) {
      const count = measuresDone.filter(Boolean).length;
      box.innerHTML = `
        <div>
          <h3>2. O‘lchov Olish (Santimetr)</h3>
          <p style="color:var(--text-muted);margin:8px 0 14px;">
            Chapdagi mato ustidagi <b>3 ta sariq nuqta</b>ni bosing va o‘lchov oling (${count}/3).
          </p>
          <div class="sewing-meter"><div class="sewing-meter-fill" style="width:${(count / 3) * 100}%"></div></div>
        </div>
        <button class="btn-gold" ${count < 3 ? 'disabled style="opacity:0.5"' : ''} onclick="FQ.sewing.nextStep()">Bichishga o‘tish ➜</button>
      `;
    } else if (step === 3) {
      box.innerHTML = `
        <div>
          <h3>3. Qaychi Bilan Bichish ✂️</h3>
          <p style="color:var(--text-muted);margin:8px 0 14px;">
            Chiziq bo‘ylab <b>sichqonchani yurgizing</b> yoki mato ustiga bosing (${Math.round(cutProgress)}%).
          </p>
          <div class="sewing-meter"><div class="sewing-meter-fill" style="width:${cutProgress}%"></div></div>
        </div>
        <button class="btn-gold" ${cutProgress < 100 ? 'disabled style="opacity:0.5"' : ''} onclick="FQ.sewing.nextStep()">Tikuv mashinasiga ➜</button>
      `;
    } else if (step === 4) {
      box.innerHTML = `
        <div>
          <h3>4. Tikuv Mashinasida Tikish 🪡</h3>
          <p style="color:var(--text-muted);margin:8px 0 14px;">
            Pedalni bosib turing (yoki bosing) va chokni 100% ga yetkazing: <b>${Math.round(sewProgress)}%</b>
          </p>
          <div class="sewing-meter"><div class="sewing-meter-fill" style="width:${sewProgress}%"></div></div>
          <button class="btn-play-glow" style="width:100%;justify-content:center;margin-top:16px;"
            onmousedown="FQ.sewing.startSew()" onmouseup="FQ.sewing.stopSew()" onmouseleave="FQ.sewing.stopSew()"
            ontouchstart="FQ.sewing.startSew()" ontouchend="FQ.sewing.stopSew()"
            onclick="FQ.sewing.tapSew()">
            ⚡ PEDALNI BOSING (TIKISH)
          </button>
        </div>
        <button class="btn-gold" ${sewProgress < 100 ? 'disabled style="opacity:0.5"' : ''} onclick="FQ.sewing.nextStep()">Tugma va Fermuar ➜</button>
      `;
    } else if (step === 5) {
      const done = buttonsDone.filter(Boolean).length;
      box.innerHTML = `
        <div>
          <h3>5. Tugma va Fermuar O‘rnatish</h3>
          <p style="color:var(--text-muted);margin:8px 0 14px;">
            Ko‘ylak ustidagi <b>3 ta oltin tugma</b> va <b>fermuar</b> o‘rnini bosing (${done}/4).
          </p>
          <div class="sewing-meter"><div class="sewing-meter-fill" style="width:${(done / 4) * 100}%"></div></div>
        </div>
        <button class="btn-gold" ${done < 4 ? 'disabled style="opacity:0.5"' : ''} onclick="FQ.sewing.finishDress()">✨ Libosni Yakunlash</button>
      `;
    } else if (step === 6) {
      box.innerHTML = `
        <div>
          <h3>🎉 Libos Tayyor Bo‘ldi!</h3>
          <p style="color:var(--text-muted);margin:10px 0 16px;">
            <b>"${draft.name}"</b> muvaffaqiyatli tikildi va <b>Mening Kolleksiyam</b>ga qo‘shildi!<br>
            Mukofot: <b style="color:var(--gold)">+120 🪙</b> va <b style="color:var(--pink-soft)">+80 XP</b>
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="btn-play-glow" style="justify-content:center;" onclick="FQ.nav('showroom')">🏛️ 3D Butikda Ko‘rish</button>
          <button class="btn-glass" onclick="FQ.startNewWorkflow()">➕ Yangi Libos Tikish</button>
        </div>
      `;
    }
  }

  function handleCanvasClick(e) {
    const c = document.getElementById('sewing-canvas');
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;

    if (step === 2) {
      MEASURE_ZONES.forEach((z, i) => {
        if (Math.abs(y - z.y) < 35) {
          measuresDone[i] = true;
          FQ.audio.sparkle();
        }
      });
      renderControls();
      drawScene();
    } else if (step === 3 && cutProgress < 100) {
      cutProgress = Math.min(100, cutProgress + 20);
      FQ.audio.snip();
      renderControls();
      drawScene();
    } else if (step === 5) {
      const pts = [
        { x: 330, y: 120 },
        { x: 330, y: 155 },
        { x: 330, y: 190 },
        { x: 330, y: 245 }
      ];
      pts.forEach((p, idx) => {
        if (Math.hypot(x - p.x, y - p.y) < 35) {
          buttonsDone[idx] = true;
          FQ.audio.sparkle();
        }
      });
      renderControls();
      drawScene();
    }
  }

  function handleCanvasMove(e) {
    if (step === 3 && e.buttons === 1 && cutProgress < 100) {
      cutProgress = Math.min(100, cutProgress + 2.5);
      if (Math.random() < 0.25) FQ.audio.snip();
      renderControls();
      drawScene();
    }
  }

  function drawScene() {
    const c = document.getElementById('sewing-canvas');
    const ctx = c.getContext('2d');
    const draft = FQ.state.currentDraft;
    ctx.clearRect(0, 0, c.width, c.height);

    // Table surface
    const bg = ctx.createLinearGradient(0, 0, 660, 440);
    bg.addColorStop(0, '#2a124d');
    bg.addColorStop(1, '#17082e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 660, 440);

    // Fabric sheet on table
    ctx.save();
    ctx.fillStyle = draft.colors.skirt;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 50, 380, 340, 18);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Dress pattern outline
    ctx.save();
    ctx.strokeStyle = step >= 3 && cutProgress >= 100 ? '#ffd166' : 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2.5;
    if (step < 3 || cutProgress < 100) ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(275, 95);
    ctx.lineTo(385, 95);
    ctx.lineTo(375, 195);
    ctx.lineTo(445, 365);
    ctx.lineTo(215, 365);
    ctx.lineTo(285, 195);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    if (step === 2) {
      // Measuring tapes
      MEASURE_ZONES.forEach((z, i) => {
        ctx.save();
        ctx.fillStyle = measuresDone[i] ? '#2ed573' : '#ffd166';
        ctx.beginPath();
        ctx.arc(z.x, z.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b0733';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(measuresDone[i] ? '✓' : '📏', z.x, z.y + 4);
        if (measuresDone[i]) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(z.x - 60, z.y + 16, 120, 20);
          ctx.fillStyle = '#1b0733';
          ctx.fillText(z.label, z.x, z.y + 30);
        }
        ctx.restore();
      });
    }

    if (step === 3) {
      // Scissors icon along progress
      const sy = 95 + (cutProgress / 100) * 270;
      ctx.font = '34px serif';
      ctx.fillText('✂️', 410, sy);
    }

    if (step === 4) {
      // Sewing Machine graphic on right + animated needle + stitch line
      ctx.save();
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.roundRect(450, 100, 165, 95, 16);
      ctx.fill();
      ctx.fillStyle = '#9d4edd';
      ctx.fillRect(555, 195, 55, 145);
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(435, 320, 185, 28);

      // Needle moving up/down
      const ny = 215 + Math.sin(needlePhase) * 14;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(475, 195);
      ctx.lineTo(475, ny);
      ctx.stroke();

      // Stitch line
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(275, 195);
      ctx.lineTo(275 + (sewProgress / 100) * 170, 365);
      ctx.stroke();
      ctx.restore();
    }

    if (step === 5) {
      const pts = [
        { x: 330, y: 120, icon: '🟡' },
        { x: 330, y: 155, icon: '🟡' },
        { x: 330, y: 190, icon: '🟡' },
        { x: 330, y: 245, icon: '🤐' }
      ];
      pts.forEach((p, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = buttonsDone[idx] ? 'rgba(46,213,115,0.35)' : 'rgba(255,209,102,0.28)';
        ctx.fill();
        ctx.strokeStyle = '#ffd166';
        ctx.stroke();
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText(buttonsDone[idx] ? p.icon : '➕', p.x, p.y + 6);
        ctx.restore();
      });
    }

    if (step === 6) {
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.textAlign = 'center';
      ctx.fillText('✨ MUKAMMAL TIKILDI! ✨', 330, 225);
    }
  }

  function stopSewingLoop() {
    if (sewingTimer) {
      clearInterval(sewingTimer);
      sewingTimer = null;
    }
  }

  return {
    init,
    nextStep() {
      if (step < 6) {
        step++;
        FQ.audio.click();
        updateStepper();
        renderControls();
        drawScene();
      }
    },
    startSew() {
      if (step !== 4 || sewingTimer) return;
      sewingTimer = setInterval(() => {
        if (sewProgress >= 100) {
          stopSewingLoop();
          return;
        }
        sewProgress = Math.min(100, sewProgress + 4);
        needlePhase += 1.1;
        FQ.audio.stitch();
        renderControls();
        drawScene();
      }, 65);
    },
    stopSew() { stopSewingLoop(); },
    tapSew() {
      if (step !== 4 || sewProgress >= 100) return;
      sewProgress = Math.min(100, sewProgress + 12);
      needlePhase += 1.5;
      FQ.audio.stitch();
      renderControls();
      drawScene();
    },
    finishDress() {
      step = 6;
      updateStepper();
      const draft = FQ.state.currentDraft;
      const basePrice = 280 + draft.decorations.length * 35 + (draft.pattern !== 'none' ? 60 : 0);
      const completed = {
        ...JSON.parse(JSON.stringify(draft)),
        id: 'dress_' + Date.now(),
        price: basePrice,
        sold: false
      };
      const data = FQ.state.get();
      data.collection.unshift(completed);
      data.featuredDressId = completed.id;
      data.missionProgress.sewn += 1;
      FQ.state.addCoins(120);
      FQ.state.addXp(80);
      FQ.state.save();
      FQ.audio.fanfare();
      FQ.toast('🎉 +120 Tanga va +80 XP qo‘shildi!');
      renderControls();
      drawScene();
    }
  };
})();

