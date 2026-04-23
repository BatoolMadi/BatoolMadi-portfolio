// Three.js Scene Setup
let scene, camera, renderer, aiCore;
let mouseX = 0, mouseY = 0;
let targetCameraX = 0, targetCameraY = 0;
let cameraX = 0, cameraY = 0;

// Initialize Three.js Scene
function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('canvas-container');

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.001);

    // Camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 15);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0e27, 1);

    // Create AI Core
    createAICore();

    // Add ambient particles
    createParticles();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Mouse movement for camera
    document.addEventListener('mousemove', onMouseMove);

    // Start animation loop
    renderer.setAnimationLoop(animate);
}

// Create AI Core Neural Network Structure
function createAICore() {
    const coreGroup = new THREE.Group();
    const nodeCount = 50;
    const nodes = [];
    const connections = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = createNode();
        const radius = 3 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        node.position.x = radius * Math.sin(phi) * Math.cos(theta);
        node.position.y = radius * Math.sin(phi) * Math.sin(theta);
        node.position.z = radius * Math.cos(phi);
        
        nodes.push(node);
        coreGroup.add(node);
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < 3) {
                const connection = createConnection(nodes[i].position, nodes[j].position);
                connections.push(connection);
                coreGroup.add(connection);
            }
        }
    }

    // Add central core
    const centralCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.0, 1),
        new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        })
    );
    centralCore.position.set(0, 0, 0);
    coreGroup.add(centralCore);

    // Add pulsing glow
    const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.05
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    coreGroup.add(glow);

    scene.add(coreGroup);
    aiCore = coreGroup;
}

// Create individual node
function createNode() {
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.8
    });
    const node = new THREE.Mesh(geometry, material);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b7cf6,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    node.add(glow);

    return node;
}

// Create connection line between nodes
function createConnection(start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.3
    });
    return new THREE.Line(geometry, material);
}

// Create ambient particles
function createParticles() {
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;

        const color = new THREE.Color(0x4a9eff);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

// Camera animation
let cameraTime = 0;
function updateCamera() {
    cameraTime += 0.005;

    // Smooth camera movement following mouse
    cameraX += (targetCameraX - cameraX) * 0.05;
    cameraY += (targetCameraY - cameraY) * 0.05;

    // Cinematic orbiting
    const orbitRadius = 15;
    const baseX = Math.sin(cameraTime) * 2;
    const baseY = Math.cos(cameraTime * 0.7) * 1.5;
    const baseZ = 15 + Math.sin(cameraTime * 0.5) * 2;

    camera.position.x = baseX + cameraX * 0.5;
    camera.position.y = baseY + cameraY * 0.5;
    camera.position.z = baseZ;

    // Camera looks at center with slight offset
    camera.lookAt(
        cameraX * 0.3,
        cameraY * 0.3,
        0
    );
}

// Animate AI Core
function animateAICore() {
    if (!aiCore) return;

    const time = Date.now() * 0.001;

    // Rotate core slowly
    aiCore.rotation.y = time * 0.2;
    aiCore.rotation.x = Math.sin(time * 0.3) * 0.2;

    // Animate nodes
    aiCore.children.forEach((child, index) => {
        if (child.type === 'Mesh' && child.geometry.type === 'SphereGeometry') {
            const pulse = Math.sin(time * 2 + index * 0.1) * 0.1 + 1;
            child.scale.setScalar(pulse);
            
            // Update opacity
            if (child.material) {
                child.material.opacity = 0.6 + Math.sin(time * 3 + index) * 0.2;
            }
        }
    });
}

// Animation loop
function animate() {
    updateCamera();
    animateAICore();

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    targetCameraX = mouseX * 2;
    targetCameraY = mouseY * 2;
}

// Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    let lastScroll = 0;
    const nav = document.getElementById('nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 14, 39, 0.95)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(10, 14, 39, 0.7)';
            nav.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// Parallax effect for hero section
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.getElementById('hero');
        const canvasContainer = document.getElementById('canvas-container');

        // Parallax effect
        if (hero && scrolled < window.innerHeight) {
            const parallax = scrolled * 0.5;
            hero.style.transform = `translateY(${parallax}px)`;
            canvasContainer.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        }

        // Fade AI Core 
        if (aiCore) {
            const fadeStart = 0;     // يبدأ من أول سكرول
            const fadeEnd = 2000;    // كل ما تكبريه = fade أبطأ

            let opacity = 1 - (scrolled / fadeEnd);
            opacity = Math.max(0.1, opacity); //  مهم: ما يختفي، أقل شي 0.1

            aiCore.traverse((child) => {
                if (child.material && child.material.transparent) {
                    child.material.opacity = opacity * 0.6;
                }
            });
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    initParallax();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is hidden
        renderer.setAnimationLoop(null);
    } else {
        // Resume animations
        renderer.setAnimationLoop(animate);
    }
});

