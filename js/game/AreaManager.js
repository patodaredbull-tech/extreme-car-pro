/**
 * AREA MANAGER MODULE
 * Handles dynamic loading/unloading of game areas with transitions.
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TerrainGenerator } from '../physics/Terrain.js';

const AREAS = [
    { id: 'CITY', name: 'Cidade Principal', skyColor: 0x88ccff },
    { id: 'DESERT', name: 'Deserto de Mojave', skyColor: 0xf5d6a8 },
    { id: 'MOUNTAIN', name: 'Cordilheira Negra', skyColor: 0x9ab8d6 }
];

const BOUNDARY_THRESHOLD = 750;

export class AreaManager {
    constructor(engine, physics) {
        this.engine = engine;
        this.physics = physics;
        this.currentIndex = 0;
        this.currentTerrain = null;
        this.decorations = [];
    }

    async loadArea(index) {
        console.log(`[AreaManager] Loading area: ${AREAS[index].name}`);

        // Cleanup previous
        this.unloadCurrentArea();

        this.currentIndex = index;
        const area = AREAS[index];

        // Update sky
        this.engine.scene.background.setHex(area.skyColor);
        this.engine.scene.fog.color.setHex(area.skyColor);

        // Generate terrain
        this.currentTerrain = TerrainGenerator.generate(
            area.id,
            this.engine.scene,
            this.physics.world
        );

        // Add decorations
        if (area.id === 'CITY') this.addCityDecorations();
        if (area.id === 'MOUNTAIN') this.addMountainRocks();

        return true;
    }

    unloadCurrentArea() {
        if (this.currentTerrain) {
            TerrainGenerator.dispose(this.currentTerrain, this.engine.scene, this.physics.world);
            this.currentTerrain = null;
        }
        this.decorations.forEach(d => {
            this.engine.scene.remove(d.mesh);
            if (d.body) this.physics.world.removeBody(d.body);
        });
        this.decorations = [];
    }

    addCityDecorations() {
        for (let i = 0; i < 60; i++) {
            const w = 18 + Math.random() * 28;
            const h = 35 + Math.random() * 90;
            const d = 18 + Math.random() * 28;
            const x = (Math.random() - 0.5) * 1200;
            const z = (Math.random() - 0.5) * 1200;

            if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;

            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                new THREE.MeshStandardMaterial({ color: 0x333333 + Math.random() * 0x222222 })
            );
            mesh.position.set(x, h / 2, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.engine.scene.add(mesh);

            const body = new CANNON.Body({ mass: 0 });
            body.addShape(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)));
            body.position.set(x, h / 2, z);
            this.physics.world.addBody(body);

            this.decorations.push({ mesh, body });
        }
    }

    addMountainRocks() {
        for (let i = 0; i < 40; i++) {
            const s = 4 + Math.random() * 10;
            const x = (Math.random() - 0.5) * 1400;
            const z = (Math.random() - 0.5) * 1400;
            const y = Math.sin(x * 0.018) * 20 + Math.cos(z * 0.018) * 20;

            const mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(s, 0),
                new THREE.MeshStandardMaterial({ color: 0x555555, flatShading: true })
            );
            mesh.position.set(x, y + s / 2, z);
            mesh.castShadow = true;
            this.engine.scene.add(mesh);

            const body = new CANNON.Body({ mass: 0 });
            body.addShape(new CANNON.Sphere(s * 0.8));
            body.position.set(x, y + s / 2, z);
            this.physics.world.addBody(body);

            this.decorations.push({ mesh, body });
        }
    }

    checkBoundaries(vehiclePos, onAreaChange) {
        if (Math.abs(vehiclePos.x) > BOUNDARY_THRESHOLD || Math.abs(vehiclePos.z) > BOUNDARY_THRESHOLD) {
            const nextIndex = (this.currentIndex + 1) % AREAS.length;
            this.loadArea(nextIndex);
            if (onAreaChange) onAreaChange();
        }
    }

    getCurrentAreaName() {
        return AREAS[this.currentIndex].name;
    }
}
