/**
 * ENVIRONMENT RENDERER MODULE
 * Handles skybox, ground plane, and atmospheric effects.
 */

import * as THREE from 'three';

export class EnvironmentRenderer {
    constructor(scene) {
        this.scene = scene;
        this.setupGround();
    }

    setupGround() {
        // Infinite ground plane for visual continuity
        const groundGeo = new THREE.PlaneGeometry(10000, 10000);
        groundGeo.rotateX(-Math.PI / 2);

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 1.0,
            metalness: 0.0,
            transparent: true,
            opacity: 0
        });

        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.position.y = -50;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    dispose() {
        if (this.ground) {
            this.scene.remove(this.ground);
            this.ground.geometry.dispose();
            this.ground.material.dispose();
        }
    }
}
