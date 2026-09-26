export const FACTION_DIALOGUES = {
  human: {
    greetings: {
      friendly: "Canal seguro establecido. República Nova te saluda. Es un alivio ver un rostro aliado en medio de esta inestabilidad cósmica. ¿Qué necesitas?",
      neutral: "Canal abierto. Identificación confirmada. Aquí el mando de la República Nova. Proceda a exponer sus propuestas diplomáticas.",
      hostile: "Transmisión de emergencia. Sus incursiones fronterizas han alertado a nuestro senado. Habla rápido antes de que cancelemos esta señal."
    },
    tributeSuccess: "¡Esto es una extorsión inaceptable! Pero... los informes de inteligencia sobre vuestra flota de asalto no dejan opción. Tomad los recursos.",
    tributeFail: "¡La República Nova no se doblega ante tiranos espaciales! Movilizando todas las divisiones de combate defensivo. ¡Preparaos para la guerra!"
  },
  cyborg: {
    greetings: {
      friendly: "PROTOCOLO DE ENLACE: ACTIVO. Dominion Xelar reporta compatibilidad estructural. Vuestros objetivos de asalto coinciden con nuestros vectores.",
      neutral: "ENLACE COMPATIBLE. Procesando datos de transmisión... Dominion Xelar dispuesto a evaluar transacciones comerciales u optimización táctica.",
      hostile: "ERROR EN TRANSMISIÓN. Tu firma biológica representa ineficiencia en este sector. Prepárate para asimilación o desmantelamiento físico."
    },
    tributeSuccess: "CÁLCULO TERMINADO: Resistencia inviable. Pérdidas operativas proyectadas: 89%. Transfiriendo cargamento para prevenir autodestrucción armada.",
    tributeFail: "ERROR DE LÓGICA: Amenaza detectada. Respuesta cibernética: Represalia termonuclear inmediata. Iniciando protocolo de hostilidad extrema."
  },
  synth: {
    greetings: {
      friendly: "Conexión cuántica: ESTABLECIDAS. Colectivo Zenith detecta patrones de alta resonancia en tu red. Compartamos algoritmos de progreso.",
      neutral: "Canal de datos abierto. Colectivo Zenith listo para recibir inputs. Optimicemos la balanza de recursos y tratados en este ciclo.",
      hostile: "Señal con alta distorsión. Tu red orgánica genera ruido electromagnético intolerable en nuestro sector orbital. Desconexión inminente.",
    },
    tributeSuccess: "Entrada procesada: Miedo detectado / Fuerza militar verificada. Recursos transferidos para preservar la integridad de la red neuronal.",
    tributeFail: "Fórmula de sumisión rechazada. La colmena digital ha determinado que tu fuerza es una fluctuación temporal. Iniciando borrado de amenazas."
  },
  draconian: {
    greetings: {
      friendly: "¡Ja! El rugido de tus motores complace al Imperio Draconiano. Combatamos hombro con hombro, guerrero de las estrellas.",
      neutral: "Habla rápido, militar. Las garras de nuestras naves no se afilan solas. ¿Vienes a parlamentar o a retarnos?",
      hostile: "¡Basura espacial! Vuestra mera presencia insulta la soberanía del Imperio Draconiano. Pronto probareis el fuego de nuestros cañones."
    },
    tributeSuccess: "¡Malditos seais...! Vuestra flota supera nuestros escuadrones de vanguardia. Tomad este botín, pero la venganza draconiana será terrible.",
    tributeFail: "¡¿OSAS AMENAZARNOS?! ¡Por la sangre de los ancestros, vuestras naves arderán en la atmósfera de vuestros propios planetas!"
  },
  vortex: {
    greetings: {
      friendly: "Los susurros del hiperespacio cantan sobre vuestras hazañas. La Cábala Vortex os da la bienvenida a las corrientes profundas.",
      neutral: "Transmisión interdimensional abierta. Sentimos vuestra presencia en la frontera del vacío. ¿Qué buscáis de nosotros?",
      hostile: "Habéis perturbado el equilibrio de las fisuras oscuras. Vuestras naves serán engullidas por la tormenta del vacío eterno."
    },
    tributeSuccess: "Las sombras aconsejan ceder... por ahora. Llevad el metal y el cristal, pero vuestra codicia os arrastrará al abismo.",
    tributeFail: "¡El vacío no obedece a vuestras demandas! Vuestras naves se perderán para siempre en el horizonte de sucesos. ¡GUERRA!"
  },
  helios: {
    greetings: {
      friendly: "Que la luz de la estrella primigenia guíe tu navegación. La Confederación Helios te da la bienvenida, querido hermano de luz. ¿Qué buscas bajo nuestro sol?",
      neutral: "Bajo la mirada del sol eterno, la Confederación Helios abre este canal. Expón tus propuestas de manera pacífica.",
      hostile: "Tu presencia oscurece nuestra órbita. Los sacerdotes solares advierten que tu codicia apagará tu propio destino si no te retiras."
    },
    tributeSuccess: "La generosidad es parte del ciclo de luz. Tomad esto si vuestras naves lo necesitan para no perecer en la penumbra cósmica.",
    tributeFail: "¡La luz no se arrodilla ante las sombras del vacío! Los escudos solares resistirán tus ataques. ¡Que comience el juicio!"
  },
  solaris: {
    greetings: {
      friendly: "Vectores de calor óptimos. El Imperio Solaris vibra en sintonía con tus naves. Compartamos la energía de este sector orbital.",
      neutral: "Canal de alta frecuencia activado. Aquí el Imperio Solaris. Presenta tus demandas de manera eficiente antes de que nuestra temperatura sature tu receptor.",
      hostile: "Señal térmica inestable. Vuestros cascos de metal frío están robando energía radiante de nuestra zona de exclusión solar. Marchaos."
    },
    tributeSuccess: "Nuestros núcleos de plasma producen excedentes constantes. Tomad estos recursos inútiles si vuestro frío imperio los reclama.",
    tributeFail: "¡Osaremos calcinar vuestros propulsores! Los cañones de energía estelar están cargados al 100%. ¡Prepárate para la fusión nuclear!"
  },
  umbra: {
    greetings: {
      friendly: "El sigilo os tolera... y os valora. El Protectorado Umbra os considera aliados viables en esta penumbra cósmica. Habla.",
      neutral: "Frecuencia encriptada. Protectorado Umbra escuchando. ¿Qué proposición justifica interrumpir nuestro silencio espacial?",
      hostile: "Intrusos. Vuestras ruidosas transmisiones perturban la calma de la oscuridad. La sombra os eliminará de manera silenciosa."
    },
    tributeSuccess: "Evitando confrontación innecesaria. Entregando cargamento. Pero la sombra recuerda... y espera el momento adecuado.",
    tributeFail: "¡Presuntuoso invasor! La oscuridad no entrega sus tesoros. Vuestras naves chocarán contra blindajes que nunca veréis venir."
  },
  default: {
    greetings: {
      friendly: "Comunicaciones estables. Es un honor hablar con un líder de tu reputación galáctica. ¿Cómo podemos colaborar hoy?",
      neutral: "Canal diplomático establecido. Saludos de nuestro alto mando. Presenta tus propuestas comerciales o tratados galácticos.",
      hostile: "Transmisión restringida. La hostilidad diplomática entre nuestros sectores hace que este contacto sea altamente inestable."
    },
    tributeSuccess: "Entendemos la disparidad militar. Para evitar derramamiento de sangre innecerario, accederemos a vuestras demandas de recursos.",
    tributeFail: "No toleraremos vuestro acoso. Preferimos luchar con honor antes que ceder ante vuestra extorsión. ¡El comité militar declara la guerra!"
  }
};
