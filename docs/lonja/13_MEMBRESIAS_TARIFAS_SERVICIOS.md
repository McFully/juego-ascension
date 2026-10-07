# 13 — MEMBRESÍAS COMERCIALES, TARIFAS Y SERVICIOS

> **Fuente Maestro:** `TRANSFORMACIÓN E IMPLEMENTACIÓN INTEGRAL DE LA LONJA GALÁCTICA.md`
> **Área:** Lonja Galáctica — Sub-sistema 13

---

## 1. PROPÓSITO Y ALCANCE
Registro comercial de operadores, cuotas fijas/periódicas, tarifas reducidas para miembros, estatus de visitante e ingresos de la Lonja.

---

## 2. ESTADO DE LA FASE
```text
ESTADO: COMPLETADO
```

---

## 3. DEPENDENCIAS
- Requisitos maestros del documento raíz `TRANSFORMACIÓN E IMPLEMENTACIÓN INTEGRAL DE LA LONJA GALÁCTICA.md`.
- Requiere validación previa de fase 12 (12_DEFENSA_SEGURIDAD.md).

---

## 4. REQUISITOS CLAVE
1. Implementación funcional 100% real (no cosmética ni simulada).
2. Sin generación mágica de recursos ni créditos (100% backing físico).
3. Respeto absoluto al Principio del Cajón Directo y Null-Safety.

---

## 5. CRITERIOS DE ACEPTACIÓN
- Verificación mediante tests automatizados en Vitest.
- Integración en persistencia SQLite v4.
- Compatibilidad absoluta con el ejecutable local offline de Windows.

---

## 6. ARCHIVOS AFECTADOS
- `src/utils/galacticSpotExchange.js`
- `src/reducers/economy/exchangeActions.js`
- `src/reducers/tick/exchangeOrdersTick.js`
- `src/components/government/ExchangePlanetaryCommandHub.jsx`
- `src/components/government/hub/exchangeCommandCardsConfig.jsx`
- `src/components/government/hub/ExchangeDaoSubview.jsx`

---

## 7. PRUEBAS Y VALIDACIÓN
- Ejecución de `npm test` sin errores ni regresiones.
