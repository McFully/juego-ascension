# FICHA TECNICA ATOMICA: BIOSPHERESOCIALTOOLTIP

> **Modulo:** `src/components/ui/BiosphereSocialTooltip.jsx`  
> **Categoria:** COMPONENTES  
> **Tipo de Exportacion:** Named (`export const BiosphereSocialTooltip`)

---

## 1. FICHA TECNICA DEL ELEMENTO
- **Ruta Exacta en Repositorio:** `src/components/ui/BiosphereSocialTooltip.jsx`
- **Tipo de Modulo:** Componente Reactivo (JSX)
- **Contrato de Exportacion:** Named (`export const BiosphereSocialTooltip`)
- **Dependencias e Importaciones Principales:**
  - `import React from 'react';`
  - Métricas e integración desde el estado planetario (respirabilidad, agua, polución, red térmica, moral).

---

## 2. PROPOSITO DE NEGOCIO Y DOMINIO
Renderizar tooltips tácticos especializados para los vectores vitales coloniales (aire, reserva de agua, polución ecológica, red térmica y moral social) montados en la barra de recursos tácticos superior (`TacticalResourceRow`), ofreciendo desgloses detallados y contextuales de la habitabilidad del planeta seleccionado.

---

## 3. PROPS Y CONTRATO DE ENTRADA
| Prop | Tipo Inferido | Default | Requerido | Proposito Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `metricType` | `string` | `'air'` | Sí | Identificador del vector vital ('air', 'water', 'pollution', 'thermal', 'society') |
| `currentPlanet` | `object` | `{}` | Sí | Objeto del planeta activo inspeccionado |
| `state` | `object` | `{}` | Sí | Estado global de la partida para contextualización demográfica |
| `fmt` | `function` | `defaultFmt` | No | Función de formateo numérico militar y porcentual |

---

## 4. ESTADO INTERNO, HOOKS Y CONSUMO GLOBAL
- **Hooks React Utilizados:** Componente funcional puro (`React.memo`).
- **Manejo de Estado Local:** No requiere mutación local; lee directamente las métricas calculadas pasadas como props o proyectadas del planeta.
- **Suscripción a Estado Global:** Recibe el estado por props desde la cabecera táctica.

---

## 5. ESTILOS VISUALES Y DISENO SCI-FI
- **Paleta y Tematica:** Paneles oscuros `slate-950/95` con bordes de color temático según el vector (cielo para aire, cian para agua, rosa/esmeralda para polución, ámbar para temperatura, teal para moral).
- **Tipografia:** Tipografía monoespaciada con cifras tabulares de alta fidelidad.

---

## 6. RESILIENCIA Y MANEJO DE ERRORES
- **Protección Null-Safety:** Encadenamiento opcional `?.` en métricas y planetas para evitar excepciones de propiedades no definidas si los datos planetarios están en transición.
