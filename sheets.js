// ================================================================
// sheets.js — Google Sheets Connector · Market-Control
//
// ── CONFIGURACIÓN PERMANENTE (sin pedirle la URL al usuario) ──
// Descomenta y pega tu URL de Apps Script aquí:
//
// const SHEETS_URL = "https://script.google.com/macros/s/TU_ID/exec";
//
// Si está vacío, el juego funciona en modo offline.
// ================================================================

const SHEETS_URL = ""; // ← Pega tu URL de Apps Script aquí

const LeaderboardAPI = (() => {

  function getUrl() {
    return SHEETS_URL || localStorage.getItem('mc_sheets_url') || '';
  }

  function isConnected() { return !!getUrl(); }

  function setUrl(url) { localStorage.setItem('mc_sheets_url', url); }

  // ── Enviar resultado al finalizar ────────────────────────────
  async function submitScore({ name, score, time, rank, level1, level2, level3 }) {
    const url = getUrl();
    if (!url) {
      saveLocal({ name, score, time, rank });
      return { ok: true, offline: true };
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Apps Script CORS-safe
        body: JSON.stringify({
          action:  'submitScore',
          name:    name  || 'Anónimo',
          score:   score || 0,
          time:    time  || 0,
          rank:    rank  || '',
          level1:  level1 || 0,
          level2:  level2 || 0,
          level3:  level3 || 0,
          date:    new Date().toLocaleString('es-CO'),
        }),
      });
      const data = await res.json();
      saveLocal({ name, score, time, rank });
      return data;
    } catch(err) {
      console.warn('[Sheets] Error:', err.message);
      saveLocal({ name, score, time, rank });
      return { ok: false, offline: true, error: err.message };
    }
  }

  // ── Obtener leaderboard ──────────────────────────────────────
  async function getLeaderboard() {
    const url = getUrl();
    if (!url) return { ok: false, data: getLocalScores() };
    try {
      const res = await fetch(`${url}?action=getLeaderboard`);
      const data = await res.json();
      return { ok: true, data: data.rows || [] };
    } catch(err) {
      return { ok: false, data: getLocalScores() };
    }
  }

  // ── Ping ─────────────────────────────────────────────────────
  async function ping() {
    const url = getUrl();
    if (!url) return false;
    try {
      const res = await fetch(`${url}?action=ping`, { method: 'GET' });
      const d = await res.json();
      return d.ok === true;
    } catch { return false; }
  }

  // ── Offline fallback (localStorage) ─────────────────────────
  function saveLocal(entry) {
    const all = getLocalScores();
    all.push({ ...entry, date: new Date().toLocaleString('es-CO') });
    all.sort((a,b) => b.score - a.score);
    localStorage.setItem('mc_scores', JSON.stringify(all.slice(0, 50)));
  }

  function getLocalScores() {
    try { return JSON.parse(localStorage.getItem('mc_scores') || '[]'); }
    catch { return []; }
  }

  return { getUrl, isConnected, setUrl, submitScore, getLeaderboard, ping, getLocalScores };
})();


// ================================================================
// code.gs — Google Apps Script
// Crea un nuevo proyecto en script.google.com, pega este código
// y despliégalo como Web App (cualquier usuario, ejecutar como tú)
// ================================================================
/*
const SHEET_NAME = "Market-Control Leaderboard";

function doGet(e)  { return handle(e); }
function doPost(e) { return handle(e); }

function handle(e) {
  let body = {};
  try {
    if (e.postData?.contents) body = JSON.parse(e.postData.contents);
    else body = e.parameter;
  } catch(_) { body = e.parameter || {}; }

  const action = body.action || e.parameter?.action || "";
  let result;
  try {
    if      (action === "submitScore")    result = submitScore(body);
    else if (action === "getLeaderboard") result = getLeaderboard();
    else if (action === "ping")           result = { ok: true };
    else result = { error: "Acción desconocida: " + action };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    const headers = ["#","Nombre","Puntaje","Tiempo (s)","Rango","Nv.1","Nv.2","Nv.3","Fecha"];
    sh.appendRow(headers);
    sh.getRange(1,1,1,headers.length)
      .setFontWeight("bold")
      .setBackground("#1a1a2e")
      .setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

function submitScore(body) {
  const sh = getSheet();
  const row = sh.getLastRow(); // Para el número de posición
  sh.appendRow([
    row,                    // #
    body.name  || "Anónimo",
    parseInt(body.score) || 0,
    parseInt(body.time)  || 0,
    body.rank  || "",
    parseInt(body.level1)|| 0,
    parseInt(body.level2)|| 0,
    parseInt(body.level3)|| 0,
    body.date  || new Date().toLocaleString("es-CO"),
  ]);
  // Ordenar por puntaje descendente (columna C = col 3)
  const lastRow = sh.getLastRow();
  if (lastRow > 2) {
    sh.getRange(2, 1, lastRow-1, 9).sort({ column: 3, ascending: false });
  }
  return { ok: true, row: lastRow };
}

function getLeaderboard() {
  const sh = getSheet();
  const data = sh.getDataRange().getValues();
  const rows = data.slice(1).map(r => ({
    name:  r[1], score: r[2], time: r[3],
    rank:  r[4], date:  r[8],
  })).sort((a,b) => b.score - a.score).slice(0, 20);
  return { ok: true, rows };
}
*/
