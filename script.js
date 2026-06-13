/* ── NAV ── */
document.getElementById('nav-icon')?.addEventListener('click', () => {
  window.location.href = './index.html';
});
document.getElementById('nav-contact')?.addEventListener('click', () => {
  document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════
   SIGNATURE DRAW ANIMATION
   Draws SVG paths on a canvas then shrinks
   the canvas into the nav-icon position.
   ══════════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* SVG path data from original nav icon */
  const paths = [
    "M678.25,55.89c-5.52-.18-13.44-.02-22.72,1.64-32.29,5.76-53.26,24.68-62.94,33.65-16.64,15.41-51.71,47.88-48.69,96.02,3.16,50.36,45.59,79.57,51.54,83.53,20.12,12.01,34.53,24.53,43.96,33.78,13.56,13.3,21.3,21.08,25.44,34.53,6.05,19.64-.05,36.78-1.56,40.72-7.21,18.81-21.94,28.92-34.55,37.34-62.07,41.44-105.48,64.59-105.48,64.59-58.63,31.27-75.09,39.41-79.41,34.37-3.86-4.51,3.89-17.31,11.54-28.66,46.72-69.3,113.95-120.27,181.05-170.45,28.9-21.61,43.35-32.42,43.85-32.79,129.03-95.81,193.55-143.72,247.7-181.73,29.06-20.4,67.76-47.14,65.19-51.56-.97-1.67-7.61.3-14.81,2.96-334.94,123.95-648.89,327.7-648.89,327.7-34.39,22.32-81.74,53.24-138.07,90.67",
    "M383.4,247.91s-9.54.73-13.4,7.65c-5.52,9.9,5.67,25.86,10.29,32.44,9.03,12.86,14.08,12.36,16.44,21.24,2.73,10.23.83,25.32-7.72,28.5-4.99,1.86-12.3-.32-14.5-4.94-2.83-5.95,3.69-14.11,8.54-17.78,12.7-9.6,31.47-1.26,33.24-.44,2.04-.23,5.79-.93,9.33-3.56,7.06-5.23,10.38-15.89,6.67-23.02-.45-.86-2.53-4.86-6.22-5.44-5.3-.83-10.13,6-12,10.23-.81,1.84-4.01,9.08,0,15.11,1.45,2.18,4.61,5.36,7.93,5.18,5.63-.3,11.15-10.19,12.51-25.09-.05.48-.73,7.44,4.44,11.46,2.66,2.07,5.56,2.35,6.83,2.4,2-.94,4.96-2.62,7.84-5.51,1.79-1.79,6.29-6.31,7.11-12.51,1.01-7.65-4.62-9.95-3.11-15.94,1.51-6,8.98-10.91,13.33-9.33,3.24,1.17,4.65,5.89,6.22,11.11,1.59,5.28,1.4,8.37,2.22,8.44,1.46.14,2.38-9.56,8.44-20.89,2.54-4.75,5.14-9.59,8-9.33,3.24.29,3.51,6.81,10.67,14.67,3,3.29,5.23,5.75,7.47,5.3,2.53-.5,3.77-4.47,7.2-19.97,3.14-14.25,4-19.5,6.67-20,2.74-.5,3.86,4.64,10.67,8,1.79.89,7.24,3.55,12.89,1.78,7.93-2.49,11.22-12.13,11.02-18.6-.06-1.89-.16-5.31-2.58-7.18-2.49-1.93-6.6-1.56-8.89-.03-6.96,4.65-6.51,26.17,3.56,31.58,11.17,6.01,27.78-11.27,28.89-12.44,8.55-9.07,10.87-19.37,12.04-24.89,4.84-22.77-3.03-46.79-7.59-46.67-3.16.08-5.95,11.76-5.33,20.89.2,2.91.98,14.51,9.84,21.78,1.45,1.19,4.32,3.49,8.72,4.4,7.58,1.57,13.75-2.19,15.38-3.25,4.96-3.8,9.94-7.59,14.95-11.37,8.18-6.18,38.3-31.44,129.33-91.56"
  ];

  const SVG_W = 1180, SVG_H = 576;

  /* Parse SVG path into array of canvas draw commands */
  function parsePath(d) {
    const cmds = [];
    const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g) || [];
    let i = 0, cmd = '';
    while (i < tokens.length) {
      if (/[MmLlHhVvCcSsQqTtAaZz]/.test(tokens[i])) {
        cmd = tokens[i++];
      }
      switch (cmd) {
        case 'M': cmds.push({ t: 'M', x: +tokens[i++], y: +tokens[i++] }); cmd = 'L'; break;
        case 'L': cmds.push({ t: 'L', x: +tokens[i++], y: +tokens[i++] }); break;
        case 'C': cmds.push({ t: 'C', x1:+tokens[i++],y1:+tokens[i++],x2:+tokens[i++],y2:+tokens[i++],x:+tokens[i++],y:+tokens[i++] }); break;
        case 'S': cmds.push({ t: 'S', x2:+tokens[i++],y2:+tokens[i++],x:+tokens[i++],y:+tokens[i++] }); break;
        case 'Q': cmds.push({ t: 'Q', x1:+tokens[i++],y1:+tokens[i++],x:+tokens[i++],y:+tokens[i++] }); break;
        default: i++;
      }
    }
    return cmds;
  }

  /* Flatten a parsed path to polyline points (rough but fast) */
  function flatten(cmds, steps = 60) {
    const pts = [];
    let cx = 0, cy = 0;
    for (const c of cmds) {
      if (c.t === 'M') { cx = c.x; cy = c.y; pts.push([cx,cy]); }
      else if (c.t === 'L') { cx = c.x; cy = c.y; pts.push([cx,cy]); }
      else if (c.t === 'C') {
        for (let s = 1; s <= steps; s++) {
          const t = s/steps;
          const mt = 1-t;
          const x = mt*mt*mt*cx + 3*mt*mt*t*c.x1 + 3*mt*t*t*c.x2 + t*t*t*c.x;
          const y = mt*mt*mt*cy + 3*mt*mt*t*c.y1 + 3*mt*t*t*c.y2 + t*t*t*c.y;
          pts.push([x,y]);
        }
        cx = c.x; cy = c.y;
      } else if (c.t === 'S') {
        for (let s = 1; s <= steps; s++) {
          const t = s/steps;
          const mt = 1-t;
          const x = mt*mt*mt*cx + 3*mt*mt*t*cx + 3*mt*t*t*c.x2 + t*t*t*c.x;
          const y = mt*mt*mt*cy + 3*mt*mt*t*cy + 3*mt*t*t*c.y2 + t*t*t*c.y;
          pts.push([x,y]);
        }
        cx = c.x; cy = c.y;
      } else if (c.t === 'Q') {
        for (let s = 1; s <= steps; s++) {
          const t = s/steps;
          const mt = 1-t;
          const x = mt*mt*cx + 2*mt*t*c.x1 + t*t*c.x;
          const y = mt*mt*cy + 2*mt*t*c.y1 + t*t*c.y;
          pts.push([x,y]);
        }
        cx = c.x; cy = c.y;
      }
    }
    return pts;
  }

  const allPts = paths.map(d => flatten(parsePath(d)));

  /* Build canvas */
  const canvas = document.getElementById('sig-canvas');
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.min(window.innerWidth * 0.65 / SVG_W, window.innerHeight * 0.55 / SVG_H, 1.5);
  const cw = SVG_W * scale, ch = SVG_H * scale;
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#f5f2ee';

  function drawUpTo(pathIdx, ptIdx) {
    ctx.clearRect(0, 0, cw, ch);
    for (let p = 0; p < pathIdx; p++) {
      const pts = allPts[p];
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const [x,y] = pts[i];
        if (i === 0) ctx.moveTo(x*scale, y*scale);
        else ctx.lineTo(x*scale, y*scale);
      }
      ctx.stroke();
    }
    const pts = allPts[pathIdx];
    if (pts && ptIdx > 0) {
      ctx.beginPath();
      for (let i = 0; i < Math.min(ptIdx, pts.length); i++) {
        const [x,y] = pts[i];
        if (i === 0) ctx.moveTo(x*scale, y*scale);
        else ctx.lineTo(x*scale, y*scale);
      }
      ctx.stroke();
    }
  }

  function revealPage() {
    document.body.querySelectorAll('main, footer, nav').forEach(el => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease';
    });
    document.querySelector('nav').style.display = '';
    
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.querySelectorAll('main, footer, nav').forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
    }, 400);
  }

  if (prefersReduced) {
    overlay.remove();
    return;
  }

  /* Hide page content during animation */
  document.querySelectorAll('main, footer').forEach(el => {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });
  document.querySelector('nav').style.display = 'none';

  /* Animate drawing */
  const totalPts = allPts.reduce((s,p) => s + p.length, 0);
  const drawDuration = 1600;
  let startTime = null;

  function animDraw(ts) {
    if (!startTime) startTime = ts;
    const pct = Math.min((ts - startTime) / drawDuration, 1);
    const globalIdx = Math.floor(pct * totalPts);
    let acc = 0;
    for (let p = 0; p < allPts.length; p++) {
      const len = allPts[p].length;
      if (globalIdx <= acc + len) {
        drawUpTo(p, globalIdx - acc);
        break;
      }
      acc += len;
    }
    if (pct < 1) {
      requestAnimationFrame(animDraw);
    } else {
      drawUpTo(allPts.length - 1, allPts[allPts.length - 1].length);
      /* Pause then shrink into nav icon */
      setTimeout(shrinkToNav, 800);
    }
  }

  function shrinkToNav() {
    const navIcon = document.getElementById('nav-icon');
    /* Temporarily show nav to measure position */
    document.querySelector('nav').style.display = '';
    document.querySelector('nav').style.opacity = '0';
    const iconRect = navIcon.getBoundingClientRect();
    document.querySelector('nav').style.display = 'none';

    const canvasRect = canvas.getBoundingClientRect();
    const targetScale = iconRect.width / cw;
    const targetX = iconRect.left + iconRect.width/2 - (canvasRect.left + cw/2);
    const targetY = iconRect.top + iconRect.height/2 - (canvasRect.top + ch/2);

    canvas.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.5s';
    canvas.style.transformOrigin = 'center center';
    canvas.style.transform = `translate(${targetX}px,${targetY}px) scale(${targetScale})`;

    setTimeout(() => {
      document.querySelector('nav').style.display = '';
      document.querySelector('nav').style.opacity = '';
      revealPage();
    }, 750);
  }

  requestAnimationFrame(animDraw);
})();
