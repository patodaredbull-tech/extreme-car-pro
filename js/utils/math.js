/**
 * MATH UTILITIES MODULE
 * Common math functions for game calculations.
 */

export const MathUtils = {
    /**
     * Clamps a value between min and max.
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation between two values.
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Converts radians to degrees.
     */
    radToDeg(rad) {
        return rad * (180 / Math.PI);
    },

    /**
     * Converts degrees to radians.
     */
    degToRad(deg) {
        return deg * (Math.PI / 180);
    },

    /**
     * Returns a random number between min and max.
     */
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },

    /**
     * Maps a value from one range to another.
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    }
};
