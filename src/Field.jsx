import React, { useEffect, useRef } from "react";

/* Interactive background: a drifting network of nodes.
   - Nodes link up when close, like a little neural net.
   - Move the cursor: nearby nodes scatter and connect to it.
   - Click or tap anywhere: a ripple, a burst of confetti and new nodes.
   Colors come from CSS tokens on the parent (--field-node, --field-hot),
   so it follows the light/dark theme and the dark "lab" band. */

const GLYPHS = ["{ }", "</>", "AI", "0 1", "λ", "→", "∑"];
const TOKENS = [
  "embedding[768]", "attention(q,k,v)", "softmax", "p = 0.97", "∇loss", "agent.run()", "RAG · top_k=3",
  "tokens: 4096", "cos_sim 0.91", "relu", "LLM", "tool_call()", "0x7f3a", "epoch 42", "pgvector", "200 OK · 41ms",
];

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
    let nodes = [], bits = [], rings = [], pulses = [], words = [];
    let scanY = -200;
    let col = { node: [43, 69, 230], hot: [43, 69, 230], alt: [139, 92, 246], confetti: [[43, 69, 230]] };
    const mouse = { x: -9999, y: -9999, on: false };

    const readColors = () => {
      const cs = getComputedStyle(canvas.parentElement || document.documentElement);
      const g = (n) => cs.getPropertyValue(n).trim();
      col = {
        node: toRgb(g("--field-node") || g("--accent")),
        hot: toRgb(g("--field-hot") || g("--accent")),
        alt: toRgb(g("--field-alt") || g("--accent")),
        alpha: parseFloat(g("--field-alpha")) || 0.5,
        confetti: [g("--accent"), g("--highlight"), g("--field-hot"), g("--field-mint")].filter(Boolean).map(toRgb),
      };
    };

    const target = () => Math.max(22, Math.min(110, Math.round(((w * h) / 15000) * density)));
    const makeNode = (x, y) => {
      const a = Math.random() * Math.PI * 2;
      const s = 0.15 + Math.random() * 0.35;
      const hub = Math.random() < 0.09;
      return {
        x: x ?? Math.random() * w, y: y ?? Math.random() * h, vx: Math.cos(a) * s * (hub ? 0.5 : 1), vy: Math.sin(a) * s * (hub ? 0.5 : 1),
        r: hub ? 3.2 + Math.random() * 1.6 : 1.1 + Math.random() * 1.8, ph: Math.random() * 6.28, extra: x != null, hub, flash: 0,
      };
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
      nodes
        .filter((p) => Math.hypot(p.x - x, p.y - y) < 200)
        .slice(0, 8)
        .forEach((p) => {
          p.flash = 1;
          spawnPulse(p, 4);
        });
      const cap = target() + 30;
      if (nodes.length > cap) {
        const idx = nodes.findIndex((p) => p.extra);
        nodes.splice(idx >= 0 ? idx : 0, nodes.length - cap);
      }
    };

    const LINK = 130, REACH = 180;

    const neighbour = (p, avoid) => {
      let best = null, tries = 0;
      for (const q of nodes) {
        if (q === p || q === avoid) continue;
        const dx = p.x - q.x, dy = p.y - q.y;
        if (dx * dx + dy * dy < LINK * LINK) {
          tries++;
          if (Math.random() < 1 / tries) best = q;
        }
      }
      return best;
    };
    const spawnPulse = (from, hops) => {
      const a = from || nodes[(Math.random() * nodes.length) | 0];
      if (!a) return;
      const b = neighbour(a);
      if (b) pulses.push({ a, b, t: 0, sp: 0.018 + Math.random() * 0.02, hops: hops ?? 2 + ((Math.random() * 4) | 0), alt: Math.random() < 0.35 });
    };
    const spawnWord = () => {
      words.push({
        text: TOKENS[(Math.random() * TOKENS.length) | 0],
        x: 20 + Math.random() * Math.max(40, w - 180), y: h * (0.25 + Math.random() * 0.75),
        vy: -(0.12 + Math.random() * 0.18), life: 0, max: 380 + Math.random() * 260,
      });
    };

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

      // drifting ML tokens
      ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (const wd of words) {
        const k = wd.life / wd.max;
        const fade = Math.min(1, k * 5, (1 - k) * 4);
        ctx.fillStyle = rgba(col.node, 0.55 * a0 * fade);
        ctx.fillText(wd.text, wd.x, wd.y);
      }

      // scan beam
      if (scanY > -100 && scanY < h + 100) {
        const g = ctx.createLinearGradient(0, scanY - 90, 0, scanY + 2);
        g.addColorStop(0, rgba(col.hot, 0));
        g.addColorStop(1, rgba(col.hot, 0.10 * a0 * 2));
        ctx.fillStyle = g;
        ctx.fillRect(0, scanY - 90, w, 92);
        ctx.fillStyle = rgba(col.hot, 0.35 * a0 * 2);
        ctx.fillRect(0, scanY, w, 1);
      }

      // data streams into the cursor ("attention")
      ctx.setLineDash([3, 6]);
      ctx.lineDashOffset = -t * 0.8;
      for (const p of nodes) {
        p.near = 0;
        if (!mouse.on) continue;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < REACH) {
          p.near = 1 - d / REACH;
          ctx.strokeStyle = rgba(col.hot, p.near * 0.95);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // nodes, hubs with orbit rings
      for (const p of nodes) {
        const near = p.near || 0;
        const r = p.r + Math.sin(t * 0.03 + p.ph) * 0.5 + near * 2 + p.flash * 2.5;
        if (p.flash > 0.05 || near > 0) {
          ctx.fillStyle = rgba(col.hot, 0.18 * Math.max(p.flash, near));
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = near > 0 || p.flash > 0.3 ? rgba(col.hot, 0.7 + 0.3 * Math.max(near, p.flash)) : rgba(col.node, Math.min(1, 0.75 * a0 * 1.5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
        if (p.hub) {
          ctx.strokeStyle = rgba(col.node, 0.55 * a0 * 1.4);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 6, t * 0.02 + p.ph, t * 0.02 + p.ph + Math.PI * 1.2);
          ctx.stroke();
          ctx.strokeStyle = rgba(col.alt, 0.5 * a0 * 1.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 11, -t * 0.015 + p.ph, -t * 0.015 + p.ph + Math.PI * 0.7);
          ctx.stroke();
        }
      }

      // signals travelling along links
      for (const s2 of pulses) {
        const x = s2.a.x + (s2.b.x - s2.a.x) * s2.t, y = s2.a.y + (s2.b.y - s2.a.y) * s2.t;
        const tx = s2.a.x + (s2.b.x - s2.a.x) * Math.max(0, s2.t - 0.25), ty = s2.a.y + (s2.b.y - s2.a.y) * Math.max(0, s2.t - 0.25);
        const c = s2.alt ? col.alt : col.hot;
        const g = ctx.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, rgba(c, 0));
        g.addColorStop(1, rgba(c, 0.95));
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = rgba(c, 0.25);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(c, 1);
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
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
      for (const p of nodes) p.flash *= 0.94;
      if (t % 14 === 0 && pulses.length < 34) spawnPulse();
      if (mouse.on && t % 9 === 0) {
        const close = nodes.filter((p) => p.near > 0.2);
        if (close.length) spawnPulse(close[(Math.random() * close.length) | 0], 3);
      }
      const next = [];
      for (const s2 of pulses) {
        s2.t += s2.sp;
        if (s2.t >= 1) {
          s2.b.flash = 1;
          if (s2.hops > 0) {
            const c = neighbour(s2.b, s2.a);
            if (c) next.push({ a: s2.b, b: c, t: 0, sp: s2.sp, hops: s2.hops - 1, alt: s2.alt });
          }
        } else next.push(s2);
      }
      pulses = next;
      if (t % 70 === 0 && words.length < Math.max(3, Math.round(w / 220))) spawnWord();
      for (const wd of words) {
        wd.y += wd.vy;
        wd.life++;
      }
      words = words.filter((wd) => wd.life < wd.max);
      scanY += 2.2;
      if (scanY > h + 600) scanY = -100;
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
    for (let i = 0; i < 3; i++) {
      spawnWord();
      words[words.length - 1].life = Math.random() * 200;
    }
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
