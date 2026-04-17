// ================================================================
// game.js — Market-Control · Motor Principal
// 3 mecánicas: Fluidos, Clasificación, Circuito
// ================================================================

// ── Estado global ────────────────────────────────────────────────
const GS = {
  screen:       'intro',   // intro | game | results
  level:        0,         // 0=none, 1,2,3
  totalScore:   0,
  levelScores:  [0, 0, 0],
  startTime:    null,
  elapsedTime:  0,
  playerName:   '',
  quizAnswers:  [],
  quizScore:    0,
  // Nivel 1
  L1: { tanks: {society:0, monopoly:0, abuse:0}, valves:{tax:0, regulation:0, subsidy:0}, timer:null, running:false, score:0, particles:[] },
  // Nivel 2
  L2: { queue:[], score:0, errors:0, timer:null, running:false, beltOffset:0, activeBox:null },
  // Nivel 3
  L3: { connections:[], score:0, dragging:null, lights:{}, timer:null, running:false },
};

// ── Inicializar app ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  SFX.init();
  buildIntro();
  buildLevel1();
  buildLevel2();
  buildLevel3();
  buildResults();

  document.getElementById('btn-mute').addEventListener('click', () => {
    SFX.init();
    const m = SFX.toggleMute();
    document.getElementById('btn-mute').textContent = m ? '🔇' : '🔊';
  });
});

// ================================================================
// NAVEGACIÓN
// ================================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.classList.add('fade-in'); }
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast--${type} toast--show`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('toast--show'), 3000);
}

function flash(el, color = '#00d4aa') {
  if (!el) return;
  el.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}66`;
  setTimeout(() => el.style.boxShadow = '', 600);
}

// ================================================================
// INTRO
// ================================================================
function buildIntro() {
  const d = GAME_DATA;
  document.getElementById('intro-title').textContent    = d.meta.title;
  document.getElementById('intro-subtitle').textContent = d.meta.subtitle;
  document.getElementById('intro-objective').textContent= d.meta.objective;

  const teamEl = document.getElementById('team-list');
  teamEl.innerHTML = d.meta.team.map(m =>
    `<div class="team-member">
      <span class="team-emoji">${m.emoji}</span>
      <div class="team-info">
        <strong>${m.name}</strong>
        <small>${m.role}</small>
      </div>
    </div>`
  ).join('');

  document.getElementById('btn-start').addEventListener('click', () => {
    const name = document.getElementById('player-name').value.trim();
    if (!name) { showToast('⚠️ Ingresa tu nombre para comenzar', 'warning'); return; }
    GS.playerName = name;
    GS.startTime  = Date.now();
    SFX.init(); SFX.click(); SFX.startAmbi();
    startLevel(1);
  });
}

// ================================================================
// NIVEL 1 — FLUJOS DE BIENESTAR (partículas / tanques)
// ================================================================
function buildLevel1() {
  const lv = GAME_DATA.level1;
  document.getElementById('l1-theory').textContent = lv.theory;
  document.getElementById('l1-objective').textContent = lv.objective;

  // Tanques
  const tanksEl = document.getElementById('l1-tanks');
  tanksEl.innerHTML = lv.tanks.map(t => `
    <div class="tank" id="tank-${t.id}" data-id="${t.id}">
      <div class="tank__label">${t.icon} ${t.label}</div>
      <div class="tank__body">
        <div class="tank__fill" id="fill-${t.id}" style="background:${t.color}"></div>
        <canvas class="tank__particles" id="pcv-${t.id}" width="120" height="200"></canvas>
      </div>
      <div class="tank__pct" id="pct-${t.id}">0%</div>
    </div>
  `).join('');

  // Válvulas
  const valvesEl = document.getElementById('l1-valves');
  valvesEl.innerHTML = lv.valves.map(v => `
    <div class="valve-wrap">
      <label class="valve-label">${v.icon} ${v.label}</label>
      <div class="valve-desc">${v.description}</div>
      <div class="valve-slider-row">
        <span>0</span>
        <input type="range" class="valve-slider" id="valve-${v.id}" min="0" max="10" value="0"
          data-id="${v.id}" oninput="onValveChange(this)">
        <span>10</span>
      </div>
      <div class="valve-val" id="vval-${v.id}">0</div>
    </div>
  `).join('');

  document.getElementById('btn-l1-start').addEventListener('click', () => {
    SFX.click(); runLevel1();
  });
}

function onValveChange(input) {
  SFX.click();
  document.getElementById(`vval-${input.dataset.id}`).textContent = input.value;
  GS.L1.valves[input.dataset.id] = parseInt(input.value);
  SFX.bubble();
}

function runLevel1() {
  const lv = GAME_DATA.level1;
  GS.L1.tanks  = { society: 30, monopoly: 10, abuse: 5 };
  GS.L1.valves = { tax: 0, regulation: 0, subsidy: 0 };
  GS.L1.score  = 0;
  GS.L1.running= true;
  document.getElementById('l1-controls').style.display = 'flex';
  document.getElementById('btn-l1-start').style.display = 'none';

  let elapsed = 0;
  const events = [...lv.events];

  GS.L1.timer = setInterval(() => {
    elapsed++;
    const remaining = lv.maxTime - elapsed;
    document.getElementById('l1-timer').textContent = remaining;

    // Aplicar efectos de válvulas
    const tv = GS.L1.valves;
    const tanks = GS.L1.tanks;

    // Base flow: mercado sin control → desvía a monopolio y abuso
    tanks.monopoly += 0.4;
    tanks.abuse    += 0.3;
    tanks.society  -= 0.2;

    // Válvulas corrigen el flujo
    tanks.society  += tv.tax * 0.04 + tv.regulation * 0.02 + tv.subsidy * 0.06;
    tanks.monopoly -= tv.tax * 0.03 + tv.regulation * 0.04;
    tanks.abuse    -= tv.regulation * 0.05 + tv.subsidy * 0.01;

    // Clamp
    Object.keys(tanks).forEach(k => tanks[k] = Math.min(100, Math.max(0, tanks[k])));

    // Eventos
    events.forEach((ev, i) => {
      if (ev && elapsed === ev.trigger) {
        showToast(`${ev.label}: ${ev.message}`, ev.type === 'crisis' ? 'danger' : 'warning');
        SFX.alert();
        Object.entries(ev.effect).forEach(([k,v]) => { tanks[k] = Math.min(100, Math.max(0, tanks[k] + v)); });
        events[i] = null;
      }
    });

    updateTankUI();
    updateWelfareBar();

    // Score acumulado
    GS.L1.score += Math.floor(tanks.society / 100 * 2);
    if (tanks.monopoly < 20) GS.L1.score++;
    if (tanks.abuse < 15)    GS.L1.score++;

    if (remaining <= 0) { clearInterval(GS.L1.timer); finishLevel1(); }
  }, 1000);

  // Partículas
  particleLoop();
}

function updateTankUI() {
  const tanks = GS.L1.tanks;
  const lv    = GAME_DATA.level1;
  lv.tanks.forEach(t => {
    const pct = tanks[t.id];
    const fill = document.getElementById(`fill-${t.id}`);
    const pctEl= document.getElementById(`pct-${t.id}`);
    if (fill) fill.style.height = `${pct}%`;
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
    // Flash si el mal tanque se llena
    if (!t.target && pct > 60) flash(document.getElementById(`tank-${t.id}`), '#ff4444');
    if (t.target  && pct > 70) { SFX.bubble(); flash(document.getElementById(`tank-${t.id}`), '#00d4aa'); }
  });
}

function updateWelfareBar() {
  const s = GS.L1.tanks.society;
  const f = document.getElementById('welfare-fill');
  if (f) { f.style.width = `${s}%`; f.style.background = s > 60 ? '#00d4aa' : s > 30 ? '#ffd93d' : '#ff6b6b'; }
}

// ── Sistema de partículas canvas ─────────────────────────────────
function particleLoop() {
  const cvs = ['society','monopoly','abuse'].map(id => document.getElementById(`pcv-${id}`));
  const ctxs = cvs.map(c => c?.getContext('2d'));
  const particles = { society: [], monopoly: [], abuse: [] };

  const addParticle = (tank, color) => {
    particles[tank].push({
      x: 20 + Math.random() * 80, y: 10,
      vy: 0.8 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.5,
      r:  3 + Math.random() * 3,
      color, alpha: 1, life: 0,
    });
  };

  const animateP = () => {
    if (!GS.L1.running) return;
    ['society','monopoly','abuse'].forEach((id, idx) => {
      const ctx2d = ctxs[idx];
      if (!ctx2d) return;
      ctx2d.clearRect(0, 0, 120, 200);
      const fill  = GS.L1.tanks[id];
      const color = id === 'society' ? '#00d4aa' : id === 'monopoly' ? '#ff6b6b' : '#ff4444';

      if (Math.random() < 0.15) addParticle(id, color);

      particles[id] = particles[id].filter(p => p.life < 120);
      particles[id].forEach(p => {
        p.y += p.vy; p.x += p.vx; p.life++;
        p.alpha = Math.max(0, 1 - p.life / 100);
        ctx2d.globalAlpha = p.alpha;
        ctx2d.fillStyle   = p.color;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx2d.fill();
      });
      ctx2d.globalAlpha = 1;
    });
    requestAnimationFrame(animateP);
  };
  animateP();
}

function finishLevel1() {
  GS.L1.running = false;
  const lv = GAME_DATA.level1;
  const t  = GS.L1.tanks;
  const w  = lv.winCondition;
  const won = t.society >= w.societyMin && t.monopoly <= w.monopolyMax && t.abuse <= w.abuseMax;
  GS.levelScores[0] = GS.L1.score;
  GS.totalScore += GS.L1.score;

  if (won) { SFX.levelComplete(); showToast(`🏆 Nivel 1 completado! +${GS.L1.score} pts`, 'success'); }
  else     { SFX.error(); showToast(`⚠️ Nivel 1 terminado. Sociedad: ${Math.round(t.society)}%`, 'warning'); }

  document.getElementById('l1-result').innerHTML =
    `<div class="level-result ${won?'level-result--win':'level-result--lose'}">
      <span>${won?'✅':'⚠️'}</span>
      <div>
        <strong>${won?'¡Equilibrio logrado!':'Mercado desbalanceado'}</strong>
        <div>Sociedad: ${Math.round(t.society)}% | Monopolio: ${Math.round(t.monopoly)}% | Abuso: ${Math.round(t.abuse)}%</div>
        <div>Puntos obtenidos: <strong>${GS.L1.score}</strong></div>
      </div>
    </div>`;

  document.getElementById('btn-to-l2').style.display = 'inline-flex';
}

// ================================================================
// NIVEL 2 — LOGÍSTICA DE CONTROL (clasificación de cajas)
// ================================================================
function buildLevel2() {
  const lv = GAME_DATA.level2;
  document.getElementById('l2-theory').textContent    = lv.theory;
  document.getElementById('l2-objective').textContent = lv.objective;

  // Zonas
  const zonesEl = document.getElementById('l2-zones');
  zonesEl.innerHTML = lv.zones.map(z => `
    <div class="zone" id="zone-${z.id}" data-id="${z.id}"
      ondragover="event.preventDefault()" ondrop="dropBox(event,'${z.id}')">
      <div class="zone__icon">${z.icon}</div>
      <div class="zone__label">${z.label}</div>
      <div class="zone__count" id="zcount-${z.id}">0 cajas</div>
    </div>
  `).join('');

  document.getElementById('btn-l2-start').addEventListener('click', () => {
    SFX.click(); runLevel2();
  });
}

function runLevel2() {
  const lv = GAME_DATA.level2;
  GS.L2.score   = 0;
  GS.L2.errors  = 0;
  GS.L2.queue   = [...lv.boxes].sort(() => Math.random() - 0.5);
  GS.L2.running = true;
  GS.L2.zoneCounts = { safe: 0, sanction: 0 };

  document.getElementById('btn-l2-start').style.display   = 'none';
  document.getElementById('l2-belt-area').style.display   = 'flex';
  document.getElementById('l2-score-display').style.display = 'flex';

  SFX.startBelt();
  renderBelt();

  let elapsed = 0;
  GS.L2.timer = setInterval(() => {
    elapsed++;
    const remaining = lv.maxTime - elapsed;
    document.getElementById('l2-timer').textContent = remaining;
    animateBelt();
    if (remaining <= 0 || GS.L2.queue.length === 0) {
      clearInterval(GS.L2.timer);
      SFX.stopBelt();
      finishLevel2();
    }
  }, 1000);
}

function renderBelt() {
  const belt = document.getElementById('l2-belt');
  if (!belt || GS.L2.queue.length === 0) return;
  const box = GS.L2.queue[0];
  belt.innerHTML = `
    <div class="box" id="active-box"
      draggable="true"
      ondragstart="dragBox(event,'${box.id}')"
      onclick="highlightZones()"
      style="background:${box.color}; border:3px solid ${box.zone === 'safe' ? '#00d4aa' : '#ff6b6b'}30">
      <div class="box__icon">${box.icon}</div>
      <div class="box__label">${box.label}</div>
      <div class="box__type">${box.type}</div>
      <div class="box__desc">${box.description}</div>
    </div>
  `;
}

function animateBelt() {
  GS.L2.beltOffset = (GS.L2.beltOffset + 8) % 40;
  const bg = document.getElementById('l2-belt-track');
  if (bg) bg.style.backgroundPosition = `${GS.L2.beltOffset}px 0`;
}

function dragBox(event, boxId) {
  event.dataTransfer.setData('boxId', boxId);
  SFX.click();
}

function dropBox(event, zoneId) {
  event.preventDefault();
  const boxId = event.dataTransfer.getData('boxId');
  classifyBox(boxId, zoneId);
}

function classifyBox(boxId, zoneId) {
  if (!GS.L2.running) return;
  const lv  = GAME_DATA.level2;
  const box = GS.L2.queue.find(b => b.id === boxId);
  if (!box) return;

  const correct = box.zone === zoneId;
  const zoneEl  = document.getElementById(`zone-${zoneId}`);

  if (correct) {
    GS.L2.score += lv.boxes.find(b=>b.id===boxId) ? 100 : 50;
    GS.L2.zoneCounts[zoneId] = (GS.L2.zoneCounts[zoneId]||0) + 1;
    document.getElementById(`zcount-${zoneId}`).textContent = `${GS.L2.zoneCounts[zoneId]} cajas`;
    SFX.success();
    flash(zoneEl, '#00d4aa');
    showToast(`✅ ¡Correcto! ${box.description}`, 'success');
  } else {
    GS.L2.errors++;
    GS.L2.score = Math.max(0, GS.L2.score - lv.penaltyPerError);
    SFX.error();
    flash(zoneEl, '#ff4444');
    showToast(`❌ Incorrecto. ${box.description}`, 'danger');
  }

  document.getElementById('l2-score-val').textContent = GS.L2.score;
  document.getElementById('l2-errors-val').textContent = GS.L2.errors;

  // Siguiente caja
  GS.L2.queue = GS.L2.queue.filter(b => b.id !== boxId);
  if (GS.L2.queue.length > 0) renderBelt();
  else { clearInterval(GS.L2.timer); SFX.stopBelt(); finishLevel2(); }
}

function highlightZones() {
  document.querySelectorAll('.zone').forEach(z => z.classList.toggle('zone--highlight'));
  setTimeout(() => document.querySelectorAll('.zone').forEach(z => z.classList.remove('zone--highlight')), 800);
}

function finishLevel2() {
  GS.L2.running = false;
  const total = GAME_DATA.level2.boxes.length * 100;
  const pct   = Math.round(GS.L2.score / total * 100);
  GS.levelScores[1] = GS.L2.score;
  GS.totalScore    += GS.L2.score;

  const won = pct >= 60;
  if (won) { SFX.levelComplete(); showToast(`🏆 Nivel 2 completado! +${GS.L2.score} pts`, 'success'); }
  else     { SFX.error(); showToast(`⚠️ Nivel 2 terminado. ${pct}% de precisión`, 'warning'); }

  document.getElementById('l2-result').innerHTML =
    `<div class="level-result ${won?'level-result--win':'level-result--lose'}">
      <span>${won?'✅':'⚠️'}</span>
      <div>
        <strong>${won?'¡Inspector eficiente!':'El mercado sigue con productos dañinos'}</strong>
        <div>Precisión: ${pct}% | Errores: ${GS.L2.errors}</div>
        <div>Puntos: <strong>${GS.L2.score}</strong></div>
      </div>
    </div>`;
  document.getElementById('btn-to-l3').style.display = 'inline-flex';
}

// ================================================================
// NIVEL 3 — CIRCUITO DE INCENTIVOS (puzzle de cables)
// ================================================================
function buildLevel3() {
  const lv = GAME_DATA.level3;
  document.getElementById('l3-theory').textContent    = lv.theory;
  document.getElementById('l3-objective').textContent = lv.objective;

  // Incentivos disponibles
  const incEl = document.getElementById('l3-incentives');
  incEl.innerHTML = lv.incentives.map(inc => `
    <div class="incentive-chip" id="inc-${inc.id}"
      draggable="true" ondragstart="dragIncentive(event,'${inc.id}')"
      style="background:${inc.color}22; border-color:${inc.color}">
      <span>${inc.icon}</span>
      <div>
        <strong>${inc.label}</strong>
        <small>${inc.description}</small>
      </div>
    </div>
  `).join('');

  // Nodos en el circuito canvas
  document.getElementById('btn-l3-start').addEventListener('click', () => {
    SFX.click(); runLevel3();
  });
}

function runLevel3() {
  const lv   = GAME_DATA.level3;
  GS.L3.connections = [];
  GS.L3.lights      = {};
  GS.L3.score       = 0;
  GS.L3.running     = true;

  // Construir nodos en el SVG
  renderCircuit();

  document.getElementById('btn-l3-start').style.display = 'none';
  document.getElementById('l3-board').style.display     = 'block';

  let elapsed = 0;
  GS.L3.timer = setInterval(() => {
    elapsed++;
    const rem = lv.maxTime - elapsed;
    document.getElementById('l3-timer').textContent = rem;
    if (rem <= 0) { clearInterval(GS.L3.timer); finishLevel3(); }
  }, 1000);
}

function renderCircuit() {
  const lv  = GAME_DATA.level3;
  const svg = document.getElementById('l3-svg');
  const W   = svg.clientWidth  || 700;
  const H   = svg.clientHeight || 400;

  svg.innerHTML = '';

  // Dibuja aristas posibles (punteadas)
  const govNode = lv.nodes.find(n => n.id === 'gov');
  lv.nodes.filter(n => n.type !== 'source').forEach(n => {
    const x1 = govNode.x/100*W, y1 = govNode.y/100*H;
    const x2 = n.x/100*W,       y2 = n.y/100*H;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1); line.setAttribute('y1',y1);
    line.setAttribute('x2',x2); line.setAttribute('y2',y2);
    line.setAttribute('stroke','#ffffff15'); line.setAttribute('stroke-width','2');
    line.setAttribute('stroke-dasharray','6 4');
    line.id = `edge-${n.id}`;
    svg.appendChild(line);
  });

  // Dibuja nodos
  lv.nodes.forEach(n => {
    const cx = n.x/100*W, cy = n.y/100*H;
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform',`translate(${cx},${cy})`);
    g.id = `node-${n.id}`;

    // Círculo
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r','32'); circle.setAttribute('fill', n.color + '33');
    circle.setAttribute('stroke', n.color); circle.setAttribute('stroke-width','2.5');

    // Emoji text
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('text-anchor','middle'); text.setAttribute('dominant-baseline','central');
    text.setAttribute('font-size','20'); text.textContent = n.icon;

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('text-anchor','middle'); label.setAttribute('y','46');
    label.setAttribute('font-size','10'); label.setAttribute('fill','#ccc');
    label.textContent = n.label;

    // Bombillo (sectores)
    if (n.type === 'sector') {
      const bulb = document.createElementNS('http://www.w3.org/2000/svg','text');
      bulb.setAttribute('text-anchor','middle'); bulb.setAttribute('y','-46');
      bulb.setAttribute('font-size','18'); bulb.id = `bulb-${n.id}`;
      bulb.textContent = '💡'; bulb.style.opacity = '0.2';
      g.appendChild(bulb);
    }

    g.appendChild(circle); g.appendChild(text); g.appendChild(label);

    // Drop zone para incentivos
    if (n.type !== 'source') {
      g.style.cursor = 'pointer';
      g.addEventListener('dragover',  e => e.preventDefault());
      g.addEventListener('drop',      e => dropIncentive(e, n.id));
    }
    svg.appendChild(g);
  });
}

let draggingIncentive = null;
function dragIncentive(event, incId) {
  draggingIncentive = incId;
  event.dataTransfer.setData('incId', incId);
  SFX.click();
}

function dropIncentive(event, nodeId) {
  event.preventDefault();
  const incId = event.dataTransfer.getData('incId') || draggingIncentive;
  if (!incId) return;
  connectIncentive(incId, nodeId);
}

function connectIncentive(incId, nodeId) {
  const lv  = GAME_DATA.level3;
  const inc = lv.incentives.find(i => i.id === incId);
  const node= lv.nodes.find(n => n.id === nodeId);
  if (!inc || !node) return;

  const isCorrect = lv.correctConnections.some(c => c.incentive === incId && c.to === nodeId);
  const isWrong   = node.type === 'trap';

  if (isWrong) {
    SFX.error();
    showToast(`⚠️ ${node.penalty}`, 'danger');
    flash(document.getElementById(`node-${nodeId}`), '#ff4444');
    GS.L3.score = Math.max(0, GS.L3.score - 100);
    return;
  }

  if (isCorrect) {
    SFX.snap(); SFX.lightOn();
    // Encender bombillo
    const bulb = document.getElementById(`bulb-${nodeId}`);
    if (bulb) { bulb.style.opacity = '1'; bulb.style.filter = 'drop-shadow(0 0 8px #ffd700)'; }

    // Iluminar arista
    const edge = document.getElementById(`edge-${nodeId}`);
    if (edge) { edge.setAttribute('stroke', inc.color); edge.setAttribute('stroke-width','3'); edge.removeAttribute('stroke-dasharray'); }

    GS.L3.score  += 200;
    GS.L3.lights[nodeId] = true;
    GS.L3.connections.push({ incId, nodeId });

    showToast(`💡 ${node.reward}`, 'success');
    flash(document.getElementById(`node-${nodeId}`), '#ffd700');
    document.getElementById('l3-score-val').textContent = GS.L3.score;

    // ¿Completado?
    const lit = Object.keys(GS.L3.lights).length;
    const max = lv.nodes.filter(n => n.type === 'sector').length;
    if (lit >= max) { clearInterval(GS.L3.timer); finishLevel3(); }
  } else {
    SFX.error();
    showToast('❌ Ese incentivo no corresponde a este sector', 'danger');
    GS.L3.score = Math.max(0, GS.L3.score - 50);
  }
}

function finishLevel3() {
  GS.L3.running = false;
  const lit = Object.keys(GS.L3.lights).length;
  const max = GAME_DATA.level3.nodes.filter(n => n.type === 'sector').length;
  const won = lit >= Math.ceil(max * 0.6);

  GS.levelScores[2] = GS.L3.score;
  GS.totalScore    += GS.L3.score;

  if (won) { SFX.levelComplete(); showToast(`🏆 Nivel 3 completado! +${GS.L3.score} pts`, 'success'); }
  else     { SFX.error(); showToast(`⚠️ ${lit}/${max} sectores activados`, 'warning'); }

  document.getElementById('l3-result').innerHTML =
    `<div class="level-result ${won?'level-result--win':'level-result--lose'}">
      <span>${won?'✅':'⚠️'}</span>
      <div>
        <strong>${won?'¡Circuito de incentivos activo!':'Sectores sin financiamiento'}</strong>
        <div>Bombillos encendidos: ${lit}/${max}</div>
        <div>Puntos: <strong>${GS.L3.score}</strong></div>
      </div>
    </div>`;
  document.getElementById('btn-to-quiz').style.display = 'inline-flex';
}

// ================================================================
// QUIZ FINAL
// ================================================================
let quizIdx = 0;
function showQuiz() {
  quizIdx = 0;
  GS.quizScore = 0;
  GS.quizAnswers = [];
  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const qs  = GAME_DATA.finalQuiz;
  const q   = qs[quizIdx];
  const pct = Math.round((quizIdx / qs.length) * 100);

  document.getElementById('quiz-progress-fill').style.width = `${pct}%`;
  document.getElementById('quiz-num').textContent  = `${quizIdx+1}/${qs.length}`;
  document.getElementById('quiz-q').textContent    = q.q;
  document.getElementById('quiz-opts').innerHTML   = q.opts.map((o, i) =>
    `<button class="quiz-opt" onclick="answerQuiz(${i})">${String.fromCharCode(65+i)}. ${o}</button>`
  ).join('');
  document.getElementById('quiz-explanation').style.display = 'none';
  document.getElementById('btn-quiz-next').style.display    = 'none';
}

function answerQuiz(idx) {
  const q = GAME_DATA.finalQuiz[quizIdx];
  const correct = idx === q.correct;
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((o, i) => {
    o.disabled = true;
    if (i === q.correct) o.classList.add('quiz-opt--correct');
    else if (i === idx)  o.classList.add('quiz-opt--wrong');
  });
  if (correct) { GS.quizScore += 200; SFX.success(); }
  else         { SFX.error(); }
  GS.quizAnswers.push(correct);

  document.getElementById('quiz-explanation').textContent = `💡 ${q.explanation}`;
  document.getElementById('quiz-explanation').style.display = 'block';
  document.getElementById('btn-quiz-next').style.display    = 'inline-flex';
  document.getElementById('btn-quiz-next').textContent =
    quizIdx + 1 < GAME_DATA.finalQuiz.length ? 'Siguiente →' : 'Ver Resultados →';
}

function nextQuizQuestion() {
  SFX.click();
  quizIdx++;
  if (quizIdx < GAME_DATA.finalQuiz.length) renderQuestion();
  else { GS.totalScore += GS.quizScore; GS.elapsedTime = Math.round((Date.now() - GS.startTime) / 1000); showResults(); }
}

// ================================================================
// RESULTADOS Y LEADERBOARD
// ================================================================
function buildResults() {
  document.getElementById('btn-play-again').addEventListener('click', () => {
    GS.totalScore = 0; GS.levelScores = [0,0,0]; GS.quizScore = 0;
    startLevel(1);
  });
  document.getElementById('btn-refresh-lb').addEventListener('click', loadLeaderboard);
}

async function showResults() {
  SFX.levelComplete(); SFX.startAmbi();
  showScreen('screen-results');

  // Rango
  const rank = GAME_DATA.scoring.ranks.find(r => GS.totalScore >= r.min);
  GS.playerRank = rank.label;

  document.getElementById('res-name').textContent   = GS.playerName;
  document.getElementById('res-score').textContent  = GS.totalScore.toLocaleString();
  document.getElementById('res-time').textContent   = formatTime(GS.elapsedTime);
  document.getElementById('res-rank').textContent   = `${rank.icon} ${rank.label}`;
  document.getElementById('res-rank').style.color   = rank.color;
  document.getElementById('res-msg').textContent    = rank.msg;
  document.getElementById('res-l1').textContent     = GS.levelScores[0];
  document.getElementById('res-l2').textContent     = GS.levelScores[1];
  document.getElementById('res-l3').textContent     = GS.levelScores[2];
  document.getElementById('res-quiz').textContent   = GS.quizScore;

  // Enviar a Sheets
  const api = await LeaderboardAPI.submitScore({
    name:   GS.playerName,
    score:  GS.totalScore,
    time:   GS.elapsedTime,
    rank:   rank.label,
    level1: GS.levelScores[0],
    level2: GS.levelScores[1],
    level3: GS.levelScores[2],
  });
  if (api.offline) showToast('💾 Guardado localmente (sin conexión a Sheets)', 'info');
  else             showToast('☁️ Resultado guardado en Google Sheets', 'success');

  loadLeaderboard();
}

async function loadLeaderboard() {
  const lbEl = document.getElementById('leaderboard-list');
  lbEl.innerHTML = '<div class="lb-loading">Cargando...</div>';
  const { ok, data } = await LeaderboardAPI.getLeaderboard();
  if (!data || data.length === 0) { lbEl.innerHTML = '<div class="lb-loading">No hay datos aún.</div>'; return; }

  const medals = ['🥇','🥈','🥉'];
  lbEl.innerHTML = data.map((row, i) => {
    const score = typeof row === 'object' ? (row.score || 0) : row[2] || 0;
    const name  = typeof row === 'object' ? (row.name  || '?') : row[1] || '?';
    const time  = typeof row === 'object' ? (row.time  || 0) : row[3] || 0;
    const rank2 = typeof row === 'object' ? (row.rank  || '') : row[4] || '';
    return `
      <div class="lb-row ${i===0?'lb-row--first':''}">
        <span class="lb-pos">${medals[i]||'#'+(i+1)}</span>
        <span class="lb-name">${name}</span>
        <span class="lb-rank">${rank2}</span>
        <span class="lb-score">${Number(score).toLocaleString()}</span>
        <span class="lb-time">${formatTime(time)}</span>
      </div>`;
  }).join('');
}

// ================================================================
// UTILIDADES
// ================================================================
function formatTime(s) {
  const m = Math.floor(s/60); const sec = s%60;
  return `${m}:${sec<10?'0':''}${sec}`;
}

function startLevel(n) {
  SFX.stopAmbi();
  GS.level = n;
  const ids = ['screen-l1','screen-l2','screen-l3','screen-quiz','screen-results'];
  ids.forEach(id => document.getElementById(id)?.classList.remove('active'));
  showScreen(`screen-l${n}`);
}

// Botones de navegación entre niveles
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-to-l2')?.addEventListener('click',  () => { SFX.click(); startLevel(2); });
  document.getElementById('btn-to-l3')?.addEventListener('click',  () => { SFX.click(); startLevel(3); });
  document.getElementById('btn-to-quiz')?.addEventListener('click',() => { SFX.click(); showQuiz(); });
  document.getElementById('btn-quiz-next')?.addEventListener('click', nextQuizQuestion);
});
