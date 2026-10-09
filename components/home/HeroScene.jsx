"use client";

/* ==========================================================
   Three.js hero — a real supercar model (Ferrari 458 Italia by
   vicent091036, CC-BY 4.0, via the three.js examples) on a reflective
   outback-night stage (bloom, stars, speed lines).
   Drives in on the "velo:intro" event, follows mouse & scroll.
   ========================================================== */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = () => mount.clientWidth;
    const H = () => mount.clientHeight;
    const mobile = window.innerWidth < 760;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL — the CSS glow behind still looks fine
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setSize(W(), H());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0d, 0.045);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(mobile ? 42 : 32, W() / H(), 0.1, 200);
    const camBase = new THREE.Vector3(mobile ? 8.5 : 8.2, mobile ? 3.4 : 2.6, mobile ? 14 : 9.5);
    camera.position.copy(camBase);
    // desktop: aim left of the car so it sits on the right, clear of the headline
    const lookAt = new THREE.Vector3(mobile ? 0 : -2.1, mobile ? 0.2 : 0.7, 0);

    /* lights */
    scene.add(new THREE.HemisphereLight(0xffe7d1, 0x0b0b0d, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    scene.add(key);
    const rim = new THREE.PointLight(0xe8642c, 40, 18, 2);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(0x8fb39a, 14, 16, 2);
    fill.position.set(4, 1.5, -4);
    scene.add(fill);

    /* ground, grid, turntable rings */
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(40, 64),
      new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.32, metalness: 0.6 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(60, 60, 0xe8642c, 0x2a2a33);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    grid.position.y = 0.002;
    scene.add(grid);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 3.46, 128),
      new THREE.MeshBasicMaterial({ color: 0xe8642c, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);
    const ring2 = new THREE.Mesh(ring.geometry, ring.material.clone());
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.01;
    ring2.scale.setScalar(1.18);
    ring2.material.opacity = 0.25;
    scene.add(ring2);

    /* car — real model loads async; a procedural fallback is used if it fails */
    const car = new THREE.Group();
    car.userData.wheels = [];
    car.position.set(16, 0.02, 0); // drives in nose-first from the right
    car.add(groundEffects());
    scene.add(car);
    let carReady = false;
    let introQueued = false;
    let disposed = false; // ignore a load that finishes after unmount

    const draco = new DRACOLoader().setDecoderPath("/draco/");
    new GLTFLoader().setDRACOLoader(draco).load(
      "/models/ferrari.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene.children[0];
        styleCar(model);
        model.rotation.y = Math.PI / 2; // model nose points −Z → turn it to −X (drive direction)
        model.scale.setScalar(1.08);
        car.add(model);
        ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"].forEach((n) => {
          const w = model.getObjectByName(n);
          if (w) car.userData.wheels.push({ obj: w, axis: "x", dir: -1 });
        });
        carReady = true;
        if (introQueued) intro();
      },
      undefined,
      () => {
        if (disposed) return;
        const fallback = buildCar();
        fallback.userData.wheels.forEach((w) => car.userData.wheels.push({ obj: w, axis: "z", dir: 1 }));
        car.add(fallback);
        carReady = true;
        if (introQueued) intro();
      },
    );

    /* southern-sky stars */
    const starCount = mobile ? 700 : 1600;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 40;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.45;
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.6 + 4;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xf3eee6, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.8 }),
    );
    scene.add(stars);

    /* speed lines */
    const lines = new THREE.Group();
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff8a4c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2 + Math.random() * 4, 0.025), lineMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set((Math.random() - 0.5) * 40, 0.03 + Math.random() * 0.02, (Math.random() - 0.5) * 14);
      m.userData.speed = 0.4 + Math.random() * 0.8;
      lines.add(m);
    }
    scene.add(lines);

    /* post-processing */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.45, 0.5, 0.9));
    composer.addPass(new OutputPass());

    /* interaction */
    const state = { mouseX: 0, mouseY: 0, scroll: 0, introDone: false, speed: 1.6 };
    const onPointer = (e) => {
      state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer);

    const intro = () => {
      if (!carReady) {
        introQueued = true; // wait for the model, then drive in
        return;
      }
      if (intro.done) return;
      intro.done = true;
      gsap.to(lineMat, { opacity: 0.55, duration: 0.6 });
      gsap.to(car.position, {
        x: 0,
        duration: 2.4,
        ease: "power3.out",
        onComplete: () => {
          state.introDone = true;
          gsap.to(state, { speed: 0.08, duration: 1.5 });
          gsap.to(lineMat, { opacity: 0.12, duration: 1.5 });
        },
      });
      gsap.fromTo(car.rotation, { y: -0.35 }, { y: 0.55, duration: 2.6, ease: "power3.out" });
      gsap.fromTo(camera.position, { z: camBase.z + 4, y: camBase.y + 1.5 }, { z: camBase.z, y: camBase.y, duration: 2.8, ease: "power3.out" });
      gsap.fromTo(ring.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 1.6, delay: 1.2, ease: "expo.out" });
    };
    window.addEventListener("velo:intro", intro);
    if (window.__veloIntroFired) intro();

    const st = ScrollTrigger.create({
      trigger: mount.closest("section") || mount,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        state.scroll = self.progress;
      },
    });

    /* loop */
    const timer = new THREE.Timer();
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(mount);
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();

      const spin = state.speed * dt * 14;
      car.userData.wheels.forEach((w) => {
        w.obj.rotation[w.axis] += spin * w.dir;
      });
      if (state.introDone) {
        car.rotation.y += (0.55 + state.mouseX * 0.35 + state.scroll * 2.2 - car.rotation.y) * 0.05;
        car.position.y = 0.02 + Math.sin(t * 1.6) * 0.012;
        camera.position.y += (camBase.y - state.mouseY * 0.35 + state.scroll * 2.5 - camera.position.y) * 0.05;
        camera.position.z += (camBase.z - state.scroll * 3 - camera.position.z) * 0.05;
      }
      camera.position.x += (camBase.x + state.mouseX * 0.8 - camera.position.x) * 0.04;
      camera.lookAt(lookAt);

      lines.children.forEach((m) => {
        m.position.x += m.userData.speed * (state.introDone ? state.speed * 6 + 0.4 : 18) * dt;
        if (m.position.x > 20) m.position.x = -20;
      });
      ring2.material.opacity = 0.15 + Math.sin(t * 2) * 0.1;
      stars.rotation.y = t * 0.006;
      rim.intensity = 36 + Math.sin(t * 1.3) * 6;
      composer.render();
    };
    tick();

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
      composer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timer.dispose?.();
      io.disconnect();
      st.kill();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("velo:intro", intro);
      gsap.killTweensOf([car.position, car.rotation, camera.position, ring.scale, lineMat, state]);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          m?.map?.dispose?.();
          m?.dispose?.();
        });
      });
      envTex.dispose();
      pmrem.dispose();
      composer.dispose?.();
      draco.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 max-md:top-[18svh] max-md:bottom-auto max-md:h-[62svh]" aria-hidden />;
}

/* ===== real model: paint, glass, chrome, lights ===== */
function styleCar(model) {
  const paint = new THREE.MeshPhysicalMaterial({
    color: 0xe8642c, // VeloDrive ochre
    metalness: 0.55,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  // slightly grey chrome so the rims don't blow out under the bloom pass
  const details = new THREE.MeshStandardMaterial({ color: 0x9a9a9e, metalness: 1, roughness: 0.22 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1 });

  model.getObjectByName("body").material = paint;
  ["rim_fl", "rim_fr", "rim_rr", "rim_rl", "trim"].forEach((n) => {
    const o = model.getObjectByName(n);
    if (o) o.material = details;
  });
  const g = model.getObjectByName("glass");
  if (g) g.material = glass;

  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    const name = o.material?.name || "";
    if (name === "Taillight_Glass" || o.name === "lights_red") {
      o.material = o.material.clone();
      o.material.emissive = new THREE.Color(0xff2a1a);
      o.material.emissiveIntensity = 2.5;
    } else if (name === "Turn_Signal_LED" || o.name === "leds") {
      o.material = o.material.clone();
      o.material.emissive = new THREE.Color(0xfff3e0);
      o.material.emissiveIntensity = 3;
    }
  });
}

/* soft contact shadow + ochre under-glow, as radial textures (no hard edges) */
function groundEffects() {
  const radial = (stops) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d");
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([o, c]) => grad.addColorStop(o, c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  };
  const fx = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.8),
    new THREE.MeshBasicMaterial({ map: radial([[0, "rgba(0,0,0,0.85)"], [0.55, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 3.8),
    new THREE.MeshBasicMaterial({
      map: radial([[0, "rgba(232,100,44,1)"], [0.5, "rgba(232,100,44,0.3)"], [1, "rgba(232,100,44,0)"]]),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.01;
  fx.add(glow, shadow);
  return fx;
}

/* ===== procedural fallback car (used only if the model can't load) ===== */
function buildCar() {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xe8642c, metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0a0b10, metalness: 0.9, roughness: 0.05, clearcoat: 1 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.7, metalness: 0.2 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.18 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3e0, emissiveIntensity: 4 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xff2a1a, emissiveIntensity: 3.5 });

  // side profile (x = length, y = height) with wheel arches
  const s = new THREE.Shape();
  s.moveTo(-2.25, 0.32);
  s.lineTo(-2.3, 0.58);
  s.quadraticCurveTo(-2.25, 0.78, -1.9, 0.82);
  s.lineTo(-0.75, 0.95);
  s.quadraticCurveTo(-0.2, 1.35, 0.35, 1.38);
  s.lineTo(1.0, 1.36);
  s.quadraticCurveTo(1.6, 1.25, 2.05, 0.98);
  s.lineTo(2.3, 0.92);
  s.lineTo(2.32, 0.4);
  s.quadraticCurveTo(2.3, 0.3, 2.1, 0.3);
  s.lineTo(1.95, 0.3);
  s.absarc(1.42, 0.38, 0.53, 0, Math.PI, false);
  s.lineTo(-0.88, 0.3);
  s.absarc(-1.42, 0.38, 0.53, 0, Math.PI, false);
  s.lineTo(-2.25, 0.32);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 8, curveSegments: 32 });
  bodyGeo.translate(0, 0, -0.85);
  const body = new THREE.Mesh(bodyGeo, paint);
  body.castShadow = true;
  car.add(body);

  // greenhouse
  const g = new THREE.Shape();
  g.moveTo(-0.62, 0.98);
  g.quadraticCurveTo(-0.15, 1.3, 0.35, 1.32);
  g.lineTo(0.98, 1.3);
  g.quadraticCurveTo(1.5, 1.2, 1.88, 1.0);
  g.lineTo(-0.62, 0.98);
  const gGeo = new THREE.ExtrudeGeometry(g, { depth: 1.74, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.04, bevelSegments: 4 });
  gGeo.translate(0, 0.02, -0.87);
  car.add(new THREE.Mesh(gGeo, glass));

  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 1.98), paint);
  pillar.position.set(0.55, 1.18, 0);
  car.add(pillar);

  [-0.62, 0.62].forEach((z) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.42), headMat);
    h.position.set(-2.34, 0.7, z);
    car.add(h);
  });
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.8), tailMat);
  tail.position.set(2.42, 0.82, 0);
  car.add(tail);

  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 1.2), black);
  grille.position.set(-2.38, 0.45, 0);
  car.add(grille);
  const diff = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.6), black);
  diff.position.set(2.25, 0.3, 0);
  car.add(diff);

  [-1, 1].forEach((side) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.18), paint);
    m.position.set(-0.45, 1.0, side * 1.05);
    car.add(m);
  });

  // wheels (torus lies in XY → axle is Z → roll by rotating about Z)
  const wheels = [];
  const tyreGeo = new THREE.TorusGeometry(0.34, 0.12, 20, 48);
  const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 40);
  const spokeGeo = new THREE.BoxGeometry(0.05, 0.54, 0.04);
  const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.16, 20);
  const calMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.4 });
  [[-1.42, 0.98], [-1.42, -0.98], [1.42, 0.98], [1.42, -0.98]].forEach(([x, z]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.43, z);
    const wheel = new THREE.Group();
    const tyre = new THREE.Mesh(tyreGeo, black);
    tyre.castShadow = true;
    wheel.add(tyre);
    const rimM = new THREE.Mesh(rimGeo, chrome);
    rimM.rotation.x = Math.PI / 2;
    wheel.add(rimM);
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(spokeGeo, black);
      sp.rotation.z = (i / 5) * Math.PI;
      sp.position.z = Math.sign(z) * 0.065;
      wheel.add(sp);
    }
    const hub = new THREE.Mesh(hubGeo, paint);
    hub.rotation.x = Math.PI / 2;
    wheel.add(hub);
    const cal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), calMat);
    cal.position.set(0.18, 0.12, -Math.sign(z) * 0.03);
    pivot.add(cal);
    pivot.add(wheel);
    car.add(pivot);
    wheels.push(wheel);
  });
  car.userData.wheels = wheels;

  // soft under-glow (radial gradient texture → no hard edges)
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const ctx = cv.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(232,100,44,1)");
  grad.addColorStop(0.5, "rgba(232,100,44,0.35)");
  grad.addColorStop(1, "rgba(232,100,44,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.5, 3.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.015;
  car.add(glow);

  car.scale.setScalar(1.05);
  return car;
}
