/* ── NAV ── */
document.getElementById('nav-icon')?.addEventListener('click', () => {
  window.location.href = './index.html';
});
document.getElementById('nav-contact')?.addEventListener('click', () => {
  document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════
   SIGNATURE DRAW ANIMATION
   Uses SVG strokeDashoffset trick on a live
   <svg> clone so no path-parsing needed —
   100% reliable draw animation.
   ══════════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const sigLayer = document.createElement('div');
  sigLayer.id = 'intro-sig-layer';
  Object.assign(sigLayer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    pointerEvents: 'none',
  });
  document.body.appendChild(sigLayer);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { overlay.remove(); sigLayer.remove(); return; }

  /* ── hide page while animating ── */
  document.querySelectorAll('main, footer').forEach(el => {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });
  const nav = document.querySelector('nav');
  nav.style.visibility = 'hidden';

  /* ── clone the nav SVG into the overlay ── */
  const navIcon = document.getElementById('nav-icon');
  const sigSVG  = navIcon.cloneNode(true);
  sigSVG.removeAttribute('id');

  /* Size it large – centred in the overlay */
  const vw = window.innerWidth, vh = window.innerHeight;
  const svgW = 1180, svgH = 576;
  const sigScale = Math.min(vw * 0.72 / svgW, vh * 0.60 / svgH, 1.6);
  const displayW = svgW * sigScale;
  const displayH = svgH * sigScale;

  Object.assign(sigSVG.style, {
    width:  displayW + 'px',
    height: displayH + 'px',
    display: 'block',
    position: 'absolute',
    top:  '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transformOrigin: 'center center',
  });

  /* stroke colour matches new beige palette */
  sigSVG.querySelectorAll('.st0').forEach(p => {
    p.style.stroke = '#e8e0d5';
    p.style.strokeWidth = '3px';
  });

  sigLayer.appendChild(sigSVG);

  /* ── measure total path length for each path ── */
  const pathEls = Array.from(sigSVG.querySelectorAll('.st0'));

  /* Wait one frame so the SVG is in the DOM and measurable */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const lengths = pathEls.map(p => p.getTotalLength());

      /* Set every path to "invisible" via dasharray/offset */
      pathEls.forEach((p, i) => {
        const len = lengths[i];
        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        p.style.transition = 'none';
      });

      /* ── Parallel draw animation ── */
      const DRAW_MS_PER_PATH = [900, 700];   /* ms to draw each path */
      const PAUSE_AFTER_MS   = 200;
      const SHRINK_MS        = 650;

      let finishedPaths = 0;
      const totalPaths = pathEls.length;

      function onPathFinished() {
        finishedPaths += 1;
        if (finishedPaths !== totalPaths) return;
        setTimeout(shrinkToNav, PAUSE_AFTER_MS);
      }

      pathEls.forEach((p, i) => {
        const dur = DRAW_MS_PER_PATH[i] ?? 800;
        const len = lengths[i];

        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        p.style.transition = 'none';

        if (len === 0) {
          onPathFinished();
          return;
        }

        const animation = p.animate(
          [
            { strokeDashoffset: len },
            { strokeDashoffset: 0 }
          ],
          {
            duration: dur,
            easing: 'cubic-bezier(0.4,0,0.2,1)',
            fill: 'forwards'
          }
        );

        let finished = false;
        const timeoutId = setTimeout(() => {
          if (!finished) {
            finished = true;
            animation.finish?.();
            onPathFinished();
          }
        }, dur + 150);

        animation.onfinish = () => {
          if (!finished) {
            finished = true;
            clearTimeout(timeoutId);
            onPathFinished();
          }
        };
      });

      /* ── Shrink the SVG into the nav icon slot ── */
      function shrinkToNav() {
        /* briefly show nav (invisible) to measure icon position */
        nav.style.visibility = '';
        nav.style.opacity = '0';

        const iconRect   = navIcon.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();

        /* Current centre of sigSVG (it's centred via translate(-50%,-50%)) */
        const fromCX = overlayRect.left + overlayRect.width  / 2;
        const fromCY = overlayRect.top  + overlayRect.height / 2;

        /* Target: centre of the nav icon */
        const toCX = iconRect.left + iconRect.width  / 2;
        const toCY = iconRect.top  + iconRect.height / 2;

        const dx = toCX - fromCX;
        const dy = toCY - fromCY;

        /* Scale from current display size to icon size */
        const targetScaleX = iconRect.width  / displayW;
        const targetScaleY = iconRect.height / displayH;
        const finalScale   = Math.min(targetScaleX, targetScaleY);

        /* Animate via CSS transition on the element itself */
        sigSVG.style.transition = `transform ${SHRINK_MS}ms cubic-bezier(0.4,0,0.2,1)`;
        sigSVG.style.transform  =
          `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${finalScale})`;

        /* reveal page shortly after the SVG starts shrinking */
        setTimeout(revealPage, 450);
        setTimeout(() => {
          overlay.remove();
          sigLayer.remove();
        }, Math.max(SHRINK_MS, 350) + 100);
      }

      /* ── Reveal the page ── */
      function revealPage() {
        /* fade out overlay */
        overlay.style.transition = 'opacity 0.35s ease';
        overlay.style.opacity    = '0';

        /* fade in nav */
        nav.style.transition = 'opacity 0.4s ease';
        nav.style.opacity    = '1';

        /* fade in main + footer */
        document.querySelectorAll('main, footer').forEach(el => {
          el.style.transition   = 'opacity 0.5s ease';
          el.style.opacity      = '1';
          el.style.pointerEvents = 'auto';
        });

        setTimeout(() => overlay.remove(), 400);
      }
    });
  });
})();
