window.FQ = window.FQ || {};

FQ.academy = (() => {
  const LESSONS = [
    {
      id: 'l1',
      title: '1. Moda Dizayni Asoslari',
      desc: 'Siluet, proporsiya va ko‘ylak qismlarini uyg‘unlashtirish sirlari.',
      content: 'Har bir mukammal libos 3 asosiy qismdan iborat: <b>Ko‘ylak usti (Bodice)</b>, <b>Bel chizig‘i</b> va <b>Etak (Skirt)</b>. Malika uslubi uchun keng ballgown etak, zamonaviy uslub uchun esa A-siluet tanlanadi.',
      question: 'Qirollik bali uchun qaysi etak shakli eng mos keladi?',
      options: ['Malika (Ballgown)', 'Sport shortik', 'Oddiy futbolka'],
      answer: 0,
      reward: 100
    },
    {
      id: 'l2',
      title: '2. Ranglar Nazariyasi',
      desc: 'Issiq va sovuq ranglarni oltin bezaklar bilan uyg‘unlashtirish.',
      content: 'Qirollik binafsha va pushti ranglar <b>Oltin (#FFD166)</b> kamar va zardo‘zlik naqshlari bilan juda hashamatli ko‘rinadi.',
      question: 'Binafsha libosga eng hashamatli urg‘u beradigan rang qaysi?',
      options: ['Kulrang', 'Oltin (Gold)', 'Jigarrang'],
      answer: 1,
      reward: 100
    },
    {
      id: 'l3',
      title: '3. Mato Turlari',
      desc: 'Ipak, baxmal, atlas va tulle matolarining xususiyatlari.',
      content: '<b>Ipak va Satin</b> yengil yaltiroqlik beradi, <b>Baxmal (Velvet)</b> qishki va kechki liboslar uchun, <b>Milliy Atlas</b> esa betakror sharqona jilo uchun ishlatiladi.',
      question: 'Yozgi yengil va yaltiroq libos uchun qaysi mato qulay?',
      options: ['Qalin jun', 'Ipak (Silk)', 'Brezant'],
      answer: 1,
      reward: 120
    },
    {
      id: 'l4',
      title: '4. Andoza va O‘lchash',
      desc: 'Ko‘krak, bel va etak uzunligini santimetrda to‘g‘ri o‘lchash.',
      content: 'Tikishdan oldin albatta 3 ta asosiy o‘lcham olinadi: <b>Ko‘krak aylanasi</b>, <b>Bel aylanasi</b> va <b>Etak uzunligi</b>.',
      question: 'Libos tikishdan oldin birinchi bo‘lib nima qilinadi?',
      options: ['Dazmollash', 'O‘lchov olish', 'Sotish'],
      answer: 1,
      reward: 120
    },
    {
      id: 'l5',
      title: '5. Tikuvchilik Texnikasi',
      desc: 'Bichish, mashinada tekis chok yuritish va fermuar o‘rnatish.',
      content: 'Qaychi bilan andoza chizig‘idan 1 sm chok haqi qoldirib kesiladi, so‘ngra tikuv mashinasida bir tekisda tikiladi.',
      question: 'Andoza kesishda nima uchun 1 sm joy qoldiriladi?',
      options: ['Chok haqi uchun', 'Bekorga', 'Tugma uchun'],
      answer: 0,
      reward: 140
    },
    {
      id: 'l6',
      title: '6. Zamonaviy Moda Trendlari',
      desc: 'Olmos toshlar, gul naqshlari va milliy zardo‘zlik uyg‘unligi.',
      content: 'Bugungi kunda milliy atlas va zardo‘zlik elementlarini zamonaviy kechki liboslarga qo‘shish eng katta trenddir!',
      question: 'Zamonaviy butikda qaysi bezaklar libos narxini oshiradi?',
      options: ['Zardo‘zlik va olmos toshlar', 'Hech narsa', 'Chang'],
      answer: 0,
      reward: 150
    }
  ];

  function render() {
    const grid = document.getElementById('academy-grid');
    const done = FQ.state.get().completedLessons;
    grid.innerHTML = '';
    LESSONS.forEach((l) => {
      const isDone = done.includes(l.id);
      const card = document.createElement('div');
      card.className = 'card-box';
      card.innerHTML = `
        <div>
          <h3>${l.title}</h3>
          <p style="margin-top:6px;">${l.desc}</p>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="reward-tag">${isDone ? '✅ O‘tilgan' : `+${l.reward} 🪙`}</span>
          <button class="btn-gold" onclick="FQ.academy.openLesson('${l.id}')">
            ${isDone ? 'Takrorlash' : 'Darsni boshlash'}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function openLesson(id) {
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    FQ.audio.click();
    const box = document.getElementById('modal-box');
    box.innerHTML = `
      <h2 style="color:var(--gold);margin-bottom:10px;">🎓 ${l.title}</h2>
      <p style="color:var(--text-muted);line-height:1.6;margin-bottom:16px;">${l.content}</p>
      <div style="background:rgba(255,255,255,0.06);padding:14px;border-radius:14px;border:1px solid var(--border-gold);">
        <div style="font-weight:700;margin-bottom:10px;">❓ Mini-topshiriq: ${l.question}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${l.options.map((opt, idx) => `
            <button class="btn-glass" style="text-align:left;" onclick="FQ.academy.answer('${l.id}', ${idx})">${opt}</button>
          `).join('')}
        </div>
      </div>
      <button class="btn-sm" style="margin-top:14px;" onclick="FQ.closeModal()">Yopish</button>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function answer(id, idx) {
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    if (idx !== l.answer) {
      FQ.toast('❌ Qayta urinib ko‘ring!');
      return;
    }
    const data = FQ.state.get();
    if (!data.completedLessons.includes(id)) {
      data.completedLessons.push(id);
      FQ.state.addCoins(l.reward);
      FQ.state.addXp(60);
      FQ.audio.coin();
      FQ.toast(`🎉 To‘g‘ri! +${l.reward} Tanga va +60 XP!`);
    } else {
      FQ.audio.sparkle();
      FQ.toast('✅ To‘g‘ri javob!');
    }
    FQ.closeModal();
    render();
  }

  return { render, openLesson, answer };
})();

FQ.missions = (() => {
  const MISSIONS = [
    { id: 'm1', title: '✏️ Ilk Dizayn: Yangi ko‘ylak chizing', key: 'designed', target: 1, reward: 150 },
    { id: 'm2', title: '🎨 Ranglar Ustasi: Libosni bo‘yang va bezating', key: 'colored', target: 1, reward: 150 },
    { id: 'm3', title: '🧵 Tikuvchi Malika: 1 ta libos tiking', key: 'sewn', target: 1, reward: 250 },
    { id: 'm4', title: '💰 Butik Egasi: 1 ta libos soting', key: 'sold', target: 1, reward: 300 },
    { id: 'm5', title: '👑 Kolleksioner: 3 ta libos tiking', key: 'sewn', target: 3, reward: 600 }
  ];

  function render() {
    const data = FQ.state.get();
    const list = document.getElementById('missions-list');
    list.innerHTML = '';
    MISSIONS.forEach((m) => {
      const prog = Math.min(m.target, data.missionProgress[m.key] || 0);
      const claimed = data.claimedMissions.includes(m.id);
      const ready = prog >= m.target && !claimed;

      const row = document.createElement('div');
      row.className = 'mission-row';
      row.innerHTML = `
        <div>
          <div style="font-weight:800;font-size:1rem;">${m.title}</div>
          <div style="color:var(--text-muted);font-size:0.84rem;margin-top:4px;">Jarayon: ${prog} / ${m.target}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="reward-tag">+${m.reward} 🪙</span>
          ${claimed
            ? '<span style="color:#2ed573;font-weight:700;">✅ Olingan</span>'
            : `<button class="btn-gold" ${ready ? '' : 'disabled style="opacity:0.45"'} onclick="FQ.missions.claim('${m.id}')">Mukofotni olish</button>`
          }
        </div>
      `;
      list.appendChild(row);
    });
  }

  function claim(id) {
    const m = MISSIONS.find(x => x.id === id);
    const data = FQ.state.get();
    if (!m || data.claimedMissions.includes(id)) return;
    if ((data.missionProgress[m.key] || 0) < m.target) return;
    data.claimedMissions.push(id);
    FQ.state.addCoins(m.reward);
    FQ.state.addXp(75);
    FQ.audio.coin();
    FQ.toast(`🎯 Topshiriq bajarildi! +${m.reward} 🪙`);
    render();
  }

  return { render, claim };
})();

FQ.shop = (() => {
  const ITEMS = [
    { id: 'velvet', icon: '👑', name: 'Qirollik Baxmal Matosi', desc: 'Kechki liboslar uchun chuqur baxmal tekstura.', price: 250 },
    { id: 'sequin', icon: '💎', name: 'Yaltiroq Olmos Mato', desc: 'Sahna va bal liboslari uchun jilokor mato.', price: 400 },
    { id: 'atlas', icon: '🇺🇿', name: 'Milliy O‘zbek Atlasi', desc: 'Betakror milliy naqshli hashamatli atlas.', price: 350 },
    { id: 'gold_scissors', icon: '✂️', name: 'Oltin Tikuv Qaychisi', desc: 'Ustaxona darajasini va prestijini oshiradi.', price: 300 },
    { id: 'chandelier', icon: '✨', name: 'Billur Qandil Dekori', desc: 'Butikingizga qirollik ko‘rkini beradi.', price: 500 }
  ];

  function render() {
    const grid = document.getElementById('shop-grid');
    const unlocked = FQ.state.get().unlockedItems;
    grid.innerHTML = '';
    ITEMS.forEach((item) => {
      const owned = unlocked.includes(item.id);
      const card = document.createElement('div');
      card.className = 'card-box';
      card.innerHTML = `
        <div>
          <div style="font-size:2.2rem;margin-bottom:8px;">${item.icon}</div>
          <h3>${item.name}</h3>
          <p style="margin-top:6px;">${item.desc}</p>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="reward-tag">🪙 ${item.price}</span>
          ${owned
            ? '<span style="color:#2ed573;font-weight:700;">✅ Sotib olingan</span>'
            : `<button class="btn-gold" onclick="FQ.shop.buy('${item.id}')">Sotib olish</button>`
          }
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function buy(id) {
    const item = ITEMS.find(x => x.id === id);
    if (!item) return;
    const data = FQ.state.get();
    if (data.unlockedItems.includes(id)) return;
    if (!FQ.state.spendCoins(item.price)) {
      FQ.toast('🪙 Tangalaringiz yetarli emas! Libos tiking yoki dars o‘ting.');
      return;
    }
    data.unlockedItems.push(id);
    FQ.state.addXp(40);
    FQ.audio.coin();
    FQ.toast(`🛍️ "${item.name}" sotib olindi!`);
    render();
  }

  return { render, buy };
})();

FQ.contest = (() => {
  const NPC_LEADERS = [
    { name: 'Malika Jasmin', score: 940 },
    { name: 'Madina Couture', score: 860 },
    { name: 'Sevara Atelier', score: 790 }
  ];

  function render() {
    const col = FQ.state.get().collection;
    const sel = document.getElementById('contest-dress-select');
    sel.innerHTML = col.map(d => `<option value="${d.id}">${d.name} (${d.fabric})</option>`).join('');

    const data = FQ.state.get();
    const all = [...NPC_LEADERS, { name: `${data.avatar} ${data.playerName} (Siz)`, score: data.xp + 500 }]
      .sort((a, b) => b.score - a.score);

    const lb = document.getElementById('leaderboard-list');
    lb.innerHTML = all.map((p, i) => `
      <div class="lb-row">
        <span><b>#${i + 1}</b> ${p.name}</span>
        <span style="color:var(--gold);font-weight:800;">⭐ ${p.score}</span>
      </div>
    `).join('');
  }

  function enter() {
    const id = document.getElementById('contest-dress-select').value;
    const dress = FQ.state.get().collection.find(d => d.id === id);
    if (!dress) return;
    const score = Math.min(100, 72 + dress.decorations.length * 4 + (dress.pattern !== 'none' ? 10 : 0) + Math.floor(Math.random() * 12));
    const prize = score >= 90 ? 300 : score >= 80 ? 200 : 120;

    FQ.state.addCoins(prize);
    FQ.state.addXp(65);
    FQ.audio.fanfare();

    const res = document.getElementById('contest-result');
    res.style.display = 'block';
    res.innerHTML = `
      <h4 style="color:var(--gold);">🏆 Natija: ${score} / 100 ball!</h4>
      <p style="margin-top:6px;">Hakamlar <b>"${dress.name}"</b> libosini yuqori baholadi! Mukofot: <b>+${prize} 🪙</b></p>
    `;
    render();
  }

  return { render, enter };
})();

