# FICHA TECNICA ATOMICA: DIPLOMACYPAGE

> **Modulo:** `src/pages/DiplomacyPage.jsx`  
> **Categoria:** PANTALLAS  
> **Lineas de Codigo:** 392  
> **Tipo de Exportacion:** Default (`export default DiplomacyPage`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/pages/DiplomacyPage.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Default (`export default DiplomacyPage`)
- **Dependencias e Importaciones:**
- `import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";`
- `import { calcResourceValueForAI, fmt } from "../core.jsx";`
- `import { MINISTRY_PROGRAMS } from "./GovernmentPage.jsx";`
- `import DiplomacyChat from "../components/diplomacy/DiplomacyChat.jsx";`
- `import GalacticCouncil from "../components/diplomacy/GalacticCouncil.jsx";`
- `import FederationsManager from "../components/diplomacy/FederationsManager.jsx";`
- `import MinistriesManager from "../components/diplomacy/MinistriesManager.jsx";`
- `import CrisesManager from "../components/diplomacy/CrisesManager.jsx";`
- `import TradeAgreementModal from "../components/diplomacy/TradeAgreementModal.jsx";`
- `import BuyAIShipsModal from "../components/diplomacy/BuyAIShipsModal.jsx";`
- `import { playVoice } from "../audio.js";`
- `import { LeaderAvatar, playDiploSound, getDiploCtx } from "../components/diplomacy/LeaderAvatar.jsx";`
- `import { FACTION_DIALOGUES } from "../data/diplomacyDialogues.js";`
- `import { getActionReply } from "../components/diplomacy/diplomaticActionReplies.js";`
- `import { GameCarousel } from "../components/ui/GameCarousel.jsx";`
- `import { ActionCardTile } from "../components/ui/ActionCardTile.jsx";`
- `import { DiplomacyChamberSelector } from "../components/diplomacy/DiplomacyChamberSelector.jsx";`
- `import { useNavigation } from "../components/navigation/NavigationContext.jsx";`
- `import { SafeImg } from "../assets.jsx";`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Orquestar la vista completa de **DiplomacyPage** en el cliente de escritorio de Ascension. Proporciona una interfaz de mando espacial inmersiva, integrando datos del reductor global de estado, seleccion de subsistemas y disparo de acciones de flota, economia o gobernanza espacial.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `state` | `object` | `undefined` | Si | Control y renderizado operativo en DiplomacyPage |
| `dispatch` | `boolean` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |
| `SHIPS` | `any` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |
| `FACTIONS` | `function` | `undefined` | Si | Control y renderizado operativo en DiplomacyPage |
| `AI_STRATEGIES` | `any` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |
| `S` | `any` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |
| `fmt` | `any` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |
| `getGalacticAlignment` | `any` | `undefined` | No | Control y renderizado operativo en DiplomacyPage |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`
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
