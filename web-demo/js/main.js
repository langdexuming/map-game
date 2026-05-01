/**
 * Demo 主控: 状态机 + UI 绑定 + 行程生命周期 + 事件骰
 * @author make java
 * @since 2026-05-01
 */
import { CITIES, TRIP_EVENTS, VEHICLE_ICON } from './data.js';
import { WorldMap } from './map.js';
import { planTrip } from './planner.js';

const initial = () => ({
    coin: 5000,
    clue: 1200,
    star: 850,
    fuel: 200,
    turn: 1,
    currentView: 'TRAVEL',
    firstClickCity: null,
    secondClickCity: null,
    activeTrips: [],
    nextTripId: 1,
    log: [],
});

const store = {
    ...initial(),

    onCityClick(city) {
        if (!this.firstClickCity) {
            this.firstClickCity = city;
            updateHint(`已选 [${city.name}], 再点一个目的地`);
            renderCityList();
            return;
        }
        if (city.id === this.firstClickCity.id) {
            this.firstClickCity = null;
            updateHint('点击任意两个城市发起出行规划');
            renderCityList();
            return;
        }
        this.secondClickCity = city;
        renderCityList();
        const r = planTrip(this.firstClickCity.id, city.id);
        if (r.error) {
            updateHint(`❌ ${r.error}`);
            this.firstClickCity = null;
            this.secondClickCity = null;
            renderCityList();
            return;
        }
        openPlanner(this.firstClickCity, city, r.plans);
    },

    bookTrip(plan, from, to) {
        if (this.coin < plan.totalPrice) {
            alert(`金币不足! 需要 ¥${plan.totalPrice}, 当前仅 ¥${this.coin}`);
            return;
        }
        const fuelCost = plan.routes.reduce((s, r) => s + (r.vehicleType === 5 ? 0 : 10), 0);
        if (this.fuel < fuelCost) {
            alert(`燃料不足! 需要 ${fuelCost}, 当前仅 ${this.fuel}`);
            return;
        }
        this.coin -= plan.totalPrice;
        this.fuel -= fuelCost;

        const trip = {
            id: this.nextTripId++,
            from, to, plan,
            routes: plan.routes,
            elapsed: 0,
            delayTurn: 0,
            paused: false,
            status: 'IN_TRANSIT',
            startTurn: this.turn,
            arriveTurn: this.turn + plan.totalTurn,
        };
        this.activeTrips.push(trip);
        worldMap.addTrip(trip);

        addLog(`Plan ${plan.planNo} 订票: ${from.name} → ${to.name}, ¥${plan.totalPrice}`);
        addLog(`Trip #${trip.id} 起飞 ${VEHICLE_ICON[plan.routes[0].vehicleType]}`);
        closePlanner();
        this.firstClickCity = null;
        this.secondClickCity = null;
        renderCityList();
        renderStatus();
    },

    advanceTurn() {
        if (this.activeTrips.length === 0) {
            this.turn += 1;
            renderStatus();
            return;
        }

        const tripsBefore = [...this.activeTrips];
        for (const trip of tripsBefore) {
            trip.elapsed += 1;
            if (Math.random() < 0.6) {
                this.rollEvent(trip);
            }
            if (trip.elapsed >= trip.plan.totalTurn + trip.delayTurn) {
                trip.status = 'ARRIVED';
                addLog(`✅ Trip #${trip.id} 抵达 ${trip.to.name}!`);
                worldMap.removeTrip(trip.id);
                this.activeTrips = this.activeTrips.filter(t => t.id !== trip.id);
            }
        }

        this.turn += 1;
        renderStatus();
    },

    rollEvent(trip) {
        const total = TRIP_EVENTS.reduce((s, e) => s + e.weight, 0);
        let roll = Math.random() * total;
        let chosen = null;
        for (const e of TRIP_EVENTS) {
            roll -= e.weight;
            if (roll <= 0) {
                chosen = e;
                break;
            }
        }
        if (!chosen || chosen.code === 'NONE') {
            return;
        }

        if (chosen.interactive) {
            this.openInteractiveEvent(trip, chosen);
            return;
        }

        if (chosen.effect) {
            this.applyEffect(chosen.effect);
            if (chosen.effect.delay) {
                trip.delayTurn += chosen.effect.delay;
            }
        }
        addLog(`🎲 [Trip #${trip.id}] ${chosen.title}: ${chosen.body}`);
    },

    openInteractiveEvent(trip, event) {
        trip.paused = true;
        const modal = document.getElementById('event-modal');
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-body').textContent = event.body;
        const actions = document.getElementById('event-actions');
        actions.innerHTML = '';
        for (const c of event.choices) {
            const btn = document.createElement('button');
            btn.textContent = c.label;
            btn.className = 'primary';
            const disabled = c.requireCoin && this.coin < c.requireCoin;
            if (disabled) {
                btn.disabled = true;
                btn.title = `需要 ¥${c.requireCoin}`;
            }
            btn.onclick = () => {
                if (c.effect) {
                    this.applyEffect(c.effect);
                    if (c.effect.delay) {
                        trip.delayTurn += c.effect.delay;
                    }
                }
                addLog(`🎲 [Trip #${trip.id}] ${event.title} → ${c.effect.label ?? c.label}`);
                trip.paused = false;
                modal.classList.add('hidden');
            };
            actions.appendChild(btn);
        }
        modal.classList.remove('hidden');
    },

    applyEffect(eff) {
        if (eff.coin) {
            this.coin = Math.max(0, this.coin + eff.coin);
        }
        if (eff.clue) {
            this.clue = Math.max(0, this.clue + eff.clue);
        }
        if (eff.star) {
            this.star = Math.max(0, this.star + eff.star);
        }
        if (eff.fuel) {
            this.fuel = Math.max(0, this.fuel + eff.fuel);
        }
        renderStatus();
    },

    reset() {
        Object.assign(this, initial());
        this.activeTrips.forEach(t => worldMap.removeTrip(t.id));
        this.activeTrips = [];
        worldMap.activeTrips = [];
        document.getElementById('log-list').innerHTML = '';
        renderStatus();
        renderCityList();
        closePlanner();
    },
};

const canvas = document.getElementById('map');
const worldMap = new WorldMap(canvas, store);

function renderStatus() {
    document.getElementById('stat-coin').textContent = store.coin;
    document.getElementById('stat-clue').textContent = store.clue;
    document.getElementById('stat-star').textContent = store.star;
    document.getElementById('stat-fuel').textContent = store.fuel;
    document.getElementById('stat-turn').textContent = store.turn;
    document.getElementById('stat-day').textContent = Math.floor((store.turn - 1) / 10) + 1;
}

function renderCityList() {
    const ul = document.getElementById('city-list');
    ul.innerHTML = '';
    for (const c of CITIES) {
        const div = document.createElement('div');
        div.className = 'city-item';
        if (store.firstClickCity?.id === c.id || store.secondClickCity?.id === c.id) {
            div.classList.add('selected');
        }
        const lvl = c.level === 1 ? 'Hub' : c.level === 2 ? 'Region' : 'Outpost';
        div.innerHTML = `${c.name}<span class="level">${lvl}</span>`;
        div.onclick = () => store.onCityClick(c);
        ul.appendChild(div);
    }
}

function updateHint(text) {
    document.getElementById('hint').textContent = text;
}

function openPlanner(from, to, plans) {
    document.getElementById('planner').classList.remove('hidden');
    document.getElementById('plan-from').textContent = from.name;
    document.getElementById('plan-to').textContent = to.name;
    const list = document.getElementById('plan-list');
    list.innerHTML = '';
    let minPrice = Infinity;
    for (const p of plans) {
        if (p.totalPrice < minPrice) {
            minPrice = p.totalPrice;
        }
    }
    for (const p of plans) {
        const row = document.createElement('div');
        row.className = 'plan-row';
        if (p.totalPrice === minPrice && p.planNo === 2) {
            row.classList.add('recommended');
        }
        row.innerHTML = `
          <div>
            <div><b>Plan ${p.planNo}</b> ${p.vehicleChain.map(v => ({ PLANE: '✈', SHIP: '⛴', TRAIN: '🚆', TRUCK: '🚚', FOOT: '🥾' })[v] || v).join(' + ')}</div>
            <div class="meta">${p.totalTurn}回合 · 期望事件 ${p.eventExpect}</div>
          </div>
          <div style="text-align:right">
            <div>¥${p.totalPrice}</div>
            <div class="meta">${p.bonusDesc}</div>
          </div>`;
        row.onclick = () => store.bookTrip(p, from, to);
        list.appendChild(row);
    }
    const fuelCost = plans[0].routes.reduce((s, r) => s + (r.vehicleType === 5 ? 0 : 10), 0);
    document.getElementById('plan-fuel-cost').textContent = `-${fuelCost}`;
}

function closePlanner() {
    document.getElementById('planner').classList.add('hidden');
}

function addLog(text) {
    store.log.push({ turn: store.turn, text });
    const li = document.createElement('li');
    li.innerHTML = `<span class="turn-tag">T${store.turn}</span>${text}`;
    document.getElementById('log-list').prepend(li);
}

document.getElementById('end-turn-btn').onclick = () => store.advanceTurn();
document.getElementById('reset-btn').onclick = () => store.reset();
document.getElementById('planner-close').onclick = () => {
    closePlanner();
    store.firstClickCity = null;
    store.secondClickCity = null;
    renderCityList();
};

document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.currentView = btn.dataset.view;
    });
});

renderStatus();
renderCityList();
addLog('Demo 启动, 默认 Travel 视图');
