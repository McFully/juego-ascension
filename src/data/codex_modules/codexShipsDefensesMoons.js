export const CODEX_SHIPS_DEFENSES_MOONS = {
  smallCargo: {
    name: "Carguera Pequeña",
    lore: "Nave de transporte ligera diseñada para rutas comerciales rápidas.",
    stats: "Carga: 5,000 | Velocidad: 5,000 | Consumo: 20/h",
    usage: "Ideal para saquear recursos y misiones de transporte menores.",
  },
  largeCargo: {
    name: "Carguera Grande",
    lore: "El pilar del comercio imperial. Inmensas bodegas protegidas por blindaje medio.",
    stats: "Carga: 25,000 | Velocidad: 7,500 | Consumo: 50/h",
    usage: "Transporte masivo de recursos entre colonias.",
  },
  heavyFreighter: {
    name: "Mega-Carguero Pesado",
    lore: "Coloso logístico con motores de hiperespacio para transportar suministros industriales a través de las estrellas.",
    stats: "Carga: 120,000 | Velocidad: 6,000 | Consumo: 150/h",
    usage: "Vaciado de depósitos mineros y grandes rutas comerciales de abastecimiento.",
  },
  cargoTitan: {
    name: "Titán de Carga Estelar",
    lore: "El leviatán mercantil definitivo. Una megaestructura móvil con bahías de carga presurizadas de escala continental.",
    stats: "Carga: 500,000 | Velocidad: 4,500 | Consumo: 500/h",
    usage: "Operaciones de transporte estratégico masivo y abastecimiento de megaestructuras.",
  },
  // --- CAZADORES LIGEROS (3 TIERS) ---
  atmosphericInterceptor: {
    name: "Interceptor Suborbital",
    lore: "Interceptor de bajo coste con motor de combustión. Diseñado para defensa planetaria y patrullas de reconocimiento dentro del sistema solar.",
    stats: "Ataque: 35 | Escudo: 5 | Integridad: 280 | Velocidad: 11,000 | Alcance: Sistema",
    usage: "Defensa barata de sistema local y patrulla de órbitas cercanas.",
  },
  lightFighter: {
    name: "Cazador Ligero",
    lore: "Una nave monoplaza ágil diseñada para interceptar sondas y escoltar cargueros. Barata de producir y rápida con motor de impulso.",
    stats: "Ataque: 50 | Escudo: 10 | Integridad: 400 | Velocidad: 12,500 | Alcance: Galaxia",
    usage: "Carne de cañón ideal para absorber fuego enemigo y escolta básica.",
  },
  quantumFighter: {
    name: "Cazador de Salto Cuántico",
    lore: "Caza de asalto estelar avanzado con micro-núcleo hiperespacial capaz de ejecutar saltos entre cúmulos y galaxias distantes.",
    stats: "Ataque: 90 | Escudo: 20 | Integridad: 650 | Velocidad: 18,000 | Alcance: Universo",
    usage: "Incursiones rápidas intergalácticas y ataque quirúrgico a convoyes enemigos.",
  },

  // --- CAZADORES PESADOS (3 TIERS) ---
  systemGunship: {
    name: "Gunship de Fisión",
    lore: "Cañonera fuertemente blindada con propulsión química y cañones balísticos pesados para defensa de lunas y bases en el sistema solar.",
    stats: "Ataque: 110 | Escudo: 15 | Integridad: 750 | Velocidad: 8,000 | Alcance: Sistema",
    usage: "Combate posicional pesado y control de sector local.",
  },
  heavyFighter: {
    name: "Cazador Pesado",
    lore: "Blindaje reforzado y cañones de iones impulsados por motor iónico. Diseñado para enfrentarse a naves de su misma clase y sobrevivir.",
    stats: "Ataque: 150 | Escudo: 25 | Integridad: 1,000 | Velocidad: 10,000 | Alcance: Galaxia",
    usage: "Excelente contra cazadores ligeros y defensas básicas en toda la galaxia.",
  },
  hyperHeavyFighter: {
    name: "Interceptor Hiperespacial Pesado",
    lore: "Aparato de combate de largo radio equipado con salto hiperespacial, propulsores vectoriales y baterías de iones de alta cadencia.",
    stats: "Ataque: 260 | Escudo: 60 | Integridad: 1,700 | Velocidad: 14,000 | Alcance: Universo",
    usage: "Escolta pesada de flotas de batalla intergalácticas y caza de destructores.",
  },

  // --- NAVES DE LÍNEA Y BATALLA (3 TIERS) ---
  systemCruiser: {
    name: "Crucero de Guardia de Sistema",
    lore: "Plataforma blindada de defensa de sector, motorizada por propulsión convencional con baterías masivas de proyectiles para el sistema local.",
    stats: "Ataque: 280 | Escudo: 40 | Integridad: 2,000 | Velocidad: 9,000 | Alcance: Sistema",
    usage: "Baluarte móvil para neutralizar cazas y bombardeos en órbita local.",
  },
  cruiser: {
    name: "Crucero",
    lore: "El depredador de cazadores. Equipado con propulsión de impulso y sistemas de apuntado rápido para diezmar flotas pequeñas.",
    stats: "Ataque: 400 | Escudo: 50 | Integridad: 2,700 | Velocidad: 15,000 | Alcance: Galaxia",
    usage: "Eficacia extrema contra cazadores ligeros (Rapid Fire) en toda la galaxia.",
  },
  battleship: {
    name: "Nave de Batalla",
    lore: "La columna vertebral de la flota de combate. Gran potencia de fuego, salto hiperespacial y blindaje pesado.",
    stats: "Ataque: 1,000 | Escudo: 200 | Integridad: 6,000 | Velocidad: 10,000 | Alcance: Universo",
    usage: "Dominancia en batallas campales contra otras flotas pesadas en cualquier cuadrante.",
  },
  dreadnought: {
    name: "Acorazado Dreadnought",
    lore: "Fortaleza móvil intergaláctica armada con cañones cinéticos titánicos y escudos multilaminares para arrasar flotas y estaciones enteras.",
    stats: "Ataque: 2,200 | Escudo: 600 | Integridad: 14,000 | Velocidad: 7,500 | Alcance: Universo",
    usage: "Supernave de choque capaz de quebrar las líneas más fortificadas del universo.",
  },
  bomber: {
    name: "Bombardero",
    lore: "Especializado en la destrucción de defensas planetarias mediante bombardeo de precisión.",
    stats: "Ataque: 1,000 | Escudo: 500 | Integridad: 7,500 | Velocidad: 4,000",
    usage: "Eficacia extrema contra láseres y cañones gauss.",
  },
  destroyer: {
    name: "Destructor",
    lore: "Nave de asalto pesado diseñada para aniquilar naves de batalla y cruceros enemigos.",
    stats: "Ataque: 2,000 | Escudo: 500 | Integridad: 11,000 | Velocidad: 5,000",
    usage: "La fuerza bruta de la flota.",
  },
  deathstar: {
    name: "Estrella de la Muerte",
    lore: "Una estación de combate del tamaño de una luna pequeña. Capaz de destruir planetas enteros.",
    stats: "Ataque: 200,000 | Escudo: 50,000 | Integridad: 9,000,000 | Velocidad: 100",
    usage: "El arma definitiva. Lenta pero virtualmente indestructible para flotas pequeñas.",
  },
  planetDestroyer: {
    name: "Planeta Destructor",
    lore: "Una colosal superestructura móvil armada con emisores de plasma concentrado diseñados para fracturar la corteza planetaria y desintegrar objetivos de tamaño continental.",
    stats: "Ataque: 500,000 | Escudo: 100,000 | Integridad: 2,500,000 | Velocidad: 50 | Fuego rápido devastador",
    usage: "Desplegada exclusivamente para pulverizar planetas hostiles y quebrar la resistencia de fortalezas enemigas.",
  },
  orbitalProbe: {
    name: "Sonda Suborbital",
    lore: "Sonda fotográfica y radiométrica de corto alcance diseñada para cartografiar órbitas adyacentes inmediatas dentro de tu propio sistema solar.",
    stats: "Ataque: 0 | Escudo: 0 | Integridad: 1 | Velocidad: 50,000",
    usage: "Mapeo inicial de órbitas locales y monitorización de cuerpos celestes cercanos.",
  },
  systemProbe: {
    name: "Sonda Interplanetaria",
    lore: "Sonda científica de largo recorrido capaz de penetrar la niebla orbital de cualquier posición de tu estrella natal.",
    stats: "Ataque: 0 | Escudo: 0 | Integridad: 2 | Velocidad: 100,000",
    usage: "Exploración de posiciones desconocidas dentro del sistema solar.",
  },
  espionageProbe: {
    name: "Sonda de Espionaje",
    lore: "Sondas diminutas no tripuladas dotadas de propulsores hiperrápidos y sensores de amplio espectro.",
    stats: "Ataque: 0 | Escudo: 0 | Integridad: 5 | Velocidad: Extremadamente alta",
    usage: "Enviadas para recolectar informes detallados de tecnologías y recursos en otros planetas.",
  },
  deepSpaceProbe: {
    name: "Sonda Cuántica de Espacio Profundo",
    lore: "Explorador autónomo con sensores cuánticos. Disipa la niebla de sectores estelares desconocidos y sondea nuevas galaxias.",
    stats: "Ataque: 0 | Escudo: 10 | Integridad: 20 | Velocidad: Ultra-rápida (5e8)",
    usage: "Exploración intergaláctica remota y disipación de niebla cósmica profunda.",
  },
  localColonizer: {
    name: "Arca Colonial de Proximidad",
    lore: "Arca colonial básica con motor químico de combustión. Diseñada para establecer cabezas de puente en mundos dentro del sistema solar de origen.",
    stats: "Hull: 12,000 | Carga: 3,000 | Velocidad: 2,000 | Alcance: Sistema",
    usage: "Consumible para fundar colonias tempranas en el mismo sistema solar.",
  },
  colonizer: {
    name: "Colonizador",
    lore: "Inmensas naves de transporte dotadas de impulso iónico adaptadas para albergar cúpulas habitacionales y maquinaria de fundición inicial en cualquier sistema del sector.",
    stats: "Hull: 30,000 | Carga: 7,500 | Velocidad: 2,500 | Alcance: Galaxia",
    usage: "Enviada a posiciones vacías de la galaxia para fundar una nueva colonia imperial.",
  },
  hyperColonizer: {
    name: "Arca Hiperespacial de Conquista",
    lore: "Superarca de colonización intergaláctica dotada de hiper-motores y soporte biológico autosuficiente para cruzar el vacío cósmico entre galaxias.",
    stats: "Hull: 75,000 | Carga: 25,000 | Velocidad: 3,500 | Alcance: Universo",
    usage: "Colonización de mundos lejanos en otras galaxias con mayor dotación de recursos de arranque.",
  },
  commercialColonizer: {
    name: "Arca Mercantil",
    lore: "El ápice de la ingeniería naval comercial. Un leviatán orbital con hiper-aleaciones cuyo coste supera en 1.000 veces a un colonizador común.",
    stats: "Coste: 10M Metal, 20M Cristal, 10M Deuterio | Hull: 2.500.000 | Carga: 500.000 | Propulsión Hiperespacio",
    usage: "Se despliega para fundar el único Planeta Lonja / Exchange por galaxia, creando un hub comercial con terminales AMM, parking logístico y gobernanza DAO.",
  },
  terraformerShip: {
    name: "Nave Terraformatriz",
    lore: "Laboratorio orbital autónomo equipado con reactores bio-climáticos e inductores de atmósfera para transformar la biosfera planetaria.",
    stats: "Casco: 50,000 | Escudo: 500 | Carga: 15,000 | Velocidad: 2,000",
    usage: "Necesaria en órbita para iniciar y mantener proyectos de terraformación ecológica y geológica.",
  },
  recycler: {
    name: "Reciclador",
    lore: "Cargueros pesados modificados con brazos magnéticos y trituradoras moleculares para recolectar escombros.",
    stats: "Carga: 20,000 | Velocidad: Lenta | Diseñado para recolectar metal y cristal flotante en el espacio.",
    usage: "Enviar a órbitas planetarias destruidas tras batallas espaciales para saquear materias primas.",
  },
  interplanetaryMissile: {
    name: "Misil Interplanetario",
    lore: "Misiles nucleares pesados de largo alcance diseñados para arrasar defensas enemigas de forma remota.",
    stats: "Ataque directo no interceptable por naves convencionales. Ataque: 12,000",
    usage: "Lanzar desde el Silo de Misiles contra planetas hostiles para despejar defensas terrestres antes del ataque.",
  },
  antiBallisticMissile: {
    name: "Misil Antibalístico",
    lore: "Sistemas de intercepción automáticos que destruyen ojivas termonucleares en órbita alta.",
    stats: "Defensa pasiva del Silo de Misiles contra misiles interplanetarios.",
    usage: "Se consume automáticamente para repeler ataques de misiles enemigos.",
  },

  // ==================== DEFENSAS ====================
  rocketLauncher: {
    name: "Lanzamisiles",
    lore: "Baterías de misiles de corto alcance. Baratas y fáciles de desplegar en masa.",
    stats: "Ataque: 80 | Escudo: 20 | Integridad: 200",
    usage: "Defensa básica ideal como escudo para artillería pesada.",
  },
  lightLaser: {
    name: "Láser Ligero",
    lore: "Haces de luz coherente para interceptar naves ligeras con gran precisión.",
    stats: "Ataque: 100 | Escudo: 25 | Integridad: 200",
    usage: "Efectivo contra cazadores ligeros.",
  },
  heavyLaser: {
    name: "Láser Pesado",
    lore: "Versión amplificada del láser ligero capaz de perforar blindajes de cruceros.",
    stats: "Ataque: 250 | Escudo: 100 | Integridad: 800",
    usage: "Buen equilibrio entre coste y potencia de fuego.",
  },
  gaussCannon: {
    name: "Cañón Gauss",
    lore: "Aceleradores electromagnéticos que disparan proyectiles de tungsteno a velocidades hipersónicas.",
    stats: "Ataque: 1,100 | Escudo: 200 | Integridad: 3,500",
    usage: "Artillería pesada contra naves de batalla.",
  },
  ionCannon: {
    name: "Cañón de Iones",
    lore: "Dispara flujos de partículas que sobrecargan los escudos enemigos sin dañar el casco directamente.",
    stats: "Ataque: 150 | Escudo: 500 | Integridad: 800",
    usage: "Excelente para neutralizar escudos de naves pesadas.",
  },
  plasmaTurret: {
    name: "Cañón de Plasma",
    lore: "El arma defensiva más potente. Dispara esferas de materia ionizada que funden cualquier aleación.",
    stats: "Ataque: 3,000 | Escudo: 300 | Integridad: 10,000",
    usage: "Máximo poder defensivo galáctico.",
  },
  smallShieldDome: {
    name: "Cúpula Pequeña de Escudo",
    lore: "Generador de campos deflectores esféricos proyectados sobre todas las defensas terrestres.",
    stats: "Escudo masivo planetario. Ataque: 1 | Escudo: 2,000 | Integridad: 2,000 | Límite: 1 por planeta",
    usage: "Crucial para repeler ataques menores sin sufrir daños colaterales.",
  },
  largeShieldDome: {
    name: "Cúpula Grande de Escudo",
    lore: "Supergenerador de distorsión electromagnética capaz de desviar bombardeos orbitales destructores.",
    stats: "Escudo supremo planetario. Ataque: 1 | Escudo: 10,000 | Integridad: 10,000 | Límite: 1 por planeta",
    usage: "Tu máxima protección pasiva contra acorazados invasores.",
  },

  // ==================== LUNARES ====================
  lunarBase: {
    name: "Base Lunar",
    lore: "La primera infraestructura necesaria en cualquier satélite. Proporciona soporte vital y energía básica para futuras expansiones.",
    stats: "Permite la construcción de otros edificios en la luna.",
    usage: "El corazón de tu puesto avanzado lunar.",
  },
  sensorPhalanx: {
    name: "Sensor Phalanx",
    lore: "Una red masiva de sensores capaces de detectar flotas moviéndose a través del hiperespacio en sistemas lejanos.",
    stats: "Permite escanear flotas en vuelo de otros jugadores y facciones IA.",
    usage: "Herramienta de inteligencia estratégica suprema.",
  },
  jumpGate: {
    name: "Puerta de Salto",
    lore: "Un portal de curvatura espacio-temporal que permite el tránsito instantáneo de flotas entre colonias lejanas.",
    stats: "Transfiere flotas sin tiempo de viaje ni consumo de deuterio entre lunas con puertas activas.",
    usage: "Logística instantánea y despliegue rápido de defensa.",
  },
  moonStorage: {
    name: "Depósito Lunar",
    lore: "Instalaciones de almacenamiento de recursos diseñadas para el entorno de baja gravedad de la luna.",
    stats: "Aumenta la capacidad de recursos en la luna.",
    usage: "Necesario para acumular recursos para construcciones lunares caras.",
  },
};
