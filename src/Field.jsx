import React, { useEffect, useRef } from "react";

/* Interactive background: a drifting network of nodes.
   - Nodes link up when close, like a little neural net.
   - Move the cursor: nearby nodes scatter and connect to it.
   - Click or tap anywhere: a ripple, a burst of confetti and new nodes.
   Colors come from CSS tokens on the parent (--field-node, --field-hot),
   so it follows the light/dark theme and the dark "lab" band. */

const GLYPHS = ["{ }", "</>", "AI", "0 1", "λ", "→", "∑"];

function toRgb(c) {
  c = (c || "").trim();
  if (c.startsWith("#")) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = c.match(/\d+(\.\d+)?/g);
  return m ? m.slice(0, 3).map(Number) : [43, 69, 230];
}
const rgba = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

export default function Field({ className = "", density = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1, raf = 0, t = 0, frame = 0;
    let running = false, onScreen = true;
    let nodes = [], bits = [], rings = [];
    let col = { node: [43, 69, 230], hot: [43, 69, 230], confetti: [[43, 69, 230]] };
    const mouse = { x: -9999, y: -9999, on: false };

    const readColors = () => {
      const cs = getComputedStyle(canvas.parentElement || document.documentElement);
      const g = (n) => cs.getPropertyValue(n).trim();
      col = {
        node: toRgb(g("--field-node") || g("--accent")),
        hot: toRgb(g("--field-hot") || g("--accent")),
        alpha: parseFloat(g("--field-alpha")) || 0.5,
        confetti: [g("--accent"), g("--highlight"), g("--field-hot"), g("--field-mint")].filter(Boolean).map(toRgb),
      };
    };

    const target = () => Math.max(22, Math.min(110, Math.round(((w * h) / 15000) * density)));
    const makeNode = (x, y) => {
      const a = Math.random() * Math.PI * 2;
      const s = 0.15 + Math.random() * 0.35;
      return { x: x ?? Math.random() * w, y: y ?? Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.2 + Math.random() * 2.2, ph: Math.random() * 6.28, extra: x != null };
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = target();
      nodes = nodes.filter((p) => p.x <= w + 20 && p.y <= h + 20);
      while (nodes.length < n) nodes.push(makeNode());
      if (nodes.length > n + 30) nodes.length = n + 30;
      if (!running) draw();
    };

    const burst = (x, y) => {
      rings.push({ x, y, r: 4, life: 1 });
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 5;
        const kind = Math.random();
        bits.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2.5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
          size: 4 + Math.random() * 6, life: 1,
          shape: kind < 0.3 ? "circle" : kind < 0.55 ? "square" : kind < 0.8 ? "tri" : "glyph",
          glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
          color: col.confetti[(Math.random() * col.confetti.length) | 0],
        });
      }
      for (let i = 0; i < 3; i++) nodes.push(makeNode(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40));
      const cap = target() + 30;
      if (nodes.length > cap) {
        const idx = nodes.findIndex((p) => p.extra);
        nodes.splice(idx >= 0 ? idx : 0, nodes.length - cap);
      }
    };

    const LINK = 130, REACH = 170;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const a0 = col.alpha;

      // cursor glow
      if (mouse.on) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        g.addColorStop(0, rgba(col.hot, 0.16 * a0 * 2));
        g.addColorStop(1, rgba(col.hot, 0));
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 150, mouse.y - 150, 300, 300);
      }

      // links between nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const d = Math.sqrt(d2);
            ctx.strokeStyle = rgba(col.node, (1 - d / LINK) * 0.5 * a0);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // links to the cursor + nodes
      for (const p of nodes) {
        let near = 0;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < REACH) {
            near = 1 - d / REACH;
            ctx.strokeStyle = rgba(col.hot, near * 0.9 * a0 * 1.6);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        const r = p.r + Math.sin(t * 0.03 + p.ph) * 0.6 + near * 2.2;
        ctx.fillStyle = near > 0 ? rgba(col.hot, 0.6 + near * 0.4) : rgba(col.node, 0.75 * a0 * 1.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
      }

      // ripples
      for (const g of rings) {
        ctx.strokeStyle = rgba(col.hot, g.life * 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // confetti
      for (const b of bits) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, b.life * 1.4));
        ctx.fillStyle = rgba(b.color, 1);
        const s = b.size;
        if (b.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.shape === "square") {
          ctx.fillRect(-s / 2, -s / 2, s, s);
        } else if (b.shape === "tri") {
          ctx.beginPath();
          ctx.moveTo(0, -s / 1.6);
          ctx.lineTo(s / 1.6, s / 2);
          ctx.lineTo(-s / 1.6, s / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.font = `600 ${Math.round(s * 1.7)}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.glyph, 0, 0);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function step() {
      t++;
      if (++frame % 90 === 0) readColors();
      for (const p of nodes) {
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < 110) {
            const f = (1 - d / 110) * 0.9;
            p.vx += (dx / d) * f * 0.35;
            p.vy += (dy / d) * f * 0.35;
          }
        }
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 0.6) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
      for (const g of rings) {
        g.r += 4;
        g.life -= 0.025;
      }
      rings = rings.filter((g) => g.life > 0);
      for (const b of bits) {
        b.vy += 0.16;
        b.vx *= 0.985;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        b.life -= 0.012;
      }
      bits = bits.filter((b) => b.life > 0 && b.y < h + 40);
      draw();
      raf = requestAnimationFrame(step);
    }

    const start = () => {
      if (running || reduce || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const local = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    };
    const onMove = (e) => {
      const p = local(e);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.on = p.inside;
    };
    const onOut = (e) => {
      if (!e.relatedTarget) mouse.on = false;
    };
    const onDown = (e) => {
      if (reduce) return;
      const tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      const p = local(e);
      if (p.inside) burst(p.x, p.y);
    };
    const onVis = () => (document.hidden ? stop() : start());

    readColors();
    resize();
    const ro = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    ro ? ro.observe(canvas) : window.addEventListener("resize", resize);
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([en]) => {
            onScreen = en.isIntersecting;
            onScreen ? start() : stop();
          })
        : null;
    io && io.observe(canvas);
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const mo = new MutationObserver(() => setTimeout(readColors, 50));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    mq && mq.addEventListener && mq.addEventListener("change", readColors);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      ro ? ro.disconnect() : window.removeEventListener("resize", resize);
      io && io.disconnect();
      mo.disconnect();
      mq && mq.removeEventListener && mq.removeEventListener("change", readColors);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} className={`field ${className}`} aria-hidden="true" />;
}
