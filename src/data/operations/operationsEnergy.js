// Operaciones de edificios para ministerio: energy
export const operationsEnergy = {
  "hydrothermalGeothermal": {
    "title": "Consola Operativa de Central Geotérmica",
    "ministry": "energy",
    "modes": [
      {
        "id": "standard",
        "name": "Régimen Estándar",
        "desc": "Operación nominal continua al 100% de eficiencia.",
        "prodBonus": 1,
        "energyMod": 0
      },
      {
        "id": "overclock",
        "name": "Sobrecarga Operativa",
        "desc": "+20% de rendimiento a cambio de consumo energético extra.",
        "prodBonus": 1.2,
        "energyMod": -15
      },
      {
        "id": "conserve",
        "name": "Régimen Ecológico",
        "desc": "Operación en modo bajo consumo para preservar energía en la red.",
        "prodBonus": 0.8,
        "energyMod": 10
      }
    ],
    "actions": [
      {
        "id": "calibrate",
        "name": "Calibración Rápida",
        "desc": "Realiza un diagnóstico integral optimizando las rutinas del edificio.",
        "cost": {
          "crystal": 25
        },
        "cooldownSec": 90
      }
    ]
  }
};
