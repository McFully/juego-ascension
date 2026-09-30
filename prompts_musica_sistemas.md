# Guía Maestra de Prompts Musicales para Sistemas y Apartados de Juego - Ascensión

Documento de referencia para la generación de la banda sonora inmersiva, sobria e identificativa para todos los **sistemas y subsistemas principales del juego** (exteriores a los ministerios).

Cada pista ha sido diseñada siguiendo la filosofía sonoro-espacial de **Ascensión**: música ambiental, reflexiva, sin melodías estridentes ni voces, pensada para largas sesiones de estrategia profunda y concentración táctica.

---

## 📌 Protocolo de Nombres e Integración

1. **Formato preferido:** `.ogg` (o `.mp3` de alta fidelidad, mínimo 192 kbps).
2. **Duración recomendada:** Loops de 2 a 3 minutos con fundido de entrada y salida suave.
3. **Ubicación en runtime:** `public/audio/systems/` (o raíz para migración asistida).
4. **Comportamiento en UI:**
   - La música debe fundirse suavemente (crossfade de 1.5 a 2 segundos) al navegar entre las áreas mayores.
   - Si un subsistema pertenece a un área padre (por ejemplo, *Subastas de Naves Usadas* dentro del *Mercado Galáctico*), comparte la atmósfera base o introduce una variante más íntima.

---

## 🌌 Tabla Maestra de Sistemas y Áreas del Juego

| ID Sistema / Apartado | Vista / Componente | Nombre de Archivo | Identidad Sonora Clave |
| :--- | :--- | :--- | :--- |
| `galaxy_map` | Carta Estelar / Galaxia (`GalaxyPage.jsx`) | `musica-sistema-galaxia.ogg` | Vacío cósmico abisal, reverberación estelar infinita, coros de nebulosa sintetizados y soledad interestelar. |
| `colonies_network` | Red de Colonias (`ColonyNetworkPage.jsx`) | `musica-sistema-colonias.ogg` | Telemetría orbital coordinada, pulsos de radio comunicativa y sensación de red planetaria unificada. |
| `planet_surface` | Vista Planetaria / Terraforming (`LivingPlanetPanel.jsx`) | `musica-sistema-planeta.ogg` | Vientos de biósfera alienígena, pulsos geológicos tenues y resonancia de asentamiento fronterizo. |
| `fleet_command` | Mando de Flotas y Rutas (`FleetPage.jsx`) | `musica-sistema-flota.ogg` | Radar táctico rítmico, tensión de puente de mando, motores de crucero subatómicos y marcha espacial contenida. |
| `shipyard_hangar` | Astillero y Construcción Naval (`ShipyardPage.jsx`) | `musica-sistema-astillero.ogg` | Chispas de soldadura de plasma, ensamblaje de cascos colosales, percusión pesada y eco de hangar vacío. |
| `ship_design` | Diseño y Modularización (`ShipDesignPage.jsx`) | `musica-sistema-diseno-naves.ogg` | Enfoque de ingeniería pura, clicks de simulación CAD, frecuencias de laboratorio y arpegios analíticos. |
| `tactical_combat` | Pantalla de Combate Táctico (`CombatPage.jsx`) | `musica-sistema-combate.ogg` | Pulso cardíaco de alarma roja, percusión militar pesada, cuernos de guerra electrónicos y caos cinético distante. |
| `defense_grid` | Red de Escudos y Defensas (`DefensePage.jsx`) | `musica-sistema-defensas.ogg` | Generadores de escudo zumbando, cúpula de energía resonante, estática protectora y centinelas automatizados. |
| `missile_silos` | Silos de Misiles y Defensas Pesadas (`MissilesPage.jsx`) | `musica-sistema-misiles.ogg` | Tensión de cuenta regresiva, compuertas hidráulicas masivas, sirena apagada y contención nuclear. |
| `research_lab` | Laboratorio de I+D (`ResearchPage.jsx` / `TechTreePage.jsx`) | `musica-sistema-investigacion.ogg` | Partículas cuánticas en colisión, gotas de resonancia armónica, serenidad científica y descubrimiento abstracto. |
| `galactic_market` | Mercado y Bolsa Galáctica (`GalacticMarketPage.jsx`) | `musica-sistema-mercado.ogg` | Murmullo de estación comercial espacial, teletipos holográficos, acordes rítmicos downtempo y bullicio cosmopolita. |
| `black_market` | Mercado Negro y Bazares (`BlackMarketView.jsx`) | `musica-sistema-mercado-negro.ogg` | Humo digital, acordes menores oscuros, contrabando en callejones de titanio, estática analógica y peligro sutil. |
| `diplomacy_room` | Salón Diplomático y Tratados (`DiplomacyPage.jsx`) | `musica-sistema-diplomacia.ogg` | Cuarteto orquestal ceremonial, pads nobles solemnes, acústica de mármol y tensión contenida entre imperios. |
| `comms_listening` | Matriz de Escucha y Espionaje (`CommunicationsPage.jsx`) | `musica-sistema-comunicaciones.ogg` | Frecuencias de radio de onda corta, señales de satélites descompuestas, decodificación y susurros de estática. |
| `missions_dossier` | Sala de Operaciones y Misiones (`MissionsPage.jsx`) | `musica-sistema-misiones.ogg` | Briefing militar de inteligencia, ritmo metronómico sigiloso, cuerdas oscuras y planificación confidencial. |
| `lunar_base` | Puesto Avanzado Lunar (`MoonPage.jsx`) | `musica-sistema-luna.ogg` | Silencio de baja gravedad, polvo gris, ecos de domos presurizados y fragilidad en el vacío. |
| `endgame_ascension` | Proyecto Ascensión Cósmica (`NarrativeEventOverlay.jsx`) | `musica-sistema-ascension.ogg` | Trascendencia metafísica, órgano cósmico reverberado, arpas de luz cuántica y consumación del destino imperial. |
| `aftermath_stats` | Replay y Archivo Histórico (`ReplayPage.jsx` / `StatsPage.jsx`) | `musica-sistema-archivo-stats.ogg` | Melancolía reflexiva, piano austero con eco espacial, contemplación de conquistas pasadas y memoria cósmica. |

---

## 🎼 Prompts Detallados para IA Musical (Suno, Udio, Google Flow)

---

### 01. Mapa Galáctico / Carta Estelar (`galaxy_map`)
- **Archivo:** `musica-sistema-galaxia.ogg`
- **Sensación:** La inmensidad sobrecogedora de miles de estrellas desconocidas.

```text
Deep space ambient, vast celestial reverb, cosmic emptiness, slow evolving drone, faint high-pitched nebula choir synth, mysterious sub-bass rumble, lonely and contemplative, 60 BPM, warm analog pads, sci-fi grand strategy exploration, pure instrumental, no beat, no vocals
```

---

### 02. Red de Colonias y Asentamientos (`colonies_network`)
- **Archivo:** `musica-sistema-colonias.ogg`
- **Sensación:** Un imperio de mundos interconectados por rutas logísticas y satélites.

```text
Orbital logistics ambient, steady pulse, soft electronic telemetry beeps, gentle warm synthesizer chords, atmospheric radio carrier signals, slow rhythmic cadence 75 BPM, structured, optimistic and sprawling empire administration, pure instrumental, no vocals
```

---

### 03. Superficie Planetaria y Terraformación (`planet_surface`)
- **Archivo:** `musica-sistema-planeta.ogg`
- **Sensación:** Mirar hacia el horizonte de un mundo hostil mientras las máquinas alteran su atmósfera.

```text
Atmospheric sci-fi soundscape, planetary wind drones, distant bio-resonant frequencies, tectonic subterranean hum, delicate alien synth chimes, slow 65 BPM, feeling of terraforming and colonizing an untamed world, pure instrumental, ambient, no drums, no vocals
```

---

### 04. Mando de Flota y Control Táctico (`fleet_command`)
- **Archivo:** `musica-sistema-flota.ogg`
- **Sensación:** El puente de mando acorazado de una nave insignia surcando el hiperespacio.

```text
Naval space fleet command theme, low mechanical sub-bass drone, rhythmic sonar ping at 80 BPM, muted militaristic electronic pulse, disciplined dark synth bassline, cold tactical tension, authoritative and resolute, cinematic sci-fi bridge ambiance, pure instrumental, no vocals
```

---

### 05. Astillero Orbital y Diques Secos (`shipyard_hangar`)
- **Archivo:** `musica-sistema-astillero.ogg`
- **Sensación:** Enormes naves de guerra siendo forjadas entre chispas de soldadura y grúas magnéticas.

```text
Heavy industrial ambient, cavernous spaceship shipyard reverberation, distant hydraulic hammer strikes, plasma torch crackle, metallic resonance of hollow dreadnought hulls, slow rhythmic 70 BPM mechanical pulse, imposing manufacturing scale, dark synth textures, pure instrumental, no vocals
```

---

### 06. Laboratorio de Diseño de Naves (`ship_design`)
- **Archivo:** `musica-sistema-diseno-naves.ogg`
- **Sensación:** Cálculos balísticos, optimización de escudos y planos holográficos.

```text
Analytical precision ambient, intricate modular synthesizer sequences, sterile laboratory tone, subtle electronic glitches, clean sub-bass foundation, crisp 85 BPM downtempo cadence, scientific focus and blueprint schematic ambiance, pure instrumental, no vocals
```

---

### 07. Combate Táctico Espacial (`tactical_combat`)
- **Archivo:** `musica-sistema-combate.ogg`
- **Sensación:** Alarma de batalla, andanadas de cañones cinéticos y maniobras evasivas críticas.

```text
Tense sci-fi combat underscore, heavy muted war drums, accelerating electronic pulse 110 BPM, low menacing brass drones, urgent synthesizer ostinato, red alert battle ambiance, disciplined kinetic dread, high tactical stakes, pure instrumental, no electric guitar, no vocals
```

---

### 08. Red de Escudos y Defensa Planetaria (`defense_grid`)
- **Archivo:** `musica-sistema-defensas.ogg`
- **Sensación:** Una fortaleza impenetrable; barreras magnéticas zumbando en la estratosfera.

```text
Energy shield grid hum, massive 50Hz electromagnetic oscillation, static electricity textures, resolute low brass pads, defensive posture, deliberate 72 BPM drone pulse, stoic sentinel standing guard against bombardment, pure instrumental, dark ambient, no vocals
```

---

### 09. Silos de Misiles y Armamento Pesado (`missile_silos`)
- **Archivo:** `musica-sistema-misiles.ogg`
- **Sensación:** Llaves de lanzamiento, silos de titanio abriéndose bajo la nieve y disuasión final.

```text
Cold war countdown tension in deep space, low sustained bass drone, subtle ticking metallic clockwork, muffled subterranean klaxon echo, heavy hydraulic pressure sweep, ominous 68 BPM, apocalyptic deterrence readiness, pure instrumental, no vocals
```

---

### 10. Complejo de Investigación e I+D (`research_lab`)
- **Archivo:** `musica-sistema-investigacion.ogg`
- **Sensación:** Avances cuánticos, teoremas imposibles y luz azulada de reactores experimentales.

```text
Introspective science ambient, shimmering glass synth harmonics, subatomic particle pulse, crystal clear reverb, minimalist neo-classical synthesizer arpeggios, contemplative and serene discovery, 72 BPM, pure intellectual pursuit, instrumental, no vocals
```

---

### 11. Mercado y Bolsa Galáctica (`galactic_market`)
- **Archivo:** `musica-sistema-mercado.ogg`
- **Sensación:** Un puerto franco comercial colosal abarrotado de cargueros, holocarteles y créditos.

```text
Cosmopolitan space station market, warm electric Rhodes chords, subtle downtempo groove 84 BPM, futuristic bazaar ambiance, soft holographic ticker sweeps, sophisticated intergalactic commerce, lively yet understated, pure instrumental, no vocals
```

---

### 12. Mercado Negro y Bazares Subterráneos (`black_market`)
- **Archivo:** `musica-sistema-mercado-negro.ogg`
- **Sensación:** Callejones oscuros bajo los domos, tecnología prohibida y tratos encubiertos.

```text
Dark cyberpunk downtempo, smoky low-pass filtered synth chords, gritty analog vinyl crackle, subterranean reverb, elusive bassline, clandestine 80 BPM trip-hop rhythm, illicit back-alley trade and encrypted transactions, pure instrumental, no vocals
```

---

### 13. Salón Diplomático Imperial (`diplomacy_room`)
- **Archivo:** `musica-sistema-diplomacia.ogg`
- **Sensación:** Protocolos ceremoniales, embajadores extraterrestres y alianzas al filo de la navaja.

```text
Solemn diplomatic senate chamber, austere acoustic cello and violin swells, distant reverb of marble halls, delicate synthetic harp glissando, measured 66 BPM, aristocratic composure, profound political tension beneath polite courtesy, pure instrumental, no vocals
```

---

### 14. Matriz de Telecomunicaciones y Espionaje (`comms_listening`)
- **Archivo:** `musica-sistema-comunicaciones.ogg`
- **Sensación:** Antenas parabólicas rotando en el vacío, ondas de radio interceptadas y descifrado.

```text
Cryptographic listening post ambient, shortwave radio interference textures, sonar pulse, subtle morse-like digital rhythm, subterranean surveillance drone, mysterious 74 BPM, intercepting deep space transmissions in total stealth, pure instrumental, no vocals
```

---

### 15. Sala de Operaciones y Misiones (`missions_dossier`)
- **Archivo:** `musica-sistema-misiones.ogg`
- **Sensación:** El general revisando expedientes clasificados y asignando objetivos de alto secreto.

```text
Classified operations briefing theme, stealthy muted percussion 82 BPM, dark cinematic string textures, tension and calculated risk, covert operative ambiance, precise decision-making tone, austere and resolute, pure instrumental, no vocals
```

---

### 16. Puesto Avanzado Lunar (`lunar_base`)
- **Archivo:** `musica-sistema-luna.ogg`
- **Sensación:** Cráteres silenciosos, regolito gris bajo el cielo negro y la Tierra/Metrópolis en el cenit.

```text
Low-gravity lunar ambient, desolate silence, muffled dome ventilation pulse, ultra-slow synth pad evolving over minutes, soft crystalline chimes, fragile survival in airless vacuum, contemplative and austere 58 BPM, pure instrumental, no drums, no vocals
```

---

### 17. Proyecto Ascensión / Endgame Cósmico (`endgame_ascension`)
- **Archivo:** `musica-sistema-ascension.ogg`
- **Sensación:** La culminación del imperio: la civilización trascendiendo el plano físico hacia las estrellas eternas.

```text
Transcendental cosmic climax, grand pipe organ blended with ethereal synthesizer waves, ascending harmonic progression, cathedral reverb, mystical sense of awe and destiny fulfilled, uplifting yet solemn and eternal, 70 BPM, pure instrumental, no vocals
```

---

### 18. Archivo Histórico y Cronología (`aftermath_stats`)
- **Archivo:** `musica-sistema-archivo-stats.ogg`
- **Sensación:** Repasar los siglos de expansión, pérdidas de flotas y el legado imborrable del jugador.

```text
Nostalgic historical archive theme, solitary melancholic piano notes, warm room reverb, faint analog ambient drone in background, slow reflective 64 BPM, looking back at centuries of conquest and fallen stars, poignant and serene, pure instrumental, no vocals
```
