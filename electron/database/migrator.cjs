const fs = require("fs");
const { getDb } = require("./dbManager.cjs");
const { insertShipsBatch, generateRegistryCode } = require("./shipRepository.cjs");
const { saveFullGameState } = require("./gameRepository.cjs");

// Migrador atómico de partidas legacy .json a base de datos SQLite v4 unificado
// Ahora delega al gameRepository para la persistencia del state completo
// y solo añade la capa de migración de naves con matrícula militar
function migrateJsonToSqlite(saveFilePath, saveSlug = "universe") {
  if (!fs.existsSync(saveFilePath)) {
    return { migrated: false, reason: "El archivo JSON de guardado no existe." };
  }

  let rawData;
  try {
    rawData = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));
  } catch (err) {
    console.error("[Ascensión Migrator] Error al parsear save JSON:", err);
    return { migrated: false, error: err.message };
  }

  console.log(`[Ascensión Migrator] Iniciando migración a SQLite para [${saveSlug}]...`);

  // Crear backup preventivo del JSON original
  try {
    const backupPath = `${saveFilePath}.legacy_v3.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(saveFilePath, backupPath);
      console.log("[Ascensión Migrator] Backup de seguridad creado en:", backupPath);
    }
  } catch (bErr) {
    console.warn("[Ascensión Migrator] Advertencia al crear backup legacy:", bErr);
  }

  // 1. Guardar el state completo vía gameRepository (tablas normalizadas)
  const savedSession = saveFullGameState(saveSlug, rawData);
  const sessionId = savedSession ? savedSession.sessionId : null;

  // 2. Migrar naves con matrícula militar al Registro Naval
  const db = getDb();
  const allShipsToInsert = [];
  let globalSeq = 1;

  if (Array.isArray(rawData.planets)) {
    rawData.planets.forEach((p, pIdx) => {
      if (p.fleet && typeof p.fleet === "object") {
        for (const [chassisId, count] of Object.entries(p.fleet)) {
          const qty = Number(count) || 0;
          const isCapital = ["cruiser", "battleship", "bomber", "destroyer", "deathstar", "planetDestroyer"].includes(chassisId) || chassisId.startsWith("custom_");
          const category = isCapital ? "capital" : (["espionageProbe", "smallCargo", "largeCargo", "colonizer", "recycler"].includes(chassisId) ? "civil" : "swarm");

          for (let i = 0; i < qty; i++) {
            const shipId = `shp_${p.id}_${chassisId}_${globalSeq}`;
            const regCode = generateRegistryCode(p.faction || "HUM", pIdx + 1, chassisId, globalSeq);
            allShipsToInsert.push({
              id: shipId,
              session_id: sessionId,
              registry_code: regCode,
              custom_name: null,
              chassis_id: chassisId,
              class_category: category,
              origin_planet_id: p.id,
              origin_tick: 0,
              owner_id: "player",
              controller_id: "player",
              status: "docked",
              current_planet_id: p.id,
              current_fleet_id: null,
              hull_percent: 1.0,
              veterancy_level: 0,
              kills_count: 0,
              battles_survived: 0,
              tech_generation: 1,
              metadata_json: JSON.stringify({ legacyImported: true })
            });
            globalSeq++;
          }
        }
      }
    });
  }

  if (allShipsToInsert.length > 0) {
    console.log(`[Ascensión Migrator] Insertando ${allShipsToInsert.length} naves con matrícula única en SQLite...`);
    insertShipsBatch(allShipsToInsert, sessionId);
  }

  console.log("[Ascensión Migrator] Migración a SQLite completada con éxito absoluto.");
  return { migrated: true, totalShips: db.prepare("SELECT COUNT(*) as count FROM ships").get().count };
}

module.exports = {
  migrateJsonToSqlite
};
