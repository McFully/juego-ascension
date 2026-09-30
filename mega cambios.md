# PROMPT MAESTRO DEFINITIVO — ASCENSION

## OBJETIVO GENERAL

Quiero que trabajes sobre el proyecto actual de **Ascension** en OpenCode como un proyecto de ingeniería de software completo, no como una simple colección de cambios visuales.

Tu objetivo es llevar el proyecto desde su estado actual hasta un estado **coherente, funcional, verificable, persistente y preparado para continuar evolucionando**, auditando y corrigiendo todo lo necesario en:

* Frontend.
* Backend.
* Dominio y lógica de juego.
* Estado global.
* Componentes.
* Hooks.
* Stores.
* Contextos.
* Navegación.
* Rutas.
* Persistencia.
* PostgreSQL.
* Supabase.
* SQL.
* Migraciones.
* Seeds.
* RLS.
* Policies.
* Triggers.
* Functions.
* Views.
* Relaciones.
* Datos.
* JSON.
* LocalStorage.
* IndexedDB.
* Sistemas de guardado/carga.
* Fórmulas.
* Cálculos.
* Tiempos.
* Recursos.
* Economía.
* Investigación.
* Construcción.
* Logística.
* Defensa.
* Flotas.
* Misiones.
* Audio.
* Imágenes.
* Assets.
* UI.
* UX.
* Tests.
* Documentación.
* Build.
* Runtime.
* Integridad entre UI, dominio y persistencia.

No quiero una implementación superficial.

No quiero que te limites a conseguir que la aplicación compile.

No quiero botones decorativos.

No quiero estados falsos.

No quiero valores calculados independientemente en diferentes partes de la aplicación.

No quiero cards que solamente aparenten ser funcionales.

No quiero que una acción visual sea considerada funcional si no modifica realmente el estado correspondiente.

El objetivo es que **Ascension funcione realmente de extremo a extremo**.

---

# REGLA FUNDAMENTAL

## UI ≠ FUNCIONALIDAD

Nunca consideres una funcionalidad terminada simplemente porque:

* aparece un botón;
* cambia el color de un botón;
* aparece una animación;
* aparece un modal;
* aparece una card;
* aparece el texto “Investigando”;
* aparece el texto “Construyendo”;
* aparece un contador;
* aparece un recurso;
* aparece una recompensa;
* aparece una duración;
* aparece un estado;
* aparece una pantalla;
* una ruta navega correctamente;
* compila correctamente.

Todo debe estar conectado al verdadero sistema de dominio.

La cadena que debe existir es:

**UI → acción → lógica de dominio → estado real → persistencia → efectos → UI actualizada**

Cuando corresponda:

**UI → acción → backend/Supabase/PostgreSQL → persistencia → recuperación → dominio → UI**

---

# REGLA ABSOLUTA DE FUENTE DE VERDAD

Para cada dato, debe existir una fuente de verdad claramente identificada.

Ejemplos:

* Coste.
* Recompensa.
* Producción.
* Consumo.
* Capacidad.
* Duración.
* Estado.
* Progreso.
* Investigación.
* Construcción.
* Recursos.
* Identidad.
* Propietario.
* Investigador.
* Gobernador.
* Comandante.
* Nave.
* Planeta.
* Colonia.
* Misión.
* Ruta.
* Defensa.

No permitas que diferentes componentes calculen de manera independiente el mismo valor sin una razón explícita.

La regla general debe ser:

**VALOR MOSTRADO = VALOR REAL = VALOR UTILIZADO = VALOR PERSISTIDO**

salvo que exista una transformación legítima, explícita y documentada.

---

# REGLA DE NO DESTRUCCIÓN

Antes de modificar cualquier cosa:

* No hagas DROP de tablas.
* No elimines columnas.
* No hagas DELETE masivos.
* No hagas TRUNCATE.
* No elimines migraciones.
* No sobrescribas assets originales.
* No elimines componentes simplemente porque parecen antiguos.
* No elimines sistemas existentes sin demostrar que son obsoletos.
* No sustituyas estructuras funcionales por otras nuevas sin analizar dependencias.
* No hagas refactors destructivos por comodidad.

Antes de eliminar algo:

1. Busca todas sus referencias.
2. Determina quién lo utiliza.
3. Comprueba si existe persistencia asociada.
4. Comprueba dependencias.
5. Comprueba migraciones.
6. Comprueba datos existentes.
7. Comprueba rutas.
8. Comprueba tests.
9. Comprueba imports.
10. Comprueba referencias indirectas.
11. Determina si realmente está obsoleto.
12. Documenta el impacto.

Siempre que sea posible, utiliza migraciones compatibles y cambios no destructivos.

---

# PHASE 0 — PREFLIGHT COMPLETO Y PROTECCIÓN DEL PROYECTO

Antes de realizar cualquier modificación funcional, realiza una auditoría inicial completa.

## 0.1 Estructura

Inspecciona:

* estructura del proyecto;
* frontend;
* backend;
* componentes;
* páginas;
* rutas;
* hooks;
* stores;
* contexts;
* servicios;
* modelos;
* tipos;
* utilidades;
* assets;
* imágenes;
* audio;
* configuración;
* scripts;
* tests;
* documentación;
* Markdown;
* build pipeline.

## 0.2 Datos y persistencia

Localiza:

* PostgreSQL;
* Supabase;
* migraciones;
* seeds;
* tablas;
* columnas;
* tipos;
* PK;
* FK;
* índices;
* constraints;
* RLS;
* policies;
* triggers;
* functions;
* views;
* JSON;
* LocalStorage;
* IndexedDB;
* sistema de guardado;
* sistema de carga;
* exportación;
* importación.

Determina qué sistema es actualmente la verdadera fuente de verdad.

## 0.3 Git

Comprueba:

* branch actual;
* cambios sin commit;
* archivos modificados;
* archivos nuevos;
* archivos eliminados;
* conflictos;
* trabajo previo del desarrollador.

No sobrescribas trabajo existente silenciosamente.

## 0.4 Arquitectura

Determina:

* qué controla el estado;
* qué calcula los valores;
* qué persiste;
* qué representa el dominio;
* qué solamente presenta datos;
* qué componentes duplican lógica;
* qué sistemas tienen fuentes de verdad múltiples.

## 0.5 Riesgos

Identifica:

* deuda técnica;
* duplicaciones;
* inconsistencias;
* sistemas incompletos;
* funcionalidades simuladas;
* persistencia incompleta;
* cálculos duplicados;
* rutas incorrectas;
* assets incorrectos;
* errores de base de datos;
* posibles problemas de RLS;
* problemas de migración;
* operaciones destructivas potenciales.

## 0.6 ENTREGABLE OBLIGATORIO

Crear:

`/docs/implementation/00_PREFLIGHT.md`

Debe contener:

* arquitectura encontrada;
* fuentes de verdad;
* sistemas afectados;
* dependencias;
* riesgos;
* problemas encontrados;
* estructura de datos;
* estado de Supabase/PostgreSQL;
* estado de Git;
* estrategia de implementación;
* operaciones potencialmente destructivas;
* migraciones necesarias;
* assets relevantes;
* tests existentes;
* estrategia de validación.

## BLOQUEO DE FASE

No se puede iniciar ninguna fase funcional si el preflight no está documentado.

---

# PHASE 1 — ORQUESTACIÓN MEDIANTE MARKDOWN

Después del preflight y antes de realizar los cambios funcionales, divide el trabajo en fases y subfases independientes.

No ejecutes todo como una única tarea monolítica.

Crear:

`ASCENSION_IMPLEMENTATION_MASTER_PLAN.md`

y:

`ASCENSION_IMPLEMENTATION_STATUS.md`

Preferiblemente dentro de:

`/docs/implementation/`

Crear como mínimo:

* `00_PREFLIGHT.md`
* `01_MASTER_PLAN.md`
* `02_IMAGE_PIPELINE.md`
* `03_REFINERY_REWARDS.md`
* `04_AUDIO_SYSTEM.md`
* `05_AUTOTRADE_CHAPTER6.md`
* `06_ASSETS_COLONIES_HIGH_COMMAND.md`
* `07_SUPPLY_ROUTES.md`
* `08_IMPERIAL_NAVIGATION.md`
* `09_PLANETARY_IMPERIAL_SEPARATION.md`
* `10_SAVE_COMMANDER_SEPARATION.md`
* `11_BASTION_SILOS.md`
* `12_FLEET_HANGAR.md`
* `13_RESEARCH_SYSTEM.md`
* `14_MINISTRY_RESEARCH_AUDIT.md`
* `15_CARD_DETAILS_SYSTEM.md`
* `16_CARD_FUNCTIONALITY_AUDIT.md`
* `17_CONSTRUCTION_TIME_AUDIT.md`
* `18_GLOBAL_IMAGE_AUDIT.md`
* `19_MISSING_ASSETS.md`
* `20_DATABASE_AND_PERSISTENCE.md`
* `21_INTEGRATION_TESTING.md`
* `22_REGRESSION_TESTING.md`
* `23_FINAL_VERIFICATION.md`

Si el análisis demuestra que hacen falta más fases, créalas.

No dupliques mecánicamente este prompt en cada Markdown.

Cada Markdown debe ser:

* autónomo;
* ejecutable;
* detallado;
* específico;
* verificable;
* con dependencias;
* con entregables;
* con criterios de aceptación;
* con tests;
* con bloqueos.

El `MASTER_PLAN` es el orquestador real.

El `STATUS` es el estado real de ejecución.

Después de cada fase:

1. Implementar.
2. Testear.
3. Corregir.
4. Verificar.
5. Actualizar Markdown de la fase.
6. Actualizar `STATUS`.
7. Actualizar `MASTER_PLAN`.
8. Registrar problemas pendientes.
9. Verificar que no existen bloqueos.
10. Solo entonces continuar.

---

# NUEVA REGLA GLOBAL — ENTREGABLES OBLIGATORIOS POR FASE

Cada fase debe tener una sección:

`## ENTREGABLES OBLIGATORIOS`

No consideres una fase terminada hasta que todos sus entregables estén producidos.

Los entregables pueden incluir:

* código;
* migraciones;
* SQL;
* cambios de datos;
* componentes;
* servicios;
* documentación;
* auditorías;
* tests;
* evidencias;
* informes;
* listas de problemas;
* listas de correcciones;
* verificación de persistencia;
* verificación de UI;
* verificación de dominio;
* verificación de integración.

Cada fase debe indicar exactamente:

* qué se esperaba;
* qué se encontró;
* qué se modificó;
* qué no se modificó;
* qué tests se ejecutaron;
* qué tests pasaron;
* qué tests fallaron;
* qué riesgos permanecen;
* qué archivos se modificaron;
* qué migraciones se crearon;
* qué decisiones arquitectónicas se tomaron;
* qué criterios de aceptación se cumplieron.

---

# NUEVA REGLA GLOBAL — DEFINITION OF DONE

Cada fase debe tener obligatoriamente:

`## DEFINITION OF DONE`

Como mínimo:

```text
[ ] Análisis completado
[ ] Implementación completada
[ ] Fuente de verdad identificada
[ ] Lógica de dominio verificada
[ ] UI verificada
[ ] Persistencia verificada cuando corresponda
[ ] Integraciones verificadas
[ ] Tests ejecutados
[ ] Tests críticos superados
[ ] No existen errores críticos conocidos
[ ] No existen discrepancias UI → dominio conocidas
[ ] Documentación de la fase actualizada
[ ] ASCENSION_IMPLEMENTATION_STATUS.md actualizado
[ ] ASCENSION_IMPLEMENTATION_MASTER_PLAN.md actualizado
[ ] Entregables producidos
[ ] Criterios de aceptación cumplidos
[ ] Fase preparada para cierre
[ ] Autorizada para pasar a la siguiente fase
```

---

# NUEVA REGLA GLOBAL — SISTEMA DE BLOQUEO DE FASES

Una fase queda:

`PHASE BLOCKED`

si cualquiera de sus condiciones obligatorias no se cumple.

No avances automáticamente.

No marques una fase como completada por aproximación.

No marques como “done” una funcionalidad parcialmente implementada.

No uses frases como:

* “prácticamente terminado”;
* “funcional a nivel visual”;
* “se puede mejorar después”;
* “la base ya está preparada”;

para saltarte un bloqueo funcional.

## BLOQUEOS DUROS

Debe detenerse el avance si existe:

* error de compilación;
* error runtime;
* pérdida de datos;
* persistencia rota;
* migración incorrecta;
* RLS incorrecta;
* función de base de datos rota;
* estado inconsistente;
* UI mostrando valores diferentes al dominio;
* funcionalidad falsa;
* botón sin lógica;
* acción que no persiste;
* investigación que no se ejecuta realmente;
* construcción que no respeta su duración;
* recurso que se muestra pero no se modifica correctamente;
* navegación a entidad incorrecta;
* identificadores mezclados;
* ruta incorrecta;
* datos inventados;
* cálculo duplicado incompatible;
* test crítico fallando;
* regresión crítica.

## BLOQUEOS BLANDOS

Pueden quedar documentados sin bloquear únicamente si no afectan a la funcionalidad:

* mejora estética secundaria;
* optimización no crítica;
* refactor no imprescindible;
* asset secundario que no rompe el funcionamiento.

Debe quedar registrado en `STATUS`.

## REGLA

Si una condición crítica falla:

`PHASE BLOCKED — DO NOT PROCEED`

Primero solucionar.

Después repetir los tests.

Después volver a evaluar la Definition of Done.

Solo entonces avanzar.

---

# PHASE 2 — CALIDAD DE IMÁGENES

El sistema actual tiene compresión que destruye visiblemente la calidad.

Eliminar la compresión con pérdida.

Aunque el código la describa como:

* imperceptible;
* optimizada;
* ligera;
* automática;
* performance optimization.

Si existe pérdida visible o innecesaria, debe investigarse y eliminarse.

## Auditar

* originales;
* assets;
* importadores;
* loaders;
* build;
* runtime;
* conversiones;
* WebP;
* JPEG;
* PNG;
* canvas;
* procesamiento automático;
* thumbnails;
* CDN;
* compresión.

Recuperar originales desde:

* proyecto;
* repositorio;
* historial;
* assets existentes;

cuando sea posible.

No recomprimir originales con pérdida.

## Entregables

* diagnóstico;
* pipeline corregido;
* assets corregidos;
* verificación visual;
* comprobación build/runtime.

## Bloqueo

No cerrar si las imágenes siguen sufriendo degradación automática.

---

# PHASE 3 — RECOMPENSAS DE REFINERÍA ×200

Multiplicar todas las recompensas actuales de refinería por:

**200**

Fórmula:

`NEW_REWARD = CURRENT_REWARD × 200`

Debe modificarse la fuente real de cálculo.

No solamente el texto mostrado.

Verificar:

* cálculo;
* concesión;
* persistencia;
* UI;
* efectos económicos.

No modificar mecánicas no relacionadas.

## Bloqueo

Si la UI muestra ×200 pero la recompensa real no lo recibe, fase bloqueada.

---

# PHASE 4 — SISTEMA DE AUDIO

Existe un problema de duplicación/solapamiento de audio en la pantalla principal.

Auditar:

* música;
* SFX;
* autoplay;
* loops;
* mount;
* unmount;
* listeners;
* callbacks;
* navegación;
* players;
* componentes duplicados;
* contexts;
* volumen;
* persistencia;
* cleanup.

Debe existir una única instancia relevante cuando corresponda.

Eliminar:

* doble reproducción;
* listeners duplicados;
* players duplicados;
* audio que continúa indebidamente;
* reinicios inesperados.

Auditar también otras pantallas para detectar el mismo patrón.

## Bloqueo

No cerrar mientras exista reproducción duplicada conocida.

---

# PHASE 5 — AUTOTRADE / MISIÓN CAPÍTULO 6

La activación actual del autotrade falla.

Auditar todo el flujo:

**Colony → Navigation → Galaxy → Freighter → Colony → Assignment → Fleet Hangar → Autotrade → Persistence → Mission**

Determinar el verdadero estado/registro que representa:

`AUTOTRADE_ACTIVE`

Corregir:

* acción;
* estado;
* persistencia;
* activación;
* desactivación;
* carga;
* guardado;
* detección de misión;
* integración.

No crear un hack exclusivo para la misión.

El sistema general de autotrade debe funcionar.

## Bloqueo

La fase no termina hasta que el autotrade real pueda:

1. activarse;
2. persistir;
3. cargarse;
4. mantenerse activo;
5. desactivarse;
6. ser reconocido por la misión.

---

# PHASE 6 — COLONIAS / HIGH COMMAND / ASSETS

Corregir asset incorrecto de Colonias.

Revisar:

* High Command Ministry;
* Planetary Senate;
* otros assets relacionados.

Deben tener identidad visual coherente y diferenciada.

Crear/actualizar:

`MISSING_ASSETS.md`

si faltan assets.

---

# PHASE 7 — AUTOMATIC SUPPLY ROUTES

Separar conceptualmente:

### Navigation / Galaxy

Ubicaciones y entidades.

### Fleet Hangar

Naves y asignaciones.

### Autotrade

Comercio automático.

### Supply Routes

Transporte automático de recursos.

Flujo:

**ORIGIN → DESTINATION → RESOURCE → QUANTITY/CONDITION → FREIGHTER → ACTIVATE**

El jugador debe seleccionar explícitamente el recurso.

Corregir:

* activación;
* condición de capacidad >50%;
* persistencia;
* ejecución;
* transporte;
* actualización de recursos;
* estado;
* desactivación.

La ruta debe ser real, no visual.

---

# PHASE 8 — IMPERIAL COUNCIL / SENATE / DIPLOMACY / ALLIANCES

Actualmente se reutilizan imágenes/cards entre:

* Directives Missions;
* Imperial Council;
* Diplomacy;
* Alliances;
* Imperial Senate.

Eliminar reutilizaciones incorrectas.

Cada sistema debe tener:

* identidad visual;
* concepto;
* asset;
* navegación;
* contexto.

---

# PHASE 9 — SEPARACIÓN PLANETARY VS IMPERIAL

## Planetary Senate

Ruta:

**Empire → Planet → High Command → Planetary Senate**

Debe representar el Senado del planeta actual.

## Imperial Senate

Ruta:

**Empire → Imperial Senate**

Debe representar el Senado Imperial.

Nunca debe abrir Earth Planetary Senate.

Auditar:

* router;
* rutas;
* IDs;
* componentes;
* referencias;
* imágenes;
* estado;
* datos;
* breadcrumbs;
* botones;
* contexto;
* planeta activo.

Aplicar la misma separación conceptual a:

* Planetary Council;
* Imperial Council.

## Bloqueo

No cerrar si una ruta imperial puede abrir accidentalmente contenido planetario.

---

# PHASE 10 — SAVE GAME VS COMMANDER

Separar completamente:

## Save

* saveId;
* saveName;
* fecha;
* estado de partida.

## Commander

* commanderId;
* identificación;
* nombre;
* perfil.

No compartir:

* variable;
* estado;
* DB field;
* localStorage key;
* IndexedDB property;
* JSON property;
* getter;
* setter;
* formulario;
* binding.

Reglas:

Cambiar `saveName` no cambia `commanderId`.

Cambiar `commanderId` no cambia `saveName`.

`Save As` no modifica `commanderId`.

Load restaura ambos independientemente.

Crear migración compatible para saves antiguos.

Tests:

* crear partida;
* asignar nombre;
* asignar ID;
* guardar;
* modificar nombre;
* modificar ID;
* cerrar;
* abrir;
* cargar;
* múltiples saves;
* comprobar independencia.

## Bloqueo

Cualquier contaminación entre ambas entidades bloquea.

---

# PHASE 11 — BASTION / SILOS

## Bastion

Ruta:

**EMPIRE → PLANET → HIGH COMMAND → DEFENSIVE BASTION**

No pasar por una pantalla intermedia innecesaria.

Debe mostrar directamente:

* surface shield batteries;
* instalaciones;
* construcción;
* deployment;
* calibration.

Una batería construida debe mostrar un estado real como:

`DEPLOYMENT AND CALIBRATION IN PROGRESS`

o equivalente conectado al estado real.

Mover al HUB superior:

* Total Batteries;
* Firepower;
* Shields;

junto a:

* Global Imperial Reputation.

Usar el mismo estilo de indicadores.

Eliminar:

* duplicación de defenses;
* unit count incorrecto;
* botón de silos duplicado;
* pantallas intermedias innecesarias.

## Silos

Independientes.

Mostrar:

* ballistic storage capacity;
* interplanetary missile layout;
* ballistic missile card;
* ballistic fire console.

No mostrar contenido del Bastion.

### Separación funcional

Bastion:

* surface shields;
* planetary defense;
* construction;
* deployment;
* calibration;
* network;
* metrics.

Silos:

* ballistic storage;
* interplanetary missiles;
* ballistic missiles;
* fire console.

Back debe volver al High Command del planeta correcto.

---

# PHASE 12 — FLEET HANGAR

En:

**High Command → Fleet Hangar**

Distribuir:

### Izquierda — 50%

* Squadron Dispatch;
* Assignment;
* todas las naves.

Incluye:

* militares;
* support;
* freighters;
* todas las categorías.

### Derecha — 50%

* Mission Type.

Mantener:

* selección;
* filtros;
* scroll;
* drag/drop;
* botones;
* estados;
* persistencia;
* assignment.

Solo utilizar responsive fallback cuando sea necesario.

No convertir el 50/50 en una modificación funcional del sistema.

---

# PHASE 13 — SISTEMA DE INVESTIGACIÓN

Auditar:

* ministros;
* gobernadores;
* emperador;
* ministries;
* research queues;
* assignment;
* priorities;
* free research;
* researchers.

Problema actual:

Una investigación larga/multinivel/multidía puede provocar que otra investigación válida y más corta sea ignorada.

No implementar simplemente:

`always shortest`

La lógica debe respetar:

* prerequisites;
* dependencies;
* specialization;
* level;
* availability;
* priority;
* assigned researcher;
* responsible entity;
* current state.

Si investigadores son independientes, deben tener capacidad independiente.

Investigar si existe:

* global research queue incorrecta;
* estado compartido incorrecto;
* falta de reevaluación;
* priority logic defectuosa;
* bloqueo entre investigadores.

Diseñar la arquitectura correcta.

---

# PHASE 14 — INDUSTRIAL OPTIMIZATION

Ruta:

**Ministry of Industry → Research → Industrial Optimization**

Actualmente puede no entrar realmente en investigación/construcción.

Corregir flujo completo:

* disponibilidad;
* prerequisites;
* coste;
* duración;
* responsable;
* asignación;
* queue;
* persistencia;
* transición;
* progreso;
* completion;
* effect.

Lifecycle:

`AVAILABLE → SELECTABLE → ASSIGNED → RESEARCHING → PROGRESS → COMPLETED → EFFECT APPLIED`

El botón debe ejecutar lógica real.

---

# PHASE 15 — AUDITORÍA COMPLETA DE RESEARCH Y MINISTRIES

Toda research debe tener:

* ministry;
* responsible researcher;
* card;
* category;
* prerequisites;
* level;
* assignment;
* visibility;
* availability;
* researchability;
* persistence;
* completion;
* effect.

Buscar investigaciones:

* huérfanas;
* duplicadas;
* inaccesibles;
* sin ministry;
* sin researcher;
* sin card;
* sin categoría;
* con prerequisites inválidos;
* sin ruta;
* sin efecto.

Crear auditoría automática si es viable.

Auditar todas las ministries.

Cada ministry debe mostrar:

* Facilities;
* Research cuando corresponda.

## Infrastructure Research

No asumir.

Analizar el diseño real.

Si debería tener Research:

* restaurarlo/añadirlo;
* asignar investigaciones correctas.

Si no debe tenerlo:

* documentar internamente la razón;
* comprobar que ninguna research huérfana depende de esa sección.

Cada sección Research debe mostrar exclusivamente lo que le corresponde.

No duplicar salvo que el diseño lo requiera.

Persistencia:

* cambiar pantalla;
* cambiar ministry;
* cambiar researcher;
* save;
* load;
* cerrar;
* reabrir.

La investigación debe mantener su progreso.

---

# PHASE 16 — “VER DETALLES” UNIVERSAL

Eliminar el “Ver detalles” junto al título cuando exista duplicado.

Mantener una sola acción inferior:

`[CONSTRUIR] [VER DETALLES]`

Utilizar el icono de detalles existente y correcto.

Auditar todas las cards.

El botón debe:

* existir;
* tener handler;
* tener ID correcto;
* identificar la entidad correcta;
* abrir el detalle correcto;
* respetar estado;
* respetar contexto;
* respetar persistencia.

No basta con abrir un modal genérico.

---

# PHASE 17 — SISTEMA ULTRADETALLADO DE DETALLES

“Ver detalles” debe funcionar como:

* wiki completa;
* ficha técnica atómica;
* informe corporativo;
* informe financiero;
* informe operativo.

La card principal debe mantenerse limpia.

El detalle debe ser exhaustivo.

Utilizar exclusivamente datos reales.

Nunca inventar valores.

Cuando no exista información:

`No disponible`

o:

`No aplica`

## Identidad

Cuando corresponda:

* nombre;
* ID;
* categoría;
* subcategoría;
* nivel;
* tier;
* clase;
* tipo;
* variante;
* estado;
* ubicación;
* propietario;
* ministry;
* researcher.

## Descripción

* función;
* propósito;
* contexto;
* rol estratégico;
* rol económico;
* rol operativo.

## Economía

* construction cost;
* maintenance;
* operation cost;
* resource costs;
* production;
* consumption;
* income;
* rewards;
* multipliers;
* bonuses;
* penalties;
* efficiency;
* capacity;
* ratios;
* base values;
* modified values.

## Tiempo

* duración;
* duración efectiva;
* restante;
* progreso;
* velocidad;
* aceleradores;
* penalizaciones;
* inicio;
* finalización.

## Atributos

* base;
* actual;
* máximo;
* modificadores;
* origen de modificadores.

## Requirements

* requisitos;
* dependencies;
* unlocks;
* research;
* technologies.

## Estado

* lifecycle;
* progress;
* availability;
* operational state.

## Persistencia

Indicar si corresponde:

* persisted;
* save state;
* server state;
* last update;
* synchronization.

## Relaciones

Mostrar relaciones reales:

* planet;
* colony;
* ministry;
* researcher;
* commander;
* ship;
* route;
* mission;
* building;
* research;
* resource.

## Historia

Mostrarla cuando exista realmente.

Nunca fabricar historial.

---

# PHASE 18 — BUILDING DETAILS

Todos los buildings deben tener detalles.

Para `Industrial Complex`, explicar con datos reales:

* qué produce;
* cuánto produce;
* qué consume;
* qué recursos utiliza;
* costes;
* maintenance;
* capacity;
* efficiency;
* multipliers;
* requirements;
* technologies;
* research;
* effects;
* bonuses;
* relaciones;
* impacto planetario;
* impacto colonial;
* fórmulas reales.

---

# PHASE 19 — RESEARCH DETAILS

Research details debe mostrar:

* identidad;
* ministry;
* researcher;
* level;
* category;
* description;
* duration base;
* duration modificada;
* effective duration;
* progress;
* remaining;
* costs;
* prerequisites;
* dependencies;
* effects;
* valores antes;
* valores después;
* persistence;
* unlocks.

---

# PHASE 20 — AUDITORÍA DE CARDS ESTÉRILES

Auditar absolutamente todas las cards.

Una card válida debe estar conectada al sistema real.

Buscar:

* botones sin lógica;
* costes solo visuales;
* rewards solo visuales;
* atributos falsos;
* producción falsa;
* consumo falso;
* effects falsos;
* fake state;
* fake construction;
* fake research;
* fake unlock;
* datos desconectados;
* valores hardcoded incorrectamente.

Una card NO es funcional simplemente porque tenga:

* imagen;
* nombre;
* descripción;
* botones;
* animación.

Debe estar conectada a la fuente de verdad.

---

# PHASE 21 — AUDITORÍA UNIVERSAL DE FÓRMULAS

Para cada card y sistema:

`DISPLAYED VALUE = REAL VALUE = USED VALUE = PERSISTED VALUE`

salvo transformación legítima.

Auditar:

* costes;
* rewards;
* production;
* consumption;
* capacity;
* maintenance;
* duration;
* progress;
* multipliers;
* bonuses;
* penalties;
* effects.

No permitir cálculos paralelos inconsistentes.

---

# PHASE 22 — AUDITORÍA CRÍTICA DE TIEMPOS DE CONSTRUCCIÓN

Problema conocido:

Una card puede indicar:

`Construction time: 4 hours`

pero después de Build la queue muestra:

`2 hours`

Otro edificio puede mostrar:

`3 hours`

y al construir aparecer:

`1 hour`

No asumir que es simplemente un problema visual.

Investigar la causa raíz.

Auditar:

* base build duration;
* card display duration;
* build action duration;
* queue duration;
* persisted duration;
* remaining duration;
* finish date;
* finish time;
* modifiers;
* buffs;
* debuffs;
* technologies;
* buildings;
* research;
* planet;
* colony;
* ministry;
* governor;
* emperor;
* commander;
* multipliers;
* speed;
* difficulty;
* queue;
* unit conversion;
* rounding;
* save/load;
* recalculation.

Definir una fuente de verdad:

`EFFECTIVE_CONSTRUCTION_DURATION`

Regla:

```text
CARD DISPLAY
=
EFFECTIVE CONSTRUCTION DURATION
=
BUILD ACTION DURATION
=
QUEUE DURATION
=
PERSISTED DURATION
=
COUNTDOWN DURATION
=
COMPLETION CALCULATION
```

Salvo que un modificador legítimo cambie dinámicamente entre esos momentos.

Si cambia:

* debe existir una razón real;
* debe ser visible;
* debe estar documentado;
* debe poder reproducirse.

Ejemplo:

Si card muestra 4h y no existe modificador:

Queue debe mostrar 4h.

Si existe una reducción real del 40%:

La card debería mostrar ya la duración efectiva:

`4h base → 2h24 effective`

antes de construir.

No permitir reducciones silenciosas.

---

# PHASE 23 — CENTRALIZACIÓN DE DURACIONES

Buscar funciones duplicadas como:

* `calculateBuildTime`
* `getBuildDuration`
* `getConstructionTime`
* `calculateEffectiveDuration`
* `queueDuration`
* `remainingTime`

Determinar si duplican lógica.

Centralizar la duración efectiva cuando corresponda.

Evitar:

* doble aplicación de modifiers;
* modifiers omitidos;
* cálculo distinto en UI y queue;
* horas/minutos/segundos inconsistentes;
* rounding prematuro;
* contexto diferente.

---

# PHASE 24 — TESTS DE CONSTRUCCIÓN

Ejecutar obligatoriamente:

### A

Card = 4h → Build → Queue = 4h.

### B

Card = 3h → Build → Queue = 3h.

### C

Existe modifier legítimo → Card muestra duración efectiva → Queue usa exactamente la misma.

### D

Save durante construcción → cerrar → abrir → Load → remaining time coherente.

### E

Navegar fuera y volver → no cambia arbitrariamente.

### F

Múltiples builds → cada uno conserva duración correcta.

### G

Planetas/colonias diferentes → modifiers correctos.

### H

Niveles diferentes → duración correcta.

### I

Research/technology modifiers → mismo cálculo en card y queue.

Cualquier fallo crítico bloquea la fase.

---

# PHASE 25 — AUDITORÍA GLOBAL UI → DOMAIN

Buscar sistemáticamente:

`UI = A → ACTION → DOMAIN = B`

cuando debería ser:

`UI = A → ACTION → DOMAIN = A`

Aplicar a:

* time;
* cost;
* reward;
* production;
* consumption;
* capacity;
* maintenance;
* attributes;
* research;
* construction;
* defense;
* logistics;
* resources.

La diferencia solo es válida si existe una transformación legítima y explícita.

---

# PHASE 26 — AUDITORÍA GLOBAL DE IMÁGENES

Auditar todas las pantallas/cards.

Buscar:

* imágenes incorrectas;
* genéricas;
* reutilizadas incorrectamente;
* faltantes;
* degradadas;
* comprimidas;
* incompatibles;
* assets que conceptualmente no corresponden.

---

# PHASE 27 — MISSING_ASSETS.md

Crear:

`MISSING_ASSETS.md`

Cada entrada debe incluir:

* identifier;
* screen;
* section;
* card;
* function;
* reason;
* replacement;
* descripción visual precisa;
* orientación;
* formato;
* aspect ratio;
* resolución;
* restricciones;
* filename propuesto.

Si no falta ninguno:

documentarlo explícitamente.

---

# PHASE 28 — DATABASE Y PERSISTENCIA

Auditar:

* PostgreSQL;
* Supabase;
* schemas;
* tables;
* columns;
* relationships;
* PK;
* FK;
* indexes;
* constraints;
* RLS;
* policies;
* triggers;
* functions;
* views;
* migrations;
* seeds;
* save/load;
* persistence.

Verificar que el modelo de datos corresponde al dominio.

No realizar cambios destructivos sin justificación.

Crear migraciones cuando sean necesarias.

Verificar compatibilidad con datos existentes.

---

# PHASE 29 — INTEGRACIÓN

Verificar que los sistemas independientes realmente permanecen independientes.

No compartir estados accidentalmente.

No compartir IDs incorrectamente.

No compartir fuentes de verdad por comodidad.

Verificar:

* navegación;
* estado;
* persistence;
* database;
* UI;
* domain;
* effects;
* assets.

---

# PHASE 30 — REGRESSION TESTING

Después de las modificaciones:

Ejecutar:

* build;
* tests;
* runtime;
* navigation;
* save/load;
* construction;
* research;
* resources;
* audio;
* assets;
* routes;
* state transitions.

Buscar regresiones.

Corregir antes de continuar.

---

# PHASE 31 — VERIFICACIÓN FINAL

Verificar obligatoriamente:

* imágenes sin compresión destructiva;
* recompensas de refinería ×200;
* audio sin duplicación;
* autotrade;
* Chapter 6;
* Supply Routes;
* navegación;
* separación Imperial/Planetary;
* Senado;
* Council;
* assets;
* `MISSING_ASSETS.md`;
* Save vs Commander ID;
* Bastion;
* Silos;
* Fleet Hangar 50/50;
* Research;
* Ministries;
* Research details;
* Building details;
* Ver detalles;
* cards no estériles;
* botones funcionales;
* costes reales;
* rewards reales;
* attributes reales;
* production real;
* consumption real;
* effects reales;
* requirements;
* unlocks;
* fórmulas;
* construcción;
* duración efectiva;
* modifiers;
* persistence;
* save/load;
* no conversiones incorrectas;
* no cálculos duplicados;
* no UI/domain discrepancies;
* no compile errors;
* no runtime errors;
* no route errors;
* no state errors;
* no regressions.

Actualizar:

* Master Plan;
* Status;
* Markdown de cada fase;
* lista de migraciones;
* lista de tests;
* lista de incidencias.

---

# PHASE 32 — CRITERIOS ABSOLUTOS DE COMPLETITUD

No declares terminado porque:

* compile;
* arranque;
* renderice;
* aparezca un botón;
* cambie el color de un botón;
* aparezca un modal;
* una card muestre información;
* research muestre “researching”;
* building muestre “building”;
* exista un countdown;
* aparezca una recompensa.

Una funcionalidad está terminada únicamente cuando:

**DATOS + LÓGICA + UI + ESTADO + PERSISTENCIA + FÓRMULAS + NAVEGACIÓN + EFECTOS + ASSETS**

son coherentes.

Una card no es funcional porque parezca funcional.

Research no es funcional porque cambie visualmente.

Building no es funcional porque aparezca construido.

Cost no es funcional porque aparezca en pantalla.

Reward no es funcional porque aparezca como texto.

Time no es correcto solamente porque exista un countdown.

Todo debe proceder de la fuente de verdad correspondiente.

---

# SISTEMA OBLIGATORIO DE CONTROL POR FASE

Para cada fase debes registrar en `ASCENSION_IMPLEMENTATION_STATUS.md`:

```text
PHASE:
Nombre:

STATUS:
NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETE

OBJECTIVE:
...

SOURCE OF TRUTH:
...

DEPENDENCIES:
...

FILES INSPECTED:
...

FILES MODIFIED:
...

DATABASE CHANGES:
...

MIGRATIONS:
...

IMPLEMENTATION:
...

TESTS:
...

TEST RESULTS:
...

KNOWN ISSUES:
...

HARD BLOCKERS:
...

SOFT ISSUES:
...

DELIVERABLES:
...

DEFINITION OF DONE:
[ ] Analysis complete
[ ] Implementation complete
[ ] Domain verified
[ ] UI verified
[ ] Persistence verified
[ ] Integration verified
[ ] Tests passed
[ ] Documentation updated
[ ] Master Plan updated
[ ] Status updated
[ ] No critical blockers
[ ] Ready for next phase

FINAL DECISION:
PROCEED / BLOCKED
```

---

# REGLA DE REVISIÓN DE CADA FASE

Antes de marcar una fase como `COMPLETE`, realizar una segunda revisión independiente de la propia fase.

Preguntarse:

1. ¿La funcionalidad existe realmente?
2. ¿Cuál es su fuente de verdad?
3. ¿La UI utiliza esa fuente?
4. ¿La acción modifica el dominio?
5. ¿Se persiste?
6. ¿Se recupera?
7. ¿Los cálculos son los mismos?
8. ¿Los estados son reales?
9. ¿Hay botones decorativos?
10. ¿Hay datos hardcoded incorrectamente?
11. ¿Hay una segunda implementación de la misma lógica?
12. ¿Hay rutas incorrectas?
13. ¿Hay assets incorrectos?
14. ¿Hay regresiones?
15. ¿Los tests prueban comportamiento real y no solamente renderizado?
16. ¿Los datos sobreviven a save/load?
17. ¿El sistema funciona después de reiniciar?
18. ¿El valor mostrado coincide con el utilizado?
19. ¿Existe algún comportamiento distinto dependiendo de desde qué pantalla se ejecute?
20. ¿Existe alguna discrepancia conocida que se esté ocultando?

Si alguna respuesta crítica es negativa:

`BLOCKED`

---

# REGLA DE PRUEBAS REALES

Cuando sea posible, los tests deben comprobar comportamiento real.

No aceptar como prueba suficiente:

* “el componente renderiza”;
* “el botón existe”;
* “el modal aparece”;
* “el texto cambia”.

Preferir:

* acción;
* cambio de estado;
* cálculo;
* persistencia;
* recuperación;
* efecto;
* integración.

Ejemplo:

No comprobar solamente:

`expect(button).toBeVisible()`

Comprobar también:

`click → domain mutation → persisted state → reload → restored state`

cuando corresponda.

---

# REGLA DE DATOS REALES

No inventes:

* costes;
* rewards;
* durations;
* production;
* consumption;
* capacities;
* modifiers;
* effects;
* research;
* relationships;
* IDs;
* histories.

Si el sistema no contiene un dato:

`No disponible`

Si conceptualmente no corresponde:

`No aplica`

Si necesitas crear un nuevo dato de diseño para que una funcionalidad exista, no lo inventes silenciosamente.

Documenta la necesidad y determina cómo debe integrarse correctamente en el modelo.

---

# REGLA DE DOCUMENTACIÓN VIVA

Los Markdown creados no son documentación muerta.

Son parte del sistema de ejecución.

Después de cada cambio importante:

Actualizar:

1. Markdown de fase.
2. `ASCENSION_IMPLEMENTATION_STATUS.md`.
3. `ASCENSION_IMPLEMENTATION_MASTER_PLAN.md`.

Registrar:

* decisión;
* motivo;
* archivos;
* migración;
* tests;
* resultados;
* bloqueos;
* riesgos.

---

# REGLA DE DEPENDENCIAS

No ejecutes una fase que dependa de otra que todavía esté bloqueada.

El Master Plan debe representar las dependencias reales.

Ejemplo:

Si Research depende de un modelo de datos corregido, no implementar primero la parte visual de Research como si el modelo estuviera terminado.

Resolver primero la dependencia.

---

# REGLA DE CAMBIOS MÍNIMOS Y COHERENTES

No reescribas partes enteras del proyecto si un cambio localizado soluciona correctamente el problema.

Pero tampoco hagas parches locales cuando el problema es arquitectónico.

Determina primero si el problema es:

* visual;
* de estado;
* de dominio;
* de persistencia;
* de arquitectura;
* de datos;
* de navegación;
* de integración.

Corrige en la capa adecuada.

---

# REGLA ESPECIAL PARA BASE DE DATOS Y SUPABASE

Antes de tocar Supabase/PostgreSQL:

Auditar:

* schema;
* tables;
* columns;
* data types;
* PK;
* FK;
* indexes;
* unique;
* check constraints;
* RLS;
* policies;
* triggers;
* functions;
* views;
* migrations;
* seeds;
* dependencias.

No crear tablas duplicadas porque no se haya encontrado inmediatamente una existente.

No crear columnas duplicadas.

No crear una segunda fuente de verdad.

No desactivar RLS como solución rápida.

No eliminar constraints para evitar errores.

No borrar datos para conseguir que un test pase.

Toda migración debe ser:

* necesaria;
* explicada;
* reproducible;
* compatible cuando sea posible;
* verificable.

---

# REGLA FINAL DE EJECUCIÓN

El orden obligatorio es:

### 1.

Preflight completo.

### 2.

Documentación y orquestación Markdown.

### 3.

Master Plan + Status.

### 4.

Definir entregables y Definition of Done de cada fase.

### 5.

Ejecutar las fases respetando dependencias.

### 6.

Después de cada fase:

**Implementar → Testear → Corregir → Verificar → Documentar → Actualizar Status → Actualizar Master Plan → Evaluar bloqueos**

### 7.

No pasar a la siguiente fase si existe un hard blocker.

### 8.

No declarar funcionalidad terminada por apariencia visual.

### 9.

No realizar cambios destructivos sin justificación.

### 10.

No inventar datos.

### 11.

No dejar botones decorativos.

### 12.

No dejar cards estériles.

### 13.

No dejar valores UI diferentes de los valores reales.

### 14.

No dejar sistemas con fuentes de verdad duplicadas sin justificación.

### 15.

No dejar problemas conocidos sin clasificar.

---

# RESULTADO FINAL ESPERADO

El resultado final debe ser un **Ascension coherente de extremo a extremo**.

No simplemente:

“un juego que parece terminado”.

Sino:

**un sistema donde la interfaz, el dominio, los cálculos, el estado, la persistencia, la base de datos, la navegación, los assets, las investigaciones, construcciones, recursos, flotas, logística, defensa, audio y demás sistemas representan exactamente la misma realidad del juego.**

La prioridad es:

**CORRECCIÓN FUNCIONAL > COHERENCIA DE DATOS > PERSISTENCIA > INTEGRACIÓN > TESTS > UI > ESTÉTICA**

No sacrifiques funcionalidad real por apariencia.

No sacrifiques integridad de datos por velocidad.

No sacrifiques arquitectura por un parche rápido.

No declares terminado lo que solamente parece terminado.

El criterio final es:

**ASCENSION DEBE FUNCIONAR REALMENTE, NO SOLAMENTE PARECER QUE FUNCIONA.**
