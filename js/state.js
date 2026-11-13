window.FQ = window.FQ || {};

FQ.LEVELS = [
  { level: 1, title: 'Boshlovchi Dizayner', minXp: 0 },
  { level: 2, title: 'Kichik Moda Dizayneri', minXp: 150 },
  { level: 3, title: 'Professional Dizayner', minXp: 400 },
  { level: 4, title: 'Moda Eksperti', minXp: 800 },
  { level: 5, title: 'Fashion Queen', minXp: 1400 }
];

FQ.createDefaultDress = (overrides = {}) => ({
  id: 'dress_' + Date.now() + '_' + Math.floor(Math.random() * 999),
  name: 'Qirollik Binafsha',
  skirt: 'ballgown',
  bodice: 'heart',
  sleeves: 'puff',
  colors: {
    bodice: '#7b2cbf',
    skirt: '#5a189a',
    sleeves: '#9d4edd',
    belt: '#ffd166'
  },
  fabric: 'silk',
  pattern: 'gold_embroidery',
  decorations: [
    { icon: '💎', x: 210, y: 185 },
    { icon: '✨', x: 165, y: 310 },
    { icon: '✨', x: 255, y: 310 }
  ],
  sketchDataUrl: null,
  price: 420,
  sold: false,
  ...overrides
});

FQ.state = (() => {
  const STORAGE_KEY = 'fashion_queen_save_v1';

  const defaultData = {
    playerName: 'Malika Dizayner',
    avatar: '👸',
    coins: 1250,
    xp: 40,
    unlockedItems: ['silk', 'cotton', 'satin', 'tulle'],
    completedLessons: [],
    claimedMissions: [],
    missionProgress: {
      designed: 0,
      colored: 0,
      sewn: 0,
      sold: 0
    },
    featuredDressId: 'starter_1',
    collection: [
      FQ.createDefaultDress({
        id: 'starter_1',
        name: 'Qirollik Binafsha',
        skirt: 'ballgown',
        bodice: 'heart',
        sleeves: 'puff',
        colors: { bodice: '#7b2cbf', skirt: '#4a148c', sleeves: '#9d4edd', belt: '#ffd166' },
        fabric: 'silk',
        pattern: 'gold_embroidery',
        price: 480
      }),
      FQ.createDefaultDress({
        id: 'starter_2',
        name: 'Atirgul Malika',
        skirt: 'aline',
        bodice: 'vneck',
        sleeves: 'short',
        colors: { bodice: '#ff4fa3', skirt: '#d81b60', sleeves: '#ff80ab', belt: '#ffd166' },
        fabric: 'satin',
        pattern: 'floral',
        price: 390
      })
    ]
  };

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...defaultData, ...JSON.parse(raw) };
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaultData));
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  return {
    get: () => data,
    save,
    currentDraft: FQ.createDefaultDress({ id: 'draft', name: 'Malika Orzusi' }),
    addCoins(amount) {
      data.coins += amount;
      save();
      FQ.updateHUD();
    },
    spendCoins(amount) {
      if (data.coins < amount) return false;
      data.coins -= amount;
      save();
      FQ.updateHUD();
      return true;
    },
    addXp(amount) {
      const oldLvl = this.getLevelInfo().level;
      data.xp += amount;
      const newLvl = this.getLevelInfo().level;
      save();
      FQ.updateHUD();
      if (newLvl > oldLvl) {
        FQ.audio.fanfare();
        FQ.toast(`🎉 Tabriklaymiz! Yangi daraja: ${this.getLevelInfo().title}!`);
      }
    },
    getLevelInfo() {
      let current = FQ.LEVELS[0];
      let next = FQ.LEVELS[1];
      for (let i = 0; i < FQ.LEVELS.length; i++) {
        if (data.xp >= FQ.LEVELS[i].minXp) {
          current = FQ.LEVELS[i];
          next = FQ.LEVELS[i + 1] || null;
        }
      }
      const pct = next
        ? Math.min(100, Math.round(((data.xp - current.minXp) / (next.minXp - current.minXp)) * 100))
        : 100;
      return { ...current, pct };
    },
    resetDraft() {
      this.currentDraft = FQ.createDefaultDress({
        id: 'draft_' + Date.now(),
        name: 'Yangi Libos #' + (data.collection.length + 1),
        decorations: [],
        sketchDataUrl: null
      });
    }
  };
})();

