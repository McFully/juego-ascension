import { useMemo, useCallback } from "react";
import * as GameCore from "../core.jsx";

const { calcProduction, calcStorage, GAME_SPEED, POPULATION_CONSUMPTION_RATES } = GameCore;

export function usePlanetEconomy(currentPlanet, state) {
  const safeCalcProduction = useCallback((...args) => {
    try {
      return calcProduction(...args);
    } catch (e) {
      console.error("[Ascensión] calcProduction error:", e, args);
      if (window.electronAPI && window.electronAPI.logError) {
        window.electronAPI.logError(`calcProduction crash: ${e?.message || e}`, e?.stack || "", `player=${state?.playerName}`);
      }
      return { metal: 0, crystal: 0, deuterium: 0, energyProd: 0, energyCons: 0, energyBalance: 0, ratio: 1 };
    }
  }, [state?.playerName]);

  const production = useMemo(() => {
    if (!currentPlanet) return { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const rawProd = safeCalcProduction(
      currentPlanet.buildings, state?.research || {}, currentPlanet.temperature, GAME_SPEED,
      currentPlanet.faction || "human", currentPlanet.biome, currentPlanet.gravity, currentPlanet.trait,
      currentPlanet.specialization, { galaxy: currentPlanet.galaxy, system: currentPlanet.system, position: currentPlanet.position },
      currentPlanet.taxRate ?? state?.ministries?.economy?.taxRate ?? 0
    );
    if (!rawProd || !rawProd.breakdown) return rawProd || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };

    const pop = currentPlanet.population || 1000;
    const rates = POPULATION_CONSUMPTION_RATES;
    const popMetal = Math.round(pop * rates.metal * 3600);
    const popCrystal = Math.round(pop * rates.crystal * 3600);
    const popDeut = Math.round(pop * rates.deuterium * 3600);

    const b = rawProd.breakdown;
    if (b.metal) {
      b.metal.popConsumption = popMetal;
      b.metal.netTotal = Math.max(0, (rawProd.metal || 0) - popMetal);
    }
    if (b.crystal) {
      b.crystal.popConsumption = popCrystal;
      b.crystal.netTotal = Math.max(0, (rawProd.crystal || 0) - popCrystal);
    }
    if (b.deuterium) {
      b.deuterium.popConsumption = popDeut;
      b.deuterium.netTotal = Math.max(0, (rawProd.deuterium || 0) - popDeut);
    }
    return rawProd;
  }, [currentPlanet, state?.research, state?.ministries, safeCalcProduction]);

  const storage = useMemo(() => currentPlanet ? calcStorage(currentPlanet.buildings) : { metal: 0, crystal: 0, deuterium: 0 }, [currentPlanet]);

  return {
    production,
    storage,
    safeCalcProduction
  };
}
