/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   EXTREME CAR SANDBOX PRO - MAIN ENTRY                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  This file serves as the main entry point and orchestrator for the game.  ║
 * ║  It initializes all modules and manages the main game loop.               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// MODULE IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './physics/World.js';
import { VehicleController } from './physics/Vehicle.js';
import { TerrainGenerator } from './physics/Terrain.js';
import { AreaManager } from './game/AreaManager.js';
import { CAR_PRESETS } from './game/CarPresets.js';
import { CarModelFactory } from './rendering/CarModel.js';
import { EnvironmentRenderer } from './rendering/Environment.js';
import { HUD } from './ui/HUD.js';

// ─────────────────────────────────────────────────────────────────────────────
// GAME CLASS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Main Game class that ties all modules together.
 * Responsible for initialization, update loop, and inter-module communication.
 */
class Game {
    constructor() {
        console.log('[Game] Initializing Extreme Car Sandbox Pro...');

        // Core Systems
        this.engine = new Engine('game-container');
        this.input = new InputManager();
        this.physics = new PhysicsWorld();

        // Game Logic
        this.areaManager = new AreaManager(this.engine, this.physics);
        this.hud = new HUD();

        // Vehicle State
        this.currentCarIndex = 0;
        this.vehicle = null;
        this.carModel = null;

        // Camera Mode
        this.cameraMode = 0; // 0: Follow, 1: Cockpit, 2: Top

        // Bind Methods
        this.update = this.update.bind(this);

        // Start
        this.init();
    }

    /**
     * Asynchronous initialization sequence.
     * Loads the initial area and spawns the first vehicle.
     */
    async init() {
        console.log('[Game] Loading initial area...');

        // Load starting area (City)
        await this.areaManager.loadArea(0);

        // Spawn initial vehicle
        this.spawnVehicle(0);

        // Setup input callbacks
        this.setupInputCallbacks();

        // Hide loading screen
        this.hideLoadingScreen();

        // Start game loop
        this.engine.startLoop(this.update);

        console.log('[Game] Initialization complete. Enjoy the ride!');
    }

    /**
     * Binds keyboard input to game actions.
     */
    setupInputCallbacks() {
        // Vehicle Switching (1-4)
        this.input.on('1', () => this.spawnVehicle(0));
        this.input.on('2', () => this.spawnVehicle(1));
        this.input.on('3', () => this.spawnVehicle(2));
        this.input.on('4', () => this.spawnVehicle(3));

        // Camera Toggle
        this.input.on('c', () => {
            this.cameraMode = (this.cameraMode + 1) % 3;
            console.log(`[Game] Camera mode: ${['Follow', 'Cockpit', 'Top'][this.cameraMode]}`);
        });

        // Reset Vehicle
        this.input.on('r', () => this.resetVehicle());
    }

    /**
     * Spawns a vehicle based on preset index.
     * Destroys the previous vehicle if it exists.
     * @param {number} index - Index in CAR_PRESETS array (0-3).
     */
    spawnVehicle(index) {
        const preset = CAR_PRESETS[index];
        console.log(`[Game] Spawning vehicle: ${preset.name}`);

        // Store old position if vehicle exists
        const oldPos = this.vehicle
            ? this.vehicle.getPosition()
            : { x: 0, y: 8, z: 0 };

        // Cleanup old vehicle
        if (this.vehicle) {
            this.vehicle.destroy();
            this.carModel.destroy();
        }

        // Create new physics vehicle
        this.vehicle = new VehicleController(this.physics.world, preset, oldPos);

        // Create new visual model
        this.carModel = CarModelFactory.create(preset, this.engine.scene);

        this.currentCarIndex = index;
        this.hud.setCarName(preset.name);
    }

    /**
     * Resets the vehicle to the spawn position of the current area.
     */
    resetVehicle() {
        if (this.vehicle) {
            this.vehicle.reset({ x: 0, y: 10, z: 0 });
            console.log('[Game] Vehicle reset.');
        }
    }

    /**
     * Hides the HTML loading screen with a fade-out animation.
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Main update loop. Called every frame by the Engine.
     * @param {number} deltaTime - Time elapsed since last frame (in seconds).
     */
    update(deltaTime) {
        // 1. Step Physics
        this.physics.step(deltaTime);

        // 2. Update Vehicle Controls
        if (this.vehicle) {
            const controls = {
                forward: this.input.isPressed('w'),
                backward: this.input.isPressed('s'),
                left: this.input.isPressed('a'),
                right: this.input.isPressed('d'),
                handbrake: this.input.isPressed(' ')
            };
            this.vehicle.applyControls(controls);

            // Sync visual model to physics body
            this.carModel.syncWithPhysics(this.vehicle);
        }

        // 3. Update Camera
        this.updateCamera(deltaTime);

        // 4. Check Area Boundaries
        if (this.vehicle) {
            const pos = this.vehicle.getPosition();
            this.areaManager.checkBoundaries(pos, () => {
                // Callback when area changes
                this.vehicle.reset({ x: 0, y: 10, z: 0 });
            });
        }

        // 5. Update HUD
        if (this.vehicle) {
            const speed = this.vehicle.getSpeedKMH();
            this.hud.setSpeed(speed);
            this.hud.setGear(speed);
        }
        this.hud.setArea(this.areaManager.getCurrentAreaName());
    }

    /**
     * Updates the camera position based on current mode.
     * Implements smooth interpolation for cinematic feel.
     * @param {number} dt - Delta time.
     */
    updateCamera(dt) {
        if (!this.carModel) return;

        const carMesh = this.carModel.getMesh();
        const camera = this.engine.camera;

        let offset;
        let lookAtOffset;
        let lerpSpeed;

        switch (this.cameraMode) {
            case 1: // Cockpit
                offset = { x: 0, y: 1.0, z: 0.3 };
                lookAtOffset = { x: 0, y: 1, z: 20 };
                lerpSpeed = 1.0; // Instant for cockpit
                break;
            case 2: // Top-down
                offset = { x: 0, y: 50, z: 5 };
                lookAtOffset = { x: 0, y: 0, z: 0 };
                lerpSpeed = 0.05;
                break;
            default: // Follow
                offset = { x: 0, y: 4, z: -10 };
                lookAtOffset = { x: 0, y: 1, z: 0 };
                lerpSpeed = 0.08;
        }

        // Calculate world-space target position
        const targetPos = carMesh.localToWorld(
            new THREE.Vector3(offset.x, offset.y, offset.z).clone()
        );

        // Smoothly interpolate camera position
        camera.position.lerp(targetPos, lerpSpeed);

        // Calculate and apply look-at target
        const lookAtPos = carMesh.localToWorld(
            new THREE.Vector3(lookAtOffset.x, lookAtOffset.y, lookAtOffset.z).clone()
        );
        camera.lookAt(lookAtPos);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────
// Import THREE globally for camera operations in updateCamera
import * as THREE from 'three';

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
