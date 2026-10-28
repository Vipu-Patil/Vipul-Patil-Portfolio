import React, { useEffect, useMemo, useRef } from "react";

/* 3D globe of skills. Drag (or swipe) to spin it; it keeps drifting on
   its own. Clicking a skill selects it, which lights up the jobs and
   projects that use it elsewhere on the page. */

export default function SkillGlobe({ groups, active, onPick }) {
  const box = useRef(null);
  const els = useRef([]);
  const items = useMemo(() => {
    const flat = groups.flatMap((g, gi) => g.items.map((name) => ({ name, gi })));
    const n = flat.length;
    return flat.map((it, i) => {
      // Fibonacci sphere: evenly spread points
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * Math.PI * (3 - Math.sqrt(5));
      return { ...it, x: Math.cos(th) * r, y, z: Math.sin(th) * r };
    });
  }, [groups]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ax = -0.3, ay = 0, vx = 0, vy = reduce ? 0 : 0.0035, raf = 0, dragging = false, lx = 0, ly = 0, moved = 0, visible = true;
    let R = 180;

    const place = () => {
      R = el.clientWidth * 0.42;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      items.forEach((p, i) => {
        const node = els.current[i];
        if (!node) return;
        // rotate around Y then X
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back .. 1 front
        const s = 0.55 + depth * 0.65;
        node.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        node.style.opacity = (0.22 + depth * 0.78).toFixed(3);
        node.style.zIndex = String(Math.round(depth * 100));
        node.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 4).toFixed(1)}px)` : "none";
      });
    };

    const tick = () => {
      if (!dragging) {
        ay += vy;
        ax += vx;
        vy += ((reduce ? 0 : 0.0035) - vy) * 0.02;
        vx *= 0.95;
        ax += (-0.3 - ax) * 0.01;
      }
      place();
      raf = requestAnimationFrame(tick);
    };

    const down = (e) => {
      dragging = true;
      moved = 0;
      lx = e.clientX;
      ly = e.clientY;
      el.classList.add("grabbing");
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      lx = e.clientX;
      ly = e.clientY;
      vy = dx * 0.006;
      vx = dy * 0.006;
      ay += vy;
      ax += vx;
      if (reduce) place();
    };
    const up = () => {
      dragging = false;
      el.classList.remove("grabbing");
      el.dataset.moved = moved > 6 ? "1" : "";
    };

    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", up);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    place();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
  }, [items]);

  return (
    <div ref={box} className="globe" role="group" aria-label="Skills globe: drag to spin, select a skill to highlight where it was used">
      <span className="globe-core" aria-hidden="true" />
      <span className="globe-ring r1" aria-hidden="true" />
      <span className="globe-ring r2" aria-hidden="true" />
      {items.map((p, i) => (
        <button
          key={p.name}
          ref={(n) => (els.current[i] = n)}
          type="button"
          className={`globe-tag g${p.gi} ${active === p.name ? "on" : ""}`}
          aria-pressed={active === p.name}
          onClick={(e) => {
            if (box.current?.dataset.moved === "1") {
              e.preventDefault();
              return;
            }
            onPick(active === p.name ? "" : p.name);
          }}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
