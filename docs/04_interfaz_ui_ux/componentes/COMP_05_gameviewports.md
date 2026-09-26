# FICHA TECNICA ATOMICA: GAMEVIEWPORTS

> **Modulo:** `src/components/app/GameViewports.jsx`  
> **Categoria:** COMPONENTES  
> **Lineas de Codigo:** 128  
> **Tipo de Exportacion:** Named (`export const GameViewports`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/app/GameViewports.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const GameViewports`)
- **Dependencias e Importaciones:**
- `import React, { Suspense, lazy } from "react";`
- `import MissionsPage from "../../pages/MissionsPage";`
- `import OverviewPage from "../../pages/OverviewPage";`
- `import BuildingsPage from "../../pages/BuildingsPage";`
- `import ResearchPage from "../../pages/ResearchPage";`
- `import ShipyardPage from "../../pages/ShipyardPage";`
- `import DefensePage from "../../pages/DefensePage";`
- `import { GovernmentPage } from "../../pages/GovernmentPage.jsx";`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Componente reutilizable de interfaz para **GameViewports**. Encapsula el diseno visual sci-fi espacial, microinteracciones tactiles y consistencia de visualizacion segun las especificaciones de interfaz de Ascension.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `activeTab` | `string` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `state` | `object` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `dispatch` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `currentPlanet` | `object` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `production` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `storage` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `MISSIONS` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `BUILDINGS` | `object` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `RESEARCH` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SHIPS` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `DEFENSES` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SHIP_CHASSIS` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SHIP_WEAPONS` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `SHIP_ENGINES` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SHIP_SHIELDS` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SHIP_MODULES` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `MISSILES` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `MOON_BUILDINGS` | `object` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `FACTIONS` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `AI_STRATEGIES` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `S` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `QueueDisplay` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `ProgressBar` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `fmt` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `fmtTime` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `isOutdated` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `onOpenCodex` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `safeSetActiveTab` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `ItemCardWithCodex` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `buildingCost` | `object` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcBuildTime` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `meetsReq` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `buildingProdInfo` | `object` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `canAfford` | `boolean` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `GAME_SPEED` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `researchCost` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcResearchTime` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `researchEffectInfo` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `SafeImg` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `CardBanner` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `shipTimeBonus` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `shipCost` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcShipTime` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `getShipStats` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `constructionDiscount` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `defenseCost` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcDefenseTime` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `getDefenseStats` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `getEffectiveTech` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `selectedTarget` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `setSelectedTarget` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `simulateCombat` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcCustomShipStats` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `ACHIEVEMENTS` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcCustomShipCost` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `calcCustomShipTime` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `getGalacticAlignment` | `any` | `undefined` | No | Control y renderizado operativo en GameViewports |
| `onOpenSettings` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `onReturnToMenu` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |
| `setAcceptTransmission` | `function` | `undefined` | Si | Control y renderizado operativo en GameViewports |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** Ninguno (Componente de presentacion puro / funcional)
- **Manejo de Estado Local:** Controla estados reactivos de seleccion, visibilidad de menus secundarios y disparadores de animacion local.
- **Suscripcion a Estado Global:** Conecta con el reductor maestro de estado (`state`, `dispatch`) o consume contextos de navegacion.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta y Tematica:** Estilo espacial profundo con fondo `#030712` / `slate-950`, paneles `slate-900/80` con bordes azul cian tenue `cyan-500/30`, acentos en amarillo dorado para economia y rojo de combate tactico.
- **Efectos y Microinteracciones:** Transiciones `transition-all duration-200`, hovers reactivos (`hover:border-cyan-400`, `hover:scale-[1.01]`), sombras tenues (`shadow-lg`, `shadow-cyan-950/50`) y barras de desplazamiento estilizadas.
- **Tipografia y Escala:** Fuentes monoespaciadas y sans-serif militares de alta legibilidad (`font-mono`, `text-xs`, `text-sm`, `tracking-wider`).

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas Empleadas:** `<section>`, `<div>`, `<header>`, `<button>`, `<span>`
- **Contraste y Legibilidad:** Relacion de contraste minima de 7:1 garantizada sobre fondos oscuros espaciales.
- **Navegabilidad por Teclado:** Elementos interactivos nativos (`button`, enlaces) accesibles mediante `Tab` y `Enter` con soporte de atajos globales.
- **Atributos ARIA:** `aria-label`, `role` e indicadores semanticos para lectura asistida.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- **Manejadores de Eventos Detectados:** Disparos de seleccion, cambios de pestana, envio de flotas y reclamos.
- **Efectos de Sonido Integrados:** Conexion con `window.playSfx` para retroalimentacion sonora en clicks tacticos, alarmas o confirmaciones.
- **Despacho de Acciones:** Genera y envia payloads estructurados hacia `gameReducer` para mutar planetas, colas o flotas de forma inmutable.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Resiliencia ante Datos Nulos:** Protegido contra datos indefinidos mediante encadenamiento opcional (`?.`) y valores por defecto seguros.
- **Limites de Renderizado (Error Boundary):** Los errores aislados en este componente son capturados por el boundary de aplicacion sin congelar el bucle principal de juego.
