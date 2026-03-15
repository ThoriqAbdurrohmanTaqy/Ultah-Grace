/**
 * World.js - Menangani lingkungan, pencahayaan, dan objek statis
 */
class World {
    constructor(scene) {
        this.scene = scene;
        this.heartParticles = [];
        this.fireworks = [];
        this.floatingTexts = [];
        this.lanterns = [];
        this.setupEnvironment();
    }



    setupEnvironment() {
        // Fog & Background
        this.scene.fog = new THREE.FogExp2(0x0a0612, 0.03);
        this.scene.background = new THREE.Color(0x0a0612);

        // Lights
        this.scene.add(new THREE.AmbientLight(0x2a1035, 2.4));

        const moonLight = new THREE.DirectionalLight(0xd4b8ff, 0.9);
        moonLight.position.set(10, 25, 10);
        moonLight.castShadow = true;
        this.scene.add(moonLight);

        this.pinkLight1 = new THREE.PointLight(0xff6eb4, 4, 40);
        this.pinkLight1.position.set(5, 5, 5);
        this.scene.add(this.pinkLight1);

        this.pinkLight2 = new THREE.PointLight(0xb06aff, 3, 35);
        this.pinkLight2.position.set(-8, 6, -8);
        this.scene.add(this.pinkLight2);

        // Center Warm Glow
        const centerLight = new THREE.PointLight(0xffaa44, 2, 20);
        centerLight.position.set(0, 2, 0);
        this.scene.add(centerLight);

        // Interaction Point Lights
        const cakeLight = new THREE.PointLight(0xfff0dd, 2.5, 10);
        cakeLight.position.set(0, 1.5, 0);
        this.scene.add(cakeLight);

        const madingLight = new THREE.PointLight(0xff85c0, 2.5, 12);
        madingLight.position.set(5, 2, -3);
        this.scene.add(madingLight);

        const thoriqLight = new THREE.PointLight(0xb06aff, 2, 10);
        thoriqLight.position.set(0, 2, 1.6);
        this.scene.add(thoriqLight);

        const telescopeLight = new THREE.PointLight(0xcfb53b, 2.5, 8);
        telescopeLight.position.set(-4, 2, 2);
        this.scene.add(telescopeLight);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(70, 72),
            new THREE.MeshLambertMaterial({ color: 0x1a0a2e })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        this.createStars();
        this.createForest();
        this.createFlowers();
        this.createLanterns();
        this.createPath();
        this.createCake();
        this.createMading();
        this.createTelescope();
        this.createFloatingTexts();
    }

    createStars() {
        const geo = new THREE.BufferGeometry();
        const v = [];
        for (let i = 0; i < 2000; i++) {
            const r = 90 + Math.random() * 40;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.random() * Math.PI;
            v.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
        this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, sizeAttenuation: true })));
    }

    createForest() {
        const trees = [[8, 8], [8, -8], [-8, 8], [-8, -8], [14, 3], [14, -3], [-14, 3], [-14, -3],
        [3, 14], [-3, 14], [3, -14], [-3, -14], [18, 10], [-18, 10], [18, -10], [-18, -10],
        [10, 18], [-10, 18], [10, -18], [-10, -18]];

        trees.forEach(([x, z]) => this.addTree(x, z, 0.8 + Math.random() * 0.5));
    }

    addTree(x, z, s = 1) {
        const g = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 1.2 * s, 8),
            new THREE.MeshLambertMaterial({ color: 0x3d1f0a })
        );
        trunk.position.y = 0.6 * s;
        g.add(trunk);

        [0x1a4a2e, 0x2d6b45, 0x1e5a35].forEach((c, i) => {
            const cone = new THREE.Mesh(
                new THREE.ConeGeometry((0.9 - i * 0.15) * s, (1.2 - i * 0.1) * s, 7),
                new THREE.MeshLambertMaterial({ color: c })
            );
            cone.position.y = (1.2 + i * 0.7) * s;
            g.add(cone);
        });
        g.position.set(x, 0, z);
        this.scene.add(g);
    }

    createFlowers() {
        for (let i = 0; i < 100; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 20;
            this.addFlower(Math.cos(a) * r, Math.sin(a) * r);
        }
    }

    addFlower(x, z) {
        const g = new THREE.Group();
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5),
            new THREE.MeshLambertMaterial({ color: 0x2d6b45 })
        );
        stem.position.y = 0.2;
        g.add(stem);

        const cols = [0xff6eb4, 0xff9ed2, 0xffb3de, 0xffd4f0, 0xd46eb4, 0xff80c0];
        const fl = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshLambertMaterial({ color: cols[Math.floor(Math.random() * cols.length)] })
        );
        fl.position.y = 0.45;
        g.add(fl);
        g.position.set(x, 0, z);
        this.scene.add(g);
    }

    createLanterns() {
        const pos = [[4, 4], [4, -4], [-4, 4], [-4, -4], [8, 0], [-8, 0], [0, 8], [0, -8]];
        pos.forEach(([x, z]) => {
            const g = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), new THREE.MeshLambertMaterial({ color: 0x5a3010 }));
            pole.position.y = 1.25; g.add(pole);
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), new THREE.MeshLambertMaterial({ color: 0xff8040, emissive: 0xff4400, emissiveIntensity: 0.8 }));
            box.position.y = 2.7; g.add(box);
            const ll = new THREE.PointLight(0xff9966, 1.5, 8); ll.position.set(x, 3, z); this.scene.add(ll);
            g.position.set(x, 0, z); this.scene.add(g);
        });
    }

    createPath() {
        for (let i = -12; i <= 12; i++) {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.4), new THREE.MeshLambertMaterial({ color: 0x3a2a5a }));
            s.position.set(Math.sin(i * 0.25) * 0.3, 0.02, i * 0.85);
            this.scene.add(s);
        }
    }

    createCake() {
        const g = new THREE.Group();
        const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.5, 16), new THREE.MeshLambertMaterial({ color: 0xf9a8c9 }));
        t1.position.y = 0.25; g.add(t1);
        const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.4, 16), new THREE.MeshLambertMaterial({ color: 0xfce4ec }));
        t2.position.y = 0.7; g.add(t2);
        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8), new THREE.MeshLambertMaterial({ color: 0xfff59d }));
        candle.position.y = 1.025; g.add(candle);

        this.cakeFlame = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffcc00, emissive: 0xff8800, emissiveIntensity: 1 }));
        this.cakeFlame.position.y = 1.19; g.add(this.cakeFlame);

        this.cakeFlameLight = new THREE.PointLight(0xffaa44, 2, 6);
        this.cakeFlameLight.position.set(0, 1.3, 0);
        g.add(this.cakeFlameLight);

        g.position.set(0, 0, 0);
        this.scene.add(g);
    }

    createMading() {
        // Create a single Mading Stand near the cake
        const g = new THREE.Group();

        // Pole/Stand
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0x5a3010 }));
        pole.position.y = 0.9;
        g.add(pole);

        // Board Frame
        const frameGeo = new THREE.BoxGeometry(2.5, 1.8, 0.2);
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x2a1035, emissive: 0xff85c0, emissiveIntensity: 0.1 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 2.0;
        g.add(frame);

        // "Mading" Label or Icon on the board
        const labelGeo = new THREE.PlaneGeometry(2.2, 1.5);
        // Just a placeholder look for the board before opening
        const labelMat = new THREE.MeshBasicMaterial({ color: 0x3d1f40, side: THREE.DoubleSide });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.z = 0.12;
        frame.add(label);

        g.position.set(5, 0, -3);
        g.lookAt(0, 0, 0); // Face the center/cake
        this.scene.add(g);
    }

    createTelescope() {
        const group = new THREE.Group();

        // Tripod (3 legs)
        const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x3d1f0a });
        for (let i = 0; i < 3; i++) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.rotation.z = 0.3;
            leg.rotation.y = (i * Math.PI * 2) / 3;
            leg.position.y = 0.5;
            group.add(leg);
        }

        // Mount
        const mount = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshLambertMaterial({ color: 0x555555 }));
        mount.position.y = 1.1;
        group.add(mount);

        // Tube
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.5, 12);
        const tubeMat = new THREE.MeshLambertMaterial({ color: 0xcfb53b, emissive: 0xcfb53b, emissiveIntensity: 0.1 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.rotation.x = -Math.PI / 2.5; // Points Up
        tube.position.y = 1.3;
        tube.position.z = 0.1;
        group.add(tube);

        group.position.set(-4, 0, 2);
        group.lookAt(0, 0, 0);
        this.scene.add(group);
        this.telescope = group;
    }

    createFloatingTexts() {
        const texts = [
            "I Love You ❤️",
            "Happy Birthday Grace 🎂",
            "Selamanya Bersama ✨",
            "Kamu Cantik Banget 😍",
            "My Only One 💖",
            "Malaikatku 😇",
            "Cintaku Padamu Seluas Langit 🌌",
            "Terima Kasih Sudah Hadir 💌",
            "Hati Ini Milikmu 💓"
        ];
        texts.forEach((t, i) => {
            const group = new THREE.Group();
            const pointGeo = new THREE.SphereGeometry(0.18, 12, 12);
            const pointMat = new THREE.MeshBasicMaterial({ color: 0xff4488, transparent: true, opacity: 0.8 });
            const point = new THREE.Mesh(pointGeo, pointMat);

            // Add a small light to the point
            const light = new THREE.PointLight(0xff4488, 1, 3);
            group.add(light);

            const angle = (i / texts.length) * Math.PI * 2;
            const radius = 8 + Math.random() * 8;
            group.position.set(Math.cos(angle) * radius, 2.5 + Math.random() * 3, Math.sin(angle) * radius);
            group.add(point);
            group.userData = { label: t, phase: Math.random() * 10 };

            this.scene.add(group);
            this.floatingTexts.push(group);
        });
    }

    spawnFirework() {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const y = 15 + Math.random() * 10;

        const count = 25;
        const particles = [];
        const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);

        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 4, 4),
                new THREE.MeshBasicMaterial({ color: color, transparent: true })
            );
            p.position.set(x, y, z);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            );
            particles.push({ mesh: p, vel: vel, life: 1.0 });
            this.scene.add(p);
        }
        this.fireworks.push(particles);
    }

    spawnHeart(cx = 0, cz = 0) {
        const geo = new THREE.SphereGeometry(0.06, 6, 6);
        const cols = [0xff6eb4, 0xff80c0, 0xffd4f0, 0xff4499];
        const mat = new THREE.MeshLambertMaterial({ color: cols[Math.floor(Math.random() * cols.length)], emissive: 0xff4488, emissiveIntensity: 0.5, transparent: true });
        const mesh = new THREE.Mesh(geo, mat);
        const a = Math.random() * Math.PI * 2, r = Math.random() * 3;
        mesh.position.set(cx + Math.cos(a) * r, 0.5 + Math.random() * 0.5, cz + Math.sin(a) * r);
        mesh.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.01 + Math.random() * 0.015, (Math.random() - 0.5) * 0.02);
        mesh.userData.life = 0;
        mesh.userData.maxLife = 120 + Math.random() * 80;
        this.scene.add(mesh);
        this.heartParticles.push(mesh);
    }

    spawnLantern() {
        const g = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.45, 8);
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.85 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        g.add(body);

        const light = new THREE.PointLight(0xff8822, 1.5, 4);
        g.add(light);

        const angle = Math.random() * Math.PI * 2;
        const radius = 12 + Math.random() * 25;
        g.position.set(Math.cos(angle) * radius, -1, Math.sin(angle) * radius);

        g.userData = {
            vY: 0.008 + Math.random() * 0.015,
            phase: Math.random() * Math.PI * 2,
            active: false
        };

        this.scene.add(g);
        this.lanterns.push(g);
    }

    update(frame) {
        // Optimization: Slower spawn and limits
        if (frame % 120 === 0 && this.lanterns.length < 15) this.spawnLantern();

        for (let i = this.lanterns.length - 1; i >= 0; i--) {
            const l = this.lanterns[i];
            l.position.y += l.userData.vY;
            l.position.x += Math.sin(frame * 0.01 + l.userData.phase) * 0.015;
            l.position.z += Math.cos(frame * 0.01 + l.userData.phase) * 0.015;

            // Flicker inner light
            l.children[1].intensity = 1.0 + Math.sin(frame * 0.12 + l.userData.phase) * 0.5;

            if (l.position.y > 50) {
                this.scene.remove(l);
                this.lanterns.splice(i, 1);
            }
        }

        if (this.heartParticles.length > 40) {
            const p = this.heartParticles.shift();
            this.scene.remove(p);
        }
        // Heart particles
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const p = this.heartParticles[i];
            p.userData.life++;
            p.position.add(p.userData.vel);
            p.userData.vel.x += (Math.random() - 0.5) * 0.002;
            p.material.opacity = 1 - p.userData.life / p.userData.maxLife;
            if (p.userData.life >= p.userData.maxLife) {
                this.scene.remove(p);
                this.heartParticles.splice(i, 1);
            }
        }

        // Update Fireworks
        if (frame % 100 === 0 && this.fireworks.length < 3) this.spawnFirework();
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            let deadCount = 0;
            fw.forEach(p => {
                p.mesh.position.add(p.vel);
                p.vel.y -= 0.003;
                p.life -= 0.012;
                p.mesh.material.opacity = p.life;
                if (p.life <= 0) deadCount++;
            });
            if (deadCount >= fw.length) {
                fw.forEach(p => this.scene.remove(p.mesh));
                this.fireworks.splice(i, 1);
            }
        }

        // Update Floating Texts
        this.floatingTexts.forEach(t => {
            t.position.y += Math.sin(frame * 0.02 + t.userData.phase) * 0.01;
            t.rotation.y += 0.01;
        });

        // Ambient animations
        if (this.cakeFlameLight) {
            this.cakeFlameLight.intensity = 1.8 + Math.sin(frame * 0.3) * 0.4 + Math.random() * 0.2;
            this.cakeFlame.scale.setScalar(1 + Math.sin(frame * 0.4) * 0.1);
        }

        if (this.pinkLight1) {
            this.pinkLight1.intensity = 1.8 + Math.sin(frame * 0.02) * 0.5;
            this.pinkLight2.intensity = 1.3 + Math.cos(frame * 0.018) * 0.4;
        }
    }
}
