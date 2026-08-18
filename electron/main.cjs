const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

// Permitir autoplay de audio/música sin requerir gesto previo del usuario
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Registrar el esquema como privilegiado para permitir fetch y recursos seguros
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'ascension-asset', 
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

// ============================================================
// SISTEMA DE PARTIDAS MÚLTIPLES
// Cada partida es un archivo JSON independiente en savesDir.
// Estructura: userData/saves/<slug>.json con metadata {name, mtime, ...}
// ============================================================

function getSavesDir() {
  return path.join(app.getPath('userData'), 'saves');
}

function ensureSavesDir() {
  const dir = getSavesDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'partida';
}

function isPathInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function assertSafeSlug(slug) {
  const value = String(slug || '').trim();
  if (!/^[a-z0-9-]{1,80}$/.test(value) || value.includes('..')) {
    throw new Error('Slug inválido');
  }
  return value;
}

function getSavePathBySlug(slug) {
  const safeSlug = assertSafeSlug(slug);
  const savesDir = path.resolve(getSavesDir());
  const savePath = path.resolve(path.join(savesDir, `${safeSlug}.json`));
  if (!isPathInside(savePath, savesDir)) {
    throw new Error('Ruta de save inválida');
  }
  return savePath;
}

function validateSaveData(data, { requireGameStarted = true } = {}) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Save vacío o inválido' };
  }
  if (data.version !== 2 && data.version !== 3) {
    return { valid: false, error: 'Versión de save inválida' };
  }
  if (!data.playerName || typeof data.playerName !== 'string') {
    return { valid: false, error: 'Falta playerName válido' };
  }
  if (!Array.isArray(data.planets) || data.planets.length === 0) {
    return { valid: false, error: 'No hay planetas en el save' };
  }
  if (data.gameStarted === undefined) {
    data.gameStarted = true;
  }
  if (requireGameStarted && !data.gameStarted) {
    return { valid: false, error: 'El save no tiene una partida iniciada' };
  }
  return { valid: true };
}

function readValidatedSaveFile(savePath, label = 'save') {
  const raw = fs.readFileSync(savePath, 'utf-8');
  const data = JSON.parse(raw);
  const validation = validateSaveData(data);
  if (!validation.valid) {
    throw new Error(`${label} inválido: ${validation.error}`);
  }
  return correctResearchLevels(data);
}

// Corrección de niveles de investigación ilegales:
// tecnologías cuyo nivel consta en el save sin cumplir sus requisitos
// (p. ej. Navegación Interestelar Nv.2 con Astrofísica < 5) se revierten a 0.
function correctResearchLevels(data) {
  if (!data || typeof data !== 'object' || !data.research) return data;
  const r = data.research;
  const needsFix =
    r.interstellarNav > 0 &&
    ((r.hyperspace || 0) < 5 || (r.astrophysics || 0) < 5);
  if (!needsFix) return data;
  const newResearch = { ...r, interstellarNav: 0 };
  const result = { ...data, research: newResearch };
  logToFile('[Ascensión] Save corrected: interstellarNav reset to 0 (missing prerequisites).');
  return result;
}

// Migración automática: si existe el save antiguo v2 y no hay saves nuevos, lo migra
function migrateLegacySave() {
  try {
    const legacyPath = path.join(app.getPath('userData'), 'ascension_save_v2.json');
    if (!fs.existsSync(legacyPath)) return;
    ensureSavesDir();
    const files = fs.readdirSync(getSavesDir()).filter(f => f.endsWith('.json'));
    if (files.length > 0) return; // ya hay saves nuevos, no migrar
    const raw = fs.readFileSync(legacyPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data || !data.playerName) return;
    const baseName = data.playerName || 'Partida';
    const slug = slugify(baseName);
    const target = getSavePathBySlug(slug);
    fs.writeFileSync(target, raw, 'utf-8');
    logToFile(`[Ascensión] Migrated legacy save to ${slug}.json`);
  } catch (e) {
    logToFile(`[Ascensión] Legacy migration failed: ${e.message}`);
  }
}

// ============================================================
// SISTEMA DE BACKUPS INTELIGENTES (B2-T3)
// Timestamped + rotación de últimas 5 + recuperación en load
// ============================================================

function getBackupDir(savePath) {
  return path.dirname(savePath);
}

function getBackupBase(savePath) {
  return path.basename(savePath, '.json');
}

// Crea un backup con timestamp antes de sobrescribir el save principal
function createTimestampedBackup(savePath) {
  try {
    if (!fs.existsSync(savePath)) return null;

    const dir = getBackupDir(savePath);
    const base = getBackupBase(savePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${base}_${timestamp}.bak`;
    const backupPath = path.join(dir, backupName);

    fs.copyFileSync(savePath, backupPath);

    const logMsg = `[Ascensión] Backup created: ${backupName}`;
    console.log(logMsg);
    logToFile(logMsg);

    // Limpiar backups antiguos (mantener solo las últimas 5)
    cleanupOldBackups(savePath, 5);

    return backupPath;
  } catch (err) {
    const errMsg = `[Ascensión] Backup creation failed: ${err.message}`;
    console.error(errMsg);
    logToFile(errMsg, err.stack || '');
    return null;
  }
}

// Lista todos los backups timestamped ordenados por fecha de modificación (más reciente primero)
function listRecentBackups(savePath) {
  try {
    const dir = getBackupDir(savePath);
    const base = getBackupBase(savePath);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(base + '_') && f.endsWith('.bak'))
      .map(f => {
        const full = path.join(dir, f);
        try {
          const stat = fs.statSync(full);
          return { name: f, path: full, mtime: stat.mtime.getTime() };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime); // más reciente primero

    return files;
  } catch (err) {
    logToFile(`[Ascensión] Failed to list backups: ${err.message}`);
    return [];
  }
}

// Mantiene solo las N backups más recientes (por mtime)
function cleanupOldBackups(savePath, keep = 5) {
  try {
    const backups = listRecentBackups(savePath);
    if (backups.length <= keep) return;

    const toDelete = backups.slice(keep);
    for (const b of toDelete) {
      try {
        fs.unlinkSync(b.path);
        const logMsg = `[Ascensión] Old backup pruned: ${b.name}`;
        console.log(logMsg);
        logToFile(logMsg);
      } catch (e) {
        logToFile(`[Ascensión] Failed to prune backup ${b.name}: ${e.message}`);
      }
    }
  } catch (err) {
    logToFile(`[Ascensión] Backup cleanup error: ${err.message}`);
  }
}

// Devuelve el backup más reciente (o null)
function getLatestBackup(savePath) {
  const backups = listRecentBackups(savePath);
  return backups.length > 0 ? backups[0] : null;
}

// Centralized error logger (writes to userData/logs/error.log)
function logToFile(message, stack = '') {
  try {
    const logsDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path.join(logsDir, 'error.log');
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n${stack ? stack + '\n' : ''}---\n`;
    fs.appendFileSync(logPath, line, 'utf-8');
  } catch (e) {
    // Last resort: console only
    console.error('Failed to write error log:', e);
  }
}

// Global process-level error handlers (very important for Electron stability)
process.on('uncaughtException', (error) => {
  console.error('[Ascensión Main] Uncaught Exception:', error);
  logToFile('UNCAUGHT EXCEPTION (main)', error.stack || error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Ascensión Main] Unhandled Rejection:', reason);
  logToFile('UNHANDLED REJECTION (main)', reason?.stack || String(reason));
});

function createWindow() {
  // Registrar el manejador del protocolo personalizado con soporte de streaming (Range headers)
  protocol.handle('ascension-asset', (request) => {
    const parsedUrl = new URL(request.url);
    let decodedPath = decodeURIComponent(parsedUrl.pathname);
    if (decodedPath === '/' || decodedPath === '') {
      decodedPath = '/index.html';
    }
    const relativePath = decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath;
    const distRoot = path.resolve(path.join(__dirname, '..', 'dist'));
    const filePath = path.resolve(path.join(distRoot, relativePath));
    const relative = path.relative(distRoot, filePath);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      return new Response('Forbidden', { status: 403 });
    }
    try {
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
        '.avif': 'image/avif',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.json': 'application/json'
      };
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const rangeHeader = request.headers.get('range');

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const buffer = Buffer.alloc(chunkSize);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, chunkSize, start);
        fs.closeSync(fd);

        return new Response(buffer, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': contentType,
          }
        });
      }

      const data = fs.readFileSync(filePath);
      return new Response(data, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes'
        }
      });
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#060b18',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);
  
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    logToFile(`[Renderer Console] [Level ${level}] [Line ${line} of ${sourceId}]`, message);
  });

  mainWindow.loadURL('ascension-asset://index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Renderer crash / gone handling (critical for rule #3 stability)
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    const reason = details.reason || 'unknown';
    logToFile(`RENDERER PROCESS GONE: ${reason}`, JSON.stringify(details));
    console.error('[Ascensión] Renderer process gone:', reason);
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    logToFile('RENDERER CRASHED', `killed=${killed}`);
    console.error('[Ascensión] Renderer crashed, killed=', killed);
  });
}



ipcMain.handle('show-notification', (_event, title, body) => {
  const { Notification } = require('electron');
  new Notification({ title, body }).show();
  return { success: true };
});



// Error logging to disk (called from renderer ErrorBoundary)
ipcMain.handle('log-error', async (_event, payload) => {
  logToFile(`[Renderer] ${payload.message}`, payload.stack || '');
  return { success: true };
});

// ============================================================
// IPC: SISTEMA DE PARTIDAS MÚLTIPLES
// ============================================================

ipcMain.handle('list-saves', async () => {
  try {
    ensureSavesDir();
    const files = fs.readdirSync(getSavesDir())
      .filter(f => f.endsWith('.json') && !f.includes('_backup_'))
      .map(f => {
        const full = path.join(getSavesDir(), f);
        try {
          const raw = fs.readFileSync(full, 'utf-8');
          const data = JSON.parse(raw);
          const stat = fs.statSync(full);
          const slug = f.replace('.json', '');
          return {
            slug,
            name: data.playerName || slug,
            mtime: stat.mtime.getTime(),
            planetCount: Array.isArray(data.planets) ? data.planets.length : 0,
            version: data.version || 0,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime);
    return { success: true, saves: files };
  } catch (err) {
    return { success: false, error: err.message, saves: [] };
  }
});

ipcMain.handle('load-save-by-slug', async (_event, slug) => {
  try {
    const savePath = getSavePathBySlug(slug);
    if (!fs.existsSync(savePath)) {
      return { success: false, error: 'Partida no encontrada' };
    }
    try {
      const data = readValidatedSaveFile(savePath, 'save principal');
      return { success: true, data };
    } catch (primaryErr) {
      const latestBackup = getLatestBackup(savePath);
      if (!latestBackup) {
        return { success: false, error: primaryErr.message || 'Save inválido' };
      }
      try {
        const data = readValidatedSaveFile(latestBackup.path, 'backup');
        logToFile(`[Ascensión] Recovered save from backup: ${latestBackup.name}`);
        return { success: true, data, recoveredFromBackup: true, backupName: latestBackup.name };
      } catch (backupErr) {
        return { success: false, error: `${primaryErr.message}; backup inválido: ${backupErr.message}` };
      }
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save-game-named', async (_event, data) => {
  try {
    const validation = validateSaveData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    ensureSavesDir();
    const name = (data && data.playerName) ? String(data.playerName).trim() : 'Partida';
    const slug = slugify(name);

    let finalSlug = slug;
    let counter = 2;
    while (fs.existsSync(getSavePathBySlug(finalSlug)) && counter < 1000) {
      const existing = JSON.parse(fs.readFileSync(getSavePathBySlug(finalSlug), 'utf-8'));
      if (existing.playerName === name) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const finalPath = getSavePathBySlug(finalSlug);
    createTimestampedBackup(finalPath);

    const dataToSave = { ...data, _saveName: name, _saveSlug: finalSlug };
    fs.writeFileSync(finalPath, JSON.stringify(dataToSave), 'utf-8');
    return { success: true, slug: finalSlug };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('save-game-named-sync', (event, data) => {
  try {
    const validation = validateSaveData(data);
    if (!validation.valid) {
      event.returnValue = { success: false, error: validation.error };
      return;
    }
    ensureSavesDir();
    const name = (data && data.playerName) ? String(data.playerName).trim() : 'Partida';
    const slug = slugify(name);

    let finalSlug = slug;
    let counter = 2;
    while (fs.existsSync(getSavePathBySlug(finalSlug)) && counter < 1000) {
      const existing = JSON.parse(fs.readFileSync(getSavePathBySlug(finalSlug), 'utf-8'));
      if (existing.playerName === name) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const finalPath = getSavePathBySlug(finalSlug);
    createTimestampedBackup(finalPath);
    const dataToSave = { ...data, _saveName: name, _saveSlug: finalSlug };
    fs.writeFileSync(finalPath, JSON.stringify(dataToSave), 'utf-8');
    event.returnValue = { success: true, slug: finalSlug };
  } catch (err) {
    event.returnValue = { success: false, error: err.message };
  }
});

ipcMain.handle('save-game', async (event, saveData) => {
  try {
    const savePath = getSavePath();
    const bakPath = savePath + '.bak';
    const tmpPath = savePath + '.tmp';

    // 1. Respaldar a .bak si existe partida guardada previa
    if (fs.existsSync(savePath)) {
      await fs.promises.copyFile(savePath, bakPath);
    }

    // 2. Escritura atómica primero a .tmp para cero corrupción
    await fs.promises.writeFile(tmpPath, saveData, 'utf8');

    // 3. Renombrado atómico (.tmp -> savePath)
    await fs.promises.rename(tmpPath, savePath);

    return { success: true };
  } catch (err) {
    console.error('[Ascensión IPC] Error al guardar partida:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-save-by-slug', async (_event, slug) => {
  try {
    const savePath = getSavePathBySlug(slug);
    if (fs.existsSync(savePath)) {
      fs.unlinkSync(savePath);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('rename-save', async (_event, payload) => {
  try {
    const { oldSlug, newName } = payload || {};
    if (!oldSlug || !newName || !newName.trim()) {
      return { success: false, error: 'Datos inválidos' };
    }
    const oldPath = getSavePathBySlug(oldSlug);
    if (!fs.existsSync(oldPath)) {
      return { success: false, error: 'Partida no encontrada' };
    }
    const raw = fs.readFileSync(oldPath, 'utf-8');
    const data = JSON.parse(raw);
    const validation = validateSaveData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const newSlug = slugify(newName);
    const newPath = getSavePathBySlug(newSlug);
    if (newSlug !== oldSlug && fs.existsSync(newPath)) {
      return { success: false, error: 'Ya existe una partida con ese nombre' };
    }
    data.playerName = newName.trim();
    data._saveName = newName.trim();
    data._saveSlug = newSlug;
    fs.writeFileSync(newPath, JSON.stringify(data), 'utf-8');
    if (newSlug !== oldSlug) {
      fs.unlinkSync(oldPath);
    }
    return { success: true, slug: newSlug };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('export-save-to-file', async (_event, payload) => {
  try {
    const { data, defaultName } = payload || {};
    const desktop = app.getPath('desktop');
    const safeName = (defaultName || 'partida').replace(/[^a-zA-Z0-9_\- ]/g, '_');
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.join(desktop, `ascension_${safeName}_${Date.now()}.json`),
      filters: [{ name: 'Ascensión Save', extensions: ['json'] }],
    });
    if (result.canceled) return { success: false, canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('import-save-from-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'Ascensión Save', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }
const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
    const data = correctResearchLevels(JSON.parse(raw));
    const validation = validateSaveData(data);
    if (!validation.valid) {
      return { success: false, error: `Archivo de save inválido: ${validation.error}` };
    }
    // Guardar en el sistema interno
    ensureSavesDir();
    const name = data.playerName;
    const slug = slugify(name);
    let finalSlug = slug;
    let counter = 2;
    while (fs.existsSync(getSavePathBySlug(finalSlug)) && counter < 1000) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    const target = getSavePathBySlug(finalSlug);
    data._saveName = name;
    data._saveSlug = finalSlug;
    fs.writeFileSync(target, JSON.stringify(data), 'utf-8');
    return { success: true, data, slug: finalSlug };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('quit-app', async () => {
  app.quit();
  return { success: true };
});

app.whenReady().then(() => {
  logToFile('APPLICATION STARTED');
  logToFile('[Ascensión] Smart backup system active (timestamped + last 5 retention + auto-recovery on load)');
  migrateLegacySave();
  createWindow();
});

app.on('window-all-closed', () => {
  logToFile('APPLICATION QUIT (window-all-closed)');
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

