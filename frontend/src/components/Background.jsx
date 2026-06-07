import { useEffect, useRef } from 'react';

const COLORS = ['#4A90D9', '#5CC8A0', '#B57BF7', '#E8A838', '#38bdf8', '#F07B6A', '#a78bfa', '#34d399', '#fb923c'];

function rRect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  if (h < 0) { y += h; h = -h; }
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

    const rc = () => COLORS[Math.floor(Math.random() * COLORS.length)];
    const rn = (a, b) => Math.random() * (b - a) + a;

    /* ── 1. BAR CHART GROUPS (18) ────────────────────── */
    const charts = Array.from({ length: 18 }, () => {
      const barCount = Math.floor(rn(4, 9));
      const scale    = rn(0.7, 1.6);
      return {
        x:       rn(0, W),
        y:       rn(H * 0.1, H * 0.88),
        barW:    Math.floor(rn(4, 9)) * scale,
        gap:     Math.floor(rn(3, 6)),
        opacity: rn(0.02, 0.06),
        scale,
        bars: Array.from({ length: barCount }, () => ({
          baseH: rn(20, 70) * scale,
          amp:   rn(8, 25)  * scale,
          phase: rn(0, Math.PI * 2),
          speed: rn(0.004, 0.016),
          color: rc(),
        })),
      };
    });

    /* ── 2. LINE / AREA CHARTS (10) ──────────────────── */
    const trends = Array.from({ length: 10 }, () => ({
      pts: Array.from({ length: 8 }, (_, i) => ({
        baseX: i / 7,
        baseY: rn(20, 70),
        amp:   rn(8, 28),
        phase: rn(0, Math.PI * 2),
        speed: rn(0.003, 0.009),
      })),
      startX:  rn(-40, W * 0.75),
      startY:  rn(H * 0.05, H * 0.88),
      segW:    rn(100, 200),
      color:   rc(),
      opacity: rn(0.02, 0.04),
      filled:  Math.random() > 0.5, // area fill under line
    }));

    /* ── 3. SCATTER PLOT CLUSTERS (7) ────────────────── */
    const scatters = Array.from({ length: 7 }, () => ({
      cx:      rn(50, W - 50),
      cy:      rn(50, H - 50),
      pts: Array.from({ length: Math.floor(rn(8, 18)) }, () => ({
        ox: rn(-50, 50),
        oy: rn(-50, 50),
        r:  rn(1.5, 4),
        phase: rn(0, Math.PI * 2),
        amp:   rn(3, 10),
        speed: rn(0.005, 0.015),
        color: rc(),
      })),
      opacity: rn(0.02, 0.04),
    }));

    /* ── 4. DONUT / PIE ARCS (8) ─────────────────────── */
    const arcs = Array.from({ length: 8 }, () => ({
      x:       rn(30, W - 30),
      y:       rn(30, H - 30),
      r:       rn(18, 45),
      startA:  rn(0, Math.PI * 2),
      sweepA:  rn(0.5, Math.PI * 1.5),
      speed:   rn(-0.005, 0.005) || 0.003,
      color:   rc(),
      opacity: rn(0.02, 0.05),
    }));

    /* ── 5. SPARKLINES (8) ───────────────────────────── */
    const sparklines = Array.from({ length: 8 }, () => ({
      x:       rn(0, W - 120),
      y:       rn(20, H - 20),
      pts: Array.from({ length: 10 }, (_, i) => ({
        baseX: i * 13,
        val:   rn(10, 40),
        phase: rn(0, Math.PI * 2),
        amp:   rn(4, 12),
        speed: rn(0.004, 0.012),
      })),
      color:   rc(),
      opacity: rn(0.02, 0.04),
    }));

    /* ── 6. FLOATING DATA LABELS (32) ───────────────── */
    const SQL_LABELS = [
      // SQL
      'SELECT *', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
      'JOIN', 'LEFT JOIN', 'INNER JOIN', 'UNION', 'WITH', 'AS',
      'RANK()', 'ROW_NUMBER()', 'LAG()', 'LEAD()', 'NTILE()',
      'AVG()', 'SUM()', 'COUNT()', 'MAX()', 'MIN()',
      'PARTITION BY', 'OVER()', 'CTE', 'SUBQUERY',
      'INDEX', 'VIEW', 'PROCEDURE', 'TRIGGER', 'CASE WHEN',
      // Python / Data
      'pandas', 'numpy', 'matplotlib', 'seaborn', 'sklearn',
      'df.groupby()', '.merge()', '.pivot()', 'dropna()',
      'value_counts()', 'describe()', 'corr()', 'fillna()',
      'read_csv()', 'to_sql()', 'DataFrame', 'Series',
      // Analytics terms
      'R² = 0.94', '↑ 23.4%', '↓ 8.1%', 'p < 0.05',
      'MAPE', 'RMSE', 'MAE', 'F1-Score', 'AUC-ROC',
      'KPI', 'OKR', 'GMV', 'DAU', 'MAU', 'LTV',
      'Cohort', 'Funnel', 'A/B Test', 'Churn', 'Retention',
      'EDA', 'ETL', 'dbt', 'Airflow', 'Snowflake',
      '94%', '₹6.8L', '+12%', '3.2x', 'σ = 1.4',
    ];

    const floaters = Array.from({ length: 32 }, () => ({
      x:       rn(0, W),
      y:       rn(-H, H),
      vy:      -(rn(0.08, 0.28)),
      label:   SQL_LABELS[Math.floor(Math.random() * SQL_LABELS.length)],
      color:   rc(),
      opacity: rn(0.02, 0.04),
      size:    rn(9, 13),
    }));

    /* ── 7. GRID / TABLE OUTLINES (5) ───────────────── */
    const grids = Array.from({ length: 5 }, () => ({
      x:       rn(20, W - 120),
      y:       rn(20, H - 80),
      cols:    Math.floor(rn(3, 6)),
      rows:    Math.floor(rn(3, 5)),
      cw:      rn(22, 35),
      rh:      rn(12, 18),
      color:   rc(),
      opacity: rn(0.02, 0.04),
    }));

    let t = 0;
    let raf;

    function tick() {
      ctx.clearRect(0, 0, W, H);
      t += 0.5;

      /* ── Bar charts ── */
      for (const ch of charts) {
        const totalW = ch.bars.length * (ch.barW + ch.gap) - ch.gap;
        const baseX  = ch.x - totalW / 2;
        ctx.save();
        ch.bars.forEach((bar, i) => {
          const h  = Math.max(3, bar.baseH + bar.amp * Math.sin(t * bar.speed + bar.phase));
          const bx = baseX + i * (ch.barW + ch.gap);
          const by = ch.y - h;
          const grad = ctx.createLinearGradient(bx, ch.y, bx, by);
          grad.addColorStop(0, bar.color + '00');
          grad.addColorStop(1, bar.color);
          ctx.globalAlpha = ch.opacity;
          ctx.fillStyle   = grad;
          rRect(ctx, bx, by, ch.barW, h, 2);
          ctx.fill();
          // top dot
          ctx.globalAlpha = ch.opacity * 1.6;
          ctx.beginPath();
          ctx.arc(bx + ch.barW / 2, by, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = bar.color;
          ctx.fill();
        });
        // baseline
        ctx.globalAlpha = ch.opacity * 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(baseX - 2, ch.y);
        ctx.lineTo(baseX + totalW + 2, ch.y);
        ctx.stroke();
        ctx.restore();
      }

      /* ── Trend / area lines ── */
      for (const tr of trends) {
        const pts = tr.pts.map(pt => ({
          x: tr.startX + pt.baseX * tr.segW * tr.pts.length,
          y: tr.startY + pt.baseY + pt.amp * Math.sin(t * pt.speed + pt.phase),
        }));

        ctx.save();
        ctx.globalAlpha = tr.opacity;
        ctx.strokeStyle = tr.color;
        ctx.lineWidth   = 1.4;
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();

        // optional area fill
        if (tr.filled) {
          ctx.lineTo(pts[pts.length - 1].x, tr.startY + 80);
          ctx.lineTo(pts[0].x, tr.startY + 80);
          ctx.closePath();
          const areaGrad = ctx.createLinearGradient(0, tr.startY, 0, tr.startY + 80);
          areaGrad.addColorStop(0, tr.color + '30');
          areaGrad.addColorStop(1, tr.color + '00');
          ctx.fillStyle   = areaGrad;
          ctx.globalAlpha = tr.opacity * 0.6;
          ctx.fill();
        }

        // end dot
        ctx.globalAlpha = tr.opacity * 1.8;
        ctx.beginPath();
        ctx.arc(pts[pts.length - 1].x, pts[pts.length - 1].y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = tr.color;
        ctx.fill();
        ctx.restore();
      }

      /* ── Scatter plots ── */
      for (const sc of scatters) {
        ctx.save();
        ctx.globalAlpha = sc.opacity;
        for (const pt of sc.pts) {
          const px = sc.cx + pt.ox + pt.amp * Math.sin(t * pt.speed + pt.phase);
          const py = sc.cy + pt.oy + pt.amp * Math.cos(t * pt.speed + pt.phase + 1);
          ctx.beginPath();
          ctx.arc(px, py, pt.r, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
          // subtle ring
          ctx.globalAlpha = sc.opacity * 0.4;
          ctx.strokeStyle = pt.color;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.arc(px, py, pt.r + 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = sc.opacity;
        }
        ctx.restore();
      }

      /* ── Donut arcs ── */
      for (const arc of arcs) {
        arc.startA += arc.speed;
        ctx.save();
        ctx.globalAlpha = arc.opacity;
        ctx.strokeStyle = arc.color;
        ctx.lineWidth   = 3;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.r, arc.startA, arc.startA + arc.sweepA);
        ctx.stroke();
        ctx.lineWidth   = 1;
        ctx.globalAlpha = arc.opacity * 0.45;
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.r * 0.62, arc.startA + 0.2, arc.startA + arc.sweepA - 0.2);
        ctx.stroke();
        ctx.restore();
      }

      /* ── Sparklines ── */
      for (const sp of sparklines) {
        ctx.save();
        ctx.globalAlpha = sp.opacity;
        ctx.strokeStyle = sp.color;
        ctx.lineWidth   = 1.2;
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        sp.pts.forEach((pt, i) => {
          const y = sp.y + pt.val + pt.amp * Math.sin(t * pt.speed + pt.phase);
          if (i === 0) ctx.moveTo(sp.x + pt.baseX, y);
          else         ctx.lineTo(sp.x + pt.baseX, y);
        });
        ctx.stroke();
        ctx.restore();
      }

      /* ── Floating labels ── */
      ctx.save();
      for (const fl of floaters) {
        fl.y += fl.vy;
        if (fl.y < -24) {
          fl.y     = H + 20;
          fl.x     = rn(0, W);
          fl.label = SQL_LABELS[Math.floor(Math.random() * SQL_LABELS.length)];
        }
        ctx.globalAlpha = fl.opacity;
        ctx.fillStyle   = fl.color;
        ctx.font        = `500 ${fl.size}px 'JetBrains Mono', 'Courier New', monospace`;
        ctx.fillText(fl.label, fl.x, fl.y);
      }
      ctx.restore();

      /* ── Grid / table outlines ── */
      for (const g of grids) {
        ctx.save();
        ctx.globalAlpha = g.opacity;
        ctx.strokeStyle = g.color;
        ctx.lineWidth   = 0.6;
        for (let r = 0; r <= g.rows; r++) {
          ctx.beginPath();
          ctx.moveTo(g.x,                  g.y + r * g.rh);
          ctx.lineTo(g.x + g.cols * g.cw,  g.y + r * g.rh);
          ctx.stroke();
        }
        for (let c = 0; c <= g.cols; c++) {
          ctx.beginPath();
          ctx.moveTo(g.x + c * g.cw, g.y);
          ctx.lineTo(g.x + c * g.cw, g.y + g.rows * g.rh);
          ctx.stroke();
        }
        // header row highlight
        ctx.globalAlpha = g.opacity * 0.8;
        ctx.fillStyle   = g.color;
        rRect(ctx, g.x, g.y, g.cols * g.cw, g.rh, 1);
        ctx.fill();
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

/* ── Ambient CSS blobs ──────────────────────────── */
export function Blobs() {
  return (
    <div className="bg-blobs">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

export default function Background() {
  return (
    <>
      <Blobs />
      <Particles />
    </>
  );
}
