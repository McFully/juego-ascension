# FICHA TECNICA ATOMICA: MINISTRYBUILDINGSSECTION

> **Modulo:** `src/components/government/MinistryBuildingsSection.jsx`  
> **Categoria:** COMPONENTES  
> **Lineas de Codigo:** 173  
> **Tipo de Exportacion:** Named (`export const MinistryBuildingsSection`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/government/MinistryBuildingsSection.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const MinistryBuildingsSection`)
- **Dependencias e Importaciones Principales:**
- `import React, { useState } from 'react';`
- `import { BuildingInteriorModal } from '../buildings/BuildingInteriorModal.jsx';`
- `import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';`
- `import { ActionCardTile } from '../ui/ActionCardTile.jsx';`
- `import { calcRequiredPopulation, calcEffectiveBuildTime } from '../../core.jsx';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar y renderizar de forma reactiva y determinista la unidad **MinistryBuildingsSection** en el cliente de escritorio nativo de Ascensión. Asegura la inmersión de estrategia espacial, persistencia local y consistencia según los cánones visuales del juego.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `ministryId` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `state` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `dispatch` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `currentPlanet` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `BUILDINGS` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `RESEARCH` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `ItemCard` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `buildingCost` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `calcBuildTime` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `meetsReq` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `buildingProdInfo` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `canAfford` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `GAME_SPEED` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `onOpenCodex` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |
| `onBack` | `any` | `undefined` | Si | Parámetro operativo de control en MinistryBuildingsSection |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`
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
