const canvas = document.getElementById('stage');
const ctx    = canvas.getContext('2d');
const toast  = document.getElementById('toast');
const hint   = document.getElementById('hint');

// --- Настройки ---
const CFG = {
    TARGET_COUNT:    1500,
    SPAWN_PER_FRAME: 30,
    ATTRACTION:      0.5,
    MAX_SPEED:       12,
    INNER_RADIUS:    25,
    SPAWN_MARGIN:    40,

    PARTICLE_RADIUS: 2.5,
    GLOW_RADIUS:     5,

    TRAIL_ALPHA:     0.12,
    BG_COLOR:        '#03030f'
};

// --- Текущая форма частиц ---
let shape = 'circle';   // 'circle' | 'square'

let W = 0, H = 0;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = CFG.BG_COLOR;
    ctx.fillRect(0, 0, W, H);
}
window.addEventListener('resize', resize);
resize();


// ============================================================
//  Пути для обеих форм — строим один раз при старте
// ============================================================

// Круг
const coreCircle = new Path2D();
coreCircle.arc(0, 0, CFG.PARTICLE_RADIUS, 0, Math.PI * 2);

const glowCircle = new Path2D();
glowCircle.arc(0, 0, CFG.GLOW_RADIUS, 0, Math.PI * 2);

// Квадрат (вписан в тот же радиус)
const coreSquare = new Path2D();
coreSquare.rect(-CFG.PARTICLE_RADIUS, -CFG.PARTICLE_RADIUS,
                 CFG.PARTICLE_RADIUS * 2, CFG.PARTICLE_RADIUS * 2);

const glowSquare = new Path2D();
glowSquare.rect(-CFG.GLOW_RADIUS, -CFG.GLOW_RADIUS,
                 CFG.GLOW_RADIUS * 2, CFG.GLOW_RADIUS * 2);

function currentPaths() {
    return shape === 'circle'
        ? { core: coreCircle, glow: glowCircle }
        : { core: coreSquare, glow: glowSquare };
}


// ============================================================
//  Переключение формы
// ============================================================
function toggleShape() {
    shape = (shape === 'circle') ? 'square' : 'circle';

    toast.textContent = shape === 'circle' ? '● Кружки' : '■ Квадратики';
    toast.classList.add('show');
    clearTimeout(toggleShape._t);
    toggleShape._t = setTimeout(() => toast.classList.remove('show'), 900);

    hint.style.opacity = '0';
}

let lastDownTime = 0;
let lastDownX = 0;
let lastDownY = 0;

const DBL_MS = 350;    // мс между нажатиями
const DBL_DIST = 40;   // максимальное расстояние в пикселях между нажатиями

canvas.addEventListener('pointerdown', (e) => {
    const now = performance.now();
    const dt = now - lastDownTime;
    const dx = e.clientX - lastDownX;
    const dy = e.clientY - lastDownY;
    const dist = Math.hypot(dx, dy);

    spawnPulse(e.clientX, e.clientY);

    if (dt < DBL_MS && dist < DBL_DIST) {
        toggleShape();
        lastDownTime = 0;
    } else {
        lastDownTime = now;
        lastDownX = e.clientX;
        lastDownY = e.clientY;
    }
});

function spawnPulse(x, y) {
    const el = document.createElement('div');
    el.className = 'pulse';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 450);
}


// ============================================================
//  Курсор
// ============================================================
const mouse = { x: W / 2, y: H / 2 };

canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
});


// ============================================================
//  Частицы
// ============================================================
const particles = [];

function spawnParticle() {
    const side = (Math.random() * 4) | 0;
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -CFG.SPAWN_MARGIN; }
    else if (side === 1) { x = Math.random() * W; y = H + CFG.SPAWN_MARGIN; }
    else if (side === 2) { x = -CFG.SPAWN_MARGIN; y = Math.random() * H; }
    else { x = W + CFG.SPAWN_MARGIN; y = Math.random() * H; }
    return { x, y, vx: 0, vy: 0 };
}

for (let i = 0; i < CFG.TARGET_COUNT; i++) {
    const p = spawnParticle();
    p.x = Math.random() * W;
    p.y = Math.random() * H;
    particles.push(p);
}


// ============================================================
//  Свечение курсора
// ============================================================
function drawCursorGlow(x, y) {
    const outerR = 60;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, outerR);
    grad.addColorStop(0.00, 'rgba(255, 255, 255, 1.00)');
    grad.addColorStop(0.07, 'rgba(200, 235, 255, 0.95)');
    grad.addColorStop(0.18, 'rgba(140, 195, 255, 0.75)');
    grad.addColorStop(0.35, 'rgba( 70, 130, 200, 0.45)');
    grad.addColorStop(0.65, 'rgba( 25,  55,  95, 0.18)');
    grad.addColorStop(1.00, 'rgba( 10,  20,  40, 0.00)');

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, outerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}


// ============================================================
//  Главный цикл
// ============================================================
function frame() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(3, 3, 15, ${CFG.TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < CFG.SPAWN_PER_FRAME; i++) {
        if (particles.length < CFG.TARGET_COUNT) {
            particles.push(spawnParticle());
        }
    }

    const mx = mouse.x, my = mouse.y;
    const innerR2 = CFG.INNER_RADIUS * CFG.INNER_RADIUS;
    const paths = currentPaths();

    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < innerR2) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
            continue;
        }

        const dist = Math.sqrt(distSq);
        p.vx += (dx / dist) * CFG.ATTRACTION;
        p.vy += (dy / dist) * CFG.ATTRACTION;

        const sp = Math.hypot(p.vx, p.vy);
        if (sp > CFG.MAX_SPEED) {
            const k = CFG.MAX_SPEED / sp;
            p.vx *= k;
            p.vy *= k;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -200 || p.x > W + 200 || p.y < -200 || p.y > H + 200) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
            continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        ctx.fillStyle = 'rgba(90, 160, 255, 0.25)';
        ctx.fill(paths.glow);

        ctx.fillStyle = 'rgba(210, 240, 255, 0.95)';
        ctx.fill(paths.core);

        ctx.restore();
    }

    drawCursorGlow(mx, my);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);