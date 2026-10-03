import { useMemo } from 'react';
import { calcProduction, calcPlanetMaxPop } from '../utils/formulas/productionFormulas.js';
import { GAME_SPEED, POPULATION_CONSUMPTION_RATES } from '../data/gameData.js';

export function useImperialTotals(state) {
  const planets = state?.planets || [];

  return useMemo(() => {
    let metal = 0;
    let crystal = 0;
    let deuterium = 0;
    let slag = 0;
    let energyBalance = 0;
    let prodMetal = 0;
    let prodCrystal = 0;
    let prodDeuterium = 0;
    let prodSlag = 0;
    let prodSlagRecycled = 0;

    let totalPop = 0;
    let totalMaxPop = 0;

    const breakdown = {
      metal: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0 },
      crystal: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0 },
      deuterium: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0, fusionDeduction: 0 },
      slag: {
        total: 0,
        generation: 0,
        recycleRate: 0,
        maxRecycleCap: 0,
        recycledMetal: 0,
        recycledCrystal: 0,
        ecoSustainability: 100,
        details: { slagFromMetalMine: 0, slagFromCrystalMine: 0, slagFromIndustry: 0 }
      },
      energy: { solar: 0, fusion: 0, others: 0, totalProd: 0, totalCons: 0, energyBalance: 0 }
    };

    planets.forEach(p => {
      if (p.resources) {
        metal += (p.resources.metal || 0);
        crystal += (p.resources.crystal || 0);
        deuterium += (p.resources.deuterium || 0);
        slag += (p.resources.slag || 0);
      }
      try {
        const pop = p.population || 1000;
        totalPop += pop;
        totalMaxPop += calcPlanetMaxPop(p);

        const prod = calcProduction(
          p.buildings || {},
          state.research || {},
          p.temperature || 20,
          GAME_SPEED,
          p.faction || 'human',
          p.biome,
          p.gravity,
          p.trait,
          p.specialization,
          { galaxy: p.galaxy, system: p.system, position: p.position },
          p.taxRate ?? state.ministries?.economy?.taxRate ?? 0,
          p.relics || []
        );
        if (prod) {
          const popMetal = Math.round(pop * POPULATION_CONSUMPTION_RATES.metal * 3600);
          const popCrystal = Math.round(pop * POPULATION_CONSUMPTION_RATES.crystal * 3600);
          const popDeut = Math.round(pop * POPULATION_CONSUMPTION_RATES.deuterium * 3600);

          energyBalance += (prod.energyBalance || 0);
          prodMetal += Math.max(0, (prod.metal || 0) - popMetal);
          prodCrystal += Math.max(0, (prod.crystal || 0) - popCrystal);
          prodDeuterium += Math.max(0, (prod.deuterium || 0) - popDeut);

          breakdown.metal.popConsumption += popMetal;
          breakdown.crystal.popConsumption += popCrystal;
          breakdown.deuterium.popConsumption += popDeut;

          prodSlag += (prod.slagNet !== undefined ? prod.slagNet : (prod.slag || 0));
          prodSlagRecycled += (prod.slagRecycled || 0);

          if (prod.breakdown) {
            ['metal', 'crystal', 'deuterium'].forEach(res => {
              const b = prod.breakdown[res];
              if (b) {
                breakdown[res].baseMine += (b.baseMine || 0);
                breakdown[res].mineTotal += (b.mineTotal || 0);
                breakdown[res].industry += (b.industry || 0);
                breakdown[res].industryTotal += (b.industryTotal || 0);
                breakdown[res].total += (b.total || 0);
                breakdown[res].recycledSlagBonus = (breakdown[res].recycledSlagBonus || 0) + (b.recycledSlagBonus || 0);
                breakdown[res].slagGenerated = (breakdown[res].slagGenerated || 0) + (b.slagGenerated || 0);
                breakdown[res].techMult = b.techMult || 1;
                breakdown[res].govMult = b.govMult || 1;
                breakdown[res].biomeMult = b.biomeMult || 1;
                breakdown[res].civMult = b.civMult || 1;
                breakdown[res].specMult = b.specMult || 1;
                breakdown[res].ratio = b.ratio || 1;

                if (b.industryItems) {
                  if (!breakdown[res].industryItems) breakdown[res].industryItems = {};
                  Object.entries(b.industryItems).forEach(([itemKey, val]) => {
                    breakdown[res].industryItems[itemKey] = (breakdown[res].industryItems[itemKey] || 0) + (val || 0);
                  });
                }
              }
            });
            if (prod.breakdown.slag) {
              const sb = prod.breakdown.slag;
              breakdown.slag.total += (sb.total || 0);
              breakdown.slag.generation += (sb.generation || 0);
              breakdown.slag.recycleRate += (sb.recycleRate || 0);
              breakdown.slag.maxRecycleCap += (sb.maxRecycleCap || 0);
              breakdown.slag.recycledMetal += (sb.recycledMetal || 0);
              breakdown.slag.recycledCrystal += (sb.recycledCrystal || 0);
              if (sb.details) {
                breakdown.slag.details.slagFromMetalMine += (sb.details.slagFromMetalMine || 0);
                breakdown.slag.details.slagFromCrystalMine += (sb.details.slagFromCrystalMine || 0);
                breakdown.slag.details.slagFromIndustry += (sb.details.slagFromIndustry || 0);
              }
            }
            if (prod.breakdown.deuterium?.fusionDeduction) {
              breakdown.deuterium.fusionDeduction += prod.breakdown.deuterium.fusionDeduction;
            }
            if (prod.breakdown.energy) {
              const eb = prod.breakdown.energy;
              breakdown.energy.solar += (eb.solar || 0);
              breakdown.energy.fusion += (eb.fusion || 0);
              breakdown.energy.others += (eb.others || 0);
              breakdown.energy.totalProd += (eb.totalProd || 0);
              breakdown.energy.totalCons += (eb.totalCons || 0);
              breakdown.energy.energyBalance += (eb.energyBalance || 0);
            }
          }
        }
      } catch (err) {
        // Ignorar fallos puntuales
      }
    });

    breakdown.metal.netTotal = Math.max(0, breakdown.metal.total - breakdown.metal.popConsumption);
    breakdown.crystal.netTotal = Math.max(0, breakdown.crystal.total - breakdown.crystal.popConsumption);
    breakdown.deuterium.netTotal = Math.max(0, breakdown.deuterium.total - breakdown.deuterium.popConsumption);
    breakdown.slag.ecoSustainability = breakdown.slag.grossGenerated > 0 
      ? Math.min(100, Math.round((breakdown.slag.actualRecycled / breakdown.slag.grossGenerated) * 100))
      : 100;

    return {
      metal,
      crystal,
      deuterium,
      slag,
      energyBalance,
      prodMetal,
      prodCrystal,
      prodDeuterium,
      prodSlag,
      prodSlagRecycled,
      totalPop,
      totalMaxPop,
      breakdown
    };
  }, [planets, state?.research, state?.ministries?.economy?.taxRate]);
}
