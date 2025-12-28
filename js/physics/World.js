/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         PHYSICS WORLD MODULE                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Manages the Cannon-es physics world, including gravity, materials,       ║
 * ║  and simulation stepping.                                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import * as CANNON from 'cannon-es';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const PHYSICS_CONFIG = {
    GRAVITY: -15.0,           // Stronger gravity for stability
    TIMESTEP: 1 / 60,          // Fixed timestep
    MAX_SUB_STEPS: 3,          // Maximum substeps per frame
    DEFAULT_FRICTION: 0.4,
    DEFAULT_RESTITUTION: 0.05  // Very low bounce
};

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICS WORLD CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class PhysicsWorld {
    constructor() {
        console.log('[PhysicsWorld] Initializing Cannon-es world...');

        /**
         * The Cannon-es World instance.
         * @type {CANNON.World}
         */
        this.world = new CANNON.World();
        this.world.gravity.set(0, PHYSICS_CONFIG.GRAVITY, 0);

        // Use SAP (Sweep and Prune) for broad-phase collision detection
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);

        // Allow bodies to sleep when stationary to save CPU
        this.world.allowSleep = true;

        // Setup default contact material
        this.setupDefaultMaterial();

        // Container for all active bodies (for cleanup)
        this.bodies = [];

        console.log('[PhysicsWorld] Physics world ready.');
    }

    /**
     * Sets up the default contact material properties.
     * This affects all body interactions unless overridden.
     */
    setupDefaultMaterial() {
        this.defaultMaterial = new CANNON.Material('default');

        const defaultContact = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: PHYSICS_CONFIG.DEFAULT_FRICTION,
                restitution: PHYSICS_CONFIG.DEFAULT_RESTITUTION,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );

        this.world.addContactMaterial(defaultContact);
        this.world.defaultContactMaterial = defaultContact;
    }

    /**
     * Advances the physics simulation by the given delta time.
     * @param {number} deltaTime - Time elapsed since last frame (seconds).
     */
    step(deltaTime) {
        this.world.step(PHYSICS_CONFIG.TIMESTEP, deltaTime, PHYSICS_CONFIG.MAX_SUB_STEPS);
    }

    /**
     * Adds a physics body to the world.
     * @param {CANNON.Body} body
     */
    addBody(body) {
        this.world.addBody(body);
        this.bodies.push(body);
    }

    /**
     * Removes a physics body from the world.
     * @param {CANNON.Body} body
     */
    removeBody(body) {
        this.world.removeBody(body);
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Clears all bodies from the world except for the provided exclusions.
     * Useful when switching areas.
     * @param {CANNON.Body[]} exclude - Array of bodies to keep.
     */
    clearBodies(exclude = []) {
        const toRemove = this.bodies.filter(b => !exclude.includes(b));
        toRemove.forEach(b => this.removeBody(b));
        console.log(`[PhysicsWorld] Cleared ${toRemove.length} bodies.`);
    }

    /**
     * Returns the underlying Cannon.js world for direct access.
     * @returns {CANNON.World}
     */
    getWorld() {
        return this.world;
    }
}
