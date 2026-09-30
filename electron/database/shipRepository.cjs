const { getDb } = require("./dbManager.cjs");

// Generador determinista de matrícula galáctica militar/civil
function generateRegistryCode(faction = "HUM", planetIndex = 1, chassisId = "LF", seq = 1) {
  const fac = String(faction || "HUM").substring(0, 3).toUpperCase();
  const digits = String(planetIndex).replace(/\D/g, "");
  const pln = `P${(digits ? digits : "1").padStart(2, "0")}`;
  const chs = String(chassisId || "LF").substring(0, 3).toUpperCase();
  const num = String(seq).padStart(6, "0");
  return `${fac}-${pln}-${chs}-${num}`;
}

// Inserción por lotes atómica y ultrarrápida en SQLite para cientos o miles de naves
function insertShipsBatch(ships = [], sessionId = null) {
  if (!Array.isArray(ships) || ships.length === 0) return { inserted: 0 };
  const db = getDb();

  // Sin esto, el registro naval es una bolsa global: las naves de la partida
  // nueva se mezclaban con las de la anterior y `delete` de una sesión no las
  // tocaba. El id de sesión lo aporta quien inserta.
  const sid = sessionId || ships.find(s => s && s.sessionId)?.sessionId || null;

  const checkCodeStmt = db.prepare("SELECT id FROM ships WHERE registry_code = ? LIMIT 1");
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM ships");

  const insertStmt = db.prepare(`
    INSERT INTO ships (
      id, session_id, registry_code, custom_name, chassis_id, class_category,
      origin_planet_id, origin_tick, owner_id, controller_id,
      status, current_planet_id, current_fleet_id,
      hull_percent, veterancy_level, kills_count, battles_survived,
      tech_generation, metadata_json
    ) VALUES (
      @id, @session_id, @registry_code, @custom_name, @chassis_id, @class_category,
      @origin_planet_id, @origin_tick, @owner_id, @controller_id,
      @status, @current_planet_id, @current_fleet_id,
      @hull_percent, @veterancy_level, @kills_count, @battles_survived,
      @tech_generation, @metadata_json
    )
    ON CONFLICT(id) DO UPDATE SET
      session_id = COALESCE(excluded.session_id, ships.session_id),
      registry_code = excluded.registry_code,
      custom_name = excluded.custom_name,
      chassis_id = excluded.chassis_id,
      class_category = excluded.class_category,
      current_planet_id = excluded.current_planet_id,
      current_fleet_id = excluded.current_fleet_id,
      status = excluded.status,
      hull_percent = excluded.hull_percent,
      veterancy_level = excluded.veterancy_level,
      kills_count = excluded.kills_count,
      battles_survived = excluded.battles_survived,
      tech_generation = excluded.tech_generation,
      metadata_json = excluded.metadata_json
  `);

  const insertMany = db.transaction((rows) => {
    let nextSeq = null;
    for (const ship of rows) {
      let regCode = ship.registryCode || ship.registry_code;
      const existing = regCode ? checkCodeStmt.get(regCode) : null;
      if (!regCode || (existing && existing.id !== ship.id)) {
        if (nextSeq === null) {
          nextSeq = (countStmt.get()?.count || 0) + 1;
        }
        while (checkCodeStmt.get(generateRegistryCode(ship.faction || "HUM", ship.originPlanetId || ship.origin_planet_id || 1, ship.chassisId || ship.chassis_id || "LF", nextSeq))) {
          nextSeq++;
        }
        regCode = generateRegistryCode(ship.faction || "HUM", ship.originPlanetId || ship.origin_planet_id || 1, ship.chassisId || ship.chassis_id || "LF", nextSeq);
        nextSeq++;
      }

      insertStmt.run({
        id: ship.id,
        session_id: ship.sessionId || ship.session_id || sid,
        registry_code: regCode,
        custom_name: ship.customName || ship.custom_name || null,
        chassis_id: ship.chassisId || ship.chassis_id,
        class_category: ship.classCategory || ship.class_category || "swarm",
        origin_planet_id: ship.originPlanetId || ship.origin_planet_id,
        origin_tick: ship.originTick || ship.origin_tick || 0,
        owner_id: ship.ownerId || ship.owner_id || "player",
        controller_id: ship.controllerId || ship.controller_id || "player",
        status: ship.status || "docked",
        current_planet_id: ship.currentPlanetId || ship.current_planet_id || null,
        current_fleet_id: ship.currentFleetId || ship.current_fleet_id || null,
        hull_percent: ship.hullPercent !== undefined ? ship.hullPercent : 1.0,
        veterancy_level: ship.veterancyLevel || 0,
        kills_count: ship.killsCount || 0,
        battles_survived: ship.battlesSurvived || 0,
        tech_generation: ship.techGeneration || 1,
        metadata_json: ship.metadataJson || (ship.metadata ? JSON.stringify(ship.metadata) : null),
      });
    }
  });

  insertMany(ships);
  return { inserted: ships.length };
}

// Consultas paginadas para visualización instantánea a 60 FPS en la interfaz
function getShipsByPlanet(planetId, { page = 1, pageSize = 50, chassisId = null, status = "docked", searchQuery = null } = {}) {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  let countSql = `SELECT COUNT(*) as total FROM ships WHERE current_planet_id = ? AND status = ?`;
  let selectSql = `
    SELECT * FROM ships 
    WHERE current_planet_id = ? AND status = ?
  `;
  const params = [planetId, status];

  if (chassisId) {
    countSql += ` AND chassis_id = ?`;
    selectSql += ` AND chassis_id = ?`;
    params.push(chassisId);
  }

  if (searchQuery && String(searchQuery).trim() !== "") {
    const q = `%${String(searchQuery).trim()}%`;
    countSql += ` AND (registry_code LIKE ? OR custom_name LIKE ?)`;
    selectSql += ` AND (registry_code LIKE ? OR custom_name LIKE ?)`;
    params.push(q, q);
  }

  selectSql += ` ORDER BY veterancy_level DESC, origin_tick ASC LIMIT ? OFFSET ?`;

  const total = db.prepare(countSql).get(...params).total;
  const ships = db.prepare(selectSql).all(...params, pageSize, offset);

  return { total, page, pageSize, ships };
}

// Desguazar / Reciclar naves en el planeta
function scrapShipsFromPlanet(planetId, chassisId, quantity, gameTick = 0) {
  const db = getDb();
  const runScrap = db.transaction(() => {
    const available = db.prepare(`
      SELECT id FROM ships 
      WHERE current_planet_id = ? AND chassis_id = ? AND status = 'docked'
      ORDER BY veterancy_level ASC, origin_tick ASC
      LIMIT ?
    `).all(planetId, chassisId, quantity);

    const scrapStmt = db.prepare(`
      UPDATE ships 
      SET status = 'scrapped', current_planet_id = NULL 
      WHERE id = ?
    `);

    for (const ship of available) {
      scrapStmt.run(ship.id);
      logShipEvent(ship.id, "SCRAPPED", gameTick, `Astillero de ${planetId}`, { details: "Desguazado para recuperación de materiales" });
    }
  });

  runScrap();
  return { success: true };
}

// Obtener resumen agregado de naves por planeta (para compatibilidad con reducers clásicos)
function getPlanetFleetSummary(planetId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT chassis_id, COUNT(*) as count 
    FROM ships 
    WHERE current_planet_id = ? AND status = 'docked'
    GROUP BY chassis_id
  `).all(planetId);

  const summary = {};
  for (const row of rows) {
    summary[row.chassis_id] = row.count;
  }
  return summary;
}

// Registro de eventos en la bitácora de casco
function logShipEvent(shipId, eventType, gameTick, locationDesc, details = {}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO ship_logs (ship_id, event_type, game_tick, location_desc, details_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(shipId, eventType, gameTick, locationDesc, JSON.stringify(details));
}

// Consultar bitácora de una nave por su ID
function getShipLogs(shipId, limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM ship_logs
    WHERE ship_id = ?
    ORDER BY game_tick DESC, id DESC
    LIMIT ?
  `).all(shipId, limit);
}

// Renombrar / Bautizar una nave específica
function renameShip(shipId, customName) {
  const db = getDb();
  const stmt = db.prepare(`UPDATE ships SET custom_name = ? WHERE id = ?`);
  const res = stmt.run(customName ? String(customName).trim() : null, shipId);
  return { success: res.changes > 0 };
}

// Asignar naves a una misión en vuelo
function assignShipsToMission(planetId, fleetCounts, missionId, gameTick = 0, destinationDesc = "Espacio Profundo") {
  const db = getDb();
  const assignedShipIds = [];

  const runAssign = db.transaction(() => {
    for (const [chassisId, qty] of Object.entries(fleetCounts)) {
      if (qty <= 0) continue;
      // Seleccionar las naves atracadas de ese chasis
      const available = db.prepare(`
        SELECT id, registry_code FROM ships 
        WHERE current_planet_id = ? AND chassis_id = ? AND status = 'docked'
        ORDER BY veterancy_level DESC, origin_tick ASC
        LIMIT ?
      `).all(planetId, chassisId, qty);

      const updateStmt = db.prepare(`
        UPDATE ships 
        SET status = 'in_flight', current_fleet_id = ?
        WHERE id = ?
      `);

      for (const ship of available) {
        updateStmt.run(missionId, ship.id);
        assignedShipIds.push(ship.id);
        logShipEvent(ship.id, "MISSION_DEPARTURE", gameTick, `Salida de ${planetId} hacia ${destinationDesc}`, { missionId });
      }
    }
  });

  runAssign();
  return { assignedShipIds, count: assignedShipIds.length };
}

// Retornar naves de una misión de vuelta a su planeta
function returnShipsToPlanet(missionId, destinationPlanetId, gameTick = 0, originDesc = "Regreso de misión") {
  const db = getDb();
  const runReturn = db.transaction(() => {
    const shipsInFlight = db.prepare(`
      SELECT id FROM ships 
      WHERE current_fleet_id = ? AND status = 'in_flight'
    `).all(missionId);

    const updateStmt = db.prepare(`
      UPDATE ships 
      SET status = 'docked', current_planet_id = ?, current_fleet_id = NULL 
      WHERE id = ?
    `);

    for (const ship of shipsInFlight) {
      updateStmt.run(destinationPlanetId, ship.id);
      logShipEvent(ship.id, "MISSION_RETURN", gameTick, `Atracada en ${destinationPlanetId}`, { originDesc });
    }
  });

  runReturn();
  return { success: true };
}

// Resolver consecuencias de combate sobre las naves con matrícula
function resolveCombatOnShips(missionId, lossesByChassis = {}, battleDetails = {}) {
  const db = getDb();
  const { gameTick = 0, location = "Sector de Batalla", winner = "draw" } = battleDetails;

  const runCombat = db.transaction(() => {
    const shipsInMission = db.prepare(`
      SELECT id, chassis_id, registry_code, veterancy_level, kills_count, battles_survived 
      FROM ships 
      WHERE current_fleet_id = ? AND status = 'in_flight'
    `).all(missionId);

    // Agrupar por chasis
    const grouped = {};
    for (const s of shipsInMission) {
      if (!grouped[s.chassis_id]) grouped[s.chassis_id] = [];
      grouped[s.chassis_id].push(s);
    }

    const destroyStmt = db.prepare(`
      UPDATE ships 
      SET status = 'destroyed', hull_percent = 0.0, current_fleet_id = NULL 
      WHERE id = ?
    `);

    const survivorStmt = db.prepare(`
      UPDATE ships 
      SET battles_survived = battles_survived + 1,
          kills_count = kills_count + @kills,
          veterancy_level = CASE WHEN veterancy_level < 5 THEN veterancy_level + 1 ELSE veterancy_level END
      WHERE id = @id
    `);

    for (const [chassisId, ships] of Object.entries(grouped)) {
      const lostQty = Math.min(ships.length, lossesByChassis[chassisId] || 0);
      // Las naves destruidas
      for (let i = 0; i < lostQty; i++) {
        destroyStmt.run(ships[i].id);
        logShipEvent(ships[i].id, "DESTROYED_IN_BATTLE", gameTick, location, { winner, details: "Casco desintegrado en combate espacial" });
      }
      // Las naves supervivientes
      for (let i = lostQty; i < ships.length; i++) {
        survivorStmt.run({
          id: ships[i].id,
          kills: winner === "attacker" ? 1 : 0
        });
        logShipEvent(ships[i].id, "BATTLE_SURVIVED", gameTick, location, { winner, battleOutcome: "Victoria o retirada con éxito" });
      }
    }
  });

  runCombat();
  return { success: true };
}

module.exports = {
  generateRegistryCode,
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
};
