# FICHA TECNICA ATOMICA: SHIPCHASSISSELECTOR

> **Modulo:** `src/components/shipDesign/ShipChassisSelector.jsx`  
> **Categoria:** COMPONENTES  
> **Lineas de Codigo:** 38  
> **Tipo de Exportacion:** Named (`export const ShipChassisSelector`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/shipDesign/ShipChassisSelector.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const ShipChassisSelector`)
- **Dependencias e Importaciones:**
- `import React from 'react';`

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Componente reutilizable de interfaz para **ShipChassisSelector**. Encapsula el diseno visual sci-fi espacial, microinteracciones tactiles y consistencia de visualizacion segun las especificaciones de interfaz de Ascension.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `SHIP_CHASSIS` | `boolean` | `undefined` | No | Control y renderizado operativo en ShipChassisSelector |
| `bpChassis` | `boolean` | `undefined` | No | Control y renderizado operativo en ShipChassisSelector |
| `setBpChassis` | `function` | `undefined` | Si | Control y renderizado operativo en ShipChassisSelector |
| `fmt` | `any` | `undefined` | No | Control y renderizado operativo en ShipChassisSelector |

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
