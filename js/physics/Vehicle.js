/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      VEHICLE CONTROLLER MODULE                            ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Implements realistic vehicle physics using Cannon-es RaycastVehicle.     ║
 * ║  Handles suspension, steering, engine force, and braking.                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import * as CANNON from 'cannon-es';

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLE CONTROLLER CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class VehicleController {
    /**
     * Creates a new physics-driven vehicle.
     * @param {CANNON.World} world - The physics world to add the vehicle to.
     * @param {object} preset - Vehicle configuration from CarPresets.
     * @param {object} spawnPos - Initial position { x, y, z }.
     */
    constructor(world, preset, spawnPos) {
        console.log(`[VehicleController] Creating vehicle: ${preset.name}`);

        this.world = world;
        this.preset = preset;

        // ─────────────────────────────
        // CHASSIS BODY
        // ─────────────────────────────
        const chassisShape = new CANNON.Box(new CANNON.Vec3(
            preset.chassisWidth / 2,
            preset.chassisHeight / 2,
            preset.chassisLength / 2
        ));

        this.chassisBody = new CANNON.Body({
            mass: preset.mass,
            material: new CANNON.Material('chassis')
        });
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.set(spawnPos.x, spawnPos.y, spawnPos.z);

        // Apply linear damping for air resistance simulation
        this.chassisBody.linearDamping = preset.drag || 0.05;
        this.chassisBody.angularDamping = 0.4;

        world.addBody(this.chassisBody);

        // ─────────────────────────────
        // RAYCAST VEHICLE
        // ─────────────────────────────
        this.raycastVehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexForwardAxis: 2,  // Z is forward
            indexRightAxis: 0,    // X is right
            indexUpAxis: 1        // Y is up
        });

        this.setupWheels(preset);
        this.raycastVehicle.addToWorld(world);

        // ─────────────────────────────
        // STEERING STATE
        // ─────────────────────────────
        this.currentSteer = 0;

        console.log('[VehicleController] Vehicle created successfully.');
    }

    /**
     * Configures the four wheels with suspension and friction parameters.
     * @param {object} preset - Vehicle preset containing wheel configuration.
     */
    setupWheels(preset) {
        const wheelOptions = {
            radius: preset.wheelRadius,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(1, 0, 0),
            suspensionStiffness: preset.suspension.stiffness,
            suspensionRestLength: preset.suspension.rest,
            frictionSlip: preset.friction,
            dampingRelaxation: preset.suspension.dampingRelaxation,
            dampingCompression: preset.suspension.dampingCompression,
            maxSuspensionForce: 250000,
            rollInfluence: 0.01,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Wheel positions relative to chassis center
        const wheelX = preset.wheelTrack / 2;      // Half track width
        const wheelZ = preset.wheelBase / 2;       // Half wheelbase
        const wheelY = preset.wheelY || 0.1;       // Vertical offset

        // Front Left
        this.raycastVehicle.addWheel({
            ...wheelOptions,
            chassisConnectionPointLocal: new CANNON.Vec3(-wheelX, wheelY, wheelZ)
        });

        // Front Right
        this.raycastVehicle.addWheel({
            ...wheelOptions,
            chassisConnectionPointLocal: new CANNON.Vec3(wheelX, wheelY, wheelZ)
        });

        // Rear Left
        this.raycastVehicle.addWheel({
            ...wheelOptions,
            chassisConnectionPointLocal: new CANNON.Vec3(-wheelX, wheelY, -wheelZ)
        });

        // Rear Right
        this.raycastVehicle.addWheel({
            ...wheelOptions,
            chassisConnectionPointLocal: new CANNON.Vec3(wheelX, wheelY, -wheelZ)
        });

        console.log('[VehicleController] Wheels configured.');
    }

    /**
     * Applies player controls to the vehicle physics.
     * Called every frame from the game update loop.
     * @param {object} controls - { forward, backward, left, right, handbrake }
     */
    applyControls(controls) {
        // ─────────────────────────────
        // ENGINE FORCE
        // ─────────────────────────────
        let engineForce = 0;
        if (controls.forward) {
            engineForce = -this.preset.power; // Negative because Z is forward
        } else if (controls.backward) {
            engineForce = this.preset.power * 0.6; // Reverse is slower
        }

        // Apply engine force to rear wheels (RWD)
        this.raycastVehicle.applyEngineForce(engineForce, 2);
        this.raycastVehicle.applyEngineForce(engineForce, 3);

        // Add some front wheel power for 4WD vehicles
        if (this.preset.is4WD) {
            this.raycastVehicle.applyEngineForce(engineForce * 0.4, 0);
            this.raycastVehicle.applyEngineForce(engineForce * 0.4, 1);
        }

        // ─────────────────────────────
        // BRAKING
        // ─────────────────────────────
        let brakeForce = 0;
        if (controls.handbrake) {
            brakeForce = this.preset.brake;
        }

        // Apply brake to all wheels
        for (let i = 0; i < 4; i++) {
            this.raycastVehicle.setBrake(brakeForce, i);
        }

        // ─────────────────────────────
        // STEERING (with smoothing)
        // ─────────────────────────────
        let targetSteer = 0;
        if (controls.left) targetSteer = this.preset.maxSteer;
        if (controls.right) targetSteer = -this.preset.maxSteer;

        // Smooth interpolation for realistic steering feel
        this.currentSteer += (targetSteer - this.currentSteer) * 0.15;

        // Apply steering to front wheels only
        this.raycastVehicle.setSteeringValue(this.currentSteer, 0);
        this.raycastVehicle.setSteeringValue(this.currentSteer, 1);
    }

    /**
     * Returns the current vehicle position.
     * @returns {object} { x, y, z }
     */
    getPosition() {
        const pos = this.chassisBody.position;
        return { x: pos.x, y: pos.y, z: pos.z };
    }

    /**
     * Returns the current vehicle quaternion.
     * @returns {object} { x, y, z, w }
     */
    getQuaternion() {
        const q = this.chassisBody.quaternion;
        return { x: q.x, y: q.y, z: q.z, w: q.w };
    }

    /**
     * Returns the current speed in kilometers per hour.
     * @returns {number}
     */
    getSpeedKMH() {
        return Math.abs(this.chassisBody.velocity.length() * 3.6);
    }

    /**
     * Returns wheel transform information for visual synchronization.
     * @param {number} wheelIndex - Index of the wheel (0-3).
     * @returns {object} { position, quaternion }
     */
    getWheelTransform(wheelIndex) {
        this.raycastVehicle.updateWheelTransform(wheelIndex);
        const t = this.raycastVehicle.wheelInfos[wheelIndex].worldTransform;
        return {
            position: { x: t.position.x, y: t.position.y, z: t.position.z },
            quaternion: { x: t.quaternion.x, y: t.quaternion.y, z: t.quaternion.z, w: t.quaternion.w }
        };
    }

    /**
     * Resets the vehicle to a given position with zero velocity.
     * @param {object} pos - { x, y, z }
     */
    reset(pos) {
        this.chassisBody.position.set(pos.x, pos.y, pos.z);
        this.chassisBody.velocity.set(0, 0, 0);
        this.chassisBody.angularVelocity.set(0, 0, 0);
        this.chassisBody.quaternion.set(0, 0, 0, 1);
        this.currentSteer = 0;
    }

    /**
     * Removes the vehicle from the physics world.
     */
    destroy() {
        this.raycastVehicle.removeFromWorld(this.world);
        this.world.removeBody(this.chassisBody);
        console.log('[VehicleController] Vehicle destroyed.');
    }
}
