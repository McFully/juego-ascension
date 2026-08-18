const { contextBridge, ipcRenderer } = require('electron');

// Sanitiza el state a objetos planos JSON-ready antes de cruzar IPC.
// Evita el DataCloneError de Electron ("An object could not be cloned")
// que salta cuando el state contiene valores no clonables (funciones,
// instancias/Proxy, Map/Set no planos, bigint, símbolos o referencias cíclicas).
const cloneablePrimitives = { string: true, number: true, boolean: true, undefined: true };
function sanitizeForIPC(value, seen) {
  if (value === null) return null;
  const t = typeof value;
  if (cloneablePrimitives[t]) return value;
  if (t === 'bigint') return Number(value);
  if (t === 'function' || t === 'symbol') return undefined;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.source;
  if (value instanceof Map) {
    const out = {};
    value.forEach((v, k) => { out[String(k)] = sanitizeForIPC(v, seen); });
    return out;
  }
  if (value instanceof Set) {
    return Array.from(value).map(v => sanitizeForIPC(v, seen));
  }
  if (ArrayBuffer.isView(value)) return Array.from(value);
  if (value instanceof ArrayBuffer) return Array.from(new Uint8Array(value));
  if (seen.has(value)) return undefined; // referencia cíclica
  seen.add(value);
  let out;
  if (Array.isArray(value)) {
    out = value.map(v => sanitizeForIPC(v, seen));
  } else {
    out = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeForIPC(value[key], seen);
    }
  }
  seen.delete(value);
  return out;
}
function toSaveIPC(data) {
  if (data === undefined || data === null) return data;
  return sanitizeForIPC(data, new WeakSet());
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  logError: (message, stack) => ipcRenderer.invoke('log-error', { message, stack, time: Date.now() }),


  listSaves: () => ipcRenderer.invoke('list-saves'),
  loadSaveBySlug: (slug) => ipcRenderer.invoke('load-save-by-slug', slug),
  saveGameNamed: (data) => ipcRenderer.invoke('save-game-named', toSaveIPC(data)),
  saveGameNamedSync: (data) => ipcRenderer.sendSync('save-game-named-sync', toSaveIPC(data)),
  deleteSaveBySlug: (slug) => ipcRenderer.invoke('delete-save-by-slug', slug),
  renameSave: (oldSlug, newName) => ipcRenderer.invoke('rename-save', { oldSlug, newName }),
  exportSaveToFile: (data, defaultName) => ipcRenderer.invoke('export-save-to-file', { data: toSaveIPC(data), defaultName }),
  importSaveFromFile: () => ipcRenderer.invoke('import-save-from-file'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
});
