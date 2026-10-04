// ==========================================
// 3D HERO MODEL INITIALIZATION (Three.js)
// ==========================================

function init3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || !window.THREE) {
    console.error("Three.js or container not found.");
    return;
  }

  // Prevent multiple initializations (duplicate canvases)
  if (container.children.length > 0) {
    container.innerHTML = '';
  }

  // 1. Scene Setup
  const scene = new THREE.Scene();

  // 2. Camera Setup
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 10;

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x2e8cff, 1.0, 50);
  pointLight.position.set(-5, -2, -5);
  scene.add(pointLight);

  // 5. Model Loading Variables
  let cloudMesh;
  let outerGlobeGroup = new THREE.Group();
  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // 6. Loading Manager for textures only (no OBJ needed)
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);
  };

  // 7. Load textures and build the globe
  const textureLoader = new THREE.TextureLoader(manager);
  const earthMap = textureLoader.load('./8k_earth_daymap.jpg');
  const normalMap = textureLoader.load('./normal.jpg');
  const specMap = textureLoader.load('./specular.jpg');
  const cloudTex = textureLoader.load('./8k_earth_clouds.jpg');

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    normalMap: normalMap,
    specularMap: specMap,
    specular: new THREE.Color('grey'),
    shininess: 35
  });

  // 8. Build the Earth sphere directly in code (replaces the 8MB OBJ download)
  const targetSize = 5.5;
  const earthRadius = targetSize / 2;
  const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthMesh = new THREE.Mesh(earthGeo, earthMaterial);

  const visualCenterY = -2.2;

  // CREATE AN INNER PIVOT GROUP for the static 90-degree tilted state
  const innerGlobeGroup = new THREE.Group();
  innerGlobeGroup.add(earthMesh);

  // ADD SUBTLE CLOUD LAYER
  const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.015, 64, 64);
  const cloudMat = new THREE.MeshPhongMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  innerGlobeGroup.add(cloudMesh);

  // 1. Maintain the previous face (spin around Y)
  innerGlobeGroup.rotation.y = 25 * (Math.PI / 180);

  // 2. Tilt the object from the front (Reset to 0 as requested)
  innerGlobeGroup.rotation.z = 0;

  // Place the inner group into the outer group.
  outerGlobeGroup.position.set(0, visualCenterY, 0);
  outerGlobeGroup.add(innerGlobeGroup);
  scene.add(outerGlobeGroup);

  // 9. Desktop mouse listeners
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  function updateCameraForMobile() {
    if (window.innerWidth <= 768) {
      camera.position.z = 21;
      camera.position.y = -0.2; // Decreased Y to move the camera down, pushing the globe UP by approx 0.9cm
    } else {
      camera.position.z = 10;
      camera.position.y = 0;
    }
  }

  updateCameraForMobile();

  window.addEventListener('resize', () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateCameraForMobile();
  });

  // 10. Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the entire object
    if (outerGlobeGroup) {
      outerGlobeGroup.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
  }

  animate();
}

// ==========================================
// COUNTDOWN TIMER LOGIC
// ==========================================
function initCountdown() {
  const targetDate = new Date('November 8, 2026 00:00:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  const heroDays = document.getElementById('hero-cd-days');
  const heroHours = document.getElementById('hero-cd-hours');
  const heroMins = document.getElementById('hero-cd-mins');
  const heroSecs = document.getElementById('hero-cd-secs');

  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      const zero = '00';
      if(daysEl) daysEl.textContent = zero;
      if(hoursEl) hoursEl.textContent = zero;
      if(minsEl) minsEl.textContent = zero;
      if(secsEl) secsEl.textContent = zero;
      if(heroDays) heroDays.textContent = zero;
      if(heroHours) heroHours.textContent = zero;
      if(heroMins) heroMins.textContent = zero;
      if(heroSecs) heroSecs.textContent = zero;
      return;
    }

    const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

    if(daysEl) daysEl.textContent = days;
    if(hoursEl) hoursEl.textContent = hours;
    if(minsEl) minsEl.textContent = mins;
    if(secsEl) secsEl.textContent = secs;

    if(heroDays) heroDays.textContent = days;
    if(heroHours) heroHours.textContent = hours;
    if(heroMins) heroMins.textContent = mins;
    if(heroSecs) heroSecs.textContent = secs;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// INITIALIZE APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  init3D();
  initCountdown();
});
