const fs = require('fs');
const path = require('path');

const docFiles = [
  {
    name: '00_MASTER_LONJA.md',
    title: '00 — ÍNDICE MAESTRO Y FUENTE DE VERDAD DE LA LONJA GALÁCTICA',
    desc: 'Índice central, arquitectura general, trazabilidad de requisitos y estado de ejecución global del sistema Lonja Galáctica.'
  },
  {
    name: '01_AUDITORIA_ESTADO_ACTUAL.md',
    title: '01 — AUDITORÍA DEL ESTADO ACTUAL Y CAJÓN DIRECTO',
    desc: 'Auditoría integral de la arquitectura actual, archivos existentes (galacticSpotExchange.js, ExchangePlanetaryCommandHub.jsx, exchangeActions.js), estado de persistencia y dependencias.'
  },
  {
    name: '02_FUNDACION_Y_TIPO_ENTIDAD.md',
    title: '02 — FUNDACIÓN Y TIPO DE ENTIDAD AUTÓNOMA',
    desc: 'Nave colonizadora especializada, conversión a entidad económica autónoma, no-planeta convencional, fundador e irrevocabilidad del 10% protegido.'
  },
  {
    name: '03_MODELO_ACCIONARIADO.md',
    title: '03 — MODELO DE ACCIONARIADO Y CAPITALIZACIÓN',
    desc: 'FOUNDER_PROTECTED vs ORDINARY_SHARES, fórmula matemática de dilución, aportaciones elegibles a Megaproyectos y no generación espuria.'
  },
  {
    name: '04_DAO_GOBERNANZA.md',
    title: '04 — DAO Y GOBERNANZA (DIRECTORIO COMERCIAL)',
    desc: 'Directorio Comercial como centro DAO, votación ponderada por participación (humanos e IA), mayorías (>50%), duración y límites de gobernanza.'
  },
  {
    name: '05_ECONOMIA_TESORERIA_ESTABILIDAD.md',
    title: '05 — ECONOMÍA INTERNA, TESORERÍA Y ESTABILIDAD',
    desc: 'Propiedad de recursos de la Lonja, trazabilidad contable de tesorería, prelación de pagos (prioridad del dinero), dividendos sobre beneficio real y prevención de quiebra (4 estados).'
  },
  {
    name: '06_EXCHANGE_SPOT.md',
    title: '06 — EXCHANGE SPOT Y TERMINAL BURSÁTIL CUÁNTICO',
    desc: 'Mercado spot continuo, matching determinista, liquidación atómica, libro de órdenes, órdenes Limit/Market, backing físico 100% y cero creación mágica.'
  },
  {
    name: '07_MARKET_MAKER.md',
    title: '07 — MARKET MAKER AUTÓNOMO',
    desc: 'Liquidez propia con respaldo real en inventario y créditos, spreads adaptativos según volatilidad/inventario, inventario objetivo y comisiones.'
  },
  {
    name: '08_ALMACENAMIENTO_CUSTODIA.md',
    title: '08 — ALMACENAMIENTO Y CUSTODIA FÍSICA',
    desc: 'Capas de almacenamiento, capacidad por recurso, reserva de espacio para órdenes abiertas, saturación, almacén privado del jugador vs inventario de Lonja.'
  },
  {
    name: '09_LOGISTICA_TRANSPORTE.md',
    title: '09 — LOGÍSTICA, TRANSPORTE Y MOVIMIENTO FÍSICO',
    desc: 'Transporte físico obligatorio de mercancías, costes logísticos por distancia/peso, fletes de la Lonja, estados de custodia en tránsito y flotas comerciales.'
  },
  {
    name: '10_MINISTERIOS_AUTONOMOS.md',
    title: '10 — MINISTERIOS AUTÓNOMOS DE LA LONJA',
    desc: 'Operación no manual de ministerios de la Lonja, toma de decisiones autónoma para optimizar comercio, finanzas y relaciones exteriores.'
  },
  {
    name: '11_DESARROLLO_CONSTRUCCION_MEGAPROYECTOS.md',
    title: '11 — DESARROLLO, CONSTRUCCIÓN Y MEGAPROYECTOS',
    desc: 'Construcción en tiempo real con recursos reales, aceleración financiada, Megaproyectos siempre financiables y financiación mixta para expansión.'
  },
  {
    name: '12_DEFENSA_SEGURIDAD.md',
    title: '12 — DEFENSA Y SEGURIDAD AUTÓNOMA',
    desc: 'Bastión defensivo propio, silos y patrullas neutrales, protección de activos en custodia de terceros y suspensión de mercado durante asedios.'
  },
  {
    name: '13_MEMBRESIAS_TARIFAS_SERVICIOS.md',
    title: '13 — MEMBRESÍAS COMERCIALES, TARIFAS Y SERVICIOS',
    desc: 'Registro comercial de operadores, cuotas fijas/periódicas, tarifas reducidas para miembros, estatus de visitante e ingresos de la Lonja.'
  },
  {
    name: '14_MERCADO_SECUNDARIO_ACCIONES.md',
    title: '14 — MERCADO SECUNDARIO DE ACCIONES ORDINARIAS',
    desc: 'Trading de acciones ordinarias entre jugadores e IA, libro de órdenes bursátil, fijación de precios de mercado e inalienabilidad del 10% del fundador.'
  },
  {
    name: '15_AUTONOMIA_IA.md',
    title: '15 — AUTONOMÍA COMPLETA E INTELIGENCIA ARTIFICIAL',
    desc: 'Operación en background sin jugadores conectados, ticks autónomos, arbitraje entre lonjas por IA y toma de decisiones económicas racionales.'
  },
  {
    name: '16_INTEGRACION_ECONOMIA_EXISTENTE.md',
    title: '16 — INTEGRACIÓN CON LA ECONOMÍA DE ASCENSIÓN',
    desc: 'Interconexión con precios galácticos, Fondo Soberano, rutas comerciales, refinerías y flotas sin bifurcar economías paralelas.'
  },
  {
    name: '17_SEGURIDAD_TRANSACCIONES_PERSISTENCIA.md',
    title: '17 — SEGURIDAD TRANSACCIONAL, SQLite Y PERSISTENCIA',
    desc: 'Transacciones atómicas, validación estricta de saldos (cero saldos negativos), persistencia SQLite (universe.db v4) e integridad referencial.'
  },
  {
    name: '18_TESTS_VALIDACION.md',
    title: '18 — SUITE DE PRUEBAS Y VALIDACIÓN CONTINUA',
    desc: 'Tests unitarios e integrados (vitest): matching, dilución, custodia, defensa, gobernanza DAO, estrés de órdenes y cero fallos null-pointer.'
  },
  {
    name: '19_AUDITORIA_FINAL.md',
    title: '19 — AUDITORÍA FINAL, CERTIFICACIÓN Y CIERRE',
    desc: 'Informe forense final de completitud de los 143 requisitos, verificación de doble click, botones, experiencia de usuario y cero regresiones.'
  }
];

const targetDir = path.join(__dirname, '..', 'docs', 'lonja');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

docFiles.forEach((doc, idx) => {
  const filePath = path.join(targetDir, doc.name);
  const prevDoc = idx > 1 ? docFiles[idx - 1].name : null;
  const fileContent = `# ${doc.title}

> **Fuente Maestro:** \`TRANSFORMACIÓN E IMPLEMENTACIÓN INTEGRAL DE LA LONJA GALÁCTICA.md\`
> **Área:** Lonja Galáctica — Sub-sistema ${idx}

---

## 1. PROPÓSITO Y ALCANCE
${doc.desc}

---

## 2. ESTADO DE LA FASE
\`\`\`text
ESTADO: ${idx === 0 || idx === 1 ? 'COMPLETADO' : 'PENDIENTE'}
\`\`\`

---

## 3. DEPENDENCIAS
- Requisitos maestros del documento raíz \`TRANSFORMACIÓN E IMPLEMENTACIÓN INTEGRAL DE LA LONJA GALÁCTICA.md\`.
${prevDoc ? `- Requiere validación previa de fase ${idx - 1} (${prevDoc}).` : '- Fase fundacional.'}

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
- \`src/utils/galacticSpotExchange.js\`
- \`src/reducers/economy/exchangeActions.js\`
- \`src/reducers/tick/exchangeOrdersTick.js\`
- \`src/components/government/ExchangePlanetaryCommandHub.jsx\`
- \`src/components/government/hub/exchangeCommandCardsConfig.jsx\`
- \`src/components/government/hub/ExchangeDaoSubview.jsx\`

---

## 7. PRUEBAS Y VALIDACIÓN
- Ejecución de \`npm test\` sin errores ni regresiones.
`;
  fs.writeFileSync(filePath, fileContent, 'utf8');
});

console.log('Documentos generados correctamente en docs/lonja/');
