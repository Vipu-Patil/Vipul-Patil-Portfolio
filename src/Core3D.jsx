import React, { useEffect, useRef } from "react";
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, IcosahedronGeometry, OctahedronGeometry, TorusGeometry,
  EdgesGeometry, LineSegments, LineBasicMaterial, Points, PointsMaterial, BufferGeometry, Float32BufferAttribute,
  Mesh, MeshBasicMaterial, Color, AdditiveBlending, CanvasTexture, ShaderMaterial,
} from "three";

/* WebGL "AI core" for the hero: a wireframe network sphere with glowing
   nodes, a pulsing inner core, orbit rings and a particle shell.
   It leans toward the cursor and spins faster as the page scrolls.
   Colors come from CSS tokens so it follows light/dark mode. */

function glowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/* Round, soft glowing points (works on every GPU, unlike textured squares) */
function glowPoints(color, size) {
  return new ShaderMaterial({
    uniforms: { color: { value: color.clone() }, size: { value: size }, opacity: { value: 1 } },
    vertexShader: `uniform float size; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * (300.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 color; uniform float opacity; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; float a = smoothstep(0.5, 0.0, d); a = a * a * 1.4; gl_FragColor = vec4(color, min(1.0, a) * opacity); }`,
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
}

export default function Core3D({ className = "" }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: the page still works without the core
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const css = () => {
      const cs = getComputedStyle(document.documentElement);
      const g = (n, d) => cs.getPropertyValue(n).trim() || d;
      return { a: new Color(g("--accent", "#2b45e6")), b: new Color(g("--field-hot", "#0098c2")), c: new Color(g("--highlight", "#ffe14d")), v: new Color(g("--field-alt", "#7c4dff")) };
    };
    let col = css();
    const sprite = glowSprite();

    const world = new Group();
    scene.add(world);

    // outer network sphere
    const ico = new IcosahedronGeometry(2, 2);
    const shellMat = new LineBasicMaterial({ color: col.a, transparent: true, opacity: 0.55 });
    const shell = new LineSegments(new EdgesGeometry(ico), shellMat);
    world.add(shell);
    const nodeMat = glowPoints(col.b, 0.16);
    const nodes = new Points(ico, nodeMat);
    world.add(nodes);

    // inner core
    const core = new Group();
    const innerMat = new LineBasicMaterial({ color: col.v, transparent: true, opacity: 0.9 });
    core.add(new LineSegments(new EdgesGeometry(new OctahedronGeometry(0.9, 0)), innerMat));
    const glowMat = new MeshBasicMaterial({ color: col.b, transparent: true, opacity: 0.18 });
    core.add(new Mesh(new IcosahedronGeometry(0.62, 1), glowMat));
    world.add(core);

    // orbit rings with travelling satellites
    const rings = [];
    [[2.75, 1.2, 0.3, col.c], [3.15, -0.5, 1.1, col.b], [2.45, 0.2, -1.0, col.v]].forEach(([r, rx, ry, c], i) => {
      const g = new Group();
      const ring = new Mesh(new TorusGeometry(r, 0.008, 6, 160), new MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6 }));
      g.add(ring);
      const satGeo = new BufferGeometry();
      satGeo.setAttribute("position", new Float32BufferAttribute([r, 0, 0], 3));
      const sat = new Points(satGeo, glowPoints(c, 0.45));
      const satHolder = new Group();
      satHolder.add(sat);
      g.add(satHolder);
      g.rotation.set(rx, ry, 0);
      world.add(g);
      rings.push({ g, satHolder, speed: 0.6 + i * 0.25, ring });
    });

    // particle shell
    const N = 420;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, rr = 3.4 + Math.random() * 1.6;
      const s = Math.sqrt(1 - u * u);
      pts.push(rr * s * Math.cos(t), rr * u, rr * s * Math.sin(t));
    }
    const dustGeo = new BufferGeometry();
    dustGeo.setAttribute("position", new Float32BufferAttribute(pts, 3));
    const dustMat = new PointsMaterial({ color: col.a, size: 0.05, transparent: true, opacity: 0.7, depthWrite: false });
    const dust = new Points(dustGeo, dustMat);
    scene.add(dust);

    const recolor = () => {
      col = css();
      shellMat.color = col.a; nodeMat.uniforms.color.value.copy(col.b); innerMat.color = col.v; glowMat.color = col.b; dustMat.color = col.a;
      rings[0].ring.material.color = col.c; rings[1].ring.material.color = col.b; rings[2].ring.material.color = col.v;
      rings.forEach((r, i) => r.satHolder.children[0].material.uniforms.color.value.copy([col.c, col.b, col.v][i]));
      if (reduce) render();
    };
    const mo = new MutationObserver(() => setTimeout(recolor, 60));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener && mq.addEventListener("change", recolor);

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // interaction
    let mx = 0, my = 0, tx = 0, ty = 0, spin = 0, lastY = scrollY, kick = 0;
    const onMove = (e) => {
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      kick += Math.min(0.08, Math.abs(scrollY - lastY) * 0.0009);
      lastY = scrollY;
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });

    function render() {
      renderer.render(scene, camera);
    }
    let raf = 0, t0 = performance.now(), running = false, visible = true;
    const loop = (now) => {
      const t = (now - t0) / 1000;
      tx += (mx * 0.5 - tx) * 0.05;
      ty += (my * 0.35 - ty) * 0.05;
      kick *= 0.94;
      spin += 0.0025 + kick;
      world.rotation.y = spin + tx;
      world.rotation.x = 0.25 + ty;
      shell.rotation.z = t * 0.05;
      core.rotation.set(t * 0.7, t * 0.9, 0);
      const pulse = 1 + Math.sin(t * 2.2) * 0.08;
      core.scale.setScalar(pulse);
      glowMat.opacity = 0.14 + Math.sin(t * 2.2) * 0.06;
      nodeMat.uniforms.size.value = 0.15 + Math.sin(t * 1.5) * 0.03;
      rings.forEach((r) => (r.satHolder.rotation.z = t * r.speed));
      dust.rotation.y = -t * 0.03 + tx * 0.3;
      dust.rotation.x = ty * 0.2;
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    resize();
    world.rotation.set(0.25, 0.4, 0);
    render();
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener && mq.removeEventListener("change", recolor);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        o.geometry && o.geometry.dispose();
        o.material && o.material.dispose();
      });
      sprite.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={`core3d ${className}`} aria-hidden="true" />;
}
