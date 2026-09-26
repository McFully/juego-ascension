# FICHA TECNICA ATOMICA: GOVERNMENTPAGE

> **Modulo:** `src/pages/GovernmentPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 400  
> **Tipo de Exportacion:** Named (`export const GovernmentPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/GovernmentPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const GovernmentPage`)
- **Dependencias e Importaciones:**
- `import { MINISTRY_PROGRAMS } from '../data/ministriesData.js';`
- `import React, { useState } from 'react';`
- `import { MinisterCandidateModal } from '../components/government/MinisterCandidateModal';`
- `import { MinistryPerformanceMetrics } from '../components/government/MinistryPerformanceMetrics';`
- `import { CANDIDATES_POOL, MINISTRY_DIRECTIVES } from '../data/governmentPoliciesData.js';`
- `import { playVoice, playMinistryMusic, stopMinistryMusic } from '../audio.js';`
- `import { ImperialCommandHub } from '../components/government/ImperialCommandHub';`
- `import { FederalDistrictView } from '../components/government/FederalDistrictView';`
- `import { MinistryBuildingInterior } from '../components/government/MinistryBuildingInterior';`
- `import { MinistryDeskView } from '../components/government/MinistryDeskView';`
- `import { MinistryBuildingsSection } from '../components/government/MinistryBuildingsSection';`
- `import { MinistryResearchSection } from '../components/government/MinistryResearchSection';`
- `import { GovernmentBreadcrumbs } from '../components/government/GovernmentBreadcrumbs';`
- `import { MINISTRY_METADATA } from '../data/ministryMetadata.js';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar la vista completa de **GovernmentPage** en el cliente de escritorio de Ascension. Proporciona una interfaz de mando espacial inmersiva, integrando datos del reductor global de estado, seleccion de subsistemas y disparo de acciones de flota, economia o gobernanza espacial.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `object` | `undefined` | Si | Control y renderizado operativo en GovernmentPage |
| `dispatch` | `boolean` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `S` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `activeTab` | `string` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `setActiveTab` | `function` | `undefined` | Si | Control y renderizado operativo en GovernmentPage |
| `onOpenCodex` | `function` | `undefined` | Si | Control y renderizado operativo en GovernmentPage |
| `BUILDINGS` | `object` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `RESEARCH` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `ItemCard` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `buildingCost` | `object` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `calcBuildTime` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `meetsReq` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `buildingProdInfo` | `object` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `canAfford` | `boolean` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `GAME_SPEED` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `production` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `researchCost` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `calcResearchTime` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |
| `researchEffectInfo` | `any` | `undefined` | No | Control y renderizado operativo en GovernmentPage |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`, `useEffect`
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
