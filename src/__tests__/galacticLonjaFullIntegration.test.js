import { describe, it, expect } from 'vitest';
import {
  initGalacticLonjaState,
  calculateCapitalContribution,
  recordTreasuryLedger,
  assessLonjaHealth,
  castDaoVote,
  placeShareOrder,
  LONJA_HEALTH_STATES
} from '../utils/galacticLonjaAutonomousCore.js';
import {
  processMarketMakerTick,
  depositToClientVault,
  scheduleFreightTransport,
  CUSTODY_STATES
} from '../utils/galacticLonjaMarketMaker.js';

describe('Suite de Integración Completa de la Lonja Galáctica (Fases 02 a 19)', () => {
  it('Fase 02-03: Fundación con 10% del fundador protegido y dilución de megaproyectos', () => {
    const lonja = initGalacticLonjaState('commander_1', 'Lonja Galáctica Prime');
    expect(lonja.isAutonomousEntity).toBe(true);
    expect(lonja.capitalization.founderProtectedPercent).toBe(10);
    expect(lonja.capitalization.shareholders['commander_1'].protectedSharesPercent).toBe(10);

    const capAfterMegaproject = calculateCapitalContribution({
      currentCapitalization: lonja.capitalization,
      contributorId: 'investor_group',
      contributionValue: 10000000,
      valuationReference: 25000000
    });

    expect(capAfterMegaproject.shareholders['commander_1'].protectedSharesPercent).toBe(10);
    expect(capAfterMegaproject.totalOrdinaryShares).toBeGreaterThan(1000);
  });

  it('Fase 04: Directorio Comercial DAO ponderado por acciones y mayoría >50%', () => {
    let lonja = initGalacticLonjaState('commander_1');
    const propId = lonja.dao.activeProposals[0].id;

    // Votar a favor con el 10% de acciones del jugador (100 acciones sobre 1000)
    lonja = castDaoVote({
      lonjaState: lonja,
      proposalId: propId,
      voterId: 'commander_1',
      voteChoice: 'FOR'
    });

    // La propuesta debe seguir abierta o haber sumado votos
    const prop = lonja.dao.activeProposals.find(p => p.id === propId) || lonja.dao.passedProposals.find(p => p.id === propId);
    expect(prop.votesFor).toBeGreaterThanOrEqual(550);
  });

  it('Fase 07: Market Maker genera cotizaciones bid/ask con respaldo 100% real', () => {
    const lonjaPlanet = {
      id: 'lonja_p1',
      name: 'Lonja Prime',
      isExchangePlanet: true,
      resources: { metal: 100000, crystal: 50000, deuterium: 25000 },
      lonjaAutonomousState: initGalacticLonjaState('commander_1')
    };

    const initialSpot = {
      orders: [],
      lastPrices: { metal: 1.0, crystal: 1.65, deuterium: 3.30 }
    };

    const res = processMarketMakerTick({
      lonjaPlanet,
      spotState: initialSpot,
      tick: 100
    });

    expect(res.spotState.orders.length).toBeGreaterThan(0);
    const askMetal = res.spotState.orders.find(o => o.instrument === 'metal' && o.side === 'sell');
    expect(askMetal).toBeDefined();
    expect(askMetal.amount).toBeLessThanOrEqual(100000); // 100% respaldado en inventario
    expect(res.lonjaPlanet.resources.metal).toBeLessThan(100000); // Recurso reservado
  });

  it('Fase 08: Custodia y Bóvedas de almacenamiento con límite físico y saturación', () => {
    let lonja = initGalacticLonjaState('commander_1');

    const depositOk = depositToClientVault({
      lonjaState: lonja,
      clientId: 'commander_1',
      resource: 'metal',
      amount: 500000
    });
    expect(depositOk.success).toBe(true);
    expect(depositOk.lonjaState.storageCustody.reservedSpace.metal).toBe(500000);

    // Intentar depositar más de la capacidad máxima de 5M debe fallar por saturación
    const depositExcess = depositToClientVault({
      lonjaState: depositOk.lonjaState,
      clientId: 'commander_1',
      resource: 'metal',
      amount: 10000000
    });
    expect(depositExcess.success).toBe(false);
    expect(depositExcess.reason).toContain('Saturación de Bóvedas');
  });

  it('Fase 09: Logística y flete contratado con coste por distancia y tránsito real', () => {
    const lonja = initGalacticLonjaState('commander_1');
    const dest = { id: 'dest_1', galaxy: 1, system: 2, position: 3, name: 'Colonia Minera' };

    const freight = scheduleFreightTransport({
      lonjaState: lonja,
      clientId: 'commander_1',
      destinationPlanet: dest,
      resource: 'metal',
      amount: 25000,
      distanceParsecs: 15
    });

    expect(freight.success).toBe(true);
    expect(freight.freightCost).toBeGreaterThan(0);
    expect(freight.transport.custodyState).toBe(CUSTODY_STATES.IN_TRANSIT);
    expect(freight.transport.arrivalTime).toBeGreaterThan(Date.now());
  });

  it('Fase 14: Mercado Secundario de Acciones Ordinarias (el 10% del fundador no se puede vender)', () => {
    let lonja = initGalacticLonjaState('founder_player');

    // Intentar vender más de las acciones ordinarias (tratando de vender el 10% protegido)
    const invalidSell = placeShareOrder({
      lonjaState: lonja,
      traderId: 'founder_player',
      side: 'SELL',
      shares: 150, // Solo tiene 100 ordinarias
      price: 25000
    });
    expect(invalidSell.success).toBe(false);
    expect(invalidSell.reason).toContain('El 10% fundador está protegido');

    // Venta válida de 50 acciones ordinarias
    const validSell = placeShareOrder({
      lonjaState: lonja,
      traderId: 'founder_player',
      side: 'SELL',
      shares: 50,
      price: 26000
    });
    expect(validSell.success).toBe(true);
    expect(validSell.lonjaState.capitalization.shareOrderBook.asks.length).toBe(3); // 2 iniciales + 1 nueva
  });
});
