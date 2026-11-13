window.FQ = window.FQ || {};

FQ.showroom = (() => {
  let scene, camera, renderer, mannequinGroup, bodiceMesh, skirtMesh, beltMesh;
  let autoRotate = true;
  let isDragging = false;
  let prevX = 0;
  let selectedId = null;
  let initialized = false;
  let threeReady = false;

  function init() {
    const col = FQ.state.get().collection;
    if (!selectedId && col.length) selectedId = col[0].id;

    if (!initialized) {
      initialized = true;
      initThree();
    }
    renderCollectionList();
    selectDress(selectedId);
  }

  function initThree() {
    const holder = document.getElementById('three-canvas-holder');
    if (!window.THREE) {
      holder.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#ffd166;">3D yuklanmoqda...</div>';
      return;
    }

    try {
      const w = holder.clientWidth || 620;
      const h = holder.clientHeight || 500;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x16072b, 0.045);

      camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(0, 2.2, 5.6);
      camera.lookAt(0, 1.5, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      holder.innerHTML = '';
      holder.appendChild(renderer.domElement);

      // Lights
      scene.add(new THREE.AmbientLight(0xf3d5ff, 0.85));
      const spot = new THREE.SpotLight(0xffd166, 2.2);
      spot.position.set(2, 7, 4);
      scene.add(spot);

      const pinkLight = new THREE.PointLight(0xff5ca8, 1.5, 12);
      pinkLight.position.set(-3, 3, 2);
      scene.add(pinkLight);

      // Marble Floor
      const floorGeo = new THREE.CircleGeometry(6, 48);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x220d3d, roughness: 0.25, metalness: 0.35 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      // Illuminated Gold Pedestal
      const pedGeo = new THREE.CylinderGeometry(1.15, 1.3, 0.28, 40);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x3b1668, roughness: 0.3, metalness: 0.6 });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.14;
      scene.add(pedestal);

      const ringGeo = new THREE.TorusGeometry(1.18, 0.035, 16, 60);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xaa7700, metalness: 0.85, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.28;
      scene.add(ring);

      // Mannequin Group
      mannequinGroup = new THREE.Group();
      mannequinGroup.position.y = 0.28;

      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 })
      );
      pole.position.y = 0.7;
      mannequinGroup.add(pole);

      // Head / Neck
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xf7d6cc, roughness: 0.5 })
      );
      head.position.y = 2.65;
      mannequinGroup.add(head);

      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.14, 6),
        new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x775500, metalness: 0.9 })
      );
      crown.position.y = 2.84;
      mannequinGroup.add(crown);

      // Dress Bodice
      bodiceMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.19, 0.65, 24),
        new THREE.MeshStandardMaterial({ color: 0x7b2cbf, roughness: 0.35, metalness: 0.2 })
      );
      bodiceMesh.position.y = 2.1;
      mannequinGroup.add(bodiceMesh);

      // Dress Belt
      beltMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.08, 24),
        new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.7, roughness: 0.25 })
      );
      beltMesh.position.y = 1.76;
      mannequinGroup.add(beltMesh);

      // Dress Skirt
      skirtMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.85, 1.55, 36, 1, false),
        new THREE.MeshStandardMaterial({ color: 0x5a189a, roughness: 0.38, metalness: 0.22 })
      );
      skirtMesh.position.y = 0.98;
      mannequinGroup.add(skirtMesh);

      scene.add(mannequinGroup);

      // Mouse / Touch drag rotation
      const dom = renderer.domElement;
      dom.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; });
      window.addEventListener('mouseup', () => { isDragging = false; });
      dom.addEventListener('mousemove', (e) => {
        if (!isDragging || !mannequinGroup) return;
        mannequinGroup.rotation.y += (e.clientX - prevX) * 0.012;
        prevX = e.clientX;
      });
      dom.addEventListener('touchstart', (e) => { isDragging = true; prevX = e.touches[0].clientX; });
      window.addEventListener('touchend', () => { isDragging = false; });
      dom.addEventListener('touchmove', (e) => {
        if (!isDragging || !mannequinGroup) return;
        mannequinGroup.rotation.y += (e.touches[0].clientX - prevX) * 0.012;
        prevX = e.touches[0].clientX;
      });

      window.addEventListener('resize', () => {
        if (!holder.clientWidth) return;
        camera.aspect = holder.clientWidth / holder.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(holder.clientWidth, holder.clientHeight);
      });

      threeReady = true;
      animate();
    } catch (err) {
      holder.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#ffd166;">3D rejim brauzerda qo‘llab-quvvatlanmadi</div>';
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate && !isDragging && mannequinGroup) {
      mannequinGroup.rotation.y += 0.008;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function updateThreeDress(dress) {
    if (!threeReady || !dress) return;
    bodiceMesh.material.color.set(dress.colors.bodice);
    skirtMesh.material.color.set(dress.colors.skirt);
    beltMesh.material.color.set(dress.colors.belt);

    const isShiny = dress.fabric === 'sequin' || dress.fabric === 'silk' || dress.fabric === 'satin';
    skirtMesh.material.metalness = isShiny ? 0.52 : 0.15;
    skirtMesh.material.roughness = isShiny ? 0.22 : 0.65;

    // Adjust skirt width based on template
    if (dress.skirt === 'ballgown') skirtMesh.scale.set(1.15, 1, 1.15);
    else if (dress.skirt === 'mermaid') skirtMesh.scale.set(0.75, 1.05, 0.75);
    else if (dress.skirt === 'mini') skirtMesh.scale.set(0.7, 0.6, 0.7);
    else skirtMesh.scale.set(0.95, 1, 0.95);
  }

  function renderCollectionList() {
    const col = FQ.state.get().collection;
    document.getElementById('col-count').textContent = col.length;
    const list = document.getElementById('collection-list');
    list.innerHTML = '';

    col.forEach((d) => {
      const card = document.createElement('div');
      card.className = 'col-item' + (d.id === selectedId ? ' active' : '');
      const thumb = FQ.dressRenderer.toThumbnail(d);
      card.innerHTML = `
        <img src="${thumb}" alt="${d.name}" />
        <div class="col-item-name">${d.name}</div>
        <div class="col-item-price">${d.sold ? '✅ Sotilgan' : `🪙 ${d.price}`}</div>
      `;
      card.onclick = () => {
        FQ.audio.click();
        selectDress(d.id);
      };
      list.appendChild(card);
    });
  }

  function selectDress(id) {
    const col = FQ.state.get().collection;
    const dress = col.find(d => d.id === id) || col[0];
    if (!dress) return;
    selectedId = dress.id;
    document.getElementById('showroom-active-name').textContent = dress.name;
    document.getElementById('showroom-active-price').textContent = dress.sold
      ? '✅ Butikda sotilgan'
      : `Narxi: ${dress.price} 🪙`;
    const sellBtn = document.getElementById('btn-sell-dress');
    sellBtn.disabled = !!dress.sold;
    sellBtn.style.opacity = dress.sold ? '0.5' : '1';

    updateThreeDress(dress);
    renderCollectionList();
  }

  return {
    init,
    toggleRotate() {
      autoRotate = !autoRotate;
      FQ.audio.click();
    },
    sellSelected() {
      const data = FQ.state.get();
      const dress = data.collection.find(d => d.id === selectedId);
      if (!dress || dress.sold) return;
      dress.sold = true;
      data.missionProgress.sold += 1;
      FQ.state.addCoins(dress.price);
      FQ.state.addXp(50);
      FQ.state.save();
      FQ.audio.coin();
      FQ.toast(`💰 "${dress.name}" ${dress.price} tangaga sotildi!`);
      selectDress(dress.id);
    },
    featureSelected() {
      const data = FQ.state.get();
      data.featuredDressId = selectedId;
      FQ.state.save();
      FQ.audio.sparkle();
      FQ.toast('⭐ Libos Bosh sahifadagi saroy oynasiga qo‘yildi!');
    }
  };
})();

