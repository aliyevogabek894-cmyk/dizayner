window.FQ = window.FQ || {};

FQ.dressRenderer = (() => {
  function drawMannequin(ctx) {
    ctx.save();
    // Stand pole
    const poleGrad = ctx.createLinearGradient(204, 0, 216, 0);
    poleGrad.addColorStop(0, '#a67c00');
    poleGrad.addColorStop(0.5, '#ffd166');
    poleGrad.addColorStop(1, '#a67c00');
    ctx.fillStyle = poleGrad;
    ctx.fillRect(206, 420, 8, 72);

    // Stand base
    ctx.beginPath();
    ctx.ellipse(210, 492, 54, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = poleGrad;
    ctx.fill();

    // Neck & shoulders silhouette
    ctx.fillStyle = '#f5d0c5';
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(196, 52);
    ctx.lineTo(224, 52);
    ctx.lineTo(226, 86);
    ctx.quadraticCurveTo(260, 96, 272, 118);
    ctx.lineTo(255, 190);
    ctx.lineTo(165, 190);
    ctx.lineTo(148, 118);
    ctx.quadraticCurveTo(160, 96, 194, 86);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown finial on top of mannequin neck
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(210, 46, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function traceSkirtPath(ctx, type) {
    ctx.beginPath();
    if (type === 'ballgown') {
      ctx.moveTo(168, 205);
      ctx.lineTo(252, 205);
      ctx.bezierCurveTo(310, 280, 355, 385, 345, 455);
      ctx.quadraticCurveTo(210, 478, 75, 455);
      ctx.bezierCurveTo(65, 385, 110, 280, 168, 205);
    } else if (type === 'aline') {
      ctx.moveTo(168, 205);
      ctx.lineTo(252, 205);
      ctx.lineTo(315, 448);
      ctx.quadraticCurveTo(210, 465, 105, 448);
      ctx.closePath();
    } else if (type === 'mermaid') {
      ctx.moveTo(168, 205);
      ctx.lineTo(252, 205);
      ctx.quadraticCurveTo(265, 285, 240, 340);
      ctx.quadraticCurveTo(295, 410, 315, 458);
      ctx.quadraticCurveTo(210, 475, 105, 458);
      ctx.quadraticCurveTo(125, 410, 180, 340);
      ctx.quadraticCurveTo(155, 285, 168, 205);
    } else if (type === 'mini') {
      ctx.moveTo(168, 205);
      ctx.lineTo(252, 205);
      ctx.quadraticCurveTo(295, 280, 290, 330);
      ctx.quadraticCurveTo(210, 348, 130, 330);
      ctx.quadraticCurveTo(125, 280, 168, 205);
    } else {
      // national / flowing
      ctx.moveTo(168, 205);
      ctx.lineTo(252, 205);
      ctx.lineTo(305, 452);
      ctx.lineTo(265, 458);
      ctx.lineTo(210, 448);
      ctx.lineTo(155, 458);
      ctx.lineTo(115, 452);
      ctx.closePath();
    }
  }

  function traceBodicePath(ctx, type) {
    ctx.beginPath();
    if (type === 'heart') {
      ctx.moveTo(165, 118);
      ctx.quadraticCurveTo(188, 102, 210, 126);
      ctx.quadraticCurveTo(232, 102, 255, 118);
      ctx.lineTo(252, 205);
      ctx.lineTo(168, 205);
      ctx.closePath();
    } else if (type === 'vneck') {
      ctx.moveTo(162, 106);
      ctx.lineTo(182, 102);
      ctx.lineTo(210, 152);
      ctx.lineTo(238, 102);
      ctx.lineTo(258, 106);
      ctx.lineTo(252, 205);
      ctx.lineTo(168, 205);
      ctx.closePath();
    } else if (type === 'high') {
      ctx.moveTo(188, 86);
      ctx.lineTo(232, 86);
      ctx.lineTo(262, 110);
      ctx.lineTo(252, 205);
      ctx.lineTo(168, 205);
      ctx.lineTo(158, 110);
      ctx.closePath();
    } else {
      // offshoulder
      ctx.moveTo(154, 128);
      ctx.quadraticCurveTo(210, 138, 266, 128);
      ctx.lineTo(252, 205);
      ctx.lineTo(168, 205);
      ctx.closePath();
    }
  }

  function drawSleeves(ctx, type, color, outlineOnly) {
    if (type === 'none') return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineOnly ? '#f5d0fe' : 'rgba(255, 209, 102, 0.75)';
    ctx.lineWidth = 2;

    const drawSide = (dir) => {
      ctx.beginPath();
      const sx = dir === -1 ? 162 : 258;
      if (type === 'short') {
        ctx.moveTo(sx, 106);
        ctx.quadraticCurveTo(sx + dir * 34, 118, sx + dir * 28, 160);
        ctx.lineTo(sx + dir * 4, 152);
        ctx.closePath();
      } else if (type === 'long') {
        ctx.moveTo(sx, 106);
        ctx.quadraticCurveTo(sx + dir * 44, 135, sx + dir * 46, 255);
        ctx.lineTo(sx + dir * 24, 258);
        ctx.quadraticCurveTo(sx + dir * 20, 175, sx + dir * 4, 152);
        ctx.closePath();
      } else if (type === 'puff') {
        ctx.moveTo(sx, 106);
        ctx.bezierCurveTo(sx + dir * 55, 92, sx + dir * 52, 172, sx + dir * 4, 156);
        ctx.closePath();
      }
      if (!outlineOnly) ctx.fill();
      ctx.stroke();
    };
    drawSide(-1);
    drawSide(1);
    ctx.restore();
  }

  function applyFabricAndPattern(ctx, fabric, pattern, baseColor) {
    // Fabric sheen
    if (fabric === 'silk' || fabric === 'satin') {
      const sheen = ctx.createLinearGradient(90, 120, 330, 440);
      sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
      sheen.addColorStop(0.45, 'rgba(255,255,255,0.02)');
      sheen.addColorStop(0.75, 'rgba(255,255,255,0.18)');
      sheen.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = sheen;
      ctx.fill();
    } else if (fabric === 'velvet') {
      const vel = ctx.createRadialGradient(210, 300, 20, 210, 300, 200);
      vel.addColorStop(0, 'rgba(255,255,255,0.12)');
      vel.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = vel;
      ctx.fill();
    } else if (fabric === 'sequin') {
      ctx.fillStyle = 'rgba(255, 235, 160, 0.35)';
      for (let y = 120; y < 460; y += 14) {
        for (let x = 90; x < 340; x += 14) {
          if ((x + y) % 28 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 2.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else if (fabric === 'atlas') {
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
      ctx.lineWidth = 3;
      for (let y = 130; y < 460; y += 22) {
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.bezierCurveTo(150, y - 12, 270, y + 12, 340, y);
        ctx.stroke();
      }
    }

    // Pattern overlay
    if (pattern === 'floral') {
      ctx.font = '18px serif';
      for (let y = 230; y < 445; y += 46) {
        for (let x = 115; x < 310; x += 52) {
          ctx.fillText('🌸', x + ((y % 92) ? 16 : 0), y);
        }
      }
    } else if (pattern === 'gold_embroidery') {
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.72)';
      ctx.lineWidth = 2;
      for (let x = 110; x <= 310; x += 36) {
        ctx.beginPath();
        ctx.arc(x, 440, 12, Math.PI, 0);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(175, 145);
      ctx.quadraticCurveTo(210, 175, 245, 145);
      ctx.stroke();
    } else if (pattern === 'stars') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '14px serif';
      for (let y = 140; y < 440; y += 44) {
        for (let x = 110; x < 320; x += 48) {
          ctx.fillText('✦', x + (y % 20), y);
        }
      }
    } else if (pattern === 'lace') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 1.5;
      for (let y = 120; y < 460; y += 18) {
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(340, y);
        ctx.stroke();
      }
    }
  }

  function renderDress(canvas, dress, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    const scale = Math.min(w / 420, h / 520);
    ctx.translate((w - 420 * scale) / 2, (h - 520 * scale) / 2);
    ctx.scale(scale, scale);

    if (options.showMannequin !== false) {
      drawMannequin(ctx);
    }

    const outlineOnly = !!options.outlineOnly;

    // Sleeves
    drawSleeves(ctx, dress.sleeves, dress.colors.sleeves, outlineOnly);

    // Skirt
    ctx.save();
    traceSkirtPath(ctx, dress.skirt);
    if (!outlineOnly) {
      ctx.fillStyle = dress.colors.skirt;
      ctx.fill();
      ctx.save();
      ctx.clip();
      applyFabricAndPattern(ctx, dress.fabric, dress.pattern, dress.colors.skirt);
      // Fold shadows
      ctx.strokeStyle = 'rgba(0,0,0,0.16)';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(210 + i * 14, 210);
        ctx.quadraticCurveTo(210 + i * 32, 330, 210 + i * 48, 455);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    // Bodice
    ctx.save();
    traceBodicePath(ctx, dress.bodice);
    if (!outlineOnly) {
      ctx.fillStyle = dress.colors.bodice;
      ctx.fill();
      ctx.save();
      ctx.clip();
      applyFabricAndPattern(ctx, dress.fabric, dress.pattern, dress.colors.bodice);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.restore();

    // Belt / Waist Ribbon
    ctx.save();
    ctx.fillStyle = outlineOnly ? 'transparent' : dress.colors.belt;
    ctx.strokeStyle = outlineOnly ? '#ffd166' : 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(166, 198, 88, 13, 6);
    if (!outlineOnly) ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Decorations (stickers/gems)
    if (!outlineOnly && Array.isArray(dress.decorations)) {
      ctx.save();
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      dress.decorations.forEach((d) => {
        ctx.fillText(d.icon, d.x, d.y);
      });
      ctx.restore();
    }

    // Custom freehand sketch overlay if present
    if (dress.sketchDataUrl && !options.skipSketchOverlay) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = outlineOnly ? 1 : 0.65;
        ctx.drawImage(img, 0, 0, 420, 520);
        ctx.restore();
      };
      img.src = dress.sketchDataUrl;
    }

    ctx.restore();
  }

  function toThumbnail(dress) {
    const off = document.createElement('canvas');
    off.width = 210;
    off.height = 260;
    renderDress(off, dress, { skipSketchOverlay: true });
    return off.toDataURL('image/png');
  }

  return { renderDress, toThumbnail };
})();

