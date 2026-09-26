# FICHA TECNICA ATOMICA: PLANETFULLDETAILMODAL

> **Modulo:** `src/components/planet/PlanetFullDetailModal.jsx`  
> **Categoria:** MODALES  
> **Lineas de Codigo:** 580  
> **Tipo de Exportacion:** Named (`export const PlanetFullDetailModal`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/planet/PlanetFullDetailModal.jsx`
- **Tipo de Modulo:** Modal Integral de Pantalla Completa (JSX)
- **Contrato de Exportacion:** Named (`export const PlanetFullDetailModal`)
- **Dependencias e Importaciones:**
  - `import React, { useState } from 'react';`
  - `import PlanetViewer3D from '../3d/PlanetViewer3D.jsx';`
  - `import { BIOMES } from '../../data/galaxyData.js';`
  - `import { BUILDINGS, SHIPS, DEFENSES } from '../../data/gameData.js';`
  - `import { calcProduction } from '../../utils/formulas/productionFormulas.js';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Desplegar una consola táctica planetaria de máxima resolución que permita auditar y gestionar un mundo específico sin abandonar la visión general. Agrupa cinco áreas operativas: Resumen (bioma, recursos, demografía), Infraestructura (niveles de edificios), Guarnición Militar (hangares y flotas atracadas), Escudo Planetario (baterías y defensas) y Órdenes de Construcción.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | `false` | Si | Control de visibilidad del modal |
| `onClose` | `function` | `undefined` | Si | Callback para cerrar el modal táctico |
| `planet` | `object` | `undefined` | Si | Entidad planetaria auditada |
| `state` | `object` | `undefined` | Si | Estado global del imperio para bonificaciones de tecnología |
| `dispatch` | `function` | `undefined` | Si | Despachador de acciones (construcción, reclutamiento) |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`
- **Manejo de Estado Local:**
  - `activeTab`: Pestaña interna (`'overview'`, `'buildings'`, `'military'`, `'defenses'`, `'fleets'`).
  - `selectedBuilding`: Elemento enfocado para inspección de costes o mejoras.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta:** Backdrop oscurecido `bg-slate-950/80 backdrop-blur-md`, panel central `bg-slate-900/95 border border-cyan-500/30`.
- **Efectos:** Brillo perimetral de interfaz cibernética `shadow-[0_0_50px_rgba(6,182,212,0.2)]`.
- **Animaciones:** Entrada suave con opacidad y escala controlada.

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas:** `<dialog role="dialog">`, `<header>`, `<nav>`, `<section>`, `<button>`
- **Atributos ARIA:** `aria-modal="true"`, `aria-labelledby="modal-title"`.
- **Escape Key:** Cierre automático al pulsar la tecla `Escape`.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- `onClose()`: Restablece el foco en la cuadrícula de origen.
- `handleUpgradeBuilding(buildingId)`: Despacha la orden de ampliación de infraestructura.
- `handleRecruitShip(shipId)`: Envía órdenes directas a los astilleros del planeta.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Verificación de Existencia:** Si `planet` es nulo o indefinido mientras `isOpen` es verdadero, el componente retorna `null` de forma segura previniendo excepciones en tiempo de render.
