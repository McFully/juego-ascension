const path = require("path");
const fs = require("fs");

function getBackupDir(filePath) {
  return path.dirname(filePath);
}

function getBackupBase(filePath) {
  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
}

function getBackupExt(filePath) {
  return path.extname(filePath) || ".db";
}

function cleanupOldBackups(filePath, keep = 5, logToFile = () => {}) {
  try {
    const backups = listRecentBackups(filePath, logToFile);
    if (backups.length <= keep) return;

    const toDelete = backups.slice(keep);
    for (const b of toDelete) {
      try {
        fs.unlinkSync(b.path);
        // El sidecar de un .bak podado tambien debe irse.
        try { fs.unlinkSync(b.path + "-wal"); } catch { /* no existia */ }
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

function createTimestampedBackup(filePath, logToFile = () => {}, beforeCopy = null) {
  try {
    if (!fs.existsSync(filePath)) return null;

    const ext = path.extname(filePath).toLowerCase();

    // Volcar el WAL ANTES de copiar. Copiar un .db en modo WAL sin checkpoint
    // deja fuera del backup todas las transacciones aun no volcadas. Ademas
    // evita tener que copiar sidecars: con TRUNCATE el WAL queda a cero.
    if (ext === ".db" && typeof beforeCopy === "function") {
      try {
        const res = beforeCopy();
        if (res) {
          logToFile(`[Ascensión] WAL checkpoint: ${JSON.stringify(res)}`);
        }
      } catch (walErr) {
        logToFile(`[Ascensión] WAL checkpoint warning: ${walErr.message}`);
      }
    }

    const dir = getBackupDir(filePath);
    const base = getBackupBase(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `${base}_${timestamp}.bak`;
    const backupPath = path.join(dir, backupName);

    fs.copyFileSync(filePath, backupPath);

    // Sidecars huerfanos de backups antiguos (creados por la version previa,
    // que copiaba el WAL a <backup>.bak-wal y nunca los borraba). Se eliminan
    // junto con su .bak para no acumular GB sin uso.
    const sidecar = backupPath + "-wal";
    if (fs.existsSync(sidecar)) {
      try {
        fs.unlinkSync(sidecar);
        logToFile(`[Ascensión] Sidecar huérfano eliminado: ${path.basename(sidecar)}`);
      } catch (e) {
        logToFile(`[Ascensión] No se pudo borrar el sidecar: ${e.message}`);
      }
    }

    const logMsg = `[Ascensión] Backup created: ${backupName}`;
    console.log(logMsg);
    logToFile(logMsg);

    cleanupOldBackups(filePath, 5, logToFile);
    return backupPath;
  } catch (err) {
    const errMsg = `[Ascensión] Backup creation failed: ${err.message}`;
    console.error(errMsg);
    logToFile(errMsg, err.stack || "");
    return null;
  }
}

function listRecentBackups(filePath, logToFile = () => {}) {
  try {
    const dir = getBackupDir(filePath);
    const base = getBackupBase(filePath);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(base + "_") && f.endsWith(".bak"))
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
      .sort((a, b) => b.mtime - a.mtime);

    return files;
  } catch (err) {
    logToFile(`[Ascensión] Failed to list backups: ${err.message}`);
    return [];
  }
}

function getLatestBackup(filePath, logToFile = () => {}) {
  const backups = listRecentBackups(filePath, logToFile);
  return backups.length > 0 ? backups[0] : null;
}

/**
 * Localiza los sidecars `<backup>.bak-wal` que ninguna version del juego sabe
 * leer: se crean al copiar el WAL y jamas se aplican. Solo informa.
 */
function findOrphanSidecars(filePath, logToFile = () => {}) {
  const dir = getBackupDir(filePath);
  const base = getBackupBase(filePath);
  if (!fs.existsSync(dir)) return { count: 0, bytes: 0, files: [] };
  const files = [];
  let bytes = 0;
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith(base + "_") && f.endsWith(".bak-wal")) {
      const full = path.join(dir, f);
      const st = fs.statSync(full);
      bytes += st.size;
      files.push({ name: f, path: full, bytes: st.size });
    }
  }
  return { count: files.length, bytes, files };
}

/**
 * BORRA los sidecars huerfanos. Es destructivo, asi que NO se llama en el
 * arranque: se expone como accion explicita (ver canal `prune-backup-sidecars`)
 * para que el jugador la ejecute a proposito y vea antes cuanto se va a liberar.
 */
function pruneOrphanSidecars(filePath, logToFile = () => {}) {
  const { files, bytes } = findOrphanSidecars(filePath, logToFile);
  let freed = 0;
  for (const f of files) {
    try {
      fs.unlinkSync(f.path);
      freed += f.bytes;
    } catch (e) {
      logToFile(`[Ascensión] No se pudo borrar ${f.name}: ${e.message}`);
    }
  }
  const msg = `[Ascensión] Sidecars huérfanos eliminados: ${files.length} ficheros, ${(freed / 1048576).toFixed(1)} MB liberados`;
  console.log(msg);
  logToFile(msg);
  return { removed: files.length, bytes: freed, totalBytes: bytes };
}

module.exports = {
  createTimestampedBackup,
  listRecentBackups,
  cleanupOldBackups,
  getLatestBackup,
  findOrphanSidecars,
  pruneOrphanSidecars,
};
