# FICHA TECNICA ATOMICA: GALACTICMARKETPAGE

> **Modulo:** `src/pages/GalacticMarketPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 416  
> **Tipo de Exportacion:** Named (`export const GalacticMarketPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/GalacticMarketPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const GalacticMarketPage`)
- **Dependencias e Importaciones:**
  - `import React, { useState, useMemo } from 'react';`
  - `import { useNavigation } from '../components/navigation/NavigationContext.jsx';`
  - `import { MarketPriceChart } from '../components/market/MarketPriceChart.jsx';`
  - `import { UsedShipBazaarView } from '../components/market/UsedShipBazaarView.jsx';`
  - `import { BlackMarketView } from '../components/market/BlackMarketView.jsx';`
  - `import { AutomatedTradeRulesView } from '../components/market/AutomatedTradeRulesView.jsx';`
  - `import { CORPORATE_CONTRACTS, MARKET_BASE_VALUES } from '../data/galacticMarketData.js';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Gestionar el intercambio financiero interestelar, compraventa de materias primas con tasas de cambio dinamicas y aranceles regulados, contratos corporativos por recompensas de créditos o planos, adquisicion de naves usadas en subasta, operaciones ilicitas en el mercado negro y reglas de automatizacion comercial.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `object` | `undefined` | Si | Estado central de juego (almacenes, creditos, mercado, contratos) |
| `dispatch` | `function` | `undefined` | Si | Despachador de acciones hacia `gameReducer` |
| `currentPlanet` | `object` | `undefined` | Si | Planeta activo que provee o recibe los recursos transferidos |
| `production` | `object` | `undefined` | No | Tasas de produccion actuales del planeta activo |
| `fmt` | `function` | `undefined` | No | Utilidad de formateo numerico militar |
| `S` | `object` | `undefined` | No | Constantes de sistema y glosario de términos |
| `onOpenCodex` | `function` | `undefined` | No | Disparador del modal del códice enciclopédico |
| `setActiveTab` | `function` | `undefined` | No | Conmutador de navegacion principal de la aplicacion |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`, `useMemo`
- **Manejo de Estado Local:**
  - `activeSubTab`: Pestana de mercado (`'exchange'`, `'used_ships'`, `'contracts'`, `'black_market'`, `'automated_rules'`).
  - `sellRes`, `buyRes`: Par de divisas/recursos seleccionados para el intercambio.
  - `sellAmount`: Cantidad bruta que el jugador entrega en la transaccion.
- **Calculo Memorizado (`tradeCalculation`):** Determina en tiempo real el valor unitario relativo, aplica la tasa arancelaria del 8%, calcula la comision y entrega el rendimiento neto exacto sin recalculos superfluos.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI (PIXEL-PERFECT)
- **Paleta y Tematica:** Ambiente bursatil espacial oscuro `slate-950`, acentos en amarillo ambar `amber-400` para finanzas, verde esmeralda `emerald-400` para ganancias netas y purpura `violet-500` para transacciones encubiertas en el mercado negro.
- **Efectos y Microinteracciones:** Graficas de fluctuacion con gradientes lineales tenues, botones de intercambio con pulso de hover y tarjetas de contrato con sellos corporativos interactivos.
- **Tipografia y Escala:** Cifras en `font-mono tracking-tight`, indicadores de cotizacion con flechas direccionales y etiquetas de volumen.

---

## 6. ESTRUCTURA DOM Y ACCESIBILIDAD (WCAG 2.2 AAA)
- **Etiquetas Semanticas Empleadas:** `<section>`, `<header>`, `<article>`, `<button>`, `<input type="number">`
- **Contraste y Legibilidad:** Minimo 7:1 en todas las cifras bursatiles y etiquetas de precio.
- **Navegabilidad por Teclado:** Inputs numericos operables con flechas arriba/abajo y atajos rapidos del 25%, 50%, 75% o Maximo.
- **Atributos ARIA:** `aria-live="polite"` en el calculador de rendimientos y roles semanticos para las tablas de cotizacion.

---

## 7. MAPEO DE EVENTOS E INTERACCIONES TACTICAS
- `handleExecuteTrade()`: Despacha `MARKET_TRADE` intercambiando existencias planetarias segun la cotizacion vigente.
- `handleFulfillContract(c)`: Despacha `FULFILL_MARKET_CONTRACT` descontando materiales y desbloqueando recompensas corporativas.
- `handleBuyUsedShip(listingId)`: Despacha `BUY_USED_SHIP` incorporando naves reacondicionadas a la flota planetaria inmediata.
- `handleBlackMarketDeal(dealId)`: Despacha `EXECUTE_BLACK_MARKET_DEAL` asumiendo riesgos de seguridad por beneficios excepcionales.

---

## 8. MANEJO DE ERRORES, FALLBACKS Y CASOS EXTREMOS
- **Bloqueo por Fondos Insuficientes:** Inhabilita el boton de compra/venta y emite audio de advertencia `uiError` si las existencias son menores al volumen solicitado.
- **Proteccion de Mismo Recurso:** Si el recurso de venta coincide con el de compra, la tasa se fija en neutralidad absoluta sin perdida arancelaria.
- **Sanitizacion de Entradas Numericas:** Bloqueo de valores negativos o no numericos (`NaN`) mediante forzado a enteros positivos.
