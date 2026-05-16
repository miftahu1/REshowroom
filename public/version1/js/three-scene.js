/**
 * Hero Canvas Scene — Perspective Road Grid + Ember Particles
 * Pure Canvas 2D — no external dependencies
 * Royal Enfield Dealership
 */
(function () {
    'use strict';

    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Perspective Grid ─────────────────────────────────────── */
    const GRID_COLS = 18;
    const GRID_ROWS = 16;
    const VP = { xFrac: 0.5, yFrac: 0.60 }; // vanishing point

    function drawGrid(t) {
        const vpX = W * VP.xFrac;
        const vpY = H * VP.yFrac;
        const gridBase = H + 60;
        const spread = W * 0.78;

        ctx.save();
        ctx.lineCap = 'round';

        /* Horizontal lines — scroll downward toward viewer */
        for (let i = 0; i <= GRID_ROWS; i++) {
            const raw = (i / GRID_ROWS + (t * 0.12) % 1);
            const frac = Math.pow(raw % 1, 2.2);
            const y = vpY + frac * (gridBase - vpY);
            const hw = frac * spread;
            const alpha = Math.min(frac * 1.1, 0.9) * 0.22;
            if (alpha < 0.005) continue;

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#c9a84c';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(vpX - hw, y);
            ctx.lineTo(vpX + hw, y);
            ctx.stroke();
        }

        /* Vertical lines — converge at vanishing point */
        for (let j = 0; j <= GRID_COLS; j++) {
            const frac = (j / GRID_COLS) * 2 - 1;          // -1 … +1
            const baseX = vpX + frac * spread;
            const alpha = (1 - Math.abs(frac) * 0.5) * 0.14;
            if (alpha < 0.005) continue;

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#c9a84c';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(vpX, vpY);
            ctx.lineTo(baseX, gridBase);
            ctx.stroke();
        }

        /* Glowing horizon line */
        ctx.globalAlpha = 0.18;
        const hrGrd = ctx.createLinearGradient(0, vpY, W, vpY);
        hrGrd.addColorStop(0, 'transparent');
        hrGrd.addColorStop(0.35, '#c9a84c');
        hrGrd.addColorStop(0.5, '#e8c96a');
        hrGrd.addColorStop(0.65, '#c9a84c');
        hrGrd.addColorStop(1, 'transparent');
        ctx.strokeStyle = hrGrd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, vpY);
        ctx.lineTo(W, vpY);
        ctx.stroke();

        ctx.restore();
    }

    /* ── Ember Particles ──────────────────────────────────────── */
    class Ember {
        constructor(stagger) {
            this._spawn(stagger);
        }
        _spawn(stagger) {
            this.x = Math.random() * W;
            this.y = stagger ? Math.random() * H : H + 8;
            this.size = 0.8 + Math.random() * 1.8;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = -(0.35 + Math.random() * 1.1);
            this.hue = 36 + Math.random() * 18;       // gold-amber
            this.maxAlpha = 0.18 + Math.random() * 0.42;
            this.alpha = stagger ? Math.random() * this.maxAlpha : 0;
            this.life = stagger ? Math.random() * 140 : 0;
            this.maxLife = 110 + Math.random() * 160;
        }
        update() {
            this.life++;
            this.x += this.vx + Math.sin(this.life * 0.04) * 0.45;
            this.y += this.vy;
            const p = this.life / this.maxLife;
            this.alpha = p < 0.18
                ? (p / 0.18) * this.maxAlpha
                : p > 0.72
                    ? ((1 - p) / 0.28) * this.maxAlpha
                    : this.maxAlpha;
            if (this.life >= this.maxLife || this.y < -12) this._spawn(false);
        }
        draw() {
            if (this.alpha <= 0.005) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            const r = this.size * 4.5;
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
            g.addColorStop(0, `hsla(${this.hue},95%,78%,1)`);
            g.addColorStop(0.35, `hsla(${this.hue},85%,62%,0.65)`);
            g.addColorStop(1, `hsla(${this.hue},75%,48%,0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const embers = Array.from({ length: 110 }, () => new Ember(true));

    /* ── Light Sweep ──────────────────────────────────────────── */
    let sweepX = -W * 1.5;
    let nextSweep = 5;        // seconds before first sweep

    function drawSweep(t) {
        if (t < nextSweep) return;
        sweepX += 22;
        if (sweepX > W * 1.5) { sweepX = -W * 1.5; nextSweep = t + 7 + Math.random() * 5; return; }

        ctx.save();
        const grd = ctx.createLinearGradient(sweepX - 160, 0, sweepX + 160, 0);
        grd.addColorStop(0, 'rgba(232,201,106,0)');
        grd.addColorStop(0.5, 'rgba(232,201,106,0.045)');
        grd.addColorStop(1, 'rgba(232,201,106,0)');
        ctx.fillStyle = grd;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    /* ── Ambient Pulse (radial glow at vanishing point) ─────── */
    let pulsePhase = 0;
    function drawPulse(t) {
        const vpX = W * VP.xFrac;
        const vpY = H * VP.yFrac;
        const beat = 0.5 + 0.5 * Math.sin(t * 0.9);   // 0 … 1
        const r = 80 + beat * 50;
        ctx.save();
        const g = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, r);
        g.addColorStop(0, `rgba(201,168,76,${0.07 + beat * 0.06})`);
        g.addColorStop(0.5, `rgba(201,168,76,0.03)`);
        g.addColorStop(1, 'rgba(201,168,76,0)');
        ctx.fillStyle = g;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(vpX, vpY, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* ── Render Loop ──────────────────────────────────────────── */
    let startTime = null;
    function loop(ts) {
        if (!startTime) startTime = ts;
        const t = (ts - startTime) * 0.001;

        ctx.clearRect(0, 0, W, H);

        drawGrid(t);
        drawPulse(t);
        embers.forEach(e => { e.update(); e.draw(); });
        drawSweep(t);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
