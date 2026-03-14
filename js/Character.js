/**
 * Character.js - Base class untuk karakter (Thoriq & Grace)
 */
class Character {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.skinColor = options.skinColor || 0xc68642;
        this.clothColor = options.clothColor || 0x3a2060;
        this.hairColor = options.hairColor || 0x1a0a00;
        this.isGrace = options.isGrace || false;

        this.arms = [];
        this.legs = [];
        this.headGroup = new THREE.Group();
        this.init();
    }

    init() {
        if (this.isGrace) {
            this.buildGrace();
        } else {
            this.buildThoriq();
        }
        this.scene.add(this.group);
    }

    buildThoriq() {
        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), new THREE.MeshLambertMaterial({ color: this.clothColor }));
        torso.position.y = 1.1;
        this.group.add(torso);

        // Create Head Group to contain everything that rotates with the head
        this.headGroup.position.y = 1.58;
        this.group.add(this.headGroup);

        // Head Box
        this.headBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.32), new THREE.MeshLambertMaterial({ color: this.skinColor }));
        this.headGroup.add(this.headBox);

        // Hair
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.14, 0.34), new THREE.MeshLambertMaterial({ color: this.hairColor }));
        hair.position.y = 0.18;
        this.headGroup.add(hair);

        // Eyes & Smile (Add to headGroup)
        this.addFaceDetails(0.01, -0.11);

        // Arms & Legs
        this.addLimbs(0.3, 1.05, 0.65, 0x1a1a3a);
    }

    buildGrace() {
        // Dress
        const dress = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 0.6, 8), new THREE.MeshLambertMaterial({ color: this.clothColor }));
        dress.position.y = 1.05;
        this.group.add(dress);

        // Create Head Group
        this.headGroup.position.y = 1.5;
        this.group.add(this.headGroup);

        // Head Box
        this.headBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.3), new THREE.MeshLambertMaterial({ color: this.skinColor }));
        this.headGroup.add(this.headBox);

        // Long Hair
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.32), new THREE.MeshLambertMaterial({ color: this.hairColor }));
        hairTop.position.y = 0.15;
        this.headGroup.add(hairTop);

        const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.1), new THREE.MeshLambertMaterial({ color: this.hairColor }));
        hairBack.position.set(0, -0.15, -0.12);
        this.headGroup.add(hairBack);

        // Eyes & Smile
        this.addFaceDetails(0.0, -0.1);

        // Arms & Legs Simple
        this.addLimbs(0.28, 1.15, 0.5, this.skinColor, true);
    }

    addFaceDetails(eyeLine, smileLine) {
        [-0.08, 0.08].forEach(x => {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), new THREE.MeshLambertMaterial({ color: 0x111111 }));
            eye.position.set(x, eyeLine, 0.165);
            this.headGroup.add(eye);
        });
        const smile = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), new THREE.MeshLambertMaterial({ color: this.isGrace ? 0xff4488 : 0x8b3a2a }));
        smile.position.set(0, smileLine, 0.165);
        this.headGroup.add(smile);
    }

    addLimbs(armGap, armY, legY, pantColor, isGrace = false) {
        // Arms
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), new THREE.MeshLambertMaterial({ color: isGrace ? this.skinColor : this.clothColor }));
            arm.position.set(side * armGap, armY, 0);
            this.group.add(arm);
            this.arms.push(arm);
        });

        // Legs
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.4, 0.13), new THREE.MeshLambertMaterial({ color: isGrace ? this.skinColor : pantColor }));
            leg.position.set(side * 0.15, legY, 0);
            this.group.add(leg);
            this.legs.push(leg);
        });
    }

    animateIdle(frame) {
        this.headGroup.rotation.y = Math.sin(frame * 0.015) * 0.15;
        this.group.position.y = Math.sin(frame * 0.04) * 0.03;
    }

    animateWalk(frame) {
        const walkSpeed = 0.20; // Slightly slower for smoothness
        this.legs[0].rotation.x = Math.sin(frame * walkSpeed) * 0.5;
        this.legs[1].rotation.x = -Math.sin(frame * walkSpeed) * 0.5;
        this.arms[0].rotation.x = -Math.sin(frame * walkSpeed) * 0.4;
        this.arms[1].rotation.x = Math.sin(frame * walkSpeed) * 0.4;
        this.group.position.y = Math.abs(Math.sin(frame * walkSpeed * 2)) * 0.04; // Reduced height
        this.headGroup.rotation.y *= 0.85; // Damping head jitter
    }

    stopAnimation() {
        this.legs.forEach(l => l.rotation.x *= 0.8);
        this.arms.forEach(a => a.rotation.x *= 0.8);
    }
}
