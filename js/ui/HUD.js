/**
 * HUD MODULE
 * Creates and manages the in-game heads-up display.
 */

export class HUD {
    constructor() {
        this.container = document.getElementById('hud');
        this.render();
        this.cacheElements();
    }

    render() {
        this.container.innerHTML = `
            <div class="hud-top">
                <div id="area-badge" class="area-badge">Carregando...</div>
                <div id="car-name" class="car-name">---</div>
            </div>
            
            <div class="hud-dashboard">
                <div class="gear-display">GEAR <span id="gear-val">N</span></div>
                <div class="speed-display">
                    <span id="speed-val" class="speed-value">0</span>
                    <span class="speed-unit">KM/H</span>
                </div>
            </div>
            
            <div class="hud-controls">
                <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Dirigir<br>
                <kbd>ESPAÇO</kbd> Drift | <kbd>C</kbd> Câmera<br>
                <kbd>1</kbd>-<kbd>4</kbd> Trocar Carro | <kbd>R</kbd> Reset
            </div>
        `;
    }

    cacheElements() {
        this.areaEl = document.getElementById('area-badge');
        this.carEl = document.getElementById('car-name');
        this.speedEl = document.getElementById('speed-val');
        this.gearEl = document.getElementById('gear-val');
    }

    setArea(name) {
        if (this.areaEl && this.areaEl.innerText !== name) {
            this.areaEl.innerText = name;
        }
    }

    setCarName(name) {
        if (this.carEl) this.carEl.innerText = name;
    }

    setSpeed(kmh) {
        if (this.speedEl) this.speedEl.innerText = Math.round(kmh);
    }

    setGear(speed) {
        if (!this.gearEl) return;
        if (speed < 5) {
            this.gearEl.innerText = 'N';
        } else {
            const gear = Math.min(6, Math.floor(speed / 40) + 1);
            this.gearEl.innerText = gear;
        }
    }
}
