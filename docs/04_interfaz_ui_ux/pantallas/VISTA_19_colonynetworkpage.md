# FICHA TECNICA ATOMICA: COLONYNETWORKPAGE

> **Modulo:** `src/pages/ColonyNetworkPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 240  
> **Tipo de Exportacion:** Named (`export const ColonyNetworkPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/ColonyNetworkPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const ColonyNetworkPage`)
- **Dependencias e Importaciones:**
  - `import React, { useState } from 'react';`
  - `import { ColonyMatrixView } from '../components/colonyNetwork/ColonyMatrixView.jsx';`
  - `import { FleetRelocationView } from '../components/colonyNetwork/FleetRelocationView.jsx';`
  - `import { SupplyRoutesView } from '../components/colonyNetwork/SupplyRoutesView.jsx';`
  - `import { ColonyDemandsView } from '../components/colonyNetwork/ColonyDemandsView.jsx';`
  - `import { SectorManagementView } from '../components/sectors/SectorManagementView.jsx';`
  - `import { useNavigation } from '../components/navigation/NavigationContext.jsx';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Centralizar la red logística, redistribución de flotas, igualación de recursos y gobernanza de sectores del imperio estelar. Permite equilibrar materias primas entre colonias con un solo clic, configurar rutas de suministro interplanetarias automatizadas y atender demandas de desarrollo colonial para maximizar la cohesión del imperio.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `object` | `undefined` | Si | Estado global del universo (planetas, flotas, sectores, consejo) |
| `dispatch` | `function` | `undefined` | Si | Despachador de acciones hacia `gameReducer` |
| `currentPlanet` | `object` | `undefined` | Si | Objeto del planeta actualmente enfocado |
| `production` | `object` | `undefined` | No | Tasas de produccion actuales por recurso |
| `fmt` | `function` | `undefined` | No | Utilidad de formateo numerico con separadores de miles |
| `S` | `object` | `undefined` | No | Diccionario de constantes de configuracion y claves |
| `onOpenCodex` | `function` | `undefined` | No | Callback para invocar el modal del códice galactico |
| `setActiveTab` | `function` | `undefined` | No | Conmutador de navegacion principal de la aplicacion |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`
- **Manejo de Estado Local:**
  - `activeSubTab`: Pestana activa (`'overview'`, `'relocate'`, `'routes'`, `'demands'`, `'sectors'`).
  - `fromPlanetId`, `toPlanetId`: Selectores de origen y destino para traslados y cadenas logísticas.
  - `selectedShipsToMove`: Diccionario clave-valor con las naves asignadas a la transferencia.
  - `routeFrom`, `routeRes`, `routeRatio`: Parametros de configuracion para rutas de exportacion continua.
- **Suscripcion a Estado Global:** Consume directamente `state.planets`, `state.sectors` e `state.imperialCouncil.colonyDemands`.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta y Tematica:** Fondos oscuros `bg-slate-950/90`, bordes de contencion cian y esmeralda militar `border-cyan-500/20`, acentos dorados para comercio e igualacion.
- **Efectos y Microinteracciones:** Conmutacion suave de pestanas mediante botones con iluminacion `shadow-[0_0_15px_rgba(6,182,212,0.25)]`, animaciones sutiles en tarjetas de colonias y hover reactivo.
- **Tipografia y Escala:** Jerarquias limpias con `font-mono`, textos en `text-xs` y `text-sm` para alta densidad de informacion colonial.

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas Empleadas:** `<div role="region">`, `<nav>`, `<button>`, `<section>`, `<span>`
- **Contraste y Legibilidad:** Minimo 7:1 en todos los indicadores de recursos y nombres de colonias.
- **Navegabilidad por Teclado:** Pestanas con soporte de tabulacion secuencial, botones de accion con focus-visible ring cian.
- **Atributos ARIA:** `aria-label` descriptivos en botones de igualacion y cambio de colonia.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- `handleSelectPlanet(planetId)`: Despacha `SET_PLANET` para cambiar el foco activo del imperio.
- `handleEqualize()`: Despacha `EQUALIZE_COLONY_RESOURCES` para promediar metal, cristal y deuterio.
- `handleExecuteRelocation()`: Despacha `RELOCATE_COLONY_FLEET` moviendo escuadras de forma instantanea entre puertos amigos.
- `handleCreateSupplyRoute()`: Despacha `ADD_SUPPLY_ROUTE` en el planificador de convoyes comerciales.
- `handleFulfillDemand(demandId)`: Despacha `FULFILL_COLONY_DEMAND` entregando materias a cambio de lealtad y bonos.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Validacion de Unico Planeta:** Si el imperio solo posee el planeta natal, el boton de igualacion se inhabilita visual y funcionalmente.
- **Proteccion contra Destino Invalido:** Bloqueo de transferencias si el origen coincide con el destino o la cuenta de naves es cero.
- **Fallback de Datos:** Valores por defecto seguros ante arrays no inicializados en partidas migradas desde versiones legacy.
