const { getDb } = require("./dbManager.cjs");
const crypto = require("crypto");

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calcula el hash SHA-256 de un prompt para usar como clave de caché
 */
function hashPrompt(prompt) {
  return crypto.createHash("sha256").update(String(prompt).trim()).digest("hex");
}

/**
 * Busca si un prompt ya tiene respuesta guardada en la caché local
 */
function getCachedResponse(prompt) {
  try {
    const db = getDb();
    const hash = hashPrompt(prompt);
    const row = db.prepare("SELECT response_text FROM gemini_cache WHERE prompt_hash = ?").get(hash);
    return row ? row.response_text : null;
  } catch (err) {
    console.warn("[Gemini Cache] Error al leer caché:", err.message);
    return null;
  }
}

/**
 * Guarda una respuesta de Gemini en la caché local
 */
function setCachedResponse(prompt, responseText, category = "general") {
  try {
    const db = getDb();
    const hash = hashPrompt(prompt);
    const id = `gc_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    db.prepare(`
      INSERT INTO gemini_cache (id, prompt_hash, response_text, category)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(prompt_hash) DO UPDATE SET response_text = excluded.response_text
    `).run(id, hash, responseText, category);
  } catch (err) {
    console.warn("[Gemini Cache] Error al guardar en caché:", err.message);
  }
}

/**
 * Obtiene las llamadas realizadas hoy y el límite configurado
 */
function getDailyQuotaStatus(maxDaily = 500) {
  try {
    const db = getDb();
    const today = getTodayString();
    const row = db.prepare("SELECT calls_count FROM gemini_quota WHERE date = ?").get(today);
    const used = row ? row.calls_count : 0;
    return {
      date: today,
      used,
      maxDaily,
      remaining: Math.max(0, maxDaily - used),
      canMakeCall: used < maxDaily,
    };
  } catch (err) {
    console.warn("[Gemini Quota] Error al leer cuota:", err.message);
    return { date: getTodayString(), used: 0, maxDaily, remaining: maxDaily, canMakeCall: true };
  }
}

/**
 * Incrementa en 1 el contador de llamadas realizadas hoy
 */
function recordApiCall() {
  try {
    const db = getDb();
    const today = getTodayString();
    db.prepare(`
      INSERT INTO gemini_quota (date, calls_count)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET calls_count = calls_count + 1
    `).run(today);
  } catch (err) {
    console.warn("[Gemini Quota] Error al incrementar cuota:", err.message);
  }
}

module.exports = {
  hashPrompt,
  getCachedResponse,
  setCachedResponse,
  getDailyQuotaStatus,
  recordApiCall,
};
