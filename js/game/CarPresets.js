/**
 * CAR PRESETS MODULE
 * Defines physics and visual parameters for each vehicle type.
 */

export const CAR_PRESETS = [
    {
        id: 0,
        name: 'Sport S-Class',
        // Physics
        mass: 1150,
        power: 5000,
        brake: 180,
        maxSteer: 0.48,
        drag: 0.04,
        is4WD: false,
        // Chassis Dimensions
        chassisWidth: 2.0,
        chassisHeight: 0.45,
        chassisLength: 4.6,
        // Wheels
        wheelRadius: 0.36,
        wheelTrack: 1.7,
        wheelBase: 2.8,
        wheelY: 0.0,
        // Suspension
        suspension: {
            stiffness: 55,
            rest: 0.32,
            dampingRelaxation: 2.6,
            dampingCompression: 4.6
        },
        friction: 1.2,
        // Visual
        bodyColor: 0xff2211,
        accentColor: 0x111111
    },
    {
        id: 1,
        name: 'City Sedan',
        mass: 1450,
        power: 3200,
        brake: 140,
        maxSteer: 0.42,
        drag: 0.08,
        is4WD: false,
        chassisWidth: 1.9,
        chassisHeight: 0.55,
        chassisLength: 4.4,
        wheelRadius: 0.38,
        wheelTrack: 1.6,
        wheelBase: 2.6,
        wheelY: 0.05,
        suspension: {
            stiffness: 32,
            rest: 0.42,
            dampingRelaxation: 2.3,
            dampingCompression: 4.2
        },
        friction: 1.4,
        bodyColor: 0x2266ff,
        accentColor: 0x222222
    },
    {
        id: 2,
        name: 'Desert Runner',
        mass: 2100,
        power: 3800,
        brake: 110,
        maxSteer: 0.38,
        drag: 0.15,
        is4WD: true,
        chassisWidth: 2.1,
        chassisHeight: 0.7,
        chassisLength: 4.8,
        wheelRadius: 0.52,
        wheelTrack: 1.8,
        wheelBase: 2.9,
        wheelY: 0.1,
        suspension: {
            stiffness: 18,
            rest: 0.6,
            dampingRelaxation: 3.2,
            dampingCompression: 5.5
        },
        friction: 1.7,
        bodyColor: 0xffaa00,
        accentColor: 0x333333
    },
    {
        id: 3,
        name: 'Extreme 4x4',
        mass: 2700,
        power: 4500,
        brake: 90,
        maxSteer: 0.32,
        drag: 0.22,
        is4WD: true,
        chassisWidth: 2.2,
        chassisHeight: 0.85,
        chassisLength: 5.0,
        wheelRadius: 0.68,
        wheelTrack: 1.9,
        wheelBase: 3.0,
        wheelY: 0.15,
        suspension: {
            stiffness: 12,
            rest: 0.85,
            dampingRelaxation: 4.0,
            dampingCompression: 7.0
        },
        friction: 2.2,
        bodyColor: 0x22aa22,
        accentColor: 0x111111
    }
];
