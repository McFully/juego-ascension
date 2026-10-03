// Ministry Specific programs configuration (4 detailed levels per ministry)
export const MINISTRY_PROGRAMS = {
  resources: [
    { id: 'res_sub_drill', name: 'Taladros de Núcleo Profundo', desc: 'Perforación de manto geológico. Aumenta la extracción de metal.', baseCost: { metal: 8000, crystal: 4000 }, bonusText: '+12% Producción de Metal por nivel' },
    { id: 'res_crystal_laser', name: 'Cortadoras Láser de Resonancia', desc: 'Extracción focalizada de vetas cristalinas sin microfracturas.', baseCost: { metal: 6000, crystal: 6000 }, bonusText: '+12% Producción de Cristal por nivel' },
    { id: 'res_deut_centrifuge', name: 'Centrifugadoras Cuánticas de Deuterio', desc: 'Condensación hiperbárica de partículas pesadas de deuterio.', baseCost: { metal: 10000, deuterium: 5000 }, bonusText: '+15% Producción de Deuterio por nivel' },
    { id: 'res_mine_safety', name: 'Protocolos de Seguridad Geológica', desc: 'Estabilización tectónica en galerías de extracción profunda.', baseCost: { crystal: 8000, deuterium: 4000 }, bonusText: '-10% Riesgo de incidentes y costes por nivel' }
  ],
  economy: [
    { id: 'mining_subsidy', name: 'Subsidios de Extracción Minera', desc: 'Financia taladros orbitales. Aumenta producción de metales.', baseCost: { metal: 10000, crystal: 5000 }, bonusText: '+10% Producción por nivel' },
    { id: 'trade_network', name: 'Red Comercial Sub-espacial', desc: 'Rutas comerciales hiperlumínicas automáticas.', baseCost: { metal: 15000, deuterium: 5000 }, bonusText: '+8% Ganancia de Créditos por nivel' },
    { id: 'industrial_zones', name: 'Zonas Francas Industriales', desc: 'Incentiva fábricas locales en las colonias.', baseCost: { crystal: 12000, deuterium: 8000 }, bonusText: '-6% Coste de Edificaciones por nivel' },
    { id: 'agri_synth', name: 'Complejos Agro-sintéticos', desc: 'Biosferas automatizadas de alta densidad alimentaria.', baseCost: { metal: 8000, crystal: 8000 }, bonusText: '+5% Crecimiento de Población por nivel' }
  ],
  defense: [
    { id: 'armour_plating', name: 'Modernización de Blindajes', desc: 'Revestimientos pesados para cascos navales.', baseCost: { metal: 12000, deuterium: 4000 }, bonusText: '+8% HP de Naves por nivel' },
    { id: 'weapon_opt', name: 'Optimización de Cañones Láser', desc: 'Focalizadores de plasma de alta estabilidad.', baseCost: { crystal: 10000, deuterium: 6000 }, bonusText: '+10% Ataque de Naves por nivel' },
    { id: 'shield_freq', name: 'Moduladores de Escudo Cuánticos', desc: 'Previene penetración de proyectiles cinéticos.', baseCost: { crystal: 15000, influence: 50 }, bonusText: '+8% Escudos por nivel' },
    { id: 'def_grid', name: 'Red de Defensa Satelital', desc: 'Satélites de defensa orbitales interconectados.', baseCost: { metal: 20000, crystal: 10000 }, bonusText: '+12% Fuerza de Defensas por nivel' }
  ],
  science: [
    { id: 'neural_quantum', name: 'Red Neuronal Cuántica', desc: 'Investigación computacional avanzada.', baseCost: { crystal: 8000, deuterium: 8000 }, bonusText: '+15% Velocidad de I+D por nivel' },
    { id: 'reactor_tech', name: 'Fusión de Helio-3 Avanzada', desc: 'Reactores de pulso magnético de alto rendimiento.', baseCost: { metal: 10000, deuterium: 12000 }, bonusText: '+10% Energía de Colonias por nivel' },
    { id: 'physics_lab', name: 'Laboratorio de Micro-gravedad', desc: 'Física aplicada al motor de salto e hiper-propulsores.', baseCost: { crystal: 12000, deuterium: 10000 }, bonusText: '+8% Velocidad de Flota por nivel' },
    { id: 'nanobot_reconstruct', name: 'Nanobots de Reparación', desc: 'Algoritmos auto-reparadores integrados en el chasis.', baseCost: { metal: 18000, crystal: 12000 }, bonusText: '+5% Auto-reparación en combate por nivel' }
  ],
  culture: [
    { id: 'galas_propaganda', name: 'Galas de Prestigio Estelar', desc: 'Ceremonias de gala para el senado galáctico.', baseCost: { crystal: 5000, influence: 20 }, bonusText: '+20 Reputación Galáctica por nivel' },
    { id: 'social_monuments', name: 'Monumentos Federales', desc: 'Estatues gigantescas de unidad en las metrópolis.', baseCost: { metal: 20000, crystal: 10000 }, bonusText: '+10% Unidad Social por nivel' },
    { id: 'heritage_broadcast', name: 'Transmisor de Identidad Nova', desc: 'Canales de hiper-red de alta frecuencia cultural.', baseCost: { metal: 12000, influence: 30 }, bonusText: '+12% Influencia por ciclo por nivel' },
    { id: 'immigrant_center', name: 'Políticas de Puertas Abiertas', desc: 'Atrae refugiados del borde exterior.', baseCost: { metal: 10000, crystal: 8000 }, bonusText: '+10% Migración interestelar por nivel' }
  ],
  infra: [
    { id: 'orbital_roads', name: 'Super-Autovías Orbitales', desc: 'Logística orbital integrada y automatizada.', baseCost: { metal: 12000, crystal: 6000 }, bonusText: '-10% Tiempo de Edificación por nivel' },
    { id: 'cargo_drones', name: 'Enjambres de Drones de Carga', desc: 'Distribución y almacenamiento automatizado.', baseCost: { metal: 10000, crystal: 10000 }, bonusText: '+15% Capacidad de Carga por nivel' },
    { id: 'nanite_scaffolding', name: 'Andamiaje de Nanitas', desc: 'Constructores microscópicos inteligentes.', baseCost: { crystal: 16000, deuterium: 8000 }, bonusText: '-8% Coste de Instalaciones por nivel' },
    { id: 'deep_mines', name: 'Técnicas de Minería Profunda', desc: 'Pozos térmicos para acceder al núcleo planetario.', baseCost: { metal: 25000, deuterium: 12000 }, bonusText: '+12% Rendimiento de Minas por nivel' }
  ],
  intel: [
    { id: 'hawk_eye', name: 'Operación Ojo de Halcón', desc: 'Satélites espía y decodificadores tácticos.', baseCost: { crystal: 8000, influence: 20 }, bonusText: '+15% Defensa frente a espionaje por nivel' },
    { id: 'sleeper_net', name: 'Red de Células Durmientes', desc: 'Infiltración pasiva en las capitales de IAs.', baseCost: { crystal: 12000, deuterium: 8000 }, bonusText: '+10% Intel Máxima de IAs por nivel' },
    { id: 'quantum_scrambler', name: 'Inhibidores de Red Cuántica', desc: 'Interfiere transmisiones sub-espacio enemigas.', baseCost: { metal: 15000, crystal: 10000 }, bonusText: '+15% Detección de flotas hostiles por nivel' },
    { id: 'black_ops', name: 'Operaciones Encubiertas', desc: 'Cursos de entrenamiento para comandos de infiltración.', baseCost: { crystal: 18000, deuterium: 12000 }, bonusText: '+8% Éxito de misiones de sabotaje por nivel' }
  ],
  energy: [
    { id: 'solar_amplifiers', name: 'Amplificadores Fotónicos Solares', desc: 'Lentes orbitales que concentran fotones en las plantas de superficie.', baseCost: { metal: 12000, crystal: 15000 }, bonusText: '+15% Producción Solar por nivel' },
    { id: 'fusion_stabilizers', name: 'Estabilizadores de Plasma Tokamak', desc: 'Reducción de vibraciones magnéticas y consumo de deuterio.', baseCost: { crystal: 15000, deuterium: 12000 }, bonusText: '+20% Rendimiento Fusión por nivel' },
    { id: 'zero_point_tap', name: 'Sonda de Vacío Cuántico', desc: 'Extracción de energía de fluctuación de punto cero.', baseCost: { metal: 25000, deuterium: 20000 }, bonusText: '+25% Energía Total por nivel' },
    { id: 'superconductor_grid', name: 'Red Superconductora Global', desc: 'Distribución sin resistencia eléctrica a todas las colonias.', baseCost: { metal: 30000, crystal: 25000 }, bonusText: '-10% Pérdidas de Energía por nivel' }
  ],
  agriculture: [
    { id: 'hydro_genomics', name: 'Genómica de Cultivos Espaciales', desc: 'Cepas vegetales de crecimiento acelerado con luz estelar.', baseCost: { crystal: 10000, deuterium: 6000 }, bonusText: '+15% Crecimiento Población por nivel' },
    { id: 'biome_stabilizers', name: 'Estabilizadores Biosféricos', desc: 'Aclimatación de atmósferas hostiles y reducción de toxinas.', baseCost: { metal: 14000, crystal: 10000 }, bonusText: '+10% Felicidad Colonial por nivel' },
    { id: 'pure_water_aquifers', name: 'Acuíferos de Circuito Cerrado', desc: 'Purificación total del agua colonial mediante filtros moleculares.', baseCost: { metal: 12000, deuterium: 8000 }, bonusText: '-15% Polución Planetaria por nivel' },
    { id: 'soil_synthesizers', name: 'Sintetizadores de Suelo Fértil', desc: 'Enriquecimiento orgánico de regolito y roca lunar.', baseCost: { metal: 18000, crystal: 14000 }, bonusText: '+12% Resistencia a Sequías por nivel' }
  ],
  justice: [
    { id: 'federal_law_codex', name: 'Codificación del Derecho Federal', desc: 'Estandarización de sentencias y protección de colonos.', baseCost: { crystal: 8000, influence: 30 }, bonusText: '+15% Estabilidad Social por nivel' },
    { id: 'arbitrage_tribunals', name: 'Tribunales de Arbitraje Mercantil', desc: 'Resolución acelerada de conflictos comerciales con facciones.', baseCost: { metal: 12000, crystal: 10000 }, bonusText: '+10% Reputación por acuerdos por nivel' },
    { id: 'civil_guard_patrols', name: 'Vigilancia de Seguridad Ciudadana', desc: 'Escuadras mecanizadas de orden público en puertos coloniales.', baseCost: { metal: 15000, deuterium: 6000 }, bonusText: '-20% Crímenes y Sabotajes por nivel' },
    { id: 'migration_registry', name: 'Registro Civil Automatizado', desc: 'Censo holográfico en tiempo real de toda la población imperial.', baseCost: { crystal: 14000, influence: 25 }, bonusText: '+8% Eficiencia Tributaria por nivel' }
  ],
  transport: [
    { id: 'orbital_freight_ring', name: 'Anillos de Transferencia Orbital', desc: 'Lanzaderas continuas de carga sin consumo de combustible.', baseCost: { metal: 20000, crystal: 12000 }, bonusText: '+25% Capacidad Logística por nivel' },
    { id: 'maglev_corridors', name: 'Corredores Subterráneos de Vacío', desc: 'Cápsulas de tránsito hipersónico entre minas y almacenes.', baseCost: { metal: 18000, deuterium: 10000 }, bonusText: '+15% Velocidad de Transporte por nivel' },
    { id: 'in_flight_refueling', name: 'Estaciones de Reabastecimiento', desc: 'Nodos de repostaje de deuterio en puntos de Lagrange.', baseCost: { crystal: 15000, deuterium: 15000 }, bonusText: '-15% Consumo Combustible por nivel' },
    { id: 'automated_docking', name: 'Atraque Autónomo de Cargueros', desc: 'Control de tráfico aeroespacial con algoritmos de evasión.', baseCost: { metal: 16000, crystal: 16000 }, bonusText: '-20% Tiempo de Despegue por nivel' }
  ],
  industry: [
    { id: 'ind_catalyst', name: 'Catalizadores Moleculares', desc: 'Acelera el refinado de materias primas en productos avanzados.', baseCost: { metal: 14000, crystal: 8000 }, bonusText: '+15% Eficiencia de Refinerías por nivel' },
    { id: 'ind_assembly', name: 'Líneas de Montaje Sincrónicas', desc: 'Estandarización de componentes pesados y aleaciones.', baseCost: { metal: 18000, crystal: 10000 }, bonusText: '-10% Tiempo de Fabricación por nivel' },
    { id: 'ind_reclaim', name: 'Reciclaje de Escorias Industriales', desc: 'Recuperación masiva de minerales de subproductos metalúrgicos y escorias.', baseCost: { metal: 12000, deuterium: 6000 }, bonusText: '+800% Capacidad de Reciclaje y Retorno por nivel' },
    { id: 'ind_poly', name: 'Polímeros Hiperdensos', desc: 'Nuevos materiales compuestos para blindajes y estructuras.', baseCost: { crystal: 16000, deuterium: 10000 }, bonusText: '+12% Durabilidad Estructural por nivel' }
  ],
  innovation: [
    { id: 'inno_nano_fab', name: 'Nanofabricación Molecular', desc: 'Impresoras a escala atómica para prototipos inmediatos.', baseCost: { crystal: 15000, deuterium: 12000 }, bonusText: '-12% Coste de Diseños Experimentales por nivel' },
    { id: 'inno_patents', name: 'Consorcio de Patentes Federales', desc: 'Monetización y aplicación cruzada de descubrimientos.', baseCost: { metal: 10000, crystal: 15000 }, bonusText: '+10% Créditos por Investigación por nivel' },
    { id: 'inno_rapid_proto', name: 'Simulaciones de Prototipado Rápido', desc: 'Modelado cuántico previo a la construcción física.', baseCost: { crystal: 18000, deuterium: 14000 }, bonusText: '+15% Velocidad de Nuevos Diseños por nivel' },
    { id: 'inno_smart_alloys', name: 'Aleaciones con Memoria de Forma', desc: 'Metales que corrigen microfisuras por tensión térmica.', baseCost: { metal: 22000, deuterium: 15000 }, bonusText: '+8% Eficiencia General por nivel' }
  ],
  cybernetics: [
    { id: 'cyb_neural_link', name: 'Enlaces Sinápticos Centrales', desc: 'Conexión cuántica entre nodos de IA y administradores.', baseCost: { crystal: 14000, deuterium: 14000 }, bonusText: '+15% Eficiencia de Gobernadores IA por nivel' },
    { id: 'cyb_subroutine', name: 'Subrutinas Predictivas de Mantenimiento', desc: 'Prevención algorítmica de averías en infraestructuras.', baseCost: { metal: 12000, crystal: 16000 }, bonusText: '-15% Fallos de Sistemas por nivel' },
    { id: 'cyb_matrix', name: 'Matriz Cuántica Distribuida', desc: 'Cómputo masivo en paralelo a través de satélites coloniales.', baseCost: { crystal: 20000, deuterium: 18000 }, bonusText: '+20% Capacidad de Procesamiento por nivel' },
    { id: 'cyb_auto_opt', name: 'Auto-Calibración Heurística', desc: 'Optimización de consumos eléctricos mediante machine learning.', baseCost: { metal: 15000, crystal: 15000 }, bonusText: '-8% Consumo Eléctrico por nivel' }
  ],
  war: [
    { id: 'war_drill', name: 'Maniobras de Flota Bélica', desc: 'Simulacros de combate espacial en cinturones de asteroides.', baseCost: { metal: 20000, deuterium: 10000 }, bonusText: '+10% Puntería y Críticos por nivel' },
    { id: 'war_carrier_dock', name: 'Patios de Rearme Rápido', desc: 'Bahías automatizadas para reabastecimiento en caliente.', baseCost: { metal: 25000, crystal: 15000 }, bonusText: '-20% Tiempo de Reparación tras Batalla por nivel' },
    { id: 'war_targeting', name: 'Telemetría de Tiro Balístico', desc: 'Fijación hiperlumínica de blancos en formación de combate.', baseCost: { crystal: 18000, deuterium: 12000 }, bonusText: '+12% Daño Perforante por nivel' },
    { id: 'war_veterancy', name: 'Academia de Oficiales de Asalto', desc: 'Instrucción avanzada para capitanes de naves insignia.', baseCost: { metal: 16000, influence: 40 }, bonusText: '+15% Moral de Tripulaciones por nivel' }
  ],
  logistics: [
    { id: 'log_depot_exp', name: 'Expansión de Silos Modulares', desc: 'Ampliación criogénica y magnética de almacenes planetarios.', baseCost: { metal: 18000, crystal: 12000 }, bonusText: '+20% Capacidad de Almacenamiento por nivel' },
    { id: 'log_router', name: 'Planificadores de Carga Hiperespacial', desc: 'Algoritmos de empaquetado y estiba para convoyes.', baseCost: { crystal: 14000, deuterium: 8000 }, bonusText: '+15% Capacidad de Carga en Naves por nivel' },
    { id: 'log_orbital_tender', name: 'Naves Nodriza de Abastecimiento', desc: 'Suministro en órbita para flotas mercantes y militares.', baseCost: { metal: 22000, deuterium: 14000 }, bonusText: '-15% Retraso Logístico por nivel' },
    { id: 'log_salvage', name: 'Protocolos de Rescate de Pecios', desc: 'Equipos especializados en recolección de restos de batalla.', baseCost: { metal: 16000, crystal: 10000 }, bonusText: '+25% Tasa de Desguace por nivel' }
  ],
  biosphere: [
    { id: 'bio_terra_seed', name: 'Siembra Atmosférica Primaria', desc: 'Dispersión orbital de bio-agentes para estabilizar atmósferas.', baseCost: { crystal: 14000, deuterium: 10000 }, bonusText: '-10% Tiempo de Terraformación por nivel' },
    { id: 'bio_dome_eng', name: 'Cúpulas Geodésicas de Alta Presión', desc: 'Habitabilidad en planetas áridos, helados o de lava.', baseCost: { metal: 20000, crystal: 16000 }, bonusText: '+15% Terreno Construible en Mundos Hostiles por nivel' },
    { id: 'bio_flora_gen', name: 'Genética de Flora Sintética', desc: 'Plantas capaces de metabolizar hidrocarburos tóxicos.', baseCost: { crystal: 12000, deuterium: 12000 }, bonusText: '+12% Purificación de Bioma por nivel' },
    { id: 'bio_climate_net', name: 'Red de Modulación Climática', desc: 'Estaciones terrestres que regulan tempestades y temperatura.', baseCost: { metal: 18000, deuterium: 15000 }, bonusText: '+10% Estabilidad Planetaria por nivel' }
  ],
  civics: [
    { id: 'civ_health_care', name: 'Red Hospitalaria Colonial', desc: 'Centros de bio-regeneración médica para toda la población.', baseCost: { metal: 12000, crystal: 12000 }, bonusText: '+15% Esperanza de Vida y Colonos por nivel' },
    { id: 'civ_housing', name: 'Megatorres de Vivienda Social', desc: 'Alojamientos verticales con soporte vital integrado.', baseCost: { metal: 22000, crystal: 8000 }, bonusText: '+20% Capacidad Máxima de Colonos por nivel' },
    { id: 'civ_education', name: 'Campus Federal de Capacitación', desc: 'Formación técnica para colonos de la frontera.', baseCost: { crystal: 14000, influence: 30 }, bonusText: '+10% Eficiencia de Mano de Obra por nivel' },
    { id: 'civ_welfare', name: 'Garantía Federal de Bienestar', desc: 'Distribución básica de bienes y subsidios a familias.', baseCost: { metal: 10000, crystal: 10000 }, bonusText: '+15% Felicidad y Orden Civil por nivel' }
  ],
  diplomacy: [
    { id: 'dip_embassy_net', name: 'Red de Cancillerías Interestelares', desc: 'Sedes permanentes en las capitales de facciones aliadas.', baseCost: { crystal: 10000, influence: 35 }, bonusText: '+15% Reputación con Facciones por nivel' },
    { id: 'dip_trade_pacts', name: 'Tratados Arancelarios Mutuos', desc: 'Exención impositiva en puertos y mercados neutrales.', baseCost: { metal: 15000, crystal: 10000 }, bonusText: '+12% Ganancias en Rutas Diplomáticas por nivel' },
    { id: 'dip_cultural_exch', name: 'Intercambio Académico Interestelar', desc: 'Becas de estudio conjuntas entre imperios y especies.', baseCost: { crystal: 14000, influence: 25 }, bonusText: '+10% Velocidad de Acuerdos por nivel' },
    { id: 'dip_federation', name: 'Pactos de Defensa Compartida', desc: 'Protocolos de asistencia mutua ante incursiones piratas o hostiles.', baseCost: { metal: 20000, influence: 50 }, bonusText: '+20% Fuerza de Alianzas por nivel' }
  ],
  finance: [
    { id: 'fin_central_bank', name: 'Encaje Bancario Fraccionario', desc: 'Regula coeficientes de liquidez y créditos para inversión colonial.', baseCost: { metal: 12000, crystal: 10000 }, bonusText: '+15% Créditos generados por nivel' },
    { id: 'fin_interest_yield', name: 'Cuentas de Rendimiento Cuántico', desc: 'Rendimiento pasivo continuo sobre los créditos en tesorería.', baseCost: { crystal: 15000, deuterium: 8000 }, bonusText: '+2.5% Interés pasivo por ciclo por nivel' },
    { id: 'fin_anti_inflation', name: 'Estabilizadores Antidevaluación', desc: 'Deflación controlada y subsidio al spread de la Lonja.', baseCost: { metal: 18000, crystal: 14000 }, bonusText: '-10% Comisiones de Mercado por nivel' },
    { id: 'fin_sovereign_bond', name: 'Bonos del Tesoro Interestelar', desc: 'Emisión de deuda federal soberana respaldada por colonias.', baseCost: { metal: 25000, influence: 40 }, bonusText: '+20% Capacidad de Endeudamiento y Créditos por nivel' }
  ]
};
