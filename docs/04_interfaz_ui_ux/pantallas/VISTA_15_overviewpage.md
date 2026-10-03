# FICHA TECNICA ATOMICA: OVERVIEWPAGE

> **Modulo:** `src/pages/OverviewPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 539  
> **Tipo de Exportacion:** Default (`export default OverviewPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/OverviewPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Default (`export default OverviewPage`)
- **Dependencias e Importaciones Principales:**
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
- `import OverviewHudBar from "../components/overview/OverviewHudBar.jsx";`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar y renderizar de forma reactiva y determinista la unidad **OverviewPage** en el cliente de escritorio nativo de Ascensión. Asegura la inmersión de estrategia espacial, persistencia local y consistencia según los cánones visuales del juego.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `dispatch` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `currentPlanet` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `production` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `storage` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `MISSIONS` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `BUILDINGS` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `RESEARCH` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `SHIPS` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `DEFENSES` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `S` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `QueueDisplay` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `ProgressBar` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `fmt` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `fmtTime` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `isOutdated` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `onOpenCodex` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `safeSetActiveTab` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `onOpenSettings` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `onReturnToMenu` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |
| `onLogout` | `any` | `undefined` | Si | Parámetro operativo de control en OverviewPage |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`, `useEffect`, `useMemo`
- **Manejo de Estado Local:** Gestiona estados interactivos locales, transiciones y reactividad visual.
- **Suscripción a Estado Global:** Conecta con el reductor maestro de estado o contexto de navegación según corresponda.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta y Tematica:** Estilo espacial profundo con fondo `#030712` / `slate-950`, paneles `slate-900/80` con bordes azul cian tenue `cyan-500/30`, acentos en amarillo dorado para economía y rojo para combate táctico.
- **Efectos y Microinteracciones:** Transiciones `transition-all duration-200`, hovers reactivos (`hover:border-cyan-400`, `hover:scale-[1.01]`), sombras espaciales tenues (`shadow-lg`, `shadow-cyan-950/50`).
- **Tipografia y Escala:** Fuentes monoespaciadas militares de alta legibilidad (`font-mono`, `text-xs`, `text-sm`, `tracking-wider`).

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas Empleadas:** `<section>`, `<div>`, `<header>`, `<button>`, `<span>`
- **Contraste y Legibilidad:** Relación de contraste mínima de 7:1 garantizada sobre fondos oscuros espaciales.
- **Navegabilidad por Teclado:** Elementos interactivos nativos (`button`, enlaces) accesibles mediante teclado con feedback visual.
- **Atributos ARIA:** `aria-label`, `role` e indicadores semánticos para lectura asistida.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- **Manejadores de Eventos:** Disparos de selección, cambios de pestaña, órdenes tácticas o modales.
- **Efectos de Sonido Integrados:** Conexión con `window.playSfx` para retroalimentación sonora en clicks e interacciones.
- **Despacho de Acciones:** Emite payloads hacia `dispatch` para mutar el estado global de forma inmutable.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Resiliencia ante Datos Nulos:** Protegido contra datos indefinidos mediante encadenamiento opcional (`?.`) y valores de respaldo seguros.
- **Límites de Renderizado (Error Boundary):** Los errores aislados en este módulo son capturados por el boundary de aplicación sin congelar el bucle principal de juego.
