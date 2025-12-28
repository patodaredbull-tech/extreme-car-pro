/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         INPUT MANAGER MODULE                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Centralized input handling for keyboard events.                          ║
 * ║  Supports continuous key state tracking and one-shot callbacks.           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// INPUT MANAGER CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class InputManager {
    constructor() {
        console.log('[InputManager] Initializing input listeners...');

        /**
         * Map of currently pressed keys.
         * Key: lowercase key name, Value: boolean.
         * @type {Object.<string, boolean>}
         */
        this.keysPressed = {};

        /**
         * Map of one-shot callbacks for key presses.
         * Key: lowercase key name, Value: callback function.
         * @type {Object.<string, Function>}
         */
        this.callbacks = {};

        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        // Attach listeners
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        console.log('[InputManager] Ready.');
    }

    /**
     * Handles keydown events.
     * Sets the key state to true and fires any registered callback.
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        const key = event.key.toLowerCase();

        // Prevent repeat events from holding key
        if (this.keysPressed[key]) return;

        this.keysPressed[key] = true;

        // Fire one-shot callback if registered
        if (this.callbacks[key]) {
            this.callbacks[key]();
        }
    }

    /**
     * Handles keyup events.
     * Sets the key state to false.
     * @param {KeyboardEvent} event
     */
    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keysPressed[key] = false;
    }

    /**
     * Checks if a key is currently pressed.
     * Use this for continuous actions like movement.
     * @param {string} key - Lowercase key name (e.g., 'w', ' ' for space).
     * @returns {boolean}
     */
    isPressed(key) {
        return !!this.keysPressed[key.toLowerCase()];
    }

    /**
     * Registers a one-shot callback for a key press.
     * Use this for discrete actions like toggling camera.
     * @param {string} key - Lowercase key name.
     * @param {Function} callback - Function to call when key is pressed.
     */
    on(key, callback) {
        this.callbacks[key.toLowerCase()] = callback;
    }

    /**
     * Removes a registered callback.
     * @param {string} key - Lowercase key name.
     */
    off(key) {
        delete this.callbacks[key.toLowerCase()];
    }

    /**
     * Cleans up event listeners.
     * Call this when destroying the game.
     */
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        console.log('[InputManager] Destroyed.');
    }
}
