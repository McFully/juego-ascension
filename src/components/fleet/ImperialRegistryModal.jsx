import React, { useState, useEffect } from "react";
import { fetchShipsByPlanet, fetchShipLogs } from "../../utils/shipRegistryBridge.js";
import { SHIPS } from "../../data/gameData.js";

export const ImperialRegistryModal = ({ isOpen, onClose, currentPlanet }) => {
  const [ships, setShips] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedChassis, setSelectedChassis] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [activeShipDetail, setActiveShipDetail] = useState(null);
  const [shipLogs, setShipLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentPlanet) {
      loadRegistry();
    }
  }, [isOpen, currentPlanet?.id, page, selectedChassis, searchInput]);

  const loadRegistry = async () => {
    setLoading(true);
    const chassis = selectedChassis === "all" ? null : selectedChassis;
    const res = await fetchShipsByPlanet(currentPlanet.id, { 
      page, 
      pageSize: 25, 
      chassisId: chassis, 
      searchQuery: searchInput 
    });
    setShips(res.ships || []);
    setTotalCount(res.total || 0);
    setLoading(false);
  };

  const handleInspectShip = async (ship) => {
    setActiveShipDetail(ship);
    const logs = await fetchShipLogs(ship.id);
    setShipLogs(logs || []);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0b111e] border border-cyan-500/40 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera Imperial */}
        <div className="px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-transparent">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎖️</span>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-cyan-200">
                REGISTRO NAVAL IMPERIAL (MATRÍCULAS Y CASCOS)
              </h2>
              <p className="text-xs text-gray-400">
                Planeta: <span className="text-cyan-400 font-semibold">{currentPlanet.name}</span> | Cascos Registrados: <span className="text-amber-400 font-bold">{totalCount}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg bg-gray-800/60 hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition"
          >
            ✕
          </button>
        </div>

        {/* Filtros de Tipo de Casco y Buscador en Tiempo Real */}
        <div className="px-6 py-3 border-b border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3 bg-black/30">
          <div className="flex items-center space-x-2 overflow-x-auto py-1 w-full md:w-auto">
            <button
              onClick={() => { setSelectedChassis("all"); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${selectedChassis === "all" ? "bg-cyan-500 text-black shadow-cyan-500/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              Todos los Cascos
            </button>
            {Object.entries(SHIPS).map(([id, def]) => (
              <button
                key={id}
                onClick={() => { setSelectedChassis(id); setPage(1); }}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${selectedChassis === id ? "bg-cyan-500 text-black shadow-cyan-500/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
              >
                {def.icon} {def.name}
              </button>
            ))}
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              placeholder="Buscar matrícula o nombre..."
              className="w-full px-3 py-1.5 bg-gray-900 border border-cyan-500/40 rounded text-xs text-cyan-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Contenido Principal: Lista Paginada + Detalle */}
        <div className="flex-1 flex overflow-hidden">
          {/* Listado de Cascos */}
          <div className="w-3/5 border-r border-gray-800 p-4 overflow-y-auto space-y-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-cyan-400 text-sm animate-pulse">
                Accediendo a los bancos de datos de SQLite...
              </div>
            ) : ships.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                <span className="text-3xl mb-2">🚀</span>
                No hay naves con matrícula botadas en este astillero todavía.
              </div>
            ) : (
              ships.map((s) => {
                const def = SHIPS[s.chassis_id || s.chassisId];
                const isSelected = activeShipDetail?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleInspectShip(s)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${isSelected ? "bg-cyan-950/60 border-cyan-400 shadow-md" : "bg-gray-900/60 border-gray-800 hover:border-cyan-500/40"}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{def?.icon || "🚀"}</span>
                      <div>
                        <div className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                          {s.registry_code || s.registryCode}
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {s.custom_name || s.customName || def?.name || s.chassis_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-amber-400 font-semibold">
                        Mk.{s.tech_generation || s.techGeneration || 1} • Rango {s.veterancy_level || 0}
                      </div>
                      <div className="text-gray-400">
                        Bajas: <span className="text-emerald-400 font-bold">{s.kills_count || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ficha Técnica y Bitácora de Casco */}
          <div className="w-2/5 p-5 bg-black/40 overflow-y-auto">
            {activeShipDetail ? (
              <div className="space-y-4">
                <div className="border-b border-cyan-500/30 pb-3">
                  <div className="font-mono text-xs text-cyan-400">REGISTRO MILITAR INDIVIDUAL</div>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="text-lg font-bold text-white">
                      {activeShipDetail.custom_name || SHIPS[activeShipDetail.chassis_id]?.name || "Nave Imperial"}
                    </h3>
                    <button
                      onClick={async () => {
                        const currentVal = activeShipDetail.custom_name || SHIPS[activeShipDetail.chassis_id]?.name || "";
                        const newName = window.prompt("Introduce el nuevo nombre bautismal para este casco:", currentVal);
                        if (newName !== null && newName.trim() !== "") {
                          if (window.electronAPI && typeof window.electronAPI.dbRenameShip === "function") {
                            await window.electronAPI.dbRenameShip({ shipId: activeShipDetail.id, customName: newName.trim() });
                          }
                          setActiveShipDetail({ ...activeShipDetail, custom_name: newName.trim() });
                          loadRegistry();
                        }
                      }}
                      className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-500/50 rounded text-xs font-semibold text-cyan-300 transition"
                    >
                      ✏️ Bautizar
                    </button>
                  </div>
                  <div className="font-mono text-sm text-amber-300 font-semibold mt-1">
                    Matrícula: {activeShipDetail.registry_code || activeShipDetail.registryCode}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-900/80 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400">Estado Operativo:</span>
                    <div className="font-semibold text-emerald-400 uppercase mt-0.5">{activeShipDetail.status}</div>
                  </div>
                  <div className="bg-gray-900/80 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400">Integridad de Casco:</span>
                    <div className="font-semibold text-cyan-300 mt-0.5">{Math.round((activeShipDetail.hull_percent || 1) * 100)}%</div>
                  </div>
                  <div className="bg-gray-900/80 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400">Batallas Superadas:</span>
                    <div className="font-semibold text-white mt-0.5">{activeShipDetail.battles_survived || 0}</div>
                  </div>
                  <div className="bg-gray-900/80 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400">Victorias Confirmadas:</span>
                    <div className="font-semibold text-amber-400 mt-0.5">{activeShipDetail.kills_count || 0}</div>
                  </div>
                </div>

                {/* Bitácora de Trazabilidad */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Bitácora de Casco</span>
                    <span className="text-[10px] text-cyan-400">Historial Permanente</span>
                  </div>
                  {shipLogs.length === 0 ? (
                    <div className="text-xs text-gray-500 italic p-3 bg-gray-900/40 rounded border border-gray-800">
                      Nave recién botada del astillero. No registra incidencias ni combates en su historial.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {shipLogs.map((log, idx) => (
                        <div key={idx} className="p-2 bg-gray-900/70 rounded border border-gray-800 text-xs">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Tick {log.game_tick}</span>
                            <span className="text-cyan-300">{log.location_desc}</span>
                          </div>
                          <div className="font-semibold text-white mt-0.5">{log.event_type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center">
                <span className="text-3xl mb-2">📋</span>
                Selecciona cualquier nave de la lista para inspeccionar su número de bastidor, biografía y bitácora de combate.
              </div>
            )}
          </div>
        </div>

        {/* Paginación */}
        <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between bg-black/40 text-xs text-gray-400">
          <div>
            Página {page} de {Math.max(1, Math.ceil(totalCount / 25))}
          </div>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-white font-semibold transition"
            >
              Anterior
            </button>
            <button
              disabled={page >= Math.ceil(totalCount / 25)}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-white font-semibold transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
