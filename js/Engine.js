/**
 * Engine.js - Core logic: Renderer, Loop, Camera, Controls
 */
class Engine {
    constructor() {
        this.frame = 0;
        this.keys = {};
        this.isNearThoriq = false;
        this.isNearCake = false;
        this.isNearMading = false;
        this.isNearTelescope = false;
        this.isOverlayVisible = false;
        this.isTelescopeActive = false;
        this.curYaw = Math.PI;
        this.musicStarted = false;

        this.initThree();
        this.world = new World(this.scene);
        this.initCharacters();
        this.initControls();
        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camState = {
            distance: 5,
            angleH: Math.PI,
            angleV: 0.3,
            target: new THREE.Vector3(),
            smoothH: Math.PI,
            smoothV: 0.3
        };
    }

    initCharacters() {
        this.thoriq = new Character(this.scene, {
            skinColor: 0xc68642,
            clothColor: 0x3a2060,
            isGrace: false
        });
        this.thoriq.group.position.set(0, 0, 1.6);
        this.thoriq.group.rotation.y = Math.PI;

        this.grace = new Character(this.scene, {
            skinColor: 0xffe0bd,
            clothColor: 0xff85c0,
            hairColor: 0x3d2b1f,
            isGrace: true
        });
        this.player = {
            pos: new THREE.Vector3(0, 0, 6),
            yaw: Math.PI
        };

        // Interact Ring
        const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 32);
        this.ringMat = new THREE.MeshBasicMaterial({ color: 0xff80c0, transparent: true, opacity: 0 });
        const ring = new THREE.Mesh(ringGeo, this.ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.05, 1.6);
        this.scene.add(ring);
    }

    initControls() {
        window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

        let isDragging = false;
        let lastX = 0, lastY = 0;

        const container = document.getElementById('canvas-container');

        container.addEventListener('mousedown', e => {
            if (e.target.tagName !== 'INPUT') {
                container.requestPointerLock();
                isDragging = true;
            }
        });

        document.addEventListener('pointerlockchange', () => {
            isDragging = document.pointerLockElement === container;
            if (isDragging) container.classList.add('dragging');
            else container.classList.remove('dragging');
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            // Sensitivity adjustment
            const sense = 0.003;
            this.camState.angleH -= e.movementX * sense;
            this.camState.angleV -= e.movementY * sense;
            this.camState.angleV = Math.max(-0.05, Math.min(1.0, this.camState.angleV));
        });
        window.addEventListener('mouseup', () => isDragging = false);
        container.addEventListener('wheel', e => {
            this.camera.zoom = Math.max(0.5, Math.min(2.0, (this.camera.zoom || 1.0) - e.deltaY * 0.001));
            this.camera.updateProjectionMatrix();
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initialize Music on first interaction
        const startMusic = () => {
            if (!this.musicStarted) {
                const audio = new Audio('Musik/Reality_Club_-_Alexandra_(mp3.pm).mp3');
                audio.loop = true;
                audio.volume = 0.4;
                audio.play().catch(() => console.log("Music blocked - click screen first"));
                this.musicStarted = true;
            }
        };
        container.addEventListener('mousedown', startMusic);
        window.addEventListener('keydown', startMusic);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.frame++;

        this.world.update(this.frame);
        this.handleMovement();
        this.updateCamera();
        this.checkInteraction();

        this.renderer.render(this.scene, this.camera);
    }

    handleMovement() {
        if (this.isOverlayVisible) return;

        const moveDir = new THREE.Vector3();
        // Use SMOOTHED camera angle to calculate direction to avoid frame jitter from mouse movement
        const forward = new THREE.Vector3(-Math.sin(this.camState.smoothH), 0, -Math.cos(this.camState.smoothH));
        const right = new THREE.Vector3(Math.cos(this.camState.smoothH), 0, -Math.sin(this.camState.smoothH));

        if (this.keys['w']) moveDir.add(forward);
        if (this.keys['s']) moveDir.sub(forward);
        if (this.keys['a']) moveDir.sub(right);
        if (this.keys['d']) moveDir.add(right);

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(0.065);
            this.player.pos.add(moveDir);

            const targetYaw = Math.atan2(moveDir.x, moveDir.z);
            let diff = targetYaw - this.curYaw;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.curYaw += diff * 0.2; // Slightly faster turn to feel responsive

            this.grace.animateWalk(this.frame);
        } else {
            this.grace.stopAnimation();
            this.grace.animateIdle(this.frame);
        }

        // Apply consolidated visual updates
        this.grace.group.position.set(
            this.player.pos.x,
            this.grace.group.position.y, // Maintain Y from animation
            this.player.pos.z
        );
        this.grace.group.rotation.y = this.curYaw;

        this.thoriq.animateIdle(this.frame);
    }

    updateCamera() {
        if (this.isTelescopeActive) {
            // Telescope View: Locked on sky, zoomed in
            this.camera.fov = 30; // Zoom in
            this.camera.updateProjectionMatrix();

            this.camera.position.set(this.player.pos.x - 0.5, this.player.pos.y + 1.8, this.player.pos.z + 0.5);
            const lukAt = new THREE.Vector3(this.player.pos.x, this.player.pos.y + 10, this.player.pos.z);
            this.camera.lookAt(lukAt);
            return;
        }

        this.camera.fov = 65; // Normal View
        this.camera.updateProjectionMatrix();

        // Keyboard Camera Rotation (Arrow Keys)
        const rotSpeed = 0.03;
        if (this.keys['arrowleft']) this.camState.angleH -= rotSpeed;
        if (this.keys['arrowright']) this.camState.angleH += rotSpeed;
        if (this.keys['arrowup']) this.camState.angleV -= rotSpeed;
        if (this.keys['arrowdown']) this.camState.angleV += rotSpeed;

        // Vertical Limit: Allow looking higher at the sky
        this.camState.angleV = Math.max(-1.1, Math.min(1.2, this.camState.angleV));

        // Smooth interpolation
        this.camState.smoothH += (this.camState.angleH - this.camState.smoothH) * 0.15;
        this.camState.smoothV += (this.camState.angleV - this.camState.smoothV) * 0.15;

        const dist = this.camState.distance;
        const camX = this.player.pos.x + dist * Math.sin(this.camState.smoothH) * Math.cos(this.camState.smoothV);
        const camY = this.player.pos.y + 1.6 + dist * Math.sin(this.camState.smoothV) * 1.5; // Emphasize vertical for sky
        const camZ = this.player.pos.z + dist * Math.cos(this.camState.smoothH) * Math.cos(this.camState.smoothV);

        this.camera.position.set(camX, camY, camZ);
        this.camState.target.set(this.player.pos.x, this.player.pos.y + 1.1, this.player.pos.z);
        this.camera.lookAt(this.camState.target);
    }

    checkInteraction() {
        // Distance to Thoriq (0, 0, 1.6)
        const dxT = this.player.pos.x - 0;
        const dzT = this.player.pos.z - 1.6;
        const distT = Math.sqrt(dxT * dxT + dzT * dzT);
        this.isNearThoriq = distT < 2.5;

        // Distance to Cake (0, 0, 0)
        const dxC = this.player.pos.x - 0;
        const dzC = this.player.pos.z - 0;
        const distC = Math.sqrt(dxC * dxC + dzC * dzC);
        this.isNearCake = distC < 2.0;

        // Distance to Mading (2, 0, 0)
        const dxM = this.player.pos.x - 2.5;
        const dzM = this.player.pos.z - 0;
        const distM = Math.sqrt(dxM * dxM + dzM * dzM);
        this.isNearMading = distM < 2.0;

        // Distance to Telescope (-4, 0, 2)
        const dxTe = this.player.pos.x - (-4);
        const dzTe = this.player.pos.z - 2;
        const distTe = Math.sqrt(dxTe * dxTe + dzTe * dzTe);
        this.isNearTelescope = distTe < 2.0;

        const prompt = document.getElementById('interact-prompt');

        if (this.isNearThoriq) {
            prompt.innerHTML = 'Tekan <b>E</b> untuk menyapa Thoriq 💌';
            prompt.classList.add('visible');
            this.ringMat.opacity = 0.4 + Math.sin(this.frame * 0.08) * 0.2;
            const angle = Math.atan2(this.player.pos.x - this.thoriq.group.position.x, this.player.pos.z - this.thoriq.group.position.z);
            this.thoriq.group.rotation.y = angle;
        } else if (this.isNearCake) {
            prompt.innerHTML = 'Tekan <b>E</b> untuk melihat kejutan 🎂';
            prompt.classList.add('visible');
            this.ringMat.opacity = 0;
        } else if (this.isNearMading) {
            prompt.innerHTML = 'Tekan <b>E</b> untuk melihat Mading Poto 🖼️';
            prompt.classList.add('visible');
            this.ringMat.opacity = 0;
        } else if (this.isNearTelescope) {
            prompt.innerHTML = this.isTelescopeActive ? 'Klik kiri atau tekan <b>E</b> untuk berhenti' : 'Tekan <b>E</b> untuk melihat Langit 🔭';
            prompt.classList.add('visible');
            this.ringMat.opacity = 0;
        } else {
            prompt.classList.remove('visible');
            this.ringMat.opacity = 0;
            if (this.thoriq) this.thoriq.group.rotation.y += (Math.PI - this.thoriq.group.rotation.y) * 0.05;
        }

        // Show floating text labels on proximity
        const labelEl = document.getElementById('interact-prompt'); // Reuse prompt for labels
        let foundLabel = false;
        this.world.floatingTexts.forEach(t => {
            const dist = this.player.pos.distanceTo(t.position);
            if (dist < 4) {
                labelEl.innerHTML = `<span style="color:#ff85c0; font-family:'Cormorant Garamond'; font-size:1.5rem;">${t.userData.label}</span>`;
                labelEl.classList.add('visible');
                foundLabel = true;
            }
        });
        if (!foundLabel && !this.isNearThoriq && !this.isNearCake) {
            labelEl.classList.remove('visible');
        }
    }
}
