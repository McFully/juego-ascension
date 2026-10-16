import React, { useState } from 'react';
import { SECTOR_DOCTRINES, VICEROY_CANDIDATES } from '../../data/sectorsData.js';
import { SubsystemTopBanner } from '../navigation/SubsystemTopBanner.jsx';

export const SectorManagementView = ({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt
}) => {
  const [newSectorName, setNewSectorName] = useState('');
  const [candidateModalSectorId, setCandidateModalSectorId] = useState(null);
  const sectors = state.sectors || [];
  const planets = state.planets || [];
  const influence = state.influence || 0;

  const handleCreateSector = () => {
    if (!newSectorName.trim()) return;
    dispatch({ type: 'CREATE_SECTOR', name: newSectorName.trim(), planetIds: [] });
    setNewSectorName('');
    if (window.playSfx) window.playSfx('click');
  };

  const handleTogglePlanet = (sectorId, planetId) => {
    dispatch({ type: 'ASSIGN_PLANET_TO_SECTOR', sectorId, planetId });
    if (window.playSfx) window.playSfx('click');
  };

  const handleSetDoctrine = (sectorId, doctrine) => {
    dispatch({ type: 'SET_SECTOR_DOCTRINE', sectorId, doctrine });
    if (window.playSfx) window.playSfx('click');
  };

  const handleAppointViceroy = (sectorId, candidateId) => {
    dispatch({ type: 'APPOINT_VICEROY', sectorId, candidateId });
    setCandidateModalSectorId(null);
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  const handleDeleteSector = (sectorId) => {
    dispatch({ type: 'DELETE_SECTOR', sectorId });
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Sectores Coloniales y Virreinatos"
        breadcrumbIcon="🗺️"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Mando Imperial"
        backButtonIcon="👑"
      />
      {/* Cabecera de Sectores */}
      <div className="p-5 rounded-2xl bg-[#090d1e]/90 border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-2xl shadow-inner">
            🗺️
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              Sectores Territoriales y Virreinatos
            </h2>
            <p className="text-xs text-slate-400">
              Descentralización y gobernanza a gran escala: agrupa tus planetas bajo virreyes que ejecutan doctrinas autónomas.
            </p>
          </div>
        </div>

        {/* Creador de Sector */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del nuevo sector..."
            value={newSectorName}
            onChange={(e) => setNewSectorName(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={handleCreateSector}
            disabled={!newSectorName.trim()}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-white/5 disabled:text-slate-600 text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Crear Sector</span>
          </button>
        </div>
      </div>

      {/* Lista de Sectores */}
      {sectors.length === 0 ? (
        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
          <div className="text-3xl">🌌</div>
          <h4 className="text-sm font-bold text-slate-300">No hay sectores constituidos</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Crea tu primer sector territorial para asignar planetas, nombrar un Virrey y delegar la gestión del desarrollo según la doctrina elegida.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sectors.map(sec => {
            const activeDoctrine = SECTOR_DOCTRINES.find(d => d.id === sec.doctrine) || SECTOR_DOCTRINES[0];

            return (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-[#080b18]/90 border border-teal-500/30 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  {/* Encabezado del Sector */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{sec.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {sec.planetIds.length} Mundos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Doctrina Activa: <strong className="text-teal-300">{activeDoctrine.name}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteSector(sec.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 rounded bg-white/5 hover:bg-rose-950/40 border border-white/5 transition-all"
                      title="Disolver Sector"
                    >
                      ✕ Disolver
                    </button>
                  </div>

                  {/* Estado del Virrey */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                    {sec.viceroy ? (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{sec.viceroy.icon}</span>
                        <div>
                          <div className="font-bold text-white text-xs">{sec.viceroy.name}</div>
                          <div className="text-[10px] text-teal-400">{sec.viceroy.title}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Sin Virrey asignado al sector.
                      </div>
                    )}

                    <button
                      onClick={() => setCandidateModalSectorId(sec.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
                    >
                      {sec.viceroy ? 'Cambiar Virrey' : 'Nombrar Virrey'}
                    </button>
                  </div>

                  {/* Selector de Doctrinas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Doctrina de Desarrollo del Sector:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTOR_DOCTRINES.map(doc => {
                        const isSelected = sec.doctrine === doc.id;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleSetDoctrine(sec.id, doc.id)}
                            className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'bg-teal-950/60 border-teal-400 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            <span className="text-lg">{doc.icon}</span>
                            <div className="truncate">
                              <div className="font-bold truncate text-[11px]">{doc.name}</div>
                              <div className="text-[9px] text-slate-500 truncate">{doc.bonusText}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Asignación de Planetas al Sector */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      Planetas del Imperio Asignados al Sector:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {planets.map(p => {
                        const isAssigned = sec.planetIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleTogglePlanet(sec.id, p.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                              isAssigned
                                 ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                                 : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {isAssigned ? '✓ ' : '+ '} {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Virreyes */}
      {candidateModalSectorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#090e1e] border border-purple-500/40 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <h3 className="text-lg font-bold text-white uppercase">Candidatos a Virrey de Sector</h3>
              </div>
              <button
                onClick={() => setCandidateModalSectorId(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {VICEROY_CANDIDATES.map(cand => {
                const canAffordCandidate = influence >= cand.influenceCost;

                return (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                        {cand.icon}
                      </span>
                      <div className="text-xs">
                        <div className="font-bold text-white text-sm">{cand.name}</div>
                        <div className="text-purple-300 text-[11px]">{cand.title}</div>
                        <p className="text-slate-400 text-[10px] mt-0.5">{cand.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAppointViceroy(candidateModalSectorId, cand.id)}
                      disabled={!canAffordCandidate}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        canAffordCandidate
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {canAffordCandidate ? `Nombrar (${cand.influenceCost} Inf.)` : `Faltan Inf. (${cand.influenceCost})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
