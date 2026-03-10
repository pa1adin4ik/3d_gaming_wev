document.documentElement.classList.add("js");

const ui = {
  mobileBtn: document.getElementById("mobileMenuBtn"),
  mobileMenu: document.getElementById("mobileMenu"),
  themeToggle: document.getElementById("themeToggle"),
  backToTop: document.getElementById("backToTop"),
  toast: document.getElementById("toast")
};

let toastTimer;
let threeReadyPromise = null;
let robotInitialized = false;

const showToast = (message) => {
  if (!ui.toast) return;
  clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.classList.remove("opacity-0", "pointer-events-none");
  ui.toast.classList.add("opacity-100");
  toastTimer = setTimeout(() => {
    ui.toast.classList.remove("opacity-100");
    ui.toast.classList.add("opacity-0", "pointer-events-none");
  }, 2200);
};

const setupMobileMenu = () => {
  if (!ui.mobileBtn || !ui.mobileMenu) return;
  ui.mobileBtn.addEventListener("click", () => {
    const expanded = ui.mobileBtn.getAttribute("aria-expanded") === "true";
    ui.mobileBtn.setAttribute("aria-expanded", String(!expanded));
    ui.mobileMenu.classList.toggle("hidden");
  });

  ui.mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      ui.mobileMenu.classList.add("hidden");
      ui.mobileBtn.setAttribute("aria-expanded", "false");
    });
  });
};

const setupThemeToggle = () => {
  const saved = localStorage.getItem("nexarc_theme");
  if (saved === "light") document.body.classList.add("light-mode");

  ui.themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("nexarc_theme", document.body.classList.contains("light-mode") ? "light" : "dark");
  });
};

const setupReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  items.forEach((item) => observer.observe(item));
};

const setupFilter = () => {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".category-card");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const category = button.dataset.category;

      cards.forEach((card) => {
        const match = category === "all" || card.dataset.category === category;
        if (match) {
          card.classList.remove("hidden-card");
        } else {
          card.classList.add("hidden-card");
        }
      });
    });
  });
};

const setupFaq = () => {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");
    trigger?.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      if (content) content.hidden = expanded;
    });
  });
};

const setupLightbox = () => {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("closeLightbox");

  document.querySelectorAll(".showcase-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (!lightbox || !image) return;
      image.src = item.dataset.full || "";
      lightbox.classList.remove("hidden");
      lightbox.classList.add("flex");
    });
  });

  const closeLightbox = () => {
    if (!lightbox || !image) return;
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    image.src = "";
  };

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
};

const setupCounters = () => {
  const counters = document.querySelectorAll(".counter");
  const animate = (el) => {
    const target = Number(el.dataset.target || "0");
    const start = performance.now();
    const duration = 1300;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          animate(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

const setupReviews = () => {
  const slides = Array.from(document.querySelectorAll(".review-slide"));
  const prev = document.getElementById("prevReview");
  const next = document.getElementById("nextReview");
  if (!slides.length) return;

  let current = 0;
  const render = () => {
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle("hidden", !active);
      slide.classList.toggle("active", active);
    });
  };

  const go = (dir) => {
    current = (current + dir + slides.length) % slides.length;
    render();
  };

  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(1));

  setInterval(() => go(1), 5000);
  render();
};

const setupJoinForm = () => {
  const form = document.getElementById("joinForm");
  const input = document.getElementById("emailInput");
  if (!form || !input) return;

  const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = input.value.trim();

    if (!validEmail(email)) {
      input.focus();
      showToast("Please enter a valid email address.");
      return;
    }

    input.value = "";
    showToast("Subscribed successfully. Welcome to NEXARC.");
  });
};

const setupBackToTop = () => {
  if (!ui.backToTop) return;

  const onScroll = () => {
    const visible = window.scrollY > 500;
    ui.backToTop.classList.toggle("hidden", !visible);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  ui.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

const ensureThreeLoaded = async () => {
  if (typeof THREE !== "undefined") return;
  if (threeReadyPromise) return threeReadyPromise;

  const cdnList = [
    "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js",
    "https://unpkg.com/three@0.161.0/build/three.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r161/three.min.js"
  ];

  threeReadyPromise = (async () => {
    let lastError;
    for (const url of cdnList) {
      try {
        await loadScript(url);
        if (typeof THREE !== "undefined") return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to load Three.js from all CDNs");
  })();

  return threeReadyPromise;
};

const showRobotError = (container, message) => {
  container.innerHTML = `<p class="text-slate-300 text-sm p-4">${message}</p>`;
};

const parseOBJGeometry = (objText) => {
  const sourcePositions = [];
  const sourceNormals = [];
  const outPositions = [];
  const outNormals = [];

  const resolveIndex = (value, length) => (value >= 0 ? value - 1 : length + value);

  const addFace = (vertices) => {
    for (let i = 1; i < vertices.length - 1; i += 1) {
      const tri = [vertices[0], vertices[i], vertices[i + 1]];
      const points = tri.map((v) => sourcePositions[resolveIndex(v.v, sourcePositions.length)]);
      if (!points[0] || !points[1] || !points[2]) continue;

      tri.forEach((v) => {
        const point = sourcePositions[resolveIndex(v.v, sourcePositions.length)];
        outPositions.push(point[0], point[1], point[2]);
      });

      const validNormals = tri.every((v) => v.n && sourceNormals[resolveIndex(v.n, sourceNormals.length)]);
      if (validNormals) {
        tri.forEach((v) => {
          const n = sourceNormals[resolveIndex(v.n, sourceNormals.length)];
          outNormals.push(n[0], n[1], n[2]);
        });
      } else {
        const a = new THREE.Vector3(...points[0]);
        const b = new THREE.Vector3(...points[1]);
        const c = new THREE.Vector3(...points[2]);
        const normal = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b)).normalize();
        for (let k = 0; k < 3; k += 1) outNormals.push(normal.x, normal.y, normal.z);
      }
    }
  };

  const lines = objText.split(/\r?\n/);
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("v ")) {
      const p = line.split(/\s+/);
      sourcePositions.push([Number(p[1]), Number(p[2]), Number(p[3])]);
      continue;
    }

    if (line.startsWith("vn ")) {
      const p = line.split(/\s+/);
      sourceNormals.push([Number(p[1]), Number(p[2]), Number(p[3])]);
      continue;
    }

    if (line.startsWith("f ")) {
      const parts = line.split(/\s+/).slice(1);
      if (parts.length < 3) continue;
      const vertices = parts.map((token) => {
        const [v, , n] = token.split("/");
        return { v: Number(v), n: Number(n) || 0 };
      });
      addFace(vertices);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(outPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(outNormals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};

const parseOBJLite = (objText, maxFaces = 14000) => {
  const vertices = [];
  const allFaces = [];
  const lines = objText.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("v ")) {
      const p = line.split(/\s+/);
      vertices.push([Number(p[1]), Number(p[2]), Number(p[3])]);
      continue;
    }

    if (line.startsWith("f ")) {
      const parts = line.split(/\s+/).slice(1);
      if (parts.length < 3) continue;
      const idx = parts.map((token) => {
        const [v] = token.split("/");
        const iv = Number(v);
        return iv > 0 ? iv - 1 : vertices.length + iv;
      });
      for (let i = 1; i < idx.length - 1; i += 1) {
        allFaces.push([idx[0], idx[i], idx[i + 1]]);
      }
    }
  }

  let faces = allFaces;
  if (allFaces.length > maxFaces) {
    const step = allFaces.length / maxFaces;
    faces = [];
    for (let i = 0; i < maxFaces; i += 1) {
      faces.push(allFaces[Math.floor(i * step)]);
    }
  }

  const used = new Set();
  faces.forEach((f) => {
    used.add(f[0]);
    used.add(f[1]);
    used.add(f[2]);
  });

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  Array.from(used).forEach((index) => {
    const v = vertices[index];
    if (!v) return;
    minX = Math.min(minX, v[0]);
    minY = Math.min(minY, v[1]);
    minZ = Math.min(minZ, v[2]);
    maxX = Math.max(maxX, v[0]);
    maxY = Math.max(maxY, v[1]);
    maxZ = Math.max(maxZ, v[2]);
  });

  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = 2 / size;
  const normalizedVertices = vertices.map((v) => [(v[0] - cx) * scale, (v[1] - cy) * scale, (v[2] - cz) * scale]);

  // Pose tweak: drop both arms/hands a bit so they are not in a wide T-pose.
  let nxMin = Infinity;
  let nxMax = -Infinity;
  let nyMin = Infinity;
  let nyMax = -Infinity;
  normalizedVertices.forEach((v) => {
    nxMin = Math.min(nxMin, v[0]);
    nxMax = Math.max(nxMax, v[0]);
    nyMin = Math.min(nyMin, v[1]);
    nyMax = Math.max(nyMax, v[1]);
  });

  const sideX = Math.max(Math.abs(nxMin), Math.abs(nxMax)) * 0.52;
  const armYMin = nyMin + (nyMax - nyMin) * 0.42;
  const armYMax = nyMin + (nyMax - nyMin) * 0.9;

  for (const v of normalizedVertices) {
    const ax = Math.abs(v[0]);
    if (ax > sideX && v[1] > armYMin && v[1] < armYMax) {
      const sideFactor = Math.min(1, (ax - sideX) / (Math.max(Math.abs(nxMin), Math.abs(nxMax)) - sideX + 1e-6));
      const yFactor = 1 - Math.abs((v[1] - (armYMin + armYMax) * 0.5) / ((armYMax - armYMin) * 0.5 + 1e-6));
      const w = Math.max(0, sideFactor) * Math.max(0, yFactor);
      v[1] -= 0.42 * w;
      v[0] *= 0.95;
    }
  }

  return { vertices: normalizedVertices, faces };
};

const startCanvasOBJRenderer = (container, model) => {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const pointer = { x: 0, y: 0 };
  const state = { x: 0, y: 0 };
  const baseRot = { x: -0.08, y: 0.45 };

  const onPointer = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    if (px >= 0 && px <= 1 && py >= 0 && py <= 1) {
      pointer.x = (px - 0.5) * 2;
      pointer.y = (py - 0.5) * 2;
    }
  };

  window.addEventListener("mousemove", (e) => onPointer(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  window.addEventListener("resize", resize);
  resize();

  const rotate = (v, ax, ay) => {
    const [x, y, z] = v;
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const x2 = x * cy + z1 * sy;
    const z2 = -x * sy + z1 * cy;
    return [x2, y1, z2];
  };

  const loop = (time) => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    state.x += (pointer.x - state.x) * 0.08;
    state.y += (pointer.y - state.y) * 0.08;

    const rx = baseRot.x + state.y * 0.22 + Math.sin(time * 0.0012) * 0.03;
    const ry = baseRot.y + state.x * 0.42 + time * 0.00025;
    const camZ = 2.95;
    const f = Math.min(w, h) * 1.28;
    const modelScale = 1.15;

    ctx.clearRect(0, 0, w, h);

    const projected = model.vertices.map((v) => {
      const r = rotate(v, rx, ry);
      const x = r[0] * modelScale;
      const y = r[1] * modelScale;
      const z = r[2] * modelScale + camZ;
      const sx = w * 0.5 + (x * f) / z;
      const sy = h * 0.66 - (y * f) / z;
      return { x: sx, y: sy, z, x3: x, y3: y, z3: z };
    });

    const faces = model.faces
      .map((face) => {
        const a = projected[face[0]];
        const b = projected[face[1]];
        const c = projected[face[2]];
        if (!a || !b || !c) return null;
        const ux = b.x3 - a.x3;
        const uy = b.y3 - a.y3;
        const uz = b.z3 - a.z3;
        const vx = c.x3 - a.x3;
        const vy = c.y3 - a.y3;
        const vz = c.z3 - a.z3;
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        const nnx = nx / nLen;
        const nny = ny / nLen;
        const nnz = nz / nLen;
        const light = Math.max(0.2, Math.abs(-nnx * 0.25 + -nny * 0.45 + -nnz * 0.7));
        const cx2 = (a.x + b.x + c.x) / 3;
        const cy2 = (a.y + b.y + c.y) / 3;
        return { face, depth: (a.z + b.z + c.z) / 3, a, b, c, light, cx2, cy2 };
      })
      .filter(Boolean)
      .sort((fa, fb) => fb.depth - fa.depth);

    // Expanded body-fill pass to close visible gaps between triangles.
    for (const item of faces) {
      const { a, b, c, cx2, cy2, depth } = item;
      const alpha = Math.max(0.28, Math.min(0.62, 2.2 / depth));
      const inflate = 1.18;
      const ax = cx2 + (a.x - cx2) * inflate;
      const ay = cy2 + (a.y - cy2) * inflate;
      const bx = cx2 + (b.x - cx2) * inflate;
      const by = cy2 + (b.y - cy2) * inflate;
      const cx = cx2 + (c.x - cx2) * inflate;
      const cy = cy2 + (c.y - cy2) * inflate;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStyle = `rgba(94, 130, 192, ${alpha})`;
      ctx.fill();
    }

    for (const item of faces) {
      const { a, b, c, depth, light, cx2, cy2 } = item;
      const alpha = Math.max(0.38, Math.min(0.9, 2.45 / depth));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      const r = Math.round(128 + light * 62);
      const g = Math.round(170 + light * 58);
      const bColor = Math.round(220 + light * 35);
      ctx.fillStyle = `rgba(${r}, ${g}, ${bColor}, ${alpha})`;
      ctx.fill();
      ctx.strokeStyle = "rgba(40, 240, 255, 0.04)";
      ctx.lineWidth = 0.2;
      ctx.stroke();

      // Micro-splat pass helps visually fill tiny pinholes in sparse triangulation.
      ctx.fillStyle = "rgba(125, 200, 255, 0.18)";
      ctx.beginPath();
      ctx.arc(cx2, cy2, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};

const setupRobot = () => {
  const container = document.getElementById("robotCanvas");
  if (!container) return;
  if (robotInitialized) return;
  robotInitialized = true;

  showRobotError(container, "Loading Cyborg Warrior...");
  ensureThreeLoaded()
    .then(() => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0d1322");
      scene.fog = new THREE.Fog("#0d1322", 12, 22);

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 2.7, 8);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const ambient = new THREE.AmbientLight(0x6a80ff, 0.9);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0x28f0ff, 1.6);
      key.position.set(4, 8, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      const rim = new THREE.PointLight(0xff3dd4, 1.25, 20);
      rim.position.set(-5, 5, -4);
      scene.add(rim);
      const robot = new THREE.Group();
      scene.add(robot);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(11, 64),
        new THREE.MeshStandardMaterial({ color: 0x060911, roughness: 0.95, metalness: 0.1 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.82;
      floor.receiveShadow = true;
      scene.add(floor);

      const target = { x: 0, y: 0 };

      const updateTarget = (x, y) => {
        target.x = y * 0.32;
        target.y = x * 0.55;
      };

      window.addEventListener("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          updateTarget((x - 0.5) * 2, (y - 0.5) * 2);
        }
      });

      window.addEventListener(
        "touchmove",
        (event) => {
          const touch = event.touches[0];
          if (!touch) return;
          const rect = container.getBoundingClientRect();
          const x = (touch.clientX - rect.left) / rect.width;
          const y = (touch.clientY - rect.top) / rect.height;
          updateTarget((x - 0.5) * 2, (y - 0.5) * 2);
        },
        { passive: true }
      );

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      window.addEventListener("resize", resize);
      resize();

      const clock = new THREE.Clock();
      let modelLoaded = false;
      let canvasMounted = false;

      fetch("assets/models/cyborg-warrior.obj")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch OBJ");
          return response.text();
        })
        .then((objText) => {
          const geometry = parseOBJGeometry(objText);
          geometry.center();
          const bounds = geometry.boundingBox;
          const size = bounds ? bounds.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
          const maxAxis = Math.max(size.x, size.y, size.z) || 1;
          const scale = 4.8 / maxAxis;

          const material = new THREE.MeshStandardMaterial({
            color: 0xbfd6ff,
            metalness: 0.82,
            roughness: 0.25
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.scale.setScalar(scale);
          robot.add(mesh);
          modelLoaded = true;
        })
        .catch(() => {
          renderer.dispose();
          showRobotError(container, "Could not load cyborg-warrior.obj.");
        });

      const loop = () => {
        const elapsed = clock.getElapsedTime();

        if (modelLoaded) {
          if (!canvasMounted) {
            container.innerHTML = "";
            container.appendChild(renderer.domElement);
            canvasMounted = true;
          }
          robot.rotation.y += (target.y - robot.rotation.y) * 0.06;
          robot.rotation.x += (target.x - robot.rotation.x) * 0.06;
          robot.position.y = Math.sin(elapsed * 1.4) * 0.08;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };

      loop();
    })
    .catch(() => {
      showRobotError(container, "Three.js blocked. Loading OBJ fallback...");
      fetch("assets/models/cyborg-warrior.obj")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch OBJ");
          return response.text();
        })
        .then((objText) => {
          const model = parseOBJLite(objText);
          startCanvasOBJRenderer(container, model);
        })
        .catch(() => {
          showRobotError(container, "Could not load cyborg-warrior.obj.");
        });
    });
};

setupMobileMenu();
setupThemeToggle();
setupReveal();
setupFilter();
setupFaq();
setupLightbox();
setupCounters();
setupReviews();
setupJoinForm();
setupBackToTop();
setupRobot();
