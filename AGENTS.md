# Ascension - Reglas Maestras del Proyecto

## 1. Naturaleza del Proyecto
- Ascension es un juego grande de estrategia espacial, modular, premium y 100% local para Windows.
- El proyecto puede y debe crecer con multiples pantallas, sistemas, componentes, reducers, datos, hooks y modulos internos.
- La ambicion actual es un juego extenso y mantenible, no una demo pequena ni una app de un solo archivo.

## 2. Runtime 100% Local
- El ejecutable final debe funcionar siempre offline.
- El jugador final no debe instalar Node, npm, librerias, dependencias, servidores ni herramientas externas.
- Todo lo necesario para jugar debe quedar incluido en el instalador o ejecutable final.

Permitido en desarrollo:
- npm
- Electron
- React
- Vite
- tests
- herramientas de build
- dependencias necesarias para construir y verificar el proyecto

Prohibido en runtime:
- servidores externos
- cloud saves
- sincronizacion online
- sockets
- telemetria
- llamadas web obligatorias
- descargas de dependencias

## 3. Landing Page Fuera del Juego
- La carpeta `landing/`, los MCPs, Vercel, `firebase-download/` y herramientas externas pertenecen al ecosistema de landing, distribucion o soporte.
- No forman parte del runtime del juego ejecutable.
- No deben auditarse como ejecutable salvo peticion explicita del usuario.
- Si en el futuro el landing se separa a otro repositorio, el ejecutable no debe depender de ese cambio.

## 4. Persistencia Local Obligatoria (SQLite Unificado v4)
- Toda partida se guarda en SQLite local: `%APPDATA%/Ascension/saves/universe.db`.
- Toda partida se carga desde SQLite local.
- Formato de persistencia principal: SQLite con better-sqlite3 (embebido, sin servidor).
- Los archivos `.json` se mantienen solo para import/export manual del usuario.
- Usar Electron IPC para save/load a traves de gameRepository.cjs.
- No usar `localStorage` como fuente principal de persistencia.
- Validar saves antes de cargar.
- Crear backup automatico `.bak` del archivo `.db` antes de sobrescribir.
- Migración automática: saves JSON legacy se migran a SQLite en primer arranque.

Validacion minima de save:
- version actual `4` (SQLite unificado)
- version `3` como save migrable/legacy (JSON)
- version `2` solo como save migrable/legacy
- `playerName`
- `planets` array
- `gameStarted`

## 5. Arquitectura Permitida
- El proyecto debe estar bien modularizado.
- La fragmentacion sana es deseada porque Ascension es un juego grande.

Permitido:
- `src/pages/`
- `src/components/`
- `src/reducers/`
- `src/data/`
- `src/hooks/`
- `src/utils/`
- `src/audio.js`
- `src/core.jsx`
- modulos internos equivalentes cuando reduzcan complejidad real

Objetivo:
- separar UI, logica de juego, datos, persistencia, audio y proceso Electron.
- mantener fronteras claras entre juego, landing, distribucion y herramientas.

Prohibido:
- mezclar landing con runtime del juego
- introducir red online en el ejecutable
- refactorizar visualmente sin permiso
- volver artificialmente a una arquitectura pequena
- crear abstracciones innecesarias que oculten reglas importantes del juego

## 6. Estabilidad del Ejecutable
- `ErrorBoundary` obligatorio en raiz del render.
- `LoadingScreen` con watchdog de 10s y boton Reintentar si excede.
- Bootstrap con logging: `[Ascension] Boot: inicio/listo/error`.
- El juego debe arrancar correctamente desde instalacion limpia en Windows.
- El fallo de audio, asset no critico o carga secundaria no debe romper la partida.

## 7. Build y Versionado
- Prohibido generar build, `.exe`, `setup.exe` o instalador automaticamente.
- Build solo cuando el usuario lo solicite explicitamente y de forma separada.
- Desarrollo no implica build.
- Consentimiento implicito no es valido.
- Cada exe debe incrementar version automaticamente: `npm version patch --no-git-tag-version`.
- La version debe mostrarse en la UI del juego.
- Siempre que se genere un instalador o ejecutable, debe copiarse/moverse obligatoriamente a: `E:\Proyectos Antigravity\Juegos\Juegos para Windows\Juego Ascensión\Instalador`.

## 8. UX
- Settings estan permitidos.
- Menus estan permitidos si forman parte del juego.
- Multiples apartados y pantallas estan permitidos.
- La interfaz debe conservar sensacion de videojuego de estrategia espacial premium.

Prioridad absoluta:
1. Legibilidad.
2. Densidad de informacion.
3. Consistencia espacial.
4. Jerarquia visual.
5. Sensacion premium de estrategia espacial.

Modos de navegacion (dos caminos excluyentes):
- El modo lo decide el usuario al empezar el desarrollo. El asistente debe ayudar en el modo elegido.
- MODO SIDEBAR: si se desarrolla con columna a la izquierda, usar sidebar izquierda fija con menus, header superior y recursos visibles.
- MODO TARJETAS: si se desarrolla con cuadriculas de tarjetas, NO usar sidebar izquierda. Navegacion por card grids grandes segun el skill `ascension-card-grid-navigation`.
- Prohibido mezclar los dos modos o cambiar de uno a otro sin orden explicita del usuario.
- Si la peticion no dice modo, mantener el modo que ya tenga el desarrollo en curso.

Estructura visual base (comun a ambos modos):
- Header superior fijo.
- Recursos siempre visibles.
- Categorias siempre visibles.
- Grid principal estable.
- Area central sin overflow horizontal.

Estilo visual:
- fondo global negro espacial profundo
- paneles azul muy oscuro
- bordes azul electrico tenue
- hover cian suave
- activos azul brillante
- glows tenues y sombras ligeras

Prohibido sin permiso explicito:
- redisenar la arquitectura visual
- mover sidebar/header de forma estructural
- ocultar recursos principales
- introducir animaciones permanentes, parallax o fondos dinamicos invasivos
- glassmorphism agresivo o blur excesivo

## 9. Audio
- `Musica-menu.ogg` esta permitido como musica de fondo local.
- Web Audio API puede usarse para efectos programaticos.
- Sonidos ligeros, no invasivos y consistentes.
- Inicializar audio en el primer click del usuario cuando el navegador/Electron lo requiera.
- El audio nunca debe romper el juego si falla.

## 10. Auditorias
Cuando se audite el ejecutable, ignorar salvo peticion explicita:
- `landing/`
- `mcps/`
- `firebase-download/`
- zips de distribucion
- documentacion exclusiva de landing

Centrarse en:
- `electron/`
- `src/`
- `package.json`
- assets usados por el juego
- persistencia local
- funcionamiento offline
- seguridad del preload
- estabilidad del ejecutable
- arquitectura modular del juego

## 11. Comunicacion con el Usuario
- El asistente debe hablar en modo cavernicola cuando trabaje dentro de este proyecto.
- Frases cortas, claras y directas.
- El asistente debe indicar cuando algo pertenece al juego y cuando pertenece al landing.
- No tocar builds, instaladores, zips ni landing sin orden explicita.

## 12. Regla de Ejecución Inmediata (Cero Re-análisis)
- Una vez identificada la causa y la solución, actuar directamente sobre los archivos afectados.
- Prohibido releer archivos completos si ya se conoce la línea o bloque exacto.
- Prohibido entrar en ciclos de análisis repetitivos. Identificar -> modificar -> listo.

## 13. Regla Sagrada de Null-Safety y Acceso a Recursos (Zero Undefined Crashes)
- Prohibido acceder directamente a propiedades anidadas de recursos (`planet.resources.metal`, `planetResources.metal`) sin encadenamiento opcional `?.` o fallback defensivo `{ metal: 0, crystal: 0, deuterium: 0 }`.
- Todo componente secundario o pestaña montada en hubs y cuadrículas (`ExchangeAmmTerminalTab`, `MinistryDeskView`, etc.) debe tener defaults seguros en sus props y tolerar estado descontrolado sin crashear.
- Prohibido romper el render con `Cannot read properties of undefined (reading 'metal')`.

## 14. Centinela de Rescate y Anticipación de Errores (Anti-Stuck Sentinel)
- Skill permanente: `ascension-stuck-resolver`.
- Prohibido redeclarar variables en el mismo ámbito o subámbitos de funciones extensas (`has already been declared`).
- Todo recurso 3D/WebGL en Three.js (`PlanetViewer3D`) debe liberar geometrías y materiales (`dispose()`) en el desmontaje.
- Toda persistencia en SQLite (`universe.db`) debe ser transaccional y tolerante a fallos sin corromper el save.
- Ante reporte de error ("stuck"): acceso quirúrgico inmediato -> fix mínimo defensivo -> build test -> listo.



