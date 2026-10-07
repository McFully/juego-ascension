const fs = require('fs');

let content = fs.readFileSync('src/components/government/ExchangePlanetaryCommandHub.jsx', 'utf8');

if (!content.includes('import { ExchangeDaoSubview }')) {
  content = content.replace(
    "import { ExchangeAmmTerminalTab } from '../market/ExchangeAmmTerminalTab.jsx';",
    "import { ExchangeAmmTerminalTab } from '../market/ExchangeAmmTerminalTab.jsx';\nimport { ExchangeDaoSubview } from './hub/ExchangeDaoSubview.jsx';"
  );
}

// Reemplazar el bloque hardcodeado de activeSubview === 'dao' por el componente ExchangeDaoSubview enriquecido
const targetDaoBlock = `      {/* MODO 4: SUB-VISTA FONDO SOBERANO DAO */}
      {activeSubview === 'dao' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#09121a] border border-emerald-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>💎</span> Bóveda de Dividendos
              </h3>
              <p className="text-xs text-slate-400">
                Participaciones acumuladas del fondo común de la Zona Franca.
              </p>
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tus Acciones:</span>
                  <span className="text-emerald-400 font-bold">{playerShares} ({playerPercent}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pool DAO:</span>
                  <span className="text-slate-200">{daoShares} Acciones</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-slate-400">Dividendos Pendientes:</span>
                  <span className="text-amber-300 font-bold text-sm">₢ {fmt(accumulatedDividends)}</span>
                </div>
              </div>
              <button
                type="button"
                disabled={accumulatedDividends <= 0}
                onClick={handleClaimDividends}
                className={\`w-full py-2.5 rounded-xl font-bold uppercase text-xs font-mono transition-all cursor-pointer \${
                  accumulatedDividends > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                }\`}
              >
                Cobrar Dividendos ₢
              </button>
            </div>

            <div className="md:col-span-2 p-6 rounded-2xl bg-[#09121a] border border-emerald-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🏛️</span> Estatuto y Gobernanza de Accionistas
              </h3>
              <p className="text-xs text-slate-400">
                La posesión de acciones confiere derecho a voto sobre modificaciones de spread bancario y desgravaciones portuarias en la red neutral.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Tasa de Descuento en AMM</span>
                  <span className="text-emerald-400 font-bold text-sm">-1.5% Spread</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Prioridad de Atraque</span>
                  <span className="text-cyan-400 font-bold text-sm">Nivel Máximo (A-1)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}`;

const replacementDaoBlock = `      {/* MODO 4: SUB-VISTA FONDO SOBERANO DAO Y MERCADO SECUNDARIO */}
      {activeSubview === 'dao' && (
        <ExchangeDaoSubview
          playerShares={playerShares}
          playerPercent={playerPercent}
          daoShares={daoShares}
          accumulatedDividends={accumulatedDividends}
          handleClaimDividends={handleClaimDividends}
          fmt={fmt}
          lonjaState={planet?.lonjaAutonomousState}
          onVoteProposal={(proposalId, voteChoice) => {
            dispatch({
              type: 'VOTE_DAO_PROPOSAL',
              planetId: planet.id,
              proposalId,
              voteChoice
            });
          }}
          onTradeShares={({ side, shares, price }) => {
            dispatch({
              type: 'TRADE_LONJA_SHARES',
              planetId: planet.id,
              side,
              shares,
              price
            });
          }}
        />
      )}`;

const normalized = content.replace(/\r\n/g, '\n');
if (normalized.includes(targetDaoBlock)) {
  const newNorm = normalized.replace(targetDaoBlock, replacementDaoBlock);
  fs.writeFileSync('src/components/government/ExchangePlanetaryCommandHub.jsx', newNorm.replace(/\n/g, '\r\n'), 'utf8');
  console.log('ExchangePlanetaryCommandHub.jsx conectado a ExchangeDaoSubview con éxito.');
} else {
  console.log('targetDaoBlock no encontrado en ExchangePlanetaryCommandHub.jsx');
}
