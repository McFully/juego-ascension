export const FACTIONS = {
  human: {
    name: 'República Nova',
    race: 'Humanos',
    color: 'cyan',
    bgColor: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300',
    icon: '👥',
    techStyle: 'Industrial y adaptable',
    lore: 'Una facción humana democrática nacida de las cenizas de la vieja Tierra. Su adaptabilidad e ingenio científico les permite investigar un 10% más rápido.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.10, resistance: 1.0 }
  },
  cyborg: {
    name: 'Dominion Xelar',
    race: 'Cyborgs',
    color: 'purple',
    bgColor: 'bg-purple-500/10 border-purple-500/40 text-purple-300',
    icon: '🦾',
    techStyle: 'Cibernética avanzada',
    lore: 'Seres fusionados con tecnología. Buscan la perfección cibernética, otorgándoles un 10% más de ataque militar y un 10% de resistencia estructural.',
    bonuses: { attack: 1.10, defense: 1.0, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.0, research: 1.05, resistance: 1.10 }
  },
  synth: {
    name: 'Colectivo Zenith',
    race: 'IA Sintéticas',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
    icon: '🤖',
    techStyle: 'Redes neuronales cuánticas',
    lore: 'Una colmena digital autoconsciente. Optimizan la producción en un 10% y los reactores energéticos rinden un 15% más.',
    bonuses: { attack: 1.0, defense: 1.0, production: 1.10, energy: 1.15, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.0 }
  },
  draconian: {
    name: 'Imperio Draconiano',
    race: 'Draconianos',
    color: 'red',
    bgColor: 'bg-red-500/10 border-red-500/40 text-red-300',
    icon: '🐲',
    techStyle: 'Balística pesada y asalto',
    lore: 'Una raza guerrera y belicosa orientada a la conquista física. Obtienen un 15% de bonificación al ataque aéreo y terrestre.',
    bonuses: { attack: 1.15, defense: 1.10, production: 0.95, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.0, resistance: 1.10 }
  },
  helios: {
    name: 'Confederación Helios',
    race: 'Helianos',
    color: 'amber',
    bgColor: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    icon: '☀️',
    techStyle: 'Propulsión termonuclear solar',
    lore: 'Adoradores de las estrellas que dominan la energía solar. Sus motores viajan un 5% más rápido y producen un 10% más de energía solar.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.10, speed: 1.05, espionage: 1.0, research: 1.0, resistance: 1.0 }
  },
  solaris: {
    name: 'Imperio Solaris',
    race: 'Solarios',
    color: 'yellow',
    bgColor: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300',
    icon: '👑',
    techStyle: 'Reactores estelares puros',
    lore: 'Descendientes de civilizaciones de plasma. Generan un 20% más de energía pero sus sensores de espionaje sufren un 5% de penalización.',
    bonuses: { attack: 1.05, defense: 1.05, production: 1.0, energy: 1.20, speed: 1.0, espionage: 0.95, research: 1.05, resistance: 1.0 }
  },
  drakon: {
    name: 'Soberanía Drakon',
    race: 'Drakonianos Supremos',
    color: 'rose',
    bgColor: 'bg-rose-500/10 border-rose-500/40 text-rose-300',
    icon: '⚔️',
    techStyle: 'Plasma pesado y blindajes',
    lore: 'Una facción de reptiles modificados genéticamente para resistir cualquier tormenta cósmica. Su defensa estructural es 15% superior.',
    bonuses: { attack: 1.10, defense: 1.15, production: 1.0, energy: 0.95, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.10 }
  },
  vortex: {
    name: 'Cábala Vortex',
    race: 'Vacíos',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
    icon: '🌀',
    techStyle: 'Motores hiperespaciales de vacío',
    lore: 'Una misteriosa orden que habita en las fisuras hiperespaciales. Su velocidad de flota es 15% mayor y el espionaje aumenta 20%.',
    bonuses: { attack: 1.05, defense: 1.0, production: 1.0, energy: 1.0, speed: 1.15, espionage: 1.20, research: 1.0, resistance: 0.95 }
  },
  umbra: {
    name: 'Protectorado Umbra',
    race: 'Sorgs de Sombra',
    color: 'slate',
    bgColor: 'bg-slate-500/10 border-slate-500/40 text-slate-300',
    icon: '🖤',
    techStyle: 'Nanoestructuras oscuras',
    lore: 'Una sociedad que vive en la oscuridad profunda del espacio. Sus naves tienen un 15% más de resistencia y 15% de espionaje.',
    bonuses: { attack: 1.0, defense: 1.10, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.15, research: 1.0, resistance: 1.15 }
  }
};

