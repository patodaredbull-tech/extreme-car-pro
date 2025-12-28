/**
 * CAR MODEL FACTORY MODULE
 * Creates detailed 3D car models using multiple combined geometries.
 * Each car has: chassis base, hood, cabin, trunk, bumpers, and wheels.
 */

import * as THREE from 'three';

export class CarModelFactory {
    /**
     * Creates a detailed car mesh from a preset.
     * @param {object} preset - Car preset from CarPresets.js
     * @param {THREE.Scene} scene - Scene to add the car to.
     * @returns {CarModel}
     */
    static create(preset, scene) {
        return new CarModel(preset, scene);
    }
}

class CarModel {
    constructor(preset, scene) {
        this.preset = preset;
        this.scene = scene;
        this.group = new THREE.Group();
        this.wheelMeshes = [];

        this.buildBody();
        this.buildWheels();

        scene.add(this.group);
    }

    buildBody() {
        const p = this.preset;
        const bodyMat = new THREE.MeshStandardMaterial({
            color: p.bodyColor,
            metalness: 0.85,
            roughness: 0.18
        });
        const darkMat = new THREE.MeshStandardMaterial({
            color: p.accentColor,
            metalness: 0.9,
            roughness: 0.1
        });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x224466,
            metalness: 1.0,
            roughness: 0.0,
            transparent: true,
            opacity: 0.5
        });

        // DIMENSIONS
        const W = p.chassisWidth;
        const H = p.chassisHeight;
        const L = p.chassisLength;

        // 1. BASE CHASSIS (lower body)
        const baseGeo = new THREE.BoxGeometry(W, H * 0.5, L);
        const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
        baseMesh.position.y = H * 0.25;
        baseMesh.castShadow = true;
        this.group.add(baseMesh);

        // 2. HOOD (front section, slightly sloped)
        const hoodGeo = new THREE.BoxGeometry(W * 0.95, H * 0.3, L * 0.32);
        const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
        hoodMesh.position.set(0, H * 0.65, L * 0.28);
        hoodMesh.rotation.x = -0.08;
        hoodMesh.castShadow = true;
        this.group.add(hoodMesh);

        // 3. CABIN / ROOF (glass and top)
        const cabinGeo = new THREE.BoxGeometry(W * 0.88, H * 0.55, L * 0.4);
        const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
        cabinMesh.position.set(0, H * 0.95, -L * 0.05);
        cabinMesh.castShadow = true;
        this.group.add(cabinMesh);

        // 4. ROOF (solid top)
        const roofGeo = new THREE.BoxGeometry(W * 0.85, H * 0.12, L * 0.35);
        const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
        roofMesh.position.set(0, H * 1.28, -L * 0.05);
        roofMesh.castShadow = true;
        this.group.add(roofMesh);

        // 5. TRUNK (rear section)
        const trunkGeo = new THREE.BoxGeometry(W * 0.92, H * 0.4, L * 0.25);
        const trunkMesh = new THREE.Mesh(trunkGeo, bodyMat);
        trunkMesh.position.set(0, H * 0.55, -L * 0.35);
        trunkMesh.castShadow = true;
        this.group.add(trunkMesh);

        // 6. FRONT BUMPER
        const fBumperGeo = new THREE.BoxGeometry(W * 1.02, H * 0.22, 0.15);
        const fBumperMesh = new THREE.Mesh(fBumperGeo, darkMat);
        fBumperMesh.position.set(0, H * 0.15, L * 0.5);
        fBumperMesh.castShadow = true;
        this.group.add(fBumperMesh);

        // 7. REAR BUMPER
        const rBumperGeo = new THREE.BoxGeometry(W * 1.02, H * 0.22, 0.15);
        const rBumperMesh = new THREE.Mesh(rBumperGeo, darkMat);
        rBumperMesh.position.set(0, H * 0.15, -L * 0.5);
        rBumperMesh.castShadow = true;
        this.group.add(rBumperMesh);

        // 8. HEADLIGHTS
        const lightGeo = new THREE.BoxGeometry(0.25, 0.12, 0.08);
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffcc,
            emissiveIntensity: 0.3
        });

        const hl1 = new THREE.Mesh(lightGeo, lightMat);
        hl1.position.set(-W * 0.38, H * 0.35, L * 0.5);
        this.group.add(hl1);

        const hl2 = new THREE.Mesh(lightGeo, lightMat);
        hl2.position.set(W * 0.38, H * 0.35, L * 0.5);
        this.group.add(hl2);

        // 9. TAIL LIGHTS
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });

        const tl1 = new THREE.Mesh(lightGeo, tailMat);
        tl1.position.set(-W * 0.38, H * 0.35, -L * 0.5);
        this.group.add(tl1);

        const tl2 = new THREE.Mesh(lightGeo, tailMat);
        tl2.position.set(W * 0.38, H * 0.35, -L * 0.5);
        this.group.add(tl2);

        // 10. SIDE SKIRTS
        const skirtGeo = new THREE.BoxGeometry(0.08, H * 0.25, L * 0.7);
        const skirtMat = darkMat;

        const skL = new THREE.Mesh(skirtGeo, skirtMat);
        skL.position.set(-W * 0.52, H * 0.12, 0);
        skL.castShadow = true;
        this.group.add(skL);

        const skR = new THREE.Mesh(skirtGeo, skirtMat);
        skR.position.set(W * 0.52, H * 0.12, 0);
        skR.castShadow = true;
        this.group.add(skR);
    }

    buildWheels() {
        const p = this.preset;
        const r = p.wheelRadius;
        const trackHalf = p.wheelTrack / 2;
        const baseHalf = p.wheelBase / 2;

        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });

        const wheelPositions = [
            { x: -trackHalf, z: baseHalf },
            { x: trackHalf, z: baseHalf },
            { x: -trackHalf, z: -baseHalf },
            { x: trackHalf, z: -baseHalf }
        ];

        wheelPositions.forEach((pos, i) => {
            const wheelGroup = new THREE.Group();

            // Tire
            const tireGeo = new THREE.CylinderGeometry(r, r, 0.28, 24);
            tireGeo.rotateZ(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.castShadow = true;
            wheelGroup.add(tire);

            // Rim
            const rimGeo = new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.3, 16);
            rimGeo.rotateZ(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeo, rimMat);
            wheelGroup.add(rim);

            // Spokes (simple discs)
            const spokeGeo = new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.05, 5);
            spokeGeo.rotateZ(Math.PI / 2);
            const spoke = new THREE.Mesh(spokeGeo, rimMat);
            spoke.position.x = (i % 2 === 0) ? -0.12 : 0.12;
            wheelGroup.add(spoke);

            wheelGroup.position.set(pos.x, r, pos.z);
            this.group.add(wheelGroup);
            this.wheelMeshes.push(wheelGroup);
        });
    }

    syncWithPhysics(vehicleController) {
        // Sync chassis
        const pos = vehicleController.getPosition();
        const quat = vehicleController.getQuaternion();
        this.group.position.set(pos.x, pos.y, pos.z);
        this.group.quaternion.set(quat.x, quat.y, quat.z, quat.w);

        // Sync wheels
        for (let i = 0; i < 4; i++) {
            const wt = vehicleController.getWheelTransform(i);
            this.wheelMeshes[i].position.set(wt.position.x, wt.position.y, wt.position.z);
            this.wheelMeshes[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
        }
    }

    getMesh() {
        return this.group;
    }

    destroy() {
        this.scene.remove(this.group);
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
