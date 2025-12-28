/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         CORE ENGINE MODULE                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Handles Three.js scene, camera, renderer, and lighting setup.            ║
 * ║  Provides the main render loop infrastructure.                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_CONFIG = {
    FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 5000,
    BACKGROUND_COLOR: 0x88ccff,
    FOG_COLOR: 0x88ccff,
    FOG_NEAR: 200,
    FOG_FAR: 1800,
    SHADOW_MAP_SIZE: 4096,
    AMBIENT_INTENSITY: 0.45,
    SUN_INTENSITY: 1.3,
    SUN_POSITION: { x: 350, y: 600, z: 250 }
};

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class Engine {
    /**
     * Creates the rendering engine.
     * @param {string} containerId - ID of the DOM element to attach the canvas.
     */
    constructor(containerId) {
        console.log('[Engine] Initializing Three.js renderer...');

        this.container = document.getElementById(containerId);

        // ─────────────────────────────
        // SCENE
        // ─────────────────────────────
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(ENGINE_CONFIG.BACKGROUND_COLOR);
        this.scene.fog = new THREE.Fog(
            ENGINE_CONFIG.FOG_COLOR,
            ENGINE_CONFIG.FOG_NEAR,
            ENGINE_CONFIG.FOG_FAR
        );

        // ─────────────────────────────
        // CAMERA
        // ─────────────────────────────
        this.camera = new THREE.PerspectiveCamera(
            ENGINE_CONFIG.FOV,
            window.innerWidth / window.innerHeight,
            ENGINE_CONFIG.NEAR_PLANE,
            ENGINE_CONFIG.FAR_PLANE
        );
        this.camera.position.set(0, 10, -20);

        // ─────────────────────────────
        // RENDERER
        // ─────────────────────────────
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        // ─────────────────────────────
        // LIGHTING
        // ─────────────────────────────
        this.setupLighting();

        // ─────────────────────────────
        // RESIZE HANDLER
        // ─────────────────────────────
        window.addEventListener('resize', () => this.onResize());

        // ─────────────────────────────
        // LOOP STATE
        // ─────────────────────────────
        this.lastTime = 0;
        this.updateCallback = null;

        console.log('[Engine] Renderer initialized successfully.');
    }

    /**
     * Sets up ambient and directional lighting with shadows.
     */
    setupLighting() {
        // Ambient Light (fills shadows softly)
        const ambient = new THREE.AmbientLight(0xffffff, ENGINE_CONFIG.AMBIENT_INTENSITY);
        this.scene.add(ambient);

        // Hemisphere Light (sky-ground gradient)
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444422, 0.4);
        this.scene.add(hemiLight);

        // Directional Light (Sun)
        this.sun = new THREE.DirectionalLight(0xffffff, ENGINE_CONFIG.SUN_INTENSITY);
        this.sun.position.set(
            ENGINE_CONFIG.SUN_POSITION.x,
            ENGINE_CONFIG.SUN_POSITION.y,
            ENGINE_CONFIG.SUN_POSITION.z
        );
        this.sun.castShadow = true;

        // Shadow Camera Configuration
        const shadowCam = this.sun.shadow.camera;
        shadowCam.left = -1200;
        shadowCam.right = 1200;
        shadowCam.top = 1200;
        shadowCam.bottom = -1200;
        shadowCam.near = 1;
        shadowCam.far = 2000;

        this.sun.shadow.mapSize.width = ENGINE_CONFIG.SHADOW_MAP_SIZE;
        this.sun.shadow.mapSize.height = ENGINE_CONFIG.SHADOW_MAP_SIZE;
        this.sun.shadow.bias = -0.0002;

        this.scene.add(this.sun);

        console.log('[Engine] Lighting configured.');
    }

    /**
     * Handles window resize events.
     */
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Starts the main rendering loop.
     * @param {Function} updateCallback - Function to call each frame with deltaTime.
     */
    startLoop(updateCallback) {
        this.updateCallback = updateCallback;
        this.lastTime = performance.now();

        const loop = (time) => {
            requestAnimationFrame(loop);

            // Calculate delta time (capped to avoid spiral of death)
            const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
            this.lastTime = time;

            // Call game update
            if (this.updateCallback) {
                this.updateCallback(deltaTime);
            }

            // Render scene
            this.renderer.render(this.scene, this.camera);
        };

        requestAnimationFrame(loop);
        console.log('[Engine] Render loop started.');
    }

    /**
     * Adds an object to the scene.
     * @param {THREE.Object3D} object - The object to add.
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * Removes an object from the scene.
     * @param {THREE.Object3D} object - The object to remove.
     */
    remove(object) {
        this.scene.remove(object);
    }
}
