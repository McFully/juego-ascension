# FICHA TECNICA ATOMICA: OVERVIEWPAGE

> **Modulo:** `src/pages/OverviewPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 324  
> **Tipo de Exportacion:** Default (`export default OverviewPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/OverviewPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Default (`export default OverviewPage`)
- **Dependencias e Importaciones:**
- `import React, { useState } from "react";`
- `import { ProductionSummaryCard } from "../components/overview/ProductionSummaryCard.jsx";`
- `import { ActiveFleetsOverview } from "../components/overview/ActiveFleetsOverview.jsx";`
- `import { PlanetViewer3D } from "../components/3d/PlanetViewer3D.jsx";`
- `import { LivingPlanetPanel } from "../components/planet/LivingPlanetPanel.jsx";`
- `import { PlanetarySpecializationCard } from "../components/overview/PlanetarySpecializationCard.jsx";`
- `import { ConstructionQueuesPanel } from "../components/overview/ConstructionQueuesPanel.jsx";`
- `import { GameCarousel } from "../components/ui/GameCarousel.jsx";`
- `import { ActionCardTile } from "../components/ui/ActionCardTile.jsx";`
- `import { useNavigation } from "../components/navigation/NavigationContext.jsx";`
- `import { SafeImg } from "../assets.jsx";`
- `import { ResourceBadge } from "../components/ui/ResourceBar.jsx";`
- `import { ResourceBreakdownTooltip } from "../components/ui/ResourceBreakdownTooltip.jsx";`
- `import { ImperialTelemetryTicker } from "../components/navigation/ImperialTelemetryTicker.jsx";`
- `import { OverviewPlanetGrid } from "../components/overview/OverviewPlanetGrid.jsx";`
- `import { ActiveOperationsSection } from "../components/overview/ActiveOperationsSection.jsx";`
- `import { calcProduction } from "../utils/formulas/productionFormulas.js";`
- `import { useActiveImperialQueues } from "../hooks/useActiveImperialQueues.js";`
- `import { EmperorDelegationModal } from "../components/government/GovernorDelegationModal.jsx";`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar la vista completa de **OverviewPage** en el cliente de escritorio de Ascension. Proporciona una interfaz de mando espacial inmersiva, integrando datos del reductor global de estado, seleccion de subsistemas y disparo de acciones de flota, economia o gobernanza espacial.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `object` | `undefined` | Si | Control y renderizado operativo en OverviewPage |
| `dispatch` | `boolean` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `currentPlanet` | `object` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `production` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `storage` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `MISSIONS` | `function` | `undefined` | Si | Control y renderizado operativo en OverviewPage |
| `BUILDINGS` | `object` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `RESEARCH` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `SHIPS` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `DEFENSES` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `S` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `QueueDisplay` | `boolean` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `ProgressBar` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `fmt` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `fmtTime` | `any` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `isOutdated` | `boolean` | `undefined` | No | Control y renderizado operativo en OverviewPage |
| `onOpenCodex` | `function` | `undefined` | Si | Control y renderizado operativo en OverviewPage |
| `safeSetActiveTab` | `function` | `undefined` | Si | Control y renderizado operativo en OverviewPage |
| `onOpenSettings` | `function` | `undefined` | Si | Control y renderizado operativo en OverviewPage |
| `onReturnToMenu` | `function` | `undefined` | Si | Control y renderizado operativo en OverviewPage |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`
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
