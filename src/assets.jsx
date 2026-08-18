import React, { useState } from 'react';

const asset = (filename) => new URL(`../Assets/${filename}`, import.meta.url).href;
const getFallbackImage = (category) => {
  const fallbacks = {
    // Research categories
    power: REAL_IMAGES.energy,
    propulsion: REAL_IMAGES.impulse,
    weapon: REAL_IMAGES.weapons,
    weapons: REAL_IMAGES.weapons,
    defense: REAL_IMAGES.shields,
    utility: REAL_IMAGES.computer,
    computer: REAL_IMAGES.computer,
    economy: REAL_IMAGES.galacticTrade,
    ai: REAL_IMAGES.aiStrategy,
    engineering: REAL_IMAGES.nanoTech,
    exploration: REAL_IMAGES.astrophysics,
    military: REAL_IMAGES.weapons,
    civics: REAL_IMAGES.townHall,
    government: REAL_IMAGES.townHall,
    logistics: REAL_IMAGES.advLogistics,
    ballistic: REAL_IMAGES.ballisticWeapons,
    
    // Building categories
    resource: REAL_IMAGES.metalMine,
    energy: REAL_IMAGES.solarPlant,
    facility: REAL_IMAGES.robotFactory,
    storage: REAL_IMAGES.metalStorage,
    special: REAL_IMAGES.spacePort,
    advanced: REAL_IMAGES.aiCore,
    civil: REAL_IMAGES.townHall
  };
  return fallbacks[category] || null;
};

const getCardImage = (id, category) => {
  const src = REAL_IMAGES[id];
  if (src) return src;
  return getFallbackImage(category);
};

export const CardImage = ({ id, category, className = "w-full h-auto object-cover" }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return (
      <img 
        src={src} 
        alt="" 
        className={className}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }
  return <div className={`${className} bg-[#05070f]`} />;
};

export const SafeImg = ({ id, category, className = "w-full h-auto" }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return <img src={src} alt="" className={`${className} object-cover rounded`} onError={() => setHasError(true)} loading="lazy" />;
  }
  return <div className={`${className} bg-[#05070f] rounded`} />;
};

export const CardBanner = ({ id, category }) => {
  const src = getCardImage(id, category);
  const [hasError, setHasError] = useState(false);
  return (
    <div className="relative overflow-hidden w-full aspect-video rounded-xl mb-3 border border-white/10 glass-deep fresnel">
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-[#05070f]" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
    </div>
  );
};

export { asset, getCardImage };
export const REAL_IMAGES = {
  townHall: asset('Ayuntamiento.png'),
  healthCenter: asset('Centro de Salud.png'),
  leisureCenter: asset('Centro de Ocio.png'),
  singularity: asset('Singularidad.png'),
  planetDestroyer: asset('Destructor de Planetas.png'),
  metalMine: asset('Mina de Metal.webp'),
  crystalMine: asset('Mina de Cristal.webp'),
  deutSynth: asset('Sintetizador Deuterio.webp'),
  solarPlant: asset('Planta Solar.webp'),
  fusionReactor: asset('Reactor de Fusion.webp'),
  geoPlant: asset('Central Geotermica.webp'),
  metalStorage: asset('Almacen Metal.webp'),
  crystalStorage: asset('Almacen Cristal.webp'),
  deutStorage: asset('Almacen Deuterio.webp'),
  vault: asset('Boveda Protegida.webp'),
  chemPlant: asset('Planta de Procesamiento.webp'),
  ion: asset('Ion.webp'),
  plasma: asset('plasma.webp'),
  orbitalArtillery: asset('artilleria orbital.webp'),
  lightFighter: asset('Cazador Ligero.webp'),
  cruiser: asset('Crucero.webp'),
  battleship: asset('Nave de Batalla.webp'),
  destroyer: asset('Destructor.webp'),
  plasmaTurret: asset('plasma_turret.png'),
  robotFactory: asset('Fábrica de Robots.webp'),
  shipyard: asset('Astillero.webp'),
  researchLab: asset('Laboratorio.webp'),
  energy: asset('Energía.webp'),
  advReactors: asset('Reactores Avanzados.webp'),
  quantumEnergy: asset('Optimización Energética.webp'),
  quantumNetworks: asset('Redes Cuánticas.webp'),
  interstellarNav: asset('Navegación Interestelar.webp'),
  impulse: asset('Impulso.webp'),
  hyperspace: asset('Hiperespacio.webp'),
  combustion: asset('Combustión.webp'),
  customShipyard: asset('Fábrica Naves Personalizadas.webp'),
  aiCore: asset('Núcleo de IA.webp'),
  nanoCenter: asset('Centro de Nanotecnología.webp'),
  tradeNetwork: asset('Red Comercio Autom.webp'),
  terraformer: asset('Terraformador.webp'),
  lunarBase: asset('Base Lunar.webp'),
  sensorPhalanx: asset('Sensor Phalanx.webp'),
  jumpGate: asset('Puerta de Salto.webp'),
  moonStorage: asset('Deposito Lunar.webp'),
  deathstar: asset('Estrella de la Muerte.webp'),
  smallCargo: asset('Carguera Pequeña.webp'),
  largeCargo: asset('Gran Carguero.webp'),
  espionageProbe: asset('Sonda Espionaje.webp'),
  colonizer: asset('Colonizador.webp'),
  recycler: asset('Reciclador.webp'),
  interplanetaryMissile: asset('Misil Interplanetario.webp'),
  antiBallisticMissile: asset('Misil Antibalistico.webp'),
  laser: asset('Laser.webp'),
  heavyFighter: asset('Cazador Pesado.webp'),
  bomber: asset('Bombardero.webp'),
  lightLaser: asset('Láser Ligero.webp'),
  heavyLaser: asset('Láser Pesado.webp'),
  rocketLauncher: asset('Lanzamisiles.webp'),
  gaussCannon: asset('Cañón Gauss.webp'),
  ionCannon: asset('Cañón de Iones.webp'),
  smallShieldDome: asset('Cúpula Pequeña.webp'),
  largeShieldDome: asset('Cúpula Grande.webp'),
  defenseFields: asset('Campos Defensivos.webp'),
  advResearchCenter: asset('Centro Inv Avanzada.webp'),
  ballisticWeapons: asset('ballisticWeapons.jpg'),
  advMissiles: asset('Misiles Avanzados.webp'),
  nanoRepair: asset('Nano-reparación.webp'),
  espionage: asset('Espionaje.webp'),
  computer: asset('Computación.webp'),
  armour: asset('Blindaje.webp'),
  weapons: asset('Armas.webp'),
  shields: asset('Escudos.webp'),
  astrophysics: asset('Astrofísica.webp'),
  aiTactics: asset('IA Táctica.webp'),
  advSensors: asset('Sensores Avanzados.webp'),
  galacticTrade: asset('Comercio Galáctico.webp'),
  aiProd: asset('IA de Producción.webp'),
  nanoTech: asset('Nanotecnología.webp'),
  spyCenter: asset('Centro de Espionaje.webp'),
  spacePort: asset('Puerto Espacial.webp'),
  diploCenter: asset('Centro Diplomático.webp'),
  galacticMarket: asset('Mercado Galáctico.webp'),
  expLab: asset('Laboratorio Experimental.webp'),
  geneticLab: asset('Centro Ing Genética.webp'),
  darkMatterPlant: asset('Planta Materia Oscura.webp'),
  missileSilo: asset('Silo de Misiles.webp'),
  refinery: asset('refinery.png'),
  synthPlant: asset('Sintetizador Quimico.webp'),
  enrichPlant: asset('Planta de Enriquecimiento.webp'),
  orbitalEnergy: asset('Red Orbital Energetica.webp'),
  quantumReactor: asset('Reactor Cuantico.webp'),
  commandCenter: asset('Centro de Mando.webp'),
  militaryAcademy: asset('Academia Militar.webp'),
  logiCenter: asset('Centro Logistico.webp'),
  industrialComplex: asset('Complejo Industrial.webp'),
  modularFactory: asset('Fabrica Modular.webp'),
  assemblyCenter: asset('Centro de Ensamblaje.webp'),
  constructionCenter: asset('Centro de Construcciones.webp'),
  orbitalStorage: asset('Almacen Orbital.webp'),
  quantumDrive: asset('Propulsion Cuantica.webp'),
  fortressTech: asset('Fortaleza Planetaria.webp'),
  galacticCrypto: asset('Criptografia Galactica.webp'),
  miningAuto: asset('Automatizacion Minera.webp'),
  industrialOpt: asset('Optimizacion Industrial.webp'),
  advLogistics: asset('Logistica Avanzada.webp'),
  aiMilitary: asset('IA Militar.webp'),
  aiStrategy: asset('IA Estrategica.webp'),
  fullAuto: asset('Automatizacion Total.webp'),
  modularEng: asset('Ingenieria Modular.webp'),
  expDesign: asset('Diseno Experimental.webp'),
  cyberIntegration: asset('Integracion Cibernetica.webp'),
  naniteFactory: asset('Fabrica Nanobots.webp'),
  deepScanner: asset('deepScanner.jpg'),
  advColonization: asset('Colonizacion Avanzada.webp'),
  quantumSupercomputer: asset('quantumSupercomputer.jpg'),
  particleAccelerator: asset('particleAccelerator.jpg'),
  galacticCartography: asset('Cartografia Galactica.webp'),
  dimensionalExploration: asset('Exploracion Dimensional.webp'),

  // Expanded buildings (new assets)
  urbanGarbageRecycler: asset('urbanGarbageRecycler.jpg'),
  schoolEduCenter: asset('schoolEduCenter.jpg'),
  prefabHousingUnit: asset('prefabHousingUnit.jpg'),
  planetaryClimatizer: asset('planetaryClimatizer.jpg'),
  geosphericEcoPark: asset('geosphericEcoPark.jpg'),
  vacuumTransitTubes: asset('vacuumTransitTubes.jpg'),
  stellarPhilosophyTemple: asset('stellarPhilosophyTemple.jpg'),
  sectorGovPalace: asset('sectorGovPalace.jpg'),
  permanentEmbassy: asset('permanentEmbassy.jpg'),
  financeMinistry: asset('financeMinistry.jpg'),
  councilChamber: asset('councilChamber.jpg'),
  consulateHeadquarters: asset('consulateHeadquarters.jpg'),
  galacticPublicRelation: asset('galacticPublicRelation.jpg'),
  treatyCoordinationOffice: asset('treatyCoordinationOffice.jpg'),
  galacticArbitrageCourt: asset('galacticArbitrageCourt.jpg'),
  historicImperialArchive: asset('historicImperialArchive.jpg'),
  internalSecurityMinistry: asset('internalSecurityMinistry.jpg'),
  migrationOffice: asset('migrationOffice.jpg'),
  extraterrestrialAffairs: asset('extraterrestrialAffairs.jpg'),
  colonySupremeCourt: asset('colonySupremeCourt.jpg'),
  civilGuardCommand: asset('civilGuardCommand.jpg'),
  resourceAllocationMinistry: asset('resourceAllocationMinistry.jpg'),
  humanitarianAssistance: asset('humanitarianAssistance.jpg'),

  // Storage expanded
  metalMegaStorage: asset('metalMegaStorage.jpg'),
  crystalMegaStorage: asset('crystalMegaStorage.jpg'),
  deutMegaStorage: asset('deutMegaStorage.jpg'),
  orbitalDistributor: asset('orbitalDistributor.jpg'),
  merchantTradePort: asset('merchantTradePort.jpg'),
  armoredUndergroundVault: asset('armoredUndergroundVault.jpg'),
  transferStation: asset('transferStation.jpg'),
  systemTradeNetwork: asset('systemTradeNetwork.jpg'),
  standardCargoDepot: asset('standardCargoDepot.jpg'),
  gravitySortStation: asset('gravitySortStation.jpg'),
  transitControlTower: asset('transitControlTower.jpg'),
  merchantHangar: asset('merchantHangar.jpg'),
  freeTradePort: asset('freeTradePort.jpg'),
  orbitalRefuelRing: asset('orbitalRefuelRing.jpg'),
  futuresExchange: asset('futuresExchange.jpg'),
  centralLogisticHub: asset('centralLogisticHub.jpg'),

  // Research expanded (new assets)
  gravityCurrents: asset('gravityCurrents.jpg'),
  wormholeAstrografy: asset('wormholeAstrografy.jpg'),
  tachyonSpectroscopy: asset('tachyonSpectroscopy.jpg'),
  alcubierreDrive: asset('alcubierreDrive.jpg'),
  interferometryPhalanx: asset('interferometryPhalanx.jpg'),
  relativisticInertial: asset('relativisticInertial.jpg'),
  magnetohydrodynamics: asset('magnetohydrodynamics.jpg'),
  hostileBiomes: asset('hostileBiomes.jpg'),
  interstellarAnalysis: asset('interstellarAnalysis.jpg'),
  hyperspaceCompression: asset('hyperspaceCompression.jpg'),
  grapheneTitanium: asset('grapheneTitanium.jpg'),
  latticeMaterials: asset('latticeMaterials.jpg'),
  nanobotRepairSwarms: asset('nanobotRepairSwarms.jpg'),
  molecularHeatRadiator: asset('molecularHeatRadiator.jpg'),
  cryogenicToughness: asset('cryogenicToughness.jpg'),
  molecularVaporDep: asset('molecularVaporDep.jpg'),
  selfSealingPolymer: asset('selfSealingPolymer.jpg'),
  carbonNanotubes: asset('carbonNanotubes.jpg'),
  electronBeamWeld: asset('electronBeamWeld.jpg'),
  relativisticVacuum: asset('relativisticVacuum.jpg'),
  neuralNetworks: asset('neuralNetworks.jpg'),
  quantumCrypto: asset('quantumCrypto.jpg'),
  orbitalLogisticExpert: asset('orbitalLogisticExpert.jpg'),
  geneticWarAlgorithm: asset('geneticWarAlgorithm.jpg'),
  synchronousOptical: asset('synchronousOptical.jpg'),
  swarmTeleoperate: asset('swarmTeleoperate.jpg'),
  cognitiveNetwork: asset('cognitiveNetwork.jpg'),
  cyberDefenseActive: asset('cyberDefenseActive.jpg'),
  marketPrediction: asset('marketPrediction.jpg'),
  quantumMaterialSim: asset('quantumMaterialSim.jpg'),
  gaussRailgunAccel: asset('gaussRailgunAccel.jpg'),
  xRayFrequencyLaser: asset('xRayFrequencyLaser.jpg'),
  plasmaSelfSustained: asset('plasmaSelfSustained.jpg'),
  antimatterWarhead: asset('antimatterWarhead.jpg'),
  gravitationalForcefields: asset('gravitationalForcefields.jpg'),
  lidarPredictTarget: asset('lidarPredictTarget.jpg'),
  stealthSilos: asset('stealthSilos.jpg'),
  ablativePlating: asset('ablativePlating.jpg'),
  electromagneticChaff: asset('electromagneticChaff.jpg'),
  coherentResonance: asset('coherentResonance.jpg'),
  orbitalSanitaryBio: asset('orbitalSanitaryBio.jpg'),
  arcologySociology: asset('arcologySociology.jpg'),
  multiproposeHydroponic: asset('multiproposeHydroponic.jpg'),
  wasteRecycleSystem: asset('wasteRecycleSystem.jpg'),
  climateComfortField: asset('climateComfortField.jpg'),
  acceleratedSleepBio: asset('acceleratedSleepBio.jpg'),
  deepColonizationPsych: asset('deepColonizationPsych.jpg'),
  adaptiveModularArch: asset('adaptiveModularArch.jpg'),
  quantumTelecom: asset('quantumTelecom.jpg'),
  purificationEngineer: asset('purificationEngineer.jpg'),
  algorithmicBureaucracy: asset('algorithmicBureaucracy.jpg'),
  treatyCryptography: asset('treatyCryptography.jpg'),
  galacticLawCode: asset('galacticLawCode.jpg'),
  arbitratedNegotiation: asset('arbitratedNegotiation.jpg'),
  persuasionSociology: asset('persuasionSociology.jpg'),
  interspeciesIntegration: asset('interspeciesIntegration.jpg'),
  stellarPropaganda: asset('stellarPropaganda.jpg'),
  financialAudit: asset('financialAudit.jpg'),
  permanentEmbassies: asset('permanentEmbassies.jpg'),
  unifiedFederalGov: asset('unifiedFederalGov.jpg'),
  vectorialTradeRoute: asset('vectorialTradeRoute.jpg'),
};
