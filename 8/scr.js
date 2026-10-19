// ============================================================
// Класс цветка из точек (наследуется от THREE.Points)
// ============================================================
class PointFlower extends THREE.Points {
    constructor(amount = 50000) {
        const petalAmount = 51;

        // Базовый лепесток: объединяем несколько геометрий
        const basePetal = THREE.BufferGeometryUtils.mergeBufferGeometries([
            new THREE.RingGeometry(1, 0.75, 64, 4),
            new THREE.RingGeometry(0.5, 0.3, 64, 4),
            new THREE.PlaneGeometry(0.2, 2, 1, 20),
        ]);
        basePetal.translate(0, 1, 0).scale(0.5, 1, 1);

        // Функция деформации и масштабирования лепестка
        const petalGeometry = (w, h, flatRatio) => {
            const g = basePetal.clone();
            const pos = g.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const xVal = pos.getX(i);
                const zVal = (1 - Math.sqrt(1 - THREE.MathUtils.clamp(Math.abs(xVal) / 0.5, 0, 1))) * flatRatio;
                pos.setZ(i, zVal);
            }
            pos.needsUpdate = true;
            return g.scale(w, h, 1);
        };

        // Массив для всех лепестков
        const petals = [];

        // Создаём лепестки по кругу
        for (let i = 0; i < petalAmount; i++) {
            const ratio = i / petalAmount;
            const angle = ratio * Math.PI * 2;

            // Чередуем размеры лепестков
            const w = 0.8 + Math.sin(ratio * Math.PI * 5) * 0.2;
            const h = 2.5 - ratio * 1.2;
            const flatRatio = 0.5 + ratio * 0.5;

            const pg = petalGeometry(w, h, flatRatio);

            // Наклоняем лепесток наружу
            const tilt = 0.2 + ratio * 0.8;
            pg.rotateX(tilt);

            // Смещаем и поворачиваем вокруг центра
            pg.translate(0, 0, 0.3 + ratio * 0.5);
            pg.rotateY(angle);

            petals.push(pg);
        }

        // Объединяем все лепестки
        const flowerGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(petals);

        // Материал точек: голубой неон со свечением
        const material = new THREE.PointsMaterial({
            color: 0x00d2ff,
            size: 0.045,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        super(flowerGeometry, material);
    }
}


// ============================================================
// Сцена, камера, рендерер
// ============================================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.03);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);


// ============================================================
// Управление камерой мышью
// ============================================================
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;


// ============================================================
// Цветок
// ============================================================
const flower = new PointFlower();
scene.add(flower);


// ============================================================
// Поле волнистых частиц вокруг цветка
// ============================================================
const particleCount = 25000;
const particlesGeom = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorCenter = new THREE.Color(0x00ffff); // голубой центр
const colorEdge = new THREE.Color(0x0033aa);   // тёмно-синий край

for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.pow(Math.random(), 1.5) * 12;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = -1.5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const ratio = radius / 14;
    const c = colorCenter.clone().lerp(colorEdge, ratio);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
}

particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particleField = new THREE.Points(particlesGeom, particlesMaterial);
scene.add(particleField);


// ============================================================
// Анимация
// ============================================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Медленное вращение
    flower.rotation.y = elapsedTime * 0.15;
    particleField.rotation.y = elapsedTime * 0.08;

    // Волны на поле частиц
    const posAttr = particleField.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);

        const dist = Math.sqrt(x * x + z * z);
        const wave = Math.sin(dist * 0.8 - elapsedTime * 2.0) * 0.35 * (1.5 / (dist + 0.5));

        posAttr.setY(i, -1.8 + wave);
    }
    posAttr.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
}

animate();


// ============================================================
// Адаптация под изменение окна
// ============================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});