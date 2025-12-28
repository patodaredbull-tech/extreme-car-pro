/**
 * TERRAIN GENERATOR MODULE
 * Generates heightfield terrain for both Three.js and Cannon-es.
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const TERRAIN_CONFIG = { SIZE: 1600, SEGMENTS: 100 };

const HeightFunctions = {
    CITY: (x, z) => {
        let h = Math.sin(x * 0.15) * 0.06 + Math.cos(z * 0.15) * 0.06;
        if (Math.abs(z) < 40 && Math.abs(x % 120) < 3) h += 0.25;
        return h;
    },
    DESERT: (x, z) => {
        return Math.sin(x * 0.012) * 5 + Math.cos(z * 0.012) * 5 + Math.sin(x * 0.04) * 1.5;
    },
    MOUNTAIN: (x, z) => {
        return Math.sin(x * 0.018) * 20 + Math.cos(z * 0.018) * 20 + Math.sin(x * 0.06) * 6;
    }
};

export class TerrainGenerator {
    static generate(areaType, scene, physicsWorld) {
        const size = TERRAIN_CONFIG.SIZE;
        const segments = TERRAIN_CONFIG.SEGMENTS;
        const heightFn = HeightFunctions[areaType] || HeightFunctions.CITY;

        const matrix = [];
        for (let i = 0; i <= segments; i++) {
            matrix.push([]);
            for (let j = 0; j <= segments; j++) {
                const x = (i / segments - 0.5) * size;
                const z = (j / segments - 0.5) * size;
                matrix[i].push(heightFn(x, z));
            }
        }

        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);
        const positions = geometry.attributes.position.array;
        for (let j = 0; j <= segments; j++) {
            for (let i = 0; i <= segments; i++) {
                positions[(j * (segments + 1) + i) * 3 + 1] = matrix[i][j];
            }
        }
        geometry.computeVertexNormals();

        const colors = { CITY: 0x3a3a3a, DESERT: 0xd4a574, MOUNTAIN: 0x5a5a4a };
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
            color: colors[areaType], roughness: 0.92, metalness: 0.02
        }));
        mesh.receiveShadow = true;
        scene.add(mesh);

        const body = new CANNON.Body({ mass: 0 });
        body.addShape(new CANNON.Heightfield(matrix, { elementSize: size / segments }));
        body.position.set(-size / 2, 0, size / 2);
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physicsWorld.addBody(body);

        return { mesh, body, heightMatrix: matrix };
    }

    static dispose(terrain, scene, physicsWorld) {
        if (terrain.mesh) {
            scene.remove(terrain.mesh);
            terrain.mesh.geometry.dispose();
            terrain.mesh.material.dispose();
        }
        if (terrain.body) physicsWorld.removeBody(terrain.body);
    }
}
