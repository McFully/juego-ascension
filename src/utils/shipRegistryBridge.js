/**
 * Puente seguro de comunicación entre el frontend de React y el motor SQLite de Electron.
 * Maneja tanto el modo escritorio nativo con SQLite como un fallback en memoria cuando corre en navegador web.
 */

// Fallback en memoria si corre fuera de Electron (ej: tests o dev browser)
const memoryRegistry = new Map();

export function generateRegistryCode(faction = "HUM", planetId = 1, chassisId = "LF", seq = 1) {
  const fac = String(faction || "HUM").substring(0, 3).toUpperCase();
  const digits = String(planetId).replace(/\D/g, "");
  const pln = `P${(digits ? digits : "1").padStart(2, "0")}`;
  const chs = String(chassisId || "LF").substring(0, 3).toUpperCase();
  const num = String(seq).padStart(6, "0");
  return `${fac}-${pln}-${chs}-${num}`;
}

export const generateClientRegistryCode = generateRegistryCode;

export const registerShipsInDatabase = async (ships = []) => {
  if (!Array.isArray(ships) || ships.length === 0) return { inserted: 0 };

  if (window.electronAPI && typeof window.electronAPI.dbInsertShips === "function") {
    try {
      return await window.electronAPI.dbInsertShips(ships);
    } catch (err) {
      console.error("[Ascensión Bridge] Error al insertar naves en SQLite:", err);
      return { inserted: 0, error: err.message };
    }
  }

  // Modo navegador / tests
  for (const ship of ships) {
    memoryRegistry.set(ship.id, ship);
  }
  return { inserted: ships.length };
};

export const fetchShipsByPlanet = async (planetId, { page = 1, pageSize = 50, chassisId = null, status = "docked", searchQuery = null } = {}) => {
  if (window.electronAPI && typeof window.electronAPI.dbGetShipsByPlanet === "function") {
    try {
      return await window.electronAPI.dbGetShipsByPlanet({ planetId, page, pageSize, chassisId, status, searchQuery });
    } catch (err) {
      console.error("[Ascensión Bridge] Error al consultar naves en SQLite:", err);
      return { total: 0, ships: [], error: err.message };
    }
  }

  // Modo memoria (fallback)
  const allShips = Array.from(memoryRegistry.values()).filter(s => {
    if (s.current_planet_id !== planetId && s.currentPlanetId !== planetId) return false;
    if (status && s.status !== status) return false;
    if (chassisId && s.chassis_id !== chassisId && s.chassisId !== chassisId) return false;
    return true;
  });

  const total = allShips.length;
  const offset = (page - 1) * pageSize;
  const ships = allShips.slice(offset, offset + pageSize);
  return { total, page, pageSize, ships };
};

export const fetchShipLogs = async (shipId) => {
  if (window.electronAPI && typeof window.electronAPI.dbGetShipLogs === "function") {
    try {
      return await window.electronAPI.dbGetShipLogs(shipId);
    } catch (err) {
      return [];
    }
  }
  return [];
};
