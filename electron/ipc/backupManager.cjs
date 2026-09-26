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

function createTimestampedBackup(filePath, logToFile = () => {}) {
  try {
    if (!fs.existsSync(filePath)) return null;

    // WAL checkpoint para consistencia del .db antes de copiar
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".db") {
      try {
        // Intentar checkpoint WAL si es SQLite
        const walPath = filePath + "-wal";
        const shmPath = filePath + "-shm";
        // El checkpoint se hace a nivel de motor, aquí solo nos aseguramos
        // de copiar también los archivos WAL/SHM si existen
        const extraFiles = [];
        if (fs.existsSync(walPath)) extraFiles.push(walPath);
        if (fs.existsSync(shmPath)) extraFiles.push(shmPath);
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

    // Copiar archivos WAL/SHM asociados si existen (para backups de .db)
    if (ext === ".db") {
      const walPath = filePath + "-wal";
      if (fs.existsSync(walPath)) {
        fs.copyFileSync(walPath, backupPath + "-wal");
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
      .filter(f => f.startsWith(base + "_") && f.endsWith(".bak") && !f.endsWith("-wal"))
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

module.exports = {
  createTimestampedBackup,
  listRecentBackups,
  cleanupOldBackups,
  getLatestBackup,
};
