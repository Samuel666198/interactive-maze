(function () {
  function getDistance(a, b, grid) {
    return Math.abs(Math.floor(a / grid) - Math.floor(b / grid)) + Math.abs((a % grid) - (b % grid));
  }

  function getNeighbors(pos, grid) {
    const row = Math.floor(pos / grid);
    const col = pos % grid;
    const neighbors = [];
    if (row > 0) neighbors.push((row - 1) * grid + col);
    if (row < grid - 1) neighbors.push((row + 1) * grid + col);
    if (col > 0) neighbors.push(row * grid + col - 1);
    if (col < grid - 1) neighbors.push(row * grid + col + 1);
    return neighbors;
  }

  function shuffleList(list) {
    const shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return shuffled;
  }

  function buildDirectPath(from, to, grid) {
    const path = [from];
    let row = Math.floor(from / grid);
    let col = from % grid;
    const endRow = Math.floor(to / grid);
    const endCol = to % grid;
    const colStep = endCol >= col ? 1 : -1;
    while (col !== endCol) {
      col += colStep;
      path.push(row * grid + col);
    }
    const rowStep = endRow >= row ? 1 : -1;
    while (row !== endRow) {
      row += rowStep;
      path.push(row * grid + col);
    }
    return path;
  }

  function findRandomPath(to, path, visited, maxLength, grid) {
    const current = path[path.length - 1];
    if (current === to) return path.slice();
    if (path.length >= maxLength) return null;

    const orderedNeighbors = shuffleList(getNeighbors(current, grid))
      .filter(next => !visited.has(next))
      .filter(next => path.length + getDistance(next, to, grid) <= maxLength)
      .sort((a, b) => {
        const da = getDistance(a, to, grid);
        const db = getDistance(b, to, grid);
        return (da + Math.random() * 2.4) - (db + Math.random() * 2.4);
      });

    for (const next of orderedNeighbors) {
      path.push(next);
      visited.add(next);
      const result = findRandomPath(to, path, visited, maxLength, grid);
      if (result) return result;
      visited.delete(next);
      path.pop();
    }

    return null;
  }

  function buildMazePath(from, to, grid) {
    const shortestLength = getDistance(from, to, grid) + 1;
    const maxLength = Math.min(grid * grid, Math.max(10, shortestLength + 6 + Math.floor(Math.random() * 8)));

    for (let attempt = 0; attempt < 80; attempt++) {
      const path = [from];
      const visited = new Set(path);
      const result = findRandomPath(to, path, visited, maxLength, grid);
      if (result) return result;
    }

    return buildDirectPath(from, to, grid);
  }

  function buildTerrainEntries(grid) {
    const entries = [];
    for (let idx = 0; idx < grid * grid; idx++) {
      const seed = (idx * 37 + Math.floor(idx / grid) * 11) % 19;
      if (seed === 0) entries.push([idx, 'chest']);
      else if (seed === 3 || seed === 9) entries.push([idx, 'grass']);
      else if (seed === 6 || seed === 14) entries.push([idx, 'stone']);
      else if (seed === 12) entries.push([idx, 'block']);
    }
    return entries;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function drawTerrain(ctx, x, y, type, onPath, cell) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = onPath ? 0.72 : 0.58;
    if (type === 'grass') {
      ctx.strokeStyle = '#6f9b6c';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        const ox = 12 + i * 7;
        ctx.beginPath();
        ctx.moveTo(ox, cell - 12);
        ctx.quadraticCurveTo(ox - 4, cell - 20, ox + 3, cell - 27);
        ctx.stroke();
      }
    } else if (type === 'stone') {
      ctx.fillStyle = '#a7a093';
      ctx.strokeStyle = 'rgba(86,76,62,0.22)';
      ctx.beginPath();
      roundedRect(ctx, 12, 12, 19, 14, 5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      roundedRect(ctx, 24, 25, 12, 9, 4);
      ctx.fill();
    } else if (type === 'chest') {
      ctx.fillStyle = '#b97954';
      ctx.strokeStyle = 'rgba(89,55,32,0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      roundedRect(ctx, 12, 18, 22, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d6a24d';
      ctx.fillRect(21, 18, 4, 16);
      ctx.fillRect(13, 24, 20, 3);
    } else if (type === 'block') {
      ctx.fillStyle = '#9b8668';
      ctx.strokeStyle = 'rgba(75,58,38,0.22)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      roundedRect(ctx, 11, 12, 24, 22, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(15, 19);
      ctx.lineTo(31, 19);
      ctx.moveTo(18, 27);
      ctx.lineTo(29, 27);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMarker(ctx, cx, cy, color, text) {
    ctx.fillStyle = 'rgba(57,43,28,0.16)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 15, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 1);
  }

  function renderBase(width, height, grid, startPos, endPos, path, terrainEntries) {
    if (typeof OffscreenCanvas === 'undefined') return null;
    const cell = width / grid;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;
    const pathSet = new Set(path);
    const terrain = new Map(terrainEntries);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7efd9';
    ctx.fillRect(0, 0, width, height);
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const idx = row * grid + col;
        const x = col * cell;
        const y = row * cell;
        const onPath = pathSet.has(idx);
        const grad = ctx.createLinearGradient(x, y, x + cell, y + cell);
        if (onPath) {
          grad.addColorStop(0, '#eef3df');
          grad.addColorStop(1, '#dfe9ce');
        } else {
          grad.addColorStop(0, '#dccfbb');
          grad.addColorStop(1, '#cfc1ac');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        ctx.fillStyle = onPath ? 'rgba(255,255,255,0.16)' : 'rgba(78,60,38,0.04)';
        ctx.fillRect(x + 5, y + 5, cell - 10, 2);
        ctx.strokeStyle = onPath ? 'rgba(86,118,78,0.26)' : 'rgba(103,87,63,0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
        if (idx !== startPos && idx !== endPos && terrain.has(idx)) {
          drawTerrain(ctx, x, y, terrain.get(idx), onPath, cell);
        }
      }
    }

    ctx.strokeStyle = 'rgba(91, 117, 78, 0.28)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      ctx.moveTo((prev % grid) * cell + cell / 2, Math.floor(prev / grid) * cell + cell / 2);
      ctx.lineTo((curr % grid) * cell + cell / 2, Math.floor(curr / grid) * cell + cell / 2);
    }
    ctx.stroke();

    ctx.strokeStyle = '#7d9b66';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      ctx.moveTo((prev % grid) * cell + cell / 2, Math.floor(prev / grid) * cell + cell / 2);
      ctx.lineTo((curr % grid) * cell + cell / 2, Math.floor(curr / grid) * cell + cell / 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const startX = (path[0] % grid) * cell;
    const startY = Math.floor(path[0] / grid) * cell;
    const endX = (path[path.length - 1] % grid) * cell;
    const endY = Math.floor(path[path.length - 1] / grid) * cell;
    drawMarker(ctx, startX + cell / 2, startY + cell / 2, '#668d66', '起');
    drawMarker(ctx, endX + cell / 2, endY + cell / 2, '#b47d3a', '终');

    return canvas.transferToImageBitmap();
  }

  self.onmessage = function (event) {
    const data = event.data || {};
    if (data.type !== 'renderMaze') return;
    try {
      const grid = data.grid || 8;
      const path = buildMazePath(data.startPos, data.endPos, grid);
      const terrainEntries = buildTerrainEntries(grid);
      const bitmap = renderBase(data.width, data.height, grid, data.startPos, data.endPos, path, terrainEntries);
      const payload = {
        type: 'mazeReady',
        requestId: data.requestId,
        path,
        terrainEntries,
        hasBitmap: !!bitmap
      };
      if (bitmap) {
        payload.bitmap = bitmap;
        self.postMessage(payload, [bitmap]);
      } else {
        self.postMessage(payload);
      }
    } catch (error) {
      self.postMessage({
        type: 'mazeError',
        requestId: data.requestId,
        message: error && error.message ? error.message : String(error)
      });
    }
  };
})();
