# FICHA TECNICA ATOMICA: PLANET3DCARD

> **Modulo:** `src/components/overview/grid/Planet3DCard.jsx`  
> **Categoria:** COMPONENTES  
> **Lineas de Codigo:** 285  
> **Tipo de Exportacion:** Named (`export const Planet3DCard`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/overview/grid/Planet3DCard.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const Planet3DCard`)
- **Dependencias e Importaciones:**
  - `import React, { useState } from 'react';`
  - `import PlanetViewer3D from '../../3d/PlanetViewer3D.jsx';`
  - `import { BIOMES } from '../../../data/galaxyData.js';`
  - `import { calcProduction } from '../../../utils/formulas/productionFormulas.js';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Presentar una tarjeta inmersiva tridimensional para cada planeta del imperio en la cuadrícula de visión general. Incluye renderizado WebGL procedural del bioma, control rápido de gobernador colonial, conmutación de foco planetario, modal de renombrado y acceso directo al modal de auditoría y gestión integral.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `planet` | `object` | `undefined` | Si | Entidad planetaria con recursos, bioma, colas y defensas |
| `isSelected` | `boolean` | `false` | No | Flag de foco planetario activo |
| `onSelect` | `function` | `undefined` | Si | Callback al pulsar la tarjeta para cambiar de planeta |
| `onOpenDetail` | `function` | `undefined` | No | Callback para desplegar el modal de detalle completo |
| `dispatch` | `function` | `undefined` | No | Despachador de acciones (gobernador, renombrado) |
| `state` | `object` | `undefined` | No | Estado global de tecnologías y bonificaciones |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`
- **Manejo de Estado Local:**
  - `isHovered`: Activa efectos de iluminación y rotación acelerada.
  - `isRenaming`: Modal ligero para modificar el nombre del mundo.
  - `newName`: Cadena de texto temporal durante la edición de nombre.
- **Producción Local Dinámica:** Calcula en tiempo de render las tasas de producción netas de metal, cristal y deuterio aplicando los edificios y bioma del planeta.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta y Tematica:** Panel `bg-slate-900/90` con marco perimetral `border-cyan-500/20` o `border-cyan-400` en estado activo.
- **Efectos:** Brillo espacial `shadow-[0_0_20px_rgba(6,182,212,0.15)]` e iluminación 3D centrada.
- **Tipografia:** Cifras en `font-mono text-xs` con códigos de color canónicos para recursos.

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas:** `<article role="button">`, `<header>`, `<main>`, `<footer>`
- **Atributos ARIA:** `aria-selected` según el foco del planeta, `aria-label` en controles de edición y detalle.
- **Navegabilidad:** Accesible por teclado con activación mediante `Enter` o `Espacio`.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- `onSelect()`: Cambia el foco activo del imperio.
- `toggleGovernor()`: Despacha `TOGGLE_COLONY_GOVERNOR` alternando la automatización ministerial del planeta.
- `handleRenameSubmit()`: Despacha `RENAME_PLANET` validando que el nombre no esté en blanco.
- `onOpenDetail()`: Abre la consola táctica integral del planeta.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Fallback de Bioma:** Asigna `'temperate'` por defecto si el planeta no especifica bioma.
- **Manejo de WebGL Context:** Al desmontar la tarjeta, `PlanetViewer3D` libera de inmediato geometrías y texturas evitando colapsos de memoria en cuadrículas con decenas de mundos.
