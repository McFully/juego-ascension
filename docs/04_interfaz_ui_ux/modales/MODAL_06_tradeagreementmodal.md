# FICHA TECNICA ATOMICA: TRADEAGREEMENTMODAL

> **Modulo:** `src/components/diplomacy/TradeAgreementModal.jsx`  
> **Categoria:** MODALES  
> **Lineas de Codigo:** 112  
> **Tipo de Exportacion:** Default (`export default TradeAgreementModal`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/diplomacy/TradeAgreementModal.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Default (`export default TradeAgreementModal`)
- **Dependencias e Importaciones:**
- `import React from 'react';`
- `import { S } from '../../styles.js';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Proporcionar una ventana modal flotante contextual para **TradeAgreementModal**, permitiendo la confirmacion, configuracion tactica o interaccion detallada sin perder la referencia visual de la pantalla activa.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `tradeAIPlanet` | `object` | `undefined` | No | Control y renderizado operativo en TradeAgreementModal |
| `setTradeAIPlanet` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |
| `tradeGive` | `any` | `undefined` | No | Control y renderizado operativo en TradeAgreementModal |
| `setTradeGive` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |
| `tradeTake` | `any` | `undefined` | No | Control y renderizado operativo en TradeAgreementModal |
| `setTradeTake` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |
| `tradeTreaty` | `any` | `undefined` | No | Control y renderizado operativo en TradeAgreementModal |
| `setTradeTreaty` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |
| `viabilityMsg` | `any` | `undefined` | No | Control y renderizado operativo en TradeAgreementModal |
| `handleCheckViability` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |
| `handleTrade` | `function` | `undefined` | Si | Control y renderizado operativo en TradeAgreementModal |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** Ninguno (Componente de presentacion puro / funcional)
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
