import { useEffect, useRef } from 'react';

const COLORS = ['#4A90D9', '#5CC8A0', '#B57BF7', '#E8A838', '#38bdf8', '#F07B6A'];

/* ── Helper: rounded rect without ctx.roundRect (compat) ─── */
function rRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ── Analytics canvas animation ─────────────────────── */
export function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    /* ── Bar chart groups ── */
    const charts = Array.from({ length: 8 }, () => {
      const barCount = Math.floor(Math.random() * 4) + 4; // 4–7 bars
      return {
        x:       Math.random() * W,
        y:       Math.random() * H * 0.75 + H * 0.15,
        barW:    6,
        gap:     4,
        opacity: Math.random() * 0.06 + 0.03,
        bars: Array.from({ length: barCount }, () => ({
          baseH: Math.random() * 55 + 18,
          amp:   Math.random() * 18 + 6,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.012 + 0.004,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })),
      };
    });

    /* ── Trend lines (smooth bezier) ── */
    const trends = Array.from({ length: 5 }, () => ({
      pts: Array.from({ length: 7 }, (_, i) => ({
        baseX:  (i / 6),        // 0–1 fraction of segment width
        baseY:  Math.random() * 60 + 20,
        amp:    Math.random() * 18 + 5,
        phase:  Math.random() * Math.PI * 2,
        speed:  Math.random() * 0.007 + 0.003,
      })),
      startX:  Math.random() * W * 0.65,
      startY:  Math.random() * H * 0.7 + H * 0.1,
      segW:    Math.random() * 120 + 80,   // width of the line
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.09 + 0.04,
    }));

    /* ── Floating data labels ── */
    const LABELS = [
      'SELECT *', 'GROUP BY', 'JOIN', 'AVG()', 'RANK()',
      'FROM', 'WHERE', 'pandas', 'R²=0.94', '↑ 23%',
      'WINDOW', 'CTE', 'SQL', 'Python', '94%', 'EDA',
      'LAG()', 'SUM()', 'HAVING', 'PARTITION BY',
    ];
    const floaters = Array.from({ length: 14 }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      vy:      -(Math.random() * 0.18 + 0.04),
      label:   LABELS[Math.floor(Math.random() * LABELS.length)],
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.10 + 0.04,
      size:    Math.random() * 3 + 9,
    }));

    /* ── Donut / pie arc accents ── */
    const arcs = Array.from({ length: 4 }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       Math.random() * 30 + 20,
      startA:  Math.random() * Math.PI * 2,
      sweepA:  Math.random() * Math.PI * 1.2 + 0.4,
      speed:   (Math.random() - 0.5) * 0.004,
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.06 + 0.03,
    }));

    let t = 0;
    let raf;

    function tick() {
      ctx.clearRect(0, 0, W, H);
      t += 0.5;

      /* ─ Bar charts ─ */
      for (const ch of charts) {
        const totalW = ch.bars.length * (ch.barW + ch.gap) - ch.gap;
        const baseX  = ch.x - totalW / 2;

        ch.bars.forEach((bar, i) => {
          const h   = Math.max(4, bar.baseH + bar.amp * Math.sin(t * bar.speed + bar.phase));
          const bx  = baseX + i * (ch.barW + ch.gap);
          const by  = ch.y - h;

          /* gradient: transparent bottom → color top */
          const grad = ctx.createLinearGradient(bx, ch.y, bx, by);
          grad.addColorStop(0, bar.color + '00');
          grad.addColorStop(1, bar.color);

          ctx.save();
          ctx.globalAlpha = ch.opacity;
          ctx.fillStyle   = grad;
          rRect(ctx, bx, by, ch.barW, h, 2);
          ctx.fill();

          /* subtle top glow dot */
          ctx.globalAlpha = ch.opacity * 1.4;
          ctx.beginPath();
          ctx.arc(bx + ch.barW / 2, by, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = bar.color;
          ctx.fill();
          ctx.restore();
        });

        /* baseline */
        ctx.save();
        ctx.globalAlpha = ch.opacity * 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(baseX - 2, ch.y);
        ctx.lineTo(baseX + totalW + 2, ch.y);
        ctx.stroke();
        ctx.restore();
      }

      /* ─ Trend lines ─ */
      for (const tr of trends) {
        const pts = tr.pts.map((pt, i) => ({
          x: tr.startX + pt.baseX * tr.pts.length * tr.segW / (tr.pts.length - 1),
          y: tr.startY + pt.baseY + pt.amp * Math.sin(t * pt.speed + pt.phase),
        }));

        ctx.save();
        ctx.globalAlpha = tr.opacity;
        ctx.strokeStyle = tr.color;
        ctx.lineWidth   = 1.5;
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        /* smooth bezier through points */
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();

        /* dot at last point */
        ctx.beginPath();
        ctx.arc(pts[pts.length - 1].x, pts[pts.length - 1].y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = tr.color;
        ctx.fill();
        ctx.restore();
      }

      /* ─ Floating labels ─ */
      ctx.save();
      ctx.font = `500 11px 'JetBrains Mono', 'Courier New', monospace`;
      for (const fl of floaters) {
        fl.y += fl.vy;
        if (fl.y < -20) {
          fl.y      = H + 20;
          fl.x      = Math.random() * W;
          fl.label  = LABELS[Math.floor(Math.random() * LABELS.length)];
        }
        ctx.globalAlpha = fl.opacity;
        ctx.fillStyle   = fl.color;
        ctx.fillText(fl.label, fl.x, fl.y);
      }
      ctx.restore();

      /* ─ Donut arcs ─ */
      for (const arc of arcs) {
        arc.startA += arc.speed;
        ctx.save();
        ctx.globalAlpha   = arc.opacity;
        ctx.strokeStyle   = arc.color;
        ctx.lineWidth     = 3;
        ctx.lineCap       = 'round';
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.r, arc.startA, arc.startA + arc.sweepA);
        ctx.stroke();
        /* inner thin arc */
        ctx.lineWidth   = 1;
        ctx.globalAlpha = arc.opacity * 0.4;
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.r * 0.65, arc.startA + 0.3, arc.startA + arc.sweepA - 0.3);
        ctx.stroke();
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    }

    tick();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

/* ── Ambient CSS blobs ────────────────────────────── */
export function Blobs() {
  return (
    <div className="bg-blobs">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

/* ── Combined Background ──────────────────────────── */
export default function Background() {
  return (
    <>
      <Blobs />
      <Particles />
    </>
  );
}
