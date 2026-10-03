# FICHA TECNICA ATOMICA: GOVERNMENTPAGE

> **Modulo:** `src/pages/GovernmentPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 504  
> **Tipo de Exportacion:** Named (`export const GovernmentPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/GovernmentPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const GovernmentPage`)
- **Dependencias e Importaciones Principales:**
- `import { MINISTRY_PROGRAMS } from '../data/ministriesData.js';`
- `import React, { useState } from 'react';`
- `import { fmt } from '../core.jsx';`
- `import { MinisterCandidateModal } from '../components/government/MinisterCandidateModal';`
- `import { MinistryPerformanceMetrics } from '../components/government/MinistryPerformanceMetrics';`
- `import { CANDIDATES_POOL, MINISTRY_DIRECTIVES } from '../data/governmentPoliciesData.js';`
- `import { playVoice, playMinistryMusic, stopMinistryMusic } from '../audio.js';`
- `import { PlanetaryCommandHub } from '../components/government/PlanetaryCommandHub';`
- `import { ExchangePlanetaryCommandHub } from '../components/government/ExchangePlanetaryCommandHub';`
- `import { ExchangeCommandHubView } from '../components/market/ExchangeCommandHubView';`
- `import { FederalDistrictView } from '../components/government/FederalDistrictView';`
- `import { MinistryBuildingInterior } from '../components/government/MinistryBuildingInterior';`
- `import { MinistryDeskView } from '../components/government/MinistryDeskView';`
- `import { MinistryBuildingsSection } from '../components/government/MinistryBuildingsSection';`
- `import { MinistryResearchSection } from '../components/government/MinistryResearchSection';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar y renderizar de forma reactiva y determinista la unidad **GovernmentPage** en el cliente de escritorio nativo de Ascensión. Asegura la inmersión de estrategia espacial, persistencia local y consistencia según los cánones visuales del juego.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `dispatch` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `S` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `activeTab` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `setActiveTab` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `onOpenCodex` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `BUILDINGS` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `RESEARCH` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `ItemCard` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `buildingCost` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `calcBuildTime` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `meetsReq` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `buildingProdInfo` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `canAfford` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `GAME_SPEED` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `production` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `researchCost` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `calcResearchTime` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |
| `researchEffectInfo` | `any` | `undefined` | Si | Parámetro operativo de control en GovernmentPage |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`, `useEffect`, `useRef`
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
