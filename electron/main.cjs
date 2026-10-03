const { app, BrowserWindow, ipcMain, dialog, protocol, Menu, Notification } = require("electron");
const path = require("path");
const fs = require("fs");
const { registerSaveIpc, logToFile, migrateLegacySave, migrateLegacyJsonSaves } = require("./ipc/saveIpc.cjs");
const { initDatabase } = require("./database/dbManager.cjs");
const { 
  insertShipsBatch, 
  getShipsByPlanet, 
  getPlanetFleetSummary, 
  logShipEvent, 
  getShipLogs,
  renameShip,
  assignShipsToMission,
  returnShipsToPlanet,
  resolveCombatOnShips,
  scrapShipsFromPlanet
} = require("./database/shipRepository.cjs");
const { migrateJsonToSqlite } = require("./database/migrator.cjs");
const {
  getCachedResponse,
  setCachedResponse,
  getDailyQuotaStatus,
  recordApiCall,
} = require("./database/geminiRepository.cjs");

// Permitir autoplay de audio/música sin requerir gesto previo del usuario
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Registrar el esquema como privilegiado para permitir fetch y recursos seguros
protocol.registerSchemesAsPrivileged([
  { 
    scheme: "ascension-asset", 
    privileges: { 
      secure: true, 
      standard: true, 
      supportFetchAPI: true, 
      bypassCSP: false, 
      corsEnabled: false 
    } 
  }
]);

let mainWindow = null;

// Global process-level error handlers
process.on("uncaughtException", (error) => {
  console.error("[Ascensión Main] Uncaught Exception:", error);
  logToFile("UNCAUGHT EXCEPTION (main)", error.stack || error.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Ascensión Main] Unhandled Rejection:", reason);
  logToFile("UNHANDLED REJECTION (main)", reason?.stack || String(reason));
});

function createWindow() {
  protocol.handle("ascension-asset", (request) => {
    const parsedUrl = new URL(request.url);
    let decodedPath = decodeURIComponent(parsedUrl.pathname);
    if (decodedPath === "/" || decodedPath === "") {
      decodedPath = "/index.html";
    }
    const relativePath = decodedPath.startsWith("/") ? decodedPath.slice(1) : decodedPath;
    const distRoot = path.resolve(path.join(__dirname, "..", "dist"));
    const filePath = path.resolve(path.join(distRoot, relativePath));
    const relative = path.relative(distRoot, filePath);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      return new Response("Forbidden", { status: 403 });
    }
    try {
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".woff2": "font/woff2",
        ".avif": "image/avif",
        ".webp": "image/webp",
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
        ".ogg": "audio/ogg",
        ".json": "application/json"
      };
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const rangeHeader = request.headers.get("range");

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const buffer = Buffer.alloc(chunkSize);
        const fd = fs.openSync(filePath, "r");
        fs.readSync(fd, buffer, 0, chunkSize, start);
        fs.closeSync(fd);

        return new Response(buffer, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize.toString(),
            "Content-Type": contentType,
          }
        });
      }

      const data = fs.readFileSync(filePath);
      const headers = {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes"
      };
      // La CSP va como cabecera y no como <meta> en index.html a proposito:
      // Vite inyecta scripts en linea en desarrollo, y una meta los bloquearia
      // en `npm run dev`. En la app empaquetada todo se sirve por aqui, asi
      // que la politica estricta si aplica.
      if (ext === ".html") {
        headers["Content-Security-Policy"] = [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "media-src 'self' data: blob:",
          "font-src 'self' data:",
          "worker-src 'self' blob:",
          "connect-src 'self'",
          "object-src 'none'",
          "frame-src 'none'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join("; ");
      }
      return new Response(data, { headers });
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  });

  const iconPath = process.platform === "win32"
    ? path.join(__dirname, "..", "build", "icon.ico")
    : path.join(__dirname, "..", "build", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#060b18",
    icon: fs.existsSync(iconPath) ? iconPath : path.join(__dirname, "..", "build", "icon.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: true,
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  // El renderer no debe poder abrir ventanas ni navegar fuera del juego.
  // Sin esto, un window.open o un location= desde la UI se salen del juego.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  Menu.setApplicationMenu(null);
  
  mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
    logToFile(`[Renderer Console] [Level ${level}] [Line ${line} of ${sourceId}]`, message);
  });

  mainWindow.loadURL("ascension-asset://index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    const reason = details.reason || "unknown";
    logToFile(`RENDERER PROCESS GONE: ${reason}`, JSON.stringify(details));
    console.error("[Ascensión] Renderer process gone:", reason);
  });

  mainWindow.webContents.on("crashed", (event, killed) => {
    logToFile("RENDERER CRASHED", `killed=${killed}`);
    console.error("[Ascensión] Renderer crashed, killed=", killed);
  });
}

// IPC Notificaciones
ipcMain.handle("show-notification", (_event, title, body) => {
  new Notification({ title, body }).show();
  return { success: true };
});

// Logging de errores del renderer
ipcMain.handle("log-error", async (_event, payload) => {
  logToFile(`[Renderer] ${payload.message}`, payload.stack || "");
  return { success: true };
});

// Exportar logs y telemetría completa a disco
ipcMain.handle("export-logs", async (_event, additionalTelemetry) => {
  try {
    const desktop = app.getPath("desktop");
    const defaultFileName = `ascension_telemetry_logs_${Date.now()}.json`;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Exportar Logs y Telemetría 360",
      defaultPath: path.join(desktop, defaultFileName),
      filters: [{ name: "Archivo de Telemetría JSON", extensions: ["json"] }, { name: "Todos los archivos", extensions: ["*"] }]
    });
    if (result.canceled || !result.filePath) return { success: false, canceled: true };

    const logsDir = path.join(app.getPath("userData"), "logs");
    const logPath = path.join(logsDir, "error.log");
    let rawLogLines = "";
    if (fs.existsSync(logPath)) {
      rawLogLines = fs.readFileSync(logPath, "utf-8");
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      appVersion: app.getVersion(),
      appPath: app.getAppPath(),
      userDataPath: app.getPath("userData"),
      additionalTelemetry: additionalTelemetry || null,
      rawErrorLog: rawLogLines.split("\n---\n").filter(Boolean).slice(-1000)
    };

    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), "utf-8");
    return { success: true, path: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Cierre de aplicación
ipcMain.handle("quit-app", async () => {
  app.quit();
  return { success: true };
});

// Alternar pantalla completa
ipcMain.handle("toggle-fullscreen", async () => {
  if (mainWindow) {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return { success: true, isFullScreen: !isFullScreen };
  }
  return { success: false };
});

// Handlers IPC para el Registro Naval Imperial (SQLite)
ipcMain.handle("db-insert-ships", async (_event, ships) => {
  try {
    return insertShipsBatch(ships);
  } catch (err) {
    console.error("[Ascensión Main] Error en db-insert-ships:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-get-ships-by-planet", async (_event, payload) => {
  try {
    const { planetId, page, pageSize, chassisId, status } = payload || {};
    return getShipsByPlanet(planetId, { page, pageSize, chassisId, status });
  } catch (err) {
    console.error("[Ascensión Main] Error en db-get-ships-by-planet:", err);
    return { total: 0, ships: [], error: err.message };
  }
});

ipcMain.handle("db-get-planet-fleet-summary", async (_event, planetId) => {
  try {
    return getPlanetFleetSummary(planetId);
  } catch (err) {
    console.error("[Ascensión Main] Error en db-get-planet-fleet-summary:", err);
    return {};
  }
});

ipcMain.handle("db-log-ship-event", async (_event, payload) => {
  try {
    const { shipId, eventType, gameTick, locationDesc, details } = payload || {};
    logShipEvent(shipId, eventType, gameTick, locationDesc, details);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-get-ship-logs", async (_event, shipId) => {
  try {
    return getShipLogs(shipId);
  } catch (err) {
    return [];
  }
});

ipcMain.handle("db-rename-ship", async (_event, payload) => {
  try {
    const { shipId, customName } = payload || {};
    return renameShip(shipId, customName);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-assign-ships-mission", async (_event, payload) => {
  try {
    const { planetId, fleetCounts, missionId, gameTick, destinationDesc } = payload || {};
    return assignShipsToMission(planetId, fleetCounts, missionId, gameTick, destinationDesc);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-return-ships-planet", async (_event, payload) => {
  try {
    const { missionId, destinationPlanetId, gameTick, originDesc } = payload || {};
    return returnShipsToPlanet(missionId, destinationPlanetId, gameTick, originDesc);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-resolve-combat-ships", async (_event, payload) => {
  try {
    const { missionId, lossesByChassis, battleDetails } = payload || {};
    return resolveCombatOnShips(missionId, lossesByChassis, battleDetails);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-scrap-ships", async (_event, payload) => {
  try {
    const { planetId, chassisId, quantity, gameTick } = payload || {};
    return scrapShipsFromPlanet(planetId, chassisId, quantity, gameTick);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("db-migrate-json", async (_event, saveSlug) => {
  try {
    const slug = String(saveSlug || "partida");
    // El slug se interpola en una ruta de disco. Sin esta comprobacion,
    // "../../victima" escribia "<victima>.legacy_v3.bak" fuera de la carpeta
    // de partidas. Mismo criterio que assertSafeSlug del resto de canales.
    if (!/^[a-z0-9-]{1,80}$/.test(slug) || slug.includes("..")) {
      return { success: false, error: "Slug de save no válido" };
    }
    const savesDir = path.join(app.getPath("userData"), "saves");
    const jsonPath = path.join(savesDir, `${slug}.json`);
    return migrateJsonToSqlite(jsonPath, slug);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ═══════════════════════════════════════════════════════════════
// CANALES IPC DE GEMINI IA (Caché local y Cuota)
// ═══════════════════════════════════════════════════════════════
ipcMain.handle("gemini-get-cache", async (_event, prompt) => {
  try {
    const cached = getCachedResponse(prompt);
    return { success: true, cached };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("gemini-set-cache", async (_event, payload) => {
  try {
    const { prompt, responseText, category } = payload || {};
    setCachedResponse(prompt, responseText, category);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("gemini-get-quota", async (_event, maxDaily) => {
  try {
    const quota = getDailyQuotaStatus(maxDaily || 500);
    return { success: true, quota };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("gemini-record-call", async () => {
  try {
    recordApiCall();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Registrar IPC de guardado y partidas
registerSaveIpc(() => mainWindow);

app.whenReady().then(() => {
  logToFile("APPLICATION STARTED");
  logToFile("[Ascensión] SQLite unified persistence system v4 active");
  migrateLegacySave();

  try {
    initDatabase();
    logToFile("[Ascensión DB] SQLite engine successfully initialized.");

    // Migración automática: JSON → SQLite (solo en primer arranque post-actualización)
    migrateLegacyJsonSaves();
    logToFile("[Ascensión DB] Legacy JSON migration check completed.");
  } catch (dbErr) {
    console.error("[Ascensión DB] Fallo al iniciar SQLite:", dbErr);
    logToFile("SQLITE INIT ERROR", dbErr.stack || dbErr.message);
  }

  createWindow();
});

app.on("window-all-closed", () => {
  logToFile("APPLICATION QUIT (window-all-closed)");
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
