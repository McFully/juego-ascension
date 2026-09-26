# Guía de Prompts Musicales para Ministerios - Ascensión

Documento de referencia para la generación de la banda sonora sobria e identificativa de las 18 sedes ministeriales completas de **Ascensión**.

Cada tema ha sido diseñado con una identidad sonora y tímbrica exclusiva: **con solo escuchar los primeros 5 segundos, el jugador puede identificar unívocamente a qué ministerio ha entrado**. Los prompts están optimizados para motores de IA generativa de audio instrumental (Google Flow Music, Suno, Udio, etc.).

---

## 📌 Protocolo de Nombres e Integración

1. Genera los archivos en formato `.ogg` (preferido) o `.mp3`.
2. Asigna exactamente el **Nombre de Archivo** especificado en la tabla.
3. Colócalos en la raíz del proyecto.
4. El sistema los moverá a `public/audio/ministries/` y gestionará las transiciones automáticas:
   - Al entrar a un ministerio, la música de menú/general se detiene y arranca en loop el tema del ministerio.
   - Al regresar al Distrito Federal o al Imperio, el tema del ministerio se detiene y vuelve a sonar la música de menú limpia y sin solapamiento.

---

## 🏛️ Tabla Maestra de los 18 Ministerios

| ID Ministerio | Nombre Oficial | Nombre de Archivo | Identidad Sonora Clave |
| :--- | :--- | :--- | :--- |
| `infra` | Ministerio de Infraestructuras | `musica-ministerio-infra.ogg` | Martilleo neumático sordo, sintetizadores modulares pesados y resonancia de vigas de acero. |
| `resources` | Ministerio de Minería y Recursos | `musica-ministerio-recursos.ogg` | Percusión tectónica profunda, chirridos geológicos de taladros lejanos y ecos cavernosos. |
| `industry` | Ministerio de Industria | `musica-ministerio-industria.ogg` | Cadencia rítmica de pistones mecánicos, vapor a presión, bajos electromagnéticos constantes y zumbido fabril. |
| `economy` | Ministerio de Economía | `musica-ministerio-economia.ogg` | Piano sobrio y frío, pulsos digitales de teletipo financiero y cuerdas neoclásicas calculadas. |
| `energy` | Ministerio de Energía | `musica-ministerio-energia.ogg` | Zumbido masivo de plasma 50Hz, armónicos de bobina Tesla y sintetizadores de sierra filtrada crepitante. |
| `science` | Ministerio de Ciencia | `musica-ministerio-ciencia.ogg` | Texturas de cristal, gotas cuánticas, frecuencias sinusoidales puras y arpegios matemáticos etéreos. |
| `innovation` | Ministerio de Innovación | `musica-ministerio-innovacion.ogg` | Arpegios rápidos de micro-sintetizadores, pulsos glitch sutiles y modulación digital inquieta. |
| `cybernetics` | Ministerio de Cibernética e IA | `musica-ministerio-cibernetica.ogg` | Drones de superordenador refrigerado, pulsos binarios implacables y texturas neuronales frías y oscilantes. |
| `defense` | Ministerio de Defensa | `musica-ministerio-defensa.ogg` | Redoble marcial amortiguado, metales graves imponentes, campanas de alarma graves y tensión de trinchera. |
| `war` | Ministerio de Guerra | `musica-ministerio-guerra.ogg` | Cuernos de guerra oscuros y solemnes, timbales orquestales contundentes y percusión de acero implacable. |
| `transport` | Ministerio de Transporte | `musica-ministerio-transporte.ogg` | Secuenciador rítmico continuo de alta velocidad tipo maglev, sweeps aerodinámicos y pads espaciales en movimiento. |
| `logistics` | Ministerio de Logística | `musica-ministerio-logistica.ogg` | Ritmo de metrónomo sincronizado, señales telemétricas moduladas y percusión de distribución eficiente. |
| `biosphere` | Ministerio de Biosfera y Ecología | `musica-ministerio-biosfera.ogg` | Drones orgánicos de respiración biofílica, sonidos de lluvia hidropónica, flautas sintetizadas y frecuencias cálidas de tierra fértil. |
| `agriculture` | Ministerio de Agricultura | `musica-ministerio-agricultura.ogg` | Ecos de invernaderos gigantes, bombeo de nutrientes líquidos, arpas de viento suaves y calidez biológica. |
| `civics` | Ministerio de Asuntos Civiles | `musica-ministerio-civiles.ogg` | Cuarteto de cuerdas sosegado, pulso cívico templado, campanas de orden civil y serenidad comunitaria. |
| `diplomacy` | Ministerio Diplomático | `musica-ministerio-diplomacia.ogg` | Viento madera ceremonial, arpegios de arpa espacial, acordes nobles de salón imperial y solemnidad senatorial. |
| `intel` | Ministerio de Inteligencia | `musica-ministerio-inteligencia.ogg` | Criptografía en audio, susurros de estática corta, bajos subacuáticos sigilosos y radar de sonar espectral. |
| `justice` | Ministerio de Justicia y Orden Federal | `musica-ministerio-justicia.ogg` | Toque de maza solemne, órgano tubular austero, violonchelo implacable y gravedad jurídica. |
| `culture` | Ministerio de Cultura y Propaganda | `musica-ministerio-cultura.ogg` | Marcha triunfal barroca futurista, metales brillantes reverberados, coros sintetizados y elegancia imperial. |

---

## 🎼 Prompts Detallados por Ministerio

### 01. Ministerio de Infraestructuras (`infra`)
- **Nombre de archivo:** `musica-ministerio-infra.ogg`
- **Atmósfera:** Andamiajes masivos, ensamblaje de vigas de titanio y robots constructores.

```text
Sober industrial ambient, rhythmic pneumatic percussion, heavy modular bassline, resonance of hollow steel beams, mechanical construction site cadence, steady mid-tempo 75 BPM, dark metallic reverberation, architectural grand scale, pure instrumental, no melody, no vocals
```

---

### 02. Ministerio de Minería y Recursos (`resources`)
- **Nombre de archivo:** `musica-ministerio-recursos.ogg`
- **Atmósfera:** Pozos profundos de extracción geológica, corte de roca pura y oscuridad subterránea.

```text
Deep sub-surface cavernous drone, low seismic rumble, rhythmic heavy hydraulic drills in distance, hollow stone acoustics, sparse metallic clangs, subterranean dark ambient, slow tempo 65 BPM, foreboding mineral extraction atmosphere, pure instrumental, no vocals
```

---

### 03. Ministerio de Industria (`industry`)
- **Nombre de archivo:** `musica-ministerio-industria.ogg`
- **Atmósfera:** Fábricas colosales, chimeneas moleculares, refinamiento de plasma y líneas automatizadas.

```text
Repetitive industrial clockwork, analog synth bass pulsating like heavy machinery pistons, steam valve release textures, hypnotic mechanical rhythm 85 BPM, relentless automated production line, gritty analog distortion, pure instrumental, no vocals
```

---

### 04. Ministerio de Economía (`economy`)
- **Nombre de archivo:** `musica-ministerio-economia.ogg`
- **Atmósfera:** Aranceles imperiales, cálculo exacto de créditos galácticos, cámaras acorazadas y frialdad contable.

```text
Austere bureaucratic neo-classical, minimalist solemn grand piano chords, subtle precise digital ticker clicks, low cello drone, cold calculated aristocratic diplomacy, strict rhythmic measure 70 BPM, spacious reverberation, intellectual and calculating, pure instrumental, no vocals
```

---

### 05. Ministerio de Energía (`energy`)
- **Nombre de archivo:** `musica-ministerio-energia.ogg`
- **Atmósfera:** Estabilizadores de reactores de fusión, campos electromagnéticos y contención de materia oscura.

```text
Massive 50Hz sub-bass transformer hum, high-voltage plasma crackle, swirling electrical synthesizer arpeggios, resonating harmonic Tesla coil swells, pulsing radioactive core power, steady hypnotic drone 80 BPM, intense electromagnetic soundscape, pure instrumental, no vocals
```

---

### 06. Ministerio de Ciencia (`science`)
- **Nombre de archivo:** `musica-ministerio-ciencia.ogg`
- **Atmósfera:** Ecuaciones de la Singularidad, motores de curvatura, laboratorio impoluto y física teórica.

```text
Crystalline ambient, pure sinusoidal sub frequencies, delicate glass harmonic chimes, generative modular synthesizer droplets, cerebral cosmic curiosity, wide stereo scientific observatory feeling, slow evolving texture 72 BPM, profound theoretical discovery, pure instrumental, no vocals
```

---

### 07. Ministerio de Innovación (`innovation`)
- **Nombre de archivo:** `musica-ministerio-innovacion.ogg`
- **Atmósfera:** Nanomáquinas en recombinación, prototipos cuánticos y patentes experimentales.

```text
Modern high-tech glitch ambient, micro-synthesizer polyrhythms, rapid electronic pulses, intricate clockwork modulation, bright inquisitive chord progressions, energetic clean digital design 90 BPM, forward-thinking laboratory atmosphere, pure instrumental, no vocals
```

---

### 08. Ministerio de Cibernética e IA (`cybernetics`)
- **Nombre de archivo:** `musica-ministerio-cibernetica.ogg`
- **Atmósfera:** Núcleos de inteligencia artificial, procesamiento masivo de datos y matrices de computación sin alma.

```text
Monolithic supercomputer server room drone, chilled liquid nitrogen coolant hiss, hyper-precise binary rhythmic clicks, haunting synthetic vocal-like vocoder pads, cold sentient artificial intelligence calculations, 78 BPM, dark minimalist electronic, pure instrumental, no vocals
```

---

### 09. Ministerio de Defensa (`defense`)
- **Nombre de archivo:** `musica-ministerio-defensa.ogg`
- **Atmósfera:** Búnkeres fortificados, baterías de plasma costeras, radares de alerta temprana y escudos orbitales.

```text
Ominous military radar ambient, muted martial snare rimclicks, deep low brass swells, tense sub-harmonic pulses, bunker defense command center feeling, watchful surveillance atmosphere, slow tension 68 BPM, fortress-like stoicism, pure instrumental, no vocals
```

---

### 10. Ministerio de Guerra (`war`)
- **Nombre de archivo:** `musica-ministerio-guerra.ogg`
- **Atmósfera:** Astilleros de acorazados de combate, doctrina de asalto estelar y mando supremo de flota.

```text
Solemn war march, heavy orchestral war horns, thundering taiko and deep timpani drums, cold militaristic string ostinato, aggressive low brass stabs, dark imperial warlord authority, disciplined martial cadence 76 BPM, cinematic doom and conquest, pure instrumental, no vocals
```

---

### 11. Ministerio de Transporte (`transport`)
- **Nombre de archivo:** `musica-ministerio-transporte.ogg`
- **Atmósfera:** Vías de vacío maglev, autopistas orbitales de tráfico y catapultas electromagnéticas.

```text
Aerodynamic ambient electronic, smooth gliding sequencer lines, rushing doppler effect sweeps, constant frictionless movement rhythm 100 BPM, high-speed vacuum tube transit sensation, sleek futuristic travel, pure instrumental, no vocals
```

---

### 12. Ministerio de Logística (`logistics`)
- **Nombre de archivo:** `musica-ministerio-logistica.ogg`
- **Atmósfera:** Silos colosales automatizados, cadenas de suministro sincronizadas y puertos de embarque.

```text
Strict metric ambient, synchronized telemetry pulses, rhythmic cargo container loading clicks, deep methodical synth pulse 82 BPM, precision orbital freight terminal, continuous mechanical efficiency, pure instrumental, no vocals
```

---

### 13. Ministerio de Biosfera y Ecología (`biosphere`)
- **Nombre de archivo:** `musica-ministerio-biosfera.ogg`
- **Atmósfera:** Domos de terraformación, humedad controlada, bio-ingeniería vegetal y adaptación planetaria.

```text
Warm organic ambient, slow breathing biosuit drone, subtle hydroponic mist and water droplets, soft resonant wooden percussion, earthy synthesizer pads, blooming ecosystem terraforming atmosphere 66 BPM, serene ecological sanctuary, pure instrumental, no vocals
```

---

### 14. Ministerio de Agricultura (`agriculture`)
- **Nombre de archivo:** `musica-ministerio-agricultura.ogg`
- **Atmósfera:** Granjas verticales hidropónicas, irrigación por nutrientes, serenidad vegetal y sustento colonial.

```text
Gentle pastoral sci-fi ambient, warm acoustic marimba arpeggios, subtle bubbling irrigation rhythms, airy analog synthesizer flutes, nourishing and peaceful atmosphere, organic harvest cycles, moderate tempo 74 BPM, pristine green house acoustics, pure instrumental, no vocals
```

---

### 15. Ministerio de Asuntos Civiles (`civics`)
- **Nombre de archivo:** `musica-ministerio-civiles.ogg`
- **Atmósfera:** Bienestar ciudadano, ayuntamientos coloniales, estabilidad social y salud pública.

```text
Temperate civic neo-classical, warm chamber string quartet, gentle pizzicato accents, soft atmospheric glockenspiel bells, civic harmony and public order, reassuring and balanced tone 72 BPM, clean dignified municipal hall reverb, pure instrumental, no vocals
```

---

### 16. Ministerio Diplomático (`diplomacy`)
- **Nombre de archivo:** `musica-ministerio-diplomacia.ogg`
- **Atmósfera:** Salones del Senado Galáctico, pactos estelares, acuerdos de paz y etiqueta aristocrática.

```text
Grand diplomatic ceremony, stately harp arpeggios, noble French horn chords, soaring peaceful cello melodies, dignified galactic senate atmosphere, restrained imperial grandeur 68 BPM, wide spatial acoustics, pure instrumental, no vocals
```

---

### 17. Ministerio de Inteligencia (`intel`)
- **Nombre de archivo:** `musica-ministerio-inteligencia.ogg`
- **Atmósfera:** Criptoanálisis cuántico, intercepción de señales enemigas, espionaje y operaciones encubiertas.

```text
Dark spy surveillance ambient, muffled radio static bursts, submerged pulsing sub-bass, mysterious high-pitched glass frequencies, stealthy espionage tension, slow cryptic rhythm 64 BPM, cold room acoustic isolation, pure instrumental, no vocals
```

---

### 18. Ministerio de Justicia y Orden Federal (`justice`)
- **Nombre de archivo:** `musica-ministerio-justicia.ogg`
- **Atmósfera:** Tribunal Supremo colonial, código penal interestelar, maza judicial y sentencias inapelables.

```text
Solemn judicial authority, deep pipe organ bass pedals, grave cello and double bass ostinato, distant striking wooden gavel resonance, strict austere court of law, unyielding imperial justice 60 BPM, cathedral reverberation, pure instrumental, no vocals
```

---

### 19. Ministerio de Cultura y Propaganda (`culture`)
- **Nombre de archivo:** `musica-ministerio-cultura.ogg`
- **Atmósfera:** Galas imperiales, desfiles cívicos de prestigio, difusión de ideales federales y orgullo ciudadano.

```text
Futuristic baroque ceremonial anthem, triumphant bright brass fanfares, majestic harpsichord accents, sweeping celestial choir-like synths, imperial prestige and cultural dominance, proud tempo 84 BPM, opulent royal auditorium reverb, pure instrumental, no vocals
```
