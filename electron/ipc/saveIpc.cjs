const { app, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  saveFullGameState,
  loadFullGameState,
  listGameSessions,
  deleteGameSession,
  renameGameSession,
  exportSessionToJson,
  importSessionFromJson,
  sessionExists,
} = require("../database/gameRepository.cjs");
const {
  createTimestampedBackup,
  getLatestBackup,
} = require("./backupManager.cjs");
const { getDatabasePath, getDb } = require("../database/dbManager.cjs");

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "partida";
}

function assertSafeSlug(slug) {
  const value = String(slug || "").trim();
  if (!/^[a-z0-9-]{1,80}$/.test(value) || value.includes("..")) {
    throw new Error("Slug inválido");
  }
  return value;
}

function validateSaveData(data, { requireGameStarted = true } = {}) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Save vacío o inválido" };
  }
  if (!data.version && Array.isArray(data.planets)) {
    data.version = 3;
  }
  if (data.version !== 2 && data.version !== 3 && data.version !== 4) {
    return { valid: false, error: "Versión de save inválida" };
  }
  if (!data.playerName || typeof data.playerName !== "string") {
    return { valid: false, error: "Falta playerName válido" };
  }
  if (!Array.isArray(data.planets) || data.planets.length === 0) {
    return { valid: false, error: "No hay planetas en el save" };
  }
  if (data.gameStarted === undefined) {
    data.gameStarted = true;
  }
  if (requireGameStarted && !data.gameStarted) {
    return { valid: false, error: "El save no tiene una partida iniciada" };
  }
  return { valid: true };
}

function logToFile(message, stack = "") {
  try {
    const logsDir = path.join(app.getPath("userData"), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path.join(logsDir, "error.log");
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n${stack ? stack + "\n" : ""}---\n`;
    fs.appendFileSync(logPath, line, "utf-8");

    // Crash Reporter
    if (stack && (message.includes("EXCEPTION") || message.includes("CRASH") || message.includes("FATAL"))) {
      const crashesDir = path.join(app.getPath("userData"), "crashes");
      if (!fs.existsSync(crashesDir)) {
        fs.mkdirSync(crashesDir, { recursive: true });
      }
      const crashFile = path.join(crashesDir, `crash_${Date.now()}.json`);
      const crashDump = {
        timestamp,
        error: message,
        stack,
        memoryUsage: process.memoryUsage(),
        uptimeSeconds: process.uptime(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.versions.node,
        electronVersion: process.versions.electron
      };
      fs.writeFileSync(crashFile, JSON.stringify(crashDump, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Failed to write error log:", e);
  }
}

function correctResearchLevels(data) {
  if (!data || typeof data !== "object" || !data.research) return data;
  const r = data.research;
  const needsFix =
    r.interstellarNav > 0 &&
    ((r.hyperspace || 0) < 5 || (r.astrophysics || 0) < 5);
  if (!needsFix) return data;
  const newResearch = { ...r, interstellarNav: 0 };
  const result = { ...data, research: newResearch };
  logToFile("[Ascensión] Save corrected: interstellarNav reset to 0 (missing prerequisites).");
  return result;
}

// Migración de saves legacy JSON a SQLite (se ejecuta una vez)
function migrateLegacyJsonSaves() {
  try {
    const savesDir = path.join(app.getPath("userData"), "saves");
    if (!fs.existsSync(savesDir)) return;

    const jsonFiles = fs.readdirSync(savesDir)
      .filter(f => f.endsWith(".json") && !f.includes("_backup_") && !f.endsWith(".bak"));

    if (jsonFiles.length === 0) return;

    // Verificar si ya se migró (hay sesiones en DB)
    const existingSessions = listGameSessions();
    if (existingSessions.length > 0) {
      console.log("[Ascensión] Migración legacy omitida: ya existen sesiones SQLite.");
      return;
    }

    console.log(`[Ascensión] Migrando ${jsonFiles.length} saves JSON a SQLite...`);

    for (const file of jsonFiles) {
      try {
        const fullPath = path.join(savesDir, file);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const data = correctResearchLevels(JSON.parse(raw));
        const validation = validateSaveData(data, { requireGameStarted: false });
        if (!validation.valid) {
          logToFile(`[Ascensión] Save JSON inválido durante migración: ${file} — ${validation.error}`);
          continue;
        }
        const slug = file.replace(".json", "");
        saveFullGameState(slug, data);
        logToFile(`[Ascensión] Migrado: ${file} → SQLite session [${slug}]`);

        // Crear backup del JSON original
        const bakPath = `${fullPath}.migrated_to_sqlite.bak`;
        if (!fs.existsSync(bakPath)) {
          fs.copyFileSync(fullPath, bakPath);
        }
      } catch (fileErr) {
        logToFile(`[Ascensión] Error migrando ${file}: ${fileErr.message}`, fileErr.stack);
      }
    }

    console.log("[Ascensión] Migración de saves JSON completada.");
  } catch (e) {
    logToFile("[Ascensión] Error general en migración legacy:", e.stack || e.message);
  }
}

// Migración de save legacy v2 (archivo suelto)
function migrateLegacySave() {
  try {
    const legacyPath = path.join(app.getPath("userData"), "ascension_save_v2.json");
    if (!fs.existsSync(legacyPath)) return;

    const existingSessions = listGameSessions();
    if (existingSessions.length > 0) return;

    const raw = fs.readFileSync(legacyPath, "utf-8");
    const data = JSON.parse(raw);
    if (!data || !data.playerName) return;
    const slug = slugify(data.playerName);
    saveFullGameState(slug, data);
    logToFile(`[Ascensión] Migrated legacy v2 save to SQLite session [${slug}]`);
  } catch (e) {
    logToFile(`[Ascensión] Legacy v2 migration failed: ${e.message}`);
  }
}

function registerSaveIpc(getMainWindow) {
  // ═══════════════════════════════════════════════════════════════
  // LISTAR PARTIDAS (ahora lee de SQLite)
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("list-saves", async () => {
    try {
      const saves = listGameSessions();
      return { success: true, saves };
    } catch (err) {
      return { success: false, error: err.message, saves: [] };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // CARGAR PARTIDA POR SLUG (ahora lee de SQLite)
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("load-save-by-slug", async (_event, slug) => {
    try {
      const safeSlug = assertSafeSlug(slug);
      const data = loadFullGameState(safeSlug);
      if (!data) {
        return { success: false, error: "Partida no encontrada" };
      }
      const corrected = correctResearchLevels(data);
      return { success: true, data: corrected };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GUARDAR PARTIDA (ahora escribe a SQLite)
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("save-game-named", async (_event, data) => {
    try {
      const validation = validateSaveData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const name = (data && data.playerName) ? String(data.playerName).trim() : "Partida";
      const slug = slugify(name);

      let finalSlug = slug;
      let counter = 2;
      while (sessionExists(finalSlug) && counter < 1000) {
        // Si ya existe y es del mismo jugador, sobrescribir
        const existing = loadFullGameState(finalSlug);
        if (existing && existing.playerName === name) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Backup de la DB antes de sobrescribir
      createTimestampedBackup(getDatabasePath(), logToFile);

      saveFullGameState(finalSlug, data);
      return { success: true, slug: finalSlug };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GUARDAR SYNC (para beforeunload / emergencias)
  // ═══════════════════════════════════════════════════════════════
  ipcMain.on("save-game-named-sync", (event, data) => {
    try {
      const validation = validateSaveData(data);
      if (!validation.valid) {
        event.returnValue = { success: false, error: validation.error };
        return;
      }

      const name = (data && data.playerName) ? String(data.playerName).trim() : "Partida";
      const slug = slugify(name);

      let finalSlug = slug;
      let counter = 2;
      while (sessionExists(finalSlug) && counter < 1000) {
        const existing = loadFullGameState(finalSlug);
        if (existing && existing.playerName === name) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      createTimestampedBackup(getDatabasePath(), logToFile);
      saveFullGameState(finalSlug, data);
      event.returnValue = { success: true, slug: finalSlug };
    } catch (err) {
      event.returnValue = { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ELIMINAR PARTIDA
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("delete-save-by-slug", async (_event, slug) => {
    try {
      const safeSlug = assertSafeSlug(slug);
      return deleteGameSession(safeSlug);
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // RENOMBRAR PARTIDA
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("rename-save", async (_event, payload) => {
    try {
      const { oldSlug, newName } = payload || {};
      if (!oldSlug || !newName || !newName.trim()) {
        return { success: false, error: "Datos inválidos" };
      }
      const safeOldSlug = assertSafeSlug(oldSlug);
      const newSlug = slugify(newName);
      return renameGameSession(safeOldSlug, newName, newSlug);
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // EXPORTAR A ARCHIVO JSON (mantiene compat con import/export manual)
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("export-save-to-file", async (_event, payload) => {
    try {
      const mainWindow = getMainWindow ? getMainWindow() : null;
      const { data, defaultName } = payload || {};
      const desktop = app.getPath("desktop");
      const safeName = (defaultName || "partida").replace(/[^a-zA-Z0-9_\- ]/g, "_");
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: path.join(desktop, `ascension_${safeName}_${Date.now()}.json`),
        filters: [{ name: "Ascensión Save", extensions: ["json"] }],
      });
      if (result.canceled) return { success: false, canceled: true };
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true, path: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // IMPORTAR DESDE ARCHIVO JSON
  // ═══════════════════════════════════════════════════════════════
  ipcMain.handle("import-save-from-file", async () => {
    try {
      const mainWindow = getMainWindow ? getMainWindow() : null;
      const result = await dialog.showOpenDialog(mainWindow, {
        filters: [{ name: "Ascensión Save", extensions: ["json"] }],
        properties: ["openFile"],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }
      const raw = fs.readFileSync(result.filePaths[0], "utf-8");
      const data = correctResearchLevels(JSON.parse(raw));
      const validation = validateSaveData(data);
      if (!validation.valid) {
        return { success: false, error: `Archivo de save inválido: ${validation.error}` };
      }

      const name = data.playerName;
      const slug = slugify(name);
      let finalSlug = slug;
      let counter = 2;
      while (sessionExists(finalSlug) && counter < 1000) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      importSessionFromJson(data, finalSlug);

      // Recargar la partida importada para devolver al renderer
      const imported = loadFullGameState(finalSlug);
      return { success: true, data: imported, slug: finalSlug };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = {
  registerSaveIpc,
  logToFile,
  migrateLegacySave,
  migrateLegacyJsonSaves,
  validateSaveData,
};
