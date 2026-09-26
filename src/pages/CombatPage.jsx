import React, { useState } from 'react';
import { SafeImg } from '../assets.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { CombatReportModal } from '../components/combat/CombatReportModal.jsx';
import { CombatLogList } from '../components/combat/CombatLogList.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const CombatPage = ({ state, currentPlanet, production, SHIPS, DEFENSES, S, ProgressBar, fmt }) => {
  const { navigateBack } = useNavigation();
  const [selectedReport, setSelectedReport] = useState(null);
  const [combatFilter, setCombatFilter] = useState('all'); // 'all' | 'attack' | 'defense'
  const [visibleLogsCount, setVisibleLogsCount] = useState(10);

  const activeMissions = state.fleetMissions || [];
  const incomingAttacks = activeMissions.filter(m => m.type === 'attack' && m.isAI);
  const playerExpeditions = activeMissions.filter(m => m.type === 'expedition' || (m.type === 'attack' && !m.isAI));

  const filteredLogs = state.combatLog.filter(log => {
    const isPlayerAtk = log.attacker.name === state.playerName;
    if (combatFilter === 'attack') return isPlayerAtk;
    if (combatFilter === 'defense') return !isPlayerAtk;
    return true;
  });

  const theaters = [
    { id: 'all', title: 'Registro Global', icon: '⚔️', assetId: 'battleship', count: `${state.combatLog.length} Batallas`, subtitle: 'Historial completo de enfrentamientos y escaramuzas galácticas' },
    { id: 'attack', title: 'Incursiones Ofensivas', icon: '🚀', assetId: 'weapons', count: `${playerExpeditions.length} En Vuelo`, subtitle: 'Ataques proyectados y expediciones bélicas hacia otros mundos' },
    { id: 'defense', title: 'Defensa Territorial', icon: '🛡️', assetId: 'plasmaTurret', count: `${incomingAttacks.length} Invasiones`, subtitle: 'Vectores hostiles entrantes interceptados por los sensores orbitales' },
  ];

  return (
    <div className="space-y-4">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Combate Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Simulador y Centro de Guerra"
        breadcrumbIcon="⚔️"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono">
              <span className="text-slate-400">Batallas:</span>
              <span className="font-bold text-red-300">{state.combatLog.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Incursiones:</span>
              <span className="font-bold text-cyan-300">{playerExpeditions.length}</span>
            </div>
          </div>
        }
      />
      {/* Selector de Teatros Operacionales */}
      <div className="w-full space-y-3 py-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm md:text-base font-black text-red-400 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>⚔️</span>
            <span>Teatros de Operaciones y Mando de Batalla</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {theaters.length} Teatros Estratégicos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
          {theaters.map(theater => {
            const isSelected = combatFilter === theater.id;
            return (
              <button
                key={theater.id}
                onClick={() => setCombatFilter(theater.id)}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1c1236]/95 via-[#130b26]/90 to-[#05070f] border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.35)] scale-[1.02]'
                    : 'bg-[#090d1f]/90 border-white/10 hover:border-red-500/40 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                }`}
              >
                <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
                  <SafeImg
                    id={theater.assetId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                    isSelected
                      ? 'bg-red-500/30 border-red-400 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : 'bg-black/60 border-white/10 text-slate-400'
                  }`}>
                    {theater.count}
                  </span>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-white uppercase tracking-wide group-hover:text-red-300 transition-colors">
                      {theater.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                      {theater.subtitle}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-red-400 font-bold' : 'text-slate-500'}>
                      {isSelected ? '● Teatro Activo' : 'Inspeccionar'}
                    </span>
                    <span className="text-red-400 font-bold">➔</span>
                  </div>
                </div>
              </button>
            );
          })}

          <ActionCardTile
            type="back"
            title="Volver"
            subtitle="Regresar a la pantalla anterior"
            badgeText="VOLVER"
            onClick={() => {
              if (navigateBack) navigateBack();
            }}
          />
        </div>
      </div>

      {/* Panel de Registros de Batalla */}
      <div className="p-4 rounded-2xl bg-[#090d1f]/90 border border-white/10 backdrop-blur-xl shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <span>📜</span>
            <span>Historial Táctico de Encuentros</span>
          </h4>
          <div className="flex gap-2">
            {['all', 'attack', 'defense'].map(f => (
              <button
                key={f}
                onClick={() => setCombatFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer border ${
                  combatFilter === f ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold' : 'border-white/5 text-slate-400 hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'attack' ? 'Ataques' : 'Defensas'}
              </button>
            ))}
          </div>
        </div>

        <CombatLogList
          filteredLogs={filteredLogs}
          visibleLogsCount={visibleLogsCount}
          setVisibleLogsCount={setVisibleLogsCount}
          onSelectReport={setSelectedReport}
          state={state}
          fmt={fmt}
        />
      </div>

      <CombatReportModal
        selectedReport={selectedReport}
        onClose={() => setSelectedReport(null)}
        fmt={fmt}
        SHIPS={SHIPS}
        DEFENSES={DEFENSES}
      />
    </div>
  );
};

export default CombatPage;
