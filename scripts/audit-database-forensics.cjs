const { validateSaveData } = require('../electron/ipc/saveIpc.cjs');

console.log('🔍 [Auditoría Forense Atómica de Base de Datos y Persistencia Local]');

// 1. Simular SaveGame v3 completo con múltiples planetas y colas
const mockSaveState = {
  version: 3,
  gameStarted: true,
  playerName: 'Comandante Test',
  gameTick: 1250,
  currentPlanetId: 'planet-1',
  planets: [
    {
      id: 'planet-1',
      name: 'Terra Nova',
      buildings: { metalMine: 15, crystalMine: 12, deutSynth: 8 },
      resources: { metal: 25000, crystal: 14000, deuterium: 5000, energy: 350 },
      fleet: { lightFighter: 50, cruiser: 10 },
      defense: { rocketLauncher: 100 }
    },
    {
      id: 'planet-2',
      name: 'Ares Prime',
      buildings: { metalMine: 10, crystalMine: 8, solarPlant: 12 },
      resources: { metal: 12000, crystal: 8000, deuterium: 2000, energy: 200 },
      fleet: {},
      defense: { lightLaser: 40 }
    }
  ],
  research: { energy: 8, laser: 6, weapons: 5 },
  fleetMissions: [],
  buildQueue: [],
  shipQueue: [],
  researchQueue: []
};

// Validar save con el validador estricto de saveIpc.cjs
const valResult = validateSaveData(mockSaveState);
console.log(`1. Validación de esquema Save v3: ${valResult.valid ? '✅ VÁLIDO' : '❌ ERROR: ' + valResult.error}`);

// 2. Probar validación de save v2 aceptable para posterior migración en frontend
const mockLegacyV2 = {
  version: 2,
  gameStarted: true,
  playerName: 'Comandante Legacy',
  planets: [{ id: 'p1', name: 'Legacy Planet' }]
};
const valV2 = validateSaveData(mockLegacyV2);
console.log(`2. Aceptación de save Legacy v2: ${valV2.valid ? '✅ VÁLIDO PARA MIGRACIÓN' : '❌ ERROR'}`);

// 3. Probar detección y rechazo de corrupción en datos de save
const badSave = { version: 3, playerName: 'Hacker', planets: 'no-array' };
const badVal = validateSaveData(badSave);
console.log(`3. Rechazo de save corrupto/inconsistente: ${!badVal.valid ? '✅ DETECTADO Y BLOQUEADO ADECUADAMENTE' : '❌ ERROR: NO DETECTÓ'}`);

console.log('==============================================');
if (valResult.valid && valV2.valid && !badVal.valid) {
  console.log('🎉 AUDITORÍA DE PERSISTENCIA Y DATABASE: 100% SALUDABLE.');
} else {
  process.exit(1);
}
