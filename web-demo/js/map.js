/**
 * Canvas 世界地图渲染 + 飞机贝塞尔动画
 * @author make java
 * @since 2026-05-01
 */
import { CITIES, ROUTES, VEHICLE_COLOR, VEHICLE_DASH, VEHICLE_ICON, cityById } from './data.js';

export class WorldMap {

    constructor(canvas, store) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.store = store;
        this.activeTrips = [];
        this.lastFrame = performance.now();
        this.bindEvents();
        this.loop();
    }

    project(lng, lat) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const x = (lng + 100) * (w / 220);
        const y = (50 - lat) * (h / 100);
        return { x, y };
    }

    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            const c = this.hitTestCity(x, y);
            if (c) {
                this.store.onCityClick(c);
            }
        });
    }

    hitTestCity(x, y) {
        for (const c of CITIES) {
            const p = this.project(c.lng, c.lat);
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < 22) {
                return c;
            }
        }
        return null;
    }

    addTrip(trip) {
        this.activeTrips.push(trip);
    }

    removeTrip(tripId) {
        this.activeTrips = this.activeTrips.filter(t => t.id !== tripId);
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        const now = performance.now();
        const dt = (now - this.lastFrame) / 1000;
        this.lastFrame = now;
        this.tick(dt);
        this.draw();
    }

    tick(dt) {
        for (const t of this.activeTrips) {
            if (t.paused) {
                continue;
            }
            t.elapsed += dt;
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        this.drawContinents();

        if (this.store.currentView === 'TRAVEL') {
            this.drawAllRoutes();
        }

        for (const t of this.activeTrips) {
            this.drawHighlightedTrip(t);
        }

        for (const c of CITIES) {
            this.drawCity(c);
        }

        for (const t of this.activeTrips) {
            this.drawVehicle(t);
        }

        if (this.store.firstClickCity) {
            const p = this.project(this.store.firstClickCity.lng, this.store.firstClickCity.lat);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawContinents() {
        const ctx = this.ctx;
        ctx.fillStyle = '#fef3c7';
        const blobs = [
            { lng: -10, lat: 30, rx: 60, ry: 40 },
            { lng: 60,  lat: 35, rx: 80, ry: 55 },
            { lng: -40, lat: -20, rx: 70, ry: 45 },
            { lng: 80,  lat: -10, rx: 50, ry: 35 },
            { lng: 25,  lat: 5,   rx: 70, ry: 50 },
        ];
        for (const b of blobs) {
            const p = this.project(b.lng, b.lat);
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, b.rx, b.ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d4a574';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawAllRoutes() {
        const ctx = this.ctx;
        const drawn = new Set();
        for (const r of ROUTES) {
            const k = `${Math.min(r.fromCity, r.toCity)}-${Math.max(r.fromCity, r.toCity)}-${r.vehicleType}`;
            if (drawn.has(k)) {
                continue;
            }
            drawn.add(k);
            const a = cityById(r.fromCity);
            const b = cityById(r.toCity);
            if (!a || !b) {
                continue;
            }
            const pa = this.project(a.lng, a.lat);
            const pb = this.project(b.lng, b.lat);
            ctx.strokeStyle = VEHICLE_COLOR[r.vehicleType];
            ctx.lineWidth = 2;
            ctx.setLineDash(VEHICLE_DASH[r.vehicleType] ?? []);
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            const cx = (pa.x + pb.x) / 2;
            const cy = (pa.y + pb.y) / 2 - 30;
            ctx.quadraticCurveTo(cx, cy, pb.x, pb.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.setLineDash([]);
    }

    drawHighlightedTrip(trip) {
        const ctx = this.ctx;
        for (const r of trip.routes) {
            const a = cityById(r.fromCity);
            const b = cityById(r.toCity);
            const pa = this.project(a.lng, a.lat);
            const pb = this.project(b.lng, b.lat);
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 4;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            const cx = (pa.x + pb.x) / 2;
            const cy = (pa.y + pb.y) / 2 - 30;
            ctx.quadraticCurveTo(cx, cy, pb.x, pb.y);
            ctx.stroke();
        }
    }

    drawCity(c) {
        const ctx = this.ctx;
        const p = this.project(c.lng, c.lat);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = c.level === 1 ? '#fbbf24' : c.level === 2 ? '#a3e635' : '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#6b4423';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#6b4423';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(c.name, p.x, p.y + 22);
    }

    drawVehicle(trip) {
        const ctx = this.ctx;
        const totalTurn = trip.routes.reduce((s, r) => s + r.baseTurn, 0);
        const realTurn = totalTurn + (trip.delayTurn ?? 0);
        const t = Math.min(trip.elapsed / (realTurn * 1.0), 1);

        let acc = 0;
        let segIdx = 0;
        let segLocalT = 0;
        const segLengths = trip.routes.map(r => r.baseTurn / realTurn);
        for (let i = 0; i < segLengths.length; i++) {
            if (t < acc + segLengths[i]) {
                segIdx = i;
                segLocalT = (t - acc) / segLengths[i];
                break;
            }
            acc += segLengths[i];
            if (i === segLengths.length - 1) {
                segIdx = i;
                segLocalT = 1;
            }
        }

        const r = trip.routes[segIdx];
        const a = cityById(r.fromCity);
        const b = cityById(r.toCity);
        const pa = this.project(a.lng, a.lat);
        const pb = this.project(b.lng, b.lat);
        const cx = (pa.x + pb.x) / 2;
        const cy = (pa.y + pb.y) / 2 - 30;
        const x = (1 - segLocalT) * (1 - segLocalT) * pa.x + 2 * (1 - segLocalT) * segLocalT * cx + segLocalT * segLocalT * pb.x;
        const y = (1 - segLocalT) * (1 - segLocalT) * pa.y + 2 * (1 - segLocalT) * segLocalT * cy + segLocalT * segLocalT * pb.y;

        const icon = VEHICLE_ICON[r.vehicleType];
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x, y);
    }
}
